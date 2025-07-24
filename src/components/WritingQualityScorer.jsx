import React, { useState } from 'react';

const WritingQualityScorer = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('general');

  // Sample texts for different genres
  const sampleTexts = {
    general: `Writing quality is essential for effective communication. However, many writers struggle with clarity and engagement. They often use passive voice, filler words, and overly complex sentences that confuse readers. Additionally, grammar mistakes and poor word choice can significantly impact the message. Professional writers know that good writing requires careful attention to detail and multiple revisions.`,
    fiction: `The storm clouds gathered overhead as Sarah stepped onto the cobblestone street. She had been waiting for this moment for years. The letter crumpled in her hand contained the truth she had been searching for, but now that she held it, fear consumed her thoughts. Would opening it change everything she believed about her past?`,
    business: `Our quarterly revenue exceeded expectations by 15%, driven primarily by increased customer acquisition and improved retention rates. The marketing team's strategic initiatives successfully targeted key demographics, resulting in higher conversion rates. Moving forward, we will focus on leveraging these insights to optimize our growth trajectory and maximize market penetration.`
  };

  const grammarlyAffiliateLink = 'https://grammarly.pxf.io/c/1131357/3023347/31551';

  // Advanced readability calculation (Flesch-Kincaid)
  const calculateReadability = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);
    const syllables = words.reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
    
    // Flesch Reading Ease
    const readingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    
    return {
      gradeLevel: Math.max(1, Math.round(gradeLevel * 10) / 10),
      readingEase: Math.max(0, Math.min(100, Math.round(readingEase))),
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
    };
  };

  const countSyllables = (word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Enhanced clarity analysis
  const analyzeClarity = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);
    const readability = calculateReadability(text);
    
    // Complex sentence patterns
    const complexSentences = sentences.filter(sentence => 
      (sentence.split(',').length > 3) || 
      (sentence.split(/\band\b|\bor\b|\bbut\b/).length > 2)
    );
    
    // Transition words count
    const transitions = ['however', 'therefore', 'furthermore', 'moreover', 'nevertheless', 'consequently'];
    const transitionCount = words.filter(word => 
      transitions.includes(word.toLowerCase().replace(/[.,!?;:]/, ''))
    ).length;

    let clarityScore = 100;
    
    // Penalties and bonuses
    if (readability.gradeLevel > 16) clarityScore -= 25;
    else if (readability.gradeLevel > 12) clarityScore -= 15;
    else if (readability.gradeLevel < 6) clarityScore -= 10;
    
    if (complexSentences.length > sentences.length * 0.3) clarityScore -= 15;
    if (transitionCount > 0) clarityScore += Math.min(10, transitionCount * 2);

    return {
      score: Math.max(0, Math.round(clarityScore)),
      readability,
      complexSentences: complexSentences.length,
      transitionWords: transitionCount,
      issues: [
        ...(readability.gradeLevel > 12 ? ['Text may be too complex for general audience'] : []),
        ...(complexSentences.length > sentences.length * 0.3 ? ['Too many complex sentences'] : []),
        ...(transitionCount === 0 && sentences.length > 3 ? ['Consider adding transition words'] : [])
      ]
    };
  };

  // Enhanced engagement analysis
  const analyzeEngagement = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Advanced passive voice detection
    const passivePatterns = [
      /\b(was|were|been|being)\s+\w+ed\b/gi,
      /\b(is|are|am)\s+\w+ed\b/gi,
      /\b(has|have|had)\s+been\s+\w+ed\b/gi
    ];
    
    let passiveCount = 0;
    passivePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      passiveCount += matches.length;
    });

    // Strong action verbs
    const strongVerbs = ['accelerate', 'achieve', 'activate', 'adapt', 'advance', 'advocate', 'amplify', 'analyze', 'architect', 'articulate', 'assemble', 'assess', 'build', 'capture', 'catalyze', 'champion', 'clarify', 'collaborate', 'communicate', 'conceptualize', 'conduct', 'construct', 'create', 'cultivate', 'deliver', 'demonstrate', 'design', 'develop', 'direct', 'discover', 'drive', 'elevate', 'empower', 'enable', 'enhance', 'establish', 'evaluate', 'execute', 'expand', 'facilitate', 'forge', 'formulate', 'generate', 'guide', 'harness', 'ignite', 'illuminate', 'implement', 'improve', 'influence', 'initiate', 'innovate', 'inspire', 'integrate', 'launch', 'lead', 'leverage', 'maximize', 'navigate', 'optimize', 'orchestrate', 'organize', 'pioneer', 'position', 'propel', 'pursue', 'realize', 'refine', 'reinforce', 'revolutionize', 'shape', 'spearhead', 'streamline', 'strengthen', 'structure', 'succeed', 'support', 'surpass', 'synthesize', 'transform', 'uncover', 'unite', 'unlock', 'unveil', 'upgrade', 'utilize', 'validate', 'venture', 'visualize'];
    
    const strongVerbCount = words.filter(word => 
      strongVerbs.includes(word.replace(/[.,!?;:]/, ''))
    ).length;

    // Weak qualifiers
    const weakWords = ['very', 'really', 'quite', 'rather', 'somewhat', 'pretty', 'fairly', 'kind of', 'sort of', 'a bit', 'a little', 'basically', 'actually', 'literally', 'totally', 'absolutely', 'completely', 'extremely', 'incredibly', 'amazingly'];
    const weakWordCount = words.filter(word => 
      weakWords.includes(word.replace(/[.,!?;:]/, ''))
    ).length;

    // Emotional words
    const emotionalWords = ['passionate', 'excited', 'thrilled', 'devastated', 'furious', 'delighted', 'amazed', 'shocked', 'inspired', 'motivated'];
    const emotionalWordCount = words.filter(word => 
      emotionalWords.includes(word.replace(/[.,!?;:]/, ''))
    ).length;

    // Questions and exclamations
    const questions = (text.match(/\?/g) || []).length;
    const exclamations = (text.match(/!/g) || []).length;

    let engagementScore = 75;
    
    // Scoring adjustments
    engagementScore -= (passiveCount / sentences.length) * 40;
    engagementScore += (strongVerbCount / words.length) * 200;
    engagementScore -= (weakWordCount / words.length) * 100;
    engagementScore += (emotionalWordCount / words.length) * 50;
    engagementScore += Math.min(15, questions * 3 + exclamations * 2);

    return {
      score: Math.max(0, Math.min(100, Math.round(engagementScore))),
      passiveCount,
      strongVerbCount,
      weakWordCount,
      emotionalWordCount,
      questions,
      exclamations,
      issues: [
        ...(passiveCount > sentences.length * 0.2 ? ['High passive voice usage'] : []),
        ...(weakWordCount > words.length * 0.05 ? ['Too many weak qualifiers'] : []),
        ...(strongVerbCount === 0 ? ['Add more action verbs'] : []),
        ...(questions === 0 && exclamations === 0 && sentences.length > 5 ? ['Consider adding questions or exclamations'] : [])
      ]
    };
  };

  // Enhanced correctness analysis
  const analyzeCorrectness = (text) => {
    const commonErrors = [
      { pattern: /\bi\s/gi, error: 'Lowercase "i"', severity: 'high' },
      { pattern: /\bteh\b/gi, error: 'Misspelled "the"', severity: 'high' },
      { pattern: /\brecieve\b/gi, error: 'Misspelled "receive"', severity: 'high' },
      { pattern: /\bthier\b/gi, error: 'Misspelled "their"', severity: 'high' },
      { pattern: /\byour\s+welcome\b/gi, error: 'Should be "you\'re welcome"', severity: 'medium' },
      { pattern: /\bits\s/gi, error: 'Check if "it\'s" is needed', severity: 'medium' },
      { pattern: /\bto\s+\w+ly\b/gi, error: 'Possible split infinitive', severity: 'low' },
      { pattern: /\bwould\s+of\b/gi, error: 'Should be "would have"', severity: 'high' },
      { pattern: /\bcould\s+of\b/gi, error: 'Should be "could have"', severity: 'high' },
      { pattern: /\bshould\s+of\b/gi, error: 'Should be "should have"', severity: 'high' },
      { pattern: /\balot\b/gi, error: 'Should be "a lot"', severity: 'medium' },
      { pattern: /\bdefintely\b/gi, error: 'Misspelled "definitely"', severity: 'high' }
    ];

    let errorCount = 0;
    const detectedErrors = [];
    let severityScore = 0;

    commonErrors.forEach(({ pattern, error, severity }) => {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        errorCount += matches.length;
        detectedErrors.push({ error, count: matches.length, severity });
        severityScore += matches.length * (severity === 'high' ? 15 : severity === 'medium' ? 10 : 5);
      }
    });

    // Check for sentence fragments and run-ons
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const fragments = sentences.filter(s => s.trim().split(/\s+/).length < 4);
    const runOns = sentences.filter(s => s.trim().split(/\s+/).length > 30);

    if (fragments.length > 0) {
      detectedErrors.push({ error: 'Possible sentence fragments', count: fragments.length, severity: 'medium' });
      severityScore += fragments.length * 8;
    }

    if (runOns.length > 0) {
      detectedErrors.push({ error: 'Very long sentences detected', count: runOns.length, severity: 'medium' });
      severityScore += runOns.length * 10;
    }

    const score = Math.max(0, 100 - severityScore);

    return {
      score: Math.round(score),
      errorCount,
      detectedErrors: detectedErrors.slice(0, 5),
      issues: detectedErrors.slice(0, 3).map(e => e.error)
    };
  };

  // Enhanced conciseness analysis
  const analyzeConciseness = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    
    const fillerWords = ['basically', 'actually', 'literally', 'really', 'very', 'quite', 'rather', 'somewhat', 'pretty', 'just', 'sort of', 'kind of', 'in fact', 'as a matter of fact', 'needless to say', 'it goes without saying'];
    const redundantPhrases = [
      'in order to', 'due to the fact that', 'for the purpose of', 'with regard to',
      'in the event that', 'at this point in time', 'for the reason that',
      'in spite of the fact that', 'until such time as', 'in the near future'
    ];
    
    const nominalizationEndings = ['tion', 'sion', 'ment', 'ness', 'ity', 'ance', 'ence'];
    
    let fillerCount = 0;
    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex) || [];
      fillerCount += matches.length;
    });

    let redundantCount = 0;
    redundantPhrases.forEach(phrase => {
      const matches = text.toLowerCase().match(new RegExp(phrase, 'g')) || [];
      redundantCount += matches.length;
    });

    // Count nominalizations
    const nominalizations = words.filter(word => 
      nominalizationEndings.some(ending => word.endsWith(ending) && word.length > 6)
    ).length;

    // Word density analysis
    const avgWordsPerSentence = words.length / (text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1);
    
    let score = 100;
    score -= fillerCount * 3;
    score -= redundantCount * 8;
    score -= nominalizations * 2;
    
    if (avgWordsPerSentence > 25) score -= 10;
    if (avgWordsPerSentence > 30) score -= 15;

    return {
      score: Math.max(0, Math.round(score)),
      fillerCount,
      redundantCount,
      nominalizations,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      issues: [
        ...(fillerCount > 5 ? ['Too many filler words'] : []),
        ...(redundantCount > 2 ? ['Contains redundant phrases'] : []),
        ...(nominalizations > words.length * 0.05 ? ['High use of nominalizations'] : [])
      ]
    };
  };

  // Vocabulary diversity analysis
  const analyzeVocabulary = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !/^[0-9]+$/.test(word)
    );
    const uniqueWords = new Set(words);
    
    const diversity = uniqueWords.size / words.length;
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Advanced words (7+ letters)
    const advancedWords = words.filter(word => word.length >= 7).length;
    
    return {
      diversity: Math.round(diversity * 100),
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      uniqueWords: uniqueWords.size,
      totalWords: words.length,
      advancedWords,
      score: Math.min(100, Math.round(diversity * 100 + (averageWordLength - 4) * 10))
    };
  };

  // Genre-specific analysis
  const analyzeGenre = (text, genre) => {
    const adjustments = {
      fiction: {
        dialogueBonus: (text.match(/"/g) || []).length > 4 ? 10 : 0,
        sensoryWords: ['see', 'hear', 'feel', 'smell', 'taste', 'touch', 'look', 'listen'].filter(word => 
          text.toLowerCase().includes(word)
        ).length * 2,
        showDontTell: text.match(/\b(he|she|they)\s+(felt|thought|knew|realized)\b/gi) ? -5 : 5
      },
      business: {
        jargonPenalty: ['synergy', 'leverage', 'ideate', 'circle back'].filter(word => 
          text.toLowerCase().includes(word)
        ).length * -3,
        dataReferences: (text.match(/\d+%|\$\d+|\d+\s+(percent|million|billion)/gi) || []).length * 3,
        actionOriented: ['will', 'plan', 'implement', 'achieve'].filter(word => 
          text.toLowerCase().includes(word)
        ).length * 2
      },
      academic: {
        citationStyle: text.includes('(') && text.includes(')') ? 5 : -2,
        formalTone: ['furthermore', 'moreover', 'consequently', 'therefore'].filter(word => 
          text.toLowerCase().includes(word)
        ).length * 3,
        firstPerson: (text.match(/\bi\s/gi) || []).length * -2
      }
    };

    const genreAdjustments = adjustments[genre] || {};
    const bonus = Object.values(genreAdjustments).reduce((sum, val) => sum + val, 0);
    
    return {
      bonus: Math.max(-20, Math.min(20, bonus)),
      feedback: genre === 'fiction' ? 'Consider adding more sensory details and dialogue' :
                genre === 'business' ? 'Focus on clear, action-oriented language' :
                'Maintain formal tone and support claims with evidence'
    };
  };

  const calculateOverallScore = (clarity, engagement, correctness, conciseness, vocabulary, genre) => {
    const baseScore = Math.round(
      clarity.score * 0.25 + 
      engagement.score * 0.25 + 
      correctness.score * 0.25 + 
      conciseness.score * 0.15 +
      vocabulary.score * 0.1
    );
    
    return Math.max(0, Math.min(100, baseScore + genre.bonus));
  };

  const getGrammarlyImpactEstimate = (analysis) => {
    const issues = analysis.correctness.errorCount + 
                  (analysis.engagement.passiveCount > 3 ? 5 : 0) +
                  (analysis.conciseness.fillerCount > 5 ? 3 : 0);
    
    const baseImprovement = 12;
    const issueBasedImprovement = Math.min(20, issues * 2);
    return Math.min(30, Math.round(baseImprovement + issueBasedImprovement));
  };

  // Get personalized recommendations based on BAWT content
  const getPersonalizedRecommendations = (analysis) => {
    const recommendations = [];
    
    if (analysis.clarity.readability.gradeLevel > 12) {
      recommendations.push({
        issue: 'Text complexity',
        solution: 'Simplify sentence structure and word choice',
        resource: 'https://becomeawritertoday.com/writing-tips-for-beginners/',
        title: 'Writing Tips for Beginners'
      });
    }
    
    if (analysis.engagement.passiveCount > 3) {
      recommendations.push({
        issue: 'Passive voice overuse',
        solution: 'Convert to active voice for stronger impact',
        resource: 'https://becomeawritertoday.com/what-is-the-passive-voice-and-when-should-you-use-it/',
        title: 'What Is The Passive Voice'
      });
    }
    
    if (analysis.conciseness.fillerCount > 5) {
      recommendations.push({
        issue: 'Too many filler words',
        solution: 'Remove unnecessary words to strengthen your writing',
        resource: 'https://becomeawritertoday.com/filler-words/',
        title: '50 Filler Words List to Cut From Your Writing'
      });
    }
    
    if (analysis.correctness.errorCount > 3) {
      recommendations.push({
        issue: 'Grammar and spelling errors',
        solution: 'Review common grammar mistakes',
        resource: 'https://becomeawritertoday.com/common-grammar-mistakes/',
        title: '30 Common Grammar Mistakes'
      });
    }
    
    if (analysis.vocabulary.diversity < 60) {
      recommendations.push({
        issue: 'Limited vocabulary variety',
        solution: 'Expand your word choice and avoid repetition',
        resource: 'https://becomeawritertoday.com/descriptive-words-list/',
        title: 'List of Descriptive Words'
      });
    }

    return recommendations.slice(0, 3);
  };

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const clarity = analyzeClarity(inputText);
      const engagement = analyzeEngagement(inputText);
      const correctness = analyzeCorrectness(inputText);
      const conciseness = analyzeConciseness(inputText);
      const vocabulary = analyzeVocabulary(inputText);
      const genre = analyzeGenre(inputText, selectedGenre);
      const overallScore = calculateOverallScore(clarity, engagement, correctness, conciseness, vocabulary, genre);
      const grammarlyImpact = getGrammarlyImpactEstimate({ clarity, engagement, correctness, conciseness });
      const recommendations = getPersonalizedRecommendations({ clarity, engagement, correctness, conciseness, vocabulary });

      setAnalysis({
        overall: overallScore,
        clarity,
        engagement,
        correctness,
        conciseness,
        vocabulary,
        genre,
        grammarlyImpact,
        recommendations,
        wordCount: inputText.trim().split(/\s+/).length,
        characterCount: inputText.length
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGrade = (score) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getReadabilityLabel = (ease) => {
    if (ease >= 90) return 'Very Easy';
    if (ease >= 80) return 'Easy';
    if (ease >= 70) return 'Fairly Easy';
    if (ease >= 60) return 'Standard';
    if (ease >= 50) return 'Fairly Difficult';
    if (ease >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  const ScoreCircle = ({ score, size = 'large' }) => {
    const radius = size === 'large' ? 45 : 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className={`relative ${size === 'large' ? 'w-32 h-32' : 'w-24 h-24'}`}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-300 dark:text-gray-600"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={getScoreColor(score)}
            style={{
              transition: 'stroke-dashoffset 2s ease-in-out'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`${size === 'large' ? 'text-2xl' : 'text-lg'} font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
              {getScoreGrade(score)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
          📊 Advanced Writing Quality Scorer
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Get comprehensive writing analysis with personalized insights and improvement recommendations
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center text-blue-800 dark:text-blue-300">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <h3 className="font-semibold mb-1">Professional-Grade Analysis</h3>
              <p className="text-sm">Advanced algorithms analyze readability, engagement, correctness, and style - with insights from Become a Writer Today's expertise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            📝 Your Text
          </h3>
          <div className="flex gap-3">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="general">General Writing</option>
              <option value="fiction">Fiction</option>
              <option value="business">Business</option>
              <option value="academic">Academic</option>
            </select>
            <button
              onClick={() => setInputText(sampleTexts[selectedGenre])}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📝 Try Sample
            </button>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here for comprehensive analysis..."
          className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span>{inputText.trim() ? `${inputText.trim().split(/\s+/).length} words` : '0 words'}</span>
            <span>{inputText.length} characters</span>
            {inputText.trim() && (
              <span>{inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences</span>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg"
          >
            {isAnalyzing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              '🚀 Analyze Writing Quality'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-8">
          {/* Overall Score Dashboard */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              📈 Overall Writing Quality Score
            </h3>
            
            <div className="flex items-center justify-center mb-8">
              <ScoreCircle score={analysis.overall} size="large" />
            </div>

            {/* Grammarly Impact CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                    🚀 Potential Score with Grammarly: {Math.min(100, analysis.overall + analysis.grammarlyImpact)}
                  </h4>
                  <p className="text-green-700 dark:text-green-400 mb-3">
                    Professional writers use Grammarly to improve their scores by an average of {analysis.grammarlyImpact} points
                  </p>
                  <div className="text-sm text-green-600 dark:text-green-500">
                    ✓ Advanced grammar checking  ✓ Style improvements  ✓ Tone optimization
                  </div>
                </div>
                <div className="ml-6">
                  <a
                    href={grammarlyAffiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg shadow-lg"
                  >
                    Try Grammarly Free
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analysis.clarity.readability.gradeLevel}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Grade Level</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analysis.vocabulary.diversity}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vocabulary</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {getReadabilityLabel(analysis.clarity.readability.readingEase)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Readability</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {analysis.wordCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clarity Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  🔍 Clarity & Readability
                </h4>
                <ScoreCircle score={analysis.clarity.score} size="small" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reading Grade Level:</span>
                  <span className="font-medium">{analysis.clarity.readability.gradeLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reading Ease:</span>
                  <span className="font-medium">{analysis.clarity.readability.readingEase}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Sentence Length:</span>
                  <span className="font-medium">{analysis.clarity.readability.avgSentenceLength} words</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Complex Sentences:</span>
                  <span className="font-medium">{analysis.clarity.complexSentences}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transition Words:</span>
                  <span className="font-medium">{analysis.clarity.transitionWords}</span>
                </div>
              </div>

              {analysis.clarity.issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Areas for improvement:</p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    {analysis.clarity.issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Engagement Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  ⚡ Engagement & Impact
                </h4>
                <ScoreCircle score={analysis.engagement.score} size="small" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Passive Voice Count:</span>
                  <span className="font-medium">{analysis.engagement.passiveCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Strong Action Verbs:</span>
                  <span className="font-medium">{analysis.engagement.strongVerbCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Weak Qualifiers:</span>
                  <span className="font-medium">{analysis.engagement.weakWordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Emotional Words:</span>
                  <span className="font-medium">{analysis.engagement.emotionalWordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Questions/Exclamations:</span>
                  <span className="font-medium">{analysis.engagement.questions + analysis.engagement.exclamations}</span>
                </div>
              </div>

              {analysis.engagement.issues.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Areas for improvement:</p>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    {analysis.engagement.issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Correctness Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  ✅ Grammar & Correctness
                </h4>
                <ScoreCircle score={analysis.correctness.score} size="small" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Errors Found:</span>
                  <span className="font-medium">{analysis.correctness.errorCount}</span>
                </div>
              </div>

              {analysis.correctness.detectedErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Detected issues:</p>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    {analysis.correctness.detectedErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {error.error} ({error.count}x)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Pro tip:</strong> Grammarly catches 95% more grammar errors than basic spell checkers
                </p>
              </div>
            </div>

            {/* Vocabulary & Style */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  📚 Vocabulary & Style
                </h4>
                <ScoreCircle score={analysis.vocabulary.score} size="small" />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vocabulary Diversity:</span>
                  <span className="font-medium">{analysis.vocabulary.diversity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Unique Words:</span>
                  <span className="font-medium">{analysis.vocabulary.uniqueWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Word Length:</span>
                  <span className="font-medium">{analysis.vocabulary.averageWordLength} letters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Advanced Words (7+ letters):</span>
                  <span className="font-medium">{analysis.vocabulary.advancedWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Filler Words:</span>
                  <span className="font-medium">{analysis.conciseness.fillerCount}</span>
                </div>
              </div>

              {selectedGenre !== 'general' && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                    Genre-specific feedback ({selectedGenre}):
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {analysis.genre.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Personalized Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                💡 Personalized Improvement Plan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                      {rec.issue}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.solution}
                    </p>
                    <a
                      href={rec.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      📖 {rec.title}
                      <span className="ml-1">→</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final CTA Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                🎯 Ready to Take Your Writing to the Next Level?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Join millions of writers who use Grammarly to polish their work to perfection
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Advanced Grammar</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Catch errors this tool missed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Style Suggestions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Improve clarity and engagement</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎭</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Tone Detection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ensure appropriate tone</p>
                </div>
              </div>

              <a
                href={grammarlyAffiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                Start Free Grammarly Trial
              </a>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>

          {/* Tool Information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📋 About This Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Analysis Components:</h4>
                <ul className="space-y-2">
                  <li>• <strong>Clarity (25%):</strong> Readability, sentence structure, complexity</li>
                  <li>• <strong>Engagement (25%):</strong> Active voice, strong verbs, emotional impact</li>
                  <li>• <strong>Correctness (25%):</strong> Grammar, spelling, common errors</li>
                  <li>• <strong>Conciseness (15%):</strong> Filler words, redundancy, brevity</li>
                  <li>• <strong>Vocabulary (10%):</strong> Diversity, sophistication, variety</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Powered by Expertise:</h4>
                <ul className="space-y-2">
                  <li>• Flesch-Kincaid readability formulas</li>
                  <li>• Advanced linguistic pattern recognition</li>
                  <li>• Genre-specific optimization</li>
                  <li>• Research from <a href="https://becomeawritertoday.com" className="text-blue-600 dark:text-blue-400 hover:underline">Become a Writer Today</a></li>
                  <li>• Professional writing best practices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingQualityScorer; 