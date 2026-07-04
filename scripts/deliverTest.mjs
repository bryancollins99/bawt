// scripts/deliverTest.mjs
//
// Delivery flow self-test. No live email, no real Stripe or Blobs calls:
// - Blobs store       -> in-memory stub (via __setStoreFactory)
// - Stripe line items -> injectable fetcher stub (via __setLineItemFetcher),
//                        the SAME path production uses for Payment Links
// - Resend            -> globalThis.fetch stub that captures the request
//
// Asserts:
//  1. valid checkout.session.completed -> correct slug + email queued w/ token
//  2. that token round-trips through download.js and streams the right slug
//  3. expired token  -> rejected (410)
//  4. tampered token -> rejected (403)
//  5. unknown price  -> 200, no send
//  6. unset secrets  -> dry path, no live Resend call
//  + unit checks: Stripe signature verify (valid/tampered), token round-trip.

import assert from "node:assert/strict";
import { handler as webhookHandler } from "../netlify/functions/stripe-webhook.js";
import { handler as downloadHandler } from "../netlify/functions/download.js";
import { handler as salesStatsHandler } from "../netlify/functions/sales-stats.js";
import {
  __setStoreFactory,
  __setLineItemFetcher,
  stripeSignatureHeader,
  verifyStripeSignature,
  mintToken,
  verifyToken,
  productForPrice,
  productForSlug,
  hashEmail,
  SALES_STORE_NAME,
  PRODUCTS,
} from "../netlify/functions/_deliver-lib.js";

const WEBHOOK_SECRET = "whsec_test_secret";
const TOKEN_SECRET = "token_test_secret";
const BASE = "https://tools.example.test";

const PRICE_FILLER = "price_1TpaMeK36rW7SrJyzjpudFG3"; // -> filler-word-pack
const EXPECTED = productForPrice(PRICE_FILLER);
const ALL_SLUGS = [
  "filler-word-pack",
  "claude-code-for-writers",
  "zettelkasten-kit",
  "writers-deadline-database",
  "prompt-word-bank-pack",
];

let passed = 0;
function ok(name) {
  passed++;
  console.log(`  ok  - ${name}`);
}

// --- In-memory Blobs stub, pre-loaded with each product's bytes ------------
const BLOB_BYTES = {
  "filler-word-pack": Buffer.from("PK filler-word-pack payload"),
  "claude-code-for-writers": Buffer.from("PK claude-code payload"),
  "zettelkasten-kit": Buffer.from("PK zettelkasten payload"),
};
function makeStubStore() {
  const map = new Map(Object.entries(BLOB_BYTES));
  return {
    async get(key, opts = {}) {
      const v = map.get(key);
      if (!v) return null;
      if (opts.type === "arrayBuffer") return v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength);
      return v;
    },
    async set(key, data) {
      map.set(key, Buffer.from(data));
    },
  };
}
// Two new products (plain-ASCII stub payloads; only distinctness matters here).
BLOB_BYTES["writers-deadline-database"] = Buffer.from("stub deadline-database payload");
BLOB_BYTES["prompt-word-bank-pack"] = Buffer.from("stub prompt-word-bank payload");

// Sales store stub: append-only, JSON values, list()-able.
function makeSalesStore() {
  const map = new Map();
  return {
    async set(key, data) {
      map.set(key, typeof data === "string" ? data : JSON.stringify(data));
    },
    async get(key, opts = {}) {
      const v = map.get(key);
      if (v == null) return null;
      return opts.type === "json" ? JSON.parse(v) : v;
    },
    async list() {
      return { blobs: [...map.keys()].map((key) => ({ key })) };
    },
    _map: map,
  };
}

// Dispatch by store name: product-sales -> salesStore, else product-downloads.
const productStore = makeStubStore();
let salesStore = makeSalesStore();
__setStoreFactory((name) => (name === SALES_STORE_NAME ? salesStore : productStore));

// --- Resend capture via globalThis.fetch -----------------------------------
const realFetch = globalThis.fetch;
let resendCalls = [];
globalThis.fetch = async (url, init = {}) => {
  if (String(url).startsWith("https://api.resend.com/")) {
    resendCalls.push({ url: String(url), init, body: JSON.parse(init.body || "{}") });
    return { ok: true, status: 200, json: async () => ({ id: "email_test" }), text: async () => "" };
  }
  throw new Error(`Unexpected live fetch in test: ${url}`);
};

// --- Stripe line-item fetcher stub (production path for Payment Links) ------
function stubLineItems(priceId) {
  __setLineItemFetcher(async () => ({ data: [{ price: { id: priceId } }] }));
}

