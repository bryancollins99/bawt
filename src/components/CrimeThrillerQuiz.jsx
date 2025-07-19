import React, { useState } from 'react';

const CrimeThrillerQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  const questions = [
    {
      id: 1,
      question: "What type of crime thriller atmosphere do you prefer?",
      options: [
        { text: "Dark psychological mind games", value: "psychological" },
        { text: "Fast-paced action and chases", value: "action" },
        { text: "Cozy mysteries with puzzles to solve", value: "cozy" },
        { text: "Gritty police procedurals", value: "procedural" },
        { text: "International espionage and spies", value: "espionage" },
        { text: "Legal thrillers and courtroom drama", value: "legal" }
      ]
    },
    {
      id: 2,
      question: "How much violence and gore can you handle?",
      options: [
        { text: "Bring on the brutal details - I can handle anything", value: "high" },
        { text: "Some violence is okay, but not too graphic", value: "medium" },
        { text: "Minimal violence - focus on the mystery", value: "low" },
        { text: "Clean reads only - no graphic content", value: "none" }
      ]
    },
    {
      id: 3,
      question: "What setting appeals to you most?",
      options: [
        { text: "Big city streets and urban decay", value: "urban" },
        { text: "Small towns with dark secrets", value: "smalltown" },
        { text: "Remote locations and isolated settings", value: "remote" },
        { text: "International locations and exotic places", value: "international" },
        { text: "Historical settings and period pieces", value: "historical" }
      ]
    },
    {
      id: 4,
      question: "Who do you prefer as your main character?",
      options: [
        { text: "Seasoned detective with personal demons", value: "detective" },
        { text: "Amateur sleuth stumbling into mystery", value: "amateur" },
        { text: "Criminal or anti-hero perspective", value: "criminal" },
        { text: "Strong female protagonist", value: "female" },
        { text: "Ensemble cast with multiple viewpoints", value: "ensemble" }
      ]
    },
    {
      id: 5,
      question: "How do you like your pacing?",
      options: [
        { text: "Non-stop action from page one", value: "breakneck" },
        { text: "Steady build with explosive moments", value: "building" },
        { text: "Slow burn with psychological tension", value: "slowburn" },
        { text: "Methodical investigation and clue-gathering", value: "methodical" }
      ]
    },
    {
      id: 6,
      question: "Do you prefer series or standalone books?",
      options: [
        { text: "Long series - I want to follow characters for years", value: "longseries" },
        { text: "Short series - 3-5 books is perfect", value: "shortseries" },
        { text: "Standalone - complete story in one book", value: "standalone" },
        { text: "No preference - good story matters most", value: "nopreference" }
      ]
    },
    {
      id: 7,
      question: "What era do you prefer?",
      options: [
        { text: "Contemporary - set in the last 10 years", value: "contemporary" },
        { text: "Recent past - 1990s to 2010s", value: "recentpast" },
        { text: "Classic period - 1950s to 1980s", value: "classic" },
        { text: "Historical - pre-1950s", value: "historical" },
        { text: "Any time period works for me", value: "any" }
      ]
    },
    {
      id: 8,
      question: "How complex do you like your mysteries?",
      options: [
        { text: "Intricate plots with multiple twists", value: "complex" },
        { text: "Moderately complex with a few surprises", value: "moderate" },
        { text: "Straightforward but well-executed", value: "simple" },
        { text: "Focus on characters over plot complexity", value: "character" }
      ]
    }
  ];

  const crimeBooks = {
    "Gone Girl by Gillian Flynn": {
      description: "A twisted psychological thriller about a marriage gone terribly wrong with unreliable narrators and shocking twists.",
      why_recommended: "Perfect for psychological thriller fans who love complex characters and don't mind dark content",
      genres: ["psychological", "contemporary"],
      violence_level: "medium",
      setting: "urban",
      character_type: "ensemble",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Gone-Girl-Gillian-Flynn/dp/0307588378"
    },
    "The Girl with the Dragon Tattoo by Stieg Larsson": {
      description: "A journalist and a hacker investigate a decades-old disappearance in this Swedish crime thriller.",
      why_recommended: "Ideal for those who enjoy international settings, strong female characters, and methodical investigations",
      genres: ["procedural", "international"],
      violence_level: "high",
      setting: "international",
      character_type: "ensemble",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Girl-Dragon-Tattoo-Millennium/dp/0307949486"
    },
    "The Thursday Murder Club by Richard Osman": {
      description: "Four retirees in a peaceful retirement village meet weekly to investigate cold cases - until they stumble upon a real murder.",
      why_recommended: "Perfect cozy mystery for those who prefer minimal violence and clever puzzle-solving",
      genres: ["cozy", "amateur"],
      violence_level: "low",
      setting: "smalltown",
      character_type: "ensemble",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Thursday-Murder-Club-Richard-Osman/dp/1984880969"
    },
    "The Poet by Michael Connelly": {
      description: "Detective Harry Bosch investigates a serial killer targeting homicide detectives in this gripping police procedural.",
      why_recommended: "Great for fans of gritty detective work and seasoned investigators with personal stakes",
      genres: ["procedural", "detective"],
      violence_level: "medium",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Poet-Harry-Bosch-Michael-Connelly/dp/0446602531"
    },
    "The Firm by John Grisham": {
      description: "A young lawyer discovers his prestigious law firm has dangerous connections to organized crime.",
      why_recommended: "Perfect for legal thriller fans who enjoy corporate conspiracies and high-stakes drama",
      genres: ["legal", "action"],
      violence_level: "medium",
      setting: "urban",
      character_type: "amateur",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Firm-John-Grisham/dp/0440245923"
    },
    "The Maltese Falcon by Dashiell Hammett": {
      description: "Private detective Sam Spade gets caught up in a deadly hunt for a valuable bird statue in classic noir style.",
      why_recommended: "Classic choice for those who appreciate historical settings and complex, morally ambiguous characters",
      genres: ["classic", "detective"],
      violence_level: "medium",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Maltese-Falcon-Dashiell-Hammett/dp/0679722645"
    },
    "The Silent Patient by Alex Michaelides": {
      description: "A psychotherapist becomes obsessed with treating a woman who refuses to speak after allegedly murdering her husband.",
      why_recommended: "Excellent psychological thriller with a stunning twist for those who love character-driven mysteries",
      genres: ["psychological", "character"],
      violence_level: "low",
      setting: "contemporary",
      character_type: "amateur",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Silent-Patient-Alex-Michaelides/dp/1250301696"
    },
    "The Big Sleep by Raymond Chandler": {
      description: "Private investigator Philip Marlowe navigates the seedy underbelly of 1940s Los Angeles.",
      why_recommended: "Classic noir perfect for those who enjoy historical settings and atmospheric detective work",
      genres: ["classic", "detective"],
      violence_level: "medium",
      setting: "historical",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Big-Sleep-Raymond-Chandler/dp/0394758285"
    },
    "In the Woods by Tana French": {
      description: "A detective investigates a child's murder that echoes a traumatic event from his own childhood.",
      why_recommended: "Beautiful literary crime fiction for those who prefer character development and atmospheric writing",
      genres: ["psychological", "character"],
      violence_level: "medium",
      setting: "remote",
      character_type: "detective",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Woods-Tana-French/dp/0143113496"
    },
    "The Hunt for Red October by Tom Clancy": {
      description: "A Soviet submarine captain attempts to defect with his country's most advanced nuclear submarine.",
      why_recommended: "High-tech espionage thriller perfect for action fans who enjoy military and international intrigue",
      genres: ["espionage", "action"],
      violence_level: "medium",
      setting: "international",
      character_type: "ensemble",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Hunt-Red-October-Jack-Ryan/dp/0425240338"
    },
    "Still Life by Louise Penny": {
      description: "Inspector Gamache investigates a murder in the charming Quebec village of Three Pines.",
      why_recommended: "Cozy Canadian mystery series perfect for those who prefer character-driven stories in small town settings",
      genres: ["cozy", "procedural"],
      violence_level: "low",
      setting: "smalltown",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Still-Life-Inspector-Gamache-Novel/dp/0312541562"
    },
    "The Talented Mr. Ripley by Patricia Highsmith": {
      description: "A charming sociopath infiltrates the wealthy lifestyle of an acquaintance with deadly consequences.",
      why_recommended: "Psychological masterpiece told from the criminal's perspective - perfect for those who enjoy morally complex characters",
      genres: ["psychological", "criminal"],
      violence_level: "medium",
      setting: "international",
      character_type: "criminal",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Talented-Mr-Ripley-Patricia-Highsmith/dp/0099282763"
    },
    "And Then There Were None by Agatha Christie": {
      description: "Ten strangers are invited to an island where they're murdered one by one in this classic mystery masterpiece.",
      why_recommended: "Perfect for puzzle lovers who enjoy classic mysteries with ingenious plotting and minimal violence",
      genres: ["cozy", "classic"],
      violence_level: "low",
      setting: "remote",
      character_type: "ensemble",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Then-There-Were-None/dp/0062073486"
    },
    "Mr. Mercedes by Stephen King": {
      description: "A retired detective is taunted by a mass murderer in this psychological cat-and-mouse thriller.",
      why_recommended: "Great for fans of psychological tension and dark themes with a modern, urban setting",
      genres: ["psychological", "contemporary"],
      violence_level: "high",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Mr-Mercedes-Novel-Bill-Hodges/dp/1501114123"
    },
    "Killing Floor by Lee Child": {
      description: "Ex-military policeman Jack Reacher stumbles into a deadly conspiracy in a small Georgia town.",
      why_recommended: "Perfect for action fans who love tough protagonists and fast-paced, violent thrillers",
      genres: ["action", "procedural"],
      violence_level: "high",
      setting: "smalltown",
      character_type: "amateur",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Killing-Floor-Jack-Reacher-Novel/dp/0515141436"
    },
    "Pretty Girls by Karin Slaughter": {
      description: "Two estranged sisters reunite to search for answers about their missing sister in this dark psychological thriller.",
      why_recommended: "Intense psychological thriller perfect for those who can handle graphic content and complex family dynamics",
      genres: ["psychological", "contemporary"],
      violence_level: "high",
      setting: "urban",
      character_type: "amateur",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Pretty-Girls-Novel-Karin-Slaughter/dp/0062429426"
    },
    "Along Came a Spider by James Patterson": {
      description: "Detective Alex Cross hunts a kidnapper who has taken two children from an elite private school.",
      why_recommended: "Fast-paced police procedural ideal for those who enjoy detective work and quick, engaging reads",
      genres: ["procedural", "action"],
      violence_level: "medium",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Along-Came-Spider-Alex-Cross/dp/0446364150"
    },
    "Tell No One by Harlan Coben": {
      description: "A pediatrician receives mysterious emails suggesting his murdered wife might still be alive.",
      why_recommended: "Gripping psychological suspense perfect for those who love twists and emotional depth",
      genres: ["psychological", "contemporary"],
      violence_level: "medium",
      setting: "urban",
      character_type: "amateur",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Tell-No-One-Harlan-Coben/dp/0440245907"
    },
    "The Girl on the Train by Paula Hawkins": {
      description: "A troubled woman becomes entangled in a missing person investigation involving people she observes during her daily commute.",
      why_recommended: "Psychological thriller with unreliable narration - perfect for fans of character-driven mysteries",
      genres: ["psychological", "contemporary"],
      violence_level: "medium",
      setting: "urban",
      character_type: "amateur",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Girl-Train-Paula-Hawkins/dp/1594634025"
    },
    "Knots and Crosses by Ian Rankin": {
      description: "Detective Inspector John Rebus investigates a series of murders in Edinburgh in this gritty Scottish noir.",
      why_recommended: "Dark, atmospheric police procedural ideal for those who enjoy gritty urban crime and complex detectives",
      genres: ["procedural", "international"],
      violence_level: "medium",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Knots-Crosses-Inspector-Rebus-Novel/dp/0312536720"
    },
    "Mystic River by Dennis Lehane": {
      description: "Three childhood friends are reunited when one's daughter is murdered in this dark crime drama.",
      why_recommended: "Literary crime fiction perfect for those who appreciate character development and emotional depth",
      genres: ["psychological", "character"],
      violence_level: "medium",
      setting: "urban",
      character_type: "amateur",
      complexity: "complex",
      amazon_url: "https://www.amazon.com/Mystic-River-Novel-Dennis-Lehane/dp/0062068407"
    },
    "Baltimore Blues by Laura Lippman": {
      description: "Former reporter Tess Monaghan becomes a private investigator and gets caught up in a deadly conspiracy.",
      why_recommended: "Strong female protagonist and investigative journalism elements - great for fans of smart, independent detectives",
      genres: ["procedural", "female"],
      violence_level: "medium",
      setting: "urban",
      character_type: "detective",
      complexity: "moderate",
      amazon_url: "https://www.amazon.com/Baltimore-Blues-Tess-Monaghan-Novel/dp/0380789914"
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const scores = {};
    
    // Initialize scores for all books
    Object.keys(crimeBooks).forEach(book => {
      scores[book] = 0;
    });

    // Score based on answers
    Object.entries(answers).forEach(([questionId, answer]) => {
      Object.entries(crimeBooks).forEach(([bookTitle, book]) => {
        const qId = parseInt(questionId);
        
        switch(qId) {
          case 1: // Genre preference
            if (book.genres.includes(answer)) scores[bookTitle] += 3;
            break;
          case 2: // Violence tolerance
            if (book.violence_level === answer) scores[bookTitle] += 2;
            else if ((answer === 'high' && book.violence_level === 'medium') ||
                     (answer === 'medium' && ['low', 'high'].includes(book.violence_level)) ||
                     (answer === 'low' && book.violence_level === 'none')) {
              scores[bookTitle] += 1;
            }
            break;
          case 3: // Setting
            if (book.setting === answer) scores[bookTitle] += 2;
            break;
          case 4: // Character type
            if (book.character_type === answer) scores[bookTitle] += 2;
            break;
          case 5: // Pacing - mapped to genres
            if ((answer === 'breakneck' && book.genres.includes('action')) ||
                (answer === 'slowburn' && book.genres.includes('psychological')) ||
                (answer === 'methodical' && book.genres.includes('procedural'))) {
              scores[bookTitle] += 2;
            }
            break;
          case 6: // Series preference - all books get some points since preference varies
            scores[bookTitle] += 1;
            break;
          case 7: // Era
            if (book.genres.includes(answer)) scores[bookTitle] += 2;
            break;
          case 8: // Complexity
            if (book.complexity === answer) scores[bookTitle] += 2;
            break;
        }
      });
    });

    // Get top 3 recommendations
    const sortedBooks = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([title]) => title);

    setRecommendedBooks(sortedBooks);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setRecommendedBooks([]);
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            📚 Your Crime Thriller Recommendations
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Based on your preferences, here are some crime thrillers you'll love:
          </p>
        </div>

        <div className="space-y-6">
          {recommendedBooks.map((bookTitle, index) => {
            const book = crimeBooks[bookTitle];
            return (
              <div key={bookTitle} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {bookTitle}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {book.description}
                    </p>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Why this matches you:</strong> {book.why_recommended}
                      </p>
                    </div>
                    
                    <a
                      href={book.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <span>📖</span>
                      <span className="ml-2">Find on Amazon</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🔍 Crime Thriller Book Finder
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Answer 8 quick questions to discover your perfect next crime thriller read
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.value}
                checked={answers[question.id] === option.value}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="mr-3 text-red-600"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {option.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={!answers[question.id]}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Get My Recommendations' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CrimeThrillerQuiz; 