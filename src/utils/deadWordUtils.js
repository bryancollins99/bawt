// deadWordUtils.js — pure, offline text analysis for the Dead / Weak-Word Checker.
//
// Distinct from FillerWordsProcessor: that tool targets crutch/filler PHRASES and
// returns a clarity score. This tool targets dead/weak WORDS and returns, per word,
// a curated set of stronger replacement suggestions plus in-place highlight segments.
//
// Curated-only by design (no network call) so the tool is fully offline and can
// never blank on a failed fetch. See src/data/deadWords.json for the word bank.

import deadWords from '../data/deadWords.json';

// Tailwind accent → concrete class strings. Kept here (not interpolated) so the
// Tailwind JIT scanner sees every class literally and doesn't purge them.
export const ACCENT_CLASSES = {
  amber: {
    mark: 'bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  },
  rose: {
    mark: 'bg-rose-200 text-rose-900 dark:bg-rose-500/30 dark:text-rose-100',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
  },
  indigo: {
    mark: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-500/30 dark:text-indigo-100',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
  },
  emerald: {
    mark: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  sky: {
    mark: 'bg-sky-200 text-sky-900 dark:bg-sky-500/30 dark:text-sky-100',
    dot: 'bg-sky-500',
    text: 'text-sky-700 dark:text-sky-300',
    chip: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  },
};

// Category metadata for legends / summaries, in display order.
export const CATEGORIES = Object.entries(deadWords).map(([key, cat]) => ({
  key,
  label: cat.label,
  accent: cat.accent,
  blurb: cat.blurb,
}));

// Flatten the JSON into a fast lookup: normalized word/phrase → entry.
function buildLookup() {
  const map = new Map();
  for (const [catKey, cat] of Object.entries(deadWords)) {
    for (const [word, swaps] of Object.entries(cat.words)) {
      map.set(word.toLowerCase(), {
        word,
        swaps,
        category: catKey,
        categoryLabel: cat.label,
        accent: cat.accent,
      });
    }
  }
  return map;
}

const LOOKUP = buildLookup();

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// One combined, case-insensitive, word-boundary regex over every entry.
// Sorted longest-first so multi-word phrases ("a lot") win over any substring.
const MATCH_RE = (() => {
  const keys = Array.from(LOOKUP.keys()).sort((a, b) => b.length - a.length);
  const alternation = keys.map(escapeRegExp).join('|');
  return new RegExp(`\\b(${alternation})\\b`, 'gi');
})();

// Collapse internal whitespace so "a   lot" still matches the "a lot" key.
function normalize(match) {
  return match.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Analyze text for dead / weak words.
 * @param {string} text
 * @returns {{
 *   segments: Array<{text:string, dead:boolean, entry?:object}>,
 *   found: Array<{word:string, count:number, category:string, categoryLabel:string, accent:string, swaps:string[]}>,
 *   totalDead: number,
 *   totalWords: number,
 *   density: number,
 *   byCategory: Object<string, number>
 * }}
 */
export function analyzeDeadWords(text) {
  const safe = typeof text === 'string' ? text : '';
  const segments = [];
  const foundMap = new Map(); // normalized word → aggregate
  const byCategory = {};
  let totalDead = 0;
  let lastIndex = 0;

  // Reset lastIndex on the shared global regex before each run.
  MATCH_RE.lastIndex = 0;
  let m;
  while ((m = MATCH_RE.exec(safe)) !== null) {
    const matchText = m[0];
    const key = normalize(matchText);
    const entry = LOOKUP.get(key);
    if (!entry) continue; // defensive; should not happen

    // Plain text before this match.
    if (m.index > lastIndex) {
      segments.push({ text: safe.slice(lastIndex, m.index), dead: false });
    }

    segments.push({ text: matchText, dead: true, entry });
    lastIndex = m.index + matchText.length;
    totalDead += 1;
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;

    const agg = foundMap.get(key);
    if (agg) {
      agg.count += 1;
    } else {
      foundMap.set(key, {
        word: entry.word,
        count: 1,
        category: entry.category,
        categoryLabel: entry.categoryLabel,
        accent: entry.accent,
        swaps: entry.swaps,
      });
    }
  }

  // Trailing plain text.
  if (lastIndex < safe.length) {
    segments.push({ text: safe.slice(lastIndex), dead: false });
  }

  const totalWords = (safe.trim().match(/\S+/g) || []).length;
  const density = totalWords > 0 ? Math.round((totalDead / totalWords) * 1000) / 10 : 0;

  const found = Array.from(foundMap.values()).sort(
    (a, b) => b.count - a.count || a.word.localeCompare(b.word)
  );

  return { segments, found, totalDead, totalWords, density, byCategory };
}
