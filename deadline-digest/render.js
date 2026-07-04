// render.js
//
// Turns a single queue letter into a brand-matched HTML email and a plain-text
// part. Format is LOCKED: a pure personal letter from Bryan (greeting, body,
// "Write on, Bryan", then a P.S. carrying either a product or an affiliate).
// No masthead, no section labels, no editorial links back to the blog.
//
// Monetisation:
//  - product  letter: the "[Get it]" marker in the P.S. becomes a link to the
//    product's Stripe checkout_url (config/products.json).
//  - affiliate letter: the bare go.becomeawritertoday.com/e/<slug> in the P.S.
//    becomes a real link, and ONE FTC / ASA disclosure line is injected into
//    both the HTML and the plain-text part.
//
// The only outbound links are affiliate (merchant), product checkout (Stripe),
// or a contest organiser. Footer carries the one-click poll + the Resend
// unsubscribe token. No em dashes anywhere in rendered output.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { affiliateLink, DISCLOSURE_LINE } from "./config/affiliates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config", "products.json"), "utf8")
).products;

const BRAND = {
  cream: "#f6f4ef",
  card: "#ffffff",
  red: "#b23a48",
  ink: "#2b2b2b",
  muted: "#6b6b6b",
  serif: "Georgia, 'Times New Roman', Times, serif",
};

const DEFAULT_SITE_URL = "https://becomeawritertoday.com";
// Match a bare branded affiliate link inside prose, e.g. go.becomeawritertoday.com/e/grammarly
const BARE_AFFILIATE_RE = /go\.becomeawritertoday\.com\/e\/([a-z0-9-]+)/i;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Resolve the single monetisation link a letter carries.
export function resolveMonetiseLink(letter) {
  if (letter.monetise === "product") {
    const product = products[letter.detail];
    return {
      kind: "product",
      productName: letter.detail,
      url: product ? product.checkout_url : null,
      missing: !product,
    };
  }
  if (letter.monetise === "affiliate") {
    const slug = letter.detail;
    return { kind: "affiliate", slug, url: affiliateLink(slug), missing: false };
  }
  return { kind: "none", url: null, missing: false };
}

// Body -> array of paragraph strings (split on blank line). Single newlines
// inside a paragraph are preserved as soft line breaks.
function splitParagraphs(body) {
  return String(body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ---- P.S. link injection -------------------------------------------------

// Inject the monetisation link into the P.S. for the HTML part.
function psToHtml(letter) {
  const link = resolveMonetiseLink(letter);
  let ps = escapeHtml(letter.ps);
  if (link.kind === "product" && link.url) {
    const anchor = `<a href="${escapeHtml(link.url)}" style="color:${BRAND.red};font-weight:bold;text-decoration:underline;">Get it</a>`;
    ps = ps.replace(/\[Get it\]/g, anchor);
  } else if (link.kind === "affiliate") {
    const url = link.url;
    const anchor = `<a href="${escapeHtml(url)}" style="color:${BRAND.red};font-weight:bold;text-decoration:underline;">${escapeHtml(url)}</a>`;
    ps = ps.replace(BARE_AFFILIATE_RE, anchor);
  }
  return ps.replace(/\n/g, "<br>");
}

// Inject the monetisation link into the P.S. for the plain-text part.
function psToText(letter) {
  const link = resolveMonetiseLink(letter);
  let ps = letter.ps;
  if (link.kind === "product" && link.url) {
    ps = ps.replace(/\[Get it\]/g, `Get it: ${link.url}`);
  } else if (link.kind === "affiliate") {
    ps = ps.replace(BARE_AFFILIATE_RE, link.url);
  }
  return ps;
}

// ---- Public API ----------------------------------------------------------

export function renderLetter(letter, opts = {}) {
  const siteUrl = (opts.siteUrl || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  const issueId = letter.n;
  const isAffiliate = letter.monetise === "affiliate";

  const bodyParas = splitParagraphs(letter.body);
  const psHtml = psToHtml(letter);
  const psText = psToText(letter);

  const voteUp = `${siteUrl}/vote?issue=${issueId}&v=up`;
  const voteDown = `${siteUrl}/vote?issue=${issueId}&v=down`;

  const html = renderHtml({ letter, bodyParas, psHtml, isAffiliate, voteUp, voteDown });
  const text = renderText({ letter, bodyParas, psText, isAffiliate, voteUp, voteDown });

  return { subject: letter.subject, preview: letter.preview, html, text };
}

function renderHtml({ letter, bodyParas, psHtml, isAffiliate, voteUp, voteDown }) {
  const paraStyle = `margin:0 0 18px 0;font-family:${BRAND.serif};font-size:17px;line-height:1.65;color:${BRAND.ink};`;
  const bodyHtml = bodyParas
    .map((p) => `<p style="${paraStyle}">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  const disclosureHtml = isAffiliate
    ? `<p style="margin:18px 0 0 0;font-family:${BRAND.serif};font-size:13px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(DISCLOSURE_LINE)}</p>`
    : "";

  const preheader = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(letter.preview)}</div>`;

  return `<!-- pure personal letter: ${escapeHtml(letter.subject)} -->
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.card};border-radius:6px;">
        <tr>
          <td style="padding:32px 28px;">
${bodyHtml}
            <p style="${paraStyle}margin-top:22px;">${psHtml}</p>
${disclosureHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 28px 28px;border-top:1px solid #e7e3da;">
            <p style="margin:0 0 10px 0;font-family:${BRAND.serif};font-size:14px;color:${BRAND.muted};">
              Was this one useful?
              <a href="${voteUp}" style="color:${BRAND.red};text-decoration:underline;">Yes</a>
              &nbsp;/&nbsp;
              <a href="${voteDown}" style="color:${BRAND.red};text-decoration:underline;">No</a>
            </p>
            <p style="margin:0;font-family:${BRAND.serif};font-size:12px;color:${BRAND.muted};">
              <a href="{{RESEND_UNSUBSCRIBE_URL}}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function renderText({ letter, bodyParas, psText, isAffiliate, voteUp, voteDown }) {
  const parts = [];
  parts.push(bodyParas.join("\n\n"));
  parts.push(psText);
  if (isAffiliate) parts.push(DISCLOSURE_LINE);
  parts.push("");
  parts.push("--");
  parts.push(`Was this one useful?  Yes: ${voteUp}   No: ${voteDown}`);
  parts.push("Unsubscribe: {{RESEND_UNSUBSCRIBE_URL}}");
  return parts.join("\n\n").replace(/\n{3,}/g, "\n\n") + "\n";
}
