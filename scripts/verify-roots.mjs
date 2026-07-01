// Verification harness for the Root Word Explorer dataset + decomposition.
// Run:  node scripts/verify-roots.mjs
//
// Why the source rewrite below: src/utils/rootUtils.js uses Vite's native bare JSON import
// (`import rootsData from '../data/roots.json'`), which Node ESM rejects without an import
// attribute. To exercise the REAL decomposition logic unchanged under plain Node, we read the
// util's source and inline the JSON. The app itself imports it normally via Vite.

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const roots = JSON.parse(readFileSync(join(repo, 'src/data/roots.json'), 'utf8'));

const utilSrc = readFileSync(join(repo, 'src/utils/rootUtils.js'), 'utf8')
  .replace(/import rootsData from '\.\.\/data\/roots\.json';/,
    `const rootsData = ${JSON.stringify(roots)};`);
const tmp = join(mkdtempSync(join(tmpdir(), 'roots-')), 'rootUtils.mjs');
writeFileSync(tmp, utilSrc);
const { decomposeWord } = await import(pathToFileURL(tmp).href);

let pass = 0, fail = 0;
const problems = [];
const check = (name, cond, detail) => {
  if (cond) pass++;
  else { fail++; problems.push(`FAIL ${name}: ${detail}`); }
};
const statusOf = (w) => decomposeWord(w).status;
const rootTexts = (w) => decomposeWord(w).parts.filter((x) => x.kind === 'root').map((x) => x.text);

// 1. Dataset integrity — >=120 roots, each with meaning + >=3 words w/ definitions.
check('roots >= 120', roots.length >= 120, `only ${roots.length}`);
for (const e of roots) {
  check(`${e.root}: origin`, ['latin', 'greek'].includes(e.origin), e.origin);
  check(`${e.root}: meaning`, !!e.meaning, 'missing');
  check(`${e.root}: >=3 words`, Array.isArray(e.words) && e.words.length >= 3, `${e.words?.length}`);
  for (const w of e.words || []) check(`${e.root}: word def`, !!w.word && !!w.definition, JSON.stringify(w));
}

// 2. 10-root meaning spot-check against known-correct glosses (anti-fabrication).
for (const [r, expect] of Object.entries({
  bio: 'life', geo: 'earth', phon: 'sound', tele: 'far', therm: 'heat',
  aqua: 'water', dict: 'say', port: 'carry', scrib: 'write', spect: 'look',
})) {
  const e = roots.find((x) => x.root === r);
  check(`spot ${r}`, e && e.meaning.toLowerCase().includes(expect), `${r} -> ${e?.meaning}`);
}

// 3. Decomposition fixture (>=15 words: clean + ambiguous/overlapping/false-friend).
// 3a. Clean, well-known → confident VERIFIED split.
for (const w of ['biology', 'geography', 'telephone', 'thermometer', 'dermatology',
  'chronology', 'photograph', 'autograph', 'bibliophile', 'democracy', 'television', 'microscope']) {
  check(`clean ${w} verified`, statusOf(w) === 'verified', statusOf(w));
}
// 3b. Clean algorithmic (not pre-verified) → finds the right lead roots, never 'none'.
check('geothermal → geo+therm', rootTexts('geothermal').includes('geo') && rootTexts('geothermal').includes('therm'), JSON.stringify(rootTexts('geothermal')));
check('transport → port', rootTexts('transport').includes('port'), JSON.stringify(rootTexts('transport')));
check('carnivore → vor', rootTexts('carnivore').includes('vor'), JSON.stringify(rootTexts('carnivore')));

// 3c. Ambiguous / false-friend traps → NEVER a confident (verified) split; must flag or stay honest.
// pediatrician: greedy grabs Latin ped(=foot) but true root is Greek paed(=child) → must flag.
const pedia = decomposeWord('pediatrician');
check('pediatrician not verified', pedia.status !== 'verified', pedia.status);
check('pediatrician flags child', /child/i.test(pedia.note), `note="${pedia.note}"`);
// monastery: contains 'aster'(star) but is monos(alone) → false-friend flag required (DoD-named trap).
const mon = decomposeWord('monastery');
check('monastery not verified', mon.status !== 'verified', mon.status);
check('monastery flags false friend', /coincidence/i.test(mon.note) && /aster/i.test(mon.note), `note="${mon.note}"`);
// normal: contains 'mal'(bad) but is norma(rule) → false-friend flag required.
const norm = decomposeWord('normal');
check('normal not verified', norm.status !== 'verified', norm.status);
check('normal flags false friend', /coincidence/i.test(norm.note), `note="${norm.note}"`);
// matter: contains 'matr'(mother) → false-friend flag.
check('matter flags false friend', /coincidence/i.test(decomposeWord('matter').note), decomposeWord('matter').note);

// 3d. Unknown / contain-but-not-derived → honest, never a fabricated confident etymology.
for (const w of ['target', 'notable', 'understand', 'kangaroo', 'carpet']) {
  const d = decomposeWord(w);
  check(`${w} not verified`, d.status !== 'verified', d.status);
  check(`${w} honest`, ['none', 'partial', 'possible'].includes(d.status), d.status);
}

console.log(`\nPASS=${pass} FAIL=${fail}`);
if (problems.length) { console.log(problems.slice(0, 40).join('\n')); process.exit(1); }
console.log('ALL GREEN');
for (const w of ['biology', 'geothermal', 'pediatrician', 'monastery', 'normal', 'target']) {
  const d = decomposeWord(w);
  console.log(`${w} -> [${d.status}] ${d.parts.map((x) => x.text + '(' + x.kind + (x.meaning ? ':' + x.meaning : '') + ')').join(' + ')}${d.note ? '  ⚠ ' + d.note : ''}`);
}
