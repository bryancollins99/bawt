import React, { useState } from 'react';

const RandomWordsGenerator = () => {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wordCount, setWordCount] = useState(5);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [generatedPhrases, setGeneratedPhrases] = useState([]);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [includePhrases, setIncludePhrases] = useState(true);

  const wordThemes = {
    all: {
      name: 'All Themes',
      icon: '🎲',
      description: 'Mix of words from all themes and categories'
    },
    academic: {
      name: 'Academic & Essay',
      icon: '📚',
      description: 'Formal vocabulary perfect for essays, research papers, and academic writing',
      categories: {
        all: {
          name: 'All Academic',
          words: [
            { word: 'consequently', definition: 'as a result; therefore', category: 'transition' },
            { word: 'furthermore', definition: 'in addition; moreover', category: 'transition' },
            { word: 'nevertheless', definition: 'in spite of that; however', category: 'transition' },
            { word: 'substantiate', definition: 'provide evidence to support', category: 'analysis' },
            { word: 'elucidate', definition: 'make clear; explain', category: 'analysis' },
            { word: 'delineate', definition: 'describe or portray precisely', category: 'analysis' },
            { word: 'pertinent', definition: 'relevant or applicable', category: 'evaluation' },
            { word: 'comprehensive', definition: 'complete; including all elements', category: 'evaluation' },
            { word: 'methodological', definition: 'relating to methods or procedures', category: 'research' },
            { word: 'empirical', definition: 'based on observation or experience', category: 'research' }
          ],
          phrases: [
            'furthermore, the evidence suggests',
            'consequently, this leads to',
            'nevertheless, it remains clear that',
            'in light of these findings',
            'this demonstrates the significance of'
          ]
        },
        transition: {
          name: 'Transition Words',
          words: [
            { word: 'moreover', definition: 'in addition; furthermore', category: 'transition' },
            { word: 'conversely', definition: 'in contrast; on the other hand', category: 'transition' },
            { word: 'subsequently', definition: 'afterward; following', category: 'transition' },
            { word: 'accordingly', definition: 'in accordance with; therefore', category: 'transition' },
            { word: 'simultaneously', definition: 'at the same time', category: 'transition' },
            { word: 'preliminary', definition: 'preparatory; introductory', category: 'transition' },
            { word: 'ultimately', definition: 'finally; in the end', category: 'transition' },
            { word: 'initially', definition: 'at first; in the beginning', category: 'transition' }
          ]
        },
        analysis: {
          name: 'Analysis Words',
          words: [
            { word: 'scrutinize', definition: 'examine closely and critically', category: 'analysis' },
            { word: 'evaluate', definition: 'assess the value or quality', category: 'analysis' },
            { word: 'examine', definition: 'inspect closely', category: 'analysis' },
            { word: 'investigate', definition: 'carry out research into', category: 'analysis' },
            { word: 'analyze', definition: 'examine methodically', category: 'analysis' },
            { word: 'interpret', definition: 'explain the meaning of', category: 'analysis' },
            { word: 'assess', definition: 'evaluate or estimate', category: 'analysis' },
            { word: 'examine', definition: 'inspect or study closely', category: 'analysis' }
          ]
        },
        research: {
          name: 'Research Terms',
          words: [
            { word: 'hypothesis', definition: 'proposed explanation for observation', category: 'research' },
            { word: 'methodology', definition: 'system of methods used', category: 'research' },
            { word: 'correlation', definition: 'mutual relationship between variables', category: 'research' },
            { word: 'causation', definition: 'action of causing something', category: 'research' },
            { word: 'variable', definition: 'factor that can change', category: 'research' },
            { word: 'sample', definition: 'representative part of population', category: 'research' },
            { word: 'validity', definition: 'quality of being logically sound', category: 'research' },
            { word: 'reliability', definition: 'consistency of measurement', category: 'research' }
          ]
        },
        evaluation: {
          name: 'Evaluation Words',
          words: [
            { word: 'significant', definition: 'important; meaningful', category: 'evaluation' },
            { word: 'relevant', definition: 'closely connected or appropriate', category: 'evaluation' },
            { word: 'appropriate', definition: 'suitable or proper', category: 'evaluation' },
            { word: 'adequate', definition: 'sufficient for the purpose', category: 'evaluation' },
            { word: 'effective', definition: 'successful in producing desired result', category: 'evaluation' },
            { word: 'efficient', definition: 'achieving maximum productivity', category: 'evaluation' },
            { word: 'comprehensive', definition: 'complete; including all elements', category: 'evaluation' },
            { word: 'thorough', definition: 'complete with regard to every detail', category: 'evaluation' }
          ]
        }
      }
    },
    nonfiction: {
      name: 'Non-Fiction & Business',
      icon: '📊',
      description: 'Professional vocabulary for business writing, articles, and non-fiction',
      categories: {
        all: {
          name: 'All Non-Fiction',
          words: [
            { word: 'implement', definition: 'put into effect; execute', category: 'action' },
            { word: 'facilitate', definition: 'make easier; help bring about', category: 'action' },
            { word: 'optimize', definition: 'make the best use of', category: 'improvement' },
            { word: 'leverage', definition: 'use to maximum advantage', category: 'strategy' },
            { word: 'streamline', definition: 'make more efficient', category: 'improvement' },
            { word: 'innovate', definition: 'introduce new methods or ideas', category: 'creativity' },
            { word: 'collaborate', definition: 'work together', category: 'teamwork' },
            { word: 'strategize', definition: 'plan carefully', category: 'strategy' },
            { word: 'prioritize', definition: 'arrange in order of importance', category: 'management' },
            { word: 'synthesize', definition: 'combine into a coherent whole', category: 'analysis' }
          ],
          phrases: [
            'this demonstrates the effectiveness of',
            'furthermore, the data indicates',
            'consequently, this leads to improved',
            'in addition, research shows that',
            'therefore, it is essential to'
          ]
        },
        action: {
          name: 'Action Words',
          words: [
            { word: 'execute', definition: 'carry out or perform', category: 'action' },
            { word: 'deploy', definition: 'bring into effective action', category: 'action' },
            { word: 'initiate', definition: 'begin; start', category: 'action' },
            { word: 'coordinate', definition: 'organize harmoniously', category: 'action' },
            { word: 'orchestrate', definition: 'arrange or direct', category: 'action' },
            { word: 'mobilize', definition: 'prepare for action', category: 'action' },
            { word: 'expedite', definition: 'speed up; accelerate', category: 'action' },
            { word: 'facilitate', definition: 'make easier', category: 'action' }
          ]
        },
        improvement: {
          name: 'Improvement Words',
          words: [
            { word: 'enhance', definition: 'improve; increase', category: 'improvement' },
            { word: 'refine', definition: 'improve by making small changes', category: 'improvement' },
            { word: 'upgrade', definition: 'raise to higher standard', category: 'improvement' },
            { word: 'optimize', definition: 'make the best use of', category: 'improvement' },
            { word: 'streamline', definition: 'make more efficient', category: 'improvement' },
            { word: 'modernize', definition: 'adapt to modern needs', category: 'improvement' },
            { word: 'revitalize', definition: 'give new life to', category: 'improvement' },
            { word: 'strengthen', definition: 'make stronger', category: 'improvement' }
          ]
        },
        strategy: {
          name: 'Strategy Words',
          words: [
            { word: 'leverage', definition: 'use to maximum advantage', category: 'strategy' },
            { word: 'strategize', definition: 'plan carefully', category: 'strategy' },
            { word: 'position', definition: 'place in particular situation', category: 'strategy' },
            { word: 'differentiate', definition: 'make distinct', category: 'strategy' },
            { word: 'capitalize', definition: 'take advantage of', category: 'strategy' },
            { word: 'maximize', definition: 'make as large as possible', category: 'strategy' },
            { word: 'minimize', definition: 'reduce to smallest possible', category: 'strategy' },
            { word: 'prioritize', definition: 'arrange by importance', category: 'strategy' }
          ]
        },
        teamwork: {
          name: 'Teamwork Words',
          words: [
            { word: 'collaborate', definition: 'work together', category: 'teamwork' },
            { word: 'coordinate', definition: 'organize harmoniously', category: 'teamwork' },
            { word: 'synergize', definition: 'combine for greater effect', category: 'teamwork' },
            { word: 'unite', definition: 'come together', category: 'teamwork' },
            { word: 'align', definition: 'bring into line', category: 'teamwork' },
            { word: 'integrate', definition: 'combine into whole', category: 'teamwork' },
            { word: 'consolidate', definition: 'combine into single unit', category: 'teamwork' },
            { word: 'unify', definition: 'make or become united', category: 'teamwork' }
          ]
        }
      }
    },
    power: {
      name: 'Power Words',
      icon: '💪',
      description: 'Strong, impactful words that command attention and create urgency',
      categories: {
        all: {
          name: 'All Power Words',
          words: [
            { word: 'revolutionary', definition: 'involving dramatic change', category: 'impact' },
            { word: 'breakthrough', definition: 'important discovery or development', category: 'achievement' },
            { word: 'transformative', definition: 'causing great change', category: 'change' },
            { word: 'unprecedented', definition: 'never done before', category: 'uniqueness' },
            { word: 'extraordinary', definition: 'very unusual or remarkable', category: 'exceptional' },
            { word: 'remarkable', definition: 'worthy of attention', category: 'exceptional' },
            { word: 'essential', definition: 'absolutely necessary', category: 'importance' },
            { word: 'critical', definition: 'of crucial importance', category: 'importance' },
            { word: 'vital', definition: 'absolutely necessary', category: 'importance' },
            { word: 'crucial', definition: 'decisive or critical', category: 'importance' }
          ],
          phrases: [
            'revolutionary breakthrough that',
            'transformative impact on',
            'unprecedented opportunity to',
            'essential solution for',
            'critical moment when'
          ]
        },
        impact: {
          name: 'Impact Words',
          words: [
            { word: 'explosive', definition: 'sudden and dramatic', category: 'impact' },
            { word: 'dramatic', definition: 'striking in appearance', category: 'impact' },
            { word: 'powerful', definition: 'having great power', category: 'impact' },
            { word: 'intense', definition: 'of extreme force', category: 'impact' },
            { word: 'overwhelming', definition: 'very great in amount', category: 'impact' },
            { word: 'devastating', definition: 'highly destructive', category: 'impact' },
            { word: 'staggering', definition: 'deeply shocking', category: 'impact' },
            { word: 'astounding', definition: 'surprisingly impressive', category: 'impact' }
          ]
        },
        achievement: {
          name: 'Achievement Words',
          words: [
            { word: 'breakthrough', definition: 'important discovery', category: 'achievement' },
            { word: 'milestone', definition: 'significant event', category: 'achievement' },
            { word: 'accomplishment', definition: 'something achieved', category: 'achievement' },
            { word: 'success', definition: 'achievement of aim', category: 'achievement' },
            { word: 'victory', definition: 'act of defeating enemy', category: 'achievement' },
            { word: 'triumph', definition: 'great victory', category: 'achievement' },
            { word: 'conquest', definition: 'act of conquering', category: 'achievement' },
            { word: 'mastery', definition: 'comprehensive knowledge', category: 'achievement' }
          ]
        },
        urgency: {
          name: 'Urgency Words',
          words: [
            { word: 'immediate', definition: 'occurring at once', category: 'urgency' },
            { word: 'urgent', definition: 'requiring immediate action', category: 'urgency' },
            { word: 'critical', definition: 'of crucial importance', category: 'urgency' },
            { word: 'pressing', definition: 'requiring immediate attention', category: 'urgency' },
            { word: 'crucial', definition: 'decisive or critical', category: 'urgency' },
            { word: 'vital', definition: 'absolutely necessary', category: 'urgency' },
            { word: 'essential', definition: 'absolutely necessary', category: 'urgency' },
            { word: 'imperative', definition: 'of vital importance', category: 'urgency' }
          ]
        },
        exclusivity: {
          name: 'Exclusivity Words',
          words: [
            { word: 'exclusive', definition: 'restricted to particular person', category: 'exclusivity' },
            { word: 'premium', definition: 'of superior quality', category: 'exclusivity' },
            { word: 'elite', definition: 'select group', category: 'exclusivity' },
            { word: 'privileged', definition: 'having special advantage', category: 'exclusivity' },
            { word: 'distinguished', definition: 'successful and respected', category: 'exclusivity' },
            { word: 'prestigious', definition: 'inspiring respect', category: 'exclusivity' },
            { word: 'sophisticated', definition: 'developed to high degree', category: 'exclusivity' },
            { word: 'refined', definition: 'elegant and cultured', category: 'exclusivity' }
          ]
        }
      }
    },
    emotional: {
      name: 'Emotional Words',
      icon: '💝',
      description: 'Words that evoke strong emotions and create emotional connections',
      categories: {
        all: {
          name: 'All Emotional',
          words: [
            { word: 'heartfelt', definition: 'sincere and deeply felt', category: 'sincerity' },
            { word: 'passionate', definition: 'showing strong feelings', category: 'intensity' },
            { word: 'tender', definition: 'gentle and loving', category: 'gentleness' },
            { word: 'yearning', definition: 'deep longing or desire', category: 'desire' },
            { word: 'nostalgic', definition: 'longing for past', category: 'memory' },
            { word: 'inspiring', definition: 'arousing enthusiasm', category: 'motivation' },
            { word: 'touching', definition: 'arousing sympathy', category: 'empathy' },
            { word: 'moving', definition: 'arousing deep emotion', category: 'empathy' },
            { word: 'profound', definition: 'very great or intense', category: 'depth' },
            { word: 'intimate', definition: 'closely acquainted', category: 'closeness' }
          ],
          phrases: [
            'heartfelt gratitude for',
            'passionate commitment to',
            'tender moments shared',
            'yearning for connection',
            'nostalgic memories of'
          ]
        },
        positive: {
          name: 'Positive Emotions',
          words: [
            { word: 'joyful', definition: 'full of joy', category: 'positive' },
            { word: 'ecstatic', definition: 'overwhelmingly happy', category: 'positive' },
            { word: 'blissful', definition: 'perfectly happy', category: 'positive' },
            { word: 'elated', definition: 'very happy and excited', category: 'positive' },
            { word: 'radiant', definition: 'sending out light; glowing', category: 'positive' },
            { word: 'exuberant', definition: 'full of energy and excitement', category: 'positive' },
            { word: 'jubilant', definition: 'feeling great happiness', category: 'positive' },
            { word: 'euphoric', definition: 'intensely happy', category: 'positive' }
          ]
        },
        negative: {
          name: 'Negative Emotions',
          words: [
            { word: 'anguish', definition: 'severe mental or physical pain', category: 'negative' },
            { word: 'despair', definition: 'complete loss of hope', category: 'negative' },
            { word: 'grief', definition: 'deep sorrow', category: 'negative' },
            { word: 'melancholy', definition: 'sadness or depression', category: 'negative' },
            { word: 'torment', definition: 'severe physical or mental suffering', category: 'negative' },
            { word: 'agony', definition: 'extreme physical or mental suffering', category: 'negative' },
            { word: 'sorrow', definition: 'feeling of deep distress', category: 'negative' },
            { word: 'woe', definition: 'great sorrow or distress', category: 'negative' }
          ]
        },
        intensity: {
          name: 'Intensity Words',
          words: [
            { word: 'passionate', definition: 'showing strong feelings', category: 'intensity' },
            { word: 'fervent', definition: 'showing great warmth', category: 'intensity' },
            { word: 'ardent', definition: 'enthusiastic or passionate', category: 'intensity' },
            { word: 'zealous', definition: 'showing great energy', category: 'intensity' },
            { word: 'intense', definition: 'of extreme force', category: 'intensity' },
            { word: 'fierce', definition: 'showing strong emotion', category: 'intensity' },
            { word: 'vehement', definition: 'showing strong feeling', category: 'intensity' },
            { word: 'ferocious', definition: 'savagely fierce', category: 'intensity' }
          ]
        },
        empathy: {
          name: 'Empathy Words',
          words: [
            { word: 'compassionate', definition: 'feeling sympathy', category: 'empathy' },
            { word: 'understanding', definition: 'sympathetically aware', category: 'empathy' },
            { word: 'empathetic', definition: 'showing empathy', category: 'empathy' },
            { word: 'caring', definition: 'displaying kindness', category: 'empathy' },
            { word: 'supportive', definition: 'providing encouragement', category: 'empathy' },
            { word: 'nurturing', definition: 'caring and protective', category: 'empathy' },
            { word: 'gentle', definition: 'mild and kind', category: 'empathy' },
            { word: 'tender', definition: 'gentle and loving', category: 'empathy' }
          ]
        }
      }
    },
    creative: {
      name: 'Creative Writing',
      icon: '✍️',
      description: 'Words perfect for creative writing, storytelling, and fiction',
      categories: {
        all: {
          name: 'All Creative',
          words: [
            { word: 'serendipity', definition: 'pleasant surprise; fortunate accident', category: 'emotion' },
            { word: 'labyrinthine', definition: 'complicated and confusing', category: 'setting' },
            { word: 'ephemeral', definition: 'lasting for a very short time', category: 'time' },
            { word: 'cacophony', definition: 'harsh, discordant mixture of sounds', category: 'sound' },
            { word: 'ethereal', definition: 'extremely delicate and light', category: 'description' },
            { word: 'mellifluous', definition: 'sweet or musical; pleasant to hear', category: 'sound' },
            { word: 'ubiquitous', definition: 'present everywhere', category: 'description' },
            { word: 'enigmatic', definition: 'difficult to interpret or understand', category: 'character' },
            { word: 'resilient', definition: 'able to recover quickly from difficulties', category: 'character' },
            { word: 'voracious', definition: 'wanting or devouring great quantities', category: 'character' }
          ],
          phrases: [
            'shadows dancing on cobblestone streets',
            'whispers carried by midnight winds',
            'memories etched in golden light',
            'promises woven into starlight',
            'dreams floating like autumn leaves'
          ]
        },
        emotion: {
          name: 'Emotions',
          words: [
            { word: 'melancholy', definition: 'thoughtful sadness or pensive sorrow', category: 'emotion' },
            { word: 'euphoria', definition: 'intense happiness and self-confidence', category: 'emotion' },
            { word: 'trepidation', definition: 'feeling of fear or agitation', category: 'emotion' },
            { word: 'serenity', definition: 'state of being calm and peaceful', category: 'emotion' },
            { word: 'ardor', definition: 'enthusiasm or passion', category: 'emotion' }
          ]
        },
        character: {
          name: 'Character Traits',
          words: [
            { word: 'stoic', definition: 'enduring pain without showing feelings', category: 'character' },
            { word: 'charismatic', definition: 'attracting and charming others', category: 'character' },
            { word: 'mysterious', definition: 'difficult to understand or explain', category: 'character' },
            { word: 'tenacious', definition: 'tending to keep a firm hold', category: 'character' },
            { word: 'eloquent', definition: 'fluent or persuasive in speaking', category: 'character' }
          ]
        },
        setting: {
          name: 'Settings',
          words: [
            { word: 'gothic', definition: 'dark, mysterious, and gloomy', category: 'setting' },
            { word: 'rustic', definition: 'relating to the countryside', category: 'setting' },
            { word: 'urban', definition: 'relating to a city or town', category: 'setting' },
            { word: 'desolate', definition: 'deserted and lonely', category: 'setting' },
            { word: 'bustling', definition: 'full of energetic activity', category: 'setting' }
          ]
        }
      }
    },
    descriptive: {
      name: 'Descriptive Words',
      icon: '🎨',
      description: 'Rich vocabulary for vivid descriptions and imagery',
      categories: {
        all: {
          name: 'All Descriptive',
          words: [
            { word: 'iridescent', definition: 'showing luminous colors that change from different angles', category: 'visual' },
            { word: 'velvety', definition: 'soft and smooth like velvet', category: 'texture' },
            { word: 'crystalline', definition: 'clear and transparent like crystal', category: 'visual' },
            { word: 'gossamer', definition: 'delicate, light, and insubstantial', category: 'texture' },
            { word: 'luminous', definition: 'full of or shedding light; bright', category: 'visual' },
            { word: 'silken', definition: 'smooth and soft like silk', category: 'texture' },
            { word: 'pristine', definition: 'in perfect condition; unspoiled', category: 'visual' },
            { word: 'weathered', definition: 'worn by long exposure to the atmosphere', category: 'texture' },
            { word: 'radiant', definition: 'sending out light; shining or glowing', category: 'visual' },
            { word: 'gritty', definition: 'containing or covered with grit', category: 'texture' }
          ],
          phrases: [
            'golden light filtering through stained glass',
            'silver mist clinging to morning meadows',
            'crimson sunset painting the horizon',
            'emerald waves crashing against cliffs',
            'amber leaves swirling in autumn winds'
          ]
        },
        visual: {
          name: 'Visual',
          words: [
            { word: 'vibrant', definition: 'full of energy and enthusiasm', category: 'visual' },
            { word: 'dull', definition: 'lacking brightness or luster', category: 'visual' },
            { word: 'sparkling', definition: 'shining with bright points of light', category: 'visual' },
            { word: 'murky', definition: 'dark and gloomy, especially due to thick mist', category: 'visual' },
            { word: 'brilliant', definition: 'exceptionally clever or talented', category: 'visual' }
          ]
        },
        texture: {
          name: 'Texture',
          words: [
            { word: 'rough', definition: 'having an uneven or irregular surface', category: 'texture' },
            { word: 'smooth', definition: 'having an even and regular surface', category: 'texture' },
            { word: 'coarse', definition: 'rough or loose in texture', category: 'texture' },
            { word: 'sleek', definition: 'smooth and glossy', category: 'texture' },
            { word: 'bristly', definition: 'covered with stiff hairs or bristles', category: 'texture' }
          ]
        }
      }
    },
    action: {
      name: 'Action Words',
      icon: '⚡',
      description: 'Dynamic verbs and action-oriented vocabulary',
      categories: {
        all: {
          name: 'All Actions',
          words: [
            { word: 'dart', definition: 'move suddenly and rapidly', category: 'movement' },
            { word: 'whisper', definition: 'speak very softly', category: 'communication' },
            { word: 'twirl', definition: 'spin around and around', category: 'movement' },
            { word: 'grasp', definition: 'seize and hold firmly', category: 'physical' },
            { word: 'leap', definition: 'jump high or far', category: 'movement' },
            { word: 'murmur', definition: 'say something in a low voice', category: 'communication' },
            { word: 'glide', definition: 'move smoothly and continuously', category: 'movement' },
            { word: 'clutch', definition: 'grasp or hold tightly', category: 'physical' },
            { word: 'soar', definition: 'fly or rise high in the air', category: 'movement' },
            { word: 'whimper', definition: 'make a series of low, feeble sounds', category: 'communication' }
          ],
          phrases: [
            'dancing shadows across moonlit walls',
            'whispering secrets to the wind',
            'racing hearts pounding in chests',
            'fingers tracing invisible patterns',
            'eyes searching through darkness'
          ]
        },
        movement: {
          name: 'Movement',
          words: [
            { word: 'stagger', definition: 'walk or move unsteadily', category: 'movement' },
            { word: 'creep', definition: 'move slowly and carefully', category: 'movement' },
            { word: 'bound', definition: 'walk or run with leaping strides', category: 'movement' },
            { word: 'slink', definition: 'move smoothly and quietly', category: 'movement' },
            { word: 'tumble', definition: 'fall suddenly and clumsily', category: 'movement' }
          ]
        },
        communication: {
          name: 'Communication',
          words: [
            { word: 'shout', definition: 'utter a loud cry', category: 'communication' },
            { word: 'growl', definition: 'make a low guttural sound', category: 'communication' },
            { word: 'sigh', definition: 'emit a long, deep breath', category: 'communication' },
            { word: 'giggle', definition: 'laugh lightly in a nervous way', category: 'communication' },
            { word: 'groan', definition: 'make a deep inarticulate sound', category: 'communication' }
          ]
        }
      }
    },
    nature: {
      name: 'Nature & Environment',
      icon: '🌿',
      description: 'Words inspired by the natural world and environment',
      categories: {
        all: {
          name: 'All Nature',
          words: [
            { word: 'verdant', definition: 'green with grass or other rich vegetation', category: 'landscape' },
            { word: 'petrichor', definition: 'pleasant smell of earth after rain', category: 'weather' },
            { word: 'susurrus', definition: 'a whispering or rustling sound', category: 'sound' },
            { word: 'effulgent', definition: 'shining forth brilliantly; radiant', category: 'light' },
            { word: 'twilight', definition: 'the soft glowing light from the sky', category: 'time' },
            { word: 'aurora', definition: 'dawn; natural light display in polar regions', category: 'light' },
            { word: 'tranquil', definition: 'free from disturbance; calm', category: 'mood' },
            { word: 'serene', definition: 'calm, peaceful, and untroubled', category: 'mood' },
            { word: 'luminous', definition: 'full of or shedding light; bright', category: 'light' },
            { word: 'crystalline', definition: 'clear and transparent like crystal', category: 'texture' }
          ],
          phrases: [
            'morning dew glistening on petals',
            'ancient trees reaching toward heaven',
            'mountain peaks piercing clouds',
            'ocean waves crashing against rocks',
            'starlight dancing on water'
          ]
        },
        landscape: {
          name: 'Landscape',
          words: [
            { word: 'meadow', definition: 'a piece of grassland', category: 'landscape' },
            { word: 'ravine', definition: 'deep, narrow gorge', category: 'landscape' },
            { word: 'plateau', definition: 'area of high ground', category: 'landscape' },
            { word: 'valley', definition: 'low area between hills', category: 'landscape' },
            { word: 'cliff', definition: 'steep rock face', category: 'landscape' }
          ]
        },
        weather: {
          name: 'Weather',
          words: [
            { word: 'tempest', definition: 'violent storm', category: 'weather' },
            { word: 'zephyr', definition: 'gentle breeze', category: 'weather' },
            { word: 'deluge', definition: 'heavy downpour', category: 'weather' },
            { word: 'mist', definition: 'thin fog', category: 'weather' },
            { word: 'gale', definition: 'strong wind', category: 'weather' }
          ]
        }
      }
    },
    mystical: {
      name: 'Mystical & Fantasy',
      icon: '✨',
      description: 'Ethereal and magical words for fantasy and mystical writing',
      categories: {
        all: {
          name: 'All Mystical',
          words: [
            { word: 'transcendent', definition: 'beyond the range of normal experience', category: 'spiritual' },
            { word: 'ineffable', definition: 'too great to be expressed in words', category: 'spiritual' },
            { word: 'sublime', definition: 'inspiring awe through beauty or grandeur', category: 'spiritual' },
            { word: 'divine', definition: 'excellently beautiful; heavenly', category: 'spiritual' },
            { word: 'ethereal', definition: 'extremely delicate and light', category: 'spiritual' },
            { word: 'mystical', definition: 'relating to mysticism or spiritual mystery', category: 'spiritual' },
            { word: 'celestial', definition: 'positioned in or relating to the sky', category: 'cosmic' },
            { word: 'sacred', definition: 'dedicated to a religious purpose', category: 'spiritual' },
            { word: 'luminescence', definition: 'emission of light not caused by heat', category: 'cosmic' },
            { word: 'infinity', definition: 'limitless or endless space, time, or quantity', category: 'cosmic' }
          ],
          phrases: [
            'soul ascending beyond earthly bounds',
            'divine light piercing darkness',
            'whispers from the infinite',
            'sacred silence between heartbeats',
            'essence flowing like liquid starlight'
          ]
        },
        spiritual: {
          name: 'Spiritual',
          words: [
            { word: 'enlightenment', definition: 'spiritual insight', category: 'spiritual' },
            { word: 'nirvana', definition: 'perfect peace and happiness', category: 'spiritual' },
            { word: 'karma', definition: 'action and consequence', category: 'spiritual' },
            { word: 'zen', definition: 'meditative state', category: 'spiritual' },
            { word: 'aura', definition: 'distinctive atmosphere', category: 'spiritual' }
          ]
        },
        cosmic: {
          name: 'Cosmic',
          words: [
            { word: 'nebula', definition: 'cloud of gas and dust', category: 'cosmic' },
            { word: 'constellation', definition: 'group of stars', category: 'cosmic' },
            { word: 'galaxy', definition: 'system of stars', category: 'cosmic' },
            { word: 'orbit', definition: 'path around object', category: 'cosmic' },
            { word: 'cosmos', definition: 'universe as ordered system', category: 'cosmic' }
          ]
        }
      }
    }
  };

  const getFilteredWords = () => {
    if (selectedTheme === 'all') {
      // Combine words from all themes
      const allWords = [];
      Object.values(wordThemes).forEach(theme => {
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

    const theme = wordThemes[selectedTheme];
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
      Object.values(wordThemes).forEach(theme => {
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

    const theme = wordThemes[selectedTheme];
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
    const availablePhrases = getFilteredPhrases();
    const shuffled = [...availablePhrases].sort(() => Math.random() - 0.5);
    setGeneratedPhrases(shuffled.slice(0, Math.min(wordCount, availablePhrases.length)));
  };

  const generateBoth = () => {
    generateWords();
    if (includePhrases) {
      generatePhrases();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getCategoryColor = (category) => {
    const colors = {
      // Creative Writing
      emotion: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      character: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      setting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      
      // Descriptive
      visual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      texture: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      
      // Action
      movement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      communication: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      physical: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      
      // Nature
      landscape: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      weather: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      light: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      time: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
      sound: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      mood: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      
      // Mystical
      spiritual: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      cosmic: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      
      // Academic
      transition: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      analysis: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      evaluation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      
      // Non-Fiction
      action: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      improvement: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      strategy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      teamwork: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      creativity: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      management: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      
      // Power Words
      impact: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      achievement: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      change: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      uniqueness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      exceptional: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      importance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      urgency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      exclusivity: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      
      // Emotional Words
      sincerity: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      intensity: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      gentleness: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      desire: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      memory: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      motivation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      empathy: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      depth: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      closeness: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getAvailableCategories = () => {
    if (selectedTheme === 'all') return [];
    const theme = wordThemes[selectedTheme];
    return theme?.categories ? Object.keys(theme.categories) : [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎲 Random Words Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover inspiring words and phrases for your writing across multiple themes and categories
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
            {Object.entries(wordThemes).map(([key, theme]) => (
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
                {wordThemes[selectedTheme]?.categories[category]?.name || category}
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
      {selectedTheme !== 'all' && wordThemes[selectedTheme]?.description && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            {wordThemes[selectedTheme].description}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center mb-8">
        <button
          onClick={generateBoth}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🎲 Generate Random Words
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
                  📝 Generated Words
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
                  💭 Generated Phrases
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedPhrases.join('\n'))}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  📋 Copy Phrases
                </button>
              </div>
              <div className="space-y-3">
                {generatedPhrases.map((phrase, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <p className="text-gray-900 dark:text-white italic">
                      "{phrase}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Writing Tips */}
      <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
          💡 Writing Tips
        </h3>
        <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-2">
          <li>• Use these words to add variety and richness to your vocabulary</li>
          <li>• Mix different themes to create unique writing styles</li>
          <li>• Combine words and phrases to build compelling descriptions</li>
          <li>• Experiment with different categories to find your voice</li>
          <li>• Use the definitions to understand context and usage</li>
        </ul>
      </div>
    </div>
  );
};

export default RandomWordsGenerator; 