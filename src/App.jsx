import React, { useState, useCallback, useEffect } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import PalindromeChecker from './components/PalindromeChecker';
import RhymingAssistant from './components/RhymingAssistant';
import EssayHookGenerator from './components/EssayHookGenerator';
import ActionGenerator from './components/ActionGenerator';
import DescriptiveGenerator from './components/DescriptiveGenerator';
import { 
  countWords, 
  countFillerWordsByType, 
  analyzeEmotions, 
  calculateClarityScore, 
  getTopFillerWords 
} from './utils/textAnalysis';

function App() {
  // Check URL parameters for embed mode and tool selection
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedMode = urlParams.get('embed') === 'true';
  const toolFromUrl = urlParams.get('tool');
  
     // Map URL tool parameter to internal tool ID
   const getInitialTool = () => {
     switch(toolFromUrl) {
       case 'palindrome': return 'palindrome';
       case 'tone': return 'tone';
       case 'rhyming': return 'rhyming';
       case 'essay-hook': return 'essay-hook';
       case 'action-generator': return 'action-generator';
       case 'descriptive-generator': return 'descriptive-generator';
       default: return 'descriptive-generator'; // Default to descriptive generator
     }
   };

  const [currentTool, setCurrentTool] = useState(getInitialTool());
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Update URL when tool changes (only in non-embed mode)
  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    if (!isEmbedMode) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('tool', toolId);
      window.history.pushState({}, '', newUrl);
    }
  };

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
    { id: 'essay-hook', name: 'Essay Hook Generator', icon: '🪝' },
    { id: 'action-generator', name: 'Action Generator', icon: '⚡' },
    { id: 'descriptive-generator', name: 'Descriptive Generator', icon: '🎨' }
  ];

     // Generate embed iframe code for current tool
   const getEmbedCode = (toolId) => {
     const baseUrl = window.location.origin;
     const embedUrl = `${baseUrl}/?embed=true&tool=${toolId}`;
     return `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" scrolling="auto" title="${tools.find(t => t.id === toolId)?.name} - BAWT Writing Tools"></iframe>`;
   };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation and Dark Mode Toggle - Hidden in embed mode */}
        {!isEmbedMode && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Tool Navigation */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolChange(tool.id)}
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
        )}

                 {/* Embed Code Helper - Only show in non-embed mode */}
         {!isEmbedMode && (
           <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
             <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
               🖼️ Embed Code for {tools.find(t => t.id === currentTool)?.name}:
             </h3>
             <div className="space-y-3">
               <div className="flex items-start space-x-2">
                 <code className="flex-1 px-3 py-3 bg-white dark:bg-gray-800 rounded border text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                   {getEmbedCode(currentTool)}
                 </code>
                 <button
                   onClick={() => navigator.clipboard.writeText(getEmbedCode(currentTool))}
                   className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                   title="Copy iframe code to clipboard"
                 >
                   📋 Copy Code
                 </button>
               </div>
               <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                 <p>💡 <strong>Copy & paste this iframe code directly into:</strong></p>
                 <ul className="ml-4 list-disc space-y-1">
                   <li>WordPress posts/pages (HTML/Code block)</li>
                   <li>Website HTML files</li>
                   <li>Blog platforms (Ghost, Medium with HTML)</li>
                   <li>Custom CMS or static sites</li>
                 </ul>
                 <p className="pt-2"><strong>Note:</strong> Adjust height="600" if you need more/less space</p>
               </div>
             </div>
           </div>
         )}

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

        {currentTool === 'action-generator' && <ActionGenerator />}

        {currentTool === 'descriptive-generator' && <DescriptiveGenerator />}

        {/* Footer - Hidden in embed mode */}
        {!isEmbedMode && (
          <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              Built with React and TailwindCSS • Writing Tools for BecomeAWriterToday.com
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
