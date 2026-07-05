// scripts/gather-writing-news.mjs
//
// Upstream gatherer for the Thursday Deadline Digest's "In the news" panel.
// Produces deadline-digest/data/writing-news.json, the data contract the SEND
// reads deterministically (the send never gathers). This runs once per week in
// CI, BEFORE the digest send, and commits the refreshed file.
//
// Pipeline:
//   1. Fetch a small set of ToS-clean writing/publishing RSS/Atom feeds.
//   2. Parse items (title, link, date, excerpt). Sort newest-first.
//   3. VERIFY every candidate URL resolves (HEAD then GET; keep only 2xx/3xx).
//   4. Curate (PLUGGABLE):
//        - if an Anthropic key is in env, an LLM picks the 3 most relevant to
//          working writers and writes a one-line blurb DERIVED from the item
//          (no invented facts); honours ANTHROPIC_BASE_URL (Netlify AI Gateway).
//        - otherwise: fall back to the raw feed title + a trimmed excerpt.
//   5. Write generatedAt + items. If it can't produce >=1 verified item, it
//      LEAVES THE EXISTING FILE UNTOUCHED (never clobber good data with empty).
//
// Never fabricates a title, URL, or fact: fields come from the feed (quoted /
// trimmed from the source) or the item is dropped. The LLM may only re-rank and
// write a blurb from the supplied item text; its output is mapped back to the
// original verified item by URL, and any URL it did not receive is discarded.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.resolve(__dirname, "..", "deadline-digest", "data", "writing-news.json");

const UA = "BAWT-DeadlineDigest/1.0 (+https://becomeawritertoday.com)";
const FETCH_TIMEOUT_MS = 12000;
const MAX_CANDIDATES = 12; // pool size before verification
const MAX_OUTPUT = 5; // 3-5 items in the panel
const AI_TARGET = 3; // the LLM narrows to the 3 most relevant

// ToS-clean feeds that expose full RSS/Atom. Kept small and resilient: a feed
// that 404s or fails to parse is simply skipped.
const SOURCES = [
  { name: "Literary Hub", feed: "https://lithub.com/feed/" },
  { name: "The Bookseller", feed: "https://www.thebookseller.com/rss/news" },
  { name: "Poets and Writers", feed: "https://www.pw.org/rss.xml" },
];

// ---- small helpers --------------------------------------------------------

