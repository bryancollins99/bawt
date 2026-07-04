// self-test.mjs
//
// No live sends. Asserts the send engine's guarantees for BOTH templates:
//
// Evergreen letter:
//  1. render produces both an HTML and a plain-text part
//  2. EVERY letter carries an affiliate P.S. AND a product P.P.S. in both parts
//  3. affiliate letters carry the disclosure line in BOTH parts
//  4. product P.P.S. links to a LIVE checkout_url (not the PENDING placeholder)
//  5. clean hyperlinks: no raw URL in the visible HTML copy (URL only in href)
//  6. no em dashes in any rendered output
//  7. empty target skipped, not fatal
//  8. idempotency blocks re-sending an already-sent slot
//  9. unsubscribe token present in both parts
// 10. freshness from generatedAt (not mtime), fails closed
// 11. audience resolves base only, or base + genre topic where implied
// 12. dry-run guard + weekday routing (Thu -> digest, else letter)
//
// Deadline Digest (Thursday):
// 13. selection excludes stale + past, keeps in-window, sorts soonest-first
// 14. empty selection is skippable (not fatal)
// 15. organiser links present; affiliate P.S. + product P.P.S.; no em dashes
// 16. contests freshness guard fires on stale data (git time, not mtime)
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
  resolveKind,
  dataAgeDays,
  assertFresh,
  IDS,
  MAX_DATA_AGE_DAYS,
} from "./send.js";
import { renderLetter, resolveProductUrl } from "./render.js";
import { affiliateLink, DISCLOSURE_LINE } from "./config/affiliates.js";
import {
  loadContests,
  selectContests,
  shouldSkipDigest,
  renderDigest,
  digestProduct,
  contestsAgeDays,
  assertContestsFresh,
  CONTESTS_MAX_AGE_DAYS,
} from "./render-digest.js";

const EM_DASH = /[—–]/; // em dash + en dash
const PENDING = "STRIPE_CHECKOUT_PENDING";
let passed = 0;
function ok(label) {
  passed += 1;
  console.log(`  ok  ${label}`);
}

// Strip HTML tags to inspect only the visible copy.
function visibleText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
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

// --- 2. dual monetisation: affiliate P.S. AND product P.P.S. in both parts -
for (const l of letters) {
  assert.ok(l.affiliate && l.affiliate.slug, `letter ${l.n} has an affiliate`);
  assert.ok(l.product && l.product.name, `letter ${l.n} has a product`);
  const r = renderLetter(l);
  const affUrl = affiliateLink(l.affiliate.slug);
  const prodUrl = resolveProductUrl(l.product.name);
  assert.ok(r.html.includes("P.S.") && r.html.includes(`href="${affUrl}"`), `letter ${l.n} html P.S. affiliate`);
  assert.ok(r.text.includes("P.S.") && r.text.includes(affUrl), `letter ${l.n} text P.S. affiliate`);
  assert.ok(r.html.includes("P.P.S.") && r.html.includes(`href="${prodUrl}"`), `letter ${l.n} html P.P.S. product`);
  assert.ok(r.text.includes("P.P.S.") && r.text.includes(prodUrl), `letter ${l.n} text P.P.S. product`);
}
ok("every letter carries affiliate P.S. + product P.P.S. in both parts");

// --- 3. affiliate disclosure in BOTH parts --------------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(r.html.includes(DISCLOSURE_LINE), `letter ${l.n} html has disclosure`);
  assert.ok(r.text.includes(DISCLOSURE_LINE), `letter ${l.n} text has disclosure`);
}
ok("affiliate disclosure present in both parts of every letter");

