import React, { useState } from 'react';

const StrongFemaleCharacterGenerator = () => {
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [characterName, setCharacterName] = useState('');
  const [characterAge, setCharacterAge] = useState('');
  const [characterProfession, setCharacterProfession] = useState('');
  const [characterBackground, setCharacterBackground] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Adjectives organized by categories from the BecomeAWriterToday article
  const adjectiveCategories = {
    "Personality & Attitude": {
      traits: ["Bubbly", "Feisty", "Sassy", "Dignified", "Confident", "Optimistic", "Poised", "Self-assured", "Positive", "Assertive", "Bold", "Level-headed", "Collected", "Cool", "Noble", "Distinguished", "Proud", "Hopeful", "Uplifting", "Encouraging", "Strong-willed"],
      color: "bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300"
    },
    "Intelligence & Skills": {
      traits: ["Intelligent", "Smart", "Brilliant", "Sharp", "Intuitive", "Alert", "Skillful", "Talented", "Capable", "Knowledgeable", "Wise", "Competent", "Efficient", "Accomplished", "Experienced", "Adept", "Proficient", "Masterly", "Gifted", "Polished", "Clever", "Savvy"],
      color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
    },
    "Resilience & Strength": {
      traits: ["Tenacious", "Open-minded", "Resilient", "Composed", "Unshaken", "Unfazed", "Unruffled", "Self-reliant", "Decisive"],
      color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
    },
    "Leadership & Presence": {
      traits: ["Matriarch", "Graceful", "Wonderful", "Radiant", "Inspiring", "Striking", "Comforting", "Bright", "Magnificent"],
      color: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300"
    }
  };

  const professionSuggestions = [
    "Detective", "Lawyer", "Doctor", "Artist", "CEO", "Teacher", "Scientist", "Journalist", 
    "Engineer", "Politician", "Chef", "Architect", "Author", "Entrepreneur", "Judge", 
    "Military Officer", "Social Worker", "Therapist", "Pilot", "Photographer"
  ];

  const backgroundSuggestions = [
    "Grew up in a small town with big dreams",
    "Overcame significant personal challenges",
    "First in her family to attend university",
    "Comes from a family of strong women",
    "Former athlete turned professional",
    "Self-made success story",
    "Immigrant who built a new life",
    "Lost everything and rebuilt from scratch",
    "Mentored by an inspiring role model",
    "Breaking barriers in a male-dominated field"
  ];

  const handleTraitToggle = (trait) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const generateRandomTraits = () => {
    const allTraits = Object.values(adjectiveCategories).flatMap(cat => cat.traits);
    const randomTraits = [];
    
    // Select 2-4 random traits from different categories
    const numTraits = Math.floor(Math.random() * 3) + 2;
    
    while (randomTraits.length < numTraits) {
      const randomTrait = allTraits[Math.floor(Math.random() * allTraits.length)];
      if (!randomTraits.includes(randomTrait)) {
        randomTraits.push(randomTrait);
      }
    }
    
    setSelectedTraits(randomTraits);
  };

  const generateDescription = () => {
    if (selectedTraits.length === 0 || !characterName) {
      alert('Please add a character name and select at least one trait!');
      return;
    }

    const traitDescriptions = {
      "Bubbly": "radiates infectious energy",
      "Feisty": "stands her ground with fierce determination",
      "Sassy": "delivers wit with confidence",
      "Dignified": "carries herself with unwavering grace",
      "Confident": "moves through the world with self-assurance",
      "Optimistic": "sees possibilities where others see obstacles",
      "Poised": "maintains composure under pressure",
      "Self-assured": "trusts in her own worth and abilities",
      "Assertive": "speaks her mind without hesitation",
      "Bold": "takes risks others wouldn't dare",
      "Level-headed": "thinks clearly in chaotic situations",
      "Resilient": "bounces back stronger from every setback",
      "Tenacious": "never gives up on what matters to her",
      "Intelligent": "sees patterns and solutions others miss",
      "Brilliant": "illuminates every room with her insights",
      "Sharp": "cuts through complexity with precision",
      "Intuitive": "reads between the lines effortlessly",
      "Talented": "excels at everything she touches",
      "Wise": "offers counsel that comes from deep understanding",
      "Accomplished": "has achieved what others only dream of",
      "Experienced": "draws from a wealth of life lessons",
      "Gifted": "possesses natural abilities that inspire awe",
      "Savvy": "navigates complex situations with ease",
      "Graceful": "moves with elegant purpose",
      "Inspiring": "motivates others simply by being herself",
      "Striking": "commands attention without trying",
      "Magnificent": "embodies excellence in everything she does"
    };

    // Create character description
    let description = `${characterName}`;
    if (characterAge) description += `, ${characterAge},`;
    description += ` is a remarkable woman who`;

    // Add trait descriptions
    const selectedDescriptions = selectedTraits.map(trait => 
      traitDescriptions[trait] || `embodies ${trait.toLowerCase()} qualities`
    );

    if (selectedDescriptions.length === 1) {
      description += ` ${selectedDescriptions[0]}.`;
    } else if (selectedDescriptions.length === 2) {
      description += ` ${selectedDescriptions[0]} and ${selectedDescriptions[1]}.`;
    } else {
      const lastTrait = selectedDescriptions.pop();
      description += ` ${selectedDescriptions.join(', ')}, and ${lastTrait}.`;
    }

    // Add profession if provided
    if (characterProfession) {
      description += ` As a ${characterProfession.toLowerCase()}, she brings her ${selectedTraits.slice(0, 2).join(' and ').toLowerCase()} nature to everything she does.`;
    }

    // Add background if provided
    if (characterBackground) {
      description += ` ${characterBackground}, which shaped her into the ${selectedTraits[0]?.toLowerCase() || 'strong'} woman she is today.`;
    }

    // Add inspiring conclusion
    const inspiringEndings = [
      `Her presence alone changes the dynamic of any room she enters.`,
      `She's the kind of woman who doesn't just dream of change—she creates it.`,
      `Others look to her as an example of what's possible when strength meets purpose.`,
      `She proves that true strength comes from authenticity and unwavering self-belief.`,
      `Her story is one of triumph, resilience, and the power of staying true to oneself.`
    ];
    
    description += ` ${inspiringEndings[Math.floor(Math.random() * inspiringEndings.length)]}`;

    setGeneratedDescription(description);
    setShowResult(true);
  };

  const resetGenerator = () => {
    setSelectedTraits([]);
    setCharacterName('');
    setCharacterAge('');
    setCharacterProfession('');
    setCharacterBackground('');
    setGeneratedDescription('');
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            ✨ Your Strong Female Character
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {selectedTraits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 bg-pink-100 border border-pink-300 text-pink-800 rounded-full text-sm font-medium dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-700 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Character Description:
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {generatedDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
              📝 Writing Tips:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Show these traits through actions, not just descriptions</li>
              <li>• Give her flaws that humanize her strength</li>
              <li>• Let her growth come from overcoming challenges</li>
              <li>• Make her strength serve the story's purpose</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
              🎭 Character Development:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• What motivated her to develop these traits?</li>
              <li>• How do these traits create conflict?</li>
              <li>• What's her greatest fear or vulnerability?</li>
              <li>• How does she inspire other characters?</li>
            </ul>
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={resetGenerator}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
          >
            Create Another Character
          </button>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 Want More Writing Tips?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Check out the full guide at{' '}
              <a 
                href="https://becomeawritertoday.com/adjectives-for-strong-women/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                BecomeAWriterToday.com
              </a>
              {' '}for 60+ powerful adjectives and writing inspiration!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          💪 Strong Female Character Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Create authentic, multi-dimensional female characters using expert-curated adjectives
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on 60+ powerful adjectives from BecomeAWriterToday.com
        </p>
      </div>

      {/* Character Basic Info */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Character Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Character Name *
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g., Elena Rodriguez"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age (optional)
            </label>
            <input
              type="text"
              value={characterAge}
              onChange={(e) => setCharacterAge(e.target.value)}
              placeholder="e.g., 32 years old"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Profession (optional)
          </label>
          <input
            type="text"
            value={characterProfession}
            onChange={(e) => setCharacterProfession(e.target.value)}
            placeholder="e.g., Detective, CEO, Artist..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {professionSuggestions.slice(0, 8).map((profession) => (
              <button
                key={profession}
                onClick={() => setCharacterProfession(profession)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded transition-colors"
              >
                {profession}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Story (optional)
          </label>
          <input
            type="text"
            value={characterBackground}
            onChange={(e) => setCharacterBackground(e.target.value)}
            placeholder="e.g., Overcame significant personal challenges..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {backgroundSuggestions.slice(0, 4).map((background, index) => (
              <button
                key={index}
                onClick={() => setCharacterBackground(background)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded transition-colors"
              >
                {background.substring(0, 25)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trait Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Choose Personality Traits
          </h2>
          <button
            onClick={generateRandomTraits}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            🎲 Random Traits
          </button>
        </div>
        
        <div className="space-y-6">
          {Object.entries(adjectiveCategories).map(([category, { traits, color }]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {traits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => handleTraitToggle(trait)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      selectedTraits.includes(trait)
                        ? 'border-pink-500 bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
                        : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${color}`
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedTraits.length > 0 && (
          <div className="mt-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <h3 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">
              Selected Traits ({selectedTraits.length}):
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTraits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm font-medium dark:bg-pink-900/50 dark:text-pink-300"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateDescription}
          disabled={selectedTraits.length === 0 || !characterName}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
            selectedTraits.length === 0 || !characterName
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg'
          }`}
        >
          ✨ Generate Character Description
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 <strong>Tip:</strong> Select 2-4 traits for the most authentic character descriptions. 
          Each trait represents qualities from the expert-curated list of adjectives for strong women.
        </p>
      </div>
    </div>
  );
};

export default StrongFemaleCharacterGenerator; 