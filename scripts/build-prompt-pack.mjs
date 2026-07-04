// scripts/build-prompt-pack.mjs
//
// PRODUCT BUILD (Prompt / Word-Bank Pack, $12).
//
// Assembled for real from the site's own generator word banks. It reuses the
// word sources embedded in the React generators (ActionGenerator,
// DescriptiveGenerator, PoetryWordsGenerator) plus the bundled emotion-wheel
// data, then generates 200+ writing prompts organised by genre and a set of
// categorised vivid-word banks. Output is BOTH a printable HTML file and a
// markdown version.
//
// Everything is DETERMINISTIC: extraction is source order, prompt assembly uses
// fixed modular strides (never Math.random), so reruns are diff-free and the
// self-test's count assertions are stable. Extraction fails loud if any bank
// comes back empty, so a future generator refactor cannot silently ship an
// empty pack.
//
// Design split (see DECISIONS.md): `build({ outDir })` is the pure content
// generator the self-test drives; the CLI tail packages the zip for the Blobs
// upload and is the only path that shells out to `zip`.
//
// Brand palette: serif, cream #f6f4ef, red #b23a48.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMP = path.join(REPO_ROOT, "src", "components");
const DATA = path.join(REPO_ROOT, "src", "data");

export const PRODUCT = {
  slug: "prompt-word-bank-pack",
  zip: "prompt-word-bank-pack-v1.0.zip",
  htmlName: "prompt-word-bank-pack-v1.0.html",
  mdName: "prompt-word-bank-pack-v1.0.md",
  version: "1.0",
};

const FANCY_DASH = /[–—]/;

// ---------------------------------------------------------------------------
// Extraction helpers. The generators store their banks as inline JS object
// literals; node cannot import JSX, so we parse the source text. The banks are
// plain single-word string arrays, which parse cleanly and stably.
// ---------------------------------------------------------------------------

// Split a source string into { parentKey: sliceText } for a known, ordered set
// of top-level category keys (e.g. physical/mental/... in ActionGenerator).
// Each slice runs from its key declaration to the next key's declaration.
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

// Pull every single-quoted token that sits inside a [ ... ] array literal in the
// slice. Deduped, source order preserved.
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

// Build a categorised bank: { category: [words] } from selected parent keys.
function bankFromCategories(src, parentKeys, groupLabels) {
  const slices = sliceByKeys(src, parentKeys);
  const bank = {};
  for (const [label, keys] of Object.entries(groupLabels)) {
    const seen = new Set();
    const words = [];
    for (const k of keys) {
      for (const w of wordsInArrays(slices[k] || "")) {
        if (!seen.has(w.toLowerCase())) {
          seen.add(w.toLowerCase());
          words.push(w);
        }
      }
    }
    if (words.length === 0) {
      throw new Error(`build-prompt-pack: word bank "${label}" extracted 0 words (source refactor?)`);
    }
    bank[label] = words.sort((a, b) => a.localeCompare(b));
  }
  return bank;
}

// Poetic words carry definitions; extract { word, definition, mood } objects.
function extractPoeticWords(src) {
  const re = /\{\s*word:\s*'([^']+)',\s*definition:\s*'([^']*)',\s*mood:\s*'([^']+)'\s*\}/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    const word = m[1].trim();
    if (seen.has(word.toLowerCase())) continue;
    seen.add(word.toLowerCase());
    out.push({ word, definition: m[2].trim(), mood: m[3].trim() });
  }
  if (out.length === 0) {
    throw new Error("build-prompt-pack: poetic word bank extracted 0 words (source refactor?)");
  }
  out.sort((a, b) => a.word.localeCompare(b.word));
  return out;
}

// Emotion words from the bundled Parrott emotion wheel (tertiary tier).
function extractEmotionWords(wheel) {
  const set = new Set();
  for (const core of wheel.cores || []) {
    for (const sec of core.secondary || []) {
      for (const t of sec.tertiary || []) set.add(t);
    }
  }
  const words = [...set].sort((a, b) => a.localeCompare(b));
  if (words.length === 0) {
    throw new Error("build-prompt-pack: emotion word bank extracted 0 words");
  }
  return words;
}

