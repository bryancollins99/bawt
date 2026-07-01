import React, { useMemo, useState } from 'react';
import { getAllRoots, searchRoots, decomposeWord, STATUS_LABELS } from '../utils/rootUtils';

const ORIGIN_BADGE = {
  latin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  greek: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
};

const PART_STYLE = {
  root: 'bg-blue-600 text-white',
  prefix: 'bg-purple-600 text-white',
  connector: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  suffix: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  unmatched: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-dashed border-red-400',
};

const STATUS_STYLE = {
  verified: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  possible: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
  partial: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  none: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

function OriginBadge({ origin }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ORIGIN_BADGE[origin] || ''}`}>
      {origin}
    </span>
  );
}

function ExploreTab() {
  const allRoots = useMemo(() => getAllRoots(), []);
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState('all');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = useMemo(() => searchRoots(query, origin), [query, origin]);
  const selected = results[selectedIdx] || results[0] || null;

  const originButton = (value, label) => (
    <button
      key={value}
      onClick={() => { setOrigin(value); setSelectedIdx(0); }}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        origin === value
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
          placeholder="Search a root, meaning, or example word…"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {originButton('all', 'All')}
          {originButton('greek', 'Greek')}
          {originButton('latin', 'Latin')}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {results.length} root{results.length === 1 ? '' : 's'} · {allRoots.length} in the collection
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Root list */}
        <div className="md:col-span-1 max-h-[26rem] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {results.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No roots match that search.</p>
          )}
          {results.map((entry, idx) => (
            <button
              key={`${entry.root}-${idx}`}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                selected && results[selectedIdx] === entry
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.root}-</span>
              <span className="text-sm text-gray-500 dark:text-gray-400"> {entry.meaning}</span>
            </button>
          ))}
        </div>

        {/* Selected root detail */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selected.root}-</h3>
                <OriginBadge origin={selected.origin} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Meaning: <span className="font-medium">{selected.meaning}</span>
              </p>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Word family
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {selected.words.map((w) => (
                  <div key={w.word} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{w.word}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{w.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Select a root to see its word family.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BreakTab() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const run = () => {
    if (!input.trim()) { setResult(null); return; }
    setResult(decomposeWord(input));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
          placeholder="Enter a word, e.g. biology, transport, telephone…"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={run}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Break it down
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
          <div className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border mb-4 ${STATUS_STYLE[result.status]}`}>
            {STATUS_LABELS[result.status]}
          </div>

          {result.status === 'none' ? (
            <p className="text-gray-600 dark:text-gray-300">
              We couldn't find any Latin or Greek roots from our collection in
              <span className="font-semibold"> "{result.normalized}"</span>. Its roots may not be in
              our dataset — we won't invent a breakdown.
            </p>
          ) : (
            <>
              {/* Visual breakdown */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {result.parts.map((part, i) => (
                  <React.Fragment key={i}>
                    <span className={`px-2.5 py-1 rounded-md font-mono text-sm font-semibold ${PART_STYLE[part.kind]}`}>
                      {part.text}
                    </span>
                    {i < result.parts.length - 1 && <span className="text-gray-400">+</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Piece meanings */}
              <div className="space-y-2">
                {result.parts.filter((p) => p.kind === 'root' || p.kind === 'prefix').map((part, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap text-sm">
                    <span className={`px-2 py-0.5 rounded font-mono font-semibold ${PART_STYLE[part.kind]}`}>{part.text}</span>
                    <span className="text-gray-500 dark:text-gray-400">{part.kind}</span>
                    <span className="text-gray-700 dark:text-gray-200">→ {part.meaning}</span>
                    {part.origin && <OriginBadge origin={part.origin} />}
                  </div>
                ))}
                {result.parts.some((p) => p.kind === 'unmatched') && (
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    The dashed part isn't a root in our dataset, so this breakdown is incomplete.
                  </p>
                )}
              </div>

              {result.note && (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  ⚠ {result.note}
                </p>
              )}

              {result.status !== 'verified' && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                  This is a <strong>possible</strong> breakdown from matching our root collection —
                  not a guaranteed etymology. A word can contain a root's letters by coincidence (a
                  "false friend") without deriving from it, so treat the roots shown above as
                  suggestions to check, not proof.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const RootWordExplorer = () => {
  const [tab, setTab] = useState('explore');

  const tabButton = (value, label) => (
    <button
      onClick={() => setTab(value)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        tab === value
          ? 'bg-blue-600 text-white shadow'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Root Word Explorer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Explore a Latin or Greek root to see its word family, or break a word into its roots.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {tabButton('explore', '🌱 Explore a root')}
        {tabButton('break', '🔨 Break a word')}
      </div>

      {tab === 'explore' ? <ExploreTab /> : <BreakTab />}
    </div>
  );
};

export default RootWordExplorer;
