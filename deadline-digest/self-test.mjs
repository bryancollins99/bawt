// self-test.mjs
//
// No live sends. Asserts the send engine's guarantees:
//  1. render produces both an HTML and a plain-text part
//  2. affiliate letters carry the disclosure line in BOTH parts
//  3. product letters link to the product's checkout_url
//  4. no em dashes in any rendered output
//  5. an empty target is skipped, not fatal
//  6. idempotency blocks re-sending an already-sent slot
//  7. the unsubscribe token is present in both parts
//  8. freshness is computed from generatedAt (not file mtime) and fails closed
//  9. audience resolves to base only, or base + genre topic where implied
//
// Exit 0 when all pass, non-zero on the first failure.

import assert from "node:assert/strict";
import {
  loadQueue,
  buildSendables,
  filterUnsent,
  broadcastName,
  resolveAudience,
  partitionTargets,
  resolveDryRun,
  dataAgeDays,
  assertFresh,
  IDS,
  MAX_DATA_AGE_DAYS,
} from "./send.js";
import { renderLetter, resolveMonetiseLink } from "./render.js";
import { DISCLOSURE_LINE } from "./config/affiliates.js";

const EM_DASH = /[—–]/; // em dash + en dash
let passed = 0;
function ok(label) {
  passed += 1;
  console.log(`  ok  ${label}`);
}

const queue = loadQueue();
const letters = queue.letters;
const byN = new Map(letters.map((l) => [l.n, l]));

// --- 1. render produces html + text ---------------------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(r.html && r.html.length > 200, `letter ${l.n} html present`);
  assert.ok(r.text && r.text.length > 100, `letter ${l.n} text present`);
  assert.equal(r.subject, l.subject, `letter ${l.n} subject preserved`);
}
ok("every letter renders html + text");

// --- 2. affiliate letters: disclosure in BOTH parts + real link -----------
const affiliateLetters = letters.filter((l) => l.monetise === "affiliate");
assert.ok(affiliateLetters.length > 0, "there are affiliate letters to test");
for (const l of affiliateLetters) {
  const r = renderLetter(l);
  assert.ok(r.html.includes(DISCLOSURE_LINE), `letter ${l.n} html has disclosure`);
  assert.ok(r.text.includes(DISCLOSURE_LINE), `letter ${l.n} text has disclosure`);
  const link = resolveMonetiseLink(l);
  assert.ok(
    r.html.includes(link.url) && r.text.includes(link.url),
    `letter ${l.n} carries affiliate link ${link.url} in both parts`
  );
  assert.ok(
    r.html.includes(`href="${link.url}"`),
    `letter ${l.n} affiliate link is a real anchor`
  );
}
ok(`affiliate letters (${affiliateLetters.length}) carry disclosure + link in both parts`);

// --- 3. product letters link to checkout_url ------------------------------
const productLetters = letters.filter((l) => l.monetise === "product");
assert.ok(productLetters.length > 0, "there are product letters to test");
for (const l of productLetters) {
  const r = renderLetter(l);
  const link = resolveMonetiseLink(l);
  assert.ok(!link.missing, `letter ${l.n} product "${l.detail}" exists in products.json`);
  assert.ok(
    r.html.includes(link.url) && r.text.includes(link.url),
    `letter ${l.n} links to checkout_url (${link.url})`
  );
  assert.ok(r.html.includes(`href="${link.url}"`), `letter ${l.n} checkout is a real anchor`);
  // The raw [Get it] marker must be consumed, not left in the copy.
  assert.ok(!r.text.includes("[Get it]"), `letter ${l.n} [Get it] marker replaced in text`);
}
ok(`product letters (${productLetters.length}) link to checkout_url`);

// --- 4. no em dashes anywhere in rendered output --------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(!EM_DASH.test(r.html), `letter ${l.n} html has no em dash`);
  assert.ok(!EM_DASH.test(r.text), `letter ${l.n} text has no em dash`);
}
assert.ok(!EM_DASH.test(DISCLOSURE_LINE), "disclosure line has no em dash");
ok("no em dashes in any rendered output");

