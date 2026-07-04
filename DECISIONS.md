# DECISIONS - Newsletter send engine

Scope of this branch (`feat/newsletter-send-engine`): the send layer only. It
renders queued personal letters and sends them as Resend broadcasts. Nothing
here live-sends. Branched off `main`, independent of the unmerged capture PR
(#15, `leadgen/list-capture-foundation`).

## Format (locked, not redesigned)
Each send is a pure personal letter from Bryan: greeting, body in his voice,
"Write on, Bryan", then a P.S. carrying EITHER a product or an affiliate. No
masthead, no section labels, no editorial links back to becomeawritertoday.com.
The only outbound links are affiliate (merchant, via the go-domain), product
checkout (Stripe), or a contest organiser, plus two footer utilities: the
one-click poll and the Resend unsubscribe token.

## Data source
`deadline-digest/data/queue.json` was extracted verbatim from the review HTML's
`<script id="data">` block: a 36-slot `calendar` (weeks 1-12, 3 per week, which
maps to the Mon/Wed/Fri cadence) and 9 drafted `letters`. Letter `n` maps to
calendar slot `n` (1-based). Slots 10-36 have no drafted body yet, so they are
not sendable until their letters are written. A `generatedAt` timestamp and a
`topic` field (default `null`) were added; nothing else was changed.

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
blurb }. Every `checkout_url` is the placeholder `STRIPE_CHECKOUT_PENDING`. The
`[Get it]` marker in a product letter's P.S. is rewritten by render.js into a
link to that product's checkout_url. Drop in the live Stripe Checkout URLs
before enabling live sends.

## Affiliate disclosure
Affiliate letters get ONE standalone FTC / ASA disclosure line injected into
both the HTML and plain-text parts, in addition to Bryan's own inline P.S.
wording. Belt-and-braces on compliance; the injected line is what the self-test
guarantees.

## Risk fixes (from BUILD-PLAN risk table)
- R2 freshness: staleness is computed from the queue's `generatedAt` field
  (falling back to `git log -1 --format=%cI` on the file), NEVER filesystem
  mtime, which git resets to "now" on every checkout. Fail-closed:
  MAX_DATA_AGE_DAYS = 120 (generous because the letters are evergreen), and an
  unknown timestamp counts as stale.
- R4 empty targets: `partitionTargets` skips empty targets individually. The run
  aborts (exit 1) only if EVERY resolved target for a letter is empty, never
  because a single genre segment is empty.
- R7 idempotency: keyed on the Resend broadcast name (`bawt-letter-<n>`), read
  back via list-broadcasts, so a slot is never sent twice. No committed ledger.

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
`vote.js` uses `@netlify/blobs`, which the Netlify Functions runtime provides
automatically; it is intentionally NOT added to the root package.json (that
would pull it into the Vite dependency tree).