// --- Helpers ---------------------------------------------------------------
function sessionEvent({
  email = "buyer@example.com",
  sessionId = "cs_test_123",
  slug,
  amount_total = 1900,
  currency = "usd",
  created = 1783000000,
} = {}) {
  // Payment Link session: NO inline line_items / price (mirrors reality). When a
  // slug is given it rides in metadata.slug (the PRIMARY, secret-key-free path);
  // otherwise the webhook falls back to price-id resolution. `created` + `id` are
  // the stable keys the sale log dedups on across Stripe re-deliveries.
  const object = { id: sessionId, created, customer_details: { email }, amount_total, currency };
  if (slug) object.metadata = { slug };
  return JSON.stringify({
    id: "evt_test",
    type: "checkout.session.completed",
    data: { object },
  });
}

function webhookEvent(raw, { sign = true } = {}) {
  const headers = {};
  if (sign) headers["stripe-signature"] = stripeSignatureHeader(WEBHOOK_SECRET, raw);
  return { httpMethod: "POST", headers, body: raw, isBase64Encoded: false };
}

function setLiveEnv() {
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.RESEND_API_KEY = "re_test_x";
  process.env.DELIVER_TOKEN_SECRET = TOKEN_SECRET;
  process.env.DELIVER_BASE_URL = BASE;
  delete process.env.BAWT_DRY_RUN;
}

