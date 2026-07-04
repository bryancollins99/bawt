// render-digest.js
//
// The Thursday Deadline Digest: a SECOND template, separate from the evergreen
// letters. It rebuilds itself live from ../src/data/contests.json.
//
//   - excludes stale === true and past-dated contests
//   - keeps deadlines within a rolling window (default 21 days)
//   - sorts soonest-first
//   - each row links to the organiser (c.url), never to the blog
//   - same dual monetisation footer: affiliate P.S. + product P.P.S.
//
// Freshness (R2): staleness of the contests data is derived from the file's git
// commit time, never filesystem mtime, and fails closed.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  BRAND,
  escapeHtml,
  pageShell,
  renderAffiliatePS,
  renderProductPPS,
  resolveProductUrl,
  pollFooterHtml,
  pollFooterText,
} from "./render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CONTESTS_PATH = path.resolve(__dirname, "..", "src", "data", "contests.json");
export const DIGEST_WINDOW_DAYS = 21;
export const CONTESTS_MAX_AGE_DAYS = 14; // deadlines are time-sensitive; tighter than the letters
const DEFAULT_SITE_URL = "https://becomeawritertoday.com";

// ---- data loading + freshness (R2: never file mtime) ---------------------

export function loadContests(file = CONTESTS_PATH) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Git commit time of the contests file (ISO), or null if unavailable.
export function contestsDataDate(file = CONTESTS_PATH) {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: __dirname,
      encoding: "utf8",
    }).trim();
    return iso || null;
  } catch {
    return null;
  }
}

export function contestsAgeDays(dataDateISO, opts = {}) {
  const now = opts.now ? new Date(opts.now).getTime() : Date.now();
  const stamp = dataDateISO ? Date.parse(dataDateISO) : NaN;
  if (Number.isNaN(stamp)) return Infinity; // unknown -> stale (fail closed)
  return (now - stamp) / 86400000;
}

export function assertContestsFresh(dataDateISO, maxDays = CONTESTS_MAX_AGE_DAYS, opts = {}) {
  const age = contestsAgeDays(dataDateISO, opts);
  if (age > maxDays) {
    throw new Error(
      `Contests data is stale: ${age === Infinity ? "unknown age" : age.toFixed(1) + " days"} ` +
        `(max ${maxDays}). Refresh src/data/contests.json before sending the digest.`
    );
  }
  return age;
}

// ---- selection -----------------------------------------------------------

