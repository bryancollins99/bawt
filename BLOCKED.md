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
