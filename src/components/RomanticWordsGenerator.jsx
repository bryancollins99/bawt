import React, { useState } from 'react';

const RomanticWordsGenerator = () => {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wordCount, setWordCount] = useState(5);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [generatedPhrases, setGeneratedPhrases] = useState([]);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [includePhrases, setIncludePhrases] = useState(true);

  const romanticThemes = {
    all: {
      name: 'All Romantic Themes',
      icon: '💕',
      description: 'Mix of romantic words from all themes and categories'
    },
    love: {
      name: 'Love & Romance',
      icon: '❤️',
      description: 'Words expressing deep love, passion, and romantic feelings',
      categories: {
        all: {
          name: 'All Love',
          words: [
            { word: 'adore', definition: 'love and respect deeply', category: 'deep-love' },
            { word: 'cherish', definition: 'hold dear; treasure', category: 'deep-love' },
            { word: 'passionate', definition: 'showing intense emotion', category: 'intensity' },
            { word: 'devoted', definition: 'very loving and loyal', category: 'commitment' },
            { word: 'enamored', definition: 'filled with love', category: 'infatuation' },
            { word: 'smitten', definition: 'deeply affected by love', category: 'infatuation' },
            { word: 'ardent', definition: 'passionate and enthusiastic', category: 'intensity' },
            { word: 'tender', definition: 'gentle and loving', category: 'gentleness' },
            { word: 'affectionate', definition: 'showing fondness', category: 'gentleness' },
            { word: 'yearning', definition: 'deep longing or desire', category: 'desire' }
          ],
          phrases: [
            'hearts beating in perfect harmony',
            'love that transcends time',
            'souls entwined forever',
            'passion that burns eternal',
            'love written in the stars'
          ]
        },
        deepLove: {
          name: 'Deep Love',
          words: [
            { word: 'adore', definition: 'love and respect deeply', category: 'deep-love' },
            { word: 'cherish', definition: 'hold dear; treasure', category: 'deep-love' },
            { word: 'revere', definition: 'regard with deep respect', category: 'deep-love' },
            { word: 'worship', definition: 'adore and admire', category: 'deep-love' },
            { word: 'idolize', definition: 'admire and love intensely', category: 'deep-love' },
            { word: 'treasure', definition: 'value highly', category: 'deep-love' },
            { word: 'prize', definition: 'value greatly', category: 'deep-love' },
            { word: 'beloved', definition: 'dearly loved', category: 'deep-love' }
          ]
        },
        intensity: {
          name: 'Intensity',
          words: [
            { word: 'passionate', definition: 'showing intense emotion', category: 'intensity' },
            { word: 'ardent', definition: 'passionate and enthusiastic', category: 'intensity' },
            { word: 'fervent', definition: 'showing great warmth', category: 'intensity' },
            { word: 'zealous', definition: 'showing great energy', category: 'intensity' },
            { word: 'intense', definition: 'of extreme force', category: 'intensity' },
            { word: 'fierce', definition: 'showing strong emotion', category: 'intensity' },
            { word: 'vehement', definition: 'showing strong feeling', category: 'intensity' },
            { word: 'burning', definition: 'intensely hot', category: 'intensity' }
          ]
        },
        commitment: {
          name: 'Commitment',
          words: [
            { word: 'devoted', definition: 'very loving and loyal', category: 'commitment' },
            { word: 'faithful', definition: 'loyal and constant', category: 'commitment' },
            { word: 'steadfast', definition: 'firmly loyal', category: 'commitment' },
            { word: 'loyal', definition: 'faithful to commitments', category: 'commitment' },
            { word: 'dedicated', definition: 'committed to a cause', category: 'commitment' },
            { word: 'unwavering', definition: 'not changing', category: 'commitment' },
            { word: 'constant', definition: 'unchanging', category: 'commitment' },
            { word: 'enduring', definition: 'lasting', category: 'commitment' }
          ]
        }
      }
    },
    emotions: {
      name: 'Emotional Connection',
      icon: '💝',
      description: 'Words for emotional intimacy, vulnerability, and deep feelings',
      categories: {
        all: {
          name: 'All Emotions',
          words: [
            { word: 'vulnerable', definition: 'open to emotional hurt', category: 'vulnerability' },
            { word: 'intimate', definition: 'closely acquainted', category: 'closeness' },
            { word: 'tender', definition: 'gentle and loving', category: 'gentleness' },
            { word: 'yearning', definition: 'deep longing or desire', category: 'desire' },
            { word: 'nostalgic', definition: 'longing for past', category: 'memory' },
            { word: 'melancholy', definition: 'thoughtful sadness', category: 'sadness' },
            { word: 'euphoric', definition: 'intensely happy', category: 'joy' },
            { word: 'serene', definition: 'calm and peaceful', category: 'peace' },
            { word: 'passionate', definition: 'showing intense emotion', category: 'intensity' },
            { word: 'affectionate', definition: 'showing fondness', category: 'gentleness' }
          ],
          phrases: [
            'hearts speaking without words',
            'emotions flowing like rivers',
            'souls baring their deepest secrets',
            'love that heals all wounds',
            'connection that defies explanation'
          ]
        },
        vulnerability: {
          name: 'Vulnerability',
          words: [
            { word: 'vulnerable', definition: 'open to emotional hurt', category: 'vulnerability' },
            { word: 'exposed', definition: 'not protected', category: 'vulnerability' },
            { word: 'naked', definition: 'completely open', category: 'vulnerability' },
            { word: 'raw', definition: 'unprocessed emotion', category: 'vulnerability' },
            { word: 'unprotected', definition: 'not shielded', category: 'vulnerability' },
            { word: 'defenseless', definition: 'without protection', category: 'vulnerability' },
            { word: 'open', definition: 'not closed off', category: 'vulnerability' },
            { word: 'transparent', definition: 'easily seen through', category: 'vulnerability' }
          ]
        },
        closeness: {
          name: 'Closeness',
          words: [
            { word: 'intimate', definition: 'closely acquainted', category: 'closeness' },
            { word: 'close', definition: 'near in relationship', category: 'closeness' },
            { word: 'familiar', definition: 'well known', category: 'closeness' },
            { word: 'personal', definition: 'relating to oneself', category: 'closeness' },
            { word: 'private', definition: 'belonging to oneself', category: 'closeness' },
            { word: 'confidential', definition: 'kept secret', category: 'closeness' },
            { word: 'secret', definition: 'not known to others', category: 'closeness' },
            { word: 'sacred', definition: 'holy and special', category: 'closeness' }
          ]
        },
        desire: {
          name: 'Desire',
          words: [
            { word: 'yearning', definition: 'deep longing or desire', category: 'desire' },
            { word: 'craving', definition: 'intense desire', category: 'desire' },
            { word: 'longing', definition: 'strong desire', category: 'desire' },
            { word: 'hunger', definition: 'strong desire', category: 'desire' },
            { word: 'thirst', definition: 'strong desire', category: 'desire' },
            { word: 'ache', definition: 'painful longing', category: 'desire' },
            { word: 'burning', definition: 'intense desire', category: 'desire' },
            { word: 'aching', definition: 'painful longing', category: 'desire' }
          ]
        }
      }
    },
    physical: {
      name: 'Physical Attraction',
      icon: '🔥',
      description: 'Words for physical attraction, beauty, and sensual feelings',
      categories: {
        all: {
          name: 'All Physical',
          words: [
            { word: 'alluring', definition: 'attractive and tempting', category: 'attraction' },
            { word: 'enchanting', definition: 'delightfully charming', category: 'beauty' },
            { word: 'mesmerizing', definition: 'captivating attention', category: 'attraction' },
            { word: 'stunning', definition: 'extremely impressive', category: 'beauty' },
            { word: 'radiant', definition: 'sending out light', category: 'beauty' },
            { word: 'magnetic', definition: 'powerfully attractive', category: 'attraction' },
            { word: 'irresistible', definition: 'impossible to resist', category: 'attraction' },
            { word: 'breathtaking', definition: 'amazingly beautiful', category: 'beauty' },
            { word: 'captivating', definition: 'holding attention', category: 'attraction' },
            { word: 'hypnotic', definition: 'mesmerizing', category: 'attraction' }
          ],
          phrases: [
            'beauty that stops time',
            'attraction that defies gravity',
            'eyes that speak volumes',
            'touch that ignites fire',
            'presence that commands attention'
          ]
        },
        attraction: {
          name: 'Attraction',
          words: [
            { word: 'alluring', definition: 'attractive and tempting', category: 'attraction' },
            { word: 'mesmerizing', definition: 'captivating attention', category: 'attraction' },
            { word: 'magnetic', definition: 'powerfully attractive', category: 'attraction' },
            { word: 'irresistible', definition: 'impossible to resist', category: 'attraction' },
            { word: 'captivating', definition: 'holding attention', category: 'attraction' },
            { word: 'hypnotic', definition: 'mesmerizing', category: 'attraction' },
            { word: 'enticing', definition: 'attractive and tempting', category: 'attraction' },
            { word: 'seductive', definition: 'tempting and attractive', category: 'attraction' }
          ]
        },
        beauty: {
          name: 'Beauty',
          words: [
            { word: 'enchanting', definition: 'delightfully charming', category: 'beauty' },
            { word: 'stunning', definition: 'extremely impressive', category: 'beauty' },
            { word: 'radiant', definition: 'sending out light', category: 'beauty' },
            { word: 'breathtaking', definition: 'amazingly beautiful', category: 'beauty' },
            { word: 'gorgeous', definition: 'beautiful and attractive', category: 'beauty' },
            { word: 'exquisite', definition: 'extremely beautiful', category: 'beauty' },
            { word: 'elegant', definition: 'graceful and stylish', category: 'beauty' },
            { word: 'graceful', definition: 'moving with elegance', category: 'beauty' }
          ]
        },
        sensual: {
          name: 'Sensual',
          words: [
            { word: 'sensual', definition: 'relating to physical pleasure', category: 'sensual' },
            { word: 'passionate', definition: 'showing intense emotion', category: 'sensual' },
            { word: 'intimate', definition: 'closely acquainted', category: 'sensual' },
            { word: 'tender', definition: 'gentle and loving', category: 'sensual' },
            { word: 'warm', definition: 'friendly and loving', category: 'sensual' },
            { word: 'soft', definition: 'gentle and smooth', category: 'sensual' },
            { word: 'smooth', definition: 'even and regular', category: 'sensual' },
            { word: 'gentle', definition: 'mild and kind', category: 'sensual' }
          ]
        }
      }
    },
    relationship: {
      name: 'Relationship Dynamics',
      icon: '💑',
      description: 'Words for relationship stages, partnership, and romantic bonds',
      categories: {
        all: {
          name: 'All Relationships',
          words: [
            { word: 'soulmate', definition: 'perfect romantic partner', category: 'partnership' },
            { word: 'companion', definition: 'person who accompanies', category: 'partnership' },
            { word: 'partner', definition: 'person who shares', category: 'partnership' },
            { word: 'beloved', definition: 'dearly loved person', category: 'endearment' },
            { word: 'darling', definition: 'dear or beloved person', category: 'endearment' },
            { word: 'sweetheart', definition: 'loved person', category: 'endearment' },
            { word: 'lover', definition: 'person in love', category: 'romance' },
            { word: 'romance', definition: 'love affair', category: 'romance' },
            { word: 'courtship', definition: 'period of dating', category: 'romance' },
            { word: 'betrothal', definition: 'engagement to marry', category: 'commitment' }
          ],
          phrases: [
            'two hearts beating as one',
            'partners in life\'s journey',
            'love that grows stronger each day',
            'relationship built on trust',
            'bond that time cannot break'
          ]
        },
        partnership: {
          name: 'Partnership',
          words: [
            { word: 'soulmate', definition: 'perfect romantic partner', category: 'partnership' },
            { word: 'companion', definition: 'person who accompanies', category: 'partnership' },
            { word: 'partner', definition: 'person who shares', category: 'partnership' },
            { word: 'mate', definition: 'romantic partner', category: 'partnership' },
            { word: 'spouse', definition: 'married partner', category: 'partnership' },
            { word: 'significant other', definition: 'romantic partner', category: 'partnership' },
            { word: 'better half', definition: 'romantic partner', category: 'partnership' },
            { word: 'other half', definition: 'romantic partner', category: 'partnership' }
          ]
        },
        endearment: {
          name: 'Endearment',
          words: [
            { word: 'beloved', definition: 'dearly loved person', category: 'endearment' },
            { word: 'darling', definition: 'dear or beloved person', category: 'endearment' },
            { word: 'sweetheart', definition: 'loved person', category: 'endearment' },
            { word: 'dear', definition: 'loved and valued', category: 'endearment' },
            { word: 'precious', definition: 'of great value', category: 'endearment' },
            { word: 'treasure', definition: 'valued person', category: 'endearment' },
            { word: 'angel', definition: 'beautiful person', category: 'endearment' },
            { word: 'honey', definition: 'term of endearment', category: 'endearment' }
          ]
        },
        romance: {
          name: 'Romance',
          words: [
            { word: 'lover', definition: 'person in love', category: 'romance' },
            { word: 'romance', definition: 'love affair', category: 'romance' },
            { word: 'courtship', definition: 'period of dating', category: 'romance' },
            { word: 'wooing', definition: 'seeking love', category: 'romance' },
            { word: 'flirtation', definition: 'playful romantic behavior', category: 'romance' },
            { word: 'seduction', definition: 'act of attracting', category: 'romance' },
            { word: 'passion', definition: 'strong emotion', category: 'romance' },
            { word: 'infatuation', definition: 'intense but short-lived passion', category: 'romance' }
          ]
        }
      }
    },
    poetic: {
      name: 'Poetic Romance',
      icon: '🌹',
      description: 'Elegant and poetic words for romantic writing and love poetry',
      categories: {
        all: {
          name: 'All Poetic',
          words: [
            { word: 'ethereal', definition: 'extremely delicate and light', category: 'beauty' },
            { word: 'sublime', definition: 'inspiring awe through beauty', category: 'beauty' },
            { word: 'divine', definition: 'excellently beautiful', category: 'beauty' },
            { word: 'celestial', definition: 'heavenly or divine', category: 'beauty' },
            { word: 'transcendent', definition: 'beyond normal experience', category: 'spiritual' },
            { word: 'mystical', definition: 'spiritual mystery', category: 'spiritual' },
            { word: 'enchanted', definition: 'under magical spell', category: 'magic' },
            { word: 'bewitched', definition: 'under magical influence', category: 'magic' },
            { word: 'spellbound', definition: 'entranced', category: 'magic' },
            { word: 'mesmerized', definition: 'hypnotized', category: 'magic' }
          ],
          phrases: [
            'love that transcends mortal bounds',
            'beauty that rivals the stars',
            'passion that burns eternal',
            'souls destined to unite',
            'love written in cosmic dust'
          ]
        },
        beauty: {
          name: 'Beauty',
          words: [
            { word: 'ethereal', definition: 'extremely delicate and light', category: 'beauty' },
            { word: 'sublime', definition: 'inspiring awe through beauty', category: 'beauty' },
            { word: 'divine', definition: 'excellently beautiful', category: 'beauty' },
            { word: 'celestial', definition: 'heavenly or divine', category: 'beauty' },
            { word: 'angelic', definition: 'like an angel', category: 'beauty' },
            { word: 'heavenly', definition: 'divinely beautiful', category: 'beauty' },
            { word: 'godlike', definition: 'resembling a god', category: 'beauty' },
            { word: 'perfect', definition: 'without flaw', category: 'beauty' }
          ]
        },
        spiritual: {
          name: 'Spiritual',
          words: [
            { word: 'transcendent', definition: 'beyond normal experience', category: 'spiritual' },
            { word: 'mystical', definition: 'spiritual mystery', category: 'spiritual' },
            { word: 'sacred', definition: 'holy and special', category: 'spiritual' },
            { word: 'holy', definition: 'sacred and pure', category: 'spiritual' },
            { word: 'blessed', definition: 'divinely favored', category: 'spiritual' },
            { word: 'anointed', definition: 'chosen by divine', category: 'spiritual' },
            { word: 'consecrated', definition: 'made sacred', category: 'spiritual' },
            { word: 'hallowed', definition: 'holy and revered', category: 'spiritual' }
          ]
        },
        magic: {
          name: 'Magic',
          words: [
            { word: 'enchanted', definition: 'under magical spell', category: 'magic' },
            { word: 'bewitched', definition: 'under magical influence', category: 'magic' },
            { word: 'spellbound', definition: 'entranced', category: 'magic' },
            { word: 'mesmerized', definition: 'hypnotized', category: 'magic' },
            { word: 'charmed', definition: 'delighted', category: 'magic' },
            { word: 'magical', definition: 'relating to magic', category: 'magic' },
            { word: 'mystical', definition: 'spiritual mystery', category: 'magic' },
            { word: 'supernatural', definition: 'beyond natural', category: 'magic' }
          ]
        }
      }
    }
  };

  const getFilteredWords = () => {
    if (selectedTheme === 'all') {
      // Combine words from all themes
      const allWords = [];
      Object.values(romanticThemes).forEach(theme => {
        if (theme.categories) {
          Object.values(theme.categories).forEach(category => {
            if (category.words) {
              allWords.push(...category.words);
            }
          });
        }
      });
      return allWords;
    }

    const theme = romanticThemes[selectedTheme];
    if (!theme || !theme.categories) return [];

    if (selectedCategory === 'all') {
      // Combine words from all categories in the theme
      const allWords = [];
      Object.values(theme.categories).forEach(category => {
        if (category.words) {
          allWords.push(...category.words);
        }
      });
      return allWords;
    }

    return theme.categories[selectedCategory]?.words || [];
  };

  const getFilteredPhrases = () => {
    if (selectedTheme === 'all') {
      // Combine phrases from all themes
      const allPhrases = [];
      Object.values(romanticThemes).forEach(theme => {
        if (theme.categories) {
          Object.values(theme.categories).forEach(category => {
            if (category.phrases) {
              allPhrases.push(...category.phrases);
            }
          });
        }
      });
      return allPhrases;
    }

    const theme = romanticThemes[selectedTheme];
    if (!theme || !theme.categories) return [];

    if (selectedCategory === 'all') {
      // Combine phrases from all categories in the theme
      const allPhrases = [];
      Object.values(theme.categories).forEach(category => {
        if (category.phrases) {
          allPhrases.push(...category.phrases);
        }
      });
      return allPhrases;
    }

    return theme.categories[selectedCategory]?.phrases || [];
  };

  const generateWords = () => {
    const availableWords = getFilteredWords();
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    setGeneratedWords(shuffled.slice(0, Math.min(wordCount, availableWords.length)));
  };

  const generatePhrases = () => {
    // Generate phrases that incorporate the generated words
    const phrases = [];
    const availablePhrases = getFilteredPhrases();
    
    // Romantic template phrases that can incorporate the generated words
    const templatePhrases = [
      'Her {word} eyes captured',
      'His {word} touch awakened',
      'The {word} moment when',
      'She felt {word} in his presence',
      'His {word} love for her',
      'The {word} beauty of their',
      'They shared a {word} connection',
      'Her {word} heart beat for',
      'His {word} devotion to',
      'The {word} passion between',
      'She was {word} by his',
      'His {word} embrace held',
      'The {word} romance of their',
      'Her {word} soul found',
      'His {word} tenderness toward',
      'The {word} magic of love',
      'She gave him her {word} trust',
      'His {word} commitment to',
      'The {word} intimacy they shared',
      'Her {word} affection for',
      'His {word} desire for',
      'The {word} bond between them',
      'She felt {word} in his arms',
      'His {word} gaze met hers',
      'The {word} harmony of their love',
      'Her {word} spirit danced with',
      'His {word} strength protected',
      'The {word} peace they found',
      'She trusted his {word} heart',
      'His {word} wisdom guided',
      'The {word} joy they discovered',
      'Her {word} grace enchanted',
      'His {word} courage inspired',
      'The {word} wonder of their love',
      'She embraced his {word} nature',
      'His {word} patience with',
      'The {word} comfort they shared',
      'Her {word} kindness touched',
      'His {word} understanding of',
      'The {word} bliss they experienced'
    ];
    
    // Create phrases using the generated words
    generatedWords.forEach((wordObj, index) => {
      if (index < wordCount) {
        const template = templatePhrases[index % templatePhrases.length];
        const phrase = template.replace('{word}', wordObj.word);
        phrases.push({
          phrase: phrase,
          word: wordObj.word,
          category: wordObj.category
        });
      }
    });
    
    // Add some of the original themed phrases if we have room
    const remainingSlots = wordCount - phrases.length;
    if (remainingSlots > 0 && availablePhrases.length > 0) {
      const shuffled = [...availablePhrases].sort(() => Math.random() - 0.5);
      const additionalPhrases = shuffled.slice(0, remainingSlots).map(phrase => ({
        phrase: phrase,
        word: null,
        category: 'themed'
      }));
      phrases.push(...additionalPhrases);
    }
    
    setGeneratedPhrases(phrases);
  };

  const generateBoth = () => {
    generateWords();
    if (includePhrases) {
      // Wait a moment for words to be set, then generate phrases
      setTimeout(() => {
        generatePhrases();
      }, 100);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getCategoryColor = (category) => {
    const colors = {
      // Love & Romance
      'deep-love': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      intensity: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      commitment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      infatuation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      gentleness: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      desire: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      
      // Emotional Connection
      vulnerability: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      closeness: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      sadness: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      joy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      peace: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      
      // Physical Attraction
      attraction: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      beauty: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      sensual: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      
      // Relationship Dynamics
      partnership: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      endearment: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      romance: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
      
      // Poetic Romance
      spiritual: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      magic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      themed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getAvailableCategories = () => {
    if (selectedTheme === 'all') return [];
    const theme = romanticThemes[selectedTheme];
    return theme?.categories ? Object.keys(theme.categories) : [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💕 Romantic Words Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover beautiful romantic vocabulary for love stories, poetry, and relationship writing
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={selectedTheme}
            onChange={(e) => {
              setSelectedTheme(e.target.value);
              setSelectedCategory('all');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {Object.entries(romanticThemes).map(([key, theme]) => (
              <option key={key} value={key}>
                {theme.icon} {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getAvailableCategories().map(category => (
              <option key={category} value={category}>
                {romanticThemes[selectedTheme]?.categories[category]?.name || category}
              </option>
            ))}
          </select>
        </div>

        {/* Word Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Words
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={wordCount}
            onChange={(e) => setWordCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Include Phrases Toggle */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={includePhrases}
              onChange={(e) => setIncludePhrases(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span>Include Phrases</span>
          </label>
        </div>
      </div>

      {/* Theme Description */}
      {selectedTheme !== 'all' && romanticThemes[selectedTheme]?.description && (
        <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <p className="text-pink-800 dark:text-pink-300 text-sm">
            {romanticThemes[selectedTheme].description}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center mb-8">
        <button
          onClick={generateBoth}
          className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          💕 Generate Romantic Words
        </button>
      </div>

      {/* Results */}
      {(generatedWords.length > 0 || generatedPhrases.length > 0) && (
        <div className="space-y-6">
          {/* Words */}
          {generatedWords.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  💝 Generated Romantic Words
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showDefinitions}
                      onChange={(e) => setShowDefinitions(e.target.checked)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span>Show Definitions</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(generatedWords.map(w => w.word).join(', '))}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    📋 Copy Words
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedWords.map((wordObj, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {wordObj.word}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(wordObj.category)}`}>
                        {wordObj.category}
                      </span>
                    </div>
                    {showDefinitions && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        {wordObj.definition}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phrases */}
          {generatedPhrases.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  💭 Generated Romantic Phrases
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedPhrases.map(p => p.phrase).join('\n'))}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  📋 Copy Phrases
                </button>
              </div>
              <div className="space-y-3">
                {generatedPhrases.map((phraseObj, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-gray-900 dark:text-white italic flex-1">
                        "{phraseObj.phrase}"
                      </p>
                      {phraseObj.word && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${getCategoryColor(phraseObj.category)}`}>
                          Uses: {phraseObj.word}
                        </span>
                      )}
                    </div>
                    {phraseObj.word && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ✨ This phrase incorporates the romantic word "<strong>{phraseObj.word}</strong>" from your generated words
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Writing Tips */}
      <div className="mt-8 p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
        <h3 className="text-lg font-semibold text-pink-800 dark:text-pink-300 mb-3">
          💡 Romantic Writing Tips
        </h3>
        <ul className="text-pink-700 dark:text-pink-400 text-sm space-y-2">
          <li>• Use these words to add emotional depth to love stories and poetry</li>
          <li>• Mix different themes to create varied romantic expressions</li>
          <li>• Combine words and phrases to build compelling romantic scenes</li>
          <li>• Use the definitions to understand the emotional nuances</li>
          <li>• Experiment with different categories to find your romantic voice</li>
        </ul>
      </div>
    </div>
  );
};

export default RomanticWordsGenerator; 