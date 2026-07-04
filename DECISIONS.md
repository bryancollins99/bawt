# DECISIONS — list-capture foundation (PRD-1)

Branch: `leadgen/list-capture-foundation`. Non-trivial calls made during the build.

## Data / list model
- **One base segment + genre TOPICS** (Resend preference center), not four audiences.
  Genre picker maps: `fiction | poetry | nonfiction | everything`; `everything` = `all` =
  opt into all three topics. Overrides PRD-1's "four audiences" open question.
- Provisioned IDs are baked into `netlify/functions/_lib.js` as **env-overridable
  constants** (`process.env.X || '<real-id>'`) so the functions work with only the four
  env vars the PR body lists set. Values:
  - base segment `127c2985-952e-4e00-a192-ae26645e5b78`
  - topics: fiction `afe848e8-89f4-45df-966f-ec0cdce80658`, poetry
    `d550f41b-bd2e-46b1-9a3c-69e2f2ccefcc`, nonfiction `4bef07fe-6aee-4258-ac37-25471d4dba65`
  - contact properties: `source_surface`, `consent_timestamp`
  - from: `Become a Writer Today <bryan@becomeawritertoday.com>` (env `RESEND_FROM` overrides)

## Double opt-in flow
- `subscribe.js` creates the contact `unsubscribed:true` in the base segment with
  `source_surface` + `consent_timestamp`. Genre is NOT opted-in here; it rides in the
  signed confirm token and is applied at confirm. Contact stays unsubscribed until the
  click. Confirm email send is guarded: skipped when `BAWT_DRY_RUN=1` OR `RESEND_API_KEY`
  is unset; the `confirmUrl` is returned/logged instead.
- `confirm.js` is idempotent by construction: it updates (never creates), the token is
  stateless, and `addToSegment` swallows an already-member response (409/422) as success,
  so clicking the link twice is safe. It also re-adds the base segment (subscribe already
  added it) which the idempotent helper tolerates.
- Token: `base64url(payloadJSON).base64url(HMAC-SHA256)` over `email|genre|source` with a
  ~48h absolute expiry baked into the payload. `verify()` never throws (length-guarded
  timing-safe compare) and returns `null` for malformed / tampered / expired tokens.
- In dry-run/local (`RESEND_API_KEY` unset), `confirm.js` still renders the success page so
  the whole path is verifiable without a live key.

## Resend REST shapes (verified against live docs 2026-07-04)
- `POST /contacts` with `{ email, unsubscribed, properties, segments:[{id}], topics }` — a
  GLOBAL contacts endpoint (not audience-scoped). Confirmed on the live create-contact page.
- `PATCH /contacts/{id|email}` with `{ unsubscribed, properties }` — confirmed.
- `PATCH /contacts/{id|email}/topics` with a BARE array `[{ id, subscription }]` — see BLOCKED
  (docs mildly ambiguous on bare-array vs `{topics:[...]}` wrapper; isolated in one helper).
- `POST /contacts/{id|email}/segments/{segment_id}` (path params) to add to a segment — see
  BLOCKED (exact path/verb the least certain of the five; isolated in one helper). All email
  sending is gated, so an incorrect shape cannot fire live this session.
- `POST /emails` with `{ from, to, subject, html, text }` — standard.

## Surfaces
- Contests DB card: injected into the TEMPLATE `scripts/build-contest-page.mjs` (not the
  generated file), then `npm run prebuild` regenerated `public/writing-contests.html` which
  is committed. `source_surface="contests-db"`.
- Dashboard: an ADDITIVE `<section class="card">` appended after the log card in
  `public/writing-dashboard.html` (file not rewritten). `source_surface="dashboard"`.
- Exit-intent modal: new `public/exit-intent.js`, included on the SPA (`index.html`) and the
  three static pages. Fires once per visitor (localStorage `bawt_exit_intent_shown`), on
  pointer-leaves-top only, dismissible (X / overlay / Escape), respects
  `prefers-reduced-motion`, and self-suppresses inside an embed iframe or `?embed=` URL so it
  never misfires in an embedded tool. `source_surface="exit-intent"`.

