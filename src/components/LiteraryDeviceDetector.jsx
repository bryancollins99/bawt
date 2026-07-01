import { useState } from 'react';
import { detectDevices, QUIZ_ONLY_DEVICES } from '../utils/deviceDetection';
import quizData from '../data/deviceQuiz.json';

const DEVICE_META = {
  alliteration: { label: 'Alliteration', icon: '🅰️', color: 'blue' },
  onomatopoeia: { label: 'Onomatopoeia', icon: '💥', color: 'purple' },
  repetition: { label: 'Repetition', icon: '🔁', color: 'green' },
  'internal-rhyme': { label: 'Internal Rhyme', icon: '🎵', color: 'pink' },
  simile: { label: 'Simile', icon: '⚖️', color: 'amber' },
};

const COLOR_CLASSES = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200',
  amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
};

const SAMPLE_TEXT =
  'Peter Piper picked a peck of pickled peppers.\nThe clock went tick tock through the night.\nNever, never, never give up on your dreams.';

// ------------------------------- Detector -----------------------------------
const Detector = () => {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);

  const analyse = (value) => {
    const input = value !== undefined ? value : text;
    if (!input.trim()) {
      setResults(null);
      return;
    }
    setResults(detectDevices(input));
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Paste a line, verse, or paragraph. The detector flags devices it can spot with
        offline text heuristics — no AI, no network. It is deliberately honest about its
        limits (see the note below).
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. She sells seashells by the seashore..."
        rows={5}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />

      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={() => analyse()}
          disabled={!text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          🔍 Detect Devices
        </button>
        <button
          onClick={() => {
            setText(SAMPLE_TEXT);
            analyse(SAMPLE_TEXT);
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Try a sample
        </button>
        <button
          onClick={() => {
            setText('');
            setResults(null);
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>

      {results && results.length === 0 && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          No detectable devices found in this text. That doesn't mean there are none —
          many devices (metaphor, assonance, and others below) can't be spotted by text
          patterns alone. Try the Quiz to practise those.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Found {results.length} device type{results.length > 1 ? 's' : ''}:
          </h3>
          {results.map((r) => {
            const meta = DEVICE_META[r.device] || { label: r.device, icon: '•', color: 'blue' };
            return (
              <div
                key={r.device}
                className={`p-4 rounded-lg border ${COLOR_CLASSES[meta.color]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{meta.icon}</span>
                  <span className="font-bold">{meta.label}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {r.matches.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-white/70 dark:bg-black/30 text-sm font-mono"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{r.explanation}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
          ⚠️ What this detector can't catch
        </h4>
        <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
          It only flags devices detectable from text patterns:{' '}
          <strong>alliteration, onomatopoeia, repetition, internal rhyme, and the simile marker</strong>.
          Devices that depend on <em>sound</em> ({' '}
          {QUIZ_ONLY_DEVICES.slice(0, 2).join(', ')}) or on <em>meaning and structure</em> ({' '}
          {QUIZ_ONLY_DEVICES.slice(2).join(', ')}) can't be reliably detected offline — a
          letter-based guess would mislabel them. Test yourself on those in the Quiz tab.
        </p>
      </div>
    </div>
  );
};

// --------------------------------- Quiz -------------------------------------
const Quiz = () => {
  const questions = quizData.questions;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const start = () => {
    setStarted(true);
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  const choose = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === current.device) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (!started) {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Name That Literary Device
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
          {questions.length} questions spanning alliteration, assonance, consonance,
          metaphor, allegory, farce, the tragic hero, the ballad and more. Read the
          example, pick the device.
        </p>
        <button
          onClick={start}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          Start Quiz →
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Quiz complete!
        </h3>
        <p className="text-5xl font-bold my-4 text-blue-600 dark:text-blue-400">
          {score}/{questions.length}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You scored {pct}%.{' '}
          {pct >= 80 ? 'Excellent ear for craft!' : pct >= 50 ? 'Solid — keep practising.' : 'Review the examples and try again.'}
        </p>
        <button
          onClick={start}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔁 Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {index + 1} of {questions.length}
        </span>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Score: {score}
        </span>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20
                      rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
        <p className="text-lg text-gray-800 dark:text-gray-100 italic text-center">
          {current.example}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((option) => {
          let cls =
            'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400';
          if (answered) {
            if (option === current.device) {
              cls = 'border-green-500 bg-green-50 dark:bg-green-900/30';
            } else if (option === selected) {
              cls = 'border-red-500 bg-red-50 dark:bg-red-900/30';
            } else {
              cls = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-60';
            }
          }
          return (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={answered}
              className={`p-4 rounded-lg border-2 text-left font-medium text-gray-800 dark:text-gray-100 transition-all ${cls}`}
            >
              {answered && option === current.device && '✅ '}
              {answered && option === selected && option !== current.device && '❌ '}
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong>{current.device}.</strong> {current.explanation}
          </p>
          <button
            onClick={next}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {index + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
};

// ------------------------------- Container ----------------------------------
const LiteraryDeviceDetector = () => {
  const [tab, setTab] = useState('detector');

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔎 Literary Device Detector &amp; Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Check your own writing for literary devices, then test yourself on the ones no
          detector can catch. Companion to{' '}
          <a
            href="https://becomeawritertoday.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Become a Writer Today
          </a>
          .
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'detector', label: '🔍 Detector' },
          { id: 'quiz', label: '🎯 Quiz' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'detector' ? <Detector /> : <Quiz />}
    </div>
  );
};

export default LiteraryDeviceDetector;
