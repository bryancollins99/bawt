import React, { useMemo, useState } from 'react';
import contests from '../data/contests.json';
import {
  filterContests,
  sortContests,
  collectGenres,
  collectRegions,
  collectAudiences,
  collectYears,
  genreLabel,
  regionLabel,
  deadlineStatus,
  formatDeadline,
} from '../utils/contestUtils';

const TONE_STYLES = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  soon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  open: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rolling: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  expired: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  unknown: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
};

const TYPE_STYLES = {
  contest: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  grant: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
};

// Double opt-in capture into Resend via the shared Netlify function.
// Replaces the former Kit form 8060129 POST to close list fragmentation.
const SUBSCRIBE_ENDPOINT = '/.netlify/functions/subscribe';

const DeadlineAlertsForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [genre, setGenre] = useState('all');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, genre, source_surface: 'contest-finder' }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        let msg = 'Something went wrong. Please try again.';
        try {
          const j = await res.json();
          if (j && j.error) msg = j.error;
        } catch (_) { /* ignore */ }
        setError(msg);
        setSending(false);
      }
    } catch (_) {
      setError('Network error. Please try again.');
      setSending(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1">
        📬 Get deadline alerts
      </h3>
      {submitted ? (
        <p className="text-blue-700 dark:text-blue-400 text-sm">
          Almost there. Check your inbox and click the link to confirm your subscription.
        </p>
      ) : (
        <>
          <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
            Pick what you write and we will email you when contests are about to close. We use double
            opt-in, so you confirm by email first.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              aria-label="What you write"
              className="px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fiction">Fiction</option>
              <option value="poetry">Poetry</option>
              <option value="nonfiction">Nonfiction</option>
              <option value="all">Everything</option>
            </select>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-60"
            >
              Notify me
            </button>
          </form>
          {error ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <p className="mt-2 text-xs text-blue-600/70 dark:text-blue-400/60">
              No spam. Unsubscribe anytime.
            </p>
          )}
        </>
      )}
    </div>
  );
};

const ContestFinder = () => {
  const [genre, setGenre] = useState('all');
  const [type, setType] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [cashOnly, setCashOnly] = useState(false);
  const [hideExpired, setHideExpired] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [region, setRegion] = useState('all');
  const [audience, setAudience] = useState('all');
  const [year, setYear] = useState('all');

  const genres    = useMemo(() => collectGenres(contests), []);
  const regions   = useMemo(() => collectRegions(contests), []);
  const audiences = useMemo(() => collectAudiences(contests), []);
  const years     = useMemo(() => collectYears(contests), []);

  const results = useMemo(() => {
    const filtered = filterContests(contests, {
      genre, type, freeOnly, cashOnly, hideExpired, search, region, audience, year,
    });
    return sortContests(filtered, sortBy);
  }, [genre, type, freeOnly, cashOnly, hideExpired, search, sortBy, region, audience, year]);

  const resetFilters = () => {
    setGenre('all');
    setType('all');
    setFreeOnly(false);
    setCashOnly(false);
    setHideExpired(true);
    setSearch('');
    setSortBy('deadline');
    setRegion('all');
    setAudience('all');
    setYear('all');
  };

  const closingSoon = results.filter((e) => {
    const s = deadlineStatus(e.deadline, e.recurring);
    return s.tone === 'urgent';
  }).length;

  const selectClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 Contest &amp; Grant Finder
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          A filterable database of real writing contests, prizes, and grants — sorted by the next
          deadline so you never miss an entry window. Deadlines update live as dates approach.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectClass}>
            <option value="all">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{genreLabel(g)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            <option value="all">Contests &amp; grants</option>
            <option value="contest">Contests / prizes</option>
            <option value="grant">Grants / fellowships</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{regionLabel(r)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={selectClass}>
            <option value="all">All writers</option>
            {audiences.map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
            <option value="all">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
            <option value="deadline">Soonest deadline</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, prize, eligibility..."
            className={selectClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Free entry only</span>
        </label>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={cashOnly}
            onChange={(e) => setCashOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Cash prize only</span>
        </label>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={hideExpired}
            onChange={(e) => setHideExpired(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Hide closed</span>
        </label>
        <button
          onClick={resetFilters}
          className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reset filters
        </button>
      </div>

      {/* Result summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing <strong className="text-gray-900 dark:text-white">{results.length}</strong>{' '}
          {results.length === 1 ? 'opportunity' : 'opportunities'}
        </span>
        {closingSoon > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
            ⏰ {closingSoon} closing within a week
          </span>
        )}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No contests match your filters
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try widening the genre, allowing paid entries, or showing closed opportunities.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((entry, i) => {
            const status = deadlineStatus(entry.deadline, entry.recurring);
            const expired = status.tone === 'expired';
            return (
              <div
                key={`${entry.name}-${i}`}
                className={`rounded-lg p-5 border shadow-sm transition-colors ${
                  expired
                    ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 opacity-70'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[entry.type] || ''}`}>
                        {entry.type === 'grant' ? 'Grant' : 'Contest'}
                      </span>
                      {entry.freeEntry && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                          Free entry
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(entry.genres || []).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {genreLabel(g)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${TONE_STYLES[status.tone]}`}
                      title={
                        entry.projected
                          ? 'Estimated from this contest’s recurring annual cycle — confirm the exact date on the organiser’s page.'
                          : undefined
                      }
                    >
                      {entry.projected && status.tone !== 'expired' ? '≈ ' : ''}
                      {status.label}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDeadline(entry.deadline)}
                      {entry.projected && (
                        <span
                          className="ml-1 text-gray-400 dark:text-gray-500"
                          title="Estimated from this contest's recurring annual cycle — confirm the exact date on the organiser's page."
                        >
                          (est.)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Entry fee</span>
                    <span className="text-gray-800 dark:text-gray-200">{entry.fee || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Prize / award</span>
                    <span className="text-gray-800 dark:text-gray-200">{entry.prize || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Eligibility</span>
                    <span className="text-gray-800 dark:text-gray-200">{entry.eligibility || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Visit &amp; enter →
                  </a>
                  {entry.source && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate ml-3" title={`Source: ${entry.source}`}>
                      Source: {entry.source}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeadlineAlertsForm />

      {/* Data note */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
        Deadlines are hand-curated from official sources and shown live (&ldquo;days left&rdquo; is
        calculated on load). Always confirm dates, fees, and rules on the organiser&apos;s own page
        before entering. Last curated: July 2026.
      </p>
    </div>
  );
};

export default ContestFinder;