function todayUtcMs(now) {
  const d = now ? new Date(now) : new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function daysUntil(deadline, now) {
  const dl = Date.parse(`${deadline}T00:00:00Z`);
  if (Number.isNaN(dl)) return NaN;
  return Math.round((dl - todayUtcMs(now)) / 86400000);
}

// Live-filtered, soonest-first list of contests to feature.
export function selectContests(contests, opts = {}) {
  const windowDays = opts.windowDays ?? DIGEST_WINDOW_DAYS;
  const now = opts.now;
  return contests
    .filter((c) => c.stale !== true)
    .filter((c) => typeof c.deadline === "string")
    .map((c) => ({ c, d: daysUntil(c.deadline, now) }))
    .filter(({ d }) => Number.isFinite(d) && d >= 0 && d <= windowDays)
    .sort((a, b) => a.d - b.d || String(a.c.name).localeCompare(String(b.c.name)))
    .map(({ c }) => c);
}

export function shouldSkipDigest(selected) {
  return !selected || selected.length === 0;
}

// ---- digest monetisation (affiliate P.S. + product P.P.S.) ---------------

const DIGEST_AFFILIATE = {
  slug: "prowritingaid",
  anchor: "ProWritingAid",
  text: "Polishing an entry before the deadline? {{LINK}} catches the slips a tired writer stops seeing.",
};

// Product P.P.S. MUST link to a live checkout. Prefer the Writers' Deadline
// Database when it has a real Stripe URL; otherwise cross-sell the (live)
// Filler-Word Killer Editor Pack.
export function digestProduct() {
  const dbUrl = resolveProductUrl("Writers' Deadline Database");
  if (dbUrl && dbUrl !== "STRIPE_CHECKOUT_PENDING") {
    return {
      name: "Writers' Deadline Database",
      anchor: "the Writers' Deadline Database",
      text: "Want every open call in one place, searchable? {{LINK}} is the full thing.",
    };
  }
  return {
    name: "Filler-Word Killer Editor Pack",
    anchor: "the Filler-Word Killer Editor Pack",
    text: "While you polish that entry, {{LINK}} strips the filler in one pass so every line earns its place.",
  };
}

// ---- rendering -----------------------------------------------------------

function titleGenres(genres) {
  if (!Array.isArray(genres) || genres.length === 0) return "Writing";
  const s = genres.map((g) => String(g).replace(/-/g, " ")).join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function feeLabel(c) {
  return c.freeEntry ? "free entry" : c.fee || "see site";
}

function closesLabel(days, first) {
  if (days <= 0) return "Closes today";
  if (days === 1) return first ? "Closes tomorrow" : "1 day left";
  return first ? `Closes in ${days} days` : `${days} days left`;
}

// UTC date key used for the subject line date and idempotency.
export function digestDateKey(now) {
  const d = now ? new Date(now) : new Date();
  return d.toISOString().slice(0, 10);
}

export function digestSubject(selected) {
  const lead = selected[0];
  const short = String(lead.name).split(/[(:]/)[0].trim();
  return `${selected.length} writing deadline${selected.length === 1 ? "" : "s"} closing soon (${short} leads)`;
}

export function renderDigest(selected, opts = {}) {
  if (shouldSkipDigest(selected)) throw new Error("renderDigest called with no contests");
  const now = opts.now;
  const siteUrl = (opts.siteUrl || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  const windowDays = opts.windowDays ?? DIGEST_WINDOW_DAYS;
  const issueId = `digest-${digestDateKey(now)}`;
  const subject = digestSubject(selected);
  const preview = `${selected.length} open calls closing within ${windowDays} days, soonest first.`;

  const rowStyle = `padding:12px 0;border-bottom:1px solid ${BRAND.line};`;
  const nameStyle = `font-size:16.5px;font-weight:bold;color:${BRAND.ink};text-decoration:none;`;
  const metaStyle = `font-size:13px;color:${BRAND.muted};padding-top:3px;`;
  const dayStyle = (first) => `font-size:12.5px;font-weight:bold;padding-top:2px;color:${first ? BRAND.red : BRAND.faint};`;

  const rowsHtml = selected
    .map((c, i) => {
      const days = daysUntil(c.deadline, now);
      const meta = `${titleGenres(c.genres)} &middot; ${escapeHtml(c.region || "See eligibility")} &middot; ${escapeHtml(
        c.prize || "See site"
      )} &middot; ${escapeHtml(feeLabel(c))}`;
      return `<div style="${rowStyle}">
  <a href="${escapeHtml(c.url)}" style="${nameStyle}">${escapeHtml(c.name)}</a>
  <div style="${metaStyle}">${meta}</div>
  <div style="${dayStyle(i === 0)}">${escapeHtml(closesLabel(days, i === 0))}</div>
</div>`;
    })
    .join("\n");

  const rowsText = selected
    .map((c, i) => {
      const days = daysUntil(c.deadline, now);
      return `${c.name} (${c.url})\n  ${titleGenres(c.genres)} · ${c.region || "See eligibility"} · ${
        c.prize || "See site"
      } · ${feeLabel(c)} · ${closesLabel(days, i === 0)}`;
    })
    .join("\n\n");

  const ps = renderAffiliatePS(DIGEST_AFFILIATE);
  const pps = renderProductPPS(digestProduct());

  const headerHtml = `<div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${BRAND.red};font-weight:bold;font-family:${BRAND.serif};">The Deadline Digest</div>
<div style="font-family:${BRAND.serif};font-size:23px;color:${BRAND.ink};margin:6px 0 3px;">Closing in the next ${windowDays} days</div>
<div style="font-family:${BRAND.serif};font-size:13.5px;color:${BRAND.faint};margin-bottom:14px;">Thursday ${digestDateKey(
    now
  )} &middot; open calls, soonest first</div>`;

  const inner = `${headerHtml}
${rowsHtml}
${ps.html}
${pps.html}
${pollFooterHtml(siteUrl, issueId)}`;

  const html = pageShell(inner, preview);

  const text =
    [
      `The Deadline Digest`,
      `Closing in the next ${windowDays} days, soonest first.`,
      rowsText,
      ps.text,
      pps.text,
      pollFooterText(siteUrl, issueId),
    ].join("\n\n") + "\n";

  return { subject, preview, html, text, issueId };
}
