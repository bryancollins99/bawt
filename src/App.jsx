import React, { useState, useCallback, useEffect } from 'react';
import TextInput from './components/TextInput';
import Results from './components/Results';
import PalindromeChecker from './components/PalindromeChecker';
import RhymingAssistant from './components/RhymingAssistant';
import EssayHookGenerator from './components/EssayHookGenerator';
import ActionGenerator from './components/ActionGenerator';
import DescriptiveGenerator from './components/DescriptiveGenerator';
import FillerWordsProcessor from './components/FillerWordsProcessor';
import ConjunctionTool from './components/ConjunctionTool';
import FreeWritingSoftwareQuiz from './components/FreeWritingSoftwareQuiz';
import StrongFemaleCharacterGenerator from './components/StrongFemaleCharacterGenerator';
import FemaleAuthorsTimeline from './components/FemaleAuthorsTimeline';
import CrimeThrillerQuiz from './components/CrimeThrillerQuiz';
import HardWordsSpellingQuiz from './components/HardWordsSpellingQuiz';
import StephenKingTimeline from './components/StephenKingTimeline';
import FamousPoemsTimeline from './components/FamousPoemsTimeline';
import GrammarlyROICalculator from './components/GrammarlyROICalculator';
import GrammarlyPlanQuiz from './components/GrammarlyPlanQuiz';
import GrammarlyComparisonMatrix from './components/GrammarlyComparisonMatrix';
import ReportTopicsGenerator from './components/ReportTopicsGenerator';
import GrammarExamplesGenerator from './components/GrammarExamplesGenerator';
import PoetryWordsGenerator from './components/PoetryWordsGenerator';
import DisneyHeroJourneyExplorer from './components/DisneyHeroJourneyExplorer';
import WritingQualityScorer from './components/WritingQualityScorer';
import RandomWordsGenerator from './components/RandomWordsGenerator';
import RomanticWordsGenerator from './components/RomanticWordsGenerator';
import SadWordsGenerator from './components/SadWordsGenerator';
import ContestFinder from './components/ContestFinder';
import ThemedWordGenerator from './components/ThemedWordGenerator';
import LiteraryDeviceDetector from './components/LiteraryDeviceDetector';
import RootWordExplorer from './components/RootWordExplorer';
import WritingAppFinder from './components/WritingAppFinder';
import WriterPulse from './components/WriterPulse';
import WeeklyWriting from './components/WeeklyWriting';
import ConcretePoemMaker from './components/ConcretePoemMaker';
import EmotionWheel from './components/EmotionWheel';
import DeadWordChecker from './components/DeadWordChecker';
import {
  countWords,
  countFillerWordsByType,
  analyzeEmotions,
  calculateClarityScore,
  getTopFillerWords
} from './utils/textAnalysis';
import { safeGetItem, safeSetItem } from './utils/safeStorage';
import { tools, resolveTool, NOT_FOUND } from './utils/toolRegistry';

