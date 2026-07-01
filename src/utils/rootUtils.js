// rootUtils.js
// Root lookup + honest, dataset-bounded word decomposition for the Root Word Explorer.
//
// Design notes (see src/data/roots.SOURCES.md):
// - The dataset (roots.json) is the ONLY source of roots. Decomposition can never claim a root
//   that is not in the dataset.
// - Algorithmic splits are framed as a POSSIBLE, UNVERIFIED breakdown, never a confident
//   etymology, because substring-matching a word against roots cannot prove derivation
//   (e.g. "monastery" contains "aster" but is not "one + star"; "pediatrician" contains the
//   Latin "ped" = foot but actually uses the Greek "paed" = child). A small curated VERIFIED
//   map covers well-known words with a confident, correct split.
// - Homographic roots (ped, sol, ...) attach an explicit ambiguity note when they appear.

import rootsData from '../data/roots.json';

export const ROOTS = rootsData;

// Common Latin/Greek bound prefixes — used ONLY to assist decomposition, not counted as roots.
// Glosses reconciled against the Wikipedia "List of Greek and Latin roots in English".
export const PREFIXES = [
  { form: 'anti', origin: 'greek', meaning: 'against, opposite' },
  { form: 'ante', origin: 'latin', meaning: 'before' },
  { form: 'circum', origin: 'latin', meaning: 'around' },
  { form: 'contra', origin: 'latin', meaning: 'against' },
  { form: 'trans', origin: 'latin', meaning: 'across, through' },
  { form: 'inter', origin: 'latin', meaning: 'between, among' },
  { form: 'intra', origin: 'latin', meaning: 'within' },
  { form: 'super', origin: 'latin', meaning: 'above, over' },
  { form: 'hyper', origin: 'greek', meaning: 'over, excessive' },
  { form: 'hypo', origin: 'greek', meaning: 'under, below' },
  { form: 'para', origin: 'greek', meaning: 'beside, alongside' },
  { form: 'peri', origin: 'greek', meaning: 'around' },
  { form: 'meta', origin: 'greek', meaning: 'beyond, change' },
  { form: 'epi', origin: 'greek', meaning: 'upon, over' },
  { form: 'syn', origin: 'greek', meaning: 'together, with' },
  { form: 'sym', origin: 'greek', meaning: 'together, with' },
  { form: 'dia', origin: 'greek', meaning: 'through, across' },
  { form: 'semi', origin: 'latin', meaning: 'half' },
  { form: 'extra', origin: 'latin', meaning: 'beyond, outside' },
  { form: 'post', origin: 'latin', meaning: 'after, behind' },
  { form: 'pre', origin: 'latin', meaning: 'before' },
  { form: 'pro', origin: 'latin', meaning: 'forward, for' },
  { form: 'con', origin: 'latin', meaning: 'with, together' },
  { form: 'com', origin: 'latin', meaning: 'with, together' },
  { form: 'sub', origin: 'latin', meaning: 'under, below' },
  { form: 'dis', origin: 'latin', meaning: 'apart, not' },
  { form: 'ex', origin: 'latin', meaning: 'out, from' },
  { form: 'de', origin: 'latin', meaning: 'down, from, away' },
  { form: 're', origin: 'latin', meaning: 'back, again' },
];

// Roots whose form is shared across origins/senses — surface an honest ambiguity flag.
export const HOMOGRAPH_NOTES = {
  ped: 'The form "ped" is Latin for "foot" here, but Greek "paed/ped" means "child" (as in pediatrics).',
  sol: 'The form "sol" can mean "alone" (Latin solus) or "sun" (Latin sol).',
  gen: 'The form "gen" spans Greek "birth/race" and Latin "produce".',
};