async function extractWordBanks() {
  const [actionSrc, descSrc, poetrySrc, wheel] = await Promise.all([
    readFile(path.join(COMP, "ActionGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "DescriptiveGenerator.jsx"), "utf8"),
    readFile(path.join(COMP, "PoetryWordsGenerator.jsx"), "utf8"),
    readFile(path.join(DATA, "emotionWheel.json"), "utf8").then(JSON.parse),
  ]);

  // Action verbs: every category in ActionGenerator, one flat bank.
  const actionBank = bankFromCategories(
    actionSrc,
    ["physical", "mental", "emotional", "creative", "communication", "conflict"],
    {
      "Action verbs": ["physical", "mental", "emotional", "creative", "communication", "conflict"],
    },
  )["Action verbs"];

  // Descriptive words vs sensory words: split DescriptiveGenerator's parents.
  const descSplit = bankFromCategories(
    descSrc,
    ["visual", "auditory", "tactile", "emotional", "natural", "architectural"],
    {
      "Sensory words": ["visual", "auditory", "tactile"],
      "Descriptive words": ["emotional", "natural", "architectural"],
    },
  );

  const poetic = extractPoeticWords(poetrySrc);
  const emotions = extractEmotionWords(wheel);

  return {
    descriptive: descSplit["Descriptive words"],
    sensory: descSplit["Sensory words"],
    actionVerbs: actionBank,
    poeticWords: poetic, // array of { word, definition, mood }
    emotionWords: emotions,
  };
}

// ---------------------------------------------------------------------------
// Prompt generation. Deterministic: combos are index-driven with coprime-ish
// strides so successive prompts vary without repeating, and the same run always
// produces the same output.
// ---------------------------------------------------------------------------

// Pick element i from arr with wraparound.
function at(arr, i) {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

async function generatePrompts(banks) {
  const editorial = JSON.parse(await readFile(path.join(DATA, "editorialTopics.json"), "utf8"));

  const themes = ["the sea", "an inheritance", "a first frost", "a locked room", "a long marriage",
    "a returning soldier", "a small betrayal", "a last summer", "a found photograph", "a new city",
    "an old debt", "a missed train", "a family recipe", "a power cut", "a rival's success"];
  const settings = ["a rain-soaked harbour", "a shuttered corner shop", "a hospital waiting room",
    "a country wedding", "a night bus", "an empty theatre", "a border crossing", "a kitchen at 3am",
    "a wildfire evacuation", "a quiet library", "a crowded ferry", "a snowed-in cabin"];

  const desc = banks.descriptive;
  const sens = banks.sensory;
  const verbs = banks.actionVerbs;
  // Emotion-wheel labels are Title Case; lowercase them for mid-sentence use.
  const emos = banks.emotionWords.map((e) => e.toLowerCase());
  const poetic = banks.poeticWords;

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---- Fiction (long-form scene work) ----
  const fictionTemplates = [
    (i) => `Write a scene set in ${at(settings, i)} where a character is forced to ${at(verbs, i)} the thing they most want to keep. Let them feel ${at(emos, i)} without ever naming it.`,
    (i) => `Open a story with an image of ${at(themes, i)} that feels ${at(desc, i)}. By the final line the reader should feel ${at(emos, i + 3)}.`,
    (i) => `Two people meet in ${at(settings, i + 2)}. One of them has decided to ${at(verbs, i + 5)}; the other does not know yet. Write the conversation.`,
    (i) => `A character returns to ${at(themes, i + 1)} after ten years. Use ${at(sens, i)} detail to carry the weight of what changed.`,
    (i) => `Write a scene in which ${at(themes, i + 4)} turns from ${at(emos, i)} to ${at(emos, i + 7)} in a single page.`,
    (i) => `Give a character a secret tied to ${at(themes, i + 6)}. Reveal it through what they refuse to ${at(verbs, i + 2)}, never through explanation.`,
  ];
  // ---- Flash fiction (constraint-driven, short) ----
  const flashTemplates = [
    (i) => `In under 500 words, show a character who is ${at(emos, i)} without using the word. End on the image of ${at(themes, i)}.`,
    (i) => `Write a complete story in three ${at(desc, i)} sentences about ${at(themes, i + 2)}.`,
    (i) => `Flash piece: a single moment in ${at(settings, i)}, told only through ${at(sens, i)} detail. No dialogue.`,
    (i) => `250 words. A character decides to ${at(verbs, i)}. Do not tell us why; let ${at(sens, i + 3)} detail imply it.`,
    (i) => `Write a story that begins and ends with the same ${at(desc, i + 1)} sentence, changed only by what happened between.`,
  ];
  // ---- Poetry (word-seeded) ----
  const poetryTemplates = [
    (p) => `Write a poem built around the word "${p.word}" (${p.definition}). Keep the mood ${p.mood}.`,
    (p) => `Use "${p.word}" as the last word of every stanza. Let the meaning shift each time.`,
    (p) => `Draft a short poem that never states its subject, but circles the feeling of "${p.word}".`,
  ];

  const fiction = [];
  for (let i = 0; i < 72; i++) fiction.push(at(fictionTemplates, i)(Math.floor(i * 1.618) + i));
  const flash = [];
  for (let i = 0; i < 55; i++) flash.push(at(flashTemplates, i)(Math.floor(i * 2.414) + i));
  const poetry = [];
  for (let i = 0; i < poetic.length; i++) {
    poetry.push(at(poetryTemplates, i)(poetic[i]));
  }

  // ---- Nonfiction / essay (from the site's editorial topics) ----
  const nonfiction = [];
  const catOrder = Object.keys(editorial).sort();
  for (const cat of catOrder) {
    for (const topic of editorial[cat]) {
      nonfiction.push(`${cap(cat)}: Take a clear position on "${topic.title}". ${topic.description}`);
      for (const q of topic.questions || []) {
        nonfiction.push(`${cap(cat)} angle: ${q}`);
      }
    }
  }

  return { fiction, flash, poetry, nonfiction };
}

// ---------------------------------------------------------------------------
// Rendering.
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const HOWTO_TITLE = "How to use these in a drafting session";
const HOWTO_STEPS = [
  "Pick one prompt before you sit down, not while you sit down. Choosing is not writing, and it eats the good hour.",
  "Set a timer for twenty five minutes and draft without stopping. If you stall, pull one word from a bank below and force it into the next sentence.",
  "Do not edit inside the timer. The word banks are fuel for the draft, not a checklist for the polish.",
  "When you dry up, switch banks. A sensory word restarts a stalled scene faster than a plot note.",
  "Keep the prompt loose. If the piece wants to leave the prompt behind, let it. The prompt did its job the moment you started.",
  "Close every session by marking where you will start next time. A half-finished sentence is the easiest door to walk back through.",
];

function renderHtml({ prompts, banks, builtOn, totals }) {
  const section = (title, items) =>
    `<section><h2>${esc(title)} <span class="n">${items.length}</span></h2><ol class="prompts">` +
    items.map((p) => `<li>${esc(p)}</li>`).join("") +
    `</ol></section>`;

  const wordChips = (words) =>
    `<div class="chips">` + words.map((w) => `<span class="chip">${esc(w)}</span>`).join("") + `</div>`;

  const poeticList = (list) =>
    `<ul class="poetic">` +
    list.map((p) => `<li><strong>${esc(p.word)}</strong> <span class="mood">${esc(p.mood)}</span><br><span class="def">${esc(p.definition)}</span></li>`).join("") +
    `</ul>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prompt and Word-Bank Pack v${PRODUCT.version}</title>
<style>
  :root{
    --cream:#f6f4ef; --card:#fff; --ink:#2b2b2b; --ink-2:#555; --muted:#8a857c;
    --red:#b23a48; --red-dark:#8f2c39; --line:#e3ddd2;
    --serif:Georgia,'Times New Roman',Times,serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--cream);color:var(--ink);font-family:var(--serif);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:820px;margin:0 auto;padding:34px 22px 80px}
  a{color:var(--red)}
  header.top{border-bottom:2px solid var(--line);padding-bottom:22px;margin-bottom:26px}
  .eyebrow{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:8px}
  h1{font-size:clamp(26px,5vw,36px);line-height:1.1}
  .lede{margin-top:10px;color:var(--ink-2)}
  .meta{margin-top:12px;font-size:13px;color:var(--muted)}
  .guide{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin-bottom:30px}
  .guide h2{font-size:18px;color:var(--red);margin-bottom:12px}
  .guide ol{margin-left:20px}
  .guide li{margin:8px 0;color:var(--ink-2)}
  h2{font-size:22px;margin:0 0 14px}
  section{margin-bottom:34px}
  .n{font-size:14px;color:var(--muted);font-weight:400}
  ol.prompts{margin-left:22px}
  ol.prompts li{margin:9px 0;padding-left:4px}
  .banks h2{border-bottom:1px solid var(--line);padding-bottom:6px}
  .chips{display:flex;flex-wrap:wrap;gap:7px;margin:4px 0 8px}
  .chip{display:inline-block;font-size:14px;padding:4px 11px;border-radius:13px;background:#efe7e8;color:var(--red-dark)}
  ul.poetic{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  ul.poetic li{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px}
  ul.poetic .mood{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
  ul.poetic .def{font-size:13.5px;color:var(--ink-2)}
  footer{margin-top:30px;border-top:1px solid var(--line);padding-top:16px;font-size:13px;color:var(--muted)}
  @media print{ body{background:#fff} .guide,.chip,ul.poetic li{border-color:#ccc} }
  @media (max-width:560px){ ul.poetic{grid-template-columns:1fr} }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">Become a Writer Today</div>
    <h1>Prompt and Word-Bank Pack</h1>
    <p class="lede">${totals.prompts} writing prompts organised by genre, plus ${totals.words} vivid words in five banks to break a blank page open. Built for drafting, not for browsing.</p>
    <p class="meta">Version ${PRODUCT.version}. Compiled ${esc(builtOn)}. Print it, or keep it open beside your draft.</p>
  </header>

  <div class="guide">
    <h2>${esc(HOWTO_TITLE)}</h2>
    <ol>${HOWTO_STEPS.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  </div>

  <h2 style="color:var(--red);font-size:15px;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid var(--line);padding-bottom:6px">Part one: ${totals.prompts} prompts</h2>
  ${section("Fiction", prompts.fiction)}
  ${section("Flash fiction", prompts.flash)}
  ${section("Poetry", prompts.poetry)}
  ${section("Nonfiction and essay", prompts.nonfiction)}

  <h2 style="color:var(--red);font-size:15px;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid var(--line);padding-bottom:6px">Part two: word banks (${totals.words} words)</h2>
  <div class="banks">
    <section><h2>Descriptive words <span class="n">${banks.descriptive.length}</span></h2>${wordChips(banks.descriptive)}</section>
    <section><h2>Sensory words <span class="n">${banks.sensory.length}</span></h2>${wordChips(banks.sensory)}</section>
    <section><h2>Action verbs <span class="n">${banks.actionVerbs.length}</span></h2>${wordChips(banks.actionVerbs)}</section>
    <section><h2>Emotion words <span class="n">${banks.emotionWords.length}</span></h2>${wordChips(banks.emotionWords)}</section>
    <section><h2>Poetic words <span class="n">${banks.poeticWords.length}</span></h2>${poeticList(banks.poeticWords)}</section>
  </div>

  <footer>
    Prompt and Word-Bank Pack v${PRODUCT.version}. Compiled by Become a Writer Today. Word banks are drawn from the site's own writing tools. Use them freely in your own drafts.
  </footer>
</div>
</body>
</html>`;
}

function renderMarkdown({ prompts, banks, builtOn, totals }) {
  const lines = [];
  lines.push(`# Prompt and Word-Bank Pack`);
  lines.push("");
  lines.push(`Version ${PRODUCT.version}. Compiled ${builtOn}.`);
  lines.push("");
  lines.push(`${totals.prompts} writing prompts organised by genre, plus ${totals.words} vivid words in five banks to break a blank page open.`);
  lines.push("");
  lines.push(`## ${HOWTO_TITLE}`);
  lines.push("");
  HOWTO_STEPS.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push("");
  lines.push(`## Part one: ${totals.prompts} prompts`);
  const promptSection = (title, items) => {
    lines.push("");
    lines.push(`### ${title} (${items.length})`);
    lines.push("");
    items.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  };
  promptSection("Fiction", prompts.fiction);
  promptSection("Flash fiction", prompts.flash);
  promptSection("Poetry", prompts.poetry);
  promptSection("Nonfiction and essay", prompts.nonfiction);
  lines.push("");
  lines.push(`## Part two: word banks (${totals.words} words)`);
  const bankSection = (title, words) => {
    lines.push("");
    lines.push(`### ${title} (${words.length})`);
    lines.push("");
    lines.push(words.join(", "));
  };
  bankSection("Descriptive words", banks.descriptive);
  bankSection("Sensory words", banks.sensory);
  bankSection("Action verbs", banks.actionVerbs);
  bankSection("Emotion words", banks.emotionWords);
  lines.push("");
  lines.push(`### Poetic words (${banks.poeticWords.length})`);
  lines.push("");
  banks.poeticWords.forEach((p) => lines.push(`- **${p.word}** (${p.mood}): ${p.definition}`));
  lines.push("");
  lines.push(`---`);
  lines.push(`Prompt and Word-Bank Pack v${PRODUCT.version}. Compiled by Become a Writer Today. Word banks are drawn from the site's own writing tools.`);
  lines.push("");
  return lines.join("\n");
}

// Pure content generator. Returns counts + rendered artefacts.
export async function build({ outDir } = {}) {
  const banks = await extractWordBanks();
  const prompts = await generatePrompts(banks);

  const promptCount =
    prompts.fiction.length + prompts.flash.length + prompts.poetry.length + prompts.nonfiction.length;
  const wordCount =
    banks.descriptive.length + banks.sensory.length + banks.actionVerbs.length +
    banks.emotionWords.length + banks.poeticWords.length;

  const totals = { prompts: promptCount, words: wordCount };
  const builtOn = new Date().toISOString().slice(0, 10);

  const html = renderHtml({ prompts, banks, builtOn, totals });
  const md = renderMarkdown({ prompts, banks, builtOn, totals });

  // Fail loud on any fancy dash in either artefact.
  for (const [label, doc] of [["html", html], ["markdown", md]]) {
    if (FANCY_DASH.test(doc)) {
      throw new Error(`build-prompt-pack: en/em dash leaked into ${label} output`);
    }
  }

  let htmlPath = null;
  let mdPath = null;
  if (outDir) {
    await mkdir(outDir, { recursive: true });
    htmlPath = path.join(outDir, PRODUCT.htmlName);
    mdPath = path.join(outDir, PRODUCT.mdName);
    await writeFile(htmlPath, html, "utf8");
    await writeFile(mdPath, md, "utf8");
  }

  return {
    promptCount,
    wordCount,
    counts: {
      fiction: prompts.fiction.length,
      flash: prompts.flash.length,
      poetry: prompts.poetry.length,
      nonfiction: prompts.nonfiction.length,
      descriptive: banks.descriptive.length,
      sensory: banks.sensory.length,
      actionVerbs: banks.actionVerbs.length,
      emotionWords: banks.emotionWords.length,
      poeticWords: banks.poeticWords.length,
    },
    html,
    md,
    htmlPath,
    mdPath,
    builtOn,
  };
}

// CLI tail: build to build-output/ then package the zip (HTML + markdown).
async function main() {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);

  const outDir = path.join(REPO_ROOT, "build-output");
  const res = await build({ outDir });
  console.log(`Prompt pack: ${res.promptCount} prompts, ${res.wordCount} words`);
  console.log(`  counts: ${JSON.stringify(res.counts)}`);
  console.log(`  -> ${res.htmlPath}`);
  console.log(`  -> ${res.mdPath}`);

  const zipPath = path.join(outDir, PRODUCT.zip);
  await run("zip", ["-j", "-q", zipPath, res.htmlPath, res.mdPath], { cwd: outDir });
  console.log(`Packaged ${zipPath}`);
  console.log(`Upload with: NETLIFY_SITE_ID=... NETLIFY_AUTH_TOKEN=... node scripts/upload-products.mjs`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
