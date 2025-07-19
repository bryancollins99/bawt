import React, { useState } from 'react';
import { blendWords, getBlendSuggestions, famousBlends } from '../utils/blendUtils';

const BlendedWords = () => {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [blends, setBlends] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word1.trim() || !word2.trim()) return;

    setIsLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const blendResults = blendWords(word1.trim(), word2.trim());
      setBlends(blendResults);
      setIsLoading(false);
    }, 600);
  };

  const resetForm = () => {
    setWord1('');
    setWord2('');
    setBlends(null);
  };

  const handleExampleClick = (example) => {
    setWord1(example.word1);
    setWord2(example.word2);
  };

  const BlendResult = ({ blend, isRecommended = false }) => (
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isRecommended 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
      }`}
      onClick={() => navigator.clipboard?.writeText(blend.result)}
      title="Click to copy"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-lg font-bold ${
          isRecommended 
            ? 'text-green-800 dark:text-green-200' 
            : 'text-gray-800 dark:text-white'
        }`}>
          {blend.result}
          {isRecommended && (
            <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
              ⭐ BEST
            </span>
          )}
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          📋 Click to copy
        </span>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">{blend.word1}</span> + <span className="font-medium">{blend.word2}</span>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-500">
        Method: {blend.method} • Length: {blend.result.length} letters
      </div>
      
      {blend.definition && (
        <div className="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
          "Could mean: {blend.definition}"
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Blended Words Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create portmanteau words by blending two words together (like "brunch" = breakfast + lunch)
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Word */}
            <div>
              <label htmlFor="word1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Word
              </label>
              <input
                type="text"
                id="word1"
                value={word1}
                onChange={(e) => setWord1(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-lg"
                placeholder="breakfast"
                disabled={isLoading}
              />
            </div>

            {/* Second Word */}
            <div>
              <label htmlFor="word2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Second Word
              </label>
              <input
                type="text"
                id="word2"
                value={word2}
                onChange={(e) => setWord2(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-lg"
                placeholder="lunch"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!word1.trim() || !word2.trim() || isLoading}
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
                  Blending Words...
                </>
              ) : (
                '🔀 Create Blends'
              )}
            </button>

            {blends && (
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

      {/* Famous Examples */}
      {!blends && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            💡 Try These Famous Examples:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {famousBlends.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700
                         hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-left"
              >
                <div className="font-bold text-purple-800 dark:text-purple-300">
                  {example.result}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  {example.word1} + {example.word2}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {blends && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Blends for "{blends.word1}" + "{blends.word2}"
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generated {blends.variations.length} unique combinations
            </p>
          </div>

          {/* Best Recommendation */}
          {blends.recommended && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                🏆 Top Recommendation
              </h3>
              <BlendResult blend={blends.recommended} isRecommended={true} />
            </div>
          )}

          {/* All Variations */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              🔀 All Variations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blends.variations.map((blend, index) => (
                <BlendResult key={index} blend={blend} />
              ))}
            </div>
          </div>

          {/* Tips and Usage */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
              ✨ Creative Writing Tips
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
              <li>• Click any blend to copy it to your clipboard</li>
              <li>• Look for blends that maintain recognizable parts of both original words</li>
              <li>• Consider pronunciation - the best blends flow naturally when spoken</li>
              <li>• Shorter blends are often more memorable and easier to use</li>
              <li>• Use blended words to create brand names, character names, or creative terms</li>
              <li>• Try different word orders - "breakfast + lunch" vs "lunch + breakfast"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlendedWords; 