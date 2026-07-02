#!/usr/bin/env node
// Iframe-resilience regression tests.
//
// 1. safeStorage must never throw — including when merely TOUCHING
//    window.localStorage throws a SecurityError, which is what happens inside
//    a third-party iframe with third-party storage blocked (common Chrome
//    configuration). Direct access in App.jsx's useState initializer used to
//    crash the app to a white box on live ranking pages.
// 2. resolveTool must map unknown ?tool= values to the 'not-found' state
//    instead of silently rendering the default tool. The two phantom IDs the
//    README used to document (emotional-tone, royalty) are pinned as
//    regressions.
//
// Run with: npm test  (or: node scripts/resilienceTest.mjs)
// Exits non-zero on any failure so CI can gate on it.

import { safeGetItem, safeSetItem, safeRemoveItem } from '../src/utils/safeStorage.js';
import { resolveTool, DEFAULT_TOOL, NOT_FOUND, tools } from '../src/utils/toolRegistry.js';

let failures = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`ok  ${label}`);
  } catch (e) {
    console.error(`FAIL ${label}: ${e.message}`);
    failures++;
  }
}

function assertEqual(actual, expected, what) {
  if (actual !== expected) {
    throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// --- safeStorage: no window at all (bare node) ------------------------------
delete globalThis.window;

check('safeGetItem returns null when window is undefined', () => {
  assertEqual(safeGetItem('darkMode'), null, 'safeGetItem');
});
check('safeSetItem is a no-op when window is undefined', () => {
  safeSetItem('darkMode', 'true');
});
check('safeRemoveItem is a no-op when window is undefined', () => {
  safeRemoveItem('darkMode');
});

// --- safeStorage: touching localStorage throws (blocked third-party iframe) -
globalThis.window = {};
Object.defineProperty(globalThis.window, 'localStorage', {
  get() {
    throw new Error("SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.");
  },
});

check('safeGetItem returns null when localStorage access throws SecurityError', () => {
  assertEqual(safeGetItem('darkMode'), null, 'safeGetItem');
});
check('safeSetItem swallows SecurityError', () => {
  safeSetItem('darkMode', 'true');
});
check('safeRemoveItem swallows SecurityError', () => {
  safeRemoveItem('darkMode');
});

// --- safeStorage: methods themselves throw (quota / disabled) ---------------
globalThis.window = {
  localStorage: {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('SecurityError'); },
  },
};

check('safeGetItem returns null when getItem throws', () => {
  assertEqual(safeGetItem('darkMode'), null, 'safeGetItem');
});
check('safeSetItem swallows setItem throw', () => {
  safeSetItem('darkMode', 'false');
});

// --- safeStorage: working storage round-trips -------------------------------
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};

check('safeStorage round-trips through working storage', () => {
  safeSetItem('darkMode', 'true');
  assertEqual(safeGetItem('darkMode'), 'true', 'round-trip get');
  safeRemoveItem('darkMode');
  assertEqual(safeGetItem('darkMode'), null, 'get after remove');
});

delete globalThis.window;

// --- resolveTool: not-found path ---------------------------------------------
check('no ?tool= param resolves to the default tool', () => {
  assertEqual(resolveTool(null), DEFAULT_TOOL, 'resolveTool(null)');
  assertEqual(resolveTool(''), DEFAULT_TOOL, 'resolveTool("")');
});

check('every registered tool id resolves to itself', () => {
  for (const t of tools) {
    assertEqual(resolveTool(t.id), t.id, `resolveTool(${t.id})`);
  }
});

check('unknown tool ids resolve to not-found, never a silent default', () => {
  assertEqual(resolveTool('tpyo-tool'), NOT_FOUND, 'typo id');
  assertEqual(resolveTool('TONE'), NOT_FOUND, 'wrong-case id');
});

check('phantom README ids (emotional-tone, royalty) resolve to not-found', () => {
  assertEqual(resolveTool('emotional-tone'), NOT_FOUND, 'emotional-tone');
  assertEqual(resolveTool('royalty'), NOT_FOUND, 'royalty');
});

check("the not-found sentinel is not itself a registered tool id", () => {
  if (tools.some((t) => t.id === NOT_FOUND)) {
    throw new Error("'not-found' collides with a real tool id");
  }
});

// -----------------------------------------------------------------------------
if (failures) {
  console.error(`\n${failures} resilience test(s) FAILED`);
  process.exit(1);
}
console.log('\nAll resilience tests passed');
