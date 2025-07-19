import React, { useState } from 'react';

const FreeWritingSoftwareQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      question: "Which free writing software is described as 'the Swiss Army Knife of ebook formatting tools'?",
      options: ["Calibre", "Scrivener", "Google Docs", "LibreOffice"],
      correct: 0,
      explanation: "Calibre is often called the Swiss Army Knife of ebook formatting tools because of its versatility in converting and editing ebook formats."
    },
    {
      id: 2,
      question: "What is the main advantage of using Hemingway Editor?",
      options: ["Grammar checking", "Readability improvement", "Citation management", "Voice recording"],
      correct: 1,
      explanation: "Hemingway Editor focuses on improving readability by highlighting complex sentences, passive voice, and suggesting simpler alternatives."
    },
    {
      id: 3,
      question: "Which writing software offers a generous 30-day trial that only counts days you actually use it?",
      options: ["Ulysses", "Scrivener", "Final Draft", "WriterDuet"],
      correct: 1,
      explanation: "Scrivener offers a 30-day trial that counts only the days you actually open and use the software, potentially lasting months for weekend writers."
    },
    {
      id: 4,
      question: "What makes FocusWriter particularly useful for distracted writers?",
      options: ["Advanced grammar checking", "Cloud synchronization", "Full-screen hide-away interface", "Collaboration features"],
      correct: 2,
      explanation: "FocusWriter uses a full-screen hide-away interface that removes all distractions, letting you focus entirely on your writing."
    },
    {
      id: 5,
      question: "Which free app is specifically designed to help overcome writer's block by providing related words?",
      options: ["OneLook", "Grammarly", "ProWritingAid", "Evernote"],
      correct: 0,
      explanation: "OneLook lets you describe a concept and get back related words and phrases, making it perfect for overcoming writer's block."
    },
    {
      id: 6,
      question: "What unique feature does yWriter offer for organizing novels?",
      options: ["Voice dictation", "Breaking novels into chapters and scenes", "Real-time collaboration", "Automatic backup"],
      correct: 1,
      explanation: "yWriter breaks your novel into chapters and scenes, helping you keep track of your work while leaving your mind free to create."
    },
    {
      id: 7,
      question: "Which Google tool offers voice typing dictation for hands-free writing?",
      options: ["Google Keep", "Google Docs", "Google Drive", "Google Slides"],
      correct: 1,
      explanation: "Google Docs includes Google Voice Typing, allowing you to dictate your writing hands-free with impressive accuracy."
    },
    {
      id: 8,
      question: "What is the main purpose of The Most Dangerous Writing App?",
      options: ["Grammar correction", "Overcome writer's block", "Format manuscripts", "Track word count"],
      correct: 1,
      explanation: "The Most Dangerous Writing App forces you to keep writing continuously - if you stop for more than 5 seconds, you lose everything, helping overcome writer's block."
    },
    {
      id: 9,
      question: "Which writing software is specifically designed for screenwriters and offers free basic features?",
      options: ["WriterDuet", "Arc Studio Pro", "Celtx", "Highland"],
      correct: 1,
      explanation: "Arc Studio Pro offers basic screenplay formatting features for free, making it accessible for new screenwriters."
    },
    {
      id: 10,
      question: "What makes Notion particularly versatile for writers?",
      options: ["Only for note-taking", "Workspace management with templates", "Grammar checking only", "PDF export only"],
      correct: 1,
      explanation: "Notion is a cross-platform workspace that can manage projects, notes, goals, and writing with numerous templates available."
    },
    {
      id: 11,
      question: "Which free office suite is particularly popular with government offices and businesses?",
      options: ["OpenOffice", "LibreOffice", "WPS Office", "SoftMaker"],
      correct: 1,
      explanation: "LibreOffice has become very popular with government offices, businesses, and corporate organizations as a free Microsoft Office alternative."
    },
    {
      id: 12,
      question: "What is Bibisco particularly well-suited for?",
      options: ["Blog writing", "Academic papers", "Novel planning and world building", "Poetry"],
      correct: 2,
      explanation: "Bibisco is novel writing software that excels at planning and world building, with a unique approach for authors who spend time developing their stories."
    },
    {
      id: 13,
      question: "Which tool helps writers identify and remove clichéd phrases from their writing?",
      options: ["Cliché Finder", "Grammarly", "ProWritingAid", "Hemingway"],
      correct: 0,
      explanation: "Cliché Finder is specifically designed to highlight clichéd phrases in your text so you can replace them with more original language."
    },
    {
      id: 14,
      question: "What makes WriteMonkey appealing to minimalist writers?",
      options: ["Complex interface", "Stripped-down, distraction-free design", "Advanced formatting", "Multiple windows"],
      correct: 1,
      explanation: "WriteMonkey offers a stripped-down, distraction-free writing environment perfect for minimalist writers who want to focus on content."
    },
    {
      id: 15,
      question: "Which free tool can transcribe audio files into written text?",
      options: ["oTranscribe", "Otter", "Dragon", "Speechmatics"],
      correct: 0,
      explanation: "oTranscribe is a simple, free tool that transcribes audio files or YouTube videos into written text, perfect for interviews and research."
    }
  ];

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "🎉 Excellent! You're a free writing software expert!";
    if (percentage >= 80) return "🌟 Great job! You know your free writing tools well!";
    if (percentage >= 70) return "👍 Good work! You have solid knowledge of writing software.";
    if (percentage >= 60) return "📝 Not bad! Consider exploring more free writing tools.";
    return "📚 Time to discover the amazing world of free writing software!";
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Quiz Results
          </h2>
          <div className="text-6xl mb-4">
            {score >= questions.length * 0.8 ? '🎉' : score >= questions.length * 0.6 ? '👍' : '📚'}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            You scored {score} out of {questions.length}
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-6">
            {getScoreMessage()}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                Question {index + 1}: {question.question}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-2 rounded border ${
                      optionIndex === question.correct
                        ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : selectedAnswers[index] === optionIndex
                        ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {optionIndex === question.correct && '✓ '}
                    {selectedAnswers[index] === optionIndex && optionIndex !== question.correct && '✗ '}
                    {option}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Take Quiz Again
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 Want to Learn More?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Check out the comprehensive guide at{' '}
              <a 
                href="https://becomeawritertoday.com/best-free-writing-software/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                BecomeAWriterToday.com
              </a>
              {' '}to discover even more free writing tools and detailed reviews!
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              ✨ Bonus: Premium Writing Tool
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400 mb-3">
              Ready to level up your writing? Get an exclusive discount on Grammarly Premium for advanced grammar checking.
            </p>
            <a 
              href="https://discount.grammarly.com/api/discounts/HOjwmv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              🎯 Get Grammarly Discount
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Free Writing Software Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Test your knowledge of the best free writing tools available today!
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {questions[currentQuestion].question}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
          }`}
        >
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedAnswers[currentQuestion] === undefined
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : currentQuestion === questions.length - 1
              ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 <strong>Tip:</strong> This quiz covers free writing software from sources including 
          BecomeAWriterToday.com, JustPublishingAdvice.com, and other expert writing resources.
        </p>
      </div>
    </div>
  );
};

export default FreeWritingSoftwareQuiz; 