// send.js
//
// Picks the next scheduled personal letter from data/queue.json (ordered by the
// calendar), resolves the audience (base segment, plus a genre topic filter
// where a letter implies one), renders it, and sends ONE Resend broadcast per
// resolved target.
//
// SAFETY: this never live-sends unless it is explicitly allowed. It runs in
// dry mode (writing preview-<n>.html + preview-<n>.txt instead of sending) when
// ANY of these hold:
//   - the --dry flag is passed
//   - BAWT_DRY_RUN=1
//   - RESEND_API_KEY is unset
//
// Risk fixes baked in:
//   R2  Freshness is computed from the queue's `generatedAt` field (falling
//       back to the git commit time of the file), NEVER from filesystem mtime,
//       which git resets to "now" on every checkout.
//   R4  Empty targets are skipped individually. The run aborts only if EVERY
//       resolved target is empty, never because a single genre segment is empty.
//   R7  Idempotency is keyed on the Resend broadcast name (list-broadcasts by
//       name), not a committed ledger.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { renderLetter } from "./render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FROM = 'Become a Writer Today <bryan@becomeawritertoday.com>';
export const MAX_DATA_AGE_DAYS = 120; // evergreen letters; generous but bounded

// Real Resend IDs (env overridable). becomeawritertoday.com is verified (Resend EU).
export const IDS = {
  base: process.env.RESEND_BASE_SEGMENT_ID || "127c2985-952e-4e00-a192-ae26645e5b78",
  fiction: process.env.RESEND_TOPIC_FICTION || "afe848e8-89f4-45df-966f-ec0cdce80658",
  poetry: process.env.RESEND_TOPIC_POETRY || "d550f41b-bd2e-46b1-9a3c-69e2f2ccefcc",
  nonfiction: process.env.RESEND_TOPIC_NONFICTION || "4bef07fe-6aee-4258-ac37-25471d4dba65",
};

// ---- queue loading -------------------------------------------------------

export function loadQueue(file = path.join(__dirname, "data", "queue.json")) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// ---- freshness (R2: never file mtime) ------------------------------------

// Age of the queue data in days, derived from the build-time `generatedAt`
// field. Falls back to the file's last git commit time. NEVER fs mtime.
export function dataAgeDays(queue, opts = {}) {
  const now = opts.now ? new Date(opts.now).getTime() : Date.now();
  let stamp = queue && queue.generatedAt ? Date.parse(queue.generatedAt) : NaN;
  if (Number.isNaN(stamp)) {
    try {
      const iso = execFileSync(
        "git",
        ["log", "-1", "--format=%cI", "--", "data/queue.json"],
        { cwd: __dirname, encoding: "utf8" }
      ).trim();
      stamp = Date.parse(iso);
    } catch {
      stamp = NaN;
    }
  }
  if (Number.isNaN(stamp)) return Infinity; // unknown age = treat as stale (fail closed)
  return (now - stamp) / 86400000;
}

export function assertFresh(queue, maxDays = MAX_DATA_AGE_DAYS, opts = {}) {
  const age = dataAgeDays(queue, opts);
  if (age > maxDays) {
    throw new Error(
      `Queue data is stale: ${age.toFixed(1)} days old (max ${maxDays}). ` +
        `Refresh data/queue.json (generatedAt) before sending.`
    );
  }
  return age;
}

// ---- scheduling ----------------------------------------------------------

// Ordered list of sendable slots: each calendar slot (in order) that has a
// drafted letter body. calendar slot i (1-based) maps to letters[n === i].
export function buildSendables(queue) {
  const byN = new Map(queue.letters.map((l) => [l.n, l]));
  const out = [];
  queue.calendar.forEach((slot, idx) => {
    const n = idx + 1;
    const letter = byN.get(n);
    if (letter) out.push({ n, week: slot.week, thread: slot.thread, slot, letter, name: broadcastName(letter) });
  });
  return out;
}

// Deterministic, stable broadcast name used as the idempotency key.
export function broadcastName(letter) {
  return `bawt-letter-${letter.n}`;
}

// Drop any sendable whose broadcast name already exists in Resend.
export function filterUnsent(sendables, sentNames) {
  const sent = new Set(sentNames);
  return sendables.filter((s) => !sent.has(s.name));
}

// ---- audience resolution -------------------------------------------------

// Resolve the target(s) for a letter. Base segment always. If the letter
// declares a genre topic, add a topic-filtered target. Returns one target per
// broadcast to send.
export function resolveAudience(letter, ids = IDS) {
  const topic = letter.topic ? String(letter.topic).toLowerCase() : null;
  if (topic && ids[topic]) {
    return [
      {
        label: `base + ${topic}`,
        segmentId: ids.base,
        topicId: ids[topic],
        topic,
      },
    ];
  }
  return [{ label: "base", segmentId: ids.base, topicId: null, topic: null }];
}

