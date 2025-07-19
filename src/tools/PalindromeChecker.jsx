import React, { useState } from 'react';

const PalindromeChecker = ({ isDarkMode, toggleDarkMode }) => {
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

  // Generate fun palindromes
  const generatePalindromes = () => {
    const palindromes = [
      "A man, a plan, a canal: Panama",
      "Was it a car or a cat I saw?",
      "Madam, I'm Adam",
      "Never odd or even",
      "Do geese see God?",
      "A Santa at NASA",
      "Taco cat",
      "Was it a rat I saw?",
      "Step on no pets"
    ];

    const shuffled = palindromes.sort(() => 0.5 - Math.random());
    setGeneratedPalindromes(shuffled.slice(0, 3));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Palindrome Checker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Check if your text reads the same forwards and backwards
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <label htmlFor="palindromeInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter text to check
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="palindromeInput"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., A man, a plan, a canal: Panama"
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && checkPalindrome()}
          />
          <button
            onClick={checkPalindrome}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#d60000' }}
          >
            Check Palindrome
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className={`text-lg font-semibold mb-2 ${
              result.isPalindrome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {result.message}
            </div>
            {result.normalizedText && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Original: <span className="font-mono">{result.originalText}</span></div>
                <div>Normalized: <span className="font-mono">{result.normalizedText}</span></div>
                <div>Reversed: <span className="font-mono">{result.normalizedText.split('').reverse().join('')}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Need inspiration? Generate examples
        </h2>
        <button
          onClick={generatePalindromes}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mb-4"
        >
          Generate Palindromes
        </button>

        {generatedPalindromes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-white">Example Palindromes:</h3>
            {generatedPalindromes.map((palindrome, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-mono text-gray-900 dark:text-white">{palindrome}</span>
                <button
                  onClick={() => setInputText(palindrome)}
                  className="ml-3 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try this one
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Built for <a href="https://becomeawritertoday.com" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline">Become a Writer Today</a> • Check and create palindromes for your writing
        </p>
      </footer>
    </div>
  );
};

export default PalindromeChecker; 