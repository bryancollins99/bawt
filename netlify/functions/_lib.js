// _lib.js - shared helpers for the BAWT list-capture functions.
//
// ESM module (root package.json is "type": "module"). No new npm dependency:
// crypto is a Node builtin and fetch is a Node 18+ global.
//
// Two responsibilities:
//   1. A stateless, HMAC-signed confirm token (double opt-in link).
//   2. Thin REST helpers over https://api.resend.com used by subscribe/confirm.
//
// Resend REST shapes verified against the live docs on 2026-07-04:
//   POST   /contacts                      { email, unsubscribed, properties, segments:[{id}], topics:[{id,subscription}] }
//   PATCH  /contacts/{id|email}           { unsubscribed, properties }
//   PATCH  /contacts/{id|email}/topics    [ { id, subscription } ]           (bare array)
//   POST   /contacts/{id|email}/segments/{segment_id}                         (path params, no body)
//   POST   /emails                        { from, to, subject, html, text }
// The topics-array and add-to-segment shapes were the two the docs left mildly
// ambiguous; both are isolated in single helpers below so they are trivial to
// correct. See DECISIONS.md / BLOCKED.md. All live sends are gated regardless.

import { createHmac, timingSafeEqual } from 'node:crypto';

// -- Provisioned Resend IDs (env-overridable; baked so the functions work with
//    only CONFIRM_TOKEN_SECRET / RESEND_API_KEY / SITE_URL / BAWT_DRY_RUN set). --

export const RESEND_API_BASE = 'https://api.resend.com';

export const FROM_ADDRESS =
  process.env.RESEND_FROM || 'Become a Writer Today <bryan@becomeawritertoday.com>';

export const BASE_SEGMENT_ID =
  process.env.RESEND_BASE_SEGMENT_ID || '127c2985-952e-4e00-a192-ae26645e5b78';

export const TOPIC_IDS = {
  fiction: process.env.RESEND_TOPIC_FICTION || 'afe848e8-89f4-45df-966f-ec0cdce80658',
  poetry: process.env.RESEND_TOPIC_POETRY || 'd550f41b-bd2e-46b1-9a3c-69e2f2ccefcc',
  nonfiction: process.env.RESEND_TOPIC_NONFICTION || '4bef07fe-6aee-4258-ac37-25471d4dba65',
};

export const VALID_GENRES = ['fiction', 'poetry', 'nonfiction', 'all'];

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // ~48h

// -- base64url helpers --

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

// -- Genre normalisation + genre -> topic subscription mapping --

// Any missing / unknown genre falls back to "all" (never blocks a signup).
export function normalizeGenre(g) {
  const v = String(g || '').trim().toLowerCase();
  return VALID_GENRES.includes(v) ? v : 'all';
}

// Returns the topic subscription objects for a genre. "all" -> all three topics.
export function topicsForGenre(genre, subscription = 'opt_in') {
  const g = normalizeGenre(genre);
  const ids = g === 'all' ? Object.values(TOPIC_IDS) : [TOPIC_IDS[g]];
  return ids.filter(Boolean).map((id) => ({ id, subscription }));
}

// -- HMAC-signed stateless confirm token over email|genre|source --

function secret() {
  const s = process.env.CONFIRM_TOKEN_SECRET;
  if (!s) throw new Error('CONFIRM_TOKEN_SECRET is not set');
  return s;
}

// Token = base64url(payloadJSON) + "." + base64url(HMAC-SHA256(payload)).
// Payload carries email, genre, source and an absolute expiry timestamp.
export function sign(email, genre, source, ttlMs = TOKEN_TTL_MS) {
  const payload = JSON.stringify({
    email: String(email).trim().toLowerCase(),
    genre: normalizeGenre(genre),
    source: String(source || ''),
    exp: Date.now() + ttlMs,
  });
  const body = b64url(payload);
  const sig = b64url(createHmac('sha256', secret()).update(body).digest());
  return `${body}.${sig}`;
}

// verify() never throws on bad input: it returns null for any malformed,
// tampered, or expired token so callers can render a clean error page.
export function verify(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') < 0) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = b64url(createHmac('sha256', secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch - guard first, treat as reject.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  if (!payload.email) return null;
  return { email: payload.email, genre: normalizeGenre(payload.genre), source: payload.source || '' };
}

// -- Resend REST helpers (Node 18+ global fetch; no npm dep) --

function apiKey() {
  return process.env.RESEND_API_KEY;
}

async function resendFetch(path, { method = 'GET', body } = {}) {
  const key = apiKey();
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch(`${RESEND_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

// Create a (typically unconfirmed) contact. Pass unsubscribed:true for an
// unconfirmed double-opt-in signup. properties/segments/topics are optional.
export async function createContact({ email, unsubscribed, properties, segments, topics }) {
  const body = { email: String(email).trim().toLowerCase() };
  if (unsubscribed !== undefined) body.unsubscribed = unsubscribed;
  if (properties) body.properties = properties;
  if (segments) body.segments = segments;
  if (topics) body.topics = topics;
  const r = await resendFetch('/contacts', { method: 'POST', body });
  if (!r.ok) throw new Error(`createContact failed: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

// Update an existing contact by email (idempotent flip of unsubscribed + props).
export async function updateContact({ email, unsubscribed, properties }) {
  const body = {};
  if (unsubscribed !== undefined) body.unsubscribed = unsubscribed;
  if (properties) body.properties = properties;
  const r = await resendFetch(`/contacts/${encodeURIComponent(String(email).trim().toLowerCase())}`, {
    method: 'PATCH',
    body,
  });
  if (!r.ok) throw new Error(`updateContact failed: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

// Add an existing contact to a segment. Idempotent by design: a contact already
// in the segment (2xx, or a duplicate/409/422 conflict) is treated as success so
// clicking the confirm link twice never errors.
export async function addToSegment({ email, segmentId }) {
  const enc = encodeURIComponent(String(email).trim().toLowerCase());
  const r = await resendFetch(`/contacts/${enc}/segments/${encodeURIComponent(segmentId)}`, {
    method: 'POST',
  });
  if (r.ok) return r.json;
  if (r.status === 409 || r.status === 422) return { alreadyMember: true }; // idempotent
  throw new Error(`addToSegment failed: ${r.status} ${JSON.stringify(r.json)}`);
}

// Update a contact's topic subscriptions. Body is a bare array per the docs.
export async function updateContactTopics({ email, topics }) {
  const enc = encodeURIComponent(String(email).trim().toLowerCase());
  const r = await resendFetch(`/contacts/${enc}/topics`, { method: 'PATCH', body: topics });
  if (!r.ok) throw new Error(`updateContactTopics failed: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

// Send a single transactional email. Callers MUST gate this behind the dry-run
// guard; this helper does not gate itself.
export async function sendEmail({ from, to, subject, html, text }) {
  const body = { from: from || FROM_ADDRESS, to: Array.isArray(to) ? to : [to], subject, html, text };
  const r = await resendFetch('/emails', { method: 'POST', body });
  if (!r.ok) throw new Error(`sendEmail failed: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
}

// True when live sends must be skipped (test / local / not yet configured).
export function isDryRun() {
  return process.env.BAWT_DRY_RUN === '1' || !process.env.RESEND_API_KEY;
}

export function jsonResponse(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(obj),
  };
}

export function htmlResponse(statusCode, html) {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
}
