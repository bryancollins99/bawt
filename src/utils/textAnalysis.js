// Filler words list
export const fillerWords = [
  "just", "really", "very", "actually", "literally", 
  "kind of", "a bit", "sort of", "basically", "maybe", 
  "probably", "somewhat", "totally"
];

// Emotion keywords
export const emotionKeywords = {
  joy: ["happy", "joy", "excited", "love", "grateful"],
  sadness: ["sad", "lonely", "cry", "grief", "pain"],
  fear: ["scared", "afraid", "nervous", "terrified", "worried"],
  anger: ["angry", "furious", "hate", "annoyed", "rage"],
  confidence: ["confident", "strong", "certain", "bold", "brave"]
};

// Count words in text
export const countWords = (text) => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

// Find filler words in text with their positions
export const findFillerWords = (text) => {
  const results = [];
  const lowerText = text.toLowerCase();
  
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      results.push({
        word: filler,
        start: match.index,
        end: match.index + match[0].length,
        actualText: match[0]
      });
    }
  });
  
  return results.sort((a, b) => a.start - b.start);
};

// Count filler words by type
export const countFillerWordsByType = (text) => {
  const counts = {};
  const lowerText = text.toLowerCase();
  
  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches > 0) {
      counts[filler] = matches;
    }
  });
  
  return counts;
};

// Analyze emotions in text
export const analyzeEmotions = (text) => {
  const lowerText = text.toLowerCase();
  const emotionCounts = {};
  let totalMatches = 0;
  
  Object.keys(emotionKeywords).forEach(emotion => {
    emotionCounts[emotion] = 0;
    emotionKeywords[emotion].forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (lowerText.match(regex) || []).length;
      emotionCounts[emotion] += matches;
      totalMatches += matches;
    });
  });
  
  // Convert to percentages
  const emotionPercentages = {};
  Object.keys(emotionCounts).forEach(emotion => {
    emotionPercentages[emotion] = totalMatches > 0 
      ? Math.round((emotionCounts[emotion] / totalMatches) * 100) 
      : 0;
  });
  
  return emotionPercentages;
};

// Calculate writing clarity score
export const calculateClarityScore = (fillerCount) => {
  return Math.max(0, Math.min(100, 100 - (fillerCount * 2)));
};

// Get top filler words to remove
export const getTopFillerWords = (fillerCounts, limit = 3) => {
  return Object.entries(fillerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};

// Highlight filler words in text
export const highlightFillerWords = (text) => {
  const fillerPositions = findFillerWords(text);
  if (fillerPositions.length === 0) return text;
  
  let result = '';
  let lastIndex = 0;
  
  fillerPositions.forEach(({ start, end, actualText }) => {
    result += text.slice(lastIndex, start);
    result += `<span class="filler-highlight">${actualText}</span>`;
    lastIndex = end;
  });
  
  result += text.slice(lastIndex);
  return result;
}; 