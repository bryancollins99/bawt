// Simple rhyme detection based on word endings
export const findRhymes = (word) => {
  const commonRhymes = {
    'ay': ['day', 'way', 'say', 'play', 'stay', 'may', 'bay', 'ray', 'pay', 'lay'],
    'ight': ['night', 'light', 'bright', 'sight', 'fight', 'right', 'might', 'flight', 'height', 'tight'],
    'ove': ['love', 'dove', 'above', 'shove', 'glove'],
    'eart': ['heart', 'start', 'part', 'art', 'chart', 'smart', 'cart'],
    'ound': ['sound', 'found', 'round', 'ground', 'bound', 'wound', 'pound'],
    'ime': ['time', 'rhyme', 'climb', 'prime', 'lime', 'chime', 'crime'],
    'eed': ['need', 'seed', 'feed', 'speed', 'read', 'lead', 'deed'],
    'ide': ['side', 'ride', 'hide', 'wide', 'pride', 'slide', 'guide'],
    'ame': ['name', 'game', 'same', 'fame', 'frame', 'blame', 'flame'],
    'ake': ['make', 'take', 'lake', 'wake', 'cake', 'brake', 'shake'],
  };

  const lowerWord = word.toLowerCase();
  
  // Check for exact matches first
  for (const [ending, words] of Object.entries(commonRhymes)) {
    if (words.includes(lowerWord)) {
      return words.filter(w => w !== lowerWord);
    }
  }
  
  // Check for ending matches
  for (const [ending, words] of Object.entries(commonRhymes)) {
    if (lowerWord.endsWith(ending)) {
      return words;
    }
  }
  
  return [];
};

// Get rhyme scheme pattern
export const analyzeRhymeScheme = (lines) => {
  const scheme = [];
  const rhymeMap = new Map();
  let currentLetter = 'A';
  
  lines.forEach((line, index) => {
    const words = line.trim().split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]/, '');
    
    if (!lastWord) {
      scheme.push('-');
      return;
    }
    
    // Check if this word rhymes with any previous word
    let foundRhyme = false;
    for (const [rhymeWord, letter] of rhymeMap.entries()) {
      if (doWordsRhyme(lastWord, rhymeWord)) {
        scheme.push(letter);
        foundRhyme = true;
        break;
      }
    }
    
    if (!foundRhyme) {
      rhymeMap.set(lastWord, currentLetter);
      scheme.push(currentLetter);
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  });
  
  return scheme;
};

// Simple rhyme detection
const doWordsRhyme = (word1, word2) => {
  if (word1 === word2) return true;
  
  // Check if they end with same 2+ characters
  if (word1.length > 2 && word2.length > 2) {
    return word1.slice(-2) === word2.slice(-2) || 
           word1.slice(-3) === word2.slice(-3);
  }
  
  return false;
};

// Generate rhyming suggestions
export const getRhymingSuggestions = (text) => {
  const words = text.split(/\s+/).filter(word => word.length > 2);
  const suggestions = [];
  
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/, '');
    const rhymes = findRhymes(cleanWord);
    if (rhymes.length > 0) {
      suggestions.push({
        word: cleanWord,
        rhymes: rhymes.slice(0, 5) // Limit to 5 suggestions
      });
    }
  });
  
  return suggestions;
}; 