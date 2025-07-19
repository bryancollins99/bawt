import React, { useState } from 'react';

const ActionGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('physical');
  const [selectedIntensity, setSelectedIntensity] = useState('moderate');
  const [generatedActions, setGeneratedActions] = useState([]);
  const [generatedSentences, setGeneratedSentences] = useState([]);

  const actionCategories = {
    physical: {
      name: 'Physical Actions',
      icon: '🏃',
      mild: ['walk', 'touch', 'hold', 'reach', 'bend', 'lean', 'step', 'sit', 'stand', 'lift'],
      moderate: ['run', 'jump', 'climb', 'throw', 'catch', 'push', 'pull', 'twist', 'spin', 'dive'],
      intense: ['sprint', 'plunge', 'hurtle', 'catapult', 'smash', 'slam', 'crash', 'explode', 'shatter', 'thunder']
    },
    mental: {
      name: 'Mental Actions',
      icon: '🧠',
      mild: ['think', 'consider', 'ponder', 'wonder', 'notice', 'observe', 'recall', 'remember', 'understand', 'realize'],
      moderate: ['analyze', 'calculate', 'determine', 'conclude', 'deduce', 'investigate', 'examine', 'study', 'focus', 'concentrate'],
      intense: ['obsess', 'scrutinize', 'dissect', 'devour', 'consume', 'absorb', 'penetrate', 'unravel', 'decode', 'mastermind']
    },
    emotional: {
      name: 'Emotional Actions',
      icon: '💝',
      mild: ['feel', 'sense', 'experience', 'appreciate', 'enjoy', 'like', 'prefer', 'care', 'hope', 'wish'],
      moderate: ['love', 'adore', 'cherish', 'treasure', 'desire', 'crave', 'yearn', 'miss', 'worry', 'fear'],
      intense: ['worship', 'idolize', 'obsess', 'despise', 'loathe', 'rage', 'seethe', 'devastate', 'shatter', 'consume']
    },
    creative: {
      name: 'Creative Actions',
      icon: '🎨',
      mild: ['create', 'make', 'build', 'form', 'shape', 'design', 'plan', 'sketch', 'write', 'compose'],
      moderate: ['craft', 'construct', 'forge', 'sculpt', 'weave', 'orchestrate', 'choreograph', 'engineer', 'architect', 'innovate'],
      intense: ['revolutionize', 'transform', 'reinvent', 'pioneer', 'breakthrough', 'transcend', 'metamorphose', 'transmute', 'resurrect', 'birth']
    },
    communication: {
      name: 'Communication Actions',
      icon: '💬',
      mild: ['say', 'tell', 'speak', 'talk', 'mention', 'share', 'explain', 'describe', 'express', 'communicate'],
      moderate: ['declare', 'announce', 'proclaim', 'assert', 'argue', 'debate', 'persuade', 'convince', 'negotiate', 'discuss'],
      intense: ['roar', 'bellow', 'thunder', 'command', 'demand', 'crusade', 'evangelize', 'mesmerize', 'captivate', 'entrance']
    },
    conflict: {
      name: 'Conflict Actions',
      icon: '⚔️',
      mild: ['disagree', 'question', 'doubt', 'challenge', 'oppose', 'resist', 'compete', 'contest', 'dispute', 'object'],
      moderate: ['fight', 'battle', 'struggle', 'confront', 'clash', 'combat', 'attack', 'defend', 'counter', 'retaliate'],
      intense: ['wage war', 'annihilate', 'devastate', 'obliterate', 'demolish', 'destroy', 'vanquish', 'conquer', 'dominate', 'overpower']
    }
  };

  const sentenceTemplates = {
    physical: [
      "The athlete {action} across the finish line with determination.",
      "She {action} through the crowded marketplace.",
      "The dancer {action} gracefully across the stage.",
      "He {action} over the obstacle with ease.",
      "The child {action} excitedly toward the playground."
    ],
    mental: [
      "The detective {action} the evidence carefully.",
      "She {action} the complex problem for hours.",
      "The scientist {action} the data thoroughly.",
      "He {action} the implications of his decision.",
      "The student {action} the difficult concept."
    ],
    emotional: [
      "She {action} the memory of their first meeting.",
      "The audience {action} the performer's passionate delivery.",
      "He {action} the loss of his childhood home.",
      "The couple {action} their quiet moments together.",
      "The community {action} their shared traditions."
    ],
    creative: [
      "The artist {action} a masterpiece from raw materials.",
      "She {action} an innovative solution to the problem.",
      "The writer {action} compelling characters and plots.",
      "He {action} a new approach to the challenge.",
      "The team {action} a revolutionary product."
    ],
    communication: [
      "The speaker {action} her message with conviction.",
      "He {action} the crowd with his passionate speech.",
      "The teacher {action} complex ideas simply.",
      "She {action} her vision to the investors.",
      "The leader {action} change throughout the organization."
    ],
    conflict: [
      "The lawyer {action} the opposing counsel's arguments.",
      "She {action} against the unfair policy.",
      "The rebel {action} the oppressive regime.",
      "He {action} for his beliefs despite opposition.",
      "The team {action} their rivals in the championship."
    ]
  };

  const generateActions = () => {
    const category = actionCategories[selectedCategory];
    const actions = category[selectedIntensity];
    setGeneratedActions([...actions]);
  };

  const generateSentences = () => {
    const category = actionCategories[selectedCategory];
    const actions = category[selectedIntensity];
    const templates = sentenceTemplates[selectedCategory];
    
    const sentences = templates.slice(0, 5).map(template => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      return template.replace('{action}', randomAction);
    });
    
    setGeneratedSentences(sentences);
  };

  const generateBoth = () => {
    generateActions();
    generateSentences();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          ⚡ Action Word & Sentence Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Generate powerful action words and dynamic sentences to energize your writing
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Action Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Action Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(actionCategories).map(([key, category]) => (
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
                    <span className="hidden sm:inline">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Action Intensity
            </label>
            <div className="space-y-2">
              {['mild', 'moderate', 'intense'].map((intensity) => (
                <label key={intensity} className="flex items-center">
                  <input
                    type="radio"
                    name="intensity"
                    value={intensity}
                    checked={selectedIntensity === intensity}
                    onChange={(e) => setSelectedIntensity(e.target.value)}
                    className="mr-3 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {intensity} {intensity === 'mild' && '😌'} {intensity === 'moderate' && '🔥'} {intensity === 'intense' && '💥'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={generateActions}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Action Words
          </button>
          <button
            onClick={generateSentences}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Sentences
          </button>
          <button
            onClick={generateBoth}
            className="py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Generate Both
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Words */}
        {generatedActions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {actionCategories[selectedCategory].icon} Action Words ({selectedIntensity})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {generatedActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-white font-medium">
                    {action}
                  </span>
                  <button
                    onClick={() => copyToClipboard(action)}
                    className="text-xs px-2 py-1 text-white rounded hover:opacity-80 transition-colors"
                    style={{ backgroundColor: '#d60000' }}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Sentences */}
        {generatedSentences.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📝 Action Sentences
            </h3>
            <div className="space-y-3">
              {generatedSentences.map((sentence, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-800 dark:text-white leading-relaxed flex-1">
                      {sentence}
                    </p>
                    <button
                      onClick={() => copyToClipboard(sentence)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-80 transition-colors whitespace-nowrap"
                      style={{ backgroundColor: '#d60000' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      {(generatedActions.length > 0 || generatedSentences.length > 0) && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
            💡 Writing Tips for Action Words:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300 text-sm">
            <div className="space-y-2">
              <p>• <strong>Replace weak verbs:</strong> Use "sprint" instead of "run quickly"</p>
              <p>• <strong>Show, don't tell:</strong> "She trembled" vs "She was scared"</p>
              <p>• <strong>Match intensity:</strong> Choose verbs that fit your scene's energy</p>
            </div>
            <div className="space-y-2">
              <p>• <strong>Avoid repetition:</strong> Use different actions for variety</p>
              <p>• <strong>Consider context:</strong> Formal vs casual writing styles</p>
              <p>• <strong>Create rhythm:</strong> Mix short and long action sequences</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Guide */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📚 Action Categories Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {Object.entries(actionCategories).map(([key, category]) => (
            <div key={key} className="space-y-1">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {category.icon} {category.name}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {key === 'physical' && 'Body movements and physical activities'}
                {key === 'mental' && 'Thinking, analyzing, and cognitive processes'}
                {key === 'emotional' && 'Feelings, reactions, and emotional states'}
                {key === 'creative' && 'Building, making, and innovative actions'}
                {key === 'communication' && 'Speaking, writing, and expressing ideas'}
                {key === 'conflict' && 'Opposition, fighting, and confrontation'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionGenerator; 