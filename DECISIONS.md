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
