// scripts/productBuildTest.mjs
//
// Self-test for the two digital-product build scripts. Runs both `build()`
// generators to a throwaway temp dir and asserts the outputs are non-trivial:
//   - Writers' Deadline Database: HTML embeds the contest records AND carries the
//     search box, every filter control, and the sortable column headers.
//   - Prompt / Word-Bank Pack: 200+ prompts, all five word-bank sections present,
//     both HTML and markdown emitted.
//   - Neither output contains an em or en dash.
//
// Wired into `npm test`. Deterministic: the builds use no randomness, so the
// asserted counts are stable across runs.

import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { build as buildDeadlineDb, PRODUCT as DB_PRODUCT } from "./build-deadline-database.mjs";
import { build as buildPromptPack, PRODUCT as PACK_PRODUCT } from "./build-prompt-pack.mjs";

const FANCY_DASH = /[–—]/;

let passed = 0;
function ok(label) {
  passed += 1;
  console.log(`  ok  ${label}`);
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "bawt-product-build-"));
  try {
    // ------------------------------------------------------------------
    // Product 1: Writers' Deadline Database
    // ------------------------------------------------------------------
    {
      const res = await buildDeadlineDb({ outDir: tmp });

      assert.ok(res.records >= 40, `deadline DB embeds a real dataset (>=40 records, got ${res.records})`);
      const htmlPath = path.join(tmp, DB_PRODUCT.htmlName);
      assert.ok(await exists(htmlPath), "deadline DB HTML file was written");
      const html = await readFile(htmlPath, "utf8");

      // Embedded data present, and every record is actually in the payload.
      assert.ok(html.includes("var DATA = ["), "deadline DB HTML embeds the JSON dataset");
      const embeddedNames = (html.match(/"name":/g) || []).length;
      assert.ok(
        embeddedNames >= res.records,
        `deadline DB embeds all ${res.records} records (found ${embeddedNames} name fields)`,
      );

      // Search box + filter controls + sort headers present.
      assert.ok(/id="q"/.test(html), "deadline DB has the search input");
      assert.ok(/id="genre"/.test(html), "deadline DB has the genre filter");
      assert.ok(/id="region"/.test(html), "deadline DB has the region filter");
      assert.ok(/id="freeOnly"/.test(html), "deadline DB has the free-entry filter");
      assert.ok(/id="cashOnly"/.test(html), "deadline DB has the cash-prize filter");
      assert.ok(/data-sort="deadline"/.test(html), "deadline DB has a sort-by-deadline header");
      assert.ok(/data-sort="prizeValue"/.test(html), "deadline DB has a sort-by-prize header");
      assert.ok(/daysLeft/.test(html), "deadline DB computes days-left on load");

      // Self-contained: no external/CDN resource references.
      assert.ok(!/<script[^>]+src=/.test(html), "deadline DB has no external script tags");
      assert.ok(!/<link[^>]+stylesheet/.test(html), "deadline DB has no external stylesheets");
      assert.ok(!/https?:\/\/(cdn|unpkg|jsdelivr|fonts\.googleapis)/.test(html), "deadline DB has no CDN deps");

      // Brand palette.
      assert.ok(html.includes("#f6f4ef") && html.includes("#b23a48"), "deadline DB uses the brand palette");

      // No fancy dashes anywhere (UI copy + embedded data).
      assert.ok(!FANCY_DASH.test(html), "deadline DB output has no em/en dash");

      ok(`Writers' Deadline Database builds (${res.records} records, self-contained, brand-matched, dash-clean)`);
    }

    // ------------------------------------------------------------------
    // Product 2: Prompt / Word-Bank Pack
    // ------------------------------------------------------------------
    {
      const res = await buildPromptPack({ outDir: tmp });

      assert.ok(res.promptCount >= 200, `prompt pack has 200+ prompts (got ${res.promptCount})`);
      assert.ok(res.wordCount >= 200, `prompt pack has a few hundred words (got ${res.wordCount})`);

      // Every genre bucket is non-trivial.
      for (const g of ["fiction", "flash", "poetry", "nonfiction"]) {
        assert.ok(res.counts[g] >= 20, `prompt pack has real ${g} prompts (got ${res.counts[g]})`);
      }
      // Every word bank is non-empty.
      for (const b of ["descriptive", "sensory", "actionVerbs", "emotionWords", "poeticWords"]) {
        assert.ok(res.counts[b] >= 20, `prompt pack has a real ${b} bank (got ${res.counts[b]})`);
      }

      const htmlPath = path.join(tmp, PACK_PRODUCT.htmlName);
      const mdPath = path.join(tmp, PACK_PRODUCT.mdName);
      assert.ok(await exists(htmlPath), "prompt pack HTML file was written");
      assert.ok(await exists(mdPath), "prompt pack markdown file was written");
      const html = await readFile(htmlPath, "utf8");
      const md = await readFile(mdPath, "utf8");

      // Prompt count actually present in the HTML (each prompt is one <li>).
      const htmlPrompts = (html.match(/<li>/g) || []).length;
      assert.ok(htmlPrompts >= 200, `prompt pack HTML renders 200+ prompt items (got ${htmlPrompts})`);

      // All five word-bank sections present in both artefacts.
      for (const heading of ["Descriptive words", "Sensory words", "Action verbs", "Emotion words", "Poetic words"]) {
        assert.ok(html.includes(heading), `prompt pack HTML has the "${heading}" bank`);
        assert.ok(md.includes(heading), `prompt pack markdown has the "${heading}" bank`);
      }
      // The drafting-session guide is present.
      assert.ok(html.includes("drafting session") && md.includes("drafting session"), "prompt pack has the how-to guide");

      // No fancy dashes in either artefact.
      assert.ok(!FANCY_DASH.test(html), "prompt pack HTML has no em/en dash");
      assert.ok(!FANCY_DASH.test(md), "prompt pack markdown has no em/en dash");

      ok(`Prompt / Word-Bank Pack builds (${res.promptCount} prompts, ${res.wordCount} words, HTML + markdown, dash-clean)`);
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  console.log(`\nproductBuildTest: ${passed} checks passed.`);
}

run().catch((e) => {
  console.error("\nproductBuildTest FAILED:", e.message);
  process.exit(1);
});