## Kit repoints (closes list-fragmentation gap, risk #8)
- `src/components/ContestFinder.jsx` `DeadlineAlertsForm` and
  `public/book-deadline-planner.html` no longer POST to Kit form `8060129`; both now POST
  JSON to `/.netlify/functions/subscribe` with genre + `source_surface`
  (`contest-finder` / `book-deadline-planner`). ContestFinder gained a genre picker; the book
  planner defaults `genre:"all"`.
- Kit is NOT ripped out anywhere else (per brief). The book planner previously promised a
  plan link by email via a Kit custom field; the foundation confirm email is the generic
  deadline-alerts confirmation, so the "your plan link" copy was softened to a plain confirm
  message. Delivering the plan link through Resend is out of scope for this foundation.

## Styling / copy
- Capture surfaces use serif display + red `#b23a48` accent. No em dashes anywhere
  (grep-verified zero on the generated contests HTML, the modal JS, and all touched surfaces).

## Preference / unsubscribe (conscious DEFER, not a silent gap)
- Native Resend unsubscribe (topic preference center) covers the unsubscribe link on real
  sends. A custom hosted genre-change preference page is NOT built in this foundation (not in
  scope items 1-7). Flagged as a MISS in the PR DoD table.

---

# DECISIONS - Newsletter send engine

