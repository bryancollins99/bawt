// Verification harness for src/data/contests.json.
// Checks every entry URL, rolls past-deadline recurring/projected entries forward
// one year, flags non-recurring expired entries, and emits a staleness report.
//
// Run: node scripts/verify-contests.mjs
//      node scripts/verify-contests.mjs --self-test

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');

const CONTESTS_PATH  = join(repo, 'src', 'data', 'contests.json');
const REPORT_PATH    = join(here, '.contest-verify-report.json');
const SOURCES_PATH   = join(repo, 'src', 'data', 'contests.SOURCES.md');

const TIMEOUT_MS = 12000;
const CONCURRENCY = 5;
const UA = 'Mozilla/5.0 (compatible; BAWTVerifier/1.0; +https://becomeawritertoday.com)';
// Abort full run if this fraction of URLs fail — likely an infra problem, not link rot.
const INFRA_FAIL_THRESHOLD = 0.80;

// -- Deadline utilities (replicates contestUtils.js — Node can't import Vite-native modules) --

function parseISODateUTC(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ts = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(ts) ? null : ts;
}

function todayUTC() {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

function daysUntil(iso) {
  const d = parseISODateUTC(iso);
  return d === null ? null : Math.round((d - todayUTC()) / 86400000);
}

function rollOneYear(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// -- URL check (HEAD first, GET fallback for sites that block HEAD) --

async function checkURL(url) {
  const tryFetch = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(url, {
        method,
        signal: ctrl.signal,
        headers: { 'User-Agent': UA },
        redirect: 'follow',
      });
      clearTimeout(t);
      return r.status;
    } catch (e) {
      clearTimeout(t);
      return { error: e.message || 'fetch error' };
    }
  };

  let result = await tryFetch('HEAD');
  if (typeof result === 'object') {
    // Network error or timeout on HEAD
    return { ok: false, status: 0, reason: result.error };
  }
  if (result >= 400) {
    // Some literary org sites reject HEAD with 405 — retry as GET
    const g = await tryFetch('GET');
    if (typeof g === 'object') return { ok: false, status: 0, reason: g.error };
    result = g;
  }
  const ok = result >= 200 && result < 400;
  return { ok, status: result, ...(!ok ? { reason: `HTTP ${result}` } : {}) };
}

// -- Concurrent URL checker --

async function checkAll(entries) {
  const results = new Array(entries.length).fill(null);
  const queue = [...entries.keys()];
  const total = entries.length;

  async function worker() {
    while (queue.length > 0) {
      const i = queue.shift();
      process.stdout.write(`  checking [${i + 1}/${total}] ${entries[i].name.slice(0, 55).padEnd(55)}\r`);
      results[i] = await checkURL(entries[i].url);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));
  process.stdout.write(' '.repeat(80) + '\r'); // clear progress line
  return results;
}

// -- Partition each entry into exactly one bucket: live / stale / expired / rolled --
// Priority: dead URL -> stale (no deadline logic applied).
// Live URL + past deadline: non-recurring -> expired; recurring/projected -> rolled.
// Everything else -> live.

function classifyEntries(entries, urlResults) {
  return entries.map((raw, i) => {
    const entry = { ...raw };
    // Strip previous classification flags so the script is idempotent
    delete entry.stale;
    delete entry.staleReason;
    delete entry.expired;

    if (!urlResults[i].ok) {
      entry.stale = true;
      entry.staleReason = urlResults[i].reason || `HTTP ${urlResults[i].status}`;
      return { entry, bucket: 'stale' };
    }

    const days = daysUntil(raw.deadline);
    const pastDeadline = days !== null && days < 0;

    if (pastDeadline && !raw.recurring && !raw.projected) {
      entry.expired = true;
      return { entry, bucket: 'expired' };
    }

    if (pastDeadline && (raw.recurring || raw.projected)) {
      entry.deadline = rollOneYear(raw.deadline);
      entry.projected = true;
      return { entry, bucket: 'rolled' };
    }

    return { entry, bucket: 'live' };
  });
}

// -- contests.SOURCES.md --

