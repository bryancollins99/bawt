import React, { useState } from 'react';

const SadWordsGenerator = () => {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wordCount, setWordCount] = useState(5);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [generatedPhrases, setGeneratedPhrases] = useState([]);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [includePhrases, setIncludePhrases] = useState(true);

  const sadThemes = {
    all: {
      name: 'All Sad Themes',
      icon: '😢',
      description: 'Mix of melancholic and sorrowful words from all themes and categories'
    },
    grief: {
      name: 'Grief & Loss',
      icon: '💔',
      description: 'Words expressing deep sorrow, loss, and bereavement',
      categories: {
        all: {
          name: 'All Grief',
          words: [
            { word: 'bereaved', definition: 'deprived of a loved one', category: 'loss' },
            { word: 'mournful', definition: 'expressing sorrow', category: 'sorrow' },
            { word: 'anguish', definition: 'severe mental or physical pain', category: 'pain' },
            { word: 'devastated', definition: 'completely destroyed', category: 'destruction' },
            { word: 'heartbroken', definition: 'overwhelmed with grief', category: 'pain' },
            { word: 'desolate', definition: 'deserted and lonely', category: 'loneliness' },
            { word: 'forlorn', definition: 'pitifully sad and abandoned', category: 'abandonment' },
            { word: 'bereaved', definition: 'deprived of a loved one', category: 'loss' },
            { word: 'grieving', definition: 'suffering from loss', category: 'sorrow' },
            { word: 'shattered', definition: 'completely broken', category: 'destruction' }
          ],
          phrases: [
            'hearts torn apart by loss',
            'souls weighed down by grief',
            'memories that bring tears',
            'love that death could not take',
            'emptiness that echoes forever'
          ]
        },
        loss: {
          name: 'Loss',
          words: [
            { word: 'bereaved', definition: 'deprived of a loved one', category: 'loss' },
            { word: 'deprived', definition: 'lacking something needed', category: 'loss' },
            { word: 'robbed', definition: 'deprived of something', category: 'loss' },
            { word: 'stolen', definition: 'taken without permission', category: 'loss' },
            { word: 'missing', definition: 'not present', category: 'loss' },
            { word: 'gone', definition: 'no longer present', category: 'loss' },
            { word: 'vanished', definition: 'disappeared completely', category: 'loss' },
            { word: 'absent', definition: 'not present', category: 'loss' }
          ]
        },
        sorrow: {
          name: 'Sorrow',
          words: [
            { word: 'mournful', definition: 'expressing sorrow', category: 'sorrow' },
            { word: 'grieving', definition: 'suffering from loss', category: 'sorrow' },
            { word: 'woeful', definition: 'full of sorrow', category: 'sorrow' },
            { word: 'sorrowful', definition: 'feeling or showing sorrow', category: 'sorrow' },
            { word: 'melancholy', definition: 'sadness or depression', category: 'sorrow' },
            { word: 'doleful', definition: 'mournful and sad', category: 'sorrow' },
            { word: 'lugubrious', definition: 'looking or sounding sad', category: 'sorrow' },
            { word: 'plaintive', definition: 'sounding sad and mournful', category: 'sorrow' }
          ]
        },
        pain: {
          name: 'Pain',
          words: [
            { word: 'anguish', definition: 'severe mental or physical pain', category: 'pain' },
            { word: 'heartbroken', definition: 'overwhelmed with grief', category: 'pain' },
            { word: 'tormented', definition: 'suffering severe pain', category: 'pain' },
            { word: 'agonized', definition: 'experiencing extreme pain', category: 'pain' },
            { word: 'tortured', definition: 'causing extreme pain', category: 'pain' },
            { word: 'wounded', definition: 'injured or hurt', category: 'pain' },
            { word: 'bruised', definition: 'injured by impact', category: 'pain' },
            { word: 'scarred', definition: 'marked by injury', category: 'pain' }
          ]
        }
      }
    },
    despair: {
      name: 'Despair & Hopelessness',
      icon: '😞',
      description: 'Words for hopelessness, despair, and loss of faith',
      categories: {
        all: {
          name: 'All Despair',
          words: [
            { word: 'despair', definition: 'complete loss of hope', category: 'hopelessness' },
            { word: 'hopeless', definition: 'without hope', category: 'hopelessness' },
            { word: 'desperate', definition: 'feeling hopeless', category: 'hopelessness' },
            { word: 'defeated', definition: 'overcome by failure', category: 'failure' },
            { word: 'crushed', definition: 'completely defeated', category: 'failure' },
            { word: 'overwhelmed', definition: 'defeated by force', category: 'failure' },
            { word: 'powerless', definition: 'without power', category: 'weakness' },
            { word: 'helpless', definition: 'unable to help oneself', category: 'weakness' },
            { word: 'futile', definition: 'pointless or useless', category: 'hopelessness' },
            { word: 'meaningless', definition: 'without meaning', category: 'hopelessness' }
          ],
          phrases: [
            'hope that died with the light',
            'dreams crushed by reality',
            'souls lost in darkness',
            'hearts that forgot how to beat',
            'spirits broken by time'
          ]
        },
        hopelessness: {
          name: 'Hopelessness',
          words: [
            { word: 'despair', definition: 'complete loss of hope', category: 'hopelessness' },
            { word: 'hopeless', definition: 'without hope', category: 'hopelessness' },
            { word: 'desperate', definition: 'feeling hopeless', category: 'hopelessness' },
            { word: 'futile', definition: 'pointless or useless', category: 'hopelessness' },
            { word: 'meaningless', definition: 'without meaning', category: 'hopelessness' },
            { word: 'pointless', definition: 'without purpose', category: 'hopelessness' },
            { word: 'useless', definition: 'not serving any purpose', category: 'hopelessness' },
            { word: 'vain', definition: 'without success', category: 'hopelessness' }
          ]
        },
        failure: {
          name: 'Failure',
          words: [
            { word: 'defeated', definition: 'overcome by failure', category: 'failure' },
            { word: 'crushed', definition: 'completely defeated', category: 'failure' },
            { word: 'overwhelmed', definition: 'defeated by force', category: 'failure' },
            { word: 'beaten', definition: 'defeated in competition', category: 'failure' },
            { word: 'conquered', definition: 'overcome by force', category: 'failure' },
            { word: 'subdued', definition: 'brought under control', category: 'failure' },
            { word: 'vanquished', definition: 'defeated completely', category: 'failure' },
            { word: 'routed', definition: 'defeated decisively', category: 'failure' }
          ]
        },
        weakness: {
          name: 'Weakness',
          words: [
            { word: 'powerless', definition: 'without power', category: 'weakness' },
            { word: 'helpless', definition: 'unable to help oneself', category: 'weakness' },
            { word: 'feeble', definition: 'lacking strength', category: 'weakness' },
            { word: 'weak', definition: 'lacking physical strength', category: 'weakness' },
            { word: 'fragile', definition: 'easily broken', category: 'weakness' },
            { word: 'vulnerable', definition: 'susceptible to attack', category: 'weakness' },
            { word: 'defenseless', definition: 'without protection', category: 'weakness' },
            { word: 'exposed', definition: 'not protected', category: 'weakness' }
          ]
        }
      }
    },
    loneliness: {
      name: 'Loneliness & Isolation',
      icon: '😔',
      description: 'Words for loneliness, isolation, and abandonment',
      categories: {
        all: {
          name: 'All Loneliness',
          words: [
            { word: 'lonely', definition: 'sad from being alone', category: 'isolation' },
            { word: 'isolated', definition: 'separated from others', category: 'isolation' },
            { word: 'abandoned', definition: 'deserted or left behind', category: 'abandonment' },
            { word: 'forsaken', definition: 'abandoned or deserted', category: 'abandonment' },
            { word: 'deserted', definition: 'abandoned or left empty', category: 'abandonment' },
            { word: 'solitary', definition: 'alone or single', category: 'isolation' },
            { word: 'forlorn', definition: 'pitifully sad and abandoned', category: 'abandonment' },
            { word: 'desolate', definition: 'deserted and lonely', category: 'isolation' },
            { word: 'estranged', definition: 'no longer close', category: 'separation' },
            { word: 'alienated', definition: 'feeling isolated', category: 'separation' }
          ],
          phrases: [
            'hearts that beat alone',
            'souls wandering in emptiness',
            'voices that echo in silence',
            'hands that reach for nothing',
            'eyes that see only darkness'
          ]
        },
        isolation: {
          name: 'Isolation',
          words: [
            { word: 'lonely', definition: 'sad from being alone', category: 'isolation' },
            { word: 'isolated', definition: 'separated from others', category: 'isolation' },
            { word: 'solitary', definition: 'alone or single', category: 'isolation' },
            { word: 'alone', definition: 'without others', category: 'isolation' },
            { word: 'secluded', definition: 'kept away from others', category: 'isolation' },
            { word: 'remote', definition: 'far from others', category: 'isolation' },
            { word: 'distant', definition: 'far away', category: 'isolation' },
            { word: 'detached', definition: 'not connected', category: 'isolation' }
          ]
        },
        abandonment: {
          name: 'Abandonment',
          words: [
            { word: 'abandoned', definition: 'deserted or left behind', category: 'abandonment' },
            { word: 'forsaken', definition: 'abandoned or deserted', category: 'abandonment' },
            { word: 'deserted', definition: 'abandoned or left empty', category: 'abandonment' },
            { word: 'forlorn', definition: 'pitifully sad and abandoned', category: 'abandonment' },
            { word: 'neglected', definition: 'not given attention', category: 'abandonment' },
            { word: 'ignored', definition: 'not noticed', category: 'abandonment' },
            { word: 'rejected', definition: 'refused or dismissed', category: 'abandonment' },
            { word: 'discarded', definition: 'thrown away', category: 'abandonment' }
          ]
        },
        separation: {
          name: 'Separation',
          words: [
            { word: 'estranged', definition: 'no longer close', category: 'separation' },
            { word: 'alienated', definition: 'feeling isolated', category: 'separation' },
            { word: 'divided', definition: 'separated into parts', category: 'separation' },
            { word: 'parted', definition: 'separated', category: 'separation' },
            { word: 'split', definition: 'divided or separated', category: 'separation' },
            { word: 'severed', definition: 'cut off', category: 'separation' },
            { word: 'disconnected', definition: 'not connected', category: 'separation' },
            { word: 'disjointed', definition: 'not connected properly', category: 'separation' }
          ]
        }
      }
    },
    melancholy: {
      name: 'Melancholy & Sadness',
      icon: '😢',
      description: 'Words for deep sadness, melancholy, and emotional pain',
      categories: {
        all: {
          name: 'All Melancholy',
          words: [
            { word: 'melancholy', definition: 'sadness or depression', category: 'sadness' },
            { word: 'sorrowful', definition: 'feeling or showing sorrow', category: 'sadness' },
            { word: 'woeful', definition: 'full of sorrow', category: 'sadness' },
            { word: 'doleful', definition: 'mournful and sad', category: 'sadness' },
            { word: 'lugubrious', definition: 'looking or sounding sad', category: 'sadness' },
            { word: 'plaintive', definition: 'sounding sad and mournful', category: 'sadness' },
            { word: 'pensive', definition: 'deeply thoughtful', category: 'reflection' },
            { word: 'contemplative', definition: 'deeply thoughtful', category: 'reflection' },
            { word: 'wistful', definition: 'full of yearning', category: 'yearning' },
            { word: 'nostalgic', definition: 'longing for past', category: 'yearning' }
          ],
          phrases: [
            'tears that fall like rain',
            'hearts heavy with sorrow',
            'memories that bring pain',
            'souls weighed down by sadness',
            'eyes that have forgotten joy'
          ]
        },
        sadness: {
          name: 'Sadness',
          words: [
            { word: 'melancholy', definition: 'sadness or depression', category: 'sadness' },
            { word: 'sorrowful', definition: 'feeling or showing sorrow', category: 'sadness' },
            { word: 'woeful', definition: 'full of sorrow', category: 'sadness' },
            { word: 'doleful', definition: 'mournful and sad', category: 'sadness' },
            { word: 'lugubrious', definition: 'looking or sounding sad', category: 'sadness' },
            { word: 'plaintive', definition: 'sounding sad and mournful', category: 'sadness' },
            { word: 'sad', definition: 'unhappy or sorrowful', category: 'sadness' },
            { word: 'unhappy', definition: 'not happy', category: 'sadness' }
          ]
        },
        reflection: {
          name: 'Reflection',
          words: [
            { word: 'pensive', definition: 'deeply thoughtful', category: 'reflection' },
            { word: 'contemplative', definition: 'deeply thoughtful', category: 'reflection' },
            { word: 'meditative', definition: 'involving meditation', category: 'reflection' },
            { word: 'introspective', definition: 'examining own thoughts', category: 'reflection' },
            { word: 'philosophical', definition: 'relating to philosophy', category: 'reflection' },
            { word: 'thoughtful', definition: 'showing consideration', category: 'reflection' },
            { word: 'reflective', definition: 'capable of reflection', category: 'reflection' },
            { word: 'ruminative', definition: 'deeply thoughtful', category: 'reflection' }
          ]
        },
        yearning: {
          name: 'Yearning',
          words: [
            { word: 'wistful', definition: 'full of yearning', category: 'yearning' },
            { word: 'nostalgic', definition: 'longing for past', category: 'yearning' },
            { word: 'yearning', definition: 'deep longing or desire', category: 'yearning' },
            { word: 'longing', definition: 'strong desire', category: 'yearning' },
            { word: 'craving', definition: 'intense desire', category: 'yearning' },
            { word: 'hunger', definition: 'strong desire', category: 'yearning' },
            { word: 'thirst', definition: 'strong desire', category: 'yearning' },
            { word: 'ache', definition: 'painful longing', category: 'yearning' }
          ]
        }
      }
    },
    darkness: {
      name: 'Darkness & Depression',
      icon: '🌑',
      description: 'Words for darkness, depression, and emotional shadows',
      categories: {
        all: {
          name: 'All Darkness',
          words: [
            { word: 'dark', definition: 'without light', category: 'darkness' },
            { word: 'gloomy', definition: 'dark and depressing', category: 'darkness' },
            { word: 'bleak', definition: 'cold and miserable', category: 'darkness' },
            { word: 'dismal', definition: 'depressing and dreary', category: 'darkness' },
            { word: 'depressed', definition: 'feeling sad and hopeless', category: 'depression' },
            { word: 'dejected', definition: 'sad and dispirited', category: 'depression' },
            { word: 'disheartened', definition: 'discouraged', category: 'depression' },
            { word: 'demoralized', definition: 'having lost confidence', category: 'depression' },
            { word: 'shadowed', definition: 'covered in shadow', category: 'darkness' },
            { word: 'obscured', definition: 'hidden from view', category: 'darkness' }
          ],
          phrases: [
            'shadows that consume the light',
            'darkness that never lifts',
            'souls lost in the void',
            'hearts that beat in blackness',
            'minds trapped in night'
          ]
        },
        darkness: {
          name: 'Darkness',
          words: [
            { word: 'dark', definition: 'without light', category: 'darkness' },
            { word: 'gloomy', definition: 'dark and depressing', category: 'darkness' },
            { word: 'bleak', definition: 'cold and miserable', category: 'darkness' },
            { word: 'dismal', definition: 'depressing and dreary', category: 'darkness' },
            { word: 'shadowed', definition: 'covered in shadow', category: 'darkness' },
            { word: 'obscured', definition: 'hidden from view', category: 'darkness' },
            { word: 'dim', definition: 'not bright', category: 'darkness' },
            { word: 'murky', definition: 'dark and gloomy', category: 'darkness' }
          ]
        },
        depression: {
          name: 'Depression',
          words: [
            { word: 'depressed', definition: 'feeling sad and hopeless', category: 'depression' },
            { word: 'dejected', definition: 'sad and dispirited', category: 'depression' },
            { word: 'disheartened', definition: 'discouraged', category: 'depression' },
            { word: 'demoralized', definition: 'having lost confidence', category: 'depression' },
            { word: 'downcast', definition: 'sad and depressed', category: 'depression' },
            { word: 'crestfallen', definition: 'disappointed and sad', category: 'depression' },
            { word: 'dispirited', definition: 'having lost enthusiasm', category: 'depression' },
            { word: 'despondent', definition: 'in low spirits', category: 'depression' }
          ]
        },
        emptiness: {
          name: 'Emptiness',
          words: [
            { word: 'empty', definition: 'containing nothing', category: 'emptiness' },
            { word: 'hollow', definition: 'having empty space inside', category: 'emptiness' },
            { word: 'void', definition: 'completely empty space', category: 'emptiness' },
            { word: 'vacant', definition: 'empty or unoccupied', category: 'emptiness' },
            { word: 'barren', definition: 'unable to produce', category: 'emptiness' },
            { word: 'deserted', definition: 'abandoned or left empty', category: 'emptiness' },
            { word: 'abandoned', definition: 'deserted or left behind', category: 'emptiness' },
            { word: 'forsaken', definition: 'abandoned or deserted', category: 'emptiness' }
          ]
        }
      }
    }
  };

  const getFilteredWords = () => {
    if (selectedTheme === 'all') {
      // Combine words from all themes
      const allWords = [];
      Object.values(sadThemes).forEach(theme => {
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

    const theme = sadThemes[selectedTheme];
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
      Object.values(sadThemes).forEach(theme => {
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

    const theme = sadThemes[selectedTheme];
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
    
    // Sad template phrases that can incorporate the generated words
    const templatePhrases = [
      'Her {word} heart ached',
      'His {word} soul cried',
      'The {word} silence of',
      'She felt {word} as',
      'His {word} eyes reflected',
      'The {word} emptiness of',
      'They were {word} in their',
      'Her {word} spirit was',
      'His {word} pain consumed',
      'The {word} darkness of',
      'She became {word} when',
      'His {word} loneliness grew',
      'The {word} sorrow of',
      'Her {word} tears fell',
      'His {word} despair deepened',
      'The {word} loss of',
      'She felt {word} in the',
      'His {word} grief overwhelmed',
      'The {word} melancholy of',
      'Her {word} sadness weighed',
      'His {word} hopelessness grew',
      'The {word} abandonment of',
      'She was {word} by the',
      'His {word} isolation became',
      'The {word} desolation of',
      'Her {word} spirit was broken',
      'His {word} dreams were crushed',
      'The {word} futility of',
      'She embraced her {word} nature',
      'His {word} weakness showed',
      'The {word} meaninglessness of',
      'Her {word} vulnerability was',
      'His {word} defeat was',
      'The {word} emptiness that',
      'She surrendered to {word}',
      'His {word} surrender was',
      'The {word} void that',
      'Her {word} resignation to',
      'His {word} acceptance of'
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
      // Grief & Loss
      loss: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      sorrow: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pain: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      destruction: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      loneliness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      abandonment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      
      // Despair & Hopelessness
      hopelessness: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      failure: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      weakness: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      
      // Loneliness & Isolation
      isolation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      separation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      
      // Melancholy & Sadness
      sadness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      reflection: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      yearning: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      
      // Darkness & Depression
      darkness: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      depression: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      emptiness: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
      themed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getAvailableCategories = () => {
    if (selectedTheme === 'all') return [];
    const theme = sadThemes[selectedTheme];
    return theme?.categories ? Object.keys(theme.categories) : [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          😢 Sad Words Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover melancholic and sorrowful vocabulary for emotional writing, poetry, and sad scenes
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(sadThemes).map(([key, theme]) => (
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getAvailableCategories().map(category => (
              <option key={category} value={category}>
                {sadThemes[selectedTheme]?.categories[category]?.name || category}
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Include Phrases Toggle */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={includePhrases}
              onChange={(e) => setIncludePhrases(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Include Phrases</span>
          </label>
        </div>
      </div>

      {/* Theme Description */}
      {selectedTheme !== 'all' && sadThemes[selectedTheme]?.description && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            {sadThemes[selectedTheme].description}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center mb-8">
        <button
          onClick={generateBoth}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          😢 Generate Sad Words
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
                  💔 Generated Sad Words
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showDefinitions}
                      onChange={(e) => setShowDefinitions(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  💭 Generated Sad Phrases
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
                        ✨ This phrase incorporates the sad word "<strong>{phraseObj.word}</strong>" from your generated words
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
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
          💡 Sad Writing Tips
        </h3>
        <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-2">
          <li>• Use these words to add emotional depth to sad scenes and poetry</li>
          <li>• Mix different themes to create varied emotional expressions</li>
          <li>• Combine words and phrases to build compelling sad narratives</li>
          <li>• Use the definitions to understand the emotional nuances</li>
          <li>• Experiment with different categories to find your melancholic voice</li>
        </ul>
      </div>
    </div>
  );
};

export default SadWordsGenerator; 