// ─────────────────────────────────────────────────────────────────────────────
// app.js — shared utilities, Supabase client, session state
// ─────────────────────────────────────────────────────────────────────────────

/* global supabase, CONFIG */

let _supabaseClient = null;

function getSupabase() {
  if (!_supabaseClient) {
    _supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  }
  return _supabaseClient;
}

// ─── Session state (localStorage) ────────────────────────────────────────────

const SESSION_KEY = 'brainstorm_session';

function saveLocal(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function clearLocal() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── URL params ───────────────────────────────────────────────────────────────

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ─── Session code generator ───────────────────────────────────────────────────

const FANTASY_WORDS = [
  'RAVEN','EMBER','FROST','STORM','BLADE','STONE','FLAME','NIGHT',
  'IRON', 'VOID', 'STAR', 'WOLF', 'CROW', 'MOON', 'DAWN', 'DUSK',
  'BONE', 'DUST', 'RUNE', 'SAGE', 'VEIL', 'FANG', 'GRIM', 'OATH',
];

function generateCode() {
  const a = FANTASY_WORDS[Math.floor(Math.random() * FANTASY_WORDS.length)];
  const b = FANTASY_WORDS[Math.floor(Math.random() * FANTASY_WORDS.length)];
  return a === b ? generateCode() : `${a}-${b}`;
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────

async function createSession(name, anonymous) {
  const db = getSupabase();
  const code = generateCode();
  const { data, error } = await db
    .from('sessions')
    .insert({ code, name, anonymous, status: 'open' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function fetchSession(code) {
  const db = getSupabase();
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  if (error) throw error;
  return data;
}

async function fetchResponses(sessionId) {
  const db = getSupabase();
  const { data, error } = await db
    .from('responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('submitted_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function submitResponse(sessionId, slot, heroClass, answers) {
  const db = getSupabase();
  const { error } = await db
    .from('responses')
    .insert({ session_id: sessionId, slot, class: heroClass, answers });
  if (error) throw error;
}

async function updateSessionStatus(sessionId, status) {
  const db = getSupabase();
  const { error } = await db
    .from('sessions')
    .update({ status })
    .eq('id', sessionId);
  if (error) throw error;
}

async function updateSessionResult(sessionId, resultJson) {
  const db = getSupabase();
  const { error } = await db
    .from('sessions')
    .update({ status: 'done', result_json: resultJson })
    .eq('id', sessionId);
  if (error) throw error;
}

// ─── XP popup ─────────────────────────────────────────────────────────────────

function showXP(amount) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.textContent = `+${amount} XP`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ─── Provocation flash ─────────────────────────────────────────────────────────

function showProvocation(bold, fine, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'provocation-overlay';
  overlay.innerHTML = `
    <div class="provocation-bold">${bold}</div>
    ${fine ? `<div class="provocation-fine">${fine}</div>` : ''}
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('leaving');
    overlay.addEventListener('animationend', () => {
      overlay.remove();
      if (callback) callback();
    }, { once: true });
  }, 1800);
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Navigate ─────────────────────────────────────────────────────────────────

function navigate(path, params = {}) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  window.location.href = url.toString();
}