function tokenFromLastResend() {
  const body = resendCalls.at(-1).body;
  const m = (body.text || "").match(/token=([^\s"&]+)/);
  assert.ok(m, "download token present in email body");
  return decodeURIComponent(m[1]);
}

// ===========================================================================
async function run() {
  // ---- unit: Stripe signature verify ----
  {
    const raw = sessionEvent();
    const header = stripeSignatureHeader(WEBHOOK_SECRET, raw);
    assert.equal(verifyStripeSignature(WEBHOOK_SECRET, raw, header), true);
    assert.equal(verifyStripeSignature(WEBHOOK_SECRET, raw + "x", header), false, "tampered body rejected");
    assert.equal(verifyStripeSignature("wrong_secret", raw, header), false, "wrong secret rejected");
    ok("Stripe signature verify (valid / tampered body / wrong secret)");
  }

  // ---- unit: token round-trip ----
  {
    const t = mintToken(TOKEN_SECRET, { slug: "filler-word-pack", email: "a@b.com" });
    const r = verifyToken(TOKEN_SECRET, t);
    assert.equal(r.valid, true);
    assert.equal(r.payload.slug, "filler-word-pack");
    assert.equal(verifyToken("other_secret", t).valid, false, "wrong secret fails");
    ok("token mint/verify round-trip");
  }

  // ---- 1. valid webhook -> slug resolved + email queued with token ----
  setLiveEnv();
  resendCalls = [];
  stubLineItems(PRICE_FILLER);
  {
    const raw = sessionEvent({ email: "buyer1@example.com" });
    const res = await webhookHandler(webhookEvent(raw));
    assert.equal(res.statusCode, 200);
    const b = JSON.parse(res.body);
    assert.equal(b.mapped, true);
    assert.equal(b.slug, EXPECTED.slug, "resolved slug is filler-word-pack");
    assert.equal(b.emailed, true, "email queued (not dry)");
    assert.equal(resendCalls.length, 1, "exactly one Resend call");
    assert.equal(resendCalls[0].body.to[0], "buyer1@example.com");
    assert.ok(
      resendCalls[0].body.from.includes("bryan@becomeawritertoday.com"),
      "from is the BAWT address",
    );
    assert.ok(resendCalls[0].body.text.includes(`${BASE}/download?token=`), "link points at /download");
    ok("valid checkout.session.completed -> correct slug + email queued with token");
  }

  // ---- 2. that token round-trips through download.js and streams the file ----
  {
    const token = tokenFromLastResend();
    const res = await downloadHandler({
      httpMethod: "GET",
      queryStringParameters: { token },
    });
    assert.equal(res.statusCode, 200, "download 200 for valid token");
    assert.equal(res.isBase64Encoded, true);
    assert.equal(res.headers["content-type"], "application/zip");
    assert.ok(
      res.headers["content-disposition"].includes(EXPECTED.filename),
      "attachment filename matches product",
    );
    const streamed = Buffer.from(res.body, "base64");
    assert.deepEqual(streamed, BLOB_BYTES[EXPECTED.slug], "streamed bytes match the right slug's blob");
    ok("token round-trips in download and streams the right slug");
  }

  // ---- 3. expired token -> 410 ----
  {
    const expired = mintToken(TOKEN_SECRET, {
      slug: "filler-word-pack",
      email: "a@b.com",
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    const res = await downloadHandler({ httpMethod: "GET", queryStringParameters: { token: expired } });
    assert.equal(res.statusCode, 410, "expired token rejected");
    ok("expired token rejected (410)");
  }

  // ---- 4. tampered token -> 403 ----
  {
    const good = mintToken(TOKEN_SECRET, { slug: "filler-word-pack", email: "a@b.com" });
    const tampered = good.slice(0, -3) + (good.slice(-3) === "aaa" ? "bbb" : "aaa");
    const res = await downloadHandler({ httpMethod: "GET", queryStringParameters: { token: tampered } });
    assert.equal(res.statusCode, 403, "tampered token rejected");
    // No-token case too.
    const none = await downloadHandler({ httpMethod: "GET", queryStringParameters: {} });
    assert.equal(none.statusCode, 403, "missing token rejected");
    ok("tampered / missing token rejected (403)");
  }

  // ---- 5. unknown price -> 200, no send ----
  setLiveEnv();
  resendCalls = [];
  stubLineItems("price_not_a_real_product");
  {
    const raw = sessionEvent({ email: "buyer2@example.com" });
    const res = await webhookHandler(webhookEvent(raw));
    assert.equal(res.statusCode, 200, "unknown price still 200");
    const b = JSON.parse(res.body);
    assert.equal(b.mapped, false, "unknown price not mapped");
    assert.equal(resendCalls.length, 0, "no email sent for unknown price");
    ok("unknown price id -> 200, no send");
  }

  // ---- 6. unset secrets -> dry path, no live Resend call ----
  setLiveEnv();
  delete process.env.RESEND_API_KEY; // triggers dry-run guard
  resendCalls = [];
  stubLineItems(PRICE_FILLER);
  {
    // Unsigned body is fine: dry-run skips signature verification.
    const raw = sessionEvent({ email: "buyer3@example.com" });
    const res = await webhookHandler(webhookEvent(raw, { sign: false }));
    assert.equal(res.statusCode, 200, "dry path returns 200");
    const b = JSON.parse(res.body);
    assert.equal(b.dryRun, true, "dry-run flagged");
    assert.equal(b.emailed, false, "no live email in dry-run");
    assert.equal(resendCalls.length, 0, "no Resend fetch in dry-run");
    ok("unset secrets / dry-run -> dry path, no live call");
  }

  // ---- 7. metadata.slug is the PRIMARY path: all 5 slugs resolve + stream ----
  // No line-item fetcher stub is armed, so resolution here CANNOT use the price
  // path: it proves metadata.slug works without STRIPE_SECRET_KEY.
  setLiveEnv();
  __setLineItemFetcher(async () => {
    throw new Error("line-item fetch must not be called on the metadata.slug path");
  });
  for (const slug of ALL_SLUGS) {
    const expected = productForSlug(slug);
    resendCalls = [];
    const raw = sessionEvent({ email: `buyer-${slug}@example.com`, slug });
    const res = await webhookHandler(webhookEvent(raw));
    assert.equal(res.statusCode, 200, `${slug}: webhook 200`);
    const b = JSON.parse(res.body);
    assert.equal(b.mapped, true, `${slug}: mapped`);
    assert.equal(b.slug, slug, `${slug}: resolved via metadata.slug`);
    assert.equal(b.emailed, true, `${slug}: email queued`);
    assert.equal(resendCalls.length, 1, `${slug}: exactly one Resend call`);

    const token = tokenFromLastResend();
    const dl = await downloadHandler({ httpMethod: "GET", queryStringParameters: { token } });
    assert.equal(dl.statusCode, 200, `${slug}: download 200`);
    assert.ok(
      dl.headers["content-disposition"].includes(expected.filename),
      `${slug}: attachment filename matches`,
    );
    assert.deepEqual(
      Buffer.from(dl.body, "base64"),
      BLOB_BYTES[slug],
      `${slug}: streamed bytes match the right slug's blob`,
    );
  }
  ok("all 5 slugs resolve via metadata.slug (no secret key) and stream the right zip");

  // ---- 8. unknown slug -> 200, no send ----
  {
    resendCalls = [];
    const raw = sessionEvent({ email: "nobody@example.com", slug: "does-not-exist" });
    const res = await webhookHandler(webhookEvent(raw));
    assert.equal(res.statusCode, 200, "unknown slug still 200");
    const b = JSON.parse(res.body);
    assert.equal(b.mapped, false, "unknown slug not mapped");
    assert.equal(resendCalls.length, 0, "no email sent for unknown slug");
    ok("unknown slug -> 200, no send");
  }

  // ---- 9. conversion tracking: sale record + /_sales aggregation ----
  setLiveEnv();
  salesStore = makeSalesStore(); // isolate: fresh sales log for a deterministic count
  {
    const buyerEmail = "Buyer.Nine@Example.com";
    resendCalls = [];
    const raw = sessionEvent({ email: buyerEmail, slug: "filler-word-pack", amount_total: 1900, currency: "usd" });
    await webhookHandler(webhookEvent(raw));

    const raw2 = sessionEvent({
      email: "another@example.com",
      sessionId: "cs_test_999",
      slug: "prompt-word-bank-pack",
      amount_total: 1200,
      currency: "usd",
    });
    await webhookHandler(webhookEvent(raw2));

    // Exactly two sale records written.
    assert.equal(salesStore._map.size, 2, "one sale record per completed session");

    // The filler record: right slug/amount/currency, hashed email, NO raw email.
    const rawJson = [...salesStore._map.values()].join("\n");
    assert.ok(!rawJson.includes(buyerEmail), "raw buyer email is never stored in the sales log");
    assert.ok(!/@example\.com/i.test(rawJson), "no raw email address appears in any sale record");
    const fillerRec = [...salesStore._map.values()].map((v) => JSON.parse(v)).find((r) => r.slug === "filler-word-pack");
    assert.equal(fillerRec.amount_total, 1900, "sale amount recorded");
    assert.equal(fillerRec.currency, "usd", "sale currency recorded");
    assert.equal(fillerRec.email_hash, hashEmail(buyerEmail), "email stored only as sha256 hash");

    // /_sales aggregates it.
    const statsRes = await salesStatsHandler({ httpMethod: "GET" });
    assert.equal(statsRes.statusCode, 200, "/_sales returns 200");
    const stats = JSON.parse(statsRes.body);
    assert.equal(stats.count, 2, "/_sales total count");
    assert.equal(stats.gross, 3100, "/_sales gross revenue (cents)");
    assert.equal(stats.gross_display, 31, "/_sales gross_display in major units");
    const bySlug = Object.fromEntries(stats.products.map((p) => [p.slug, p]));
    assert.equal(bySlug["filler-word-pack"].count, 1, "per-slug count (filler)");
    assert.equal(bySlug["filler-word-pack"].gross, 1900, "per-slug gross (filler)");
    assert.equal(bySlug["prompt-word-bank-pack"].gross, 1200, "per-slug gross (prompt pack)");

    // Idempotency: Stripe re-delivers the SAME session -> must not double-count.
    await webhookHandler(webhookEvent(raw)); // identical id + created as the first
    assert.equal(salesStore._map.size, 2, "re-delivered session overwrites, no double-count");
    const restats = JSON.parse((await salesStatsHandler({ httpMethod: "GET" })).body);
    assert.equal(restats.count, 2, "/_sales count stable across re-delivery");
    assert.equal(restats.gross, 3100, "/_sales gross stable across re-delivery");
    ok("completed session writes one hashed sale record; /_sales aggregates; re-delivery is idempotent");
  }

  // ---- 10. dry-run records NO sale ----
  setLiveEnv();
  delete process.env.RESEND_API_KEY; // force dry-run
  salesStore = makeSalesStore();
  {
    const raw = sessionEvent({ email: "dry@example.com", slug: "filler-word-pack" });
    await webhookHandler(webhookEvent(raw, { sign: false }));
    assert.equal(salesStore._map.size, 0, "dry-run writes zero sale records");
    ok("dry-run path records no sale (write guard honoured)");
  }

  // Sanity: every mapped product resolves to a distinct slug + filename.
  {
    const values = Object.values(PRODUCTS);
    const slugs = new Set(values.map((p) => p.slug));
    assert.equal(slugs.size, values.length, "every mapped product has a distinct slug");
    assert.equal(slugs.size, 5, "five mapped product slugs (all live)");
    const prices = new Set(values.map((p) => p.price_id));
    assert.equal(prices.size, values.length, "every mapped product has a distinct live price id");
    const filenames = new Set(values.map((p) => p.filename));
    assert.equal(filenames.size, values.length, "every mapped product has a distinct filename");
    ok("product mapping has five distinct live product slugs + price ids");
  }

  globalThis.fetch = realFetch;
  console.log(`\ndeliverTest: ${passed} checks passed.`);
}

run().catch((e) => {
  globalThis.fetch = realFetch;
  console.error("\ndeliverTest FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
