// render.js
//
// Turns a single queue letter into a brand-matched HTML email and a plain-text
// part. Format is LOCKED: a pure personal letter from Bryan (greeting, body,
// "Write on, Bryan"), then a P.S. carrying an affiliate AND a P.P.S. carrying a
// product. Every letter carries BOTH. No masthead, no section labels, no
// editorial links back to the blog.
//
// Clean hyperlinks: the HTML part shows anchor TEXT only, never a raw URL. The
// URL lives only in the href. The plain-text part shows "anchor (url)".
//
//  - affiliate P.S.: anchor -> https://go.becomeawritertoday.com/e/<slug>,
//    followed by one FTC / ASA disclosure line (in both parts).
//  - product P.P.S.: anchor -> the product's Stripe checkout_url.
//
// Footer carries the one-click poll + the Resend unsubscribe token. No em
// dashes anywhere in rendered output.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { affiliateLink, DISCLOSURE_LINE } from "./config/affiliates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config", "products.json"), "utf8")
).products;

export const BRAND = {
  cream: "#f6f4ef",
  card: "#ffffff",
  red: "#b23a48",
  ink: "#2b2b2b",
  body: "#332f40",
  muted: "#6b6b6b",
  faint: "#8a8a99",
  line: "#e8e4dc",
  serif: "Georgia, 'Times New Roman', Times, serif",
};

const DEFAULT_SITE_URL = "https://becomeawritertoday.com";
const LINK_TOKEN = "{{LINK}}";

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// checkout_url for a product name (null if unknown).
export function resolveProductUrl(name) {
  const p = products[name];
  return p ? p.checkout_url : null;
}

// ---- shared P.S. / P.P.S. builders (also used by the digest) -------------

const psBlockStyle = (withBorder) =>
  `margin-top:${withBorder ? "16px" : "9px"};` +
  (withBorder ? `padding-top:15px;border-top:1px solid ${BRAND.line};` : "") +
  `font-family:${BRAND.serif};font-size:14.5px;line-height:1.6;color:${BRAND.body};`;

const anchorStyle = `color:${BRAND.red};font-weight:bold;text-decoration:none;border-bottom:1px solid rgba(178,58,72,.35);`;

function htmlAnchor(url, anchorText) {
  return `<a href="${escapeHtml(url)}" style="${anchorStyle}">${escapeHtml(anchorText)}</a>`;
}

// Replace the {{LINK}} token in a sentence with an anchor (HTML) so the URL is
// never visible copy.
function injectHtmlLink(text, url, anchorText) {
  return escapeHtml(text).replace(escapeHtml(LINK_TOKEN), htmlAnchor(url, anchorText));
}

// Plain-text: "anchor (url)".
function injectTextLink(text, url, anchorText) {
  return text.replace(LINK_TOKEN, `${anchorText} (${url})`);
}

// Build the affiliate P.S. block (with disclosure) for both parts.
export function renderAffiliatePS(affiliate) {
  const url = affiliateLink(affiliate.slug);
  const html =
    `<div style="${psBlockStyle(true)}">P.S. ${injectHtmlLink(affiliate.text, url, affiliate.anchor)}` +
    `<span style="display:block;font-size:11.5px;color:${BRAND.faint};font-style:italic;margin-top:4px;">${escapeHtml(DISCLOSURE_LINE)}</span></div>`;
  const text = `P.S. ${injectTextLink(affiliate.text, url, affiliate.anchor)}\n${DISCLOSURE_LINE}`;
  return { html, text, url };
}

// Build the product P.P.S. block for both parts.
export function renderProductPPS(product) {
  const url = resolveProductUrl(product.name);
  const html = `<div style="${psBlockStyle(false)}">P.P.S. ${injectHtmlLink(product.text, url, product.anchor)}</div>`;
  const text = `P.P.S. ${injectTextLink(product.text, url, product.anchor)}`;
  return { html, text, url, missing: !url };
}

// ---- brand wordmark -------------------------------------------------------
// A small letter-spaced red eyebrow at the very top of the email body. NOT a
// masthead block: one line, matching the `.brand` style in bawt-email-formats.html
// (11px, .18em tracking, uppercase, red, bold). Both the letter and the digest
// carry it; the digest keeps its "The Deadline Digest" title below the wordmark.
export const BRAND_WORDMARK = "Become a Writer Today";

export function brandWordmarkHtml() {
  return (
    `<div style="font-family:${BRAND.serif};font-size:11px;letter-spacing:.18em;` +
    `text-transform:uppercase;font-weight:bold;color:${BRAND.red};margin:0 0 16px;">` +
    `${escapeHtml(BRAND_WORDMARK)}</div>`
  );
}

// ---- body ----------------------------------------------------------------

function splitParagraphs(body) {
  return String(body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ---- footer (poll + unsubscribe) -----------------------------------------

function footerHtml(voteUp, voteDown) {
  return `<div style="margin-top:22px;padding-top:16px;border-top:1px solid ${BRAND.line};">
  <p style="margin:0 0 10px 0;font-family:${BRAND.serif};font-size:14px;color:${BRAND.muted};">
    Was this one useful?
    <a href="${voteUp}" style="color:${BRAND.red};text-decoration:underline;">Yes</a>
    &nbsp;/&nbsp;
    <a href="${voteDown}" style="color:${BRAND.red};text-decoration:underline;">No</a>
  </p>
  <p style="margin:0;font-family:${BRAND.serif};font-size:12px;color:${BRAND.muted};">
    <a href="{{RESEND_UNSUBSCRIBE_URL}}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>
  </p>
</div>`;
}

function footerText(voteUp, voteDown) {
  return ["--", `Was this one useful?  Yes: ${voteUp}   No: ${voteDown}`, "Unsubscribe: {{RESEND_UNSUBSCRIBE_URL}}"].join(
    "\n"
  );
}

// Wrap inner card HTML in the cream page shell.
export function pageShell(innerHtml, preheaderText) {
  const preheader = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheaderText)}</div>`;
  return `${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.card};border-radius:8px;">
        <tr>
          <td style="padding:32px 28px;">
${innerHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ---- letter footer helpers (exported for the digest) ---------------------

export function pollFooterHtml(siteUrl, issueId) {
  const base = siteUrl.replace(/\/$/, "");
  return footerHtml(`${base}/vote?issue=${issueId}&v=up`, `${base}/vote?issue=${issueId}&v=down`);
}
export function pollFooterText(siteUrl, issueId) {
  const base = siteUrl.replace(/\/$/, "");
  return footerText(`${base}/vote?issue=${issueId}&v=up`, `${base}/vote?issue=${issueId}&v=down`);
}

// ---- public API ----------------------------------------------------------

export function renderLetter(letter, opts = {}) {
  const siteUrl = (opts.siteUrl || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  const issueId = letter.n;

  const ps = renderAffiliatePS(letter.affiliate);
  const pps = renderProductPPS(letter.product);

  const paraStyle = `margin:0 0 12px 0;font-family:${BRAND.serif};font-size:16px;line-height:1.62;color:${BRAND.body};`;
  const bodyHtml = splitParagraphs(letter.body)
    .map((p) => `<p style="${paraStyle}">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  const inner = `${brandWordmarkHtml()}
${bodyHtml}
${ps.html}
${pps.html}
${pollFooterHtml(siteUrl, issueId)}`;

  const html = pageShell(inner, letter.preview);

  const text =
    [splitParagraphs(letter.body).join("\n\n"), ps.text, pps.text, pollFooterText(siteUrl, issueId)].join("\n\n") + "\n";

  return { subject: letter.subject, preview: letter.preview, html, text };
}
