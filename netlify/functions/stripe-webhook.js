// netlify/functions/stripe-webhook.js
//
// Stripe webhook: on checkout.session.completed, resolve the purchased price id
// to a product slug, mint a ~72h HMAC download token, and email the buyer a
// tokenised download link via Resend.
//
// GUARD: if STRIPE_WEBHOOK_SECRET or RESEND_API_KEY is unset, or BAWT_DRY_RUN=1,
// we do not verify/send live. We log what we WOULD do and return 200 so Stripe
// does not retry. Unknown price ids are logged and 200'd (no send).

import {
  verifyStripeSignature,
  resolvePriceId,
  productForPrice,
  mintToken,
  sendDownloadEmail,
  downloadBaseUrl,
  TOKEN_TTL_SECONDS,
} from "./_deliver-lib.js";

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}

// Netlify may hand us a base64-encoded body; Stripe HMAC is over the raw bytes.
function rawBodyOf(event) {
  if (!event || event.body == null) return "";
  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}

function headerValue(headers, name) {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === lower) return headers[k];
  }
  return undefined;
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return json(405, { error: "method-not-allowed" });
  }

  const {
    STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY,
    RESEND_API_KEY,
    DELIVER_TOKEN_SECRET,
    BAWT_DRY_RUN,
    DELIVER_EMAIL_FROM,
  } = process.env;

  const dryRun =
    BAWT_DRY_RUN === "1" || !STRIPE_WEBHOOK_SECRET || !RESEND_API_KEY;

  const raw = rawBodyOf(event);
  const sig = headerValue(event.headers, "stripe-signature");

  // Verify signature only when we can (live path). In dry-run we still parse so
  // logs show what WOULD happen, but never trust/send.
  if (!dryRun) {
    if (!verifyStripeSignature(STRIPE_WEBHOOK_SECRET, raw, sig)) {
      console.warn("[stripe-webhook] signature verification failed");
      return json(400, { error: "bad-signature" });
    }
  }

  let evt;
  try {
    evt = JSON.parse(raw || "{}");
  } catch {
    return json(400, { error: "bad-json" });
  }

  if (evt.type !== "checkout.session.completed") {
    console.log(`[stripe-webhook] ignoring event type: ${evt.type}`);
    return json(200, { ignored: evt.type });
  }

  const session = evt.data?.object || {};
  const email =
    session.customer_details?.email || session.customer_email || null;

  let priceId = null;
  try {
    priceId = await resolvePriceId(session, { secretKey: STRIPE_SECRET_KEY });
  } catch (e) {
    console.error(`[stripe-webhook] price resolution error: ${e.message}`);
    // Fall through: unresolved price handled below.
  }

  const product = priceId ? productForPrice(priceId) : null;
  if (!product) {
    console.warn(`[stripe-webhook] unknown/unmapped price id: ${priceId} (session ${session.id})`);
    return json(200, { received: true, mapped: false, priceId });
  }

  if (!email) {
    console.error(`[stripe-webhook] no buyer email on session ${session.id} for ${product.slug}`);
    return json(200, { received: true, mapped: true, emailed: false, reason: "no-email" });
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = mintToken(DELIVER_TOKEN_SECRET, { slug: product.slug, email, exp });
  const url = `${downloadBaseUrl()}/download?token=${encodeURIComponent(token)}`;

  try {
    const result = await sendDownloadEmail({
      to: email,
      name: product.name,
      url,
      from: DELIVER_EMAIL_FROM,
      apiKey: RESEND_API_KEY,
      dryRun,
    });
    console.log(
      `[stripe-webhook] ${result.sent ? "sent" : "dry"} delivery for ${product.slug} to ${email}`,
    );
    return json(200, {
      received: true,
      mapped: true,
      slug: product.slug,
      emailed: result.sent,
      dryRun: !!result.dryRun,
    });
  } catch (e) {
    console.error(`[stripe-webhook] email send failed for ${product.slug}: ${e.message}`);
    // 500 so Stripe retries the delivery.
    return json(500, { received: true, mapped: true, emailed: false, error: "send-failed" });
  }
}
