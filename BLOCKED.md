# BLOCKED — list-capture foundation (PRD-1)

Things that cannot be finished autonomously, or that need Bryan / a live check.

## Env vars (set in Netlify before live confirm sends)
Live confirm sends are gated on these. Until set (or with `BAWT_DRY_RUN=1`), subscribe
returns the `confirmUrl` instead of sending.

- `CONFIRM_TOKEN_SECRET` — required. Any strong random string; signs/verifies the confirm
  token. Must be identical across deploys or existing links stop verifying.
- `RESEND_API_KEY` — required for any live Resend call (create/update contact, topics,
  segment, send). EU region key.
- `SITE_URL` — the public origin the confirm link points at (e.g.
  `https://tools.becomeawritertoday.com`). Defaults to that if unset; set it explicitly to
  match the real deployed host.
- `BAWT_DRY_RUN` — set `1` to force skip all sends (safe testing). Leave unset in prod.

Optional overrides (baked defaults already carry the provisioned IDs):
`RESEND_FROM`, `RESEND_BASE_SEGMENT_ID`, `RESEND_TOPIC_FICTION`, `RESEND_TOPIC_POETRY`,
`RESEND_TOPIC_NONFICTION`.

## Resend REST shapes to verify against live before the FIRST real send
Both are isolated in single helpers in `netlify/functions/_lib.js`. All sends are gated, so a
wrong shape only 500s a live call, it cannot leak email. Verify with one real (dry-guarded off)
smoke signup once the domain + key are wired:

1. **Topics PATCH body** — implemented as a bare array `[{ id, subscription }]` per the
   docs. If Resend expects `{ topics: [...] }`, change `updateContactTopics` only.
2. **Add-to-segment endpoint** — implemented as `POST /contacts/{email}/segments/{segmentId}`
   (path params, no body). This was the least certain of the five shapes. If it is actually
   `POST /segments/{id}/contacts` with a body, change `addToSegment` only.

## Needs-Bryan decisions (not blocking this PR)
- Kit cutover: the SPA + book planner are now on Resend. Decide whether to also migrate the
  legacy Kit `8060129` list (bridge is opt-in double-opt-in only; no bulk import).
- Preference/genre-change page: deferred (native Resend unsubscribe covers unsub). Build a
  hosted genre-change page later if genre self-service is wanted.
- Domain note: the corrected brief states `becomeawritertoday.com` is VERIFIED in Resend (EU),
  which overrides the older BUILD-PLAN "Gate 0". Live sends are therefore gated only by the
  env vars above and the `BAWT_DRY_RUN` guard, NOT by domain verification.

## Not done this session (out of scope / by rule)
- No live email of any kind was sent. No PR merged.
- No Kit forms removed anywhere except the two repointed capture forms.

---

# BLOCKED - Newsletter send engine

Everything in this branch builds, dry-runs, and self-tests without any of the
below. These are the only things standing between here and a real send. None was
actioned this session (no live sends, no merges).

## Needs Bryan / external before a live send

1. **Remaining Stripe checkout URLs.** All FIVE deliverable products now have LIVE
   checkouts (Filler-Word Killer Editor Pack, Claude Code for Writers, The
   Zettelkasten for Creators Kit, Writers' Deadline Database, Prompt / Word-Bank
   Pack) and every drafted letter's P.P.S. links to one. Still
   `STRIPE_CHECKOUT_PENDING` (no live product, no letter references them): How to
   Earn $3-5k Writing Online, The Fearless Creative. Consequences:
   - Letters 3 (freelance) and 6 (mindset) still cross-sell the Filler-Word pack
     because their natural products (the two courses above) have no checkout yet.
     Swap the P.P.S. once those go live.
   - The Thursday digest now cross-sells the Writers' Deadline Database (its
     `checkout_url` is live, and `digestProduct()` prefers it over the Filler-Word
     pack automatically).

2. **Affiliate program terms per slug.** The letters link grammarly, prowritingaid,
   masterclass, teachable via `go.becomeawritertoday.com/e/<slug>`. Confirm each
   program permits promotion by email, and that the go-domain redirector actually
   resolves those slugs, before the first live send.

3. **Contest-organiser affiliate slot.** The affiliate rotation maps the
   `deadlines` thread to "contest organiser" rather than a go-domain slug. None
   of the 9 drafted letters is a `deadlines` letter, so this is not yet exercised
   in a letter. In the Thursday digest, organiser links come straight from each
   contest's `c.url` (correct). When a `deadlines` LETTER is drafted, its P.S.
   needs a direct organiser link, not a go-domain slug.

4. **Resend broadcast audience field.** `send.js` sends one broadcast per resolved
   target using `audienceId: <base segment id>`. Whether Resend's broadcast API
   expects `audienceId` or `segmentId` for this account's model is UNVERIFIED
   (dry-run stubs the HTTP call, so a wrong field would only surface on the first
   live call). Confirm the payload shape against live Resend, and send one real
   smoke broadcast to a test contact, before trusting the flow.

5. **Per-topic contact counts (empty-target detection).** The live-send path uses
   a placeholder `countFn` that assumes targets are non-empty. A precise per-genre
   count needs a Resend segment built on each topic. Wire real counts before
   relying on the R4 empty-skip in production; the skip LOGIC is correct and
   tested, only the count source is stubbed.

