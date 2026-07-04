// subscribe.js - double opt-in step 1.
//
// POST { email, genre } where genre is one of fiction|poetry|nonfiction|all
// (anything else falls back to "all"). Creates an UNCONFIRMED contact
// (unsubscribed:true) in the base segment carrying source_surface +
// consent_timestamp, builds an HMAC-signed confirm URL, and sends the confirm
// email - GUARDED: when BAWT_DRY_RUN=1 or RESEND_API_KEY is unset, the send is
// skipped and the confirmUrl is returned/logged instead. Never sends in tests.

import {
  sign,
  normalizeGenre,
  createContact,
  sendEmail,
  isDryRun,
  jsonResponse,
  BASE_SEGMENT_ID,
} from './_lib.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(event) {
  if (!event || !event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    // Fall back to form-encoded bodies (defensive; surfaces post JSON).
    const params = new URLSearchParams(event.body);
    return Object.fromEntries(params.entries());
  }
}

function confirmEmail(confirmUrl, genre) {
  const genreLine =
    genre === 'all'
      ? 'You picked every genre, so you will get fiction, poetry, and nonfiction alerts.'
      : `You picked ${genre}, so your alerts are tuned to that.`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f6f4ef;font-family:Georgia,'Times New Roman',serif;color:#1c2430">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#8a7a6a;margin:0 0 16px">Become a Writer Today</p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;color:#b23a48">Confirm your subscription</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Thanks for signing up for writing deadline alerts. Click the button below to confirm your email and start receiving them.</p>
    <p style="margin:0 0 24px"><a href="${confirmUrl}" style="display:inline-block;background:#b23a48;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:8px;font-size:16px">Confirm my email</a></p>
    <p style="font-size:15px;line-height:1.6;color:#5a6472;margin:0 0 8px">${genreLine}</p>
    <p style="font-size:13px;line-height:1.6;color:#8a93a0;margin:24px 0 0">If the button does not work, copy and paste this link into your browser:<br><span style="word-break:break-all;color:#b23a48">${confirmUrl}</span></p>
    <p style="font-size:13px;line-height:1.6;color:#8a93a0;margin:16px 0 0">If you did not request this, you can safely ignore this email and nothing will happen.</p>
  </div>
</body></html>`;
  const text = `Confirm your subscription\n\nThanks for signing up for writing deadline alerts from Become a Writer Today. Confirm your email to start receiving them:\n\n${confirmUrl}\n\n${genreLine}\n\nIf you did not request this, you can safely ignore this email.`;
  return { html, text };
}

export const handler = async (event) => {
  if (event && event.httpMethod === 'OPTIONS') return jsonResponse(200, { ok: true });
  if (event && event.httpMethod && event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed' });
  }

  const body = parseBody(event);
  const email = String(body.email || '').trim().toLowerCase();
  const genre = normalizeGenre(body.genre);
  const source = String(body.source_surface || body.source || 'unknown').slice(0, 64);

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse(400, { ok: false, error: 'A valid email is required.' });
  }

  const consentTimestamp = new Date().toISOString();

  // Create the UNCONFIRMED contact in the base segment. Genre topics are NOT
  // opted-in until the confirm step; the contact stays unsubscribed until then.
  try {
    if (process.env.RESEND_API_KEY) {
      await createContact({
        email,
        unsubscribed: true,
        properties: { source_surface: source, consent_timestamp: consentTimestamp },
        segments: [{ id: BASE_SEGMENT_ID }],
      });
    }
  } catch (err) {
    // A contact that already exists is fine for a re-signup; log and continue to
    // re-send the confirm link rather than failing the visitor.
    console.warn('subscribe: createContact warning:', err.message);
  }

  const token = sign(email, genre, source);
  const siteUrl = (process.env.SITE_URL || 'https://tools.becomeawritertoday.com').replace(/\/+$/, '');
  const confirmUrl = `${siteUrl}/.netlify/functions/confirm?token=${encodeURIComponent(token)}`;

  // GUARD: never send in dry-run / test / unconfigured environments.
  if (isDryRun()) {
    console.log(`[dry-run] confirm URL for ${email} (${genre}/${source}): ${confirmUrl}`);
    return jsonResponse(200, { ok: true, dryRun: true, confirmUrl });
  }

  try {
    const { html, text } = confirmEmail(confirmUrl, genre);
    await sendEmail({ to: email, subject: 'Confirm your writing deadline alerts', html, text });
  } catch (err) {
    console.error('subscribe: sendEmail failed:', err.message);
    return jsonResponse(502, { ok: false, error: 'Could not send the confirmation email. Please try again.' });
  }

  return jsonResponse(200, { ok: true, dryRun: false });
};
