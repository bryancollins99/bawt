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

1. **Remaining Stripe checkout URLs.** Three products now have LIVE checkouts
   (Filler-Word Killer Editor Pack, Claude Code for Writers, The Zettelkasten for
   Creators Kit) and every drafted letter's P.P.S. links to one of them. Still
   `STRIPE_CHECKOUT_PENDING`: How to Earn $3-5k Writing Online, The Fearless
   Creative, Writers' Deadline Database, Prompt / Word-Bank Pack. Consequences:
   - Letters 3 (freelance) and 6 (mindset) cross-sell the Filler-Word pack
     because their natural products are still pending. Swap the P.P.S. once
     "How to Earn $3-5k Writing Online" / "The Fearless Creative" go live.
   - The Thursday digest cross-sells the Filler-Word pack; switch it to the
     Writers' Deadline Database automatically the moment that product gets a real
     checkout_url (the digest already prefers it when live).

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
