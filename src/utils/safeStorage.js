/**
 * Storage access that never throws.
 *
 * This app runs inside third-party iframes on becomeawritertoday.com ranking
 * pages. When the embedding browser blocks third-party storage (a common
 * Chrome configuration, plus Safari/Brave defaults and private windows),
 * merely touching window.localStorage throws a SecurityError. If that happens
 * inside a React render (e.g. a useState initializer) the whole app crashes
 * to a white box on the host page.
 *
 * Same pattern as readPulseCache/writePulseCache in writerPulseUtils.js:
 * wrap every access in try/catch and degrade to "no persistence" instead of
 * crashing. All localStorage access in src/ must go through these helpers.
 */

export function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    // Blocked third-party storage / private mode / no window (tests).
    return null;
  }
}

export function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* blocked storage / private mode / quota — non-fatal no-op */
  }
}

export function safeRemoveItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    /* non-fatal no-op */
  }
}
