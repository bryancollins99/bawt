import React, { useMemo, useState } from 'react';
import {
  CORES,
  getCore,
  branchWords,
  coreWords,
  totalWordCount,
  ringSegmentPath,
  wedgePath,
  polarToXY,
  lighten,
} from '../utils/emotionWheelUtils';

const SIZE = 320;
const C = SIZE / 2; // centre

function segmentTextColor() {
  return '#ffffff';
}

const EmotionWheel = () => {
  const [coreName, setCoreName] = useState(null);
  const [secondaryName, setSecondaryName] = useState(null);
  const [tertiaryName, setTertiaryName] = useState(null);
  const [copied, setCopied] = useState('');

  const core = useMemo(() => getCore(coreName), [coreName]);
  const total = useMemo(() => totalWordCount(), []);

  const words = useMemo(
    () => (core ? branchWords(core, secondaryName) : []),
    [core, secondaryName],
  );

  const selectCore = (name) => {
    setCoreName(name);
    setSecondaryName(null);
    setTertiaryName(null);
    setCopied('');
  };

  const reset = () => {
    setCoreName(null);
    setSecondaryName(null);
    setTertiaryName(null);
    setCopied('');
  };

  const selectSecondary = (name) => {
    setSecondaryName(name);
    setTertiaryName(null);
    setCopied('');
  };

  const selectTertiary = (secName, terName) => {
    setSecondaryName(secName);
    setTertiaryName(terName);
    setCopied('');
  };

  // Copy to clipboard. navigator.clipboard.writeText rejects (async) inside a
  // cross-origin embed without allow="clipboard-write", so we await it and fall
  // back to execCommand — only marking "copied" when a write actually succeeds.
  const copy = async (kind, value) => {
    const flag = (ok) => {
      setCopied(ok ? kind : `${kind}-fail`);
      setTimeout(() => setCopied(''), 1600);
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        flag(true);
        return;
      }
      throw new Error('no async clipboard');
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        flag(ok);
      } catch (__) {
        flag(false);
      }
    }
  };

  const pathParts = [coreName, secondaryName, tertiaryName].filter(Boolean);
  const pathString = pathParts.join(' › ');

  // ---- Overview wheel (6 cores) -----------------------------------------
  const renderOverview = () => {
    const n = CORES.length;
    const step = 360 / n;
    const rOuter = 150;
    return (
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[360px] mx-auto select-none"
        role="group"
        aria-label="Feelings wheel — pick a core emotion"
      >
        {CORES.map((c, i) => {
          const start = i * step;
          const end = start + step;
          const mid = start + step / 2;
          const label = polarToXY(C, C, rOuter * 0.62, mid);
          return (
            <g key={c.name} className="cursor-pointer" onClick={() => selectCore(c.name)}>
              <title>{`${c.name} — ${coreWords(c).length} feeling words`}</title>
              <path
                d={wedgePath(C, C, rOuter, start, end)}
                fill={c.color}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-opacity hover:opacity-80"
              />
              <text
                x={label.x}
                y={label.y}
                fill={segmentTextColor()}
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {c.name}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r="34" fill="#ffffff" className="dark:fill-gray-800" />
        <text
          x={C}
          y={C - 6}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          className="fill-gray-700 dark:fill-gray-200"
        >
          How do
        </text>
        <text
          x={C}
          y={C + 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          className="fill-gray-700 dark:fill-gray-200"
        >
          you feel?
        </text>
      </svg>
    );
  };

  // ---- Branch wheel (one core zoomed: core + secondary + tertiary rings) --
  const renderBranch = () => {
    const secs = core.secondary;
    const n = secs.length;
    const step = 360 / n;
    const rCore = 46;
    const rSecOuter = 96;
    const rTerOuter = 150;

    return (
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[360px] mx-auto select-none"
        role="group"
        aria-label={`${core.name} branch — pick a precise feeling`}
      >
        {secs.map((s, i) => {
          const start = i * step;
          const end = start + step;
          const midS = start + step / 2;
          const secLabel = polarToXY(C, C, (rCore + rSecOuter) / 2, midS);
          const secActive = secondaryName === s.name;
          return (
            <g key={s.name}>
              {/* secondary segment */}
              <g className="cursor-pointer" onClick={() => selectSecondary(s.name)}>
                <title>{`${s.name} (${s.tertiary.join(', ')})`}</title>
                <path
                  d={ringSegmentPath(C, C, rCore, rSecOuter, start, end)}
                  fill={lighten(core.color, secActive ? 0.05 : 0.25)}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-opacity hover:opacity-85"
                />
                <text
                  x={secLabel.x}
                  y={secLabel.y}
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {s.name}
                </text>
              </g>

              {/* tertiary segments */}
              {s.tertiary.map((t, j) => {
                const tStep = step / s.tertiary.length;
                const tStart = start + j * tStep;
                const tEnd = tStart + tStep;
                const tMid = tStart + tStep / 2;
                const tLabel = polarToXY(C, C, (rSecOuter + rTerOuter) / 2, tMid);
                const tActive = tertiaryName === t && secondaryName === s.name;
                return (
                  <g
                    key={t}
                    className="cursor-pointer"
                    onClick={() => selectTertiary(s.name, t)}
                  >
                    <title>{t}</title>
                    <path
                      d={ringSegmentPath(C, C, rSecOuter, rTerOuter, tStart, tEnd)}
                      fill={lighten(core.color, tActive ? 0.35 : 0.55)}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="transition-opacity hover:opacity-85"
                    />
                    <text
                      x={tLabel.x}
                      y={tLabel.y}
                      fill="#3f3f46"
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                    >
                      {t}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* centre core — click to go back */}
        <g className="cursor-pointer" onClick={reset}>
          <title>Back to all feelings</title>
          <circle cx={C} cy={C} r={rCore} fill={core.color} />
          <text
            x={C}
            y={C - 3}
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill="#ffffff"
            pointerEvents="none"
          >
            {core.name}
          </text>
          <text
            x={C}
            y={C + 13}
            textAnchor="middle"
            fontSize="8"
            fill="#ffffff"
            opacity="0.85"
            pointerEvents="none"
          >
            ← back
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto" data-tool="emotion-wheel">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Emotion &amp; Feelings Wheel
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Can&rsquo;t find the word for what you feel? Click a core emotion to open its
          branch, then drill down to the precise feeling.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Wheel */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          {core ? renderBranch() : renderOverview()}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {CORES.map((c) => (
              <button
                key={c.name}
                onClick={() => selectCore(c.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-transform ${
                  coreName === c.name ? 'text-white shadow scale-105' : 'text-white/95 hover:scale-105'
                }`}
                style={{ backgroundColor: c.color, opacity: coreName && coreName !== c.name ? 0.55 : 1 }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            6 core feelings · {total} words in the wheel
          </p>
        </div>

        {/* Panel */}
        <div
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 min-h-[18rem]"
          data-testid="emotion-panel"
        >
          {!core ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-3">🎡</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Pick a core emotion to begin
              </p>
              <p className="text-sm mt-1">
                Joy, Love, Surprise, Fear, Anger or Sadness — each opens into precise words.
              </p>
            </div>
          ) : (
            <div data-testid="emotion-branch">
              {/* breadcrumb path */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: core.color }}
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100" data-testid="emotion-path">
                  {pathString}
                </span>
                <button
                  onClick={reset}
                  className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* secondary chips */}
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                {core.name} breaks into
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {core.secondary.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => selectSecondary(s.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      secondaryName === s.name
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* tertiary words for the selected secondary */}
              {secondaryName && (
                <>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Precise words for “{secondaryName}”
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4" data-testid="tertiary-words">
                    {(core.secondary.find((s) => s.name === secondaryName)?.tertiary || []).map((t) => (
                      <button
                        key={t}
                        onClick={() => selectTertiary(secondaryName, t)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          tertiaryName === t ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                        }`}
                        style={{ backgroundColor: lighten(core.color, 0.55), color: '#3f3f46' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* rich related-words list + copy */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {secondaryName ? `Related to ${secondaryName}` : `All ${core.name} words`}
                    <span className="ml-1 font-normal normal-case">({words.length})</span>
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copy('words', words.join(', '))}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      {copied === 'words' ? '✓ Copied' : copied === 'words-fail' ? '⚠ Press ⌘/Ctrl+C' : '📋 Copy words'}
                    </button>
                    {pathString && (
                      <button
                        onClick={() => copy('path', pathString)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {copied === 'path' ? '✓ Copied' : copied === 'path-fail' ? '⚠ Copy failed' : 'Copy path'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5" data-testid="related-words">
                  {words.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
        Based on Parrott&rsquo;s (2001) three-tier emotion classification. No feeling words are invented.
      </p>
    </div>
  );
};

export default EmotionWheel;
