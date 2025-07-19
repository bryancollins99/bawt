import { useState, useMemo } from 'react';

const GrammarlyComparisonMatrix = () => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 50]);
  const [userType, setUserType] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showDetails, setShowDetails] = useState({});

  // Comprehensive tool data
  const tools = [
    {
      id: 'grammarly',
      name: 'Grammarly Pro',
      logo: '📝',
      price: 12,
      originalPrice: 29.95,
      discount: 30,
      rating: 4.6,
      userTypes: ['student', 'professional', 'author', 'business'],
      features: {
        grammarCheck: 5,
        spellCheck: 5,
        punctuation: 5,
        styleCheck: 5,
        toneDetection: 5,
        plagiarismCheck: 5,
        aiWriting: 4,
        citations: 4,
        teamFeatures: 3,
        customDictionary: 4,
        offlineMode: 1,
        languageSupport: 2
      },
      pros: [
        'Most accurate grammar detection',
        'Excellent user interface',
        'Real-time suggestions',
        'Strong plagiarism checker',
        'Great browser integration'
      ],
      cons: [
        'Expensive monthly cost',
        'English only',
        'Requires internet connection',
        'Can be overly aggressive'
      ],
      bestFor: 'Professional writers who need comprehensive grammar checking',
      platforms: ['Web', 'Desktop', 'Mobile', 'Browser Extension'],
      freeVersion: true
    },
    {
      id: 'prowritingaid',
      name: 'ProWritingAid',
      logo: '✏️',
      price: 10,
      originalPrice: 20,
      discount: 50,
      rating: 4.2,
      userTypes: ['author', 'student', 'professional'],
      features: {
        grammarCheck: 4,
        spellCheck: 4,
        punctuation: 4,
        styleCheck: 5,
        toneDetection: 3,
        plagiarismCheck: 4,
        aiWriting: 2,
        citations: 2,
        teamFeatures: 2,
        customDictionary: 4,
        offlineMode: 3,
        languageSupport: 2
      },
      pros: [
        'Detailed writing reports',
        'Great for fiction writers',
        'Affordable pricing',
        'Integrates with Scrivener',
        'Strong style analysis'
      ],
      cons: [
        'Slower than Grammarly',
        'Complex interface',
        'Limited real-time checking',
        'Weaker grammar detection'
      ],
      bestFor: 'Authors and creative writers who want detailed style analysis',
      platforms: ['Web', 'Desktop', 'Browser Extension'],
      freeVersion: true
    },
    {
      id: 'hemingway',
      name: 'Hemingway Editor',
      logo: '🎯',
      price: 19.99,
      originalPrice: 19.99,
      discount: 0,
      rating: 4.0,
      userTypes: ['author', 'student', 'professional'],
      features: {
        grammarCheck: 2,
        spellCheck: 2,
        punctuation: 2,
        styleCheck: 5,
        toneDetection: 1,
        plagiarismCheck: 0,
        aiWriting: 0,
        citations: 0,
        teamFeatures: 0,
        customDictionary: 1,
        offlineMode: 5,
        languageSupport: 1
      },
      pros: [
        'Excellent readability analysis',
        'Simple, focused interface',
        'One-time purchase',
        'Works offline',
        'Great for simplifying writing'
      ],
      cons: [
        'No grammar checking',
        'Limited features',
        'No plagiarism detection',
        'English only'
      ],
      bestFor: 'Writers who want to simplify their writing style',
      platforms: ['Web', 'Desktop'],
      freeVersion: true
    },
    {
      id: 'ginger',
      name: 'Ginger Software',
      logo: '🔥',
      price: 13.99,
      originalPrice: 20.97,
      discount: 33,
      rating: 3.8,
      userTypes: ['student', 'professional'],
      features: {
        grammarCheck: 4,
        spellCheck: 4,
        punctuation: 4,
        styleCheck: 3,
        toneDetection: 2,
        plagiarismCheck: 2,
        aiWriting: 3,
        citations: 1,
        teamFeatures: 1,
        customDictionary: 3,
        offlineMode: 2,
        languageSupport: 4
      },
      pros: [
        'Multiple language support',
        'Translation features',
        'Sentence rephrasing',
        'Text reader',
        'Mobile keyboard'
      ],
      cons: [
        'Less accurate than Grammarly',
        'Clunky interface',
        'Limited plagiarism checking',
        'Expensive for features offered'
      ],
      bestFor: 'Multi-language users who need translation features',
      platforms: ['Web', 'Desktop', 'Mobile'],
      freeVersion: true
    },
    {
      id: 'languagetool',
      name: 'LanguageTool',
      logo: '🌐',
      price: 4.92,
      originalPrice: 4.92,
      discount: 0,
      rating: 4.1,
      userTypes: ['student', 'professional', 'author'],
      features: {
        grammarCheck: 4,
        spellCheck: 4,
        punctuation: 4,
        styleCheck: 3,
        toneDetection: 2,
        plagiarismCheck: 0,
        aiWriting: 1,
        citations: 0,
        teamFeatures: 2,
        customDictionary: 3,
        offlineMode: 3,
        languageSupport: 5
      },
      pros: [
        'Supports 30+ languages',
        'Very affordable',
        'Open source version available',
        'Good grammar detection',
        'Privacy focused'
      ],
      cons: [
        'Basic interface',
        'No plagiarism checking',
        'Limited AI features',
        'Fewer integrations'
      ],
      bestFor: 'Multilingual writers on a budget',
      platforms: ['Web', 'Desktop', 'Browser Extension'],
      freeVersion: true
    },
    {
      id: 'whitesmoke',
      name: 'WhiteSmoke',
      logo: '💨',
      price: 8.33,
      originalPrice: 11.50,
      discount: 28,
      rating: 3.5,
      userTypes: ['student', 'professional'],
      features: {
        grammarCheck: 3,
        spellCheck: 3,
        punctuation: 3,
        styleCheck: 3,
        toneDetection: 2,
        plagiarismCheck: 3,
        aiWriting: 2,
        citations: 1,
        teamFeatures: 1,
        customDictionary: 2,
        offlineMode: 2,
        languageSupport: 3
      },
      pros: [
        'All-in-one writing solution',
        'Translation features',
        'Templates included',
        'Mobile app',
        'Plagiarism checker included'
      ],
      cons: [
        'Outdated interface',
        'Less accurate checking',
        'Limited browser support',
        'Expensive for quality'
      ],
      bestFor: 'Users who want templates and translation in one package',
      platforms: ['Web', 'Desktop', 'Mobile'],
      freeVersion: false
    }
  ];

  const features = [
    { id: 'grammarCheck', name: 'Grammar Checking', icon: '📖' },
    { id: 'spellCheck', name: 'Spell Checking', icon: '🔤' },
    { id: 'punctuation', name: 'Punctuation', icon: '❓' },
    { id: 'styleCheck', name: 'Style Checking', icon: '✨' },
    { id: 'toneDetection', name: 'Tone Detection', icon: '🎭' },
    { id: 'plagiarismCheck', name: 'Plagiarism Check', icon: '🔍' },
    { id: 'aiWriting', name: 'AI Writing Assistant', icon: '🤖' },
    { id: 'citations', name: 'Citation Generator', icon: '📚' },
    { id: 'teamFeatures', name: 'Team Features', icon: '👥' },
    { id: 'customDictionary', name: 'Custom Dictionary', icon: '📝' },
    { id: 'offlineMode', name: 'Offline Mode', icon: '📱' },
    { id: 'languageSupport', name: 'Multi-language', icon: '🌍' }
  ];

  const userTypeOptions = [
    { id: 'all', name: 'All Users', icon: '👤' },
    { id: 'student', name: 'Students', icon: '🎓' },
    { id: 'professional', name: 'Professionals', icon: '💼' },
    { id: 'author', name: 'Authors', icon: '✍️' },
    { id: 'business', name: 'Business Teams', icon: '🏢' }
  ];

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      // Budget filter
      if (tool.price < budgetRange[0] || tool.price > budgetRange[1]) return false;
      
      // User type filter
      if (userType !== 'all' && !tool.userTypes.includes(userType)) return false;
      
      // Feature filter
      if (selectedFeatures.length > 0) {
        const hasRequiredFeatures = selectedFeatures.every(featureId => 
          tool.features[featureId] >= 3 // Must have at least 3/5 rating
        );
        if (!hasRequiredFeatures) return false;
      }
      
      return true;
    });

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'features':
          const aFeatureCount = Object.values(a.features).filter(score => score >= 4).length;
          const bFeatureCount = Object.values(b.features).filter(score => score >= 4).length;
          return bFeatureCount - aFeatureCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [tools, budgetRange, userType, selectedFeatures, sortBy]);

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const toggleDetails = (toolId) => {
    setShowDetails(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  const getFeatureScore = (score) => {
    if (score === 0) return { color: 'text-gray-400', text: 'Not Available' };
    if (score <= 2) return { color: 'text-red-500', text: 'Poor' };
    if (score <= 3) return { color: 'text-yellow-500', text: 'Fair' };
    if (score <= 4) return { color: 'text-blue-500', text: 'Good' };
    return { color: 'text-green-500', text: 'Excellent' };
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔄 Interactive Writing Tools Comparison
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Compare Grammarly with top competitors. Filter by features, budget, and use case to find your perfect writing assistant.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">🎛️ Filter & Compare</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly Budget: ${budgetRange[0]} - ${budgetRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={budgetRange[1]}
              onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium mb-2">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              {userTypeOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.icon} {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="rating">⭐ Best Rated</option>
              <option value="price">💰 Lowest Price</option>
              <option value="features">🚀 Most Features</option>
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedFeatures([]);
                setBudgetRange([0, 50]);
                setUserType('all');
                setSortBy('rating');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>

        {/* Feature Filters */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Required Features:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {features.map(feature => (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`p-2 rounded-lg border-2 transition-all text-sm ${
                  selectedFeatures.includes(feature.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div>{feature.icon}</div>
                  <div className="text-xs mt-1">{feature.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <strong>{filteredTools.length}</strong> tools matching your criteria
          {selectedFeatures.length > 0 && (
            <span> with <strong>{selectedFeatures.length}</strong> required features</span>
          )}
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all ${
              tool.id === 'grammarly' 
                ? 'border-green-500 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{tool.logo}</span>
                <div>
                  <h3 className="font-bold text-lg">{tool.name}</h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(tool.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {tool.rating}
                    </span>
                  </div>
                </div>
              </div>
              {tool.id === 'grammarly' && (
                <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">
                  RECOMMENDED
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">
                  ${tool.price}/mo
                </span>
                {tool.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ${tool.originalPrice}
                    </span>
                    <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">
                      {tool.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {tool.freeVersion && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✅ Free version available
                </p>
              )}
            </div>

            {/* Best For */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Best for:</strong> {tool.bestFor}
              </p>
            </div>

            {/* Feature Scores */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedFeatures.length > 0 ? (
                  // Show only selected features if any are selected
                  selectedFeatures.map(featureId => {
                    const feature = features.find(f => f.id === featureId);
                    const score = tool.features[featureId];
                    const scoreInfo = getFeatureScore(score);
                    return (
                      <div key={featureId} className="flex justify-between">
                        <span>{feature.name}:</span>
                        <span className={scoreInfo.color}>
                          {'★'.repeat(score)}{'☆'.repeat(5-score)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  // Show top features
                  Object.entries(tool.features)
                    .filter(([_, score]) => score >= 4)
                    .slice(0, 4)
                    .map(([featureId, score]) => {
                      const feature = features.find(f => f.id === featureId);
                      return (
                        <div key={featureId} className="flex justify-between">
                          <span>{feature.name}:</span>
                          <span className="text-green-500">
                            {'★'.repeat(score)}{'☆'.repeat(5-score)}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Platforms */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Platforms:</strong> {tool.platforms.join(', ')}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => toggleDetails(tool.id)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {showDetails[tool.id] ? '📄 Hide Details' : '📋 Show Pros & Cons'}
              </button>
              
              <button className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                tool.id === 'grammarly'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {tool.discount > 0 ? `Get ${tool.discount}% Off` : 'Try Free'} →
              </button>
            </div>

            {/* Detailed Pros & Cons */}
            {showDetails[tool.id] && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Pros:</h5>
                    <ul className="text-xs space-y-1">
                      {tool.pros.map((pro, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Cons:</h5>
                    <ul className="text-xs space-y-1">
                      {tool.cons.map((con, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No tools match your criteria</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or budget range
          </p>
          <button
            onClick={() => {
              setSelectedFeatures([]);
              setBudgetRange([0, 50]);
              setUserType('all');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Summary Table */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">📊 Quick Comparison Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Tool</th>
                <th className="text-center p-2">Price</th>
                <th className="text-center p-2">Rating</th>
                <th className="text-center p-2">Grammar</th>
                <th className="text-center p-2">Plagiarism</th>
                <th className="text-center p-2">AI Writing</th>
                <th className="text-center p-2">Free Version</th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map(tool => (
                <tr key={tool.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-2 font-medium">{tool.logo} {tool.name}</td>
                  <td className="p-2 text-center">${tool.price}/mo</td>
                  <td className="p-2 text-center">{tool.rating}⭐</td>
                  <td className="p-2 text-center">
                    <span className={getFeatureScore(tool.features.grammarCheck).color}>
                      {'★'.repeat(tool.features.grammarCheck)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {tool.features.plagiarismCheck > 0 ? '✅' : '❌'}
                  </td>
                  <td className="p-2 text-center">
                    <span className={getFeatureScore(tool.features.aiWriting).color}>
                      {'★'.repeat(tool.features.aiWriting)}
                    </span>
                  </td>
                  <td className="p-2 text-center">{tool.freeVersion ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Ready to Choose Your Writing Assistant?</h3>
        <p className="mb-4">
          Based on our comprehensive comparison, Grammarly Pro offers the best balance of features, accuracy, and usability for most writers.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          Get 30% Off Grammarly Pro →
        </button>
      </div>
    </div>
  );
};

export default GrammarlyComparisonMatrix; 