// --- 4. product P.P.S. links to a LIVE checkout_url -----------------------
for (const l of letters) {
  const url = resolveProductUrl(l.product.name);
  assert.ok(url && url !== PENDING, `letter ${l.n} product "${l.product.name}" has a live checkout_url`);
  assert.ok(/^https:\/\//.test(url), `letter ${l.n} checkout_url is a real https link`);
}
ok("every product P.P.S. links to a live (non-PENDING) checkout_url");

// --- 5. clean hyperlinks: no raw URL in visible HTML copy ------------------
for (const l of letters) {
  const vis = visibleText(renderLetter(l).html);
  assert.ok(!/https?:\/\//.test(vis), `letter ${l.n} visible HTML has no raw URL`);
  assert.ok(!/go\.becomeawritertoday\.com/.test(vis), `letter ${l.n} visible HTML has no bare go-domain`);
  assert.ok(!/buy\.stripe\.com/.test(vis), `letter ${l.n} visible HTML has no bare stripe URL`);
}
ok("clean hyperlinks: URLs live only in href, never in visible HTML copy");

// --- 6. no em dashes anywhere in rendered output --------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(!EM_DASH.test(r.html), `letter ${l.n} html has no em dash`);
  assert.ok(!EM_DASH.test(r.text), `letter ${l.n} text has no em dash`);
}
assert.ok(!EM_DASH.test(DISCLOSURE_LINE), "disclosure line has no em dash");
ok("no em dashes in any rendered letter output");

// --- 7. empty target skipped, not fatal -----------------------------------
{
  const targets = [
    { label: "base", segmentId: "b" },
    { label: "base + poetry", segmentId: "b", topicId: "p" },
  ];
  const mixed = partitionTargets(targets, (t) => (t.topicId ? 0 : 5));
  assert.equal(mixed.live.length, 1, "one live target survives");
  assert.equal(mixed.empty.length, 1, "one empty target set aside, not fatal");
  const allEmpty = partitionTargets(targets, () => 0);
  assert.equal(allEmpty.live.length, 0, "all-empty yields zero live targets (skip, not throw)");
}
ok("empty target skipped individually; run not aborted for one empty target");

// --- 8. idempotency blocks re-send ----------------------------------------
{
  const sendables = buildSendables(queue);
  assert.ok(sendables.length >= 9, "at least 9 sendable letters");
  const first = sendables[0];
  const pendingAll = filterUnsent(sendables, []);
  assert.equal(pendingAll.length, sendables.length, "nothing sent yet -> all pending");
  const pendingAfterOne = filterUnsent(sendables, [broadcastName(first.letter)]);
  assert.ok(!pendingAfterOne.some((s) => s.n === first.n), "a sent slot is not re-sent");
  assert.equal(pendingAfterOne.length, sendables.length - 1, "exactly one slot removed");
}
ok("idempotency: an already-sent slot is filtered out");

// --- 9. unsubscribe token present -----------------------------------------
for (const l of letters) {
  const r = renderLetter(l);
  assert.ok(r.html.includes("{{RESEND_UNSUBSCRIBE_URL}}"), `letter ${l.n} html unsubscribe token`);
  assert.ok(r.text.includes("{{RESEND_UNSUBSCRIBE_URL}}"), `letter ${l.n} text unsubscribe token`);
}
ok("unsubscribe token present in both parts");

// --- 10. freshness uses generatedAt, fails closed -------------------------
{
  const now = Date.parse("2026-07-04T12:00:00Z");
  const fresh = { generatedAt: "2026-07-03T12:00:00Z", calendar: [], letters: [] };
  const stale = { generatedAt: "2026-01-01T00:00:00Z", calendar: [], letters: [] };
  assert.ok(Math.abs(dataAgeDays(fresh, { now }) - 1) < 0.01, "age derived from generatedAt (~1 day)");
  assert.ok(dataAgeDays(stale, { now }) > 180, "stale generatedAt yields old age, not the file mtime");
  assert.doesNotThrow(() => assertFresh(fresh, MAX_DATA_AGE_DAYS, { now }), "fresh queue passes");
  assert.throws(() => assertFresh(stale, MAX_DATA_AGE_DAYS, { now }), /stale/, "stale queue fails closed");
}
ok("freshness computed from generatedAt (never file mtime), fails closed");

// --- 11. audience resolution ----------------------------------------------
{
  const baseOnly = resolveAudience(byN.get(1));
  assert.equal(baseOnly.length, 1, "base-only letter -> one target");
  assert.equal(baseOnly[0].topicId, null, "base-only target has no topic filter");
  assert.equal(baseOnly[0].segmentId, IDS.base, "targets the base segment");
  const genre = resolveAudience({ ...byN.get(1), topic: "fiction" });
  assert.equal(genre[0].topicId, IDS.fiction, "genre letter adds fiction topic filter");
  assert.equal(genre[0].segmentId, IDS.base, "genre target still on base segment");
}
ok("audience resolves base-only, or base + genre topic where implied");

// --- 12. dry-run guard + weekday routing ----------------------------------
{
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.BAWT_DRY_RUN;
  assert.equal(resolveDryRun([], env), true, "no API key -> dry run");
  assert.equal(resolveDryRun(["--dry"], { RESEND_API_KEY: "x" }), true, "--dry forces dry run");
  assert.equal(resolveDryRun([], { BAWT_DRY_RUN: "1", RESEND_API_KEY: "x" }), true, "BAWT_DRY_RUN=1 -> dry run");

  const thu = Date.parse("2026-07-09T12:00:00Z"); // Thursday
  const mon = Date.parse("2026-07-06T12:00:00Z"); // Monday
  assert.equal(resolveKind([], { now: thu }), "digest", "Thursday routes to the digest");
  assert.equal(resolveKind([], { now: mon }), "letter", "Mon/Wed/Fri route to the letter");
  assert.equal(resolveKind(["--digest"], { now: mon }), "digest", "--digest overrides");
  assert.equal(resolveKind(["--letter"], { now: thu }), "letter", "--letter overrides");
}
ok("dry-run guard safe by default; Thursday routes to digest, else letter");

// --- 13/14/15. Deadline Digest --------------------------------------------
{
  const now = Date.parse("2026-07-04T12:00:00Z");
  const contests = [
    { name: "Alpha Prize", type: "contest", genres: ["flash-fiction"], fee: "$10", freeEntry: false, deadline: "2026-07-10", prize: "$1,000", url: "https://alpha.example/prize", region: "worldwide" },
    { name: "Bravo Award", genres: ["poetry"], freeEntry: true, deadline: "2026-07-20", prize: "$500", url: "https://bravo.example", region: "worldwide" },
    { name: "Stale One", genres: ["essay"], deadline: "2026-07-08", url: "https://stale.example", stale: true },
    { name: "Past One", genres: ["poetry"], deadline: "2026-06-01", url: "https://past.example" },
    { name: "FarOut Grant", genres: ["novel"], deadline: "2026-10-31", url: "https://far.example" },
  ];
  const selected = selectContests(contests, { now });
  assert.equal(selected.length, 2, "selection keeps only the two in-window, non-stale, future contests");
  assert.equal(selected[0].name, "Alpha Prize", "sorted soonest-first");
  assert.equal(selected[1].name, "Bravo Award", "second is the later in-window one");
  assert.ok(!selected.some((c) => c.stale), "stale excluded");
  assert.ok(!selected.some((c) => c.name === "Past One"), "past-dated excluded");
  assert.ok(!selected.some((c) => c.name === "FarOut Grant"), "beyond-window excluded");

  assert.equal(shouldSkipDigest(selectContests([], { now })), true, "empty selection is skippable");
  assert.equal(shouldSkipDigest(selected), false, "non-empty selection is not skipped");

  // dash-laden live-style data must not leak em/en dashes into the digest
  const dashy = [
    { name: "Bridport Prize — Poetry", genres: ["poetry"], deadline: "2026-07-12", prize: "£2,000–£12,000", fee: "£9–£12", region: "worldwide", url: "https://bridport.example" },
  ];
  const rDash = renderDigest(selectContests(dashy, { now }), { now });
  assert.ok(!EM_DASH.test(rDash.html), "digest sanitizes em/en dashes from contest names/prizes (html)");
  assert.ok(!EM_DASH.test(rDash.text), "digest sanitizes em/en dashes from contest names/prizes (text)");
  assert.ok(!EM_DASH.test(rDash.subject), "digest subject sanitizes dashes");
  assert.ok(rDash.html.includes("Bridport Prize - Poetry"), "em dash in name becomes a hyphen");

  const r = renderDigest(selected, { now });
  assert.ok(r.html && r.text, "digest renders html + text");
  assert.ok(r.html.includes('href="https://alpha.example/prize"'), "digest links to organiser (alpha)");
  assert.ok(r.html.includes('href="https://bravo.example"'), "digest links to organiser (bravo)");
  assert.ok(r.text.includes("https://alpha.example/prize"), "digest text carries organiser URL");
  assert.ok(r.html.includes(DISCLOSURE_LINE) && r.text.includes(DISCLOSURE_LINE), "digest affiliate disclosure both parts");
  assert.ok(r.html.includes(`href="${affiliateLink("prowritingaid")}"`), "digest affiliate P.S. present");
  const dp = digestProduct();
  const dpUrl = resolveProductUrl(dp.name);
  assert.ok(dpUrl && dpUrl !== PENDING && /^https:\/\//.test(dpUrl), "digest product P.P.S. links to a live checkout");
  assert.ok(r.html.includes(`href="${dpUrl}"`), "digest P.P.S. anchor points to the live product");
  assert.ok(r.html.includes("P.S.") && r.html.includes("P.P.S."), "digest has both P.S. and P.P.S.");
  const vis = visibleText(r.html);
  assert.ok(!/https?:\/\//.test(vis), "digest visible HTML has no raw URL");
  assert.ok(!EM_DASH.test(r.html) && !EM_DASH.test(r.text), "digest has no em dashes");
}
ok("digest selects/sorts correctly, links to organisers, dual-monetises, clean + em-dash-free");

// --- 16. contests freshness guard (git time, not mtime) -------------------
{
  const now = Date.parse("2026-07-04T12:00:00Z");
  assert.ok(Math.abs(contestsAgeDays("2026-07-01T00:00:00Z", { now }) - 3.5) < 0.01, "contests age from commit ISO (~3.5 days)");
  assert.doesNotThrow(() => assertContestsFresh("2026-07-01T00:00:00Z", CONTESTS_MAX_AGE_DAYS, { now }), "fresh contests pass");
  assert.throws(() => assertContestsFresh("2026-05-01T00:00:00Z", CONTESTS_MAX_AGE_DAYS, { now }), /stale/, "stale contests fail closed");
  assert.throws(() => assertContestsFresh(null, CONTESTS_MAX_AGE_DAYS, { now }), /stale/, "unknown contests age fails closed");
}
ok("contests freshness guard fires on stale/unknown data (git commit time, not mtime)");

// --- 17. real contests dataset renders dash-free --------------------------
{
  // Render the entire live dataset (window wide open) and assert zero em/en
  // dashes survive into the email, even though the source data contains them.
  const all = loadContests();
  const wide = selectContests(all, { now: Date.parse("2020-01-01T00:00:00Z"), windowDays: 100000 });
  assert.ok(wide.length > 0, "real dataset yields selectable contests with a wide window");
  const r = renderDigest(wide, { now: Date.parse("2020-01-01T00:00:00Z"), windowDays: 100000 });
  assert.ok(!EM_DASH.test(r.html), "full real dataset renders dash-free (html)");
  assert.ok(!EM_DASH.test(r.text), "full real dataset renders dash-free (text)");
  assert.ok(!EM_DASH.test(r.subject), "full real dataset renders dash-free (subject)");
}
ok("full live contests.json renders the digest with zero em/en dashes");

console.log(`\nAll self-test groups passed (${passed} groups).`);
