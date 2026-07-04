# BLOCKED - Newsletter send engine

Everything in this branch builds, dry-runs, and self-tests without any of the
below. These are the only things standing between here and a real send. None was
actioned this session (no live sends, no merges).

## Needs Bryan / external before a live send

1. **Stripe checkout URLs.** Every product in `deadline-digest/config/products.json`
   has `checkout_url: "STRIPE_CHECKOUT_PENDING"`. Product-letter P.S. links point
   at the placeholder until real Stripe Checkout links are dropped in. Products
   awaiting a link: Filler-Word Killer Editor Pack, How to Earn $3-5k Writing
   Online, The Fearless Creative, Claude Code for Writers, The Zettelkasten for
   Creators Kit, Writers' Deadline Database, Prompt / Word-Bank Pack.

2. **Affiliate program terms per slug.** The letters link grammarly, prowritingaid,
   masterclass, teachable via `go.becomeawritertoday.com/e/<slug>`. Confirm each
   program permits promotion by email, and that the go-domain redirector actually
   resolves those slugs, before the first live send.

3. **Contest-organiser slot.** Calendar slot 12 (week 4, "15 Poetry Contests")
   is `monetise: affiliate` with `detail: "contest organiser"`. No letter is
   drafted for it yet and no organiser URL exists. When that letter is written,
   its P.S. needs a direct organiser link (not a go-domain slug).

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

## Gated OFF by design (do not flip without the above)
- Repo var `NEWSLETTER_LIVE` (leave unset -> Action runs `--dry`).
- Secret `RESEND_API_KEY` (unset -> send.js dry-runs even if invoked as live).
- Repo vars `SITE_URL`, `RESEND_BASE_SEGMENT_ID`, `RESEND_TOPIC_*` (send.js has
  correct defaults; set these to override per environment).
