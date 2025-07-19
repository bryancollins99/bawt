import React, { useState } from 'react';

const PoetryWordsGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const [selectedMood, setSelectedMood] = useState('all');
  const [generatedWords, setGeneratedWords] = useState([]);
  const [generatedPhrases, setGeneratedPhrases] = useState([]);
  const [showDefinitions, setShowDefinitions] = useState(false);

  const poetryCategories = {
    nature: {
      name: 'Nature & Seasons',
      icon: '🌿',
      description: 'Words evoking the natural world, perfect for landscape and seasonal poetry',
      words: [
        { word: 'verdant', definition: 'green with grass or other rich vegetation', mood: 'peaceful' },
        { word: 'gossamer', definition: 'delicate, light, and insubstantial', mood: 'ethereal' },
        { word: 'effulgent', definition: 'shining forth brilliantly; radiant', mood: 'bright' },
        { word: 'susurrus', definition: 'a whispering or rustling sound', mood: 'peaceful' },
        { word: 'petrichor', definition: 'pleasant smell of earth after rain', mood: 'melancholic' },
        { word: 'luminous', definition: 'full of or shedding light; bright', mood: 'bright' },
        { word: 'ephemeral', definition: 'lasting for a very short time', mood: 'melancholic' },
        { word: 'crystalline', definition: 'clear and transparent like crystal', mood: 'bright' },
        { word: 'twilight', definition: 'the soft glowing light from the sky', mood: 'melancholic' },
        { word: 'aurora', definition: 'dawn; natural light display in polar regions', mood: 'ethereal' },
        { word: 'tranquil', definition: 'free from disturbance; calm', mood: 'peaceful' },
        { word: 'serene', definition: 'calm, peaceful, and untroubled', mood: 'peaceful' }
      ],
      phrases: [
        'whispered winds through ancient oaks',
        'dewdrops dancing on morning petals', 
        'moonbeams painting silver paths',
        'autumn leaves spiraling earthward',
        'crystalline streams singing softly',
        'meadows stretching toward infinity',
        'starlight weaving through darkness',
        'morning mist embracing valleys'
      ]
    },
    emotions: {
      name: 'Emotions & Heart',
      icon: '💝',
      description: 'Words for expressing deep feelings, love, loss, and human connection',
      words: [
        { word: 'ardent', definition: 'burning with passion or intensity', mood: 'passionate' },
        { word: 'melancholy', definition: 'thoughtful sadness or pensive sorrow', mood: 'melancholic' },
        { word: 'euphoria', definition: 'intense happiness and self-confidence', mood: 'joyful' },
        { word: 'yearning', definition: 'deep longing or wistful desire', mood: 'melancholic' },
        { word: 'rapture', definition: 'intense pleasure and excitement', mood: 'passionate' },
        { word: 'solitude', definition: 'state of being alone, especially by choice', mood: 'peaceful' },
        { word: 'reverie', definition: 'state of dreamy meditation', mood: 'ethereal' },
        { word: 'bliss', definition: 'perfect happiness and serene joy', mood: 'joyful' },
        { word: 'anguish', definition: 'severe mental or physical pain', mood: 'melancholic' },
        { word: 'serenity', definition: 'state of being calm and peaceful', mood: 'peaceful' }
      ],
      phrases: [
        'heart beating like thunder',
        'tears falling like autumn rain',
        'love burning bright as stars',
        'soul dancing in moonlight',
        'memories carved in stone',
        'laughter echoing through time',
        'sorrow deep as ocean trenches',
        'joy rising like morning sun'
      ]
    },
    mystical: {
      name: 'Mystical & Spiritual',
      icon: '✨',
      description: 'Ethereal words for spiritual, mystical, and transcendent poetry like Rumi',
      words: [
        { word: 'transcendent', definition: 'beyond the range of normal experience', mood: 'ethereal' },
        { word: 'ineffable', definition: 'too great to be expressed in words', mood: 'ethereal' },
        { word: 'sublime', definition: 'inspiring awe through beauty or grandeur', mood: 'ethereal' },
        { word: 'divine', definition: 'excellently beautiful; heavenly', mood: 'ethereal' },
        { word: 'ethereal', definition: 'extremely delicate and light', mood: 'ethereal' },
        { word: 'mystical', definition: 'relating to mysticism or spiritual mystery', mood: 'ethereal' },
        { word: 'celestial', definition: 'positioned in or relating to the sky', mood: 'ethereal' },
        { word: 'sacred', definition: 'dedicated to a religious purpose', mood: 'peaceful' },
        { word: 'luminescence', definition: 'emission of light not caused by heat', mood: 'bright' },
        { word: 'infinity', definition: 'limitless or endless space, time, or quantity', mood: 'ethereal' }
      ],
      phrases: [
        'soul ascending beyond earthly bounds',
        'divine light piercing darkness',
        'whispers from the infinite',
        'sacred silence between heartbeats',
        'essence flowing like liquid starlight',
        'consciousness expanding into cosmos',
        'eternal dance of being and becoming',
        'love dissolving all boundaries'
      ]
    },
    imagery: {
      name: 'Vivid Imagery',
      icon: '🎨',
      description: 'Sensory words that create powerful visual, auditory, and tactile images',
      words: [
        { word: 'iridescent', definition: 'showing luminous colors that change from different angles', mood: 'bright' },
        { word: 'cascading', definition: 'falling, flowing, or rushing in quantity like a waterfall', mood: 'dynamic' },
        { word: 'shimmering', definition: 'shining with a soft tremulous light', mood: 'bright' },
        { word: 'undulating', definition: 'moving with smooth wavelike motion', mood: 'peaceful' },
        { word: 'burnished', definition: 'polished by rubbing; shiny', mood: 'bright' },
        { word: 'velvet', definition: 'soft and smooth texture', mood: 'peaceful' },
        { word: 'crystalline', definition: 'clear and transparent; pure in tone', mood: 'bright' },
        { word: 'gossamer', definition: 'very light, thin, and insubstantial', mood: 'ethereal' },
        { word: 'molten', definition: 'liquefied by heat; glowing', mood: 'passionate' },
        { word: 'alabaster', definition: 'smooth white translucent stone', mood: 'peaceful' }
      ],
      phrases: [
        'silk-soft shadows dancing',
        'golden light spilling forth',
        'velvet darkness embracing',
        'crystalline laughter ringing',
        'fire painting the horizon',
        'silver threads of moonlight',
        'emerald depths of forest',
        'scarlet passion blazing'
      ]
    }
  };

  const moods = [
    { id: 'all', name: 'All Moods', icon: '🌈' },
    { id: 'peaceful', name: 'Peaceful', icon: '🕊️' },
    { id: 'passionate', name: 'Passionate', icon: '🔥' },
    { id: 'melancholic', name: 'Melancholic', icon: '🌙' },
    { id: 'ethereal', name: 'Ethereal', icon: '✨' },
    { id: 'bright', name: 'Bright', icon: '☀️' },
    { id: 'joyful', name: 'Joyful', icon: '🌟' }
  ];

  const getFilteredWords = () => {
    const category = poetryCategories[selectedCategory];
    let words = [...category.words];
    
    if (selectedMood !== 'all') {
      words = words.filter(item => item.mood === selectedMood);
    }
    
    return words;
  };

  const generateWords = () => {
    const filteredWords = getFilteredWords();
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setGeneratedWords(shuffled.slice(0, 8));
  };

  const generatePhrases = () => {
    const category = poetryCategories[selectedCategory];
    const shuffled = [...category.phrases].sort(() => Math.random() - 0.5);
    setGeneratedPhrases(shuffled.slice(0, 6));
  };

  const generateBoth = () => {
    generateWords();
    generatePhrases();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getMoodColor = (mood) => {
    const colors = {
      peaceful: 'text-blue-600 bg-blue-50 border-blue-200',
      passionate: 'text-red-600 bg-red-50 border-red-200',
      melancholic: 'text-purple-600 bg-purple-50 border-purple-200',
      ethereal: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      bright: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      joyful: 'text-green-600 bg-green-50 border-green-200',
      dynamic: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colors[mood] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌟 Poetry Words Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Discover beautiful words and phrases to elevate your poetry. Inspired by masters like Mary Oliver and Rumi.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Poetry Settings
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Word Category
            </label>
            <div className="space-y-2">
              {Object.entries(poetryCategories).map(([key, category]) => (
                <label key={key} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="poetryCategory"
                    value={key}
                    checked={selectedCategory === key}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-3 mt-1 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {category.icon} {category.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Emotional Mood
            </label>
            <div className="space-y-2">
              {moods.map((mood) => (
                <label key={mood.id} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value={mood.id}
                    checked={selectedMood === mood.id}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="mr-3 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {mood.icon} {mood.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={generateWords}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Words
          </button>
          <button
            onClick={generatePhrases}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Phrases
          </button>
          <button
            onClick={generateBoth}
            className="py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Generate Both
          </button>
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showDefinitions ? 'Hide' : 'Show'} Definitions
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Words */}
        {generatedWords.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                ✨ Poetry Words
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {generatedWords.length} words
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {generatedWords.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                        {item.word}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(item.mood)} dark:bg-opacity-20`}>
                        {item.mood}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.word)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy word"
                    >
                      📋
                    </button>
                  </div>
                  
                  {showDefinitions && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      {item.definition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phrases */}
        {generatedPhrases.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                🎨 Poetic Phrases
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {generatedPhrases.length} phrases
              </span>
            </div>

            <div className="space-y-3">
              {generatedPhrases.map((phrase, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 dark:text-gray-200 italic text-lg">
                      "{phrase}"
                    </p>
                    <button
                      onClick={() => copyToClipboard(phrase)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-3"
                      title="Copy phrase"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Poetry Tips */}
      {(generatedWords.length > 0 || generatedPhrases.length > 0) && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
            💡 Poetry Writing Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Using Poetic Words:</h5>
              <ul className="space-y-1">
                <li>• Choose words that engage the senses</li>
                <li>• Balance familiar and unusual vocabulary</li>
                <li>• Consider the sound and rhythm of words</li>
                <li>• Let meaning emerge through imagery</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Creating Powerful Phrases:</h5>
              <ul className="space-y-1">
                <li>• Combine unexpected word pairs</li>
                <li>• Use concrete images for abstract ideas</li>
                <li>• Vary sentence length and structure</li>
                <li>• Read aloud to test flow and music</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Poetry Masters Reference */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
          📚 Inspired by Poetry Masters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-blue-800/30 rounded p-4">
            <h5 className="font-medium text-gray-800 dark:text-white mb-2">🌿 Mary Oliver</h5>
            <p className="text-gray-600 dark:text-gray-300">
              Known for nature poetry with precise observation and spiritual depth. Use nature category words to capture her style.
            </p>
          </div>
          <div className="bg-white dark:bg-blue-800/30 rounded p-4">
            <h5 className="font-medium text-gray-800 dark:text-white mb-2">✨ Rumi</h5>
            <p className="text-gray-600 dark:text-gray-300">
              Master of mystical poetry about divine love and spiritual transformation. Use mystical and emotion words.
            </p>
          </div>
          <div className="bg-white dark:bg-blue-800/30 rounded p-4">
            <h5 className="font-medium text-gray-800 dark:text-white mb-2">🎨 Imagery Masters</h5>
            <p className="text-gray-600 dark:text-gray-300">
              Great poets use vivid sensory details. Combine imagery words with specific emotions for powerful effects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoetryWordsGenerator; 