import React, { useState } from 'react';

const RoyaltyForm = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    bookPrice: '',
    monthlySales: '',
    royaltyModel: 'kdp70',
    customRoyalty: '',
    compareMode: false,
    secondRoyaltyModel: 'traditional',
    secondCustomRoyalty: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.bookPrice || !formData.monthlySales) {
      alert('Please enter both book price and monthly sales');
      return;
    }

    if (formData.royaltyModel === 'custom' && !formData.customRoyalty) {
      alert('Please enter custom royalty percentage');
      return;
    }

    if (formData.compareMode && formData.secondRoyaltyModel === 'custom' && !formData.secondCustomRoyalty) {
      alert('Please enter second custom royalty percentage');
      return;
    }

    const calculationData = {
      bookPrice: parseFloat(formData.bookPrice),
      monthlySales: parseInt(formData.monthlySales),
      royaltyModel: formData.royaltyModel,
      customRoyalty: parseFloat(formData.customRoyalty) || 0,
      compareMode: formData.compareMode,
      secondRoyaltyModel: formData.secondRoyaltyModel,
      secondCustomRoyalty: parseFloat(formData.secondCustomRoyalty) || 0
    };

    onCalculate(calculationData);
  };

  const getRoyaltyModelLabel = (model) => {
    switch (model) {
      case 'kdp70': return 'KDP 70%';
      case 'kdp35': return 'KDP 35%';
      case 'traditional': return 'Traditional 10%';
      case 'custom': return 'Custom %';
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
          Calculate your potential book earnings with different royalty models
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Price */}
            <div>
              <label htmlFor="bookPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Book Price ($)
              </label>
              <input
                type="number"
                id="bookPrice"
                step="0.01"
                min="0"
                value={formData.bookPrice}
                onChange={(e) => handleInputChange('bookPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9.99"
              />
            </div>

            {/* Monthly Sales */}
            <div>
              <label htmlFor="monthlySales" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Sales (#)
              </label>
              <input
                type="number"
                id="monthlySales"
                min="0"
                value={formData.monthlySales}
                onChange={(e) => handleInputChange('monthlySales', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>

          {/* Royalty Model */}
          <div>
            <label htmlFor="royaltyModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Royalty Model
            </label>
            <select
              id="royaltyModel"
              value={formData.royaltyModel}
              onChange={(e) => handleInputChange('royaltyModel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kdp70">KDP 70%</option>
              <option value="kdp35">KDP 35%</option>
              <option value="traditional">Traditional 10%</option>
              <option value="custom">Custom %</option>
            </select>
          </div>

          {/* Custom Royalty Input */}
          {formData.royaltyModel === 'custom' && (
            <div>
              <label htmlFor="customRoyalty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Royalty Percentage (%)
              </label>
              <input
                type="number"
                id="customRoyalty"
                step="0.01"
                min="0"
                max="100"
                value={formData.customRoyalty}
                onChange={(e) => handleInputChange('customRoyalty', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15"
              />
            </div>
          )}

          {/* Compare Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="compareMode"
              checked={formData.compareMode}
              onChange={(e) => handleInputChange('compareMode', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="compareMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Compare with another royalty model
            </label>
          </div>

          {/* Second Royalty Model for Comparison */}
          {formData.compareMode && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Comparison Model
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="secondRoyaltyModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Second Royalty Model
                  </label>
                  <select
                    id="secondRoyaltyModel"
                    value={formData.secondRoyaltyModel}
                    onChange={(e) => handleInputChange('secondRoyaltyModel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="kdp70">KDP 70%</option>
                    <option value="kdp35">KDP 35%</option>
                    <option value="traditional">Traditional 10%</option>
                    <option value="custom">Custom %</option>
                  </select>
                </div>

                {formData.secondRoyaltyModel === 'custom' && (
                  <div>
                    <label htmlFor="secondCustomRoyalty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Second Custom Royalty Percentage (%)
                    </label>
                    <input
                      type="number"
                      id="secondCustomRoyalty"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.secondCustomRoyalty}
                      onChange={(e) => handleInputChange('secondCustomRoyalty', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg 
                     transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate Royalties
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoyaltyForm; 