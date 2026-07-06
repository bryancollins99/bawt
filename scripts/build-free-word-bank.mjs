// scripts/build-free-word-bank.mjs
//
// FREE LEAD MAGNET: "The Writer's Word Bank".
//
// A genuinely useful, printable single HTML file: ~900+ vivid words organised
// into eight categories that match the vocabulary/word-list search traffic that
// already lands on becomeawritertoday.com (descriptive, sensory, emotion, action,
// love and romance, light and nature, connectors/transitions, poets).
//
// The words are assembled FOR REAL from the site's own generator word banks:
//   - DescriptiveGenerator.jsx  (sensory + descriptive tone banks)
//   - ActionGenerator.jsx       (action verbs, every intensity)
//   - RomanticWordsGenerator.jsx (love and romance vocabulary)
//   - SadWordsGenerator.jsx     (grief/sorrow emotion words)
//   - PoetryWordsGenerator.jsx  (vivid words for poets)
//   - ConjunctionTool.jsx       (connectors and transitions)
//   - src/data/emotionWheel.json     (Parrott emotion tiers)
//   - src/data/themedWordsFallback.json (curated themed presets)
//
// The generators store their banks as inline JS object literals; Node cannot
// import JSX, so this script parses the source text. Extraction helpers here are
// COPIED (not imported) so this free build stays self-contained and cannot break
// the paid Prompt / Word-Bank Pack build or its test.
//
// Everything is DETERMINISTIC: no Math.random, source-order extraction, fixed
// version label (no build date), alphabetical sort within each category. Reruns
// are byte-identical, so the committed public/writers-word-bank.html never churns.
//
// FREE vs PAID split (protects the upsell): this asset is WORDS ONLY. The paid
// $12 pack adds the expanded word bank plus 275 writing prompts.
//
// Brand palette: serif (system Georgia, no web-font fetch), cream #f6f4ef,
// red #b23a48. No em or en dashes anywhere.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMP = path.join(REPO_ROOT, "src", "components");
const DATA = path.join(REPO_ROOT, "src", "data");

export const PRODUCT = {
  slug: "writers-word-bank",
  htmlName: "writers-word-bank.html",
  version: "1.0",
};

// The paid pack ($12) that the free magnet upsells to.
const UPSELL_URL = "https://buy.stripe.com/3cIaEY4zZ7mj34281GbZe0A";

const FANCY_DASH = /[–—]/; // en dash, em dash

// The eight categories, in the order they appear in the asset. Headings are the
// contract the self-test asserts, so keep them exact.
export const CATEGORY_ORDER = [
  "Descriptive words",
  "Sensory words",
  "Emotion words",
  "Action verbs",
  "Words for love and romance",
  "Words of light and nature",
  "Connector and transition words",
  "Vivid words for poets",
];

const CATEGORY_BLURB = {
  "Descriptive words": "Adjectives for mood, place, and structure. Reach for these when a scene feels flat and you need the reader to see it.",
  "Sensory words": "Sight, sound, and touch. The fastest way to pull a reader inside a moment is to give them something to sense.",
  "Emotion words": "Precise names for feeling, from quiet content to open grief. Name the exact emotion instead of settling for happy or sad.",
  "Action verbs": "Strong verbs across physical, mental, and dramatic registers. Swap a weak verb here and a sentence stands up straight.",
  "Words for love and romance": "Vocabulary for tenderness, longing, and devotion, for love stories, poetry, and anything with a beating heart.",
  "Words of light and nature": "The natural world in words: light, season, water, and green things growing. Ready-made imagery for a landscape or an opening line.",
  "Connector and transition words": "The joints of good prose. Use these to link ideas cleanly and carry a reader from one thought to the next.",
  "Vivid words for poets": "Uncommon, musical, image-rich words that earn their place in a poem. Read them aloud and keep the ones that ring.",
};

// ---------------------------------------------------------------------------
// Extraction helpers (copied from the paid pack build, kept self-contained).
// ---------------------------------------------------------------------------

