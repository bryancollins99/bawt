// confirm-contests.mjs — deterministic deadline confirmation for staged discoveries.
//
// For each projected contest, fetch its cited source page and check whether the
// projected deadline LITERALLY appears on it (ISO, "August 1, 2026", "1 Aug 2026",
// numeric, etc.). If yes -> projected:false + verified. If not -> stays projected.
// No LLM: the date must be present on the source, or it isn't trusted.
//
// Run: node scripts/confirm-contests.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const STAGE = join(here, '.contest-discovered.json');
const UA = 'Mozilla/5.0 (compatible; BAWTConfirm/1.0; +https://becomeawritertoday.com)';
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

function datePatterns(iso) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return [];
  const [, y, mo, d] = m; const Y = +y, MO = +mo, D = +d;
  const full = MONTHS[MO - 1], abbr = full.slice(0, 3);
  const dOrd = `${D}(?:st|nd|rd|th)?`;
  const mName = `(?:${full}|${abbr})`;
  return [
    new RegExp(`${Y}-0?${MO}-0?${D}`, 'i'),
    new RegExp(`${mName}\\.?\\s+${dOrd},?\\s+${Y}`, 'i'),   // August 1, 2026
    new RegExp(`${dOrd}\\s+${mName}\\.?,?\\s+${Y}`, 'i'),   // 1 August 2026
    new RegExp(`\\b0?${MO}[/.-]0?${D}[/.-]${Y}\\b`),        // 8/1/2026
    new RegExp(`\\b0?${D}[/.-]0?${MO}[/.-]${Y}\\b`),        // 1/8/2026
  ];
}
async function pageText(url) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
  try { const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t); if (!r.ok) return null;
    return (await r.text()).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  } catch { clearTimeout(t); return null; }
}
const today = new Date().toISOString().slice(0, 10);
const staged = JSON.parse(readFileSync(STAGE, 'utf8'));
let confirmed = 0;
for (const c of staged) {
  if (!c.projected || !c.deadline) continue;
  const text = await pageText(c.url);
  if (!text) { c._confirm = 'source unreachable'; continue; }
  const hit = datePatterns(c.deadline).some(re => re.test(text));
  if (hit) { c.projected = false; c.stale = false; delete c.staleReason; c.lastVerified = today; c._confirm = 'deadline confirmed on source'; confirmed++; }
  else c._confirm = 'deadline not found on source (stays projected)';
}
writeFileSync(STAGE, JSON.stringify(staged, null, 1));
console.error(`=== ${confirmed}/${staged.length} deadlines confirmed on source ===`);
for (const c of staged) console.error(`  ${c.projected ? '⏳ projected' : '✅ confirmed'}  ${c.deadline||'no date'}  ${c.name}  [${c._confirm}]`);
