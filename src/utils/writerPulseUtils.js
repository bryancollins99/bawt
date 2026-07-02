/*
 * writerPulseUtils — live "what writers are talking about" data layer.
 *
 * Source: Hacker News Algolia search (free, no API key, CORS-open) — so the
 * fetch runs client-side, no Netlify Function needed. Link-out only: no story
 * text is reproduced or summarised (ToS-clean, factual).
 *
 * Logic ported/reimplemented from bawt-cli PR #15 (`writer-pulse/pulse.js`):
 *   - broad writing/publishing/AI-writing term set (thin single-term volume
 *     was the PR #15 failure mode)
 *   - TITLE-token relevance filter, NOT URL-token (URL matching tested at
 *     ~25% precision — every Substack/blog-hosted post carries the tokens in
 *     its host regardless of topic)
 *   - Promise.allSettled across terms, dedupe by objectID, age < 7d, sort by
 *     points, cap the list
 *   - localStorage cache of the last good result for the offline fallback
 *   - on any error → returns [] (never throws) so a shared page never blanks
 *
 * INDEXING RULE: this is a third-party-link aggregator with no original
 * analysis — the low-originality profile Google's Helpful Content system
 * penalises. Render as a SIDEBAR / WIDGET only, never as an indexable page.
 */

import { safeGetItem, safeSetItem } from './safeStorage';

export const CACHE_KEY = 'bawt_writer_pulse_cache_v1';
const MAX_AGE_DAYS = 7;
const MAX_ITEMS = 25;
const HITS_PER_TERM = 50;
const FETCH_TIMEOUT_MS = 8000;

// Broad term set (PRD §Scope) — each is one search_by_date query. Broad +
// AI-writing (HN-rich) beats the thin writing-only-volume problem PR #15 hit.
export const TERMS = [
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

// Relevance filter — matched against the TITLE. URL-token matching was tested
// and rejected in PR #15 (~25% precision). A short STRICT_URL set (craft terms
// that almost never appear spuriously in a URL) is a secondary signal.
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

// Negative filter — code / AI-agent / financial-write-down contexts the
// positive tokens otherwise drag in ("agents write", "writes down EUR",
// "AI-authored code"). Deliberately context-specific: bare "agent"/"code" are
// NOT excluded, so "literary agent" / "agent rejected my manuscript" survive.
const NEG = new RegExp(
  [
    'writing code', 'your code', 'the code', 'code your', 'writes? down',
    'written in (rust|go|c\\+\\+|python|zig|java)', 'static (website|site) generator',
    '\\bwasm\\b', 'compiler', '\\bkernel\\b', '\\bsyscall\\b', 'self-rewriting',
    '\\blisp\\b', 'ai-authored', 'ai agent', 'coding agent', 'llm agent',
    'agentic', 'agents? (write|writing)', '\\bmcp\\b',
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

function ageDays(h) {
  return (Date.now() / 1000 - (h.created_at_i || 0)) / 86400;
}

export function relativeAge(secs) {
  const s = Math.max(0, Date.now() / 1000 - secs);
  const h = Math.floor(s / 3600);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? 'day' : 'days'} ago`;
}

export function domainOf(u) {
  if (!u) return 'news.ycombinator.com';
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

export function hnItemUrl(id) {
  return `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
}

function fetchTerm(term) {
  const url =
    'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=' +
    encodeURIComponent(term) +
    '&hitsPerPage=' +
    HITS_PER_TERM;
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS) : null;
  const opts = ctrl ? { signal: ctrl.signal } : {};
  return fetch(url, opts)
    .then((r) => {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((d) => (d && d.hits) || []);
}

/**
 * Fetch, dedupe, filter and rank writing stories from Hacker News.
 * @returns {Promise<Array>} sorted story objects — resolves to [] on total
 *   failure (never throws). Caller decides whether to fall back to cache.
 */
export async function fetchWriterPulse() {
  try {
    const results = await Promise.allSettled(TERMS.map(fetchTerm));
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    if (fulfilled.length === 0) return [];

    const byId = {};
    fulfilled.forEach((r) => {
      r.value.forEach((h) => {
        if (h && h.objectID && !byId[h.objectID]) byId[h.objectID] = h;
      });
    });

    return Object.keys(byId)
      .map((k) => byId[k])
      .filter((h) => ageDays(h) < MAX_AGE_DAYS)
      .filter(isRelevant)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, MAX_ITEMS)
      .map((h) => ({
        id: h.objectID,
        title: titleOf(h),
        url: urlOf(h) || hnItemUrl(h.objectID),
        points: h.points || 0,
        comments: h.num_comments || 0,
        created_at_i: h.created_at_i || 0,
        domain: domainOf(urlOf(h)),
      }));
  } catch (e) {
    // Never throw — a shared page must never blank on this widget.
    return [];
  }
}

export function readPulseCache() {
  try {
    const raw = safeGetItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.stories) || !parsed.stories.length) return null;
    // Re-filter by age on read so the "last 7 days" promise holds even for a
    // stale cache — never surface week-old stories as if they were current.
    const fresh = parsed.stories.filter((s) => ageDays(s) < MAX_AGE_DAYS);
    if (!fresh.length) return null;
    return { ...parsed, stories: fresh };
  } catch (e) {
    return null;
  }
}

export function writePulseCache(stories) {
  // safeSetItem is a no-op on private mode / quota / blocked storage.
  safeSetItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), stories }));
}