// Split a source string into { key: sliceText } for an ordered set of top-level
// category keys. Each slice runs from its key declaration to the next.
function sliceByKeys(src, keys) {
  const positions = keys
    .map((k) => {
      const re = new RegExp(`\\n\\s{2,8}${k}:\\s*\\{`);
      const m = re.exec(src);
      return m ? { key: k, index: m.index } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const out = {};
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : src.length;
    out[positions[i].key] = src.slice(start, end);
  }
  return out;
}

// Pull every single-quoted token inside any [ ... ] array literal in the slice.
// Deduped (case-insensitive), source order preserved.
function wordsInArrays(slice) {
  const words = [];
  const seen = new Set();
  const arrayRe = /\[([^\]]*)\]/g;
  let m;
  while ((m = arrayRe.exec(slice)) !== null) {
    const tokenRe = /'([^']+)'/g;
    let t;
    while ((t = tokenRe.exec(m[1])) !== null) {
      const w = t[1].trim();
      if (w && !seen.has(w.toLowerCase())) {
        seen.add(w.toLowerCase());
        words.push(w);
      }
    }
  }
  return words;
}

// Pull every `word: 'token'` value from an object-literal source (Romantic /
// Sad / Poetry generators). The colon-quote guard avoids matching property
// accesses like wordObj.word.
function wordTokens(src) {
  const re = /word:\s*'([^']+)'/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    const w = m[1].trim();
    if (w && !seen.has(w.toLowerCase())) {
      seen.add(w.toLowerCase());
      out.push(w);
    }
  }
  return out;
}

// Pull only the `conjunctions: [ ... ]` arrays from ConjunctionTool (ignoring
// the example-sentence arrays that also live in that file).
function conjunctionTokens(src) {
  const groupRe = /conjunctions:\s*\[([^\]]*)\]/g;
  const out = [];
  const seen = new Set();
  let g;
  while ((g = groupRe.exec(src)) !== null) {
    const tokenRe = /'([^']+)'/g;
    let t;
    while ((t = tokenRe.exec(g[1])) !== null) {
      const w = t[1].trim();
      if (w && !seen.has(w.toLowerCase())) {
        seen.add(w.toLowerCase());
        out.push(w);
      }
    }
  }
  return out;
}

// Every label in the Parrott emotion wheel (core + secondary + tertiary tiers).
function emotionWheelWords(wheel) {
  const out = [];
  const seen = new Set();
  const push = (w) => {
    const t = String(w || "").trim();
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  };
  for (const core of wheel.cores || []) {
    push(core.name);
    for (const sec of core.secondary || []) {
      push(sec.name);
      for (const t of sec.tertiary || []) push(t);
    }
  }
  return out;
}

// words[].word from a themedWordsFallback preset.
function fallbackWords(fb, key) {
  const entry = fb[key];
  if (!entry || !Array.isArray(entry.words)) return [];
  return entry.words.map((w) => w.word).filter(Boolean);
}

