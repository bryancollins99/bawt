import React, { useState } from 'react';

const PalindromeChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [generatedPalindromes, setGeneratedPalindromes] = useState([]);

  // Normalize text: remove spaces, punctuation, and make lowercase
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Check if text is a palindrome
  const checkPalindrome = () => {
    if (!inputText.trim()) {
      setResult({
        isPalindrome: false,
        message: 'Please enter some text to check',
        normalizedText: '',
        originalText: inputText
      });
      return;
    }

    const normalized = normalizeText(inputText);
    const reversed = normalized.split('').reverse().join('');
    const isPalindrome = normalized === reversed;

    setResult({
      isPalindrome,
      message: isPalindrome ? '✅ It\'s a palindrome!' : '❌ Not a palindrome',
      normalizedText: normalized,
      originalText: inputText
    });
  };

  // Generate 3 fun palindromes
  const generatePalindromes = () => {
    const words = ['dog', 'cat', 'bat', 'rat', 'star', 'car', 'bar', 'tar', 'war'];
    const patterns = [
      (word) => `A ${word} saw was ${word.split('').reverse().join('')}`,
      (word) => `${word.charAt(0).toUpperCase() + word.slice(1)} saw was ${word.split('').reverse().join('')}`,
      (word) => `Was it a ${word}? ${word.split('').reverse().join('')} a ti saw`,
    ];

    const palindromes = [];
    for (let i = 0; i < 3; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      palindromes.push(randomPattern(randomWord));
    }

    // Add some classic palindromes to the mix
    const classics = [
      'A man a plan a canal Panama',
      'Was it a rat I saw',
      'Never odd or even',
      'Do geese see God',
      'Madam Im Adam',
      'Step on no pets'
    ];

    // Mix generated and classic palindromes
    const finalPalindromes = [
      ...palindromes.slice(0, 2),
      classics[Math.floor(Math.random() * classics.length)]
    ];

    setGeneratedPalindromes(finalPalindromes);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Palindrome Checker & Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Check if your text is a palindrome or generate fun palindromes
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <label htmlFor="palindromeInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter text to check:
        </label>
        <div className="space-y-4">
          <input
            id="palindromeInput"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkPalindrome()}
            placeholder="Enter a word or phrase (e.g., 'A man a plan a canal Panama')"
            className="w-full p-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={checkPalindrome}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Check Palindrome
            </button>
            
            <button
              onClick={generatePalindromes}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Generate 3 Fun Palindromes
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Result:</h3>
          
          <div className={`p-4 rounded-lg mb-4 ${
            result.isPalindrome 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
          }`}>
            <p className={`text-lg font-medium ${
              result.isPalindrome 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {result.message}
            </p>
          </div>

          {result.normalizedText && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Original text:</span> "{result.originalText}"
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Normalized for comparison:</span> "{result.normalizedText}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Generated Palindromes Section */}
      {generatedPalindromes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            🎉 Generated Palindromes:
          </h3>
          
          <div className="space-y-3">
            {generatedPalindromes.map((palindrome, index) => (
              <div
                key={index}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg"
              >
                <p className="text-purple-800 dark:text-purple-300 font-medium">
                  "{palindrome}"
                </p>
              </div>
            ))}
          </div>
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            💡 Try checking any of these generated palindromes above!
          </p>
        </div>
      )}
    </div>
  );
};

export default PalindromeChecker; 