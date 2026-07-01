// datamuseUtils.js — the app's ONLY network utility.
//
// Fetches theme-related words from the free, keyless Datamuse API
// (https://api.datamuse.com). Two queries run concurrently:
//   - ml=<theme>   "means-like": semantically related words (with md=p → part-of-speech tags)
//   - rel_trg=<theme>  "triggers": words statistically associated with the theme (evocative)
//
// HARD CONTRACT (see PRD-2 / 00-ASSESSMENT):
//   - Never throws. Uses Promise.allSettled so a rejected/timed-out fetch can't bubble.
//   - Returns [] on any total failure / timeout so the caller falls back to the bundled set.
//   - No API key. No console.error (the live verify run asserts 0 console errors).
//   - This util must be imported by ONLY the ThemedWordGenerator component.

const DATAMUSE_BASE = 'https://api.datamuse.com/words';
const TIMEOUT_MS = 6000;
const MAX_ML = 40;
const MAX_TRG = 30;

// Fetch a single Datamuse endpoint with an abort-based timeout.
// Resolves to a parsed array, or throws (caught by allSettled upstream).
async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } finally {
    // Always clear the timer so we never leave a dangling timeout.
    clearTimeout(timer);
  }
}

// Map a Datamuse tags array to a coarse part-of-speech bucket.
function posFromTags(tags) {
  if (!Array.isArray(tags)) return 'other';
  if (tags.includes('adj')) return 'adjective';
  if (tags.includes('n')) return 'noun';
  if (tags.includes('v')) return 'verb';
  return 'other';
}

/**
 * Fetch themed words for a free-text theme.
 * @param {string} theme
 * @returns {Promise<Array<{word: string, pos: string, associated: boolean}>>}
 *          Deduped word objects, or [] on any error/timeout.
 */
export async function fetchThemedWords(theme) {
  const t = (theme || '').trim();
  if (!t) return [];

  const q = encodeURIComponent(t);
  const mlUrl = `${DATAMUSE_BASE}?ml=${q}&md=p&max=${MAX_ML}`;
  const trgUrl = `${DATAMUSE_BASE}?rel_trg=${q}&max=${MAX_TRG}`;

  // allSettled → neither a rejection nor a timeout can throw out of this function.
  const settled = await Promise.allSettled([fetchJson(mlUrl), fetchJson(trgUrl)]);

  const mlRows = settled[0].status === 'fulfilled' ? settled[0].value : [];
  const trgRows = settled[1].status === 'fulfilled' ? settled[1].value : [];

  const seen = new Set();
  const out = [];

  // means-like rows carry POS tags (md=p)
  for (const row of mlRows) {
    const w = (row && row.word || '').trim();
    if (!w || seen.has(w.toLowerCase())) continue;
    seen.add(w.toLowerCase());
    out.push({ word: w, pos: posFromTags(row.tags), associated: false });
  }

  // rel_trg rows are evocative/associated; they rarely carry POS tags.
  for (const row of trgRows) {
    const w = (row && row.word || '').trim();
    if (!w || seen.has(w.toLowerCase())) continue;
    seen.add(w.toLowerCase());
    out.push({ word: w, pos: 'other', associated: true });
  }

  // On total failure both arrays are empty → [] (caller falls back to bundled set).
  return out;
}