// Known "false friends": common words that merely CONTAIN a root's letters by coincidence and are
// NOT derived from it. Matching flags these explicitly so the tool never teaches a wrong etymology
// on a well-known trap. (The general framing below already warns on every unverified split; this
// gives the classic traps a precise, named correction.)
export const FALSE_FRIENDS = {
  monastery: 'Coincidence, not derivation: "monastery" contains "aster" (star) but comes from Greek "monos" (alone) — it is not "one + star".',
  normal: 'Coincidence, not derivation: "normal" contains "mal" (bad) but comes from Latin "norma" (a carpenter\'s square, i.e. a rule/standard).',
  moral: 'Coincidence, not derivation: "moral" contains "mal" (bad) but comes from Latin "mos/moris" (custom).',
  matter: 'Coincidence, not derivation: "matter" contains "matr" (mother) but comes from Latin "materia" (material/substance).',
  cordon: 'Coincidence, not derivation: "cordon" contains "cord" (heart) but comes from a diminutive of "cord/rope", not the heart root.',
};

// Combining vowels that link two morphemes (thermO-meter, chronO-logy, demO-cracy).
const CONNECTORS = new Set(['o', 'i']);

// Trailing English/Latin endings that are benign (not treated as an unexplained gap).
const SUFFIXES = [
  'tion', 'sion', 'ician', 'ology', 'ment', 'ness', 'able', 'ible', 'ious', 'ous',
  'ical', 'ic', 'ity', 'ist', 'ism', 'ize', 'ise', 'ate', 'ive', 'ary', 'ory',
  'ance', 'ence', 'ent', 'ant', 'age', 'ful', 'ing', 'al', 'ar', 'er', 'or',
  'ly', 'ed', 'es', 'y', 'a', 'um', 'us', 'on', 'e', 's',
];

// Curated, etymologically-correct splits for well-known words → confident "verified" result.
export const VERIFIED = {
  biology: [p('bio', 'life', 'greek'), p('logy', 'study of', 'greek')],
  geography: [p('geo', 'earth', 'greek'), p('graphy', 'writing, describing', 'greek')],
  geology: [p('geo', 'earth', 'greek'), p('logy', 'study of', 'greek')],
  telephone: [p('tele', 'far, distant', 'greek'), p('phone', 'sound, voice', 'greek')],
  television: [p('tele', 'far, distant', 'greek'), p('vision', 'seeing', 'latin')],
  thermometer: [p('thermo', 'heat', 'greek'), p('meter', 'measure', 'greek')],
  dermatology: [p('dermato', 'skin', 'greek'), p('logy', 'study of', 'greek')],
  chronology: [p('chrono', 'time', 'greek'), p('logy', 'study of', 'greek')],
  photograph: [p('photo', 'light', 'greek'), p('graph', 'write, draw', 'greek')],
  autograph: [p('auto', 'self', 'greek'), p('graph', 'write, draw', 'greek')],
  bibliophile: [p('biblio', 'book', 'greek'), p('phile', 'lover of', 'greek')],
  democracy: [p('demo', 'people', 'greek'), p('cracy', 'rule, government', 'greek')],
  microscope: [p('micro', 'small', 'greek'), p('scope', 'instrument for viewing', 'greek')],
  hydrophobia: [p('hydro', 'water', 'greek'), p('phobia', 'fear', 'greek')],
};

function p(text, meaning, origin) {
  return { text, meaning, origin, kind: 'root' };
}

// ---- lookup / search --------------------------------------------------------

export function getAllRoots() {
  return ROOTS;
}

export function searchRoots(query = '', origin = 'all') {
  const q = query.trim().toLowerCase();
  return ROOTS.filter((entry) => {
    if (origin !== 'all' && entry.origin !== origin) return false;
    if (!q) return true;
    if (entry.root.includes(q)) return true;
    if (entry.meaning.toLowerCase().includes(q)) return true;
    return entry.words.some((w) => w.word.toLowerCase().includes(q));
  });
}

// ---- decomposition ----------------------------------------------------------

// Build matchers sorted longest-first so greedy scan prefers the longest morpheme.
const ROOT_MATCHERS = [...ROOTS]
  .map((e) => ({ form: e.root, meaning: e.meaning, origin: e.origin, kind: 'root' }))
  .sort((a, b) => b.form.length - a.form.length);
