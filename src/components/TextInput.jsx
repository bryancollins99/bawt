import React, { useState, useEffect } from 'react';
import { countWords, highlightFillerWords } from '../utils/textAnalysis';

const TextInput = ({ onTextChange, onAnalyze, showDarkToggle = true }) => {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 1000;

  useEffect(() => {
    const words = countWords(text);
    setWordCount(words);
    onTextChange(text);
  }, [text, onTextChange]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const words = countWords(newText);
    
    // Prevent exceeding word limit
    if (words <= maxWords) {
      setText(newText);
    }
  };

  const getHighlightedText = () => {
    return highlightFillerWords(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Emotional Tone + Filler Checker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyze your writing for filler words and emotional tone
        </p>
      </div>

      <div className="relative">
        <div className="mb-2 flex justify-between items-center">
          <label htmlFor="textInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter your text (maximum {maxWords} words)
          </label>
          <span className={`text-sm font-medium ${
            wordCount > maxWords * 0.9 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {wordCount}/{maxWords} words
          </span>
        </div>

        <div className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
          {/* Text input with proper visibility */}
          <textarea
            id="textInput"
            value={text}
            onChange={handleTextChange}
            placeholder="Start typing your text here..."
            className="w-full h-64 p-4 rounded-lg resize-none bg-transparent
                     text-gray-900 dark:text-white relative z-20
                     focus:ring-2 focus:ring-red-500 focus:border-transparent border-0 outline-none"
          />
          
          {/* Highlighted overlay - only show when there's text */}
          {text && (
            <div 
              className="absolute top-0 left-0 w-full h-64 p-4 pointer-events-none
                       text-gray-900 dark:text-white overflow-y-auto whitespace-pre-wrap rounded-lg z-10"
              style={{ wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
          )}
          
          {/* Placeholder when no text */}
          {!text && (
            <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10">
              Start typing your text here...
            </div>
          )}
        </div>

        <button
          onClick={() => onAnalyze(text)}
          disabled={wordCount === 0}
          className="mt-4 w-full hover:opacity-90 disabled:bg-gray-400 
                   text-white font-semibold py-3 px-6 rounded-lg transition-all
                   disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: wordCount === 0 ? '#9CA3AF' : '#d60000'
          }}
        >
          Check My Writing
        </button>
      </div>
    </div>
  );
};

export default TextInput; 