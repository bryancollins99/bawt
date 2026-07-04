# BLOCKED / GO-LIVE — Digital-product delivery

The code is complete and tested, but delivery is **not live** until the following manual
steps are done in Stripe and Netlify. Nothing here can be automated safely from the repo.

## Go-live checklist

1. **Register the Stripe webhook endpoint.**
   Stripe Dashboard → Developers → Webhooks → Add endpoint.
   - URL: `https://<the-tools-site>/stripe-webhook`
     (the deployed Netlify site for this repo; the redirect maps it to
     `/.netlify/functions/stripe-webhook`).
   - Events to send: `checkout.session.completed`.
   - After creating it, copy the endpoint's **Signing secret** (`whsec_...`).

2. **Set `STRIPE_WEBHOOK_SECRET`** in Netlify env = the signing secret from step 1.

3. **Set `DELIVER_TOKEN_SECRET`** in Netlify env = a fresh random secret (32+ bytes),
   e.g. `openssl rand -hex 32`. This signs the download tokens.

4. **Resolve the price id (REQUIRED — the stated env set is insufficient).**
   A Payment-Link `checkout.session.completed` event has no price id inline, so pick ONE:
   - **Recommended:** set **`STRIPE_SECRET_KEY`** in Netlify env. The webhook then retrieves
     the session line items from the Stripe API and maps the price id -> product. Preserves
     the exact `price_id -> slug` mapping already coded.
   - **Or:** edit each of the three Stripe Payment Links to pass metadata `price_id` equal to
     that product's price id. No new secret, but three manual link edits.
   Without one of these, every purchase resolves to "unknown price" and no email is sent.

5. **Set `RESEND_API_KEY`** in Netlify env = the Become a Writer Today Resend key.
   The sending domain `becomeawritertoday.com` must be verified in Resend so
   `bryan@becomeawritertoday.com` can send.

6. **Upload the product zips to Blobs (one time).** A bare `node` script has no injected
   Blobs context, so pass the site id and a Netlify personal access token explicitly:
   ```
   NETLIFY_SITE_ID=<site-id> NETLIFY_AUTH_TOKEN=<netlify-PAT> \
     node scripts/upload-products.mjs
   ```
   (Get the site id from Netlify → Site configuration; create a PAT under User settings →
   Applications → Personal access tokens.) Reads the three zips from `~/src` and writes them
   to the private `product-downloads` Blobs store under slugs `filler-word-pack`,
   `claude-code-for-writers`, `zettelkasten-kit`. Re-run any time a zip is updated
   (idempotent overwrite).

7. **(Optional) `DELIVER_BASE_URL`** in Netlify env if the download links should use a
   custom domain instead of the site's default `URL`.

## Verify after go-live

- Send a Stripe test event (`checkout.session.completed`) to the endpoint and confirm a 200
  plus a delivery log line. Or set `BAWT_DRY_RUN=1` temporarily to log without sending.
- Do one real low-value purchase, confirm the email arrives and the download link streams
  the correct zip, then let the link expire (~72h) and confirm it then rejects.

## Working-tree note (not part of this PR)

The working tree also contains `deadline-digest/` (untracked) and a modified
`public/writing-contests.html` that leaked in from the newsletter-send-engine branch /
build. They are intentionally **left unstaged** — this PR touches only the delivery files.
