// confirm.js - double opt-in step 2 (the click target).
//
// GET ?token=... - verifies the HMAC token, then:
//   updateContact(unsubscribed:false, consent_timestamp)
//   -> addToSegment(base)                (idempotent; duplicate = success)
//   -> updateContactTopics(opt_in genre) ("all" -> all three topics)
// Idempotent by construction: it updates (never creates), the token is
// stateless, and addToSegment tolerates an existing membership, so clicking the
// link twice is safe. Returns an inline brand-tokened HTML page either way.

import {
  verify,
  topicsForGenre,
  updateContact,
  addToSegment,
  updateContactTopics,
  htmlResponse,
  BASE_SEGMENT_ID,
} from './_lib.js';

function page(title, heading, message) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Become a Writer Today</title>
<style>
  :root{--paper:#f6f4ef;--ink:#1c2430;--ink-2:#5a6472;--brand:#b23a48;--brand-hover:#8f2c39;--line:#e5e3dc}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font-family:Georgia,'Times New Roman',serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{max-width:520px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:40px 32px;text-align:center}
  .eyebrow{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2);margin-bottom:18px}
  h1{font-size:26px;line-height:1.2;color:var(--brand);margin-bottom:14px}
  p{font-size:16px;line-height:1.6;color:var(--ink-2);margin-bottom:20px}
  a.btn{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px}
  a.btn:hover{background:var(--brand-hover)}
</style></head>
<body>
  <div class="card">
    <p class="eyebrow">Become a Writer Today</p>
    <h1>${heading}</h1>
    <p>${message}</p>
    <a class="btn" href="https://becomeawritertoday.com/">Back to the site</a>
  </div>
</body></html>`;
}

export const handler = async (event) => {
  const token = event && event.queryStringParameters && event.queryStringParameters.token;
  const data = verify(token);

  if (!data) {
    return htmlResponse(
      400,
      page(
        'Link expired',
        'This link is no longer valid',
        'The confirmation link has expired or is not recognised. Please sign up again to get a fresh link.'
      )
    );
  }

  const consentTimestamp = new Date().toISOString();

  // API calls only run when configured. In dry-run / local / test the flow still
  // renders the success page so the double opt-in path is verifiable end to end.
  if (process.env.RESEND_API_KEY) {
    try {
      await updateContact({
        email: data.email,
        unsubscribed: false,
        properties: { consent_timestamp: consentTimestamp },
      });
      await addToSegment({ email: data.email, segmentId: BASE_SEGMENT_ID });
      await updateContactTopics({ email: data.email, topics: topicsForGenre(data.genre, 'opt_in') });
    } catch (err) {
      console.error('confirm: failed to finalise subscription:', err.message);
      return htmlResponse(
        500,
        page(
          'Something went wrong',
          'We could not finish confirming you',
          'Please try the link again in a moment. If it keeps failing, sign up once more to get a fresh link.'
        )
      );
    }
  }

  const genreLine =
    data.genre === 'all'
      ? 'You are opted in to fiction, poetry, and nonfiction deadline alerts.'
      : `You are opted in to ${data.genre} deadline alerts.`;

  return htmlResponse(
    200,
    page(
      'You are confirmed',
      'You are all set',
      `Your email is confirmed. ${genreLine} You can change your preferences or unsubscribe from any email we send.`
    )
  );
};
