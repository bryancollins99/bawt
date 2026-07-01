// Literary Device Detector — OFFLINE heuristics only.
//
// SCOPE (honest): this file only emits devices that are reliably detectable
// WITHOUT phonetics — alliteration, onomatopoeia, repetition, internal rhyme,
// and the simile marker ("like"/"as"). Assonance and consonance depend on
// shared vowel/consonant *sounds* (phonemes), not letters, so a letter-based
// approximation would mislabel — those live in the QUIZ only, never here.
// Metaphor / allegory / farce / tragic-hero / ballad are semantic/structural
// and cannot be pattern-matched from a single line — quiz-only as well.
//
// Every detector returns matches with an explanation that names its own limits.

import { doWordsRhyme } from './rhymeUtils';

// Words that carry little lexical weight — excluded from repetition counting
// and internal-rhyme pairing so loose endings don't create false positives.
const FUNCTION_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'of', 'to', 'in', 'on', 'at',
  'by', 'for', 'with', 'as', 'is', 'it', 'its', 'be', 'am', 'are', 'was',
  'were', 'he', 'she', 'we', 'you', 'i', 'my', 'me', 'us', 'so', 'if', 'no',
  'not', 'up', 'out', 'off', 'do', 'did', 'this', 'that', 'these', 'those',
]);