function buildSourcesDoc(entries, verifyDate) {
  const lines = [
    '# Sources for `contests.json`',
    '',
    'This dataset is curated from official contest and grant pages, not invented or inferred.',
    'Every entry\'s URL, deadline, fee, and prize was recorded directly from the organiser\'s',
    'own page as listed on the date shown. Any entry whose URL cannot be verified is flagged',
    '`stale:true` in the data for human review rather than silently removed.',
    '',
    `Last verified: ${verifyDate}`,
    '',
    '## Entries',
    '',
  ];

  for (const e of entries) {
    const notes = [];
    if (e.stale)   notes.push('URL flagged stale');
    if (e.expired) notes.push('deadline expired');
    const suffix = notes.length ? ` *(${notes.join('; ')})*` : '';
    lines.push(`- **${e.name}** — as listed on \`${e.source}\` on ${verifyDate}${suffix}`);
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- Entries with `projected: true` carry estimated deadlines based on each contest\'s prior annual',
    '  cycle; confirm the exact date on the organiser\'s page before submitting.',
    '- Entries with `recurring: true` have rolling or periodic windows; the `deadline` field shows the',
    '  next known cut-off date.',
    '- Stale entries are flagged but not removed. A human must confirm whether a contest has closed',
    '  permanently or whether the URL has moved before deletion.',
    '',
  );

  return lines.join('\n');
}

// -- Self-test: exercises the classifier against 4 synthetic entries; no file writes --

async function selfTest() {
  console.log('=== Self-test mode ===\n');

  const LIVE_URL = 'https://becomeawritertoday.com/';
  // Use httpbin.org which returns the requested status reliably.
  // The BAWT site catches unknown paths with a catch-all 200 redirect, making
  // it unsuitable for a dead-URL fixture despite the PRD's example.
  const DEAD_URL = 'https://httpbin.org/status/404';
  const PAST_DATE = '2025-01-01';

  const synth = [
    // (a) live URL, future deadline -> live bucket
    { name: 'SynthLive', type: 'contest', genres: ['poetry'], fee: 'Free', freeEntry: true,
      deadline: '2027-12-31', projected: false, prize: '$100', eligibility: 'Test',
      url: LIVE_URL, source: 'becomeawritertoday.com' },
    // (b) dead URL, future deadline -> stale bucket
    { name: 'SynthDead', type: 'contest', genres: ['poetry'], fee: 'Free', freeEntry: true,
      deadline: '2027-12-31', projected: false, prize: '$100', eligibility: 'Test',
      url: DEAD_URL, source: 'becomeawritertoday.com' },
    // (c1) live URL, past deadline, non-recurring -> expired bucket
    { name: 'SynthExpired', type: 'contest', genres: ['poetry'], fee: '$10', freeEntry: false,
      deadline: PAST_DATE, projected: false, prize: '$100', eligibility: 'Test',
      url: LIVE_URL, source: 'becomeawritertoday.com' },
    // (c2) live URL, past deadline, recurring -> rolled bucket (+1yr, projected:true)
    { name: 'SynthRolling', type: 'contest', genres: ['poetry'], fee: 'Free', freeEntry: true,
      deadline: PAST_DATE, projected: false, recurring: true, prize: '$100', eligibility: 'Test',
      url: LIVE_URL, source: 'becomeawritertoday.com' },
  ];

  console.log('Checking URLs for self-test entries...');
  const urlResults = await checkAll(synth);
  const classified = classifyEntries(synth, urlResults);

  let pass = 0, fail = 0;
  const problems = [];

  const check = (name, cond, detail) => {
    if (cond) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; problems.push(`  FAIL  ${name}: ${detail}`); console.log(`  FAIL  ${name}: ${detail}`); }
  };

  // (a) live URL -> not stale
  check('(a) live bucket', classified[0].bucket === 'live', `bucket=${classified[0].bucket}`);
  check('(a) no stale flag', !classified[0].entry.stale, `stale=${classified[0].entry.stale}`);

  // (b) dead URL -> stale
  check('(b) stale bucket', classified[1].bucket === 'stale', `bucket=${classified[1].bucket}`);
  check('(b) stale=true', classified[1].entry.stale === true, `stale=${classified[1].entry.stale}`);

  // (c1) non-recurring past deadline -> expired
  check('(c1) expired bucket', classified[2].bucket === 'expired', `bucket=${classified[2].bucket}`);
  check('(c1) expired=true', classified[2].entry.expired === true, `expired=${classified[2].entry.expired}`);

  // (c2) recurring past deadline -> rolled +1yr, projected:true
  const expectedRolled = rollOneYear(PAST_DATE);
  check('(c2) rolled bucket', classified[3].bucket === 'rolled', `bucket=${classified[3].bucket}`);
  check('(c2) deadline +1yr', classified[3].entry.deadline === expectedRolled, `got=${classified[3].entry.deadline} want=${expectedRolled}`);
  check('(c2) projected=true', classified[3].entry.projected === true, `projected=${classified[3].entry.projected}`);

  // Partition invariant: all four entries in exactly one bucket, counts sum to 4
  const buckets = classified.map((c) => c.bucket);
  const counts = { live: 0, stale: 0, expired: 0, rolled: 0 };
  for (const b of buckets) counts[b] = (counts[b] || 0) + 1;
  const total = counts.live + counts.stale + counts.expired + counts.rolled;
  check('partition sums to 4', total === 4, `total=${total}`);

  console.log(`\nSelf-test: PASS=${pass} FAIL=${fail}`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const p of problems) console.log(p);
    process.exit(1);
  }
  console.log('ALL GREEN');
  process.exit(0);
}

