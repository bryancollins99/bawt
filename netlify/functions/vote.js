// netlify/functions/vote.js
//
// One-click newsletter poll. The footer of each letter links here:
//   GET /vote?issue=<id>&v=up   (or v=down)
// Records the vote in Netlify Blobs and returns a tiny thank-you page.
//
// Store layout: one blob per issue, key `issue-<id>`, holding { up, down }.
// Reads are best-effort; a first vote initialises the counter.

import { getStore } from "@netlify/blobs";

function page(title, message) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
  body { margin:0; background:#f6f4ef; color:#2b2b2b;
    font-family: Georgia, 'Times New Roman', Times, serif;
    display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .card { background:#fff; max-width:420px; width:90%; padding:36px 32px;
    border-radius:8px; text-align:center; }
  h1 { color:#b23a48; font-size:22px; margin:0 0 12px; }
  p { font-size:16px; line-height:1.6; margin:0; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

function html(body, status = 200) {
  return {
    statusCode: status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    body,
  };
}

export async function handler(event) {
  const params = (event && event.queryStringParameters) || {};
  const issue = String(params.issue || "").trim();
  const vote = String(params.v || "").trim().toLowerCase();

  if (!issue || !/^[a-z0-9-]{1,64}$/i.test(issue) || (vote !== "up" && vote !== "down")) {
    return html(page("Hmm", "That vote link looks off. No harm done."), 400);
  }

  try {
    const store = getStore("newsletter-votes");
    const key = `issue-${issue}`;
    const current = (await store.get(key, { type: "json" })) || { up: 0, down: 0 };
    current[vote] = (current[vote] || 0) + 1;
    await store.setJSON(key, current);
  } catch (e) {
    // Never fail the reader's click on a storage hiccup.
    return html(page("Thanks", "Thanks for the feedback. It did not save cleanly, but your click counts."));
  }

  const msg =
    vote === "up"
      ? "Glad this one landed. Thanks for telling me."
      : "Noted. Thanks for the honest signal. I read every one of these.";
  return html(page("Thanks", msg));
}
