import React, { useState } from 'react';

const BookRoyaltyCalculator = ({ isDarkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({
    bookPrice: '',
    monthlySales: '',
    royaltyModel: 'kdp70',
    customRoyalty: '',
    compareMode: false,
    secondRoyaltyModel: 'traditional',
    secondCustomRoyalty: ''
  });

  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateRoyalty = () => {
    const { bookPrice, monthlySales, royaltyModel, customRoyalty, compareMode, secondRoyaltyModel, secondCustomRoyalty } = formData;
    
    if (!bookPrice || !monthlySales) return;

    // Primary calculation
    let royaltyPercentage;
    switch (royaltyModel) {
      case 'kdp70':
        royaltyPercentage = 0.70;
        break;
      case 'kdp35':
        royaltyPercentage = 0.35;
        break;
      case 'traditional':
        royaltyPercentage = 0.10;
        break;
      case 'custom':
        royaltyPercentage = (customRoyalty || 0) / 100;
        break;
      default:
        royaltyPercentage = 0.70;
    }

    const monthlyRoyalty = parseFloat(bookPrice) * parseInt(monthlySales) * royaltyPercentage;
    const annualRoyalty = monthlyRoyalty * 12;

    const result = {
      primary: {
        monthlyRoyalty,
        annualRoyalty,
        royaltyPercentage: royaltyPercentage * 100,
        royaltyModel,
        bookPrice: parseFloat(bookPrice),
        monthlySales: parseInt(monthlySales)
      }
    };

    // Secondary calculation for comparison mode
    if (compareMode && secondRoyaltyModel) {
      let secondRoyaltyPercentage;
      switch (secondRoyaltyModel) {
        case 'kdp70':
          secondRoyaltyPercentage = 0.70;
          break;
        case 'kdp35':
          secondRoyaltyPercentage = 0.35;
          break;
        case 'traditional':
          secondRoyaltyPercentage = 0.10;
          break;
        case 'custom':
          secondRoyaltyPercentage = (secondCustomRoyalty || 0) / 100;
          break;
        default:
          secondRoyaltyPercentage = 0.35;
      }

      const secondMonthlyRoyalty = parseFloat(bookPrice) * parseInt(monthlySales) * secondRoyaltyPercentage;
      const secondAnnualRoyalty = secondMonthlyRoyalty * 12;

      result.secondary = {
        monthlyRoyalty: secondMonthlyRoyalty,
        annualRoyalty: secondAnnualRoyalty,
        royaltyPercentage: secondRoyaltyPercentage * 100,
        royaltyModel: secondRoyaltyModel,
        bookPrice: parseFloat(bookPrice),
        monthlySales: parseInt(monthlySales)
      };
    }

    setResults(result);
  };

  const getRoyaltyModelName = (model) => {
    switch (model) {
      case 'kdp70': return 'KDP 70% Royalty';
      case 'kdp35': return 'KDP 35% Royalty';
      case 'traditional': return 'Traditional Publishing';
      case 'custom': return 'Custom Rate';
      default: return model;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Book Royalty Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Calculate your potential book earnings and compare different royalty models
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Book Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Book Price ($)
            </label>
            <input
              type="number"
              name="bookPrice"
              value={formData.bookPrice}
              onChange={handleInputChange}
              placeholder="9.99"
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Sales (units)
            </label>
            <input
              type="number"
              name="monthlySales"
              value={formData.monthlySales}
              onChange={handleInputChange}
              placeholder="100"
              min="0"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Royalty Model
          </label>
          <select
            name="royaltyModel"
            value={formData.royaltyModel}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="kdp70">Amazon KDP 70% Royalty</option>
            <option value="kdp35">Amazon KDP 35% Royalty</option>
            <option value="traditional">Traditional Publishing (10%)</option>
            <option value="custom">Custom Rate</option>
          </select>

          {formData.royaltyModel === 'custom' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Royalty Rate (%)
              </label>
              <input
                type="number"
                name="customRoyalty"
                value={formData.customRoyalty}
                onChange={handleInputChange}
                placeholder="15"
                min="0"
                max="100"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="compareMode"
              checked={formData.compareMode}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Compare with another royalty model
            </span>
          </label>

          {formData.compareMode && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Second Royalty Model
              </label>
              <select
                name="secondRoyaltyModel"
                value={formData.secondRoyaltyModel}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="kdp70">Amazon KDP 70% Royalty</option>
                <option value="kdp35">Amazon KDP 35% Royalty</option>
                <option value="traditional">Traditional Publishing (10%)</option>
                <option value="custom">Custom Rate</option>
              </select>

              {formData.secondRoyaltyModel === 'custom' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Second Custom Royalty Rate (%)
                  </label>
                  <input
                    type="number"
                    name="secondCustomRoyalty"
                    value={formData.secondCustomRoyalty}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="0"
                    max="100"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={calculateRoyalty}
          disabled={!formData.bookPrice || !formData.monthlySales}
          className="mt-6 w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 
                   text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          style={{ backgroundColor: !formData.bookPrice || !formData.monthlySales ? undefined : '#d60000' }}
        >
          Calculate Royalty
        </button>
      </div>

      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Royalty Calculation Results
          </h2>

          <div className={`grid grid-cols-1 ${results.secondary ? 'md:grid-cols-2' : ''} gap-6`}>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                {getRoyaltyModelName(results.primary.royaltyModel)}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Book Price:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${results.primary.bookPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Sales:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{results.primary.monthlySales} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Royalty Rate:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{results.primary.royaltyPercentage.toFixed(1)}%</span>
                </div>
                <hr className="border-gray-300 dark:border-gray-600" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-800 dark:text-white">Monthly Royalty:</span>
                  <span className="text-green-600 dark:text-green-400">${results.primary.monthlyRoyalty.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-800 dark:text-white">Annual Royalty:</span>
                  <span className="text-green-600 dark:text-green-400">${results.primary.annualRoyalty.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {results.secondary && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                  {getRoyaltyModelName(results.secondary.royaltyModel)}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Book Price:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${results.secondary.bookPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Sales:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{results.secondary.monthlySales} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Royalty Rate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{results.secondary.royaltyPercentage.toFixed(1)}%</span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-600" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-800 dark:text-white">Monthly Royalty:</span>
                    <span className="text-blue-600 dark:text-blue-400">${results.secondary.monthlyRoyalty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-800 dark:text-white">Annual Royalty:</span>
                    <span className="text-blue-600 dark:text-blue-400">${results.secondary.annualRoyalty.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {results.secondary && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Comparison Summary
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {results.primary.annualRoyalty > results.secondary.annualRoyalty ? (
                  <p><strong>{getRoyaltyModelName(results.primary.royaltyModel)}</strong> earns <strong>${(results.primary.annualRoyalty - results.secondary.annualRoyalty).toFixed(2)}</strong> more per year.</p>
                ) : results.secondary.annualRoyalty > results.primary.annualRoyalty ? (
                  <p><strong>{getRoyaltyModelName(results.secondary.royaltyModel)}</strong> earns <strong>${(results.secondary.annualRoyalty - results.primary.annualRoyalty).toFixed(2)}</strong> more per year.</p>
                ) : (
                  <p>Both models earn the same amount annually.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Built for <a href="https://becomeawritertoday.com" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 hover:underline">Become a Writer Today</a> • Calculate your book royalty earnings
        </p>
      </footer>
    </div>
  );
};

export default BookRoyaltyCalculator; 