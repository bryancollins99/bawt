import React, { useMemo, useState } from 'react';
import {
  analyzeDeadWords,
  ACCENT_CLASSES,
  CATEGORIES,
} from '../utils/deadWordUtils';

// Dead / Weak-Word Checker
// Paste text → dead/weak words are highlighted IN PLACE (grouped by type), with a
// running count and, per word, curated stronger replacement suggestions.
// Fully offline (curated word bank in src/data/deadWords.json) — no network call.

const SAMPLE =
  'It was very really nice and just good. We got a lot of stuff done, ' +
  'and the meeting was basically fine, so things went pretty well in the end.';

const DeadWordChecker = () => {
  const [text, setText] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // filter highlights by category
  const [copied, setCopied] = useState('');

  const result = useMemo(() => analyzeDeadWords(text), [text]);
  const { segments, found, totalDead, totalWords, density, byCategory } = result;

  const copySwap = (swap, id) => {
    try {
      navigator.clipboard?.writeText(swap);
      setCopied(id);
      setTimeout(() => setCopied(''), 1200);
    } catch {
      /* clipboard unavailable — non-fatal */
    }
  };

  const visibleFound = activeCategory
    ? found.filter((f) => f.category === activeCategory)
    : found;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          🩹 Dead &amp; Weak-Word Checker
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Paste your writing to highlight the dead and weak words that drain it —
          intensifiers, vague nouns, weak verbs, weak adjectives and filler
          qualifiers — each with stronger replacements you can copy in a click.
        </p>
      </div>

      {/* Input */}
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          rows={6}
          className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setText(SAMPLE)}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-700
                       text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Try a sample
          </button>
          <button
            onClick={() => {
              setText('');
              setActiveCategory(null);
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-700
                       text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary + legend */}
      {totalWords > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3">
            <div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalDead}
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                dead / weak {totalDead === 1 ? 'word' : 'words'}
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {density}%
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                of {totalWords} words
              </span>
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                activeCategory === null
                  ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              All ({totalDead})
            </button>
            {CATEGORIES.map((cat) => {
              const n = byCategory[cat.key] || 0;
              const accent = ACCENT_CLASSES[cat.accent];
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(isActive ? null : cat.key)}
                  disabled={n === 0}
                  title={cat.blurb}
                  className={`px-2.5 py-1 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                    n === 0 ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    isActive
                      ? `${accent.chip} border-transparent font-semibold`
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} />
                  {cat.label} ({n})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlighted text */}
      {totalWords > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your text
          </h3>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-100">
            {totalDead === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ No dead or weak words found — your writing is tight.
              </span>
            ) : (
              segments.map((seg, i) => {
                if (!seg.dead) return <span key={i}>{seg.text}</span>;
                const dim =
                  activeCategory && seg.entry.category !== activeCategory;
                const accent = ACCENT_CLASSES[seg.entry.accent];
                return (
                  <mark
                    key={i}
                    title={`${seg.entry.categoryLabel} → ${seg.entry.swaps.join(', ')}`}
                    className={`rounded px-0.5 font-medium ${
                      dim ? 'bg-transparent text-inherit opacity-40' : accent.mark
                    }`}
                  >
                    {seg.text}
                  </mark>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {visibleFound.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Suggested stronger swaps
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleFound.map((f) => {
              const accent = ACCENT_CLASSES[f.accent];
              return (
                <div
                  key={f.word}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} />
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {f.word}
                      </span>
                      {f.count > 1 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ×{f.count}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${accent.text}`}>{f.categoryLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.swaps.map((swap, si) => {
                      const id = `${f.word}-${si}`;
                      return (
                        <button
                          key={id}
                          onClick={() => copySwap(swap, id)}
                          title="Copy suggestion"
                          className={`px-2 py-1 text-xs rounded-md ${accent.chip} hover:opacity-80 transition-opacity`}
                        >
                          {copied === id ? '✓ copied' : swap}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadWordChecker;
