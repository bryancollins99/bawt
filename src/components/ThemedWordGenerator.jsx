import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchThemedWords } from '../utils/datamuseUtils';
import fallbackData from '../data/themedWordsFallback.json';

// Universal Themed Word Generator
// Enter (or click) any theme → related/evocative words grouped by part of speech,
// copy-per-word. Powered by the keyless Datamuse API (the app's ONLY network call),
// with a bundled curated fallback so the tool never blanks if Datamuse is down.

const PRESETS = [
  { key: 'light', label: 'Light', icon: '💡' },
  { key: 'family', label: 'Family', icon: '👪' },
  { key: 'spooky', label: 'Spooky', icon: '👻' },
  { key: 'uncommon', label: 'Uncommon', icon: '✨' },
  { key: 'love', label: 'Love', icon: '❤️' },
  { key: 'ocean', label: 'Ocean', icon: '🌊' },
  { key: 'autumn', label: 'Autumn', icon: '🍂' },
  { key: 'fear', label: 'Fear', icon: '😱' },
];

// Display order + labels for the grouped result columns.
const GROUPS = [
  { pos: 'poetic', name: 'Beautiful & Poetic Picks', accent: 'text-fuchsia-700 dark:text-fuchsia-300' },
  { pos: 'adjective', name: 'Adjectives', accent: 'text-indigo-700 dark:text-indigo-300' },
  { pos: 'noun', name: 'Nouns', accent: 'text-emerald-700 dark:text-emerald-300' },
  { pos: 'verb', name: 'Verbs', accent: 'text-amber-700 dark:text-amber-300' },
  { pos: 'other', name: 'Related & Associated', accent: 'text-rose-700 dark:text-rose-300' },
];

const DEBOUNCE_MS = 550;

const ThemedWordGenerator = () => {
  const [theme, setTheme] = useState('');
  const [activeTheme, setActiveTheme] = useState('');
  const [words, setWords] = useState([]);
  const [source, setSource] = useState(null); // 'live' | 'fallback' | 'empty'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const copyTimerRef = useRef(null);

  // Resolve the bundled curated set for a theme, if one exists.
  const getFallback = (t) => {
    const key = (t || '').trim().toLowerCase();
    const entry = fallbackData[key];
    return entry && Array.isArray(entry.words) ? entry.words : null;
  };

  // Route curated "associated" words into the Beautiful & Poetic Picks group.
  const asPoetic = (w) => (w.associated ? { ...w, pos: 'poetic' } : w);

  const runSearch = useCallback(async (rawTheme) => {
    const t = (rawTheme || '').trim();
    if (!t) {
      setWords([]);
      setSource(null);
      setActiveTheme('');
      return;
    }

    const reqId = ++requestIdRef.current;
    setLoading(true);
    setActiveTheme(t);

    // Live Datamuse (never throws; returns [] on any error/timeout).
    const live = await fetchThemedWords(t);

    // Ignore stale responses (a newer search superseded this one).
    if (reqId !== requestIdRef.current) return;

    const fb = getFallback(t);

    if (live.length > 0) {
      // Live path: enrich with the curated Beautiful & Poetic picks for known
      // presets so the evocative, AIO-resistant words always surface — not just
      // the raw Datamuse synonym list. Dedupe against what live already returned.
      let merged = live;
      if (fb) {
        const liveSet = new Set(live.map((w) => w.word.toLowerCase()));
        const picks = fb
          .filter((w) => w.associated && !liveSet.has(w.word.toLowerCase()))
          .map((w) => ({ word: w.word, pos: 'poetic', associated: true }));
        merged = [...picks, ...live];
      }
      setWords(merged);
      setSource('live');
    } else if (fb) {
      // Datamuse unreachable/empty → bundled curated fallback so we never blank.
      setWords(fb.map(asPoetic));
      setSource('fallback');
    } else {
      setWords([]);
      setSource('empty');
    }
    setLoading(false);
  }, []);

  // Debounced search as the user types a free theme.
  const handleInputChange = (value) => {
    setTheme(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  };

  // Preset chip → search immediately.
  const handlePreset = (key) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setTheme(key);
    runSearch(key);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(theme);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const copyWord = (word) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(word);
    }
    setCopied(word);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(''), 1200);
  };

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: words.filter((w) => w.pos === g.pos),
  })).filter((g) => g.items.length > 0);

  const hasResults = words.length > 0;

  return (
    <div
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      data-source={source || 'none'}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 Themed Word Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Enter any theme — or pick a preset — to get evocative related words, grouped and copy-ready.
        </p>
      </div>

      {/* Free-theme input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="themed-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your theme
        </label>
        <div className="flex gap-2">
          <input
            id="themed-input"
            type="text"
            value={theme}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g. light, ocean, courage, winter…"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
          >
            Generate
          </button>
        </div>
      </form>

      {/* Preset chips */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Popular themes
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p.key)}
              data-testid="preset-chip"
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTheme.toLowerCase() === p.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status line */}
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="themed-loading">
          Finding words related to “{activeTheme}”…
        </div>
      )}

      {!loading && source === 'fallback' && (
        <div
          data-testid="fallback-badge"
          className="mb-4 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm"
        >
          ⚡ Showing a curated offline set for “{activeTheme}” — the live word service is unavailable right now.
        </div>
      )}

      {!loading && source === 'empty' && (
        <div
          data-testid="themed-empty"
          className="mb-4 px-4 py-6 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300"
        >
          <p className="mb-2">We couldn’t reach the word service and there’s no offline set for “{activeTheme}” yet.</p>
          <p className="text-sm">Try one of the popular themes above — each has a curated set that always works.</p>
        </div>
      )}

      {/* Grouped results */}
      {!loading && hasResults && (
        <div className="space-y-6" data-testid="themed-results">
          {grouped.map((group) => (
            <div key={group.pos} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <h3 className={`text-lg font-semibold mb-3 ${group.accent}`}>
                {group.name}
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                  {group.items.length}
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {group.items.map((w) => (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => copyWord(w.word)}
                    data-testid="themed-word"
                    title={`Copy “${w.word}”`}
                    className="group flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                  >
                    <span className="text-sm text-gray-900 dark:text-white truncate">{w.word}</span>
                    <span className="ml-2 text-xs text-gray-400 group-hover:text-indigo-500 flex-shrink-0">
                      {copied === w.word ? '✓' : '📋'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/*
            RESULT-GATED KIT SHELL (deferred — needs a Kit form id).
            This block is intentionally result-gated: it sits inside the hasResults
            branch so an email-capture form only appears once the reader has words.
            When Bryan supplies the Kit form id, replace this comment with the
            embed (e.g. a script/iframe or a KitForm component keyed to that id).
          */}
        </div>
      )}

      {/* Intro help when nothing has been searched yet */}
      {!loading && !source && (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          Pick a preset or type a theme to begin. Click any word to copy it.
        </div>
      )}
    </div>
  );
};

export default ThemedWordGenerator;