## Operational heads-up (not a blocker)

- **Freshness guard expires the workflow in ~120 days.** `assertFresh()` runs
  before the dry/live branch, so once `data/queue.json`'s `generatedAt` is more
  than MAX_DATA_AGE_DAYS (120) old, the Mon/Wed/Fri Action starts FAILING even
  in dry mode (fail-closed per R2). This is intentional, but for evergreen
  letters it means bumping `generatedAt` (or raising the threshold) roughly
  quarterly to keep the cron alive. Not a silent send of stale data, a loud
  cron failure.
- **All 9 letters ship base-only (`topic: null`), by choice.** "Genre topic
  filter where implied" resolved to base-segment-only for every currently
  drafted letter. If you want to narrow reach, letters 4 (Show Don't Tell) and
  7 (How to Write a Short Story) are the fiction-leaning candidates: set their
  `topic` to `"fiction"` in queue.json and the audience resolution + broadcast
  filter kick in automatically.
- **Digest freshness needs current contests data.** The Thursday digest fails
  closed if `src/data/contests.json` was last committed more than 14 days ago
  (deadlines go stale fast). Keep the contests feed current, or the digest cron
  will loudly fail rather than send wrong dates. If no contest is within the
  21-day window it skips gracefully (no send, exit 0), which is expected in quiet
  weeks.

## Gated OFF by design (do not flip without the above)
- Repo var `NEWSLETTER_LIVE` (leave unset -> Action runs `--dry`).
- Secret `RESEND_API_KEY` (unset -> send.js dry-runs even if invoked as live).
- Repo vars `SITE_URL`, `RESEND_BASE_SEGMENT_ID`, `RESEND_TOPIC_*` (send.js has
  correct defaults; set these to override per environment).

---

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

4. **Product resolution — DONE, no secret key needed.**
   Every live Payment Link already sets `metadata.slug`, and Stripe copies payment-link
   metadata onto the `checkout.session`, so `checkout.session.completed` arrives with
   `metadata.slug` set. `resolveProductFromSession()` maps that slug straight to the product.
   **`STRIPE_SECRET_KEY` is NOT required.** It is only an OPTIONAL fallback: if a session ever
   lacks `metadata.slug`, the webhook falls back to the price-id path (which needs
   `STRIPE_SECRET_KEY` to retrieve line items). Setting it is belt-and-braces, not a blocker.

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

---

# BLOCKED / GO-LIVE — Two new products (deadline database + prompt pack)

Both products are built, wired, tested, and now have LIVE Stripe checkouts + price ids. The
Stripe/products.json/_deliver-lib swaps below are **DONE**; the only remaining go-live step is
building and uploading the two zips (Bryan, manual, needs a Netlify PAT).

## Stripe pieces (DONE)

Products: **Writers' Deadline Database ($29)** and **Prompt / Word-Bank Pack ($12)**.
Stripe product + price + Payment Link created for each; every link carries `metadata.slug`.

- Deadline Database: price `price_1Tpbn8K36rW7SrJylwizBYj6`,
  checkout `https://buy.stripe.com/5kQeVed6v7mjdIGfu8bZe0z`, slug `writers-deadline-database`.
- Prompt / Word-Bank Pack: price `price_1Tpbn9K36rW7SrJy6GIVghtt`,
  checkout `https://buy.stripe.com/3cIaEY4zZ7mj34281GbZe0A`, slug `prompt-word-bank-pack`.

## Placeholder swaps (DONE)

1. `deadline-digest/config/products.json` — both `checkout_url`s are the live payment links.
2. `netlify/functions/_deliver-lib.js` — the `PRODUCTS` map is keyed by slug and each entry
   carries its live `price_id` (the old `PRICE_ID_PENDING_*` keys are gone). Delivery resolves
   from `session.metadata.slug`, so no `metadata.price_id` link edit is needed.

## Build + upload the two zips (one time, and after any data refresh)

The zips are NOT committed (gitignored). Build them, then upload:

```
node scripts/build-deadline-database.mjs   # -> build-output/deadline-database-v1.0.zip
node scripts/build-prompt-pack.mjs          # -> build-output/prompt-word-bank-pack-v1.0.zip
NETLIFY_SITE_ID=<site-id> NETLIFY_AUTH_TOKEN=<netlify-PAT> node scripts/upload-products.mjs
```

`upload-products.mjs` now includes both new slugs (`writers-deadline-database`,
`prompt-word-bank-pack`), sourced from `build-output/`. Its sanity loop exits non-zero if a
mapped slug has no source zip, so build both before uploading. Re-run the deadline-database
build whenever `src/data/contests.json` changes so the shipped file stays current (its header
shows the compile date and days-left is computed on the buyer's machine on every open).

## Placeholders (all resolved)

- `STRIPE_CHECKOUT_PENDING` no longer appears for the five deliverable products in
  products.json (only the two non-deliverable course entries retain it, by design).
- `PRICE_ID_PENDING_deadline_database` / `PRICE_ID_PENDING_prompt_pack` are gone from
  `_deliver-lib.js` (replaced by live price ids under slug keys).

---

## Working-tree note (not part of this PR)

The working tree also contains `deadline-digest/` (untracked) and a modified
`public/writing-contests.html` that leaked in from the newsletter-send-engine branch /
build. They are intentionally **left unstaged** — this PR touches only the delivery files.
