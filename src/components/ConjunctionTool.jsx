import React, { useState } from 'react';

const ConjunctionTool = () => {
  const [selectedType, setSelectedType] = useState('coordinating');
  const [selectedPurpose, setSelectedPurpose] = useState('addition');
  const [generatedConjunctions, setGeneratedConjunctions] = useState([]);
  const [generatedExamples, setGeneratedExamples] = useState([]);

  const conjunctionTypes = {
    coordinating: {
      name: 'Coordinating Conjunctions',
      icon: '🔗',
      description: 'Connect words, phrases, or independent clauses of equal importance',
      subcategories: {
        addition: {
          name: 'Addition',
          conjunctions: ['and', 'also', 'plus', 'as well as', 'furthermore', 'moreover', 'in addition'],
          examples: [
            'She studied hard and passed the exam.',
            'The weather was cold, and the wind was strong.',
            'He likes reading books and writing stories.',
            'We need milk and bread from the store.'
          ]
        },
        contrast: {
          name: 'Contrast/Opposition',
          conjunctions: ['but', 'yet', 'however', 'although', 'though', 'on the other hand', 'nevertheless'],
          examples: [
            'She was tired, but she continued working.',
            'The movie was long, yet it was entertaining.',
            'He studied hard, but he still failed the test.',
            'It was raining, yet they went for a walk.'
          ]
        },
        choice: {
          name: 'Choice/Alternative',
          conjunctions: ['or', 'either...or', 'neither...nor', 'whether...or', 'alternatively'],
          examples: [
            'Would you like tea or coffee?',
            'Either we leave now or we miss the train.',
            'Neither the book nor the movie was interesting.',
            'You can either stay home or come with us.'
          ]
        },
        result: {
          name: 'Cause/Result',
          conjunctions: ['so', 'therefore', 'thus', 'consequently', 'as a result', 'for this reason'],
          examples: [
            'It was raining, so we stayed inside.',
            'She was late, so she missed the meeting.',
            'The store was closed, so we went home.',
            'He forgot his keys, so he couldn\'t enter.'
          ]
        }
      }
    },
    subordinating: {
      name: 'Subordinating Conjunctions',
      icon: '⬇️',
      description: 'Connect a dependent clause to an independent clause',
      subcategories: {
        time: {
          name: 'Time',
          conjunctions: ['when', 'while', 'after', 'before', 'since', 'until', 'as soon as', 'whenever'],
          examples: [
            'I\'ll call you when I arrive home.',
            'She was reading while he was cooking.',
            'After the meeting ended, we went for lunch.',
            'Before you leave, please turn off the lights.'
          ]
        },
        condition: {
          name: 'Condition',
          conjunctions: ['if', 'unless', 'provided that', 'as long as', 'in case', 'even if'],
          examples: [
            'If it rains tomorrow, we\'ll cancel the picnic.',
            'Unless you study, you won\'t pass the exam.',
            'You can go out as long as you finish your homework.',
            'Even if it\'s difficult, we must try.'
          ]
        },
        reason: {
          name: 'Reason/Cause',
          conjunctions: ['because', 'since', 'as', 'due to', 'owing to', 'given that'],
          examples: [
            'She stayed home because she was sick.',
            'Since it\'s late, we should go to bed.',
            'As you know, the meeting is tomorrow.',
            'Given that it\'s winter, dress warmly.'
          ]
        },
        purpose: {
          name: 'Purpose',
          conjunctions: ['so that', 'in order that', 'to', 'in order to', 'for the purpose of'],
          examples: [
            'She spoke slowly so that everyone could understand.',
            'He saved money in order to buy a car.',
            'We left early to avoid traffic.',
            'They whispered so that others wouldn\'t hear.'
          ]
        }
      }
    },
    correlative: {
      name: 'Correlative Conjunctions',
      icon: '↔️',
      description: 'Work in pairs to connect balanced words, phrases, or clauses',
      subcategories: {
        pairs: {
          name: 'Common Pairs',
          conjunctions: ['both...and', 'either...or', 'neither...nor', 'not only...but also', 'whether...or'],
          examples: [
            'Both the teacher and the students were excited.',
            'Either you come with us or you stay home.',
            'Neither the book nor the movie was good.',
            'She is not only smart but also kind.'
          ]
        },
        emphasis: {
          name: 'For Emphasis',
          conjunctions: ['not only...but also', 'not...but', 'rather...than', 'as...as'],
          examples: [
            'He is not only talented but also hardworking.',
            'It\'s not what you say but how you say it.',
            'I\'d rather walk than take the bus.',
            'She is as smart as she is beautiful.'
          ]
        }
      }
    },
    transitional: {
      name: 'Transitional Conjunctions',
      icon: '➡️',
      description: 'Connect ideas and show relationships between sentences or paragraphs',
      subcategories: {
        sequence: {
          name: 'Sequence/Order',
          conjunctions: ['first', 'second', 'then', 'next', 'finally', 'meanwhile', 'subsequently'],
          examples: [
            'First, we need to gather all the materials.',
            'Then, we can begin the experiment.',
            'Finally, we\'ll analyze the results.',
            'Meanwhile, the other team worked on design.'
          ]
        },
        comparison: {
          name: 'Comparison',
          conjunctions: ['similarly', 'likewise', 'in the same way', 'equally', 'by comparison'],
          examples: [
            'Similarly, the second study showed the same results.',
            'Likewise, students in other schools faced challenges.',
            'In the same way, technology affects all industries.',
            'By comparison, this method is more efficient.'
          ]
        },
        summary: {
          name: 'Summary/Conclusion',
          conjunctions: ['in conclusion', 'to summarize', 'in summary', 'overall', 'in brief'],
          examples: [
            'In conclusion, the project was successful.',
            'To summarize, we need more research.',
            'Overall, the team performed well.',
            'In brief, the plan needs revision.'
          ]
        }
      }
    }
  };

  const generateConjunctions = () => {
    const type = conjunctionTypes[selectedType];
    const category = type.subcategories[selectedPurpose];
    setGeneratedConjunctions([...category.conjunctions]);
  };

  const generateExamples = () => {
    const type = conjunctionTypes[selectedType];
    const category = type.subcategories[selectedPurpose];
    setGeneratedExamples([...category.examples]);
  };

  const generateBoth = () => {
    generateConjunctions();
    generateExamples();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔗 Conjunction Words Tool
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Master conjunctions to improve sentence flow, connection, and variety in your writing
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Conjunction Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Conjunction Type
            </label>
            <div className="space-y-2">
              {Object.entries(conjunctionTypes).map(([key, type]) => (
                <label key={key} className="flex items-start">
                  <input
                    type="radio"
                    name="conjunctionType"
                    value={key}
                    checked={selectedType === key}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-3 mt-1 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {type.icon} {type.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Purpose Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Purpose/Category
            </label>
            <div className="space-y-2">
              {Object.entries(conjunctionTypes[selectedType].subcategories).map(([key, category]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="radio"
                    name="purpose"
                    value={key}
                    checked={selectedPurpose === key}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="mr-3 text-red-600"
                    style={{ accentColor: '#d60000' }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={generateConjunctions}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Conjunctions
          </button>
          <button
            onClick={generateExamples}
            className="py-3 px-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#d60000' }}
          >
            Generate Examples
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
        {/* Conjunctions */}
        {generatedConjunctions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {conjunctionTypes[selectedType].icon} {conjunctionTypes[selectedType].subcategories[selectedPurpose].name} Conjunctions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {generatedConjunctions.map((conjunction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-800 dark:text-white font-medium">
                    {conjunction}
                  </span>
                  <button
                    onClick={() => copyToClipboard(conjunction)}
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

        {/* Examples */}
        {generatedExamples.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📝 Example Sentences
            </h3>
            <div className="space-y-3">
              {generatedExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-800 dark:text-white leading-relaxed flex-1">
                      {example}
                    </p>
                    <button
                      onClick={() => copyToClipboard(example)}
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
      {(generatedConjunctions.length > 0 || generatedExamples.length > 0) && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
            💡 Tips for Using Conjunctions Effectively:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300 text-sm">
            <div className="space-y-2">
              <p>• <strong>Vary your conjunctions:</strong> Avoid repeating the same words</p>
              <p>• <strong>Match the relationship:</strong> Choose conjunctions that fit your meaning</p>
              <p>• <strong>Consider sentence flow:</strong> Use conjunctions to improve readability</p>
            </div>
            <div className="space-y-2">
              <p>• <strong>Avoid overuse:</strong> Too many conjunctions can weaken writing</p>
              <p>• <strong>Check punctuation:</strong> Some conjunctions need commas, others don't</p>
              <p>• <strong>Practice combinations:</strong> Mix different types for variety</p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Guide */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📚 Conjunction Types Quick Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {Object.entries(conjunctionTypes).map(([key, type]) => (
            <div key={key} className="space-y-2">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {type.icon} {type.name}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {type.description}
              </p>
              <div className="ml-4">
                {Object.entries(type.subcategories).map(([subKey, subCategory]) => (
                  <div key={subKey} className="text-xs text-gray-500 dark:text-gray-500">
                    • {subCategory.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConjunctionTool; 