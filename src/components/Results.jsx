import React from 'react';

const Results = ({ analysis }) => {
  if (!analysis) return null;

  const { 
    wordCount, 
    fillerCount, 
    fillerWordCounts, 
    emotions, 
    clarityScore, 
    topFillerWords 
  } = analysis;

  const emotionColors = {
    joy: 'bg-yellow-400',
    sadness: 'bg-blue-400',
    fear: 'bg-purple-400',
    anger: 'bg-red-400',
    confidence: 'bg-green-400'
  };

  const EmotionBar = ({ emotion, percentage }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {emotion}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${emotionColors[emotion]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Analysis Results
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Writing Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Writing Statistics
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Words</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{wordCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Filler Words</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{fillerCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Clarity Score</span>
                <span className={`text-lg font-bold ${
                  clarityScore >= 80 ? 'text-green-600 dark:text-green-400' :
                  clarityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {clarityScore}/100
                </span>
              </div>
            </div>

            {/* Top Filler Words */}
            {topFillerWords.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                  Top Filler Words to Remove
                </h4>
                <div className="space-y-2">
                  {topFillerWords.map(({ word, count }, index) => (
                    <div key={word} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <span className="font-medium text-red-700 dark:text-red-400">
                        {index + 1}. "{word}"
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {count} time{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emotional Tone */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Emotional Tone Breakdown
            </h3>
            
            <div className="space-y-3">
              {Object.entries(emotions).map(([emotion, percentage]) => (
                <EmotionBar key={emotion} emotion={emotion} percentage={percentage} />
              ))}
            </div>

            {Object.values(emotions).every(val => val === 0) && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  No emotional keywords detected. Try adding more descriptive language.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Writing Suggestions
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1">
            {clarityScore < 80 && (
              <li>• Consider removing some filler words to improve clarity</li>
            )}
            {fillerCount > 10 && (
              <li>• High filler word count detected - focus on more direct language</li>
            )}
            {Object.values(emotions).every(val => val === 0) && (
              <li>• Add more emotional language to engage your readers</li>
            )}
            {clarityScore >= 90 && (
              <li>• Excellent clarity! Your writing is concise and direct</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Results; 