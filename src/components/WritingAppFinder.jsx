import React, { useState } from 'react';
import data from '../data/appRecommendations.json';
import { getRecommendation, getMustHaveOptions } from '../utils/appFinderUtils';

const WritingAppFinder = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    category: null,
    budget: null,
    platform: null,
    mustHave: null,
  });

  // The 4 branching questions. Q4's options depend on the category chosen in Q1.
  const categoryOptions = Object.entries(data.categories).map(([value, meta]) => ({
    value,
    label: meta.label,
  }));

  const steps = [
    {
      key: 'category',
      title: 'What are you writing?',
      subtitle: 'This picks the right shortlist of tools for the job.',
      options: categoryOptions,
    },
    {
      key: 'budget',
      title: "What's your budget?",
      subtitle: 'We only surface free picks if you want them.',
      options: data.questions.budget,
    },
    {
      key: 'platform',
      title: 'Which platform do you use?',
      subtitle: 'We reorder your options to fit your devices.',
      options: data.questions.platform,
    },
    {
      key: 'mustHave',
      title: 'What matters most?',
      subtitle: 'The one feature that decides your recommended pick.',
      // Resolved dynamically below so it branches on the chosen category.
      options: null,
    },
  ];

  const currentStep = steps[step];
  const currentOptions =
    currentStep.key === 'mustHave'
      ? getMustHaveOptions(answers.category, data)
      : currentStep.options;

  const totalSteps = steps.length;
  const isComplete =
    answers.category && answers.budget && answers.platform && answers.mustHave;

  const handleSelect = (value) => {
    const key = currentStep.key;
    const next = { ...answers, [key]: value };
    // Changing the category invalidates a previously chosen must-have.
    if (key === 'category' && value !== answers.category) {
      next.mustHave = null;
    }
    setAnswers(next);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({ category: null, budget: null, platform: null, mustHave: null });
  };

  const AffiliateButton = ({ app, primary }) => {
    const isPlaceholder = app.affiliateUrl === 'PLACEHOLDER';
    const base =
      'inline-block px-5 py-2.5 rounded-lg font-semibold transition-colors text-center';
    if (isPlaceholder) {
      return (
        <span
          className={`${base} ${
            primary
              ? 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          } cursor-default`}
          title="Affiliate link coming soon"
        >
          Link coming soon
        </span>
      );
    }
    return (
      <a
        href={app.affiliateUrl}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className={`${base} ${
          primary
            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        Visit {app.name} →
      </a>
    );
  };

  // ---- Result view -------------------------------------------------------
  if (isComplete) {
    const result = getRecommendation(answers, data);

    if (!result) {
      return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Sorry — we couldn't match a recommendation. Please try again.
          </p>
          <button
            onClick={restart}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Start over
          </button>
        </div>
      );
    }

    const { recommended, alternatives, disclosure, sourcePage } = result;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Your recommended pick
          </p>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            {recommended.name}
          </h2>
        </div>

        {/* Disclosure — visible on every result, above the links (FTC / ASA). */}
        <div
          className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          role="note"
          aria-label="Affiliate disclosure"
        >
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Ad · </strong>
            {disclosure}
          </p>
        </div>

        {/* Recommended card */}
        <div className="mb-8 p-5 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {recommended.name}
            </h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {recommended.price}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{recommended.why}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {recommended.platforms.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {p}
              </span>
            ))}
          </div>
          <AffiliateButton app={recommended} primary />
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Also worth a look
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alternatives.map((app) => (
                <div
                  key={app.name}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 flex flex-col"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {app.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {app.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
                    {app.why}
                  </p>
                  <div>
                    <AffiliateButton app={app} primary={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={restart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full sm:w-auto"
          >
            Start over
          </button>
          {sourcePage && (
            <a
              href={sourcePage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
            >
              Read the full guide on Become a Writer Today →
            </a>
          )}
        </div>
      </div>
    );
  }

  // ---- Question view -----------------------------------------------------
  const answeredCount = [
    answers.category,
    answers.budget,
    answers.platform,
    answers.mustHave,
  ].filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Writing App Finder
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Answer four quick questions and get a writing app, note tool or keyboard
          matched to how you actually work.
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Question {step + 1} of {totalSteps} · {answeredCount} answered
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
          {currentStep.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {currentStep.subtitle}
        </p>

        <div className="space-y-3">
          {currentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentStep.key] === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={goBack}
          disabled={step === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            step === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-400 dark:text-gray-500 self-center">
          Tap an option to continue
        </span>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 <strong>Tip:</strong> Recommendations are curated from Become a Writer
          Today's app and keyboard guides. Some links are affiliate links —
          disclosure is shown on your result.
        </p>
      </div>
    </div>
  );
};

export default WritingAppFinder;
