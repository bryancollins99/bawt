import { useState } from 'react';

const GrammarlyPlanQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const questions = [
    {
      id: 'userType',
      question: "What best describes you?",
      icon: "👨‍💼",
      options: [
        { value: 'student', label: 'Student', description: 'Essays, papers, assignments', points: { budget: 1, features: 2 } },
        { value: 'professional', label: 'Business Professional', description: 'Emails, reports, presentations', points: { budget: 3, features: 3 } },
        { value: 'author', label: 'Author/Writer', description: 'Books, articles, creative writing', points: { budget: 4, features: 4 } },
        { value: 'freelancer', label: 'Freelancer', description: 'Client work, marketing copy', points: { budget: 3, features: 4 } },
        { value: 'academic', label: 'Academic/Researcher', description: 'Research papers, publications', points: { budget: 2, features: 4 } }
      ]
    },
    {
      id: 'writingFrequency',
      question: "How often do you write?",
      icon: "📝",
      options: [
        { value: 'occasional', label: 'Occasionally', description: 'Few times per month', points: { budget: 1, features: 1 } },
        { value: 'weekly', label: 'Weekly', description: 'Several times per week', points: { budget: 2, features: 2 } },
        { value: 'daily', label: 'Daily', description: 'Every day for work/school', points: { budget: 3, features: 3 } },
        { value: 'intensive', label: 'Intensive', description: 'Multiple hours daily', points: { budget: 4, features: 4 } }
      ]
    },
    {
      id: 'writingVolume',
      question: "How much do you typically write per session?",
      icon: "📄",
      options: [
        { value: 'short', label: 'Short pieces', description: 'Emails, social posts (< 500 words)', points: { budget: 1, features: 2 } },
        { value: 'medium', label: 'Medium pieces', description: 'Articles, reports (500-2000 words)', points: { budget: 2, features: 3 } },
        { value: 'long', label: 'Long pieces', description: 'Papers, chapters (2000+ words)', points: { budget: 3, features: 4 } },
        { value: 'books', label: 'Book-length', description: 'Books, dissertations (10,000+ words)', points: { budget: 4, features: 4 } }
      ]
    },
    {
      id: 'budget',
      question: "What's your monthly budget for writing tools?",
      icon: "💰",
      options: [
        { value: 'free', label: 'Free only', description: 'I prefer free tools', points: { budget: 0, features: 1 } },
        { value: 'low', label: 'Under $15/month', description: 'Looking for good value', points: { budget: 1, features: 2 } },
        { value: 'medium', label: '$15-25/month', description: 'Worth it for quality', points: { budget: 2, features: 3 } },
        { value: 'high', label: '$25+/month', description: 'Best tools at any cost', points: { budget: 4, features: 4 } }
      ]
    },
    {
      id: 'priority',
      question: "What's your top priority in a writing tool?",
      icon: "🎯",
      options: [
        { value: 'grammar', label: 'Grammar & Spelling', description: 'Catch basic errors', points: { budget: 1, features: 2 } },
        { value: 'style', label: 'Writing Style', description: 'Improve clarity and flow', points: { budget: 2, features: 3 } },
        { value: 'tone', label: 'Tone & Voice', description: 'Match audience expectations', points: { budget: 3, features: 4 } },
        { value: 'advanced', label: 'Advanced Features', description: 'Plagiarism, citations, AI assistance', points: { budget: 4, features: 4 } }
      ]
    },
    {
      id: 'experience',
      question: "How would you rate your writing experience?",
      icon: "⭐",
      options: [
        { value: 'beginner', label: 'Beginner', description: 'Still learning the basics', points: { budget: 1, features: 3 } },
        { value: 'intermediate', label: 'Intermediate', description: 'Comfortable but want to improve', points: { budget: 2, features: 3 } },
        { value: 'advanced', label: 'Advanced', description: 'Strong writer, need efficiency', points: { budget: 3, features: 4 } },
        { value: 'expert', label: 'Expert', description: 'Professional writer', points: { budget: 4, features: 4 } }
      ]
    }
  ];

  const plans = {
    free: {
      name: 'Grammarly Free',
      price: 0,
      discount: 0,
      features: [
        'Basic grammar and spelling checks',
        'Limited punctuation suggestions',
        'Basic writing suggestions'
      ],
      limitations: [
        'No advanced suggestions',
        'No tone detection',
        'No plagiarism checker'
      ],
      bestFor: 'Casual writers who need basic error checking',
      cta: 'Start Free'
    },
    pro: {
      name: 'Grammarly Pro',
      price: 12,
      discount: 30,
      originalPrice: 29.95,
      features: [
        'Everything in Free',
        'Advanced grammar and punctuation',
        'Clarity and conciseness suggestions',
        'Tone detection and adjustments',
        'Vocabulary enhancement',
        'Plagiarism checker',
        'Full-sentence rewrites',
        'Genre-specific writing style checks'
      ],
      limitations: [],
      bestFor: 'Serious writers who want comprehensive assistance',
      cta: 'Get 30% Off Pro'
    },
    business: {
      name: 'Grammarly Business',
      price: 15,
      discount: 25,
      originalPrice: 25,
      features: [
        'Everything in Pro',
        'Team management features',
        'Brand tone guidelines',
        'Analytics dashboard',
        'SAML single sign-on',
        'Priority customer support'
      ],
      limitations: [],
      bestFor: 'Teams and businesses needing collaboration',
      cta: 'Try Business Plan'
    }
  };

  const calculateRecommendation = () => {
    let budgetScore = 0;
    let featureScore = 0;

    Object.values(answers).forEach(answer => {
      const option = questions.find(q => 
        q.options.find(opt => opt.value === answer)
      )?.options.find(opt => opt.value === answer);
      
      if (option) {
        budgetScore += option.points.budget;
        featureScore += option.points.features;
      }
    });

    // Recommendation logic
    if (answers.budget === 'free' || (budgetScore <= 8 && featureScore <= 12)) {
      return 'free';
    } else if (answers.userType === 'student' && budgetScore <= 12) {
      return 'pro';
    } else if (answers.userType === 'professional' && answers.writingFrequency === 'intensive') {
      return 'business';
    } else if (budgetScore >= 15 || featureScore >= 18) {
      return 'business';
    } else {
      return 'pro';
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setQuizStarted(false);
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 Grammarly Plan Finder Quiz
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Not sure which Grammarly plan is right for you? Take our 2-minute quiz to get a personalized recommendation with the best available discount!
          </p>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-4">What You'll Get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold">Personalized Recommendation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get the plan that matches your exact needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold">Best Available Discount</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Up to 30% off your recommended plan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-semibold">Quick & Easy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Just 6 questions, 2 minutes total</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const recommendedPlan = calculateRecommendation();
    const plan = plans[recommendedPlan];

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🎉 Your Perfect Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Based on your answers, we recommend:
          </p>
        </div>

        {/* Recommended Plan */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-8 border-2 border-green-200 dark:border-green-800">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
              {plan.name}
            </h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {plan.price === 0 ? 'Free' : (
                <>
                  ${plan.price}/month
                  {plan.discount > 0 && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ${plan.originalPrice}
                    </span>
                  )}
                </>
              )}
            </div>
            {plan.discount > 0 && (
              <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {plan.discount}% OFF
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-700 dark:text-green-300">
                ✅ What's Included:
              </h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">
                🎯 Perfect For:
              </h3>
              <p className="text-sm mb-4">{plan.bestFor}</p>
              
              {plan.limitations.length > 0 && (
                <>
                  <h4 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">
                    Limitations:
                  </h4>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-start space-x-2">
                        <span>•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all mb-4">
              {plan.cta} →
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plan.discount > 0 && `Save ${plan.discount}% • `}
              30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">Other Options to Consider:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plans).filter(([key]) => key !== recommendedPlan).map(([key, altPlan]) => (
              <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold">{altPlan.name}</h4>
                  <div className="text-right">
                    <div className="font-bold">
                      {altPlan.price === 0 ? 'Free' : `$${altPlan.price}/mo`}
                    </div>
                    {altPlan.discount > 0 && (
                      <div className="text-xs text-green-600">{altPlan.discount}% off</div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {altPlan.bestFor}
                </p>
                <button className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your Answers Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-4">📋 Your Answers:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {questions.map((question, index) => {
              const answer = answers[question.id];
              const option = question.options.find(opt => opt.value === answer);
              return (
                <div key={question.id} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{question.question}</span>
                  <span className="font-medium">{option?.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={restartQuiz}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mr-4"
          >
            Take Quiz Again
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Compare All Plans
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{question.icon}</div>
        <h2 className="text-3xl font-bold mb-4">{question.question}</h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(question.id, option.value)}
            className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 
                     hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
          >
            <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {option.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        
        <button
          onClick={restartQuiz}
          className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default GrammarlyPlanQuiz; 