import { useState, useEffect, useCallback } from 'react';

const HardWordsSpellingQuiz = () => {
  const [currentMode, setCurrentMode] = useState('study');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [correctWords, setCorrectWords] = useState([]);
  const [incorrectWords, setIncorrectWords] = useState([]);

  // Hard words data from Become a Writer Today
  const hardWords = [
    // Double Consonants
    { word: "accommodate", definition: "to provide lodging or sufficient space for", category: "double-consonants", difficulty: "hard" },
    { word: "balloon", definition: "a brightly colored rubber sac inflated with air", category: "double-consonants", difficulty: "medium" },
    { word: "broccoli", definition: "a green vegetable with a tree-like appearance", category: "double-consonants", difficulty: "medium" },
    { word: "coolly", definition: "in a calm and controlled manner", category: "double-consonants", difficulty: "hard" },
    { word: "deterrence", definition: "the action of discouraging an action through instilling doubt", category: "double-consonants", difficulty: "hard" },
    { word: "difference", definition: "a point or way in which people or things are not the same", category: "double-consonants", difficulty: "medium" },
    { word: "dissipate", definition: "to disperse or scatter", category: "double-consonants", difficulty: "hard" },
    { word: "dumbbell", definition: "a weight used for exercise", category: "double-consonants", difficulty: "medium" },
    { word: "embarrass", definition: "to cause someone to feel awkward or ashamed", category: "double-consonants", difficulty: "medium" },
    { word: "finally", definition: "after a long time or some delay", category: "double-consonants", difficulty: "easy" },
    { word: "fulfill", definition: "to achieve or realize something desired or promised", category: "double-consonants", difficulty: "medium" },
    { word: "generally", definition: "in most cases; usually", category: "double-consonants", difficulty: "medium" },
    { word: "harass", definition: "to subject someone to aggressive pressure or intimidation", category: "double-consonants", difficulty: "medium" },
    { word: "magically", definition: "in a magical manner; as if by magic", category: "double-consonants", difficulty: "medium" },
    { word: "millennium", definition: "a period of one thousand years", category: "double-consonants", difficulty: "hard" },
    { word: "misspell", definition: "to spell a word incorrectly", category: "double-consonants", difficulty: "medium" },
    { word: "necessary", definition: "required to be done or present; essential", category: "double-consonants", difficulty: "medium" },
    { word: "occasion", definition: "a particular time or instance of an event", category: "double-consonants", difficulty: "medium" },
    { word: "occurrence", definition: "an instance or event of something happening", category: "double-consonants", difficulty: "hard" },
    { word: "parallel", definition: "side by side and having the same distance continuously between them", category: "double-consonants", difficulty: "hard" },
    { word: "personnel", definition: "people employed in an organization", category: "double-consonants", difficulty: "medium" },
    { word: "possession", definition: "the state of having, owning, or controlling something", category: "double-consonants", difficulty: "medium" },
    { word: "occasionally", definition: "at infrequent or irregular intervals", category: "double-consonants", difficulty: "medium" },
    { word: "questionnaire", definition: "a set of questions for obtaining information", category: "double-consonants", difficulty: "hard" },
    { word: "sheriff", definition: "an elected officer in a county", category: "double-consonants", difficulty: "medium" },
    { word: "success", definition: "the accomplishment of an aim or purpose", category: "double-consonants", difficulty: "easy" },

    // Silent Letters
    { word: "ascent", definition: "a climb or walk to the summit of a mountain", category: "silent-letters", difficulty: "medium" },
    { word: "chaos", definition: "complete disorder and confusion", category: "silent-letters", difficulty: "medium" },
    { word: "charisma", definition: "compelling attractiveness that inspires devotion", category: "silent-letters", difficulty: "hard" },
    { word: "choreography", definition: "the sequence of steps and movements in dance", category: "silent-letters", difficulty: "hard" },
    { word: "cologne", definition: "a scented liquid made of alcohol and fragrant oils", category: "silent-letters", difficulty: "medium" },
    { word: "condemn", definition: "to express disapproval or impose a penalty", category: "silent-letters", difficulty: "medium" },
    { word: "conscience", definition: "an inner feeling acting as a guide to right and wrong", category: "silent-letters", difficulty: "hard" },
    { word: "conscious", definition: "aware of and responding to one's surroundings", category: "silent-letters", difficulty: "medium" },
    { word: "florescent", definition: "giving off light; luminescent", category: "silent-letters", difficulty: "hard" },
    { word: "foreign", definition: "of or from a country other than one's own", category: "silent-letters", difficulty: "medium" },
    { word: "handkerchief", definition: "a square piece of cloth for wiping the nose", category: "silent-letters", difficulty: "hard" },
    { word: "herbs", definition: "plants used for flavoring, food, or medicine", category: "silent-letters", difficulty: "medium" },
    { word: "receipt", definition: "a written acknowledgment of payment received", category: "silent-letters", difficulty: "medium" },
    { word: "salmon", definition: "a large fish that swims upstream to spawn", category: "silent-letters", difficulty: "medium" },
    { word: "silhouette", definition: "the dark shape and outline of someone or something", category: "silent-letters", difficulty: "hard" },
    { word: "solemn", definition: "formal and dignified; serious", category: "silent-letters", difficulty: "medium" },
    { word: "thorough", definition: "complete with regard to every detail", category: "silent-letters", difficulty: "medium" },
    { word: "wednesday", definition: "the day of the week before Thursday", category: "silent-letters", difficulty: "easy" },

    // Unusual Words
    { word: "archetype", definition: "a very typical example of a certain person or thing", category: "unusual", difficulty: "hard" },
    { word: "camaraderie", definition: "mutual trust and friendship among people", category: "unusual", difficulty: "hard" },
    { word: "disingenuous", definition: "not candid or sincere, typically by pretending ignorance", category: "unusual", difficulty: "hard" },
    { word: "malleable", definition: "able to be hammered or pressed permanently out of shape", category: "unusual", difficulty: "hard" },
    { word: "tangential", definition: "relating to or along a tangent; divergent", category: "unusual", difficulty: "hard" },
    { word: "zephyr", definition: "a soft gentle breeze", category: "unusual", difficulty: "hard" }
  ];

  const categories = [
    { id: 'all', name: 'All Words', icon: '📚' },
    { id: 'double-consonants', name: 'Double Consonants', icon: '📝' },
    { id: 'silent-letters', name: 'Silent Letters', icon: '🤫' },
    { id: 'unusual', name: 'Unusual Words', icon: '🌟' }
  ];

  const modes = [
    { id: 'study', name: 'Study Mode', icon: '📖', description: 'Learn words with definitions' },
    { id: 'quick-quiz', name: 'Quick Quiz', icon: '⚡', description: '10 random words' },
    { id: 'speed-challenge', name: 'Speed Challenge', icon: '🏃‍♂️', description: '60 seconds timer' },
    { id: 'category-focus', name: 'Category Focus', icon: '🎯', description: 'Practice specific categories' }
  ];

  // Filter words by category
  const getFilteredWords = () => {
    if (selectedCategory === 'all') return hardWords;
    return hardWords.filter(word => word.category === selectedCategory);
  };

  const currentWords = getFilteredWords();
  const currentWord = currentWords[currentWordIndex] || hardWords[0];

  // Timer effect for speed challenge
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endQuiz();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const startQuiz = (mode) => {
    setCurrentMode(mode);
    setQuizStarted(true);
    setCurrentWordIndex(0);
    setScore(0);
    setAttempts(0);
    setCorrectWords([]);
    setIncorrectWords([]);
    setUserInput('');
    setFeedback('');
    setShowDefinition(mode === 'study');
    setShowHint(false);
    
    if (mode === 'speed-challenge') {
      setTimeLeft(60);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  };

  const endQuiz = () => {
    setQuizStarted(false);
    setIsTimerActive(false);
    setShowDefinition(false);
    setShowHint(false);
  };

  const checkSpelling = () => {
    const userAnswer = userInput.toLowerCase().trim();
    const correctAnswer = currentWord.word.toLowerCase();
    
    setAttempts(prev => prev + 1);
    
    if (userAnswer === correctAnswer) {
      setScore(prev => prev + 1);
      setCorrectWords(prev => [...prev, currentWord.word]);
      setFeedback('✅ Correct! Well done!');
      setTimeout(nextWord, 1500);
    } else {
      setIncorrectWords(prev => [...prev, currentWord.word]);
      setFeedback(`❌ Incorrect. The correct spelling is: ${currentWord.word}`);
    }
  };

  const nextWord = () => {
    if (currentMode === 'quick-quiz' && attempts >= 10) {
      endQuiz();
      return;
    }
    
    const nextIndex = (currentWordIndex + 1) % currentWords.length;
    setCurrentWordIndex(nextIndex);
    setUserInput('');
    setFeedback('');
    setShowHint(false);
    
    if (currentMode !== 'study') {
      setShowDefinition(false);
    }
  };

  const getHint = () => {
    const word = currentWord.word;
    const firstLetter = word.charAt(0).toUpperCase();
    const length = word.length;
    const category = currentWord.category.replace('-', ' ');
    return `Starts with "${firstLetter}", ${length} letters long, Category: ${category}`;
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentWordIndex(0);
    setUserInput('');
    setScore(0);
    setAttempts(0);
    setFeedback('');
    setShowDefinition(false);
    setShowHint(false);
    setIsTimerActive(false);
    setCorrectWords([]);
    setIncorrectWords([]);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📝 Hard Words Spelling Quiz
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master the 50 trickiest words that trip up writers regularly. Based on content from 
            <a href="https://becomeawritertoday.com/list-of-hard-words-to-spell/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              Become a Writer Today
            </a>
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Choose a Category:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.id === 'all' ? hardWords.length : hardWords.filter(w => w.category === category.id).length} words
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => startQuiz(mode.id)}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 
                       transition-all duration-200 text-left hover:shadow-lg
                       bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">{mode.icon}</span>
                <h3 className="text-xl font-bold">{mode.name}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{mode.description}</p>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Tip: Each word includes pronunciation, definition, and hints to help you learn!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header with Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{modes.find(m => m.id === currentMode)?.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Category: {categories.find(c => c.id === selectedCategory)?.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">Score: {score}/{attempts}</div>
          {currentMode === 'speed-challenge' && (
            <div className="text-lg font-bold text-red-600">⏰ {timeLeft}s</div>
          )}
          {currentMode === 'quick-quiz' && (
            <div className="text-sm text-gray-500">Question {attempts + 1}/10</div>
          )}
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                    rounded-xl p-8 mb-6 text-center border border-blue-200 dark:border-blue-800">
        
        {/* Definition */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Spell this word:</h3>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            "{currentWord.definition}"
          </p>
          
          {/* Pronunciation Button */}
          <button
            onClick={speakWord}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔊 Hear Pronunciation
          </button>
        </div>

        {/* Show Definition Toggle */}
        {currentMode !== 'study' && (
          <div className="mb-4">
            <button
              onClick={() => setShowDefinition(!showDefinition)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-2"
            >
              {showDefinition ? '👁️ Hide' : '👁️ Show'} Definition
            </button>
            
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              💡 {showHint ? 'Hide' : 'Get'} Hint
            </button>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 Hint: {getHint()}
            </p>
          </div>
        )}

        {/* Input */}
        <div className="mb-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userInput && checkSpelling()}
            placeholder="Type the word here..."
            className="w-full max-w-md px-4 py-3 text-xl text-center rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Check Button */}
        <button
          onClick={checkSpelling}
          disabled={!userInput.trim()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
        >
          ✓ Check Spelling
        </button>

        {/* Feedback */}
        {feedback && (
          <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-lg">{feedback}</p>
            {feedback.includes('Incorrect') && (
              <button
                onClick={nextWord}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Word →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={nextWord}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Skip Word →
        </button>
        
        <button
          onClick={resetQuiz}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🏠 Main Menu
        </button>
        
        <button
          onClick={endQuiz}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          End Quiz
        </button>
      </div>

      {/* Progress */}
      {(correctWords.length > 0 || incorrectWords.length > 0) && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Progress Summary:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {correctWords.length > 0 && (
              <div>
                <p className="text-green-600 font-medium">✅ Correct ({correctWords.length}):</p>
                <p className="text-gray-600 dark:text-gray-400">{correctWords.join(', ')}</p>
              </div>
            )}
            {incorrectWords.length > 0 && (
              <div>
                <p className="text-red-600 font-medium">❌ Need Practice ({incorrectWords.length}):</p>
                <p className="text-gray-600 dark:text-gray-400">{incorrectWords.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HardWordsSpellingQuiz; 