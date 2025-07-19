import React from 'react';

const RoyaltyResults = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getRoyaltyModelLabel = (model) => {
    switch (model) {
      case 'kdp70': return 'KDP 70%';
      case 'kdp35': return 'KDP 35%';
      case 'traditional': return 'Traditional 10%';
      case 'custom': return 'Custom';
      default: return model;
    }
  };

  const RoyaltyCard = ({ title, royaltyData, isComparison = false }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${isComparison ? 'border-2 border-blue-200 dark:border-blue-800' : ''}`}>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="space-y-4">
        {/* Monthly Royalty */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Monthly Royalty
            </span>
            <span className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(royaltyData.monthlyRoyalty)}
            </span>
          </div>
        </div>

        {/* Annual Royalty */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Annual Royalty
            </span>
            <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(royaltyData.annualRoyalty)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Summary:</span> At {royaltyData.royaltyPercentage}% royalty, 
            {' '}<span className="font-bold">{royaltyData.monthlySales} sales/month</span> earns{' '}
            <span className="font-bold">{formatCurrency(royaltyData.monthlyRoyalty)}/month</span> or{' '}
            <span className="font-bold">{formatCurrency(royaltyData.annualRoyalty)}/year</span>.
          </p>
        </div>

        {/* Calculation Details */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Calculation Details
          </h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Book Price: <span className="font-medium">{formatCurrency(royaltyData.bookPrice)}</span></div>
            <div>Monthly Sales: <span className="font-medium">{royaltyData.monthlySales} books</span></div>
            <div>Royalty Rate: <span className="font-medium">{royaltyData.royaltyPercentage}%</span></div>
            <div>Model: <span className="font-medium">{getRoyaltyModelLabel(royaltyData.royaltyModel)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Royalty Calculation Results
        </h2>
      </div>

      {data.secondary ? (
        // Comparison Mode - Two columns
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoyaltyCard 
            title="Primary Model" 
            royaltyData={data.primary} 
          />
          <RoyaltyCard 
            title="Comparison Model" 
            royaltyData={data.secondary} 
            isComparison={true}
          />
        </div>
      ) : (
        // Single Mode - One column
        <div className="max-w-2xl mx-auto">
          <RoyaltyCard 
            title="Your Royalty Earnings" 
            royaltyData={data.primary} 
          />
        </div>
      )}

      {/* Comparison Summary */}
      {data.secondary && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3">
            Comparison Summary
          </h3>
          
          <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <div>
              <span className="font-semibold">Monthly Difference:</span>{' '}
              {data.primary.monthlyRoyalty > data.secondary.monthlyRoyalty ? (
                <span className="text-green-600 dark:text-green-400 font-bold">
                  +{formatCurrency(data.primary.monthlyRoyalty - data.secondary.monthlyRoyalty)} 
                  (Primary model earns more)
                </span>
              ) : data.primary.monthlyRoyalty < data.secondary.monthlyRoyalty ? (
                <span className="text-red-600 dark:text-red-400 font-bold">
                  -{formatCurrency(data.secondary.monthlyRoyalty - data.primary.monthlyRoyalty)} 
                  (Comparison model earns more)
                </span>
              ) : (
                <span className="font-bold">No difference</span>
              )}
            </div>
            
            <div>
              <span className="font-semibold">Annual Difference:</span>{' '}
              {data.primary.annualRoyalty > data.secondary.annualRoyalty ? (
                <span className="text-green-600 dark:text-green-400 font-bold">
                  +{formatCurrency(data.primary.annualRoyalty - data.secondary.annualRoyalty)} 
                  (Primary model earns more)
                </span>
              ) : data.primary.annualRoyalty < data.secondary.annualRoyalty ? (
                <span className="text-red-600 dark:text-red-400 font-bold">
                  -{formatCurrency(data.secondary.annualRoyalty - data.primary.annualRoyalty)} 
                  (Comparison model earns more)
                </span>
              ) : (
                <span className="font-bold">No difference</span>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-yellow-600 dark:text-yellow-400">
            <p>
              <span className="font-semibold">Best Option:</span>{' '}
              {data.primary.annualRoyalty > data.secondary.annualRoyalty 
                ? `${getRoyaltyModelLabel(data.primary.royaltyModel)} (${data.primary.royaltyPercentage}%)`
                : data.primary.annualRoyalty < data.secondary.annualRoyalty
                ? `${getRoyaltyModelLabel(data.secondary.royaltyModel)} (${data.secondary.royaltyPercentage}%)`
                : 'Both models perform equally'
              }
            </p>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
          💡 Publishing Tips
        </h3>
        <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
          <li>• KDP 70% royalty applies to books priced between $2.99-$9.99</li>
          <li>• KDP 35% royalty applies to all other price ranges</li>
          <li>• Traditional publishing typically offers 8-15% royalties</li>
          <li>• Consider marketing costs and time investment when comparing models</li>
          <li>• Higher book prices don't always mean higher total earnings</li>
        </ul>
      </div>
    </div>
  );
};

export default RoyaltyResults; 