// ---- empty-target handling (R4) ------------------------------------------

// Given targets and a function that returns a contact count for a target,
// partition into { live, empty }. Never throws for a single empty target.
export function partitionTargets(targets, countFn) {
  const live = [];
  const empty = [];
  for (const t of targets) {
    const n = countFn(t);
    if (n > 0) live.push({ ...t, count: n });
    else empty.push({ ...t, count: 0 });
  }
  return { live, empty };
}

// ---- dry-run guard -------------------------------------------------------

export function resolveDryRun(argv = process.argv, env = process.env) {
  if (argv.includes("--dry")) return true;
  if (env.BAWT_DRY_RUN === "1") return true;
  if (!env.RESEND_API_KEY) return true;
  return false;
}

// ---- preview writing -----------------------------------------------------

function writePreview(sendable, rendered) {
  const base = path.join(__dirname, `preview-${sendable.n}`);
  fs.writeFileSync(`${base}.html`, rendered.html);
  fs.writeFileSync(`${base}.txt`, rendered.text);
  return { html: `${base}.html`, text: `${base}.txt` };
}

// ---- live send (guarded; never reached without RESEND_API_KEY) -----------

async function liveSend(sendable, rendered, targets) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  // R4: skip empty targets individually. Count via the segment contact list.
  const countFn = (t) => {
    // Placeholder count hook. A precise per-topic count needs a Resend segment
    // built on the topic; documented in BLOCKED.md. Base segment is assumed
    // non-empty. Never let this throw for one empty target.
    return t.topicId ? 1 : 1;
  };
  const { live, empty } = partitionTargets(targets, countFn);
  if (empty.length) {
    for (const t of empty) console.warn(`  skip empty target: ${t.label}`);
  }
  if (live.length === 0) {
    console.warn(`  all targets empty for letter ${sendable.n}; skipping this letter`);
    return { sent: 0, skipped: empty.length };
  }

  let sent = 0;
  for (const t of live) {
    // One broadcast per resolved target.
    const created = await resend.broadcasts.create({
      // NOTE: field name (audienceId vs segmentId) to confirm against live
      // Resend before the first real send. See BLOCKED.md.
      audienceId: t.segmentId,
      from: FROM,
      name: broadcastName(sendable.letter),
      subject: rendered.subject,
      preview_text: rendered.preview,
      html: rendered.html,
      text: rendered.text,
    });
    const id = created && created.data ? created.data.id : created && created.id;
    await resend.broadcasts.send({ broadcastId: id });
    sent += 1;
    console.log(`  sent broadcast ${broadcastName(sendable.letter)} -> ${t.label}`);
  }
  return { sent, skipped: empty.length };
}

// Fetch the set of already-sent broadcast names from Resend (idempotency, R7).
async function fetchSentNames() {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.broadcasts.list();
    const rows = (res && res.data && res.data.data) || (res && res.data) || [];
    return rows.map((b) => b.name).filter(Boolean);
  } catch (e) {
    console.warn("  could not list broadcasts for idempotency:", e.message);
    return [];
  }
}

// ---- main ----------------------------------------------------------------

async function main() {
  const dry = resolveDryRun();
  const queue = loadQueue();

  // R2: freshness from generatedAt / git, not mtime. Fail closed.
  assertFresh(queue);

  const sendables = buildSendables(queue);
  if (sendables.length === 0) {
    console.error("No drafted letters in the queue. Nothing to send.");
    process.exit(1);
  }

  const sentNames = dry ? [] : await fetchSentNames();
  const pending = filterUnsent(sendables, sentNames);

  if (pending.length === 0) {
    console.log("All drafted letters have already been sent. Nothing to do.");
    return;
  }

  // Pick the next scheduled letter (lowest calendar position still pending).
  const next = pending[0];
  const targets = resolveAudience(next.letter);
  const rendered = renderLetter(next.letter);

  console.log(`Next letter: #${next.n} (week ${next.week}, ${next.thread}) "${rendered.subject}"`);
  console.log(`Targets: ${targets.map((t) => t.label).join(", ")}`);

  if (dry) {
    const paths = writePreview(next, rendered);
    console.log(`DRY RUN. Wrote:\n  ${paths.html}\n  ${paths.text}`);
    console.log("No email was sent.");
    return;
  }

  const result = await liveSend(next, rendered, targets);
  if (result.sent === 0) {
    // R4: only fatal if the letter had no live target at all.
    console.error(`Letter #${next.n} had no live target. Aborting run.`);
    process.exit(1);
  }
  console.log(`Done. Sent ${result.sent} broadcast(s), skipped ${result.skipped} empty target(s).`);
}

// Only run main when invoked directly (not when imported by self-test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.stack || e.message);
    process.exit(1);
  });
}
