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
   `filler-word-pack`, `claude-code-for-writers`, `zettelkasten-kit`,
   `writers-deadline-database`, `prompt-word-bank-pack`. Zips live outside the repo (older
   three in `~/src`, the two built-in-repo products in `build-output/`), are `.gitignore`d
   (`*.zip`), and are never placed in `public/` or `dist/`. There is no public route to the
   store; the only reachable path is `/download` behind a valid token.

2. **Product resolution = `session.metadata.slug` (PRIMARY, no secret key).** Every live
   Stripe Payment Link carries `metadata.slug`, and Stripe copies payment-link metadata onto
   the `checkout.session`, so `checkout.session.completed` arrives with `metadata.slug` set.
   `resolveProductFromSession()` reads that slug and maps it directly to the product via the
   slug-keyed `PRODUCTS` map — **no `STRIPE_SECRET_KEY` is required**. The stated env set
   (`STRIPE_WEBHOOK_SECRET` + `DELIVER_TOKEN_SECRET` + `RESEND_API_KEY`) is therefore
   sufficient to fulfil a live purchase. The legacy price-id path (`resolvePriceId()`: inline
   `line_items`, `metadata.price_id`, then a live line-item retrieval that needs
   `STRIPE_SECRET_KEY`) is retained ONLY as a fallback for a session that somehow lacks
   `metadata.slug`; each product also stores its live `price_id` so `PRICE_TO_SLUG` resolves
   the fallback. `PRODUCTS` is keyed by slug; `productForPrice()` goes price -> slug -> product.

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

# DECISIONS — Two new digital products (deadline database + prompt pack)

Adds two buildable, self-contained products that plug into the existing delivery flow.

## What this ships

1. **Writers' Deadline Database ($29)** — `scripts/build-deadline-database.mjs` reads ALL
   45 records in `src/data/contests.json` and emits ONE self-contained HTML file (embedded
   JSON + inline CSS + vanilla JS, zero external/CDN deps, works offline by double-click).
   Full-text search; filters for genre, region, free-vs-paid entry, has-cash-prize; sortable
   columns (click a header, click again to reverse); days-left computed on load; each row
   links to the organiser. Slug `writers-deadline-database`, zip `deadline-database-v1.0.zip`.
2. **Prompt / Word-Bank Pack ($12)** — `scripts/build-prompt-pack.mjs` assembles the pack
   from the site's own generator word banks: 275 prompts (fiction 72, flash 55, poetry 40,
   nonfiction/essay 108) plus 461 vivid words in five categorised banks (descriptive,
   sensory, action verbs, emotion words, poetic words), plus a one-page drafting-session
   guide. Emits BOTH printable HTML and a markdown version. Slug `prompt-word-bank-pack`,
   zip `prompt-word-bank-pack-v1.0.zip`.

## Key decisions

1. **Content generator vs zip packaging are split.** Each script exports a pure
   `build({ outDir })` that returns counts + rendered artefacts; a CLI tail packages the
   zip via `zip`. `scripts/productBuildTest.mjs` drives `build()` only, so the tested path
   never needs the zip binary and no product output can leak into `dist/`. Output goes to
   the gitignored `build-output/` dir; the build scripts are NOT wired into `prebuild`/
   `build`, so `npm run build` (Vite) is unchanged and product files never reach `dist/`.
2. **Everything is deterministic.** The React generators shuffle with `Math.random()`; the
   build scripts do NOT. Word extraction is source order (then sorted); prompt assembly uses
   fixed modular strides. Reruns are diff-free and the self-test's count assertions are
   stable.
3. **Word banks are extracted from the generators, not re-invented.** `build-prompt-pack.mjs`
   parses the inline word arrays in `ActionGenerator.jsx` / `DescriptiveGenerator.jsx` /
   `PoetryWordsGenerator.jsx` (node cannot import JSX) plus the bundled `emotionWheel.json`
   (Parrott tertiary tier). Prompts also draw on `editorialTopics.json` for the nonfiction
   set. Extraction throws if any bank comes back empty, so a future generator refactor cannot
   silently ship an empty pack.
4. **Brand palette** matches the email-deliver palette named in the brief: serif (Georgia),
   cream `#f6f4ef`, red `#b23a48`. NOT the contest-page blue/paper palette. No em dashes in
   any UI copy; en/em dashes in the source contest fields are cleaned before embedding
   (number ranges become "N to M", other uses collapse to a plain hyphen), and both build
   scripts + the self-test assert zero fancy dashes in output.
5. **Wiring for go-live (now RESOLVED).** Both products have LIVE Stripe checkout links in
   `deadline-digest/config/products.json` and LIVE `price_id`s in the slug-keyed
   `_deliver-lib.js` `PRODUCTS` map (the old `PRICE_ID_PENDING_*` placeholder keys are gone).
   `scripts/upload-products.mjs` carries both zips (sourced from `build-output/`, a deliberate
   mix with the older `~/src` zips). `deliverTest.mjs` asserts all 5 slugs are distinct and
   live. Delivery resolves each product from `session.metadata.slug`, so purchases fulfil
   without `STRIPE_SECRET_KEY`.

---

# DECISIONS — Leadgen + newsletter integration (checkout wiring, slug delivery, sales tracking, wordmark)

Branch: `integration/leadgen-newsletter` (PR #18). Ties the send engine, the five live
Stripe products, and delivery together, and adds conversion tracking.

## Checkout URLs wired
All 5 products now carry LIVE Stripe checkout links in
`deadline-digest/config/products.json`. Wiring the Writers' Deadline Database URL flips
`digestProduct()` to cross-sell the database (its `dbUrl !== PENDING` branch) instead of the
Filler-Word pack, as designed. The two non-deliverable course entries (How to Earn $3-5k,
The Fearless Creative) stay `STRIPE_CHECKOUT_PENDING` — no live product exists for them and no
drafted letter references them.

## Delivery keyed by slug
`_deliver-lib.js` `PRODUCTS` is keyed by SLUG (== Blobs key == `session.metadata.slug`), each
entry carrying its live `price_id`. `resolveProductFromSession()` resolves `metadata.slug`
first (secret-key-free), falling back to the price-id path via `PRICE_TO_SLUG`. The webhook and
`download.js` both resolve by slug. This drops the `STRIPE_SECRET_KEY` requirement.

## Conversion tracking
On `checkout.session.completed`, after minting the download, the webhook writes ONE record to
the private Netlify Blobs store `product-sales`, keyed `"<ISO ts>_<slug>"`, value
`{ slug, amount_total, currency, email_hash, ts }`. The buyer email is SHA-256 hashed
(`hashEmail`), never stored raw. Writes are guarded by the same dry-run/secret gating as the
send (skipped in dry-run) and are best-effort (a metrics failure never blocks fulfilment).
`netlify/functions/sales-stats.js` serves `GET /_sales` (wired in `netlify.toml`): per-slug
count + gross, overall count + gross + `gross_display` (major units). The stats response
exposes only slug/count/gross, never email hashes.

## Brand wordmark
`render.js` `brandWordmarkHtml()` emits a small red letter-spaced uppercase eyebrow
("Become a Writer Today", 11px, .18em, matching the `.brand` style in
`bawt-email-formats.html`). It sits at the very top of both the evergreen letter body and the
digest (the digest keeps its "The Deadline Digest" title below the wordmark). It is a single
wordmark line, not a masthead. Zero em dashes.
