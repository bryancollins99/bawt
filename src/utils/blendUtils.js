// Famous blended words for examples
export const famousBlends = [
  { word1: 'breakfast', word2: 'lunch', result: 'brunch' },
  { word1: 'smoke', word2: 'fog', result: 'smog' },
  { word1: 'motor', word2: 'hotel', result: 'motel' },
  { word1: 'education', word2: 'entertainment', result: 'edutainment' },
  { word1: 'glamour', word2: 'camping', result: 'glamping' },
  { word1: 'web', word2: 'seminar', result: 'webinar' },
  { word1: 'emotion', word2: 'icon', result: 'emoticon' },
  { word1: 'spanish', word2: 'english', result: 'spanglish' },
  { word1: 'chuckle', word2: 'snort', result: 'chortle' },
  { word1: 'fantastic', word2: 'fabulous', result: 'fantabulous' },
  { word1: 'internet', word2: 'etiquette', result: 'netiquette' },
  { word1: 'channel', word2: 'tunnel', result: 'chunnel' }
];

// Vowel sounds for better blending
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

// Function to find syllable boundaries (simplified)
function findSyllableBoundary(word) {
  const word_lower = word.toLowerCase();
  const boundaries = [];
  
  // Look for vowel-consonant patterns
  for (let i = 0; i < word_lower.length - 1; i++) {
    const current = word_lower[i];
    const next = word_lower[i + 1];
    
    // Vowel followed by consonant
    if (vowels.includes(current) && consonants.includes(next)) {
      boundaries.push(i + 1);
    }
    
    // Double consonants
    if (consonants.includes(current) && consonants.includes(next) && current !== next) {
      boundaries.push(i + 1);
    }
  }
  
  return boundaries;
}

// Generate blend variations using different methods
function generateBlendVariations(word1, word2) {
  const variations = [];
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Method 1: Simple prefix + suffix combinations
  for (let i = 1; i < w1.length; i++) {
    for (let j = 1; j < w2.length; j++) {
      const prefix = w1.slice(0, i);
      const suffix = w2.slice(j);
      const blend = prefix + suffix;
      
      if (blend.length >= 3 && blend.length <= 15) {
        variations.push({
          result: blend,
          word1: w1,
          word2: w2,
          method: `First ${i} letters + Last ${w2.length - j} letters`,
          score: calculateBlendScore(blend, w1, w2, i, j)
        });
      }
    }
  }
  
  // Method 2: Reverse order (word2 + word1)
  for (let i = 1; i < w2.length; i++) {
    for (let j = 1; j < w1.length; j++) {
      const prefix = w2.slice(0, i);
      const suffix = w1.slice(j);
      const blend = prefix + suffix;
      
      if (blend.length >= 3 && blend.length <= 15) {
        variations.push({
          result: blend,
          word1: w2,
          word2: w1,
          method: `First ${i} letters + Last ${w1.length - j} letters (reversed)`,
          score: calculateBlendScore(blend, w2, w1, i, j)
        });
      }
    }
  }
  
  // Method 3: Syllable-based blending
  const syllables1 = findSyllableBoundary(w1);
  const syllables2 = findSyllableBoundary(w2);
  
  syllables1.forEach(boundary1 => {
    syllables2.forEach(boundary2 => {
      const prefix = w1.slice(0, boundary1);
      const suffix = w2.slice(boundary2);
      const blend = prefix + suffix;
      
      if (blend.length >= 3 && blend.length <= 15) {
        variations.push({
          result: blend,
          word1: w1,
          word2: w2,
          method: 'Syllable boundary',
          score: calculateBlendScore(blend, w1, w2, boundary1, boundary2) + 10 // Bonus for syllable awareness
        });
      }
    });
  });
  
  // Method 4: Overlap blending (find common endings/beginnings)
  for (let overlap = 1; overlap <= Math.min(w1.length, w2.length) - 1; overlap++) {
    const w1End = w1.slice(-overlap);
    const w2Start = w2.slice(0, overlap);
    
    if (w1End === w2Start) {
      const blend = w1 + w2.slice(overlap);
      variations.push({
        result: blend,
        word1: w1,
        word2: w2,
        method: `Overlap blend (${overlap} letters)`,
        score: calculateBlendScore(blend, w1, w2, w1.length - overlap, overlap) + 15 // Bonus for natural overlap
      });
    }
    
    // Reverse overlap
    const w2End = w2.slice(-overlap);
    const w1Start = w1.slice(0, overlap);
    
    if (w2End === w1Start) {
      const blend = w2 + w1.slice(overlap);
      variations.push({
        result: blend,
        word1: w2,
        word2: w1,
        method: `Overlap blend (${overlap} letters, reversed)`,
        score: calculateBlendScore(blend, w2, w1, w2.length - overlap, overlap) + 15
      });
    }
  }
  
  // Remove duplicates and sort by score
  const unique = variations.filter((v, i, arr) => 
    arr.findIndex(v2 => v2.result === v.result) === i
  );
  
  return unique.sort((a, b) => b.score - a.score);
}

