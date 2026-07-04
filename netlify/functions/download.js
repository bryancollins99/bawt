// netlify/functions/download.js
//
// GET /download?token=... : verify the HMAC download token (timing-safe) and
// its expiry, then stream the matching zip from the private Netlify Blobs store
// as an attachment. Never serves a file without a valid, unexpired token.

import {
  verifyToken,
  productForSlug,
  getProductStore,
} from "./_deliver-lib.js";

function page(title, message, status = 200) {
  const body = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>
  body { margin:0; background:#f6f4ef; color:#2b2b2b; font-family: Georgia,'Times New Roman',Times,serif;
    display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .card { background:#fff; max-width:460px; width:90%; padding:36px 32px; border-radius:8px; text-align:center; }
  h1 { color:#b23a48; font-size:22px; margin:0 0 12px; }
  p { font-size:16px; line-height:1.6; margin:0; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
  return {
    statusCode: status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    body,
  };
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== "GET") {
    return page("Not allowed", "This link only works with a browser download request.", 405);
  }

  const token = (event.queryStringParameters && event.queryStringParameters.token) || "";
  const secret = process.env.DELIVER_TOKEN_SECRET;

  const check = verifyToken(secret, token);
  if (!check.valid) {
    if (check.reason === "expired") {
      return page(
        "Link expired",
        "This download link has expired. Reply to your purchase email and I will send a fresh one.",
        410,
      );
    }
    return page(
      "Invalid link",
      "This download link is not valid. Please use the link from your purchase email.",
      403,
    );
  }

  const product = productForSlug(check.payload.slug);
  if (!product) {
    return page("Not found", "We could not find the file for this link. Please contact support.", 404);
  }

  let bytes;
  try {
    const store = getProductStore();
    bytes = await store.get(product.slug, { type: "arrayBuffer" });
  } catch (e) {
    console.error(`[download] blob read error for ${product.slug}: ${e.message}`);
    return page("Temporary problem", "We could not fetch your file just now. Please try again shortly.", 500);
  }

  if (!bytes) {
    console.error(`[download] missing blob for slug ${product.slug}`);
    return page("Not found", "The file for this link is not available. Please contact support.", 404);
  }

  const buf = Buffer.from(bytes);
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${product.filename}"`,
      "content-length": String(buf.length),
      "cache-control": "no-store",
    },
    body: buf.toString("base64"),
    isBase64Encoded: true,
  };
}