Scope of this branch (`feat/newsletter-send-engine`): the send layer only. It
renders queued personal letters and sends them as Resend broadcasts. Nothing
here live-sends. Branched off `main`, independent of the unmerged capture PR
(#15, `leadgen/list-capture-foundation`).

## Two templates
1. **Evergreen letter** (Mon / Wed / Fri) - a pure personal letter from Bryan:
   greeting, body in his voice, "Write on, Bryan", then a **P.S. carrying an
   affiliate AND a P.P.S. carrying a product** (dual monetisation, every send).
2. **Deadline Digest** (Thursday) - a second template rebuilt live from
   `../src/data/contests.json`: a short title + a soonest-first list of open
   calls, each linking to the organiser, with the same dual-monetisation footer.

`send.js` routes by weekday automatically (UTC Thursday -> digest, else letter);
`--digest` / `--letter` override.

## Format (locked, not redesigned)
No masthead, no section labels, no editorial links back to becomeawritertoday.com.
The only outbound links are affiliate (merchant, via the go-domain), product
checkout (Stripe), or a contest organiser, plus two footer utilities: the
one-click poll and the Resend unsubscribe token. Matches
`bawt-email-formats.html`.

## Dual monetisation (every send)
Each send carries BOTH an affiliate (P.S., with disclosure) and a product
(P.P.S.). Affiliate rotates by thread: craft -> prowritingaid, ai -> grammarly,
freelance -> teachable, mindset/notes/prompts -> masterclass, deadlines ->
contest organiser. Product maps to one of the three LIVE Stripe products by
relevance: ai -> Claude Code for Writers, notes -> The Zettelkasten for Creators
Kit, everything else -> Filler-Word Killer Editor Pack. The product P.P.S. always
links to a live `checkout_url` (never a placeholder).

Awkward mappings (flagged for Bryan): letters 3 (freelance-income) and 6
(mindset) have no live product that fits their subject, so both cross-sell the
Filler-Word Killer Editor Pack. Their natural products (How to Earn $3-5k Writing
Online; The Fearless Creative) are still `STRIPE_CHECKOUT_PENDING`; swap the
P.P.S. once those have live checkouts.

## Clean hyperlinks
The HTML part shows anchor TEXT only (e.g. "ProWritingAid", "the Filler-Word
Killer Editor Pack") - the URL lives only in the `href`, never in visible copy.
The plain-text part shows "anchor (url)". Letter P.S./P.P.S. copy is stored in
queue.json with a `{{LINK}}` token that render.js replaces with the anchor. The
self-test strips tags and asserts no `http`/go-domain/stripe URL appears in the
visible HTML.

## Data source
`deadline-digest/data/queue.json` was extracted from the review HTML's
`<script id="data">` block: a 36-slot `calendar` (weeks 1-12, 3 per week, which
maps to the Mon/Wed/Fri cadence) and 9 drafted `letters`. Letter `n` maps to
calendar slot `n` (1-based). Slots 10-36 have no drafted body yet, so they are
not sendable until their letters are written. Each letter now carries structured
`affiliate` and `product` objects (slug/name, anchor, `{{LINK}}` text); a
`generatedAt` timestamp and a nullable `topic` field are also present. The
digest reads `src/data/contests.json` live (fields: name, genres[], fee,
freeEntry, deadline, prize, url, region, stale).

## Real values wired
- From: `Become a Writer Today <bryan@becomeawritertoday.com>` (Resend EU;
  domain verified).
- Base segment `127c2985-952e-4e00-a192-ae26645e5b78`; genre topics
  fiction/poetry/nonfiction wired as env-overridable defaults in `send.js`.
- Affiliate links: `https://go.becomeawritertoday.com/e/<slug>` for slugs
  grammarly, prowritingaid, masterclass, teachable.

## Genre topic assignment
All 9 drafted letters ship as `topic: null` (base segment only). They are
general craft/AI/income letters meant for the whole list, so filtering them to a
genre topic would shrink reach with no editorial reason. The topic-filter
mechanism (`resolveAudience`) is fully built and self-tested against a synthetic
fiction letter; to route a real letter to a genre, set its `topic` in
queue.json. Genre is deliberately NOT inferred from the thread label.

## Products
`deadline-digest/config/products.json` maps product name -> { checkout_url,
blurb }. Three now have LIVE Stripe checkouts: Filler-Word Killer Editor Pack,
Claude Code for Writers, The Zettelkasten for Creators Kit. The rest stay
`STRIPE_CHECKOUT_PENDING`. render.js rewrites the `{{LINK}}` token in a product
P.P.S. into an anchor pointing at that product's `checkout_url`.

## Affiliate disclosure
Every affiliate P.S. carries one FTC / ASA disclosure line in both the HTML and
plain-text parts (a styled small-print line under the P.S.).

## Risk fixes (from BUILD-PLAN risk table)
- R2 freshness: for the letter queue, staleness is computed from the queue's
  `generatedAt` field (falling back to `git log -1 --format=%cI`), NEVER
  filesystem mtime. Fail-closed: MAX_DATA_AGE_DAYS = 120 (letters are evergreen).
  For the digest, contests staleness is computed from the git commit time of
  `src/data/contests.json` (CONTESTS_MAX_AGE_DAYS = 14, tighter because
  deadlines are time-sensitive); unknown age counts as stale. The Action uses
  `fetch-depth: 0` so `git log` on the file resolves in CI.
- R4 empty targets: `partitionTargets` skips empty targets individually. The run
  aborts (exit 1) only if EVERY resolved target for a send is empty. The digest
  additionally skips gracefully (exit 0) when no contest is in the window.
- R7 idempotency: keyed on the Resend broadcast name (`bawt-letter-<n>` for
  letters, `digest-<YYYY-MM-DD>` for the weekly digest), read back via
  list-broadcasts, so a slot is never sent twice. No committed ledger.

## Safety / guards
Dry run (writes `preview-<n>.html` + `.txt`, sends nothing) whenever `--dry` is
passed, `BAWT_DRY_RUN=1`, or `RESEND_API_KEY` is unset. The `resend` SDK is only
loaded via dynamic import inside the guarded live path, so dry runs and the
self-test never need it installed. The Action defaults to `--dry` and only
attempts a live send when the repo var `NEWSLETTER_LIVE == 'true'`.

## Isolation
`deadline-digest/` has its own ESM package.json and node_modules; it is a
sibling of `src/`, never imported by it, so it does not enter the Vite build.
Confirmed: `npm run build` exits 0 and dist/ contains no send-engine files.
`preview-*.html/.txt` and node_modules are gitignored.

## Netlify Blobs
`vote.js` uses `@netlify/blobs`. It is listed in the root package.json
`dependencies` so Netlify's function bundler resolves it deterministically
(rather than relying on the runtime auto-providing it, which is version
dependent). It does NOT enter the Vite build: Vite only bundles what `src/`
imports, and nothing in `src/` imports it, so `dist/` stays clean (verified).

---

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
