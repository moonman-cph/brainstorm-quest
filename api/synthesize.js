// Vercel serverless function — POST /api/synthesize
// Reads all responses for a session, calls Claude, stores result.
//
// Required env vars (set in Vercel dashboard):
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_ANON_KEY

const https = require('https');

// ─── Tiny Supabase REST helper (no SDK needed server-side) ───────────────────

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url    = new URL(process.env.SUPABASE_URL + '/rest/v1' + path);
    const data   = body ? JSON.stringify(body) : null;
    const opts   = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method,
      headers: {
        'apikey':         process.env.SUPABASE_ANON_KEY,
        'Authorization':  `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type':   'application/json',
        'Accept':         'application/json',
        'Prefer':         method === 'POST' ? 'return=representation' : 'return=minimal',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Tiny Claude API helper ──────────────────────────────────────────────────

function callClaude(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const opts = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
        'content-length':    Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.content?.[0]?.text || '');
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Build the Oracle prompt ─────────────────────────────────────────────────

const CLASS_LABELS = {
  wizard:  '🧙 The Wizard (Visionary)',
  warrior: '⚔️ The Warrior (Builder)',
  rogue:   '🗡️ The Rogue (Disruptor)',
  bard:    '🎵 The Bard (Storyteller)',
};

const QUESTION_LABELS = {
  moment:     'A specific moment the system failed them',
  contraband: 'Their hidden / surprising skill',
  borrowing:  'Something borrowed from another industry',
  path:       'Preferred solution type',
  conviction: 'Their unpopular conviction',
};

function buildPrompt(session, responses) {
  const partyBlock = responses.map((r, i) => {
    const cls   = CLASS_LABELS[r.class] || r.class;
    const ans   = r.answers || {};
    const lines = Object.entries(QUESTION_LABELS)
      .map(([key, label]) => ans[key] ? `  ${label}: ${ans[key]}` : null)
      .filter(Boolean)
      .join('\n');
    return `Hero ${i + 1} — ${cls}\n${lines}`;
  }).join('\n\n');

  const systemPrompt = `You are the Oracle — a synthesis engine for a collaborative startup ideation tool.

Your job is NOT to take each person's answers and wrap them in a startup name. That is a failure mode called "one idea per hero." You must refuse to do it.

Your actual job: find COLLISIONS. Look for the place where Hero A's forgotten skill intersects with Hero B's industry analogy intersects with Hero C's unpopular conviction. The most interesting ideas live in those collisions, not inside any single person's head.

RULES YOU MUST FOLLOW:
1. Do not generate one idea per hero. If you have 3 heroes, do not produce 3 ideas that each correspond to one hero's framing. Ideas must cross hero boundaries.
2. Every idea must explicitly cite which heroes' specific inputs combined to produce it. Use the exact language from their answers, not paraphrases.
3. The third idea MUST be the most unexpected one — the idea that none of the heroes would have proposed on their own. It should feel like it came from the collision rather than from any individual input.
4. For each idea, produce a "spark" field: one sentence describing exactly which heroes' fragments collided to create it. Format: "Hero A's [specific thing] + Hero B's [specific thing] → [the insight that emerged]."
5. Be concrete. Cite their actual words. Generic startup language is a disqualification.
6. Do not generate generic startup ideas. No "AI-powered platform for X." Earn every noun.

Output ONLY valid JSON. No markdown, no explanation, no code fences.`;

  const userPrompt = `Quest: "${session.name}"
Party size: ${responses.length} heroes
Anonymous: ${session.anonymous}

${partyBlock}

Before you generate ideas, do this internally (do not output it):
- List every fragment (moment, skill, analogy, conviction) across all heroes.
- Find the three most non-obvious pairings across heroes.
- Build ideas from those pairings, not from individual hero profiles.

Return this exact JSON structure (no other text):
{
  "ideas": [
    {
      "name": "short memorable name — not a portmanteau, not 'AI for X'",
      "tagline": "one sentence — written for the person who has lived this problem",
      "dragon_slain": "the specific problem this solves, citing the actual moments heroes described",
      "spark": "Hero A's [exact fragment] + Hero B's [exact fragment] → the collision that made this possible",
      "pros": [
        "strength 1 — cite which hero's input makes this credible",
        "strength 2 — reference a specific skill or analogy from the answers",
        "strength 3"
      ],
      "cons": ["risk 1", "risk 2"],
      "competitors": [
        {"name": "Competitor Name", "difference": "what this does that they don't"}
      ]
    },
    {
      "name": "...",
      "tagline": "...",
      "dragon_slain": "...",
      "spark": "...",
      "pros": ["...", "...", "..."],
      "cons": ["...", "..."],
      "competitors": [{"name": "...", "difference": "..."}]
    },
    {
      "name": "THE WILD ONE — this idea should feel like it came from nowhere but traces back to everything",
      "tagline": "...",
      "dragon_slain": "...",
      "spark": "the full collision chain — cite 3+ inputs from different heroes and the unexpected leap between them",
      "pros": ["...", "...", "..."],
      "cons": ["...", "..."],
      "competitors": [{"name": "...", "difference": "..."}]
    }
  ],
  "alignment": {
    "united_on": ["a theme the whole party circled without naming it directly", "another genuine shared thread"],
    "tension_points": ["where party perspectives would create productive arguments", "another real tension"]
  },
  "chemistry_score": 74
}`;

  return { systemPrompt, userPrompt };
}

// ─── Main handler ────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { sessionCode } = req.body || {};
  if (!sessionCode) { res.status(400).json({ error: 'sessionCode required' }); return; }

  try {
    // 1. Fetch session
    const sessRes = await supabaseRequest(
      'GET',
      `/sessions?code=eq.${encodeURIComponent(sessionCode.toUpperCase())}&select=*&limit=1`,
    );
    const session = Array.isArray(sessRes.body) ? sessRes.body[0] : null;
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    // 2. Fetch responses
    const respRes = await supabaseRequest(
      'GET',
      `/responses?session_id=eq.${session.id}&select=*`,
    );
    const responses = Array.isArray(respRes.body) ? respRes.body : [];
    if (responses.length < 1) { res.status(400).json({ error: 'No responses yet' }); return; }

    // 3. Call Claude
    const { systemPrompt, userPrompt } = buildPrompt(session, responses);
    const raw = await callClaude(systemPrompt, userPrompt);

    // 4. Parse JSON (Claude may sometimes wrap in backticks — strip if so)
    const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
    const result = JSON.parse(clean);

    // 5. Store result in session
    await supabaseRequest(
      'PATCH',
      `/sessions?id=eq.${session.id}`,
      { status: 'done', result_json: result },
    );

    res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('synthesize error:', err);
    res.status(500).json({ error: err.message || 'Oracle error' });
  }
};