const PREFIX_MATCHERS = [...PREFIXES]
  .map((e) => ({ form: e.form, meaning: e.meaning, origin: e.origin, kind: 'prefix' }))
  .sort((a, b) => b.form.length - a.form.length);

function matchAt(word, i) {
  // Prefer the longest match across roots and prefixes; on a tie, prefer a root.
  let best = null;
  for (const m of ROOT_MATCHERS) {
    if (word.startsWith(m.form, i)) { best = m; break; } // sorted longest-first
  }
  for (const m of PREFIX_MATCHERS) {
    if (word.startsWith(m.form, i)) {
      if (!best || m.form.length > best.form.length) best = m;
      break;
    }
  }
  return best;
}

function anyMatchAt(word, i) {
  return !!matchAt(word, i);
}

/**
 * Decompose a word into dataset roots/prefixes.
 * Returns { input, normalized, status, parts, note }.
 * status ∈ 'verified' | 'possible' | 'partial' | 'none'
 *   verified – curated, etymologically confirmed split
 *   possible – whole word explained by dataset morphemes, but UNVERIFIED (substring-based)
 *   partial  – some roots found, but part of the word is not in the dataset
 *   none     – no dataset roots found; honestly "roots not in dataset"
 */
export function decomposeWord(rawInput) {
  const input = String(rawInput || '');
  const word = input.toLowerCase().replace(/[^a-z]/g, '');

  if (!word) {
    return { input, normalized: word, status: 'none', parts: [], note: '' };
  }

  if (VERIFIED[word]) {
    return {
      input,
      normalized: word,
      status: 'verified',
      parts: VERIFIED[word].map((x) => ({ ...x })),
      note: buildAmbiguityNote(VERIFIED[word]),
    };
  }

  const parts = [];
  let i = 0;
  let pendingGap = '';

  const flushGap = () => {
    if (pendingGap) {
      parts.push({ text: pendingGap, kind: 'unmatched' });
      pendingGap = '';
    }
  };

  while (i < word.length) {
    const m = matchAt(word, i);
    if (m) {
      flushGap();
      parts.push({ text: word.slice(i, i + m.form.length), meaning: m.meaning, origin: m.origin, kind: m.kind });
      i += m.form.length;
      continue;
    }
    // Connective vowel between morphemes?
    if (parts.length > 0 && !pendingGap && CONNECTORS.has(word[i]) && anyMatchAt(word, i + 1)) {
      parts.push({ text: word[i], kind: 'connector' });
      i += 1;
      continue;
    }
    pendingGap += word[i];
    i += 1;
  }

  // Trailing gap that is a recognised suffix is benign; reclassify it.
  if (pendingGap) {
    if (isSuffix(pendingGap)) {
      parts.push({ text: pendingGap, kind: 'suffix' });
    } else {
      parts.push({ text: pendingGap, kind: 'unmatched' });
    }
    pendingGap = '';
  }

  const rootCount = parts.filter((x) => x.kind === 'root').length;
  const hasGap = parts.some((x) => x.kind === 'unmatched');

  let status;
  if (rootCount === 0) status = 'none';
  else if (hasGap) status = 'partial';
  else status = 'possible';

  const notes = [];
  if (FALSE_FRIENDS[word]) notes.push(FALSE_FRIENDS[word]);
  const homograph = buildAmbiguityNote(parts);
  if (homograph) notes.push(homograph);

  return { input, normalized: word, status, parts, note: notes.join(' ') };
}

function isSuffix(s) {
  return SUFFIXES.includes(s);
}

function buildAmbiguityNote(parts) {
  const notes = [];
  for (const part of parts) {
    if (part.kind === 'root' && HOMOGRAPH_NOTES[part.text] && !notes.includes(HOMOGRAPH_NOTES[part.text])) {
      notes.push(HOMOGRAPH_NOTES[part.text]);
    }
  }
  return notes.join(' ');
}

export const STATUS_LABELS = {
  verified: 'Verified breakdown',
  possible: 'Possible breakdown (unverified)',
  partial: 'Partial — some roots not in our dataset',
  none: 'Roots not in our dataset',
};
