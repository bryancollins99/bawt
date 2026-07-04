// subscribeTest.mjs — unit coverage for the list-capture double opt-in flow.
//
// The Resend HTTP layer is stubbed at globalThis.fetch, so nothing hits the
// network and no email is ever sent. Run: node scripts/subscribeTest.mjs
//
// Asserts:
//   - sign -> verify round trip; tamper reject; expiry reject
//   - subscribe writes unsubscribed:true + source + genre (in the confirm token)
//   - confirm flips unsubscribed:false, opts the correct topic(s) (all -> 3),
//     writes consent_timestamp, and is idempotent (safe to click twice)
//   - missing / invalid genre -> all

// Env must be set BEFORE the modules load (dynamic import below).
process.env.CONFIRM_TOKEN_SECRET = 'test-secret-abc123';
process.env.RESEND_API_KEY = 're_test_dummy';
process.env.SITE_URL = 'https://tools.becomeawritertoday.com';
process.env.BAWT_DRY_RUN = '1'; // guards the confirm-email send in subscribe

// -- fetch stub: records every call, routes responses via a swappable router. --
let calls = [];
let router = () => ({ ok: true, status: 200, jsonBody: { id: 'stub' } });

globalThis.fetch = async (url, opts = {}) => {
  let parsed;
  try {
    parsed = opts.body ? JSON.parse(opts.body) : undefined;
  } catch {
    parsed = opts.body;
  }
  calls.push({ url: String(url), method: opts.method || 'GET', body: parsed });
  const r = router(String(url), opts, calls.length);
  return {
    ok: r.ok,
    status: r.status,
    text: async () => JSON.stringify(r.jsonBody ?? {}),
  };
};

function resetCalls() {
  calls = [];
  router = () => ({ ok: true, status: 200, jsonBody: { id: 'stub' } });
}

// -- tiny assertion harness --
let passed = 0;
const failures = [];
function ok(cond, label) {
  if (cond) {
    passed++;
  } else {
    failures.push(label);
    console.error(`  FAIL: ${label}`);
  }
}

const lib = await import('../netlify/functions/_lib.js');
const { handler: subscribe } = await import('../netlify/functions/subscribe.js');
const { handler: confirm } = await import('../netlify/functions/confirm.js');

// ---------------------------------------------------------------------------
// 1. sign -> verify round trip
// ---------------------------------------------------------------------------
{
  const t = lib.sign('Reader@Example.com', 'poetry', 'contests-db');
  const v = lib.verify(t);
  ok(v && v.email === 'reader@example.com', 'sign->verify recovers lowercased email');
  ok(v && v.genre === 'poetry', 'sign->verify recovers genre');
  ok(v && v.source === 'contests-db', 'sign->verify recovers source');
}

// ---------------------------------------------------------------------------
// 2. tamper reject
// ---------------------------------------------------------------------------
{
  const t = lib.sign('reader@example.com', 'fiction', 'dashboard');
  const [body, sig] = t.split('.');
  const flip = body.slice(0, -1) + (body.slice(-1) === 'A' ? 'B' : 'A');
  ok(lib.verify(`${flip}.${sig}`) === null, 'tampered payload rejected');
  ok(lib.verify(`${body}.${sig}xx`) === null, 'tampered signature rejected');
  ok(lib.verify('garbage') === null, 'malformed token rejected');
  ok(lib.verify('') === null, 'empty token rejected');
}

// ---------------------------------------------------------------------------
// 3. expiry reject
// ---------------------------------------------------------------------------
{
  const expired = lib.sign('reader@example.com', 'all', 'exit-intent', -1000);
  ok(lib.verify(expired) === null, 'expired token rejected');
}

// ---------------------------------------------------------------------------
// 4. subscribe writes unsubscribed:true + source + genre
// ---------------------------------------------------------------------------
{
  resetCalls();
  const res = await subscribe({
    httpMethod: 'POST',
    body: JSON.stringify({ email: 'New@Reader.com', genre: 'poetry', source_surface: 'contests-db' }),
  });
  ok(res.statusCode === 200, 'subscribe returns 200');
  const bodyOut = JSON.parse(res.body);
  ok(bodyOut.ok === true && bodyOut.dryRun === true, 'subscribe reports dry-run (no live send)');
  ok(typeof bodyOut.confirmUrl === 'string' && bodyOut.confirmUrl.includes('/confirm?token='), 'subscribe returns a confirm URL');

  const create = calls.find((c) => c.method === 'POST' && c.url.endsWith('/contacts'));
  ok(!!create, 'subscribe POSTs to /contacts');
  ok(create && create.body.unsubscribed === true, 'subscribe creates contact unsubscribed:true');
  ok(create && create.body.email === 'new@reader.com', 'subscribe lowercases the email');
  ok(create && create.body.properties.source_surface === 'contests-db', 'subscribe writes source_surface');
  ok(create && typeof create.body.properties.consent_timestamp === 'string', 'subscribe writes consent_timestamp');
  ok(create && Array.isArray(create.body.segments) && create.body.segments[0].id === lib.BASE_SEGMENT_ID, 'subscribe assigns base segment');

  // No live send in dry-run.
  ok(!calls.some((c) => c.url.endsWith('/emails')), 'subscribe does NOT send email in dry-run');

  // Genre is carried in the signed confirm token.
  const token = new URL(bodyOut.confirmUrl).searchParams.get('token');
  const decoded = lib.verify(token);
  ok(decoded && decoded.genre === 'poetry', 'subscribe encodes genre in the confirm token');
}

