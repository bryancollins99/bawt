// discover-contests.mjs — the DYNAMIC discovery stage feeding contests.json.
//
// Perplexity Sonar (live web + citations) DISCOVERS candidate contests; a deterministic
// fetch-and-verify against each cited official URL is the TRUST GATE. Nothing enters the
// dataset on the model's word alone — only facts confirmed present on the live source page.
// Output: scripts/.contest-discovered.json (staging, for review/merge). No auto-write to
// the canonical contests.json — the merge step ratifies.
//
// Run: node scripts/discover-contests.mjs "poetry"   (genre optional)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const KEY = process.env.PERPLEXITY_API_KEY;
let genre = 'poetry';
function genreSet(g) { genre = g; }
const UA = 'Mozilla/5.0 (compatible; BAWTDiscover/1.0; +https://becomeawritertoday.com)';

const existing = JSON.parse(readFileSync(join(repo, 'src', 'data', 'contests.json'), 'utf8'));
const known = new Set(existing.flatMap(e => [normName(e.name), host(e.url)]).filter(Boolean));
function normName(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40); }
function host(u){ try { return new URL(u).host.replace(/^www\./,''); } catch { return ''; } }

const SCHEMA = { type: 'object', properties: { contests: { type: 'array', items: { type: 'object',
  properties: { name:{type:'string'}, official_url:{type:'string'}, deadline:{type:'string'},
    entry_fee:{type:'string'}, prize:{type:'string'}, eligibility:{type:'string'}, genres:{type:'array',items:{type:'string'}} },
  required: ['name','official_url'] } } }, required: ['contests'] };

async function discover() {
  if (!KEY) { console.error('PERPLEXITY_API_KEY not set — dry run, no discovery'); return []; }
  const prompt = `Find currently-open ${genre} writing contests, awards or grants with a submission deadline in the next 8 months. Extract each into the schema with its official contest page URL, deadline (YYYY-MM-DD), entry fee, prize, eligibility and genres. Include as many real, verifiable ones as you can.`;
  const r = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_schema', json_schema: { schema: SCHEMA } } }),
  }).then(r => r.json());
  let cands = [];
  try { cands = JSON.parse(r?.choices?.[0]?.message?.content || '{}').contests || []; }
  catch { console.error('parse fail'); }
  console.error(`Perplexity returned ${cands.length} candidates, ${(r?.citations||[]).length} citations`);
  return cands;
}

// Map a discovered candidate to the contests.json contract. Perplexity-sourced deadlines/fees
// are UNVERIFIED -> projected:true + stale reason, until confirmed on the official source.
function toRecord(c) {
  const iso = (String(c.deadline||'').match(/\d{4}-\d{2}-\d{2}/) || [null])[0];
  const free = /free|no fee|\$0|£0/i.test(c.entry_fee || '');
  return { name: c.name, type: 'contest', genres: c.genres?.length ? c.genres : [genre],
    fee: c.entry_fee || 'To confirm', freeEntry: free, deadline: iso, projected: true,
    prize: c.prize || 'To confirm', eligibility: c.eligibility || 'See contest page',
    url: c.official_url, source: host(c.official_url),
    hasCashPrize: /\$|£|€|\bcash\b|\bprize\b/i.test(c.prize || ''),
    region: 'worldwide', audience: ['adult'],
    stale: true, staleReason: 'discovered via Perplexity; deadline/fee unconfirmed on official source' };
}

// TRUST GATE: fetch the cited official URL and confirm the contest name actually appears.
async function verify(c) {
  if (!c.official_url) return { ...c, _verified: false, _reason: 'no url' };
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(c.official_url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ...c, _verified: false, _reason: `HTTP ${res.status}` };
    const html = (await res.text()).toLowerCase().replace(/<[^>]+>/g, ' ');
    // require a strong name token from the contest name to appear on the page
    const tokens = String(c.name||'').toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const hit = tokens.filter(w => html.includes(w)).length;
    const ok = tokens.length ? hit / tokens.length >= 0.5 : false;
    return { ...c, _verified: ok, _reason: ok ? 'name confirmed on page' : `only ${hit}/${tokens.length} name tokens on page` };
  } catch (e) { clearTimeout(t); return { ...c, _verified: false, _reason: e.message || 'fetch error' }; }
}

const genres = (process.argv[2] || 'poetry').split(',').map(s => s.trim()).filter(Boolean);
const seenRun = new Set();
const allPassed = [];
for (const g of genres) {
  genreSet(g);
  const cands = await discover();
  const fresh = cands.filter(c => c.name && !known.has(normName(c.name)) && !seenRun.has(normName(c.name)));
  console.error(`[${g}] ${fresh.length} new, verifying names against cited sources…`);
  for (const c of fresh) {
    seenRun.add(normName(c.name));
    const v = await verify(c);
    console.error(`  ${v._verified ? '✅' : '❌'}  ${v.name}  [${v._reason}]`);
    if (v._verified) allPassed.push({ ...toRecord(v), discoveredGenre: g, _reason: v._reason });
  }
}
writeFileSync(join(here, '.contest-discovered.json'), JSON.stringify(allPassed, null, 1));
console.error(`\n=== staged ${allPassed.length} new verified candidates across [${genres.join(', ')}] -> scripts/.contest-discovered.json ===`);
console.error(`(all projected:true; run confirm-contests.mjs, then merge-contests.mjs to integrate)`);
