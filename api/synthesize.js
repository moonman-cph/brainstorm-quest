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
  dragon:     'Dragon they fight (problem lived)',
  spell:      'Most powerful spell (unique expertise)',
  who:        'Who they fight for (target customer)',
  path:       'Preferred path (solution type)',
  curse:      'Curse on the land (market gap)',
};

function buildPrompt(session, responses) {
  const partyBlock = responses.map((r, i) => {
    const cls  = CLASS_LABELS[r.class] || r.class;
    const ans  = r.answers || {};
    const lines = Object.entries(QUESTION_LABELS)
      .map(([key, label]) => ans[key] ? `  ${label}: ${ans[key]}` : null)
      .filter(Boolean)
      .join('\n');
    return `Hero ${i + 1} — ${cls}\n${lines}`;
  }).join('\n\n');

  const systemPrompt = `You are the Oracle — an ancient intelligence that synthesizes the collective wisdom of a startup ideation party.
Your task: read the heroes' answers and generate exactly 3 concrete, distinct startup ideas grounded in their actual words.
Be specific and bold. Reference their real inputs. Do not generate generic startup ideas.
Output ONLY valid JSON. No markdown, no explanation, no code fences. Just the JSON object.`;

  const userPrompt = `Quest: "${session.name}"
Party size: ${responses.length} heroes
Anonymous: ${session.anonymous}

${partyBlock}

Return this exact JSON structure (no other text):
{
  "ideas": [
    {
      "name": "short memorable startup name",
      "tagline": "one sentence — for the heroes who are tired of...",
      "dragon_slain": "the specific problem this solves, in one sentence",
      "pros": ["strength 1 drawn from party answers", "strength 2", "strength 3"],
      "cons": ["risk or challenge 1", "risk 2"],
      "competitors": [
        {"name": "Competitor Name", "difference": "how this is different"}
      ]
    }
  ],
  "alignment": {
    "united_on": ["theme the whole party agreed on", "another shared theme"],
    "tension_points": ["where party perspectives diverged", "another tension"]
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