// ---------------------------------------------------------------------------
// 5. confirm flips unsubscribed:false + opts correct topics (all -> 3) + consent
// ---------------------------------------------------------------------------
{
  resetCalls();
  const token = lib.sign('reader@example.com', 'all', 'contests-db');
  const res = await confirm({ queryStringParameters: { token } });
  ok(res.statusCode === 200, 'confirm returns 200 for a valid token');
  ok(/all set|confirmed/i.test(res.body), 'confirm renders a success page');

  const patchContact = calls.find((c) => c.method === 'PATCH' && /\/contacts\/[^/]+$/.test(c.url));
  ok(!!patchContact, 'confirm PATCHes the contact');
  ok(patchContact && patchContact.body.unsubscribed === false, 'confirm flips unsubscribed:false');
  ok(patchContact && typeof patchContact.body.properties.consent_timestamp === 'string', 'confirm writes consent_timestamp');

  const segAdd = calls.find((c) => c.method === 'POST' && /\/segments\//.test(c.url));
  ok(!!segAdd && segAdd.url.includes(lib.BASE_SEGMENT_ID), 'confirm adds to base segment');

  const topics = calls.find((c) => c.method === 'PATCH' && /\/topics$/.test(c.url));
  ok(!!topics, 'confirm PATCHes topics');
  ok(topics && Array.isArray(topics.body) && topics.body.length === 3, 'genre=all opts into all three topics');
  ok(topics && topics.body.every((t) => t.subscription === 'opt_in'), 'all topics opted in');
  const topicIds = topics ? topics.body.map((t) => t.id).sort() : [];
  const expectedIds = Object.values(lib.TOPIC_IDS).sort();
  ok(JSON.stringify(topicIds) === JSON.stringify(expectedIds), 'genre=all uses the three real topic ids');
}

// ---------------------------------------------------------------------------
// 5b. confirm with a single genre opts into exactly one topic
// ---------------------------------------------------------------------------
{
  resetCalls();
  const token = lib.sign('reader@example.com', 'fiction', 'dashboard');
  const res = await confirm({ queryStringParameters: { token } });
  ok(res.statusCode === 200, 'confirm (single genre) returns 200');
  const topics = calls.find((c) => c.method === 'PATCH' && /\/topics$/.test(c.url));
  ok(topics && topics.body.length === 1 && topics.body[0].id === lib.TOPIC_IDS.fiction, 'genre=fiction opts into exactly the fiction topic');
}

// ---------------------------------------------------------------------------
// 6. idempotency: second click safe even when segment-add reports a duplicate
// ---------------------------------------------------------------------------
{
  resetCalls();
  // Segment-add returns a duplicate/conflict on this run; helper must swallow it.
  router = (url) => {
    if (/\/segments\//.test(url)) return { ok: false, status: 409, jsonBody: { error: 'already in segment' } };
    return { ok: true, status: 200, jsonBody: { id: 'stub' } };
  };
  const token = lib.sign('reader@example.com', 'nonfiction', 'exit-intent');
  const res1 = await confirm({ queryStringParameters: { token } });
  const res2 = await confirm({ queryStringParameters: { token } });
  ok(res1.statusCode === 200, 'confirm succeeds when already a segment member (1st click)');
  ok(res2.statusCode === 200, 'confirm still succeeds on a repeat click (idempotent)');
}

// ---------------------------------------------------------------------------
// 7. missing / invalid genre -> all
// ---------------------------------------------------------------------------
{
  ok(lib.normalizeGenre('sci-fi') === 'all', 'invalid genre normalises to all');
  ok(lib.normalizeGenre(undefined) === 'all', 'missing genre normalises to all');
  ok(lib.normalizeGenre('POETRY') === 'poetry', 'genre is case-insensitive');

  resetCalls();
  const res = await subscribe({
    httpMethod: 'POST',
    body: JSON.stringify({ email: 'nogenre@reader.com' }),
  });
  const token = new URL(JSON.parse(res.body).confirmUrl).searchParams.get('token');
  ok(lib.verify(token).genre === 'all', 'subscribe with no genre falls back to all');

  // An invalid email is rejected.
  const bad = await subscribe({ httpMethod: 'POST', body: JSON.stringify({ email: 'not-an-email' }) });
  ok(bad.statusCode === 400, 'subscribe rejects an invalid email');
}

// ---------------------------------------------------------------------------
// confirm with a bad token renders an error page, never 500
// ---------------------------------------------------------------------------
{
  resetCalls();
  const res = await confirm({ queryStringParameters: { token: 'tampered.token' } });
  ok(res.statusCode === 400, 'confirm rejects a bad token with 400');
  ok(!calls.length, 'confirm makes no API calls for a bad token');
}

// ---------------------------------------------------------------------------
console.log(`\nsubscribeTest: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  process.exit(1);
}
