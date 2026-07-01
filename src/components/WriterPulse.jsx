import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchWriterPulse,
  readPulseCache,
  writePulseCache,
  relativeAge,
  hnItemUrl,
} from '../utils/writerPulseUtils';

/**
 * WriterPulse — a live "what writers are talking about" widget.
 *
 * Pulls recent trending Hacker News stories matching a broad writing /
 * publishing / AI-writing term set and shows a compact link-out list. Refreshes
 * on load. Offline-first: a failed/empty live fetch falls back to the last good
 * result cached in localStorage — never a blank box.
 *
 * Ships as an EMBEDDED WIDGET (sidebar/inline), not an indexable standalone
 * page (a thin auto-aggregated link feed is a Helpful-Content risk).
 */
const WriterPulse = () => {
  const [stories, setStories] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | live | cached | empty | error
  const [note, setNote] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setNote(null);
    const fresh = await fetchWriterPulse();
    if (fresh.length) {
      writePulseCache(fresh);
      setStories(fresh);
      setStatus('live');
      return;
    }
    // Live fetch failed or returned nothing on-topic — prefer last good cache.
    const cache = readPulseCache();
    if (cache && cache.stories.length) {
      setStories(cache.stories);
      setStatus('cached');
      setNote('Showing the last saved feed — the live feed is unavailable or nothing new is on-topic right now.');
      return;
    }
    setStories([]);
    setStatus('empty');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span aria-hidden="true">📡</span> Writer Pulse
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            What writers are discussing on Hacker News &middot; last 7 days
          </p>
        </div>
        <button
          onClick={load}
          disabled={status === 'loading'}
          className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          title="Refresh the feed"
        >
          {status === 'loading' ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {note && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
          {note}
        </p>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="mt-6 space-y-3" aria-live="polite">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse"
            />
          ))}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            Loading the latest writing chatter…
          </p>
        </div>
      )}

      {/* Empty state — live fetch worked but nothing on-topic and no cache */}
      {status === 'empty' && (
        <div className="mt-6 text-center py-10">
          <p className="text-gray-600 dark:text-gray-300">
            No fresh writing stories in the last 7 days right now.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Check back soon — this feed updates as Hacker News does.
          </p>
        </div>
      )}

      {/* Error state — fetch failed AND no cache to fall back to */}
      {status === 'error' && (
        <div className="mt-6 text-center py-10">
          <p className="text-gray-600 dark:text-gray-300">
            Couldn’t load the live feed just now, and no cached stories are available.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Please try again shortly.
          </p>
        </div>
      )}

      {/* Stories */}
      {(status === 'live' || status === 'cached') && stories.length > 0 && (
        <ul className="mt-5 divide-y divide-gray-100 dark:divide-gray-700">
          {stories.map((s) => (
            <li key={s.id} className="py-3">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline leading-snug"
              >
                {s.title}
              </a>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400" title="Hacker News points">
                  ▲ {s.points}
                </span>
                <a
                  href={hnItemUrl(s.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {s.comments} comment{s.comments === 1 ? '' : 's'}
                </a>
                <span>{relativeAge(s.created_at_i)}</span>
                {s.domain && (
                  <span className="text-gray-400 dark:text-gray-500 truncate max-w-[12rem]">
                    {s.domain}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Credit */}
      <p className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-center">
        Live feed via Hacker News. Links open at the source.
      </p>
    </div>
  );
};

export default WriterPulse;
