import { useState, useEffect } from 'react';

const GrammarlyROICalculator = () => {
  const [wordsPerDay, setWordsPerDay] = useState(1000);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [correctionTime, setCorrectionTime] = useState(30);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [userType, setUserType] = useState('professional');
  
  // Grammarly pricing data (updated with current 2025 pricing)
  const grammarlyPlans = {
    monthly: { price: 30, discount: 0, name: 'Monthly' },
    quarterly: { price: 22.50, discount: 25, name: 'Quarterly (25% Off)' },
    annual: { price: 18, discount: 40, name: 'Annual (40% Off - Best Value)' }
  };

  // Competitor pricing for comparison
  const competitors = {
    grammarly: { name: 'Grammarly Pro', price: grammarlyPlans[selectedPlan].price, features: 9 },
    prowritingaid: { name: 'ProWritingAid', price: 10, features: 8 },
    hemingway: { name: 'Hemingway Plus', price: 19.99, features: 5 },
    ginger: { name: 'Ginger Premium', price: 13.99, features: 6 },
    quillbot: { name: 'QuillBot Premium', price: 9.95, features: 7 }
  };

  // User type presets
  const userTypePresets = {
    student: { wordsPerDay: 500, hourlyRate: 15, correctionTime: 45 },
    professional: { wordsPerDay: 1000, hourlyRate: 25, correctionTime: 30 },
    author: { wordsPerDay: 2000, hourlyRate: 30, correctionTime: 25 },
    business: { wordsPerDay: 1500, hourlyRate: 50, correctionTime: 20 },
    freelancer: { wordsPerDay: 1200, hourlyRate: 35, correctionTime: 25 }
  };

  // More realistic calculations
  const wordsPerMonth = wordsPerDay * 22; // ~22 working days
  const wordsPerYear = wordsPerMonth * 12;
  
  // More realistic assumptions
  const errorsPerThousandWords = 8; // Average 8 errors per 1000 words for typical writers
  const timePerErrorSeconds = correctionTime; // Time to find and fix each error
  
  const totalErrorsPerMonth = (wordsPerMonth / 1000) * errorsPerThousandWords;
  const timeSpentCorrectingPerMonth = (totalErrorsPerMonth * timePerErrorSeconds) / 3600; // Convert to hours
  
  const grammarlyPrice = grammarlyPlans[selectedPlan].price;
  const grammarlyAnnualCost = selectedPlan === 'annual' ? grammarlyPrice * 12 : 
                              selectedPlan === 'quarterly' ? grammarlyPrice * 4 : 
                              grammarlyPrice * 12;
  
  // Grammarly reduces editing time by 50% (more conservative estimate)
  const timeSavingsPercent = 50;
  const timeSavedPerMonth = timeSpentCorrectingPerMonth * (timeSavingsPercent / 100);
  const moneySavedPerMonth = Math.max(0, timeSavedPerMonth * hourlyRate);
  const moneySavedPerYear = moneySavedPerMonth * 12;
  
  const netSavingsPerYear = moneySavedPerYear - grammarlyAnnualCost;
  
  // Cap ROI at reasonable levels and handle edge cases
  let roiPercent;
  if (grammarlyAnnualCost === 0) {
    roiPercent = 0;
  } else if (netSavingsPerYear <= 0) {
    roiPercent = Math.round((netSavingsPerYear / grammarlyAnnualCost) * 100);
  } else {
    roiPercent = Math.min(500, Math.round((netSavingsPerYear / grammarlyAnnualCost) * 100)); // Cap at 500%
  }
  
  const costPerWordChecked = grammarlyAnnualCost / wordsPerYear;
  const paybackPeriodMonths = moneySavedPerMonth > 0 ? grammarlyAnnualCost / moneySavedPerMonth : 999;

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const preset = userTypePresets[type];
    setWordsPerDay(preset.wordsPerDay);
    setHourlyRate(preset.hourlyRate);
    setCorrectionTime(preset.correctionTime);
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatNumber = (num) => num.toLocaleString();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🧮 Grammarly ROI Calculator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Calculate your return on investment, time savings, and cost per word with Grammarly Pro. 
          See how much money you'll save compared to manual proofreading and competitor tools.
        </p>
      </div>

      {/* User Type Presets */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Writer Type:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(userTypePresets).map(([type, preset]) => (
            <button
              key={type}
              onClick={() => handleUserTypeChange(type)}
              className={`p-4 rounded-lg border-2 transition-all capitalize ${
                userType === type
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="font-medium">{type}</div>
              <div className="text-xs text-gray-500 mt-1">
                {preset.wordsPerDay} words/day
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Controls */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📝 Your Writing Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Words Written Per Day: {formatNumber(wordsPerDay)}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={wordsPerDay}
                  onChange={(e) => setWordsPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>5,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Hourly Rate: {formatCurrency(hourlyRate)}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$10</span>
                  <span>$100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Spent on Each Correction: {correctionTime} seconds
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={correctionTime}
                  onChange={(e) => setCorrectionTime(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grammarly Plan Selection */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">💳 Choose Grammarly Plan</h3>
            <div className="space-y-3">
              {Object.entries(grammarlyPlans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === key
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-800/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(plan.price)}/month
                        {plan.discount > 0 && (
                          <span className="ml-2 text-green-600 font-medium">
                            {plan.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPlan === key && <span className="text-blue-600">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* ROI Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">
              💰 Your ROI Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {roiPercent > 0 ? '+' : ''}{roiPercent.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Annual ROI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(Math.abs(netSavingsPerYear))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {netSavingsPerYear >= 0 ? 'Net Savings' : 'Net Cost'}
                </div>
              </div>
            </div>
            
            {paybackPeriodMonths <= 12 && paybackPeriodMonths > 0 && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  ⚡ <strong>Pays for itself in {paybackPeriodMonths.toFixed(1)} months!</strong>
                </p>
              </div>
            )}
            
            {paybackPeriodMonths > 12 && paybackPeriodMonths < 999 && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  📊 <strong>Payback period: {paybackPeriodMonths.toFixed(1)} months</strong>
                </p>
              </div>
            )}
            
            {(moneySavedPerMonth <= 0 || paybackPeriodMonths >= 999) && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 text-center">
                  💡 <strong>Consider the free version or increase your writing volume</strong>
                </p>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📊 Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Words per year:</span>
                <span className="font-semibold">{formatNumber(wordsPerYear)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated errors per year:</span>
                <span className="font-semibold">{formatNumber(Math.round((wordsPerYear / 1000) * errorsPerThousandWords))}</span>
              </div>
              <div className="flex justify-between">
                <span>Time spent correcting (monthly):</span>
                <span className="font-semibold">{timeSpentCorrectingPerMonth.toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Time saved with Grammarly:</span>
                <span className="font-semibold text-green-600">{timeSavedPerMonth.toFixed(1)} hours/month</span>
              </div>
              <div className="flex justify-between">
                <span>Money saved (time value):</span>
                <span className="font-semibold text-green-600">{formatCurrency(moneySavedPerYear)}/year</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Grammarly annual cost:</span>
                <span className="font-semibold">{formatCurrency(grammarlyAnnualCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Net {netSavingsPerYear >= 0 ? 'savings' : 'cost'}:</span>
                <span className={netSavingsPerYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(netSavingsPerYear))}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Calculation Method:</strong> Based on 8 errors per 1,000 words (industry average) and 50% time savings with Grammarly's automated suggestions.
              </p>
            </div>
          </div>

          {/* Competitor Comparison */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🔄 vs Competitors</h3>
            <div className="space-y-2">
              {Object.entries(competitors).map(([key, tool]) => (
                <div key={key} className="flex justify-between items-center p-2 rounded">
                  <div>
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({tool.features}/10 features)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(tool.price)}/mo</div>
                    {key === 'grammarly' && (
                      <div className="text-xs text-green-600">Best Value!</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-8 text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Ready to Save Time and Money?</h3>
        <p className="mb-4">
          {paybackPeriodMonths <= 12 && paybackPeriodMonths > 0 ? (
            `Get Grammarly Pro with 25% off (40% annual) and start seeing ROI in ${paybackPeriodMonths.toFixed(1)} months!`
          ) : paybackPeriodMonths < 999 ? (
            `Get Grammarly Pro with 25% off (40% annual) and improve your writing efficiency!`
          ) : (
            `Try Grammarly Free first, or consider Pro if you write more frequently!`
          )}
        </p>
        <a 
          href="https://discount.grammarly.com/api/discounts/HOjwmv" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Get {grammarlyPlans[selectedPlan].discount}% Off Grammarly Pro →
        </a>
      </div>
    </div>
  );
};

export default GrammarlyROICalculator; 