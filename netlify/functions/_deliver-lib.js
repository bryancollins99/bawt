// netlify/functions/_deliver-lib.js
//
// Shared delivery helpers for the digital-product fulfilment flow.
// Underscore-prefixed so Netlify does NOT deploy this as a standalone function;
// it is imported (and inlined at bundle time) by stripe-webhook.js and download.js.
//
// Deliberately dependency-light: own small Resend REST + HMAC helpers so this
// branch does not depend on the send-engine / capture PRs. Namespaced (_deliver-*)
// to avoid collisions with anything those PRs add.
//
// External seams (Blobs store factory, fetch) are injectable so scripts/deliverTest.mjs
// can drive the real handlers with stubs and never make a live call.

import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

// ---------------------------------------------------------------------------
// Product mapping: keyed by product SLUG (== Blobs key, == session.metadata.slug).
//
// Every live Stripe Payment Link carries metadata.slug, which Stripe copies onto
// the checkout.session. That is the PRIMARY resolution path (see
// resolveProductFromSession) and it needs NO STRIPE_SECRET_KEY. Each entry also
// carries its live `price_id` so the legacy price-id path still works as a
// fallback. `filename` is what the buyer's browser saves the attachment as; the
// slug is the stable Blobs key written by scripts/upload-products.mjs.
// ---------------------------------------------------------------------------
export const PRODUCTS = {
  "filler-word-pack": {
    slug: "filler-word-pack",
    name: "Filler-Word Killer Editor Pack",
    filename: "filler-word-editor-pack-v1.0.zip",
    price_id: "price_1TpaMeK36rW7SrJyzjpudFG3",
  },
  "claude-code-for-writers": {
    slug: "claude-code-for-writers",
    name: "Claude Code for Writers",
    filename: "cc-for-writers-v1.0.zip",
    price_id: "price_1TpaMfK36rW7SrJyQmZG5Xwq",
  },
  "zettelkasten-kit": {
    slug: "zettelkasten-kit",
    name: "The Zettelkasten for Creators Kit",
    filename: "zk-creators-kit-v1.0.zip",
    price_id: "price_1TpaKnK36rW7SrJyhSy87BGw",
  },
  "writers-deadline-database": {
    slug: "writers-deadline-database",
    name: "Writers' Deadline Database",
    filename: "deadline-database-v1.0.zip",
    price_id: "price_1Tpbn8K36rW7SrJylwizBYj6",
  },
  "prompt-word-bank-pack": {
    slug: "prompt-word-bank-pack",
    name: "Prompt / Word-Bank Pack",
    filename: "prompt-word-bank-pack-v1.0.zip",
    price_id: "price_1Tpbn9K36rW7SrJy6GIVghtt",
  },
};

// Backwards-compatible alias (download.js historically imported this name).
export const PRODUCTS_BY_SLUG = PRODUCTS;

// Fallback lookup: live Stripe price id -> slug. Only used when a session does
// not carry metadata.slug (metadata.slug is the primary path).
export const PRICE_TO_SLUG = Object.fromEntries(
  Object.values(PRODUCTS)
    .filter((p) => p.price_id)
    .map((p) => [p.price_id, p.slug]),
);

export const BLOB_STORE_NAME = "product-downloads";
export const SALES_STORE_NAME = "product-sales";
export const TOKEN_TTL_SECONDS = 72 * 60 * 60; // ~72h

export function productForSlug(slug) {
  return (slug && PRODUCTS[slug]) || null;
}

export function productForPrice(priceId) {
  const slug = priceId ? PRICE_TO_SLUG[priceId] : null;
  return productForSlug(slug);
}

