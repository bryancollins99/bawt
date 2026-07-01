#!/usr/bin/env node
// Precision guard for src/utils/deviceDetection.js.
// Runs the labeled gold set (src/data/deviceDetectorGold.json) and asserts:
//   - every positive line flags each device in its `expected` list,
//   - every negative/trap line produces ZERO device labels,
//   - the detector never emits a phoneme/semantic device (assonance,
//     consonance, metaphor, allegory, farce, tragic-hero, ballad).
// Run with: npm test  (or: node scripts/deviceDetectionTest.mjs)
// Exits non-zero on any failure so CI / pre-push can gate on it.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { detectDevices } from '../src/utils/deviceDetection.js';

const here = dirname(fileURLToPath(import.meta.url));
const gold = JSON.parse(
  readFileSync(join(here, '..', 'src', 'data', 'deviceDetectorGold.json'), 'utf8')
);

const FORBIDDEN = [
  'assonance', 'consonance', 'metaphor', 'allegory', 'farce', 'tragic-hero', 'ballad',
];

let failures = 0;
const emitted = new Set();

for (const item of gold.lines) {
  const devices = detectDevices(item.line).map((d) => d.device);
  devices.forEach((d) => emitted.add(d));
  const set = new Set(devices);

  if (item.type === 'positive') {
    const missing = item.expected.filter((e) => !set.has(e));
    if (missing.length) {
      console.error(`FAIL positive missing [${missing}]: "${item.line}" -> [${devices}]`);
      failures++;
    } else {
      console.log(`ok  positive: "${item.line}" -> [${devices}]`);
    }
  } else {
    if (devices.length > 0) {
      console.error(`FAIL negative false-positive: "${item.line}" -> [${devices}]`);
      failures++;
    } else {
      console.log(`ok  negative: "${item.line}"`);
    }
  }
}

const leaked = FORBIDDEN.filter((f) => emitted.has(f));
if (leaked.length) {
  console.error(`FAIL: detector leaked quiz-only labels: [${leaked}]`);
  failures++;
} else {
  console.log(`ok  no quiz-only labels leaked. Emitted: [${[...emitted].sort()}]`);
}

if (failures) {
  console.error(`\nPRECISION TEST: FAIL (${failures})`);
  process.exit(1);
}
console.log('\nPRECISION TEST: PASS');
