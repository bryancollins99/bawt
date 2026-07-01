import React, { useMemo, useState } from 'react';
import { SHAPES, buildPoem } from '../utils/concreteShapes';

// A curated set of real, verifiable concrete / shape poems. Titles, poets and
// notes are factual — no invented attributions.
const GALLERY = [
  {
    title: 'Easter Wings',
    poet: 'George Herbert (1633)',
    note: 'Two stanzas printed sideways so the lines taper and swell into a pair of angel wings.',
  },
  {
    title: 'The Altar',
    poet: 'George Herbert (1633)',
    note: 'Lines of varying length build the outline of a stone altar on the page.',
  },
  {
    title: 'The Mouse\'s Tale',
    poet: 'Lewis Carroll (1865)',
    note: "In Alice's Adventures in Wonderland the verse curls down the page in the shape of a mouse's long tail.",
  },
  {
    title: 'Calligrammes',
    poet: 'Guillaume Apollinaire (1918)',
    note: 'Poems whose words are arranged as pictures — the Eiffel Tower, falling rain, a dove.',
  },
  {
    title: 'Swan and Shadow',
    poet: 'John Hollander (1969)',
    note: 'From Types of Shape — the lines form a swan above the water with its own reflection mirrored below.',
  },
  {
    title: 'l(a',
    poet: 'E. E. Cummings (1958)',
    note: 'A single falling leaf rendered as one thin vertical column of letters ("a leaf falls / loneliness").',
  },
];

const ConcretePoemMaker = () => {
  const [text, setText] = useState('write your poem here and watch it take shape');
  const [shapeKey, setShapeKey] = useState('heart');
  const [fontSize, setFontSize] = useState(14);
  const [fillMode, setFillMode] = useState('words');
  const [copied, setCopied] = useState(false);

  const { rows, plainText } = useMemo(
    () => buildPoem(text, shapeKey, fillMode),
    [text, shapeKey, fillMode]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard may be unavailable in some embed contexts — fail silently.
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const lines = plainText.split('\n');
    const cols = Math.max(...lines.map((l) => l.length), 1);
    const cellW = fontSize * 0.62; // monospace advance width
    const cellH = fontSize * 1.25; // line height
    const pad = fontSize;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(cols * cellW + pad * 2);
    canvas.height = Math.ceil(lines.length * cellH + pad * 2);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111827';
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = 'top';
    lines.forEach((line, r) => {
      for (let c = 0; c < line.length; c += 1) {
        const ch = line[c];
        if (ch !== ' ') {
          ctx.fillText(ch, pad + c * cellW, pad + r * cellH);
        }
      }
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `concrete-poem-${shapeKey}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔷 Concrete &amp; Shape Poem Maker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Type your words, pick a shape, and watch your text arrange itself into a
          picture. Then copy the poem or download it as an image.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Text input */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Type the words for your shape poem…"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your words are repeated to fill the whole silhouette, so any length works.
            Use <strong>Solid</strong> for the crispest shape or <strong>Keep words</strong> to
            keep your text readable.
          </p>
        </div>

        {/* Shape picker */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shape
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SHAPES).map(([key, shape]) => (
              <button
                key={key}
                type="button"
                onClick={() => setShapeKey(key)}
                aria-pressed={shapeKey === key}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  shapeKey === key
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <span>{shape.icon}</span>
                <span>{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size + fill mode */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text size: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fill
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFillMode('solid')}
                aria-pressed={fillMode === 'solid'}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  fillMode === 'solid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
                title="Pack every cell with a letter for the crispest shape"
              >
                Solid
              </button>
              <button
                type="button"
                onClick={() => setFillMode('words')}
                aria-pressed={fillMode === 'words'}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  fillMode === 'words'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
                title="Keep your spaces so the words stay readable"
              >
                Keep words
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {copied ? '✓ Copied!' : '📋 Copy poem'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
        >
          🖼️ Download as image
        </button>
      </div>

      {/* Rendered poem */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <pre
          data-shape={shapeKey}
          aria-label={`Your text arranged as a ${SHAPES[shapeKey]?.name || shapeKey}`}
          className="font-mono text-gray-900 dark:text-gray-100 leading-tight inline-block"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.25 }}
        >
          {rows.map((cells, r) => (
            <div key={r}>
              {cells.map((cell, c) => (
                <span
                  key={c}
                  className={cell.filled ? '' : 'opacity-0'}
                >
                  {cell.filled ? cell.char : ' '}
                </span>
              ))}
            </div>
          ))}
        </pre>
      </div>

      {/* How it works */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          What is a concrete poem?
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          A concrete (or shape) poem is one where the visual arrangement of the words
          on the page is part of the poem's meaning — the text is laid out to form a
          picture of what it describes. This maker flows your own words into a chosen
          silhouette so you can make one instantly, then tweak the words and size.
        </p>
      </div>

      {/* Gallery of famous concrete poems */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📜 Famous concrete &amp; shape poems
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GALLERY.map((poem) => (
            <div
              key={poem.title}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {poem.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {poem.poet}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{poem.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConcretePoemMaker;
