import React, { useState, useCallback } from 'react';
import TextInput from '../components/TextInput';
import Results from '../components/Results';
import { 
  countWords, 
  countFillerWordsByType, 
  analyzeEmotions, 
  calculateClarityScore, 
  getTopFillerWords 
} from '../utils/textAnalysis';

const EmotionalToneChecker = ({ isDarkMode, toggleDarkMode }) => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
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

  return (
    <div className="w-full">
      <TextInput 
        onTextChange={handleTextChange}
        onAnalyze={handleAnalyze}
        showDarkToggle={false}
      />
      
      <Results analysis={analysis} />

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Built for <a href="https://becomeawritertoday.com" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline">Become a Writer Today</a> • Analyze your writing for clarity and emotional tone
        </p>
      </footer>
    </div>
  );
};

export default EmotionalToneChecker; 