// Score blends based on various criteria
function calculateBlendScore(blend, word1, word2, cutPoint1, cutPoint2) {
  let score = 0;
  
  // Length preference (not too short, not too long)
  if (blend.length >= 5 && blend.length <= 10) score += 20;
  else if (blend.length >= 4 && blend.length <= 12) score += 10;
  
  // Pronunciation flow (avoid difficult consonant clusters)
  const consonantClusters = blend.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi);
  if (!consonantClusters) score += 15;
  
  // Preserve recognizable parts of original words
  const recognition1 = Math.min(cutPoint1 / word1.length, 0.6) * 20;
  const recognition2 = Math.min((word2.length - cutPoint2) / word2.length, 0.6) * 20;
  score += recognition1 + recognition2;
  
  // Vowel distribution (should have vowels)
  const vowelCount = (blend.match(/[aeiou]/gi) || []).length;
  if (vowelCount >= 2) score += 10;
  
  // Avoid awkward combinations
  const awkwardPatterns = ['qx', 'xz', 'zx', 'qz', 'jv', 'vj'];
  const hasAwkward = awkwardPatterns.some(pattern => blend.includes(pattern));
  if (hasAwkward) score -= 20;
  
  // Favor balanced cuts (not too much from one word)
  const balance = 1 - Math.abs((cutPoint1 / word1.length) - ((word2.length - cutPoint2) / word2.length));
  score += balance * 15;
  
  return Math.round(score);
}

// Generate creative definitions for blends
function generateDefinition(blend, word1, word2) {
  const definitions = [
    `A combination of ${word1} and ${word2}`,
    `Something that is both ${word1}-like and ${word2}-like`,
    `The state of being ${word1} while also being ${word2}`,
    `A ${word1} that has qualities of ${word2}`,
    `When ${word1} meets ${word2}`,
    `A hybrid between ${word1} and ${word2}`,
    `The perfect mix of ${word1} and ${word2}`,
    `${word1} enhanced with ${word2} characteristics`
  ];
  
  return definitions[Math.floor(Math.random() * definitions.length)];
}

// Main function to blend two words
export function blendWords(word1, word2) {
  if (!word1 || !word2) return null;
  
  const variations = generateBlendVariations(word1, word2);
  
  // Add definitions to top variations
  const withDefinitions = variations.slice(0, 12).map(variation => ({
    ...variation,
    definition: generateDefinition(variation.result, variation.word1, variation.word2)
  }));
  
  // Find the best recommendation
  const recommended = withDefinitions.length > 0 ? withDefinitions[0] : null;
  
  return {
    word1: word1.toLowerCase(),
    word2: word2.toLowerCase(),
    variations: withDefinitions,
    recommended,
    totalGenerated: variations.length
  };
}

// Get suggestions for common word combinations
export function getBlendSuggestions(category = 'general') {
  const suggestions = {
    general: [
      ['breakfast', 'lunch'],
      ['smoke', 'fog'],
      ['glamour', 'camping'],
      ['web', 'seminar']
    ],
    tech: [
      ['internet', 'etiquette'],
      ['web', 'log'],
      ['electronic', 'mail'],
      ['cyber', 'space']
    ],
    food: [
      ['croissant', 'donut'],
      ['spoon', 'fork'],
      ['cheese', 'burger'],
      ['smoothie', 'bowl']
    ],
    creative: [
      ['fantastic', 'fabulous'],
      ['gigantic', 'enormous'],
      ['sparkle', 'glitter'],
      ['whisper', 'murmur']
    ]
  };
  
  return suggestions[category] || suggestions.general;
} 