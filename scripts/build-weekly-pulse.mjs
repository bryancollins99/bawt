#!/usr/bin/env node
/*
 * build-weekly-pulse.mjs — deterministic weekly-content builder.
 *
 * Queries the Hacker News Algolia search API (free, no API key) across a broad
 * set of writing / publishing / AI-writing terms, dedupes, applies a TITLE-token
 * relevance filter, sorts by points and writes the top 15 to
 * src/data/weeklyPulse.json. That committed JSON is what the WeeklyWriting
 * component renders — indexable static content, NOT a live client fetch.
 *
 * NO LLM in the data path. Every field comes straight from the HN API.
 *
 * Runs weekly in CI (.github/workflows/weekly-pulse.yml). Design contract:
 *   - "never write empty": only overwrite the JSON when the fresh list is
 *     non-empty. On a total-failure week (network down / nothing on-topic) the
 *     previous file is kept and the script STILL exits 0, so the workflow's
 *     `git diff --quiet || commit` degrades to a clean no-op.
 *
 * Relevance regexes are copied (not imported) from src/utils/writerPulseUtils.js
 * on purpose: that module carries browser-only window/localStorage code and
 * powers the live WriterPulse widget — a shared-module refactor would risk live
 * code for marginal DRY. This script is a self-contained Node build tool.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'src', 'data', 'weeklyPulse.json');

const MAX_AGE_DAYS = 14;
const MAX_ITEMS = 15;
const FETCH_TIMEOUT_MS = 10000;

// Broad term set — each is one search_by_date query. Broad + AI-writing (which
// is HN-rich) beats the thin single-term-volume problem.
const TERMS = [
  'writing',
  'AI writing',
  'publishing',
  'self-publishing',
  'Substack',
  'author',
  'books',
  'copywriting',
  'ghostwriting',
  'novel writing',
  'blogging',
  'newsletter',
];

// Relevance filter — matched against the TITLE. URL-token matching tests at
// ~25% precision (every blog-hosted post carries the tokens in its host).
const POS = new RegExp(
  [
    "\\bwriting\\b", "\\bwriter\\b", "\\bwriters\\b", "\\bwriters'\\b", "\\bwrite\\b",
    '\\bcopywrit\\w*', '\\bghostwrit\\w*', '\\bscreenwrit\\w*', '\\bsongwrit\\w*',
    '\\bfreelanc\\w*', '\\bself-?publish\\w*', '\\bnovelist\\b', '\\bnovella\\b',
    '\\bnovel\\b', '\\bmanuscript\\w*', '\\bblogging\\b', '\\bblogger\\b',
    '\\bblog\\b', '\\bblogs\\b', '\\bnewsletter\\w*', '\\bsubstack\\b',
    '\\bmemoir\\w*', '\\bpoetry\\b', '\\bpoet\\b', '\\bpoets\\b', '\\bfiction\\b',
    '\\bnonfiction\\b', '\\bnon-fiction\\b', '\\bprose\\b', '\\bessay\\b',
    '\\bessays\\b', '\\bauthor\\b', '\\bauthors\\b', '\\bauthored\\b',
    '\\bproofread\\w*', '\\bstorytelling\\b', '\\bgrammar\\b', '\\bediting\\b',
    '\\beditor\\b', '\\bpublishing\\b', '\\bpublisher\\b', '\\bword count\\b',
    '\\bbook deal\\b', '\\bbooks?\\b',
  ].join('|'),
  'i'
);

// Negative filter — code / AI-agent / financial-write-down contexts the positive
// tokens otherwise drag in. Context-specific: bare "agent"/"code" survive so
// "literary agent" / "agent rejected my manuscript" pass through.
const NEG = new RegExp(
  [
    'writing code', 'your code', 'the code', 'code your', 'writes? down',
    'written in (rust|go|c\\+\\+|python|zig|java)', 'static (website|site) generator',
    '\\bwasm\\b', 'compiler', '\\bkernel\\b', '\\bsyscall\\b', 'self-rewriting',
    '\\blisp\\b', 'ai-authored', 'ai agent', 'coding agent', 'llm agent',
    'agentic', 'agents? (write|writing)', '\\bmcp\\b',
    // infra / package-management false positives the weak tokens ("write",
    // "publishing") otherwise drag in — observed on the 14d HN slice.
    '\\bssds?\\b', '\\bgpus?\\b', 'write \\w+ to (disk|ssd|local|s3|memory)',
    'publishing (rust|go|python|npm|a package|a crate|a gem)',
    'crates\\.io', 'on crates', '\\bnpm\\b', 'publish\\w* (a )?(package|crate|gem|module)',
    '\\bsaas\\b', '\\bipfs\\b', '\\bapi\\b',
  ].join('|'),
  'i'
);

// Craft tokens precise enough to trust in a URL path.
const STRICT_URL = /copywrit|ghostwrit|screenwrit|self-?publish|manuscript|freelance-?writ/i;

const titleOf = (h) => h.title || h.story_title || '';
const urlOf = (h) => h.url || h.story_url || '';

function isRelevant(h) {
  const t = titleOf(h).toLowerCase();
  if (NEG.test(t)) return false;
  if (POS.test(t)) return true;
  return STRICT_URL.test(urlOf(h).toLowerCase());
}

function domainOf(u) {
  if (!u) return 'news.ycombinator.com';
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function hnItemUrl(id) {
  return `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
}

async function fetchTerm(term, sinceUnix) {
  const filter = encodeURIComponent(`created_at_i>${sinceUnix}`);
  const url =
    'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=' +
    encodeURIComponent(term) +
    '&numericFilters=' +
    filter +
    '&hitsPerPage=100';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return (d && d.hits) || [];
  } finally {
    clearTimeout(timer);
  }
}

function toIsoDate(secs) {
  return new Date(secs * 1000).toISOString();
}

async function main() {
  const nowSec = Math.floor(Date.now() / 1000);
  const sinceUnix = nowSec - MAX_AGE_DAYS * 86400;

  const results = await Promise.allSettled(TERMS.map((t) => fetchTerm(t, sinceUnix)));
  const fulfilled = results.filter((r) => r.status === 'fulfilled');

  const byId = {};
  fulfilled.forEach((r) => {
    r.value.forEach((h) => {
      if (h && h.objectID && !byId[h.objectID]) byId[h.objectID] = h;
    });
  });

  const items = Object.values(byId)
    .filter((h) => (h.created_at_i || 0) >= sinceUnix)
    .filter(isRelevant)
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, MAX_ITEMS)
    .map((h) => ({
      title: titleOf(h),
      url: urlOf(h) || hnItemUrl(h.objectID),
      points: h.points || 0,
      comments: h.num_comments || 0,
      domain: domainOf(urlOf(h)),
      createdAt: toIsoDate(h.created_at_i || nowSec),
    }));

  // "never write empty" — a total-failure week (all fetches rejected, or nothing
  // on-topic) keeps the previously committed file untouched and exits clean so
  // the workflow's `git diff --quiet || commit` is a no-op.
  if (items.length === 0) {
    if (existsSync(OUT)) {
      console.log('No fresh relevant items — keeping the previous weeklyPulse.json unchanged.');
      process.exit(0);
    }
    // No previous file to keep either: write a valid-but-empty envelope so the
    // component still renders a graceful "nothing this week" state rather than
    // crashing on a missing import. This branch is only reachable on a first-ever
    // run that also totally failed.
    console.warn('No items and no existing file — writing an empty envelope.');
  }

  const now = new Date();
  const payload = {
    generatedAt: now.toISOString(),
    weekOf: now.toISOString().slice(0, 10),
    items,
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${items.length} items to ${OUT} (weekOf ${payload.weekOf}).`);
}

main().catch((e) => {
  // Never fail the build on a data-path error: keep whatever is committed.
  console.error('build-weekly-pulse failed:', e && e.message ? e.message : e);
  process.exit(0);
});
