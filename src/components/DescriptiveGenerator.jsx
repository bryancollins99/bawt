import React, { useState } from 'react';

const DescriptiveGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('visual');
  const [selectedTone, setSelectedTone] = useState('neutral');
  const [generatedDescriptors, setGeneratedDescriptors] = useState([]);
  const [generatedSentences, setGeneratedSentences] = useState([]);

  const descriptiveCategories = {
    visual: {
      name: 'Visual Descriptions',
      icon: '👁️',
      neutral: ['bright', 'clear', 'smooth', 'round', 'straight', 'colorful', 'transparent', 'opaque', 'shiny', 'matte'],
      positive: ['dazzling', 'luminous', 'pristine', 'elegant', 'graceful', 'radiant', 'gleaming', 'stunning', 'magnificent', 'breathtaking'],
      negative: ['dim', 'murky', 'tarnished', 'cracked', 'faded', 'grimy', 'distorted', 'blurred', 'shadowy', 'weathered']
    },
    auditory: {
      name: 'Sound Descriptions',
      icon: '🔊',
      neutral: ['loud', 'quiet', 'steady', 'rhythmic', 'clear', 'muffled', 'sharp', 'deep', 'high', 'constant'],
      positive: ['melodious', 'harmonious', 'crisp', 'resonant', 'soothing', 'musical', 'enchanting', 'pure', 'sweet', 'euphonic'],
      negative: ['jarring', 'deafening', 'grating', 'shrill', 'cacophonous', 'piercing', 'discordant', 'harsh', 'grinding', 'thunderous']
    },
    tactile: {
      name: 'Touch & Texture',
      icon: '✋',
      neutral: ['smooth', 'rough', 'soft', 'hard', 'warm', 'cool', 'dry', 'wet', 'thick', 'thin'],
      positive: ['silky', 'velvety', 'luxurious', 'plush', 'satiny', 'downy', 'tender', 'delicate', 'supple', 'cushioned'],
      negative: ['coarse', 'jagged', 'scratchy', 'gritty', 'slimy', 'sticky', 'brittle', 'rigid', 'abrasive', 'prickly']
    },
    emotional: {
      name: 'Emotional Atmosphere',
      icon: '💭',
      neutral: ['calm', 'steady', 'quiet', 'balanced', 'neutral', 'even', 'controlled', 'composed', 'stable', 'measured'],
      positive: ['joyful', 'uplifting', 'inspiring', 'hopeful', 'energetic', 'peaceful', 'blissful', 'radiant', 'vibrant', 'serene'],
      negative: ['melancholy', 'ominous', 'tense', 'brooding', 'foreboding', 'haunting', 'suffocating', 'oppressive', 'eerie', 'desolate']
    },
    natural: {
      name: 'Nature & Environment',
      icon: '🌿',
      neutral: ['green', 'brown', 'natural', 'organic', 'earthy', 'wild', 'open', 'vast', 'dense', 'scattered'],
      positive: ['lush', 'verdant', 'pristine', 'flourishing', 'abundant', 'fertile', 'thriving', 'blooming', 'majestic', 'untouched'],
      negative: ['barren', 'withered', 'desolate', 'scorched', 'parched', 'overgrown', 'tangled', 'murky', 'stagnant', 'decaying']
    },
    architectural: {
      name: 'Spaces & Structures',
      icon: '🏛️',
      neutral: ['square', 'rectangular', 'tall', 'wide', 'narrow', 'spacious', 'compact', 'level', 'curved', 'angular'],
      positive: ['grand', 'magnificent', 'elegant', 'stately', 'imposing', 'ornate', 'majestic', 'graceful', 'stunning', 'impressive'],
      negative: ['cramped', 'dilapidated', 'crumbling', 'dingy', 'cluttered', 'oppressive', 'stark', 'austere', 'deteriorating', 'confined']
    }
  };

  const sentenceTemplates = {
    visual: [
      "The {descriptor} light filtered through the ancient windows.",
      "Her dress was {descriptor}, catching everyone's attention.",
      "The {descriptor} landscape stretched endlessly before them.",
      "His eyes were {descriptor} in the moonlight.",
      "The {descriptor} painting dominated the gallery wall."
    ],
    auditory: [
      "The {descriptor} music filled the concert hall.",
      "A {descriptor} voice echoed through the empty corridor.",
      "The {descriptor} sound of rain drummed against the roof.",
      "Her {descriptor} laughter brightened the entire room.",
      "The {descriptor} silence was almost unbearable."
    ],
    tactile: [
      "The {descriptor} fabric felt luxurious against her skin.",
      "His {descriptor} hands worked expertly with the clay.",
      "The {descriptor} surface of the lake reflected perfectly.",
      "She wrapped herself in the {descriptor} blanket.",
      "The {descriptor} texture of the bark told its age."
    ],
    emotional: [
      "The {descriptor} atmosphere made everyone feel at ease.",
      "A {descriptor} mood settled over the gathering.",
      "The {descriptor} energy in the room was infectious.",
      "His {descriptor} demeanor put others on edge.",
      "The {descriptor} ambiance created the perfect setting."
    ],
    natural: [
      "The {descriptor} forest welcomed weary travelers.",
      "A {descriptor} garden bloomed behind the cottage.",
      "The {descriptor} mountains rose majestically overhead.",
      "The {descriptor} meadow swayed gently in the breeze.",
      "A {descriptor} stream wound through the valley."
    ],
    architectural: [
      "The {descriptor} cathedral stood as a testament to faith.",
      "Her {descriptor} apartment overlooked the busy street.",
      "The {descriptor} bridge connected two worlds.",
      "A {descriptor} staircase spiraled toward the tower.",
      "The {descriptor} courtyard provided peaceful respite."
    ]
  };

  const generateDescriptors = () => {
    const category = descriptiveCategories[selectedCategory];
    const descriptors = category[selectedTone];
    setGeneratedDescriptors([...descriptors]);
  };

  const generateSentences = () => {
    const category = descriptiveCategories[selectedCategory];
    const descriptors = category[selectedTone];
    const templates = sentenceTemplates[selectedCategory];
    
    const sentences = templates.slice(0, 5).map(template => {
      const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
      return template.replace('{descriptor}', randomDescriptor);
    });
    
    setGeneratedSentences(sentences);
  };

  const generateBoth = () => {
    generateDescriptors();
    generateSentences();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🎨 Descriptive Word & Sentence Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create vivid, sensory-rich descriptions to bring your writing to life
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Description Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Description Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(descriptiveCategories).map(([key, category]) => (
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

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Descriptive Tone
            </label>
            <div className="space-y-2">
              {['neutral', 'positive', 'negative'].map((tone) => (
                <label key={tone} className="flex items-center">
                  <input
                    type="radio"
                    name="tone"
                    value={tone}
                    checked={selectedTone === tone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="mr-3 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {tone} {tone === 'neutral' && '⚖️'} {tone === 'positive' && '✨'} {tone === 'negative' && '🌧️'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={generateDescriptors}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Descriptive Words
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
        {/* Descriptive Words */}
        {generatedDescriptors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {descriptiveCategories[selectedCategory].icon} Descriptive Words ({selectedTone})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {generatedDescriptors.map((descriptor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-white font-medium">
                    {descriptor}
                  </span>
                  <button
                    onClick={() => copyToClipboard(descriptor)}
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

        {/* Descriptive Sentences */}
        {generatedSentences.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📝 Descriptive Sentences
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
      {(generatedDescriptors.length > 0 || generatedSentences.length > 0) && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
            💡 Writing Tips for Descriptive Language:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300 text-sm">
            <div className="space-y-2">
              <p>• <strong>Use sensory details:</strong> Appeal to sight, sound, touch, smell, taste</p>
              <p>• <strong>Show, don't tell:</strong> "The withered rose" vs "The rose was old"</p>
              <p>• <strong>Layer descriptions:</strong> Combine multiple senses for richness</p>
            </div>
            <div className="space-y-2">
              <p>• <strong>Match tone to mood:</strong> Positive words for upbeat scenes</p>
              <p>• <strong>Avoid overuse:</strong> Select the most impactful descriptors</p>
              <p>• <strong>Create atmosphere:</strong> Use descriptions to set the scene</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Guide */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📚 Description Categories Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {Object.entries(descriptiveCategories).map(([key, category]) => (
            <div key={key} className="space-y-1">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {category.icon} {category.name}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {key === 'visual' && 'Colors, shapes, appearance, lighting'}
                {key === 'auditory' && 'Sounds, music, noise, voice qualities'}
                {key === 'tactile' && 'Textures, temperatures, physical sensations'}
                {key === 'emotional' && 'Moods, feelings, psychological atmosphere'}
                {key === 'natural' && 'Landscapes, weather, plants, outdoor scenes'}
                {key === 'architectural' && 'Buildings, rooms, structures, spaces'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DescriptiveGenerator; 