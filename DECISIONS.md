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