// Merge sources into one category bank: dedup within the category (a word may
// legitimately recur across categories), sorted alphabetically for stable bytes.
function mergeCategory(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const w of list) {
      const t = String(w || "").trim();
      if (t && !seen.has(t.toLowerCase())) {
        seen.add(t.toLowerCase());
        out.push(t);
      }
    }
  }
  if (out.length === 0) {
    throw new Error("build-free-word-bank: a category extracted 0 words (source refactor?)");
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

async function extractBanks() {
  const [descSrc, actSrc, romanticSrc, sadSrc, poetrySrc, conjSrc, wheel, fb] = await Promise.all([
    readFile(path.join(COMP, "DescriptiveGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "ActionGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "RomanticWordsGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "SadWordsGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "PoetryWordsGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "ConjunctionTool.jsx"), "utf8"),
    readFile(path.join(DATA, "emotionWheel.json"), "utf8").then(JSON.parse),
    readFile(path.join(DATA, "themedWordsFallback.json"), "utf8").then(JSON.parse),
  ]);

  const d = sliceByKeys(descSrc, ["visual", "auditory", "tactile", "emotional", "natural", "architectural"]);
  const a = sliceByKeys(actSrc, ["physical", "mental", "emotional", "creative", "communication", "conflict"]);

  const descNatural = wordsInArrays(d.natural);

  const banks = {
    "Sensory words": mergeCategory(
      wordsInArrays(d.visual),
      wordsInArrays(d.auditory),
      wordsInArrays(d.tactile),
    ),
    "Descriptive words": mergeCategory(
      wordsInArrays(d.emotional),
      wordsInArrays(d.architectural),
      descNatural,
    ),
    "Emotion words": mergeCategory(
      emotionWheelWords(wheel),
      wordTokens(sadSrc),
      fallbackWords(fb, "fear"),
      fallbackWords(fb, "spooky"),
    ),
    "Action verbs": mergeCategory(
      wordsInArrays(a.physical),
      wordsInArrays(a.mental),
      wordsInArrays(a.emotional),
      wordsInArrays(a.creative),
      wordsInArrays(a.communication),
      wordsInArrays(a.conflict),
    ),
    "Words for love and romance": mergeCategory(
      wordTokens(romanticSrc),
      fallbackWords(fb, "love"),
    ),
    "Words of light and nature": mergeCategory(
      descNatural,
      fallbackWords(fb, "light"),
      fallbackWords(fb, "autumn"),
      fallbackWords(fb, "ocean"),
    ),
    "Connector and transition words": mergeCategory(
      conjunctionTokens(conjSrc),
    ),
    "Vivid words for poets": mergeCategory(
      wordTokens(poetrySrc),
      fallbackWords(fb, "uncommon"),
    ),
  };

  return banks;
}

// ---------------------------------------------------------------------------
// Rendering.
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const INTRO = [
  "Every writer hits the same wall: the feeling is clear in your head, but the word for it will not come. This word bank is a fast way over that wall.",
  "It gathers more than nine hundred vivid words, grouped the way writers actually reach for them: to describe a place, to name a feeling, to strengthen a verb, to open a poem. Skim a list until a word catches, then get back to the sentence.",
  "Keep it open beside your draft, or print it and pin it above the desk. It is free. Use the words freely.",
];

function renderHtml(banks, totalWords) {
  const chips = (words) =>
    `<div class="chips">` +
    words.map((w) => `<span class="chip">${esc(w)}</span>`).join("") +
    `</div>`;

  const nav = CATEGORY_ORDER.map(
    (h) => `<a href="#${slugify(h)}">${esc(h)}</a>`,
  ).join("");

  const sectionsWithAnchors = CATEGORY_ORDER.map((heading) => {
    const words = banks[heading];
    return `<section class="bank" id="${slugify(heading)}">
    <h2>${esc(heading)} <span class="n">${words.length}</span></h2>
    <p class="blurb">${esc(CATEGORY_BLURB[heading])}</p>
    ${chips(words)}
  </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Writer's Word Bank | Become a Writer Today</title>
<meta name="description" content="A free word bank for writers: more than 900 vivid words by category. Descriptive, sensory, emotion, action, love, nature, connectors, and words for poets.">
<meta name="robots" content="index, follow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23b23a48'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='20' font-weight='bold' fill='white' text-anchor='middle'%3EW%3C/text%3E%3C/svg%3E">
<style>
  :root{
    --cream:#f6f4ef; --card:#fff; --ink:#2b2b2b; --ink-2:#555; --muted:#8a857c;
    --red:#b23a48; --red-dark:#8f2c39; --line:#e3ddd2;
    --serif:Georgia,'Times New Roman',Times,serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--cream);color:var(--ink);font-family:var(--serif);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:860px;margin:0 auto;padding:36px 22px 80px}
  a{color:var(--red)}
  header.top{border-bottom:2px solid var(--line);padding-bottom:24px;margin-bottom:26px}
  .eyebrow{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:10px}
  h1{font-size:clamp(28px,5.5vw,40px);line-height:1.08}
  .lede{margin-top:14px}
  .lede p{color:var(--ink-2);margin-bottom:10px;max-width:64ch}
  .meta{margin-top:14px;font-size:13px;color:var(--muted)}
  nav.toc{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 30px}
  nav.toc a{font-size:13px;padding:5px 12px;border:1px solid var(--line);border-radius:14px;background:var(--card);text-decoration:none;color:var(--red-dark)}
  section.bank{margin-bottom:32px;scroll-margin-top:16px}
  h2{font-size:22px;border-bottom:1px solid var(--line);padding-bottom:7px;margin-bottom:8px}
  .n{font-size:14px;color:var(--muted);font-weight:400}
  .blurb{color:var(--ink-2);font-size:15px;margin-bottom:12px;max-width:66ch}
  .chips{display:flex;flex-wrap:wrap;gap:7px}
  .chip{display:inline-block;font-size:14.5px;padding:4px 11px;border-radius:13px;background:#efe7e8;color:var(--red-dark)}
  .cta{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--red);border-radius:10px;padding:20px 22px;margin:34px 0 0}
  .cta h3{color:var(--red);font-size:19px;margin-bottom:8px}
  .cta p{color:var(--ink-2);font-size:15px;max-width:64ch}
  .cta.buy{border-left-color:var(--red-dark);margin-top:18px}
  .cta a{font-weight:700}
  footer{margin-top:34px;border-top:1px solid var(--line);padding-top:18px;font-size:13px;color:var(--muted)}
  @media print{
    body{background:#fff}
    nav.toc{display:none}
    .chip{background:#fff;border:1px solid #ccc;color:#333}
    .cta{border-color:#ccc}
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">Become a Writer Today</div>
    <h1>The Writer's Word Bank</h1>
    <div class="lede">
      ${INTRO.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
    <p class="meta">Version ${PRODUCT.version}. ${totalWords} words in eight categories. Free to keep, print, and use.</p>
  </header>

  <nav class="toc" aria-label="Jump to a category">${nav}</nav>

  ${sectionsWithAnchors}

  <div class="cta">
    <h3>Get one good writing idea a week</h3>
    <p>Join the free Become a Writer Today newsletter for craft tips, tools, and a nudge to keep writing. One short email, no noise, unsubscribe any time.</p>
  </div>

  <div class="cta buy">
    <h3>Want the expanded pack?</h3>
    <p>The <strong>Prompt and Word-Bank Pack</strong> adds the full expanded word bank plus 275 ready-to-use writing prompts organised by genre, for the price of a coffee. <a href="${UPSELL_URL}">Get the pack for $12</a> and never face a blank page cold again.</p>
  </div>

  <footer>
    The Writer's Word Bank v${PRODUCT.version}. Compiled by Become a Writer Today from its own free writing tools. Use these words freely in your own drafts.
  </footer>
</div>
</body>
</html>`;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Pure content generator. Returns counts + rendered HTML; writes the file when
// outDir is supplied.
export async function build({ outDir } = {}) {
  const banks = await extractBanks();

  const counts = {};
  let totalWords = 0;
  for (const heading of CATEGORY_ORDER) {
    counts[heading] = banks[heading].length;
    totalWords += banks[heading].length;
  }

  const html = renderHtml(banks, totalWords);

  if (FANCY_DASH.test(html)) {
    throw new Error("build-free-word-bank: en/em dash leaked into HTML output");
  }

  let htmlPath = null;
  if (outDir) {
    await mkdir(outDir, { recursive: true });
    htmlPath = path.join(outDir, PRODUCT.htmlName);
    await writeFile(htmlPath, html, "utf8");
  }

  return { totalWords, counts, html, htmlPath };
}

// CLI: build straight into public/ so Vite copies it to dist/ as a static asset.
async function main() {
  const outDir = path.join(REPO_ROOT, "public");
  const res = await build({ outDir });
  console.log(`Writer's Word Bank: ${res.totalWords} words across ${CATEGORY_ORDER.length} categories`);
  for (const heading of CATEGORY_ORDER) {
    console.log(`  ${String(res.counts[heading]).padStart(4)}  ${heading}`);
  }
  console.log(`  -> ${res.htmlPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
