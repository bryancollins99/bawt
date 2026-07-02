// Utilities for the Contest & Grant Finder tool.
// All deadline math is computed live from ISO dates (no cron / no build-time
// snapshot), so "X days left" / "closing this week" / "expired" stay accurate
// on every page load.

/**
 * Parse an ISO date (YYYY-MM-DD) as a UTC-midnight timestamp.
 * Using UTC midnight on both sides avoids off-by-one errors from timezone drift.
 * @param {string} iso - ISO date string, e.g. "2026-10-31".
 * @returns {number|null} epoch ms at UTC midnight, or null if invalid.
 */
export function parseISODateUTC(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const ts = Date.UTC(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(ts) ? null : ts;
}

/** Today at UTC midnight (epoch ms). */
export function todayUTC(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/**
 * Whole days from today (UTC) until the given ISO deadline.
 * Negative = already passed. 0 = closes today.
 * @returns {number|null} days left, or null if deadline unparseable.
 */
export function daysUntil(iso, now = new Date()) {
  const deadline = parseISODateUTC(iso);
  if (deadline === null) return null;
  const MS_PER_DAY = 86400000;
  return Math.round((deadline - todayUTC(now)) / MS_PER_DAY);
}

/** True if the deadline is in the past (before today, UTC). */
export function isExpired(iso, now = new Date()) {
  const d = daysUntil(iso, now);
  return d !== null && d < 0;
}

/**
 * Human-friendly deadline status derived live from the ISO date.
 * @param {string} iso
 * @param {boolean} recurring - rolling / weekly contests: once the listed date
 *   passes, the opportunity re-opens rather than closing, so we surface it as a
 *   rolling deadline instead of "Closed".
 * @returns {{label: string, tone: string, days: number|null}}
 *   tone ∈ 'expired' | 'urgent' | 'soon' | 'open' | 'rolling' | 'unknown'
 */
export function deadlineStatus(iso, recurring = false, now = new Date()) {
  const days = daysUntil(iso, now);
  if (days === null) return { label: 'Deadline TBC', tone: 'unknown', days: null };
  if (days < 0) {
    return recurring
      ? { label: 'Rolling deadline', tone: 'rolling', days }
      : { label: 'Closed', tone: 'expired', days };
  }
  if (days === 0) return { label: 'Closes today', tone: 'urgent', days };
  if (days === 1) return { label: '1 day left', tone: 'urgent', days };
  if (days <= 7) return { label: `${days} days left`, tone: 'urgent', days };
  if (days <= 30) return { label: `${days} days left`, tone: 'soon', days };
  return { label: `${days} days left`, tone: 'open', days };
}

/**
 * Whether an entry should be treated as closed for filtering/sorting.
 * Recurring (weekly/rolling) opportunities are never "closed" — their listed
 * date is just the next known cut-off.
 */
export function effectiveExpired(entry, now = new Date()) {
  return isExpired(entry.deadline, now) && !entry.recurring;
}

/** Format an ISO date for display, e.g. "31 Oct 2026". Falls back gracefully. */
export function formatDeadline(iso) {
  const ts = parseISODateUTC(iso);
  if (ts === null) return 'To be confirmed';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * Filter a list of contest entries.
 * @param {Array} entries
 * @param {Object} filters
 * @param {string}  filters.genre        - genre slug or 'all'
 * @param {string}  filters.type         - 'all' | 'contest' | 'grant'
 * @param {boolean} filters.freeOnly     - only show free-entry entries
 * @param {boolean} filters.hideExpired  - drop entries whose deadline has passed
 * @param {string}  filters.search       - case-insensitive text match on name/prize/eligibility
 * @param {string}  filters.region       - region slug ('all' | 'worldwide' | 'us' | 'uk' | 'ireland' | ...)
 * @param {string}  filters.audience     - audience slug ('all' | 'adult' | 'teen' | 'youth' | 'student')
 * @param {boolean} filters.cashOnly     - only show entries with a cash prize
 * @param {string}  filters.year         - deadline year ('all' | '2026' | '2027' | ...)
 * @param {Date}    now
 */
export function filterContests(entries, filters = {}, now = new Date()) {
  const {
    genre = 'all',
    type = 'all',
    freeOnly = false,
    hideExpired = false,
    search = '',
    region = 'all',
    audience = 'all',
    cashOnly = false,
    year = 'all',
  } = filters;
  const q = search.trim().toLowerCase();

  return entries.filter((e) => {
    if (type !== 'all' && e.type !== type) return false;
    if (genre !== 'all' && !(Array.isArray(e.genres) && e.genres.includes(genre))) return false;
    if (freeOnly && !e.freeEntry) return false;
    if (hideExpired && effectiveExpired(e, now)) return false;
    if (region !== 'all' && e.region !== region) return false;
    if (audience !== 'all' && !(Array.isArray(e.audience) && e.audience.includes(audience))) return false;
    if (cashOnly && !e.hasCashPrize) return false;
    if (year !== 'all' && (e.deadline ? e.deadline.slice(0, 4) : null) !== year) return false;
    if (q) {
      const hay = `${e.name} ${e.prize || ''} ${e.eligibility || ''} ${(e.genres || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Sort entries. Default 'deadline' = soonest upcoming first, expired sink to the
 * bottom (so the tool always foregrounds what a writer can still enter), TBC last.
 */
export function sortContests(entries, sortBy = 'deadline', now = new Date()) {
  const copy = [...entries];
  if (sortBy === 'name') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  // 'deadline'
  return copy.sort((a, b) => {
    let da = daysUntil(a.deadline, now);
    let db = daysUntil(b.deadline, now);
    // Recurring (rolling/weekly) contests never "close": if their listed date has
    // passed, treat them as imminent (0) so they stay near the top, not sunk.
    if (da !== null && da < 0 && a.recurring) da = 0;
    if (db !== null && db < 0 && b.recurring) db = 0;
    // TBC (null) always last
    if (da === null && db === null) return a.name.localeCompare(b.name);
    if (da === null) return 1;
    if (db === null) return -1;
    const aExpired = da < 0;
    const bExpired = db < 0;
    // Upcoming before expired
    if (aExpired !== bExpired) return aExpired ? 1 : -1;
    // Both upcoming: soonest first. Both expired: most-recently-closed first.
    return da - db;
  });
}

/** Distinct genre slugs present in the dataset, for building the filter dropdown. */
export function collectGenres(entries) {
  const set = new Set();
  entries.forEach((e) => (e.genres || []).forEach((g) => set.add(g)));
  return Array.from(set).sort();
}

/** Distinct non-null region values present in the dataset. */
export function collectRegions(entries) {
  const set = new Set();
  entries.forEach((e) => { if (e.region) set.add(e.region); });
  return Array.from(set).sort();
}

/** Distinct non-null audience values present in the dataset. */
export function collectAudiences(entries) {
  const set = new Set();
  entries.forEach((e) => (e.audience || []).forEach((a) => set.add(a)));
  return Array.from(set).sort();
}

/** Distinct deadline years present in the dataset. */
export function collectYears(entries) {
  const set = new Set();
  entries.forEach((e) => { if (e.deadline) set.add(e.deadline.slice(0, 4)); });
  return Array.from(set).sort();
}

/** Turn a genre slug into a display label, e.g. "short-story" -> "Short Story". */
export function genreLabel(slug) {
  return String(slug)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Human-readable label for a region slug. */
export function regionLabel(slug) {
  const MAP = { worldwide: 'Worldwide', us: 'USA', uk: 'UK', ireland: 'Ireland', canada: 'Canada' };
  return MAP[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}