function decodeEntities(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(s) {
  return decodeEntities(String(s).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

// Trim to a word boundary near `max` chars (excerpt fallback).
function trimExcerpt(s, max = 150) {
  const t = stripHtml(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > 40 ? cut.slice(0, at) : cut).replace(/[\s,;:.]+$/, "") + "...";
}

function firstMatch(block, tags) {
  for (const tag of tags) {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    if (m) return decodeEntities(m[1]).trim();
  }
  return "";
}

// Extract a link from an <item>/<entry> block (RSS <link>text</link> or Atom
// <link href="..."/>).
function extractLink(block) {
  const rss = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (rss && rss[1] && rss[1].trim()) return decodeEntities(rss[1]).trim();
  const atom =
    block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
    block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return atom ? decodeEntities(atom[1]).trim() : "";
}

function parseFeed(xml, sourceName) {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) || [];
  const items = [];
  for (const block of blocks) {
    const title = firstMatch(block, ["title"]);
    const url = extractLink(block);
    if (!title || !/^https?:\/\//.test(url)) continue;
    const dateRaw = firstMatch(block, ["pubDate", "updated", "published", "dc:date"]);
    const ts = dateRaw ? Date.parse(dateRaw) : NaN;
    const excerpt = firstMatch(block, ["description", "summary", "content:encoded", "content"]);
    items.push({
      title: title.replace(/\s+/g, " ").trim(),
      url,
      source: sourceName,
      excerpt,
      ts: Number.isNaN(ts) ? 0 : ts,
    });
  }
  return items;
}

async function fetchText(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: opts.accept || "*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// HEAD first (cheap), GET fallback for sites that reject HEAD. Keep 2xx/3xx.
async function urlResolves(url) {
  const tryFetch = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch(url, {
        method,
        signal: ctrl.signal,
        headers: { "User-Agent": UA },
        redirect: "follow",
      });
      return r.status;
    } catch {
      return 0;
    } finally {
      clearTimeout(t);
    }
  };
  let status = await tryFetch("HEAD");
  if (status === 0 || status >= 400) status = await tryFetch("GET");
  return status >= 200 && status < 400;
}

// ---- pluggable LLM refine -------------------------------------------------

function anthropicKey() {
  return process.env.ANTHROPIC_API_KEY || "";
}

// Ask Claude to pick the AI_TARGET most relevant items and write a one-line
// blurb DERIVED from each item (no invented facts). Returns a Map(url -> blurb)
// for URLs the model was given, or null on any failure (caller falls back).
async function refineWithLLM(candidates) {
  const key = anthropicKey();
  if (!key) return null;

  const base = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. title: ${c.title}\n   source: ${c.source}\n   url: ${c.url}\n   excerpt: ${trimExcerpt(
          c.excerpt,
          280
        ) || "(none)"}`
    )
    .join("\n");

  const prompt =
    `You are curating a "In the news" panel for a newsletter read by working writers ` +
    `(freelancers, authors, poets chasing deadlines and opportunities). From the numbered ` +
    `items below, pick the ${AI_TARGET} most relevant to working writers. For each pick, write ` +
    `a single-line blurb (max 22 words) DERIVED ONLY from that item's title and excerpt. ` +
    `Do NOT invent facts, numbers, dates, or claims not present in the item. Do NOT alter or ` +
    `invent the url. Return ONLY a JSON array, no prose, of objects: ` +
    `{"url": "<exact url from the item>", "blurb": "<one line>"}.\n\n${list}`;

  try {
    const r = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) {
      console.warn(`  LLM refine skipped: HTTP ${r.status}`);
      return null;
    }
    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const arr = JSON.parse(jsonMatch[0]);
    const byUrl = new Map(candidates.map((c) => [c.url, c]));
    const out = new Map();
    for (const row of arr) {
      if (!row || typeof row.url !== "string" || !byUrl.has(row.url)) continue; // never trust an invented url
      const blurb = typeof row.blurb === "string" ? row.blurb.replace(/\s+/g, " ").trim() : "";
      if (blurb) out.set(row.url, blurb);
    }
    return out.size > 0 ? out : null;
  } catch (e) {
    console.warn(`  LLM refine error: ${e.message}`);
    return null;
  }
}

// ---- main -----------------------------------------------------------------

async function main() {
  // 1. fetch + parse all feeds
  const all = [];
  for (const src of SOURCES) {
    const xml = await fetchText(src.feed, { accept: "application/rss+xml, application/xml, text/xml" });
    if (!xml) {
      console.warn(`  feed skipped (fetch failed): ${src.name}`);
      continue;
    }
    const items = parseFeed(xml, src.name);
    console.log(`  ${src.name}: ${items.length} item(s) parsed`);
    all.push(...items);
  }

  if (all.length === 0) {
    console.warn("No items parsed from any feed. Leaving existing writing-news.json untouched.");
    return;
  }

  // 2. newest-first, de-dupe by url, take a candidate pool
  const seen = new Set();
  const pool = all
    .sort((a, b) => b.ts - a.ts)
    .filter((it) => (seen.has(it.url) ? false : (seen.add(it.url), true)))
    .slice(0, MAX_CANDIDATES);

  // 3. verify each URL resolves (keep only 2xx/3xx)
  const verified = [];
  for (const it of pool) {
    if (await urlResolves(it.url)) verified.push(it);
  }
  console.log(`  verified ${verified.length}/${pool.length} candidate URL(s)`);

  if (verified.length === 0) {
    console.warn("No verified URLs. Leaving existing writing-news.json untouched (never clobber good data).");
    return;
  }

  // 4. curate: LLM refine if a key is present, else raw title + trimmed excerpt
  const refined = await refineWithLLM(verified);
  let items;
  if (refined) {
    console.log(`  curation: LLM refine active (${refined.size} pick(s))`);
    items = verified
      .filter((it) => refined.has(it.url))
      .slice(0, MAX_OUTPUT)
      .map((it) => ({
        title: it.title,
        url: it.url,
        source: it.source,
        blurb: refined.get(it.url),
      }));
  } else {
    console.log("  curation: fallback (raw feed title + trimmed excerpt)");
    items = verified.slice(0, MAX_OUTPUT).map((it) => ({
      title: it.title,
      url: it.url,
      source: it.source,
      blurb: trimExcerpt(it.excerpt, 150) || it.source,
    }));
  }

  if (items.length === 0) {
    console.warn("Curation produced no items. Leaving existing writing-news.json untouched.");
    return;
  }

  // 5. write generatedAt + items
  const out = { generatedAt: new Date().toISOString(), items };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${items.length} item(s) to ${OUT_PATH}`);
}

main().catch((e) => {
  // A gather failure must never block the digest. Log and exit non-zero so CI
  // surfaces it, but the workflow step is guarded (continue-on-error) and the
  // committed file is left as-is.
  console.error(e.stack || e.message);
  process.exit(1);
});
