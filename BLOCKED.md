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
