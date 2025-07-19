import React from 'react';

const Sidebar = ({ tools, selectedTool, onToolSelect, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            BAWT Tools
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <nav className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedTool === tool.id
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm">{tool.name}</div>
              <div className="text-xs opacity-75 mt-1">{tool.description}</div>
            </button>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            For WordPress
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Embed any tool by adding <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">?embed=true&tool=TOOL_ID</code>
          </p>
          <a 
            href="https://becomeawritertoday.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Visit Become a Writer Today →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 