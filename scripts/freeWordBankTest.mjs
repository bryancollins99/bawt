// scripts/freeWordBankTest.mjs
//
// Self-test for the FREE lead magnet build (build-free-word-bank.mjs).
// Asserts the rendered HTML is the real deliverable:
//   - all eight category headings present,
//   - 800+ words total, counted on the rendered chips (not just the JS sum),
//   - zero en or em dashes,
//   - the two soft CTAs present (free newsletter + $12 paid pack),
//   - the paid-pack Stripe checkout URL present,
//   - the brand palette (cream #f6f4ef, red #b23a48) present,
//   - self-contained (no external scripts / stylesheets / web fonts).
//
// Wired into `npm test`. Deterministic: the build uses no randomness, so the
// asserted counts are stable across runs.

import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { build, PRODUCT, CATEGORY_ORDER } from "./build-free-word-bank.mjs";

const FANCY_DASH = /[–—]/; // en dash, em dash
const STRIPE_URL = "https://buy.stripe.com/3cIaEY4zZ7mj34281GbZe0A";

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  let passed = 0;
  const ok = (label) => {
    passed += 1;
    console.log(`  ok  ${label}`);
  };

  const tmp = await mkdtemp(path.join(os.tmpdir(), "bawt-word-bank-"));
  try {
    const res = await build({ outDir: tmp });

    // File was written.
    const htmlPath = path.join(tmp, PRODUCT.htmlName);
    assert.ok(await exists(htmlPath), "word bank HTML file was written");
    const html = await readFile(htmlPath, "utf8");
    ok("build writes the HTML file");

    // Exactly eight categories, all headings present in the rendered HTML.
    assert.equal(CATEGORY_ORDER.length, 8, "there are eight categories");
    for (const heading of CATEGORY_ORDER) {
      assert.ok(html.includes(`>${heading} `), `HTML renders the "${heading}" section heading`);
    }
    ok(`all 8 category headings present (${CATEGORY_ORDER.join(", ")})`);

    // 800+ words total, counted on the rendered chips (catches a render bug the
    // JS-side sum would miss).
    const renderedChips = (html.match(/class="chip"/g) || []).length;
    assert.ok(
      renderedChips >= 800,
      `HTML renders 800+ word chips (got ${renderedChips})`,
    );
    assert.equal(
      renderedChips,
      res.totalWords,
      `rendered chip count (${renderedChips}) matches reported total (${res.totalWords})`,
    );
    ok(`800+ words rendered as chips (${renderedChips} total)`);

    // Every category is non-trivial.
    for (const heading of CATEGORY_ORDER) {
      assert.ok(res.counts[heading] >= 15, `"${heading}" has a real bank (got ${res.counts[heading]})`);
    }
    ok("every category bank is non-trivial (>=15 words each)");

    // Zero fancy dashes.
    assert.ok(!FANCY_DASH.test(html), "HTML has no en or em dash");
    ok("no en or em dashes anywhere");

    // Two soft CTAs: free newsletter + paid pack, with the live Stripe URL.
    assert.ok(/newsletter/i.test(html), "HTML has the free newsletter CTA");
    assert.ok(html.includes(STRIPE_URL), "HTML has the paid-pack Stripe checkout URL");
    assert.ok(/\$12/.test(html), "HTML names the $12 price");
    ok("both CTAs present (free newsletter + $12 paid pack upsell)");

    // Brand palette.
    assert.ok(html.includes("#f6f4ef") && html.includes("#b23a48"), "HTML uses the brand palette");
    ok("brand palette present (cream #f6f4ef, red #b23a48)");

    // Self-contained: no external resources (printable, deploy-anywhere).
    assert.ok(!/<script[^>]+src=/.test(html), "no external script tags");
    assert.ok(!/<link[^>]+stylesheet/.test(html), "no external stylesheets");
    assert.ok(!/https?:\/\/(cdn|unpkg|jsdelivr|fonts\.googleapis)/.test(html), "no CDN or web-font deps");
    ok("self-contained (no external scripts, stylesheets, or web fonts)");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  console.log(`\nfreeWordBankTest: ${passed} checks passed.`);
}

run().catch((e) => {
  console.error("\nfreeWordBankTest FAILED:", e.message);
  process.exit(1);
});
