import React, { useState, useCallback, useEffect } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import PalindromeChecker from './components/PalindromeChecker';
import RhymingAssistant from './components/RhymingAssistant';
import EssayHookGenerator from './components/EssayHookGenerator';
import { 
  countWords, 
  countFillerWordsByType, 
  analyzeEmotions, 
  calculateClarityScore, 
  getTopFillerWords 
} from './utils/textAnalysis';

function App() {
  const [currentTool, setCurrentTool] = useState('essay-hook'); // Default to essay hook generator
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    // Clear analysis when text changes
    setAnalysis(null);
  }, []);

  const handleAnalyze = useCallback((textToAnalyze) => {
    if (!textToAnalyze.trim()) return;

    const wordCount = countWords(textToAnalyze);
    const fillerWordCounts = countFillerWordsByType(textToAnalyze);
    const fillerCount = Object.values(fillerWordCounts).reduce((sum, count) => sum + count, 0);
    const emotions = analyzeEmotions(textToAnalyze);
    const clarityScore = calculateClarityScore(fillerCount);
    const topFillerWords = getTopFillerWords(fillerWordCounts);

    setAnalysis({
      wordCount,
      fillerCount,
      fillerWordCounts,
      emotions,
      clarityScore,
      topFillerWords
    });
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const tools = [
    { id: 'palindrome', name: 'Palindrome Checker', icon: '🔄' },
    { id: 'tone', name: 'Tone Checker', icon: '📝' },
    { id: 'rhyming', name: 'Rhyming Assistant', icon: '🎵' },
    { id: 'essay-hook', name: 'Essay Hook Generator', icon: '🪝' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation and Dark Mode Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          {/* Tool Navigation */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                  currentTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{tool.icon}</span>
                <span className="hidden sm:inline">{tool.name}</span>
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            <span className="text-lg">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            <span className="text-sm font-medium">
              {isDarkMode ? 'Light' : 'Dark'} Mode
            </span>
          </button>
        </div>

        {/* Main Content */}
        {currentTool === 'palindrome' && <PalindromeChecker />}
        
        {currentTool === 'tone' && (
          <>
            <TextInput 
              onTextChange={handleTextChange}
              onAnalyze={handleAnalyze}
            />
            <Results analysis={analysis} />
          </>
        )}

        {currentTool === 'rhyming' && <RhymingAssistant />}

        {currentTool === 'essay-hook' && <EssayHookGenerator />}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with React and TailwindCSS • Writing Tools for BecomeAWriterToday.com
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App; 