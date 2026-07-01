import React from 'react';
import weeklyPulse from '../data/weeklyPulse.json';

/**
 * WeeklyWriting — "This Week in Writing & AI".
 *
 * The INDEXABLE, auto-updating cousin of WriterPulse. Where WriterPulse fetches
 * live client-side and ships as a sidebar widget, this component renders the
 * COMMITTED src/data/weeklyPulse.json — static content baked into the build so
 * it is crawlable and stable. That JSON is regenerated every Monday by
 * scripts/build-weekly-pulse.mjs via a scheduled GitHub Action, which commits
 * the change and triggers a Netlify redeploy. So the page updates weekly with no
 * runtime fetch and no LLM in the data path.
 *
 * slug: weekly-writing
 */

function formatWeekOf(weekOf) {
  if (!weekOf) return '';
  // weekOf is a YYYY-MM-DD string; render it as a readable date without pulling
  // in a timezone shift (parse as UTC noon to be safe).
  const d = new Date(`${weekOf}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return weekOf;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function hostLabel(item) {
  if (item.domain) return item.domain;
  try {
    return new URL(item.url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const WeeklyWriting = () => {
  const items = Array.isArray(weeklyPulse.items) ? weeklyPulse.items : [];
  const weekOfLabel = formatWeekOf(weeklyPulse.weekOf);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span aria-hidden="true">🗞️</span> This Week in Writing &amp; AI
        </h1>
        {weekOfLabel && (
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-1">
            Week of {weekOfLabel}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          An automatically compiled digest of the writing, publishing, and
          AI-writing stories drawing the most discussion on Hacker News over the
          past two weeks, ranked by community engagement. Rebuilt fresh every
          Monday. Follow any headline through to read the original at its source.
        </p>
      </header>

      {/* Story list */}
      {items.length > 0 ? (
        <ol className="mt-5 divide-y divide-gray-100 dark:divide-gray-700 list-none">
          {items.map((item, i) => (
            <li key={item.url || i} className="py-3 flex gap-3">
              <span
                className="shrink-0 mt-0.5 w-6 text-right text-sm font-semibold text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline leading-snug"
                >
                  {item.title}
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span
                    className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400"
                    title="Hacker News points"
                  >
                    ▲ {item.points}
                  </span>
                  <span title="Comments">
                    {item.comments} comment{item.comments === 1 ? '' : 's'}
                  </span>
                  {hostLabel(item) && (
                    <span className="text-gray-400 dark:text-gray-500 truncate max-w-[14rem]">
                      {hostLabel(item)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-6 text-center py-10">
          <p className="text-gray-600 dark:text-gray-300">
            This week&apos;s digest is being compiled.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Check back Monday for the latest writing and AI stories.
          </p>
        </div>
      )}

      {/* Credit */}
      <p className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-center">
        Stories sourced from Hacker News. Rankings reflect community discussion,
        not endorsement. Links open at the source.
      </p>
    </div>
  );
};

export default WeeklyWriting;