// Curated onomatopoeia set (words that name the sound they describe).
// Drawn from BAWT's onomatopoeia-examples cluster.
const ONOMATOPOEIA = new Set([
  'buzz', 'buzzed', 'buzzing', 'hiss', 'hissed', 'hissing', 'boom', 'boomed',
  'bang', 'banged', 'crash', 'crashed', 'clang', 'clank', 'click', 'clicked',
  'clatter', 'crackle', 'crunch', 'crunched', 'drip', 'dripping', 'fizz',
  'gurgle', 'growl', 'growled', 'honk', 'howl', 'hum', 'hummed', 'jingle',
  'meow', 'moo', 'murmur', 'oink', 'plop', 'pop', 'popped', 'purr', 'quack',
  'rattle', 'ring', 'roar', 'roared', 'rumble', 'rustle', 'screech', 'sizzle',
  'sizzled', 'slam', 'slammed', 'splash', 'splashed', 'squeak', 'squeal',
  'swish', 'thud', 'thump', 'tick', 'tock', 'ticktock', 'tinkle', 'twang',
  'vroom', 'whack', 'wham', 'whir', 'whirr', 'whisper', 'whoosh', 'woof',
  'zap', 'zoom', 'chirp', 'chirped', 'cluck', 'creak', 'creaked', 'ding',
  'dong', 'flutter', 'gargle', 'jangle', 'knock', 'knocked', 'ping', 'ripple',
  'sputter', 'squelch', 'thwack',
]);

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Split into tokens, keeping only the alphabetic core of each word.
const tokenize = (text) =>
  (text.match(/[A-Za-z']+/g) || []).map((w) => w.toLowerCase().replace(/^'+|'+$/g, ''));

const splitLines = (text) =>
  text.split(/[\n.;!?]+/).map((l) => l.trim()).filter(Boolean);

const leadingConsonant = (word) => {
  const c = word[0];
  return c && !VOWELS.has(c) ? c : null;
};

const dedupe = (arr) => Array.from(new Set(arr));

// --- Alliteration -----------------------------------------------------------
// Runs of consecutive words sharing the same leading consonant LETTER.
// Requires >= 2 DISTINCT words in the run, so pure repetition ("never never
// never") is reported as repetition, not alliteration.
const detectAlliteration = (text) => {
  const words = tokenize(text);
  const groups = [];
  let run = [];
  let runLetter = null;

  const flush = () => {
    if (run.length >= 2 && dedupe(run).length >= 2) groups.push([...run]);
    run = [];
    runLetter = null;
  };

  for (const w of words) {
    const c = leadingConsonant(w);
    if (c && c === runLetter) {
      run.push(w);
    } else {
      flush();
      if (c) {
        run = [w];
        runLetter = c;
      }
    }
  }
  flush();

  if (groups.length === 0) return null;
  return {
    device: 'alliteration',
    matches: groups.map((g) => g.join(' ')),
    explanation:
      'Two or more adjacent words begin with the same consonant letter. ' +
      'Heuristic: matches leading LETTERS, not sounds (e.g. "kind cat" alliterates by sound but not by letter and is missed).',
  };
};

// --- Onomatopoeia -----------------------------------------------------------
const detectOnomatopoeia = (text) => {
  const words = tokenize(text);
  const hits = dedupe(words.filter((w) => ONOMATOPOEIA.has(w)));
  if (hits.length === 0) return null;
  return {
    device: 'onomatopoeia',
    matches: hits,
    explanation:
      'Words that imitate the sound they describe. Heuristic: matched against a curated ' +
      'word list, so coined or context-specific sound-words outside the list are missed.',
  };
};

// --- Repetition -------------------------------------------------------------
// Content words (length >= 3, not function words) appearing 2+ times, plus
// anaphora (multiple lines opening with the same word).
const detectRepetition = (text) => {
  const words = tokenize(text);
  const counts = {};
  for (const w of words) {
    if (w.length >= 3 && !FUNCTION_WORDS.has(w)) counts[w] = (counts[w] || 0) + 1;
  }
  const repeated = Object.keys(counts).filter((w) => counts[w] >= 2);

  const anaphora = [];
  const firstWords = splitLines(text)
    .map((l) => tokenize(l)[0])
    .filter(Boolean);
  const firstCounts = {};
  firstWords.forEach((w) => {
    firstCounts[w] = (firstCounts[w] || 0) + 1;
  });
  Object.keys(firstCounts).forEach((w) => {
    if (
      firstCounts[w] >= 2 &&
      w.length >= 3 &&
      !FUNCTION_WORDS.has(w) &&
      !repeated.includes(w)
    ) {
      anaphora.push(w);
    }
  });

  const matches = dedupe([...repeated, ...anaphora]);
  if (matches.length === 0) return null;
  return {
    device: 'repetition',
    matches: matches.map((w) => `${w} (×${counts[w] || firstCounts[w]})`),
    explanation:
      'A word (or line-opening word, for anaphora) recurs for emphasis. ' +
      'Heuristic: counts repeated content words; very common function words are ignored.',
  };
};

// --- Internal rhyme ---------------------------------------------------------
// Two DISTINCT non-function words within the SAME line that rhyme (reuses
// rhymeUtils.doWordsRhyme — shared ending, not phoneme-exact).
const detectInternalRhyme = (text) => {
  const pairs = [];
  for (const line of splitLines(text)) {
    const words = dedupe(
      tokenize(line).filter((w) => w.length > 2 && !FUNCTION_WORDS.has(w))
    );
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        if (doWordsRhyme(words[i], words[j])) pairs.push(`${words[i]} / ${words[j]}`);
      }
    }
  }
  const matches = dedupe(pairs);
  if (matches.length === 0) return null;
  return {
    device: 'internal-rhyme',
    matches,
    explanation:
      'Rhyming words fall within a single line (not just at line ends). ' +
      'Heuristic: reuses the app’s rhyme check (shared word endings), so near-rhymes and eye-rhymes may over- or under-match.',
  };
};

// --- Simile marker ----------------------------------------------------------
// "as ADJ as ..." or "like a/an/the ...". Determiner requirement keeps the
// verb sense ("I like coffee") from false-positiving.
const detectSimile = (text) => {
  const matches = [];
  const asRe = /\bas\s+[A-Za-z]+\s+as\b[^.!?;,]*/gi;
  const likeRe = /\blike\s+(?:a|an|the)\s+[A-Za-z]+/gi;
  let m;
  while ((m = asRe.exec(text)) !== null) matches.push(m[0].trim());
  while ((m = likeRe.exec(text)) !== null) matches.push(m[0].trim());
  const uniq = dedupe(matches);
  if (uniq.length === 0) return null;
  return {
    device: 'simile',
    matches: uniq,
    explanation:
      'A comparison flagged by a marker: "as … as" or "like a/an/the …". ' +
      'Heuristic: marker-based only — markerless similes are missed and "like" as a verb ("I like tea") is deliberately excluded.',
  };
};

// Public API. Returns an array of { device, matches, explanation }.
// NOTE: by construction this NEVER emits assonance, consonance, metaphor,
// allegory, farce, tragic-hero or ballad — those are quiz-only.
export const detectDevices = (text) => {
  if (!text || !text.trim()) return [];
  return [
    detectAlliteration(text),
    detectOnomatopoeia(text),
    detectRepetition(text),
    detectInternalRhyme(text),
    detectSimile(text),
  ].filter(Boolean);
};

// Devices this heuristic engine cannot detect (surfaced in the UI for honesty).
export const QUIZ_ONLY_DEVICES = [
  'assonance',
  'consonance',
  'metaphor',
  'allegory',
  'farce',
  'tragic hero',
  'ballad',
];

export default detectDevices;
