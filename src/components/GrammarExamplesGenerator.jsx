import React, { useState } from 'react';

const GrammarExamplesGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('dangling-participles');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [generatedExamples, setGeneratedExamples] = useState([]);
  const [showCorrections, setShowCorrections] = useState(false);

  const grammarCategories = {
    'dangling-participles': {
      name: 'Dangling Participles',
      icon: '🔗',
      description: 'Participial phrases that don\'t clearly relate to the intended subject',
      examples: [
        {
          incorrect: "Walking down the street, the trees looked beautiful.",
          correct: "Walking down the street, I noticed the trees looked beautiful.",
          explanation: "The participial phrase 'Walking down the street' should modify the person doing the walking, not the trees.",
          difficulty: 'easy'
        },
        {
          incorrect: "Having finished the assignment, the TV was turned on.",
          correct: "Having finished the assignment, Sarah turned on the TV.",
          explanation: "The TV cannot finish an assignment. The person who finished should be the subject.",
          difficulty: 'easy'
        },
        {
          incorrect: "Running through the park, my phone fell out of my pocket.",
          correct: "Running through the park, I dropped my phone from my pocket.",
          explanation: "The phone wasn't running through the park. The person running should be the subject.",
          difficulty: 'easy'
        },
        {
          incorrect: "Driving to work, the radio announced breaking news.",
          correct: "Driving to work, I heard the radio announce breaking news.",
          explanation: "The radio isn't driving to work. The person driving should be the subject.",
          difficulty: 'medium'
        },
        {
          incorrect: "Being extremely tired, the bed looked very inviting.",
          correct: "Being extremely tired, I found the bed looked very inviting.",
          explanation: "The bed isn't tired. The tired person should be the subject of the sentence.",
          difficulty: 'medium'
        },
        {
          incorrect: "After reading the book, the movie seemed disappointing.",
          correct: "After reading the book, I found the movie seemed disappointing.",
          explanation: "The movie didn't read the book. The person who read should be the subject.",
          difficulty: 'medium'
        },
        {
          incorrect: "Having been damaged in the storm, we decided to replace the roof.",
          correct: "Having been damaged in the storm, the roof needed to be replaced.",
          explanation: "We weren't damaged in the storm. The roof was damaged, so it should be the subject.",
          difficulty: 'hard'
        },
        {
          incorrect: "While discussing the project, several issues became apparent.",
          correct: "While we were discussing the project, several issues became apparent.",
          explanation: "Issues don't discuss projects. The sentence needs to clarify who was discussing.",
          difficulty: 'hard'
        }
      ]
    },
    'misplaced-modifiers': {
      name: 'Misplaced Modifiers',
      icon: '📍',
      description: 'Modifiers placed too far from the words they modify, creating confusion',
      examples: [
        {
          incorrect: "I saw a man with binoculars walking his dog.",
          correct: "I saw a man walking his dog with binoculars.",
          explanation: "Place modifiers close to what they modify. The man has binoculars, not the dog.",
          difficulty: 'easy'
        },
        {
          incorrect: "She almost drove her kids to school every day.",
          correct: "She drove her kids to school almost every day.",
          explanation: "'Almost' should modify 'every day', not 'drove'. She did drive them, just not every single day.",
          difficulty: 'easy'
        },
        {
          incorrect: "The woman walked the dog wearing a red dress.",
          correct: "The woman wearing a red dress walked the dog.",
          explanation: "The woman is wearing the dress, not the dog. Move the modifier closer to 'woman'.",
          difficulty: 'medium'
        },
        {
          incorrect: "I only ate pizza for lunch.",
          correct: "I ate only pizza for lunch.",
          explanation: "'Only' should modify 'pizza' to mean that's all you ate, not that eating was the only thing you did.",
          difficulty: 'medium'
        },
        {
          incorrect: "The car was parked by the tree that we bought yesterday.",
          correct: "The car that we bought yesterday was parked by the tree.",
          explanation: "We bought the car yesterday, not the tree. Move the modifier closer to 'car'.",
          difficulty: 'hard'
        }
      ]
    },
    'subject-verb-disagreement': {
      name: 'Subject-Verb Disagreement',
      icon: '⚖️',
      description: 'When subjects and verbs don\'t agree in number (singular/plural)',
      examples: [
        {
          incorrect: "The group of students are studying.",
          correct: "The group of students is studying.",
          explanation: "'Group' is singular, so use 'is' even though 'students' is plural.",
          difficulty: 'easy'
        },
        {
          incorrect: "Each of the players have their own strategy.",
          correct: "Each of the players has their own strategy.",
          explanation: "'Each' is always singular, so use 'has' regardless of the plural noun that follows.",
          difficulty: 'easy'
        },
        {
          incorrect: "Neither the teacher nor the students was ready.",
          correct: "Neither the teacher nor the students were ready.",
          explanation: "With 'neither...nor', the verb agrees with the subject closest to it ('students' is plural).",
          difficulty: 'medium'
        },
        {
          incorrect: "The data shows interesting results.",
          correct: "The data show interesting results.",
          explanation: "'Data' is plural (singular is 'datum'), so use the plural verb 'show'.",
          difficulty: 'hard'
        },
        {
          incorrect: "Everyone in the offices are working late.",
          correct: "Everyone in the offices is working late.",
          explanation: "'Everyone' is singular, so use 'is' even when followed by plural phrases.",
          difficulty: 'medium'
        }
      ]
    },
    'comma-splices': {
      name: 'Comma Splices',
      icon: '🔪',
      description: 'Incorrectly joining independent clauses with just a comma',
      examples: [
        {
          incorrect: "I went to the store, I bought some milk.",
          correct: "I went to the store, and I bought some milk.",
          explanation: "Use a coordinating conjunction (and, but, or) after the comma to join independent clauses.",
          difficulty: 'easy'
        },
        {
          incorrect: "The weather was nice, we decided to go for a walk.",
          correct: "The weather was nice; we decided to go for a walk.",
          explanation: "Use a semicolon to join related independent clauses without a conjunction.",
          difficulty: 'easy'
        },
        {
          incorrect: "She studied hard, she still failed the test.",
          correct: "She studied hard, but she still failed the test.",
          explanation: "Use 'but' to show contrast between the two independent clauses.",
          difficulty: 'medium'
        },
        {
          incorrect: "The meeting was long, everyone was tired afterwards.",
          correct: "The meeting was long, so everyone was tired afterwards.",
          explanation: "Use 'so' to show cause and effect between independent clauses.",
          difficulty: 'medium'
        }
      ]
    },
    'run-on-sentences': {
      name: 'Run-on Sentences',
      icon: '🏃‍♂️',
      description: 'Sentences that combine multiple independent clauses without proper punctuation',
      examples: [
        {
          incorrect: "I woke up late I missed the bus I had to walk to work.",
          correct: "I woke up late, missed the bus, and had to walk to work.",
          explanation: "Break up or properly connect multiple independent clauses with commas and conjunctions.",
          difficulty: 'easy'
        },
        {
          incorrect: "The book was interesting it had many plot twists I couldn't put it down.",
          correct: "The book was interesting because it had many plot twists, and I couldn't put it down.",
          explanation: "Use subordinating conjunctions and coordinating conjunctions to connect ideas properly.",
          difficulty: 'medium'
        },
        {
          incorrect: "She loves to read she has over 500 books in her collection she reads every night before bed.",
          correct: "She loves to read and has over 500 books in her collection. She reads every night before bed.",
          explanation: "Break into separate sentences or use proper conjunctions to connect related ideas.",
          difficulty: 'hard'
        }
      ]
    },
    'apostrophe-errors': {
      name: 'Apostrophe Errors',
      icon: "✨",
      description: 'Incorrect use of apostrophes for possession and contractions',
      examples: [
        {
          incorrect: "The cats toy is missing.",
          correct: "The cat's toy is missing.",
          explanation: "Use apostrophe + s to show possession for singular nouns.",
          difficulty: 'easy'
        },
        {
          incorrect: "Its a beautiful day outside.",
          correct: "It's a beautiful day outside.",
          explanation: "'It's' is a contraction for 'it is'. 'Its' (no apostrophe) shows possession.",
          difficulty: 'easy'
        },
        {
          incorrect: "The students' were studying hard.",
          correct: "The students were studying hard.",
          explanation: "Don't use apostrophes to make nouns plural. 'Students' is already plural.",
          difficulty: 'medium'
        },
        {
          incorrect: "The childrens toys were scattered.",
          correct: "The children's toys were scattered.",
          explanation: "For irregular plural nouns like 'children', add apostrophe + s for possession.",
          difficulty: 'medium'
        }
      ]
    }
  };

  const difficulties = [
    { id: 'all', name: 'All Levels', icon: '📚' },
    { id: 'easy', name: 'Beginner', icon: '🟢' },
    { id: 'medium', name: 'Intermediate', icon: '🟡' },
    { id: 'hard', name: 'Advanced', icon: '🔴' }
  ];

  const generateExamples = () => {
    const category = grammarCategories[selectedCategory];
    let examples = [...category.examples];
    
    if (selectedDifficulty !== 'all') {
      examples = examples.filter(example => example.difficulty === selectedDifficulty);
    }
    
    // Shuffle and take up to 5 examples
    const shuffled = examples.sort(() => Math.random() - 0.5);
    setGeneratedExamples(shuffled.slice(0, 5));
    setShowCorrections(false);
  };

  const toggleCorrections = () => {
    setShowCorrections(!showCorrections);
  };

  const copyExample = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📝 Grammar Examples Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Learn from common grammar mistakes with interactive examples, corrections, and detailed explanations
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Grammar Settings
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Grammar Category
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(grammarCategories).map(([key, category]) => (
                <label key={key} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="grammarCategory"
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

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Difficulty Level
            </label>
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <label key={difficulty.id} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={difficulty.id}
                    checked={selectedDifficulty === difficulty.id}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="mr-3 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {difficulty.icon} {difficulty.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generateExamples}
            className="flex-1 py-3 px-6 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Grammar Examples
          </button>
          {generatedExamples.length > 0 && (
            <button
              onClick={toggleCorrections}
              className="py-3 px-6 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showCorrections ? 'Hide Corrections' : 'Show Corrections'}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {generatedExamples.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {grammarCategories[selectedCategory].icon} {grammarCategories[selectedCategory].name} Examples
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {generatedExamples.length} examples generated
            </span>
          </div>

          <div className="space-y-6">
            {generatedExamples.map((example, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(example.difficulty)} dark:bg-opacity-20`}>
                    {example.difficulty.charAt(0).toUpperCase() + example.difficulty.slice(1)}
                  </span>
                  <button
                    onClick={() => copyExample(showCorrections ? example.correct : example.incorrect)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>

                {/* Incorrect Example */}
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <span className="text-red-600 font-medium text-sm">❌ Incorrect:</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-gray-800 dark:text-gray-200 italic">
                      "{example.incorrect}"
                    </p>
                  </div>
                </div>

                {/* Correct Example (shown when corrections are toggled) */}
                {showCorrections && (
                  <>
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 font-medium text-sm">✅ Correct:</span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-gray-800 dark:text-gray-200">
                          "{example.correct}"
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-blue-600 font-medium text-sm">💡 Explanation:</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {example.explanation}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Study Tips */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
              💡 Study Tips for {grammarCategories[selectedCategory].name}:
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {selectedCategory === 'dangling-participles' && (
                <>
                  <p>• Always check that participial phrases clearly relate to the intended subject</p>
                  <p>• Place the subject immediately after the participial phrase</p>
                  <p>• Ask yourself: "Who or what is performing the action in the phrase?"</p>
                </>
              )}
              {selectedCategory === 'misplaced-modifiers' && (
                <>
                  <p>• Place modifiers as close as possible to the words they modify</p>
                  <p>• Be especially careful with words like "only," "almost," and "nearly"</p>
                  <p>• Read your sentence aloud to check for unintended meanings</p>
                </>
              )}
              {selectedCategory === 'subject-verb-disagreement' && (
                <>
                  <p>• Identify the true subject of the sentence (ignore prepositional phrases)</p>
                  <p>• Remember that collective nouns are usually singular</p>
                  <p>• With compound subjects, check whether they're joined by "and" or "or"</p>
                </>
              )}
              {selectedCategory === 'comma-splices' && (
                <>
                  <p>• Use coordinating conjunctions (FANBOYS) to join independent clauses</p>
                  <p>• Consider using semicolons for closely related independent clauses</p>
                  <p>• Break long sentences into shorter, clearer ones when possible</p>
                </>
              )}
              {selectedCategory === 'run-on-sentences' && (
                <>
                  <p>• Look for sentences with multiple complete thoughts</p>
                  <p>• Use periods to separate independent clauses into distinct sentences</p>
                  <p>• Consider subordinating conjunctions to show relationships between ideas</p>
                </>
              )}
              {selectedCategory === 'apostrophe-errors' && (
                <>
                  <p>• Remember: apostrophes show possession or create contractions</p>
                  <p>• Never use apostrophes to make nouns plural</p>
                  <p>• "Its" (possession) vs. "It's" (it is) - no apostrophe for possessive pronouns</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grammar Reference */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
          📚 Quick Grammar Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {Object.entries(grammarCategories).map(([key, category]) => (
            <div key={key} className="bg-white dark:bg-gray-700 rounded p-3">
              <h5 className="font-medium text-gray-800 dark:text-white mb-1">
                {category.icon} {category.name}
              </h5>
              <p className="text-gray-600 dark:text-gray-300">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrammarExamplesGenerator; 