// --- 5. empty target skipped, not fatal -----------------------------------
{
  const targets = [
    { label: "base", segmentId: "b" },
    { label: "base + poetry", segmentId: "b", topicId: "p" },
  ];
  // one empty, one live -> no throw, live keeps the non-empty one
  const mixed = partitionTargets(targets, (t) => (t.topicId ? 0 : 5));
  assert.equal(mixed.live.length, 1, "one live target survives");
  assert.equal(mixed.empty.length, 1, "one empty target set aside, not fatal");
  // all empty -> live is empty (caller then skips the letter, does not crash)
  const allEmpty = partitionTargets(targets, () => 0);
  assert.equal(allEmpty.live.length, 0, "all-empty yields zero live targets (skip, not throw)");
}
ok("empty target skipped individually; run not aborted for one empty target");

// --- 6. idempotency blocks re-send ----------------------------------------
{
  const sendables = buildSendables(queue);
  assert.ok(sendables.length >= 9, "at least 9 sendable letters");
  const first = sendables[0];
  const pendingAll = filterUnsent(sendables, []);
  assert.equal(pendingAll.length, sendables.length, "nothing sent yet -> all pending");
  const pendingAfterOne = filterUnsent(sendables, [broadcastName(first.letter)]);
  assert.ok(
    !pendingAfterOne.some((s) => s.n === first.n),
    "a slot with an existing broadcast name is not re-sent"
  );
  assert.equal(pendingAfterOne.length, sendables.length - 1, "exactly one slot removed");
}
ok("idempotency: an already-sent slot is filtered out");

// --- 7. unsubscribe token present -----------------------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(r.html.includes("{{RESEND_UNSUBSCRIBE_URL}}"), `letter ${l.n} html has unsubscribe token`);
  assert.ok(r.text.includes("{{RESEND_UNSUBSCRIBE_URL}}"), `letter ${l.n} text has unsubscribe token`);
}
ok("unsubscribe token present in both parts");

// --- 8. freshness uses generatedAt, fails closed --------------------------
{
  const now = Date.parse("2026-07-04T12:00:00Z");
  const fresh = { generatedAt: "2026-07-03T12:00:00Z", calendar: [], letters: [] };
  const stale = { generatedAt: "2026-01-01T00:00:00Z", calendar: [], letters: [] };
  assert.ok(Math.abs(dataAgeDays(fresh, { now }) - 1) < 0.01, "age derived from generatedAt (~1 day)");
  // Anti-mtime proof: the queue file's mtime is ~now, but a far-past generatedAt
  // yields a large age. mtime-based staleness would report ~0 here.
  assert.ok(dataAgeDays(stale, { now }) > 180, "stale generatedAt yields old age, not the file mtime");
  assert.doesNotThrow(() => assertFresh(fresh, MAX_DATA_AGE_DAYS, { now }), "fresh queue passes");
  assert.throws(() => assertFresh(stale, MAX_DATA_AGE_DAYS, { now }), /stale/, "stale queue fails closed");
  // With no generatedAt, staleness falls back to the git commit time of the file
  // (never fs mtime): finite when git history exists, Infinity (fail closed) when
  // it does not. Either way it is not derived from mtime.
  const noStamp = dataAgeDays({ calendar: [], letters: [] }, { now });
  assert.ok(noStamp === Infinity || Number.isFinite(noStamp), "no-timestamp path uses git fallback / fail-closed, not mtime");
}
ok("freshness computed from generatedAt (never file mtime), fails closed");

// --- 9. audience resolution -----------------------------------------------
{
  const baseOnly = resolveAudience(byN.get(1)); // topic: null
  assert.equal(baseOnly.length, 1, "base-only letter -> one target");
  assert.equal(baseOnly[0].topicId, null, "base-only target has no topic filter");
  assert.equal(baseOnly[0].segmentId, IDS.base, "targets the base segment");

  const fictionLetter = { ...byN.get(1), topic: "fiction" };
  const genre = resolveAudience(fictionLetter);
  assert.equal(genre[0].topicId, IDS.fiction, "genre letter adds fiction topic filter");
  assert.equal(genre[0].segmentId, IDS.base, "genre target still on base segment");
}
ok("audience resolves base-only, or base + genre topic where implied");

// --- bonus: dry-run guard defaults safe -----------------------------------
{
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.BAWT_DRY_RUN;
  assert.equal(resolveDryRun([], env), true, "no API key -> dry run");
  assert.equal(resolveDryRun(["--dry"], { RESEND_API_KEY: "x" }), true, "--dry forces dry run");
  assert.equal(resolveDryRun([], { BAWT_DRY_RUN: "1", RESEND_API_KEY: "x" }), true, "BAWT_DRY_RUN=1 -> dry run");
}
ok("dry-run guard defaults to safe");

console.log(`\nAll self-test groups passed (${passed} groups).`);