// ---------------------------------------------------------------------------
// base64url helpers
// ---------------------------------------------------------------------------
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBuf(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

// Constant-time compare that tolerates unequal lengths (timingSafeEqual throws otherwise).
function safeEqual(a, b) {
  const ab = Buffer.isBuffer(a) ? a : Buffer.from(String(a));
  const bb = Buffer.isBuffer(b) ? b : Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ---------------------------------------------------------------------------
// Download token: HMAC-signed { slug, email, exp } over base64url(payload).
// token = base64url(payloadJson) + "." + base64url(hmac)
// ---------------------------------------------------------------------------
export function mintToken(secret, { slug, email, exp }) {
  if (!secret) throw new Error("mintToken: missing secret");
  const expiry = exp || Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = b64url(JSON.stringify({ slug, email, exp: expiry }));
  const sig = b64url(crypto.createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(secret, token) {
  if (!secret) return { valid: false, reason: "no-secret" };
  if (!token || typeof token !== "string") return { valid: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, reason: "malformed" };
  const [payload, sig] = parts;
  const expected = b64url(crypto.createHmac("sha256", secret).update(payload).digest());
  if (!safeEqual(sig, expected)) return { valid: false, reason: "bad-signature" };
  let data;
  try {
    data = JSON.parse(b64urlToBuf(payload).toString("utf8"));
  } catch {
    return { valid: false, reason: "bad-payload" };
  }
  if (!data.slug || typeof data.exp !== "number") return { valid: false, reason: "bad-payload" };
  if (Math.floor(Date.now() / 1000) > data.exp) return { valid: false, reason: "expired" };
  return { valid: true, payload: data };
}

// ---------------------------------------------------------------------------
// Stripe webhook signature verification (no SDK).
// Header format: "t=<unix>,v1=<hex>". signed = `${t}.${rawBody}`.
// ---------------------------------------------------------------------------
export function verifyStripeSignature(secret, rawBody, sigHeader, toleranceSec = 300) {
  if (!secret || !sigHeader || typeof rawBody !== "string") return false;
  const parts = Object.fromEntries(
    String(sigHeader)
      .split(",")
      .map((kv) => kv.split("=").map((s) => s.trim()))
      .filter((p) => p.length === 2),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const signed = `${t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  if (!safeEqual(v1, expected)) return false;
  // Replay-tolerance guard (skip if tolerance <= 0).
  if (toleranceSec > 0) {
    const age = Math.floor(Date.now() / 1000) - Number(t);
    if (!Number.isFinite(age) || age > toleranceSec || age < -toleranceSec) return false;
  }
  return true;
}

// Convenience for tests / self-signing: produce a valid Stripe-Signature header.
export function stripeSignatureHeader(secret, rawBody, t = Math.floor(Date.now() / 1000)) {
  const sig = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return `t=${t},v1=${sig}`;
}

// ---------------------------------------------------------------------------
// Price-id resolution for Payment Link checkouts.
//
// A `checkout.session.completed` event for a Payment Link does NOT carry
// line_items or a price id inline. Production path: retrieve line items via the
// Stripe REST API (needs STRIPE_SECRET_KEY). Fallbacks: inline line_items (if a
// caller ever expands them) and session.metadata.price_id (if the link is
// configured to pass it). The retriever is injectable so tests mirror the live
// path without a network call.
// ---------------------------------------------------------------------------
let _lineItemFetcher = defaultFetchLineItems;
export function __setLineItemFetcher(fn) {
  _lineItemFetcher = fn || defaultFetchLineItems;
}

async function defaultFetchLineItems(sessionId, secretKey) {
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=1`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  if (!res.ok) throw new Error(`Stripe line_items retrieve failed: ${res.status}`);
  return res.json();
}

export async function resolvePriceId(session, { secretKey } = {}) {
  // 1. Inline line_items (only if a caller expanded them).
  const inline = session?.line_items?.data?.[0]?.price?.id;
  if (inline) return inline;
  // 2. Link metadata escape hatch.
  const metaPrice = session?.metadata?.price_id;
  if (metaPrice) return metaPrice;
  // 3. Live retrieval via Stripe API (needs the secret key).
  if (session?.id && secretKey) {
    const data = await _lineItemFetcher(session.id, secretKey);
    return data?.data?.[0]?.price?.id || null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Resolve the purchased product from a checkout.session.
//
// PRIMARY: session.metadata.slug. Every live Payment Link sets metadata.slug and
// Stripe copies it onto the session, so this path needs NO STRIPE_SECRET_KEY.
// FALLBACK: the legacy price-id path (inline line_items / metadata.price_id /
// live line-item retrieval), mapped to a slug via PRICE_TO_SLUG.
//
// Returns { slug, product, via }. `product` is null when the slug/price is
// unknown (caller 200s with no send).
// ---------------------------------------------------------------------------
export async function resolveProductFromSession(session, { secretKey } = {}) {
  const metaSlug = session?.metadata?.slug;
  if (metaSlug) {
    return { slug: metaSlug, product: productForSlug(metaSlug), via: "metadata.slug" };
  }
  const priceId = await resolvePriceId(session, { secretKey });
  if (priceId) {
    const product = productForPrice(priceId);
    return { slug: product?.slug || null, product, via: "price_id", priceId };
  }
  return { slug: null, product: null, via: "none" };
}

// ---------------------------------------------------------------------------
// Netlify Blobs store access (injectable factory for tests).
// ---------------------------------------------------------------------------
let _storeFactory = defaultStoreFactory;
export function __setStoreFactory(fn) {
  _storeFactory = fn || defaultStoreFactory;
}
function defaultStoreFactory(name) {
  return getStore(name);
}
export function getProductStore() {
  return _storeFactory(BLOB_STORE_NAME);
}
export function getSalesStore() {
  return _storeFactory(SALES_STORE_NAME);
}

// ---------------------------------------------------------------------------
// Conversion tracking: append-only sale records in the private Netlify Blobs
// store "product-sales". One record per completed checkout, keyed by
// "<ISO timestamp>_<slug>". The buyer email is HASHED (sha256), never stored
// raw. Reads are aggregated by sales-stats.js (/_sales).
// ---------------------------------------------------------------------------
export function hashEmail(email) {
  if (!email) return null;
  return crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex");
}

// Write one sale record. Returns { key, record }. Throws only on a store error;
// callers wrap this so a metrics failure never blocks fulfilment.
//
// The key is "<ISO ts>_<slug>_<sessionId>". Stripe delivers
// checkout.session.completed AT LEAST once (retries on our 500s are expected), so
// the key must be STABLE across re-deliveries: pass the session's own `created`
// time as `ts` and its id as `sessionId`, and a redelivery overwrites the same
// record instead of double-counting. Only falls back to Date.now() if no stable
// timestamp is supplied.
export async function recordSale(store, { slug, amount_total, currency, email, ts, sessionId } = {}) {
  const stamp = Number.isFinite(ts) ? ts : Date.now();
  const idPart = sessionId ? `_${sessionId}` : "";
  const key = `${new Date(stamp).toISOString()}_${slug}${idPart}`;
  const record = {
    slug: slug || null,
    amount_total: Number.isFinite(amount_total) ? amount_total : null,
    currency: currency ? String(currency).toLowerCase() : null,
    email_hash: hashEmail(email),
    ts: stamp,
  };
  await store.set(key, JSON.stringify(record));
  return { key, record };
}

// Aggregate every sale record into per-slug totals + overall count + gross.
// Amounts are Stripe minor units (cents); gross is returned in the same unit.
export async function readSalesStats(store) {
  const listing = (await store.list()) || {};
  const blobs = listing.blobs || [];
  const perSlug = {};
  let count = 0;
  let gross = 0;
  let currency = null;
  for (const b of blobs) {
    const rec = await store.get(b.key, { type: "json" });
    if (!rec) continue;
    count += 1;
    const amt = Number(rec.amount_total) || 0;
    gross += amt;
    if (!currency && rec.currency) currency = rec.currency;
    const slug = rec.slug || "unknown";
    const s = perSlug[slug] || (perSlug[slug] = { slug, count: 0, gross: 0, currency: rec.currency || null });
    s.count += 1;
    s.gross += amt;
  }
  return { count, gross, currency, perSlug };
}

// ---------------------------------------------------------------------------
// Resend REST email (no SDK). Honors dry-run and missing key.
// ---------------------------------------------------------------------------
export function buildDownloadEmail({ name, url }) {
  const subject = `Your download: ${name}`;
  const text = [
    `Thanks for your purchase of ${name}.`,
    ``,
    `Download your files here (link valid for about 72 hours):`,
    url,
    ``,
    `If the link has expired, just reply to this email and I will send a fresh one.`,
    ``,
    `Bryan Collins`,
    `Become a Writer Today`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f6f4ef;color:#2b2b2b;font-family:Georgia,'Times New Roman',Times,serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <h1 style="color:#b23a48;font-size:22px;margin:0 0 16px;">Your download is ready</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">Thanks for your purchase of <strong>${name}</strong>.</p>
    <p style="margin:0 0 28px;">
      <a href="${url}" style="display:inline-block;background:#b23a48;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:16px;">Download your files</a>
    </p>
    <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 8px;">This link is valid for about 72 hours. If it has expired, just reply to this email and I will send a fresh one.</p>
    <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 20px;word-break:break-all;">Direct link: ${url}</p>
    <p style="font-size:15px;line-height:1.6;margin:0;">Bryan Collins<br>Become a Writer Today</p>
  </div>
</body></html>`;

  return { subject, html, text };
}

// Returns { sent: boolean, dryRun?: boolean, id?, status? }.
export async function sendDownloadEmail({ to, name, url, from, apiKey, dryRun }) {
  const message = buildDownloadEmail({ name, url });
  if (dryRun || !apiKey) {
    console.log(
      `[deliver] DRY: would email ${to} for "${name}" -> ${url} (dryRun=${!!dryRun}, hasKey=${!!apiKey})`,
    );
    return { sent: false, dryRun: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from || "Become a Writer Today <bryan@becomeawritertoday.com>",
      to: [to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed: ${res.status} ${body}`);
  }
  const data = await res.json().catch(() => ({}));
  return { sent: true, id: data.id, status: res.status };
}

// Base URL for the tokenised download link. Netlify sets URL to the site's
// primary address at runtime; DELIVER_BASE_URL overrides for custom domains.
export function downloadBaseUrl(env = process.env) {
  return (env.DELIVER_BASE_URL || env.URL || "https://becomeawritertoday.com").replace(/\/+$/, "");
}
