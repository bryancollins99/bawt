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
// Product mapping: Stripe price id -> product slug (== Blobs key) + metadata.
// The slug is the stable Blobs key written by scripts/upload-products.mjs.
// filename is what the buyer's browser saves the attachment as.
// ---------------------------------------------------------------------------
export const PRODUCTS = {
  price_1TpaMeK36rW7SrJyzjpudFG3: {
    slug: "filler-word-pack",
    name: "Filler-Word Killer Editor Pack",
    filename: "filler-word-editor-pack-v1.0.zip",
  },
  price_1TpaMfK36rW7SrJyQmZG5Xwq: {
    slug: "claude-code-for-writers",
    name: "Claude Code for Writers",
    filename: "cc-for-writers-v1.0.zip",
  },
  price_1TpaKnK36rW7SrJyhSy87BGw: {
    slug: "zettelkasten-kit",
    name: "The Zettelkasten for Creators Kit",
    filename: "zk-creators-kit-v1.0.zip",
  },
  // --- PENDING: real Stripe price ids not yet created (see BLOCKED.md). ---
  // These two placeholder keys wire the delivery path end to end now; swapping
  // in each live price id later is a single find-and-replace of the key string.
  PRICE_ID_PENDING_deadline_database: {
    slug: "writers-deadline-database",
    name: "Writers' Deadline Database",
    filename: "deadline-database-v1.0.zip",
  },
  PRICE_ID_PENDING_prompt_pack: {
    slug: "prompt-word-bank-pack",
    name: "Prompt / Word-Bank Pack",
    filename: "prompt-word-bank-pack-v1.0.zip",
  },
};

// Reverse lookup by slug (used by download.js to resolve the streamed file).
export const PRODUCTS_BY_SLUG = Object.fromEntries(
  Object.values(PRODUCTS).map((p) => [p.slug, p]),
);

export const BLOB_STORE_NAME = "product-downloads";
export const TOKEN_TTL_SECONDS = 72 * 60 * 60; // ~72h

export function productForPrice(priceId) {
  return PRODUCTS[priceId] || null;
}

export function productForSlug(slug) {
  return PRODUCTS_BY_SLUG[slug] || null;
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
