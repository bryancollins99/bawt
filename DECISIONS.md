# DECISIONS — Digital-product delivery

Branch: `deliver/digital-products` (off `main`). Independent of PR #15 (capture) and
PR #16 (send-engine); own small Resend REST + HMAC helpers, namespaced `_deliver-*`.

## What this ships

When a buyer completes a Stripe Payment Link checkout, a webhook maps the purchased
price id to a product, mints a short-lived signed download token, and emails the buyer
a tokenised download link. The zip is served only through a valid token; it is never
publicly fetchable.

## Files

- `netlify/functions/_deliver-lib.js` — shared helpers (underscore-prefixed so Netlify
  does not deploy it as a function; imported/inlined by the two functions). Holds the
  price-id -> product mapping, token mint/verify, Stripe signature verify, Payment-Link
  price resolution, Blobs store access, and the Resend REST send. External seams (Blobs
  store factory, Stripe line-item fetcher) are injectable for the test.
- `netlify/functions/stripe-webhook.js` — POST endpoint; verifies signature, resolves
  price -> slug, mints token, emails via Resend.
- `netlify/functions/download.js` — GET endpoint; verifies token + expiry (timing-safe),
  streams the zip from Blobs as an attachment.
- `scripts/upload-products.mjs` — one-time uploader of the three zips into Blobs.
- `scripts/deliverTest.mjs` — self-test (wired into `npm test`).

## Key decisions

1. **Storage = private Netlify Blobs store `product-downloads`.** Keys are stable slugs:
   `filler-word-pack`, `claude-code-for-writers`, `zettelkasten-kit`. Zips live in `~/src`
   (outside the repo), are `.gitignore`d (`*.zip`), and are never placed in `public/` or
   `dist/`. There is no public route to the store; the only reachable path is `/download`
   behind a valid token.

2. **Payment-Link price resolution.** A `checkout.session.completed` event for a Payment
   Link does NOT carry `line_items` or a price id inline. `resolvePriceId()` tries, in
   order: inline `line_items` (only if a caller expanded them), `session.metadata.price_id`
   (link escape hatch), then a live retrieval of the session line items via the Stripe REST
   API (`GET /v1/checkout/sessions/{id}/line_items`, needs `STRIPE_SECRET_KEY`). The test
   exercises the SAME retrieval path via an injected stub — it does not stuff an inline
   price the production path never sees. **This means the task's stated env set
   (`STRIPE_WEBHOOK_SECRET` + `DELIVER_TOKEN_SECRET`) is not sufficient to resolve a live
   purchase** — see BLOCKED.md go-live step 4.

3. **Token = HMAC-SHA256 over `base64url({slug,email,exp})`**, `~72h` expiry, secret
   `DELIVER_TOKEN_SECRET`. Format `payload.sig`. Verification is constant-time and
   length-guarded (Node's `timingSafeEqual` throws on unequal-length buffers, so we
   pre-check length and return a clean reject instead of a 500). Same guard on the Stripe
   signature compare.

4. **Stripe signature verify is hand-rolled** (no `stripe` SDK): HMAC over `${t}.${rawBody}`
   using the exact raw bytes. Handles Netlify's `isBase64Encoded` body. 300s replay
   tolerance.

5. **Guard / dry-run.** If `STRIPE_WEBHOOK_SECRET` or `RESEND_API_KEY` is unset, or
   `BAWT_DRY_RUN=1`, the webhook does not verify or send live — it logs what it WOULD do
   and returns 200. Unknown/unmapped price ids are logged and 200'd (no send) so Stripe
   does not retry a purchase we can't fulfil silently forever. Genuine send failures return
   500 so Stripe retries.

6. **Download response** returns the zip as a base64 body with `isBase64Encoded: true`
   (files are 20-65 KB, far under function response limits) and
   `Content-Disposition: attachment`.

7. **Email copy** is plain and contains no em dashes. `from` defaults to
   `Become a Writer Today <bryan@becomeawritertoday.com>` (overridable via
   `DELIVER_EMAIL_FROM`). Download base URL is `DELIVER_BASE_URL || process.env.URL`.

## Not depended on

No import from PR #15 or PR #16 code. `netlify.toml` gains its own `[functions]` block
and `/stripe-webhook` + `/download` redirects; if those PRs also add a `[functions]` block
on their branches, the merge is a trivial keep-one (same directory value).
