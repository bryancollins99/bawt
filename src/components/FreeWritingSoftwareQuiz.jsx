import React, { useState } from 'react';

const FreeWritingSoftwareQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [recommendedTools, setRecommendedTools] = useState([]);

  const questions = [
    {
      id: 1,
      question: "What type of writing do you primarily do?",
      options: [
        { text: "Novels and creative fiction", value: "fiction" },
        { text: "Blog posts and articles", value: "blogging" },
        { text: "Academic papers and research", value: "academic" },
        { text: "Screenplays and scripts", value: "scripts" },
        { text: "Poetry and short stories", value: "poetry" },
        { text: "Business and professional documents", value: "business" }
      ]
    },
    {
      id: 2,
      question: "How important are advanced formatting and styling features to you?",
      options: [
        { text: "Very important - I need professional formatting", value: "high" },
        { text: "Somewhat important - basic formatting is enough", value: "medium" },
        { text: "Not important - I prefer plain text", value: "low" },
        { text: "I just want to focus on writing without distractions", value: "minimal" }
      ]
    },
    {
      id: 3,
      question: "Do you need to collaborate with others on your writing?",
      options: [
        { text: "Yes, real-time collaboration is essential", value: "realtime" },
        { text: "Occasionally, but not in real-time", value: "occasional" },
        { text: "Rarely, mostly solo work", value: "solo" },
        { text: "Never, I always write alone", value: "never" }
      ]
    },
    {
      id: 4,
      question: "How do you prefer to organize your writing projects?",
      options: [
        { text: "Chapters and scenes with detailed organization", value: "structured" },
        { text: "Simple folders and documents", value: "simple" },
        { text: "Character profiles and plot tracking", value: "detailed" },
        { text: "I don't need much organization", value: "minimal" }
      ]
    },
    {
      id: 5,
      question: "What's your experience level with writing software?",
      options: [
        { text: "Beginner - I want something simple to start", value: "beginner" },
        { text: "Intermediate - I can learn new features", value: "intermediate" },
        { text: "Advanced - I want powerful features", value: "advanced" },
        { text: "Expert - I need professional-grade tools", value: "expert" }
      ]
    },
    {
      id: 6,
      question: "Do you get easily distracted while writing?",
      options: [
        { text: "Yes, I need a distraction-free environment", value: "high" },
        { text: "Sometimes, minimal distractions help", value: "medium" },
        { text: "Not really, I can focus with normal interfaces", value: "low" },
        { text: "I like having multiple tools and features visible", value: "none" }
      ]
    },
    {
      id: 7,
      question: "How important is it to access your writing from anywhere?",
      options: [
        { text: "Critical - I write on multiple devices", value: "critical" },
        { text: "Important - cloud sync is helpful", value: "important" },
        { text: "Nice to have - but not essential", value: "nice" },
        { text: "Not important - I use one computer", value: "local" }
      ]
    },
    {
      id: 8,
      question: "Do you need grammar and spell checking built-in?",
      options: [
        { text: "Yes, comprehensive grammar checking is essential", value: "comprehensive" },
        { text: "Basic spell check is enough", value: "basic" },
        { text: "I use separate tools for editing", value: "external" },
        { text: "I don't worry about this during writing", value: "none" }
      ]
    }
  ];

  const writingTools = {
    "Google Docs": {
      description: "Free cloud-based word processor with excellent collaboration features",
      strengths: ["Real-time collaboration", "Cloud sync", "Voice typing", "Easy sharing", "Works everywhere"],
      ideal_for: ["Blogging", "Business writing", "Collaborative projects"],
      url: "https://docs.google.com",
      score: { collaboration: 10, cloud: 10, simplicity: 8, formatting: 7 }
    },
    "LibreOffice Writer": {
      description: "Full-featured office suite alternative to Microsoft Word",
      strengths: ["Professional formatting", "All document types", "Offline work", "Export to EPUB"],
      ideal_for: ["Business documents", "Academic papers", "Professional writing"],
      url: "https://libreoffice.org",
      score: { formatting: 10, professional: 10, offline: 10, collaboration: 3 }
    },
    "Scrivener (30-day trial)": {
      description: "Professional novel writing software with advanced organization",
      strengths: ["Chapter/scene organization", "Character profiles", "Research tools", "Manuscript formatting"],
      ideal_for: ["Novel writing", "Academic research", "Complex projects"],
      url: "https://scrivener.app",
      score: { organization: 10, fiction: 10, research: 10, simplicity: 4 }
    },
    "FocusWriter": {
      description: "Distraction-free writing environment with customizable themes",
      strengths: ["Full-screen mode", "Customizable themes", "Daily goals", "Typewriter sounds"],
      ideal_for: ["Distracted writers", "Poetry", "Creative writing"],
      url: "https://focuswriter.en.softonic.com",
      score: { distraction_free: 10, simplicity: 9, customization: 8, collaboration: 1 }
    },
    "yWriter": {
      description: "Free novel writing software that organizes your story by chapters and scenes",
      strengths: ["Chapter/scene breakdown", "Character tracking", "Story organization", "Writing goals"],
      ideal_for: ["Novel writing", "Story planning", "Character development"],
      url: "http://spacejock.com/yWriter7.html",
      score: { fiction: 9, organization: 9, simplicity: 7, cloud: 2 }
    },
    "Hemingway Editor": {
      description: "Writing app that makes your writing bold and clear",
      strengths: ["Readability analysis", "Highlights complex sentences", "Writing improvement", "Simple interface"],
      ideal_for: ["Blog writing", "Clear communication", "Editing assistance"],
      url: "https://hemingwayapp.com",
      score: { editing: 10, simplicity: 9, clarity: 10, organization: 3 }
    },
    "Notion": {
      description: "All-in-one workspace for notes, tasks, wikis, and databases",
      strengths: ["Flexible organization", "Templates", "Note-taking", "Project management"],
      ideal_for: ["Organized writers", "Project planning", "Research notes"],
      url: "https://notion.so",
      score: { organization: 9, flexibility: 10, collaboration: 8, simplicity: 5 }
    },
    "WriteMonkey": {
      description: "Distraction-free text editor with markdown support",
      strengths: ["Minimalist interface", "Markdown support", "Plugins", "Typewriter mode"],
      ideal_for: ["Minimalist writers", "Markdown users", "Distraction-free writing"],
      url: "https://writemonkey.com",
      score: { distraction_free: 9, simplicity: 8, markdown: 9, collaboration: 1 }
    },
    "Dropbox Paper": {
      description: "Simple writing tool with multimedia support and collaboration",
      strengths: ["Clean interface", "Multimedia support", "Team collaboration", "Cloud sync"],
      ideal_for: ["Team projects", "Multimedia documents", "Simple collaboration"],
      url: "https://dropbox.com/paper",
      score: { collaboration: 8, simplicity: 8, multimedia: 9, formatting: 6 }
    },
    "Arc Studio Pro": {
      description: "Screenplay writing software with industry-standard formatting",
      strengths: ["Screenplay formatting", "Industry standards", "Collaboration", "Cloud sync"],
      ideal_for: ["Screenwriters", "Script writing", "Film industry"],
      url: "https://arcstudiopro.com",
      score: { scripts: 10, formatting: 9, collaboration: 8, simplicity: 7 }
    }
  };

  const calculateRecommendations = () => {
    const userProfile = {
      writingType: answers[1],
      formatting: answers[2],
      collaboration: answers[3],
      organization: answers[4],
      experience: answers[5],
      distraction: answers[6],
      mobility: answers[7],
      grammar: answers[8]
    };

    const recommendations = [];

    Object.entries(writingTools).forEach(([name, tool]) => {
      let score = 0;
      let reasons = [];

      // Writing type matching
      if (userProfile.writingType === 'fiction' && (name.includes('Scrivener') || name.includes('yWriter'))) {
        score += 25;
        reasons.push("Excellent for novel organization");
      }
      if (userProfile.writingType === 'blogging' && (name === 'Google Docs' || name === 'Hemingway Editor')) {
        score += 25;
        reasons.push("Perfect for blog writing");
      }
      if (userProfile.writingType === 'scripts' && name === 'Arc Studio Pro') {
        score += 30;
        reasons.push("Industry standard for screenwriting");
      }
      if (userProfile.writingType === 'academic' && name === 'LibreOffice Writer') {
        score += 25;
        reasons.push("Professional formatting for academic work");
      }
      if (userProfile.writingType === 'business' && (name === 'Google Docs' || name === 'LibreOffice Writer')) {
        score += 20;
        reasons.push("Great for business documents");
      }

      // Collaboration needs
      if (userProfile.collaboration === 'realtime' && name === 'Google Docs') {
        score += 20;
        reasons.push("Best real-time collaboration");
      }
      if (userProfile.collaboration === 'solo' && (name === 'FocusWriter' || name === 'WriteMonkey')) {
        score += 15;
        reasons.push("Perfect for solo writing");
      }

      // Distraction level
      if (userProfile.distraction === 'high' && (name === 'FocusWriter' || name === 'WriteMonkey')) {
        score += 20;
        reasons.push("Distraction-free environment");
      }
      if (userProfile.distraction === 'none' && (name === 'Notion' || name === 'LibreOffice Writer')) {
        score += 15;
        reasons.push("Feature-rich interface");
      }

      // Cloud/mobility needs
      if (userProfile.mobility === 'critical' && (name === 'Google Docs' || name === 'Notion')) {
        score += 15;
        reasons.push("Excellent cloud sync");
      }
      if (userProfile.mobility === 'local' && (name === 'LibreOffice Writer' || name === 'FocusWriter')) {
        score += 10;
        reasons.push("Great offline capabilities");
      }

      // Experience level
      if (userProfile.experience === 'beginner' && (name === 'Google Docs' || name === 'FocusWriter')) {
        score += 15;
        reasons.push("Easy to learn");
      }
      if (userProfile.experience === 'advanced' && (name.includes('Scrivener') || name === 'Notion')) {
        score += 15;
        reasons.push("Powerful advanced features");
      }

      // Organization needs
      if (userProfile.organization === 'structured' && (name.includes('Scrivener') || name === 'yWriter')) {
        score += 20;
        reasons.push("Excellent project organization");
      }
      if (userProfile.organization === 'minimal' && (name === 'FocusWriter' || name === 'WriteMonkey')) {
        score += 15;
        reasons.push("Simple, uncluttered approach");
      }

      // Grammar checking
      if (userProfile.grammar === 'comprehensive' && name === 'Hemingway Editor') {
        score += 15;
        reasons.push("Built-in writing improvement");
      }
      if (userProfile.grammar === 'none' && (name === 'FocusWriter' || name === 'WriteMonkey')) {
        score += 10;
        reasons.push("Focus on writing, not editing");
      }

      // Add base score for popular tools
      if (name === 'Google Docs') score += 10;
      if (name === 'LibreOffice Writer') score += 8;
      if (name.includes('Scrivener')) score += 5;

      if (score > 0) {
        recommendations.push({
          name,
          tool,
          score,
          reasons: reasons.slice(0, 3) // Top 3 reasons
        });
      }
    });

    // Sort by score and take top 4
    recommendations.sort((a, b) => b.score - a.score);
    setRecommendedTools(recommendations.slice(0, 4));
    setShowResults(true);
  };

  const handleAnswerSelect = (questionIndex, answerValue) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerValue
    });
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setRecommendedTools([]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateRecommendations();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🎯 Your Personalized Recommendations
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Based on your answers, here are the best free writing tools for your needs:
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {recommendedTools.map((rec, index) => (
            <div key={rec.name} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {rec.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm font-medium text-blue-800 dark:text-blue-200">
                        {rec.score}% match
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href={rec.tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Try It Free
                </a>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {rec.tool.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    ✨ Key Strengths:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {rec.tool.strengths.map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    🎯 Why It's Perfect for You:
                  </h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    {rec.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Best for:</strong> {rec.tool.ideal_for.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Take Quiz Again
          </button>
          
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
              {' '}for detailed reviews and more free writing tools!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔍 Find Your Perfect Writing Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Answer a few questions to discover the best free writing software for your specific needs
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
              onClick={() => handleAnswerSelect(currentQuestion + 1, option.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQuestion + 1] === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="font-medium mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option.text}
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
          disabled={answers[currentQuestion + 1] === undefined}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            answers[currentQuestion + 1] === undefined
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : currentQuestion === questions.length - 1
              ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {currentQuestion === questions.length - 1 ? 'Get My Recommendations' : 'Next'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🎯 <strong>Goal:</strong> This quiz analyzes your writing style, preferences, and needs to recommend 
          the perfect free writing software from expert-curated sources.
        </p>
      </div>
    </div>
  );
};

export default FreeWritingSoftwareQuiz; 