function App() {
  // Check URL parameters for embed mode and tool selection
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedMode = urlParams.get('embed') === 'true';
  const toolFromUrl = urlParams.get('tool');
  
  // Map URL tool parameter to internal tool ID.
  // Unknown ?tool= values resolve to NOT_FOUND (visible message) rather than
  // silently rendering the default tool on the wrong page.
  const getInitialTool = () => resolveTool(toolFromUrl);

  const [currentTool, setCurrentTool] = useState(getInitialTool());
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode.
    // safeGetItem never throws — direct localStorage access here crashed the
    // app on first render inside iframes with third-party storage blocked.
    const saved = safeGetItem('darkMode');
    if (!saved) return false;
    try {
      return JSON.parse(saved) === true;
    } catch (e) {
      return false;
    }
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
    safeSetItem('darkMode', JSON.stringify(isDarkMode));
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

  // Generate complete embed HTML code for current tool
  const getEmbedCode = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/?embed=true&tool=${toolId}`;
    
         return `<!-- ${tool?.name} - BAWT Writing Tools -->
<div class="bawt-embed-container" style="width: 100%; max-width: 800px; margin: 20px auto;">
  <iframe 
    src="${embedUrl}" 
    width="100%" 
    height="600" 
    frameborder="0" 
    scrolling="auto" 
    allow="clipboard-write" 
    title="${tool?.name} - BAWT Writing Tools"
    style="border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  </iframe>
  <p style="text-align: center; margin-top: 10px; font-size: 12px; color: #6b7280;">
    Powered by <a href="${baseUrl}" target="_blank" style="color: #d60000; text-decoration: none;">BAWT Writing Tools</a>
  </p>
</div>`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation and Dark Mode Toggle - Hidden in embed mode */}
        {!isEmbedMode && (
          <div className="flex flex-col gap-4 mb-6">
            {/* Dark Mode Toggle - Top Right */}
            <div className="flex justify-end">
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

            {/* Tool Navigation - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolChange(tool.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg font-medium transition-all duration-200 text-center min-h-[80px] ${
                    currentTool === tool.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-700'
                  }`}
                  title={tool.name}
                >
                  <span className="text-xl mb-1">{tool.icon}</span>
                  <span className="text-xs leading-tight">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Embed HTML Helper - Only show in non-embed mode, for real tools */}
        {!isEmbedMode && currentTool !== NOT_FOUND && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              🖼️ Complete Embed HTML for {tools.find(t => t.id === currentTool)?.name}:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <code className="flex-1 px-3 py-3 bg-white dark:bg-gray-800 rounded border text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                  {getEmbedCode(currentTool)}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(getEmbedCode(currentTool))}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                  title="Copy complete HTML code to clipboard"
                >
                  📋 Copy HTML
                </button>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p>✨ <strong>Ready to paste! This complete HTML includes:</strong></p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Professional iframe with styling and borders</li>
                  <li>Responsive container that adapts to your site</li>
                  <li>Powered by BAWT attribution link</li>
                  <li>Works in WordPress, HTML pages, and any CMS</li>
                </ul>
                <p className="pt-2"><strong>💡 Usage:</strong> Copy the HTML above and paste directly into your WordPress HTML block, page editor, or website code!</p>
              </div>
            </div>
          </div>
        )}

        {/* Unknown ?tool= value: visible message instead of a silent wrong tool */}
        {currentTool === NOT_FOUND && (
          <div
            className={`flex flex-col items-center justify-center text-center px-4 ${
              isEmbedMode ? 'py-8' : 'py-16'
            }`}
            role="alert"
          >
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tool not found
            </p>
            <a
              href="https://becomeawritertoday.com/tools/"
              className="text-sm text-red-700 dark:text-red-400 underline"
            >
              Browse all tools
            </a>
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

        {currentTool === 'filler-words' && <FillerWordsProcessor />}

        {currentTool === 'conjunction-tool' && <ConjunctionTool />}

        {currentTool === 'female-authors' && <FemaleAuthorsTimeline />}

        {currentTool === 'hard-words-quiz' && <HardWordsSpellingQuiz />}

        {currentTool === 'writing-software-quiz' && <FreeWritingSoftwareQuiz />}

        {currentTool === 'crime-thriller-quiz' && <CrimeThrillerQuiz />}

        {currentTool === 'stephen-king-timeline' && <StephenKingTimeline />}

        {currentTool === 'famous-poems-timeline' && <FamousPoemsTimeline />}

        {currentTool === 'strong-female-character' && <StrongFemaleCharacterGenerator />}

        {currentTool === 'grammarly-roi-calculator' && <GrammarlyROICalculator />}

        {currentTool === 'grammarly-plan-quiz' && <GrammarlyPlanQuiz />}

        {currentTool === 'grammarly-comparison' && <GrammarlyComparisonMatrix />}

        {currentTool === 'report-topics' && <ReportTopicsGenerator />}

        {currentTool === 'grammar-examples' && <GrammarExamplesGenerator />}

        {currentTool === 'poetry-words' && <PoetryWordsGenerator />}

        {currentTool === 'disney-hero-journey' && <DisneyHeroJourneyExplorer />}

        {currentTool === 'writing-quality-scorer' && <WritingQualityScorer />}

        {currentTool === 'random-words' && <RandomWordsGenerator />}

        {currentTool === 'romantic-words' && <RomanticWordsGenerator />}

        {currentTool === 'sad-words' && <SadWordsGenerator />}
        {currentTool === 'contest-finder' && <ContestFinder />}
        {currentTool === 'themed-words' && <ThemedWordGenerator />}
        {currentTool === 'literary-devices' && <LiteraryDeviceDetector />}
        {currentTool === 'root-explorer' && <RootWordExplorer />}
        {currentTool === 'writing-app-finder' && <WritingAppFinder />}
        {currentTool === 'writer-pulse' && <WriterPulse />}
        {currentTool === 'weekly-writing' && <WeeklyWriting />}
        {currentTool === 'concrete-poem-maker' && <ConcretePoemMaker />}
        {currentTool === 'emotion-wheel' && <EmotionWheel />}
        {currentTool === 'dead-word-checker' && <DeadWordChecker />}

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