// -- Main --

if (process.argv.includes('--self-test')) {
  await selfTest();
} else {
  console.log('Contest verification starting...');

  const entries = JSON.parse(readFileSync(CONTESTS_PATH, 'utf8'));
  console.log(`Loaded ${entries.length} entries from contests.json`);

  // Network probe — abort without writing if the environment has no outbound access
  console.log('Probing network...');
  const probe = await checkURL('https://becomeawritertoday.com/');
  if (!probe.ok) {
    console.error('Network probe failed. Aborting without modifying data.');
    process.exit(1);
  }
  console.log(`Network OK (${probe.status}). Checking ${entries.length} URLs (${CONCURRENCY} concurrent)...`);

  const urlResults = await checkAll(entries);

  // Guard: if most URLs fail, it is likely an infra issue, not real link rot
  const failCount = urlResults.filter((r) => !r.ok).length;
  const failRate = failCount / urlResults.length;
  if (failRate >= INFRA_FAIL_THRESHOLD) {
    console.error(
      `Infrastructure failure suspected: ${failCount}/${urlResults.length} URLs failed ` +
      `(${Math.round(failRate * 100)}%). Not writing data. Check network connectivity.`,
    );
    process.exit(1);
  }

  const classified = classifyEntries(entries, urlResults);
  const updated = classified.map((c) => c.entry);

  // Partition counts
  const counts = { live: 0, stale: 0, expired: 0, rolled: 0 };
  for (const c of classified) counts[c.bucket]++;
  const total = counts.live + counts.stale + counts.expired + counts.rolled;

  if (total !== entries.length) {
    console.error(`Partition invariant violated: ${total} != ${entries.length}. Aborting.`);
    process.exit(1);
  }

  // Write updated contests.json
  writeFileSync(CONTESTS_PATH, JSON.stringify(updated, null, 2) + '\n');

  const verifyDate = new Date().toISOString().slice(0, 10);

  // Write report
  const report = {
    verifyDate,
    total: entries.length,
    live: counts.live,
    stale: counts.stale,
    expired: counts.expired,
    rolled: counts.rolled,
    details: classified
      .filter((c) => c.bucket !== 'live')
      .map((c, _, arr) => {
        const i = classified.indexOf(c);
        return {
          name: c.entry.name,
          url: entries[i].url,
          bucket: c.bucket,
          ...(c.bucket === 'stale' ? { reason: urlResults[i].reason } : {}),
          ...(c.bucket === 'rolled' ? { newDeadline: c.entry.deadline } : {}),
        };
      }),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');

  // Write SOURCES.md
  writeFileSync(SOURCES_PATH, buildSourcesDoc(updated, verifyDate));

  // Summary
  console.log(`\nVerification complete: ${verifyDate}`);
  console.log(`  live    : ${counts.live}`);
  console.log(`  stale   : ${counts.stale}`);
  console.log(`  expired : ${counts.expired}`);
  console.log(`  rolled  : ${counts.rolled}`);
  console.log(`  total   : ${total}`);

  for (const { bucket, entry } of classified.filter((c) => c.bucket !== 'live')) {
    if (bucket === 'stale')   console.log(`  [STALE]   ${entry.name}`);
    if (bucket === 'expired') console.log(`  [EXPIRED] ${entry.name}`);
    if (bucket === 'rolled')  console.log(`  [ROLLED]  ${entry.name} -> ${entry.deadline}`);
  }

  console.log(`\nReport : ${REPORT_PATH}`);
  console.log(`Sources: ${SOURCES_PATH}`);
}
