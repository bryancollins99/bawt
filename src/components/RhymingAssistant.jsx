import React, { useState } from 'react';
import { findRhymes } from '../utils/rhymeUtils';

const RhymingAssistant = () => {
  const [word, setWord] = useState('');
  const [tone, setTone] = useState('poetic');
  const [rhymes, setRhymes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setIsLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const rhymeData = findRhymes(word.toLowerCase().trim(), tone);
      setRhymes(rhymeData);
      setIsLoading(false);
    }, 500);
  };

  const resetForm = () => {
    setWord('');
    setRhymes(null);
  };

  const RhymeSection = ({ title, words, description, emptyMessage }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      
      {words && words.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {words.map((rhymeWord, index) => (
            <div
              key={index}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                       rounded-lg px-3 py-2 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 
                       transition-colors cursor-pointer"
              onClick={() => navigator.clipboard?.writeText(rhymeWord)}
              title="Click to copy"
            >
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                {rhymeWord}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 italic">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Rhyming Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find perfect rhymes, slant rhymes, and funny alternatives for your creative writing
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Word Input */}
            <div className="md:col-span-2">
              <label htmlFor="word" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter a word
              </label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-lg"
                placeholder="cat, love, day..."
                disabled={isLoading}
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tone (Optional)
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="poetic">Poetic</option>
                <option value="rap">Rap</option>
                <option value="funny">Funny</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!word.trim() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                       text-white font-semibold py-3 px-6 rounded-lg transition-colors
                       disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Rhymes...
                </>
              ) : (
                'Find Rhymes'
              )}
            </button>

            {rhymes && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {rhymes && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Rhymes for "{rhymes.originalWord}"
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tone: <span className="capitalize font-medium">{tone}</span>
            </p>
          </div>

          <RhymeSection
            title="🎯 Perfect Rhymes"
            words={rhymes.perfect}
            description="Words that rhyme exactly with the same ending sound"
            emptyMessage="No perfect rhymes found for this word"
          />

          <RhymeSection
            title="📐 Slant Rhymes"
            words={rhymes.slant}
            description="Near-rhymes with similar but not identical sounds"
            emptyMessage="No slant rhymes found for this word"
          />

          <RhymeSection
            title="😄 Funny Rhymes"
            words={rhymes.funny}
            description="Creative, playful, or humorous rhyming alternatives"
            emptyMessage="No funny alternatives found for this word"
          />

          {/* Usage Tips */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
              💡 Usage Tips
            </h3>
            <ul className="text-green-700 dark:text-green-300 space-y-2 text-sm">
              <li>• Click any rhyme word to copy it to your clipboard</li>
              <li>• Perfect rhymes work best for traditional poetry and songs</li>
              <li>• Slant rhymes add sophistication and avoid forced rhyming</li>
              <li>• Funny rhymes are great for children's books and comedic writing</li>
              <li>• Different tones provide words suited to specific writing styles</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RhymingAssistant; 