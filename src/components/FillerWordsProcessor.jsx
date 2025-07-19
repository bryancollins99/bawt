import React, { useState } from 'react';

const FillerWordsProcessor = () => {
  const [inputText, setInputText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [fillerWordsFound, setFillerWordsFound] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('common');
  const [generatedFillers, setGeneratedFillers] = useState([]);

  const fillerWordCategories = {
    common: {
      name: 'Common Filler Words',
      icon: '💬',
      words: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'totally', 'really', 'very', 'quite', 'sort of', 'kind of', 'I mean', 'you see', 'well', 'so', 'right', 'okay', 'alright']
    },
    academic: {
      name: 'Academic Writing Fillers',
      icon: '📚',
      words: ['basically', 'essentially', 'fundamentally', 'obviously', 'clearly', 'evidently', 'apparently', 'presumably', 'arguably', 'undoubtedly', 'certainly', 'definitely', 'absolutely', 'completely', 'totally', 'entirely', 'quite', 'rather', 'somewhat', 'relatively']
    },
    business: {
      name: 'Business Writing Fillers',
      icon: '💼',
      words: ['leverage', 'utilize', 'facilitate', 'implement', 'optimize', 'streamline', 'synergize', 'ideate', 'incentivize', 'monetize', 'at the end of the day', 'moving forward', 'going forward', 'touch base', 'circle back', 'dive deep', 'drill down', 'take offline', 'best practice', 'low-hanging fruit']
    },
    hedging: {
      name: 'Hedging Words',
      icon: '🤔',
      words: ['maybe', 'perhaps', 'possibly', 'probably', 'might', 'could', 'would', 'should', 'seems', 'appears', 'tends to', 'somewhat', 'rather', 'fairly', 'pretty', 'quite', 'sort of', 'kind of', 'more or less', 'to some extent']
    },
    redundant: {
      name: 'Redundant Phrases',
      icon: '🔄',
      words: ['in order to', 'due to the fact that', 'despite the fact that', 'with regard to', 'in relation to', 'for the purpose of', 'at this point in time', 'in the event that', 'in the process of', 'it is important to note that', 'it should be noted that', 'needless to say', 'without a doubt', 'the fact of the matter is', 'when all is said and done']
    },
    intensifiers: {
      name: 'Overused Intensifiers',
      icon: '📈',
      words: ['very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'entirely', 'utterly', 'perfectly', 'highly', 'tremendously', 'exceptionally', 'remarkably', 'extraordinarily', 'amazingly', 'astonishingly', 'surprisingly', 'incredibly', 'unbelievably']
    }
  };

  // Generate filler words list
  const generateFillerWords = () => {
    const category = fillerWordCategories[selectedCategory];
    setGeneratedFillers([...category.words]);
  };

  // Process text to find and highlight filler words
  const analyzeText = () => {
    if (!inputText.trim()) {
      setHighlightedText('');
      setFillerWordsFound([]);
      return;
    }

    // Combine all filler words for analysis
    const allFillers = Object.values(fillerWordCategories)
      .flatMap(category => category.words)
      .sort((a, b) => b.length - a.length); // Sort by length to match longer phrases first

    const foundFillers = {};
    let highlighted = inputText;

    // Find and highlight filler words
    allFillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = inputText.match(regex);
      
      if (matches) {
        foundFillers[filler] = matches.length;
        highlighted = highlighted.replace(regex, `<mark class="bg-red-200 dark:bg-red-800 px-1 rounded">${filler}</mark>`);
      }
    });

    setFillerWordsFound(Object.entries(foundFillers).map(([word, count]) => ({ word, count })));
    setHighlightedText(highlighted);
  };

  // Remove filler words from text
  const removeFillerWords = () => {
    if (!inputText.trim()) {
      setProcessedText('');
      return;
    }

    // Combine all filler words for removal
    const allFillers = Object.values(fillerWordCategories)
      .flatMap(category => category.words)
      .sort((a, b) => b.length - a.length);

    let cleaned = inputText;

    // Remove filler words
    allFillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    // Clean up extra spaces and punctuation
    cleaned = cleaned
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\s+([.,!?;:])/g, '$1') // Remove space before punctuation
      .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1$2') // Remove duplicate punctuation
      .trim();

    setProcessedText(cleaned);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🧹 Filler Words Generator & Remover
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Identify, analyze, and remove filler words to make your writing more concise and impactful
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Text Analysis & Processing
        </h3>

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your text to analyze:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here to identify and remove filler words..."
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={analyzeText}
            disabled={!inputText.trim()}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#d60000' }}
          >
            🔍 Analyze & Highlight Fillers
          </button>
          <button
            onClick={removeFillerWords}
            disabled={!inputText.trim()}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#d60000' }}
          >
            🧹 Remove Filler Words
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Highlighted Text */}
        {highlightedText && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              🔍 Text with Highlighted Fillers
            </h3>
            <div 
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-yellow-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
            {fillerWordsFound.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filler Words Found ({fillerWordsFound.reduce((total, item) => total + item.count, 0)} total):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fillerWordsFound.map((item, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm"
                    >
                      "{item.word}" ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cleaned Text */}
        {processedText && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              ✨ Cleaned Text
            </h3>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-800 dark:text-white leading-relaxed">
                {processedText}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(processedText)}
              className="mt-3 px-4 py-2 text-white rounded-lg hover:opacity-80 transition-colors"
              style={{ backgroundColor: '#d60000' }}
            >
              📋 Copy Cleaned Text
            </button>
          </div>
        )}
      </div>

      {/* Filler Words Generator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          📝 Filler Words Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filler Word Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(fillerWordCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                  style={selectedCategory === key ? { backgroundColor: '#d60000' } : {}}
                >
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline text-xs">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateFillerWords}
              className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#d60000' }}
            >
              Generate Filler Words List
            </button>
          </div>
        </div>

        {/* Generated Filler Words */}
        {generatedFillers.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
              {fillerWordCategories[selectedCategory].icon} {fillerWordCategories[selectedCategory].name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {generatedFillers.map((filler, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-white text-sm">
                    "{filler}"
                  </span>
                  <button
                    onClick={() => copyToClipboard(filler)}
                    className="text-xs px-2 py-1 text-white rounded hover:opacity-80 transition-colors ml-2"
                    style={{ backgroundColor: '#d60000' }}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
          💡 Tips for Eliminating Filler Words:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300 text-sm">
          <div className="space-y-2">
            <p>• <strong>Read aloud:</strong> Hear your writing to catch unnecessary words</p>
            <p>• <strong>Be specific:</strong> Replace vague words with concrete details</p>
            <p>• <strong>Cut redundancy:</strong> Remove phrases that repeat the same idea</p>
          </div>
          <div className="space-y-2">
            <p>• <strong>Use strong verbs:</strong> Replace weak verb + adverb combinations</p>
            <p>• <strong>Trust your reader:</strong> Eliminate obvious hedge words</p>
            <p>• <strong>Edit ruthlessly:</strong> Every word should serve a purpose</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillerWordsProcessor; 