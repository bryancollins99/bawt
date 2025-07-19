import React, { useState } from 'react';

const EssayHookGenerator = () => {
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('argumentative');
  const [tone, setTone] = useState('academic');
  const [generatedHooks, setGeneratedHooks] = useState([]);

  const hookTemplates = {
    argumentative: {
      academic: [
        "In today's rapidly evolving world, {topic} has become a critical issue that demands our immediate attention.",
        "While many argue that {topic} is beneficial, a closer examination reveals significant concerns that cannot be ignored.",
        "The debate surrounding {topic} has reached a tipping point, forcing us to reconsider our fundamental assumptions.",
        "Recent studies have shown that {topic} affects millions of people worldwide, yet public awareness remains surprisingly low.",
        "Despite widespread acceptance of {topic}, mounting evidence suggests we may need to completely rethink our approach."
      ],
      conversational: [
        "Have you ever wondered why {topic} seems to be everywhere in the news these days?",
        "Imagine a world where {topic} didn't exist - sounds pretty different, right?",
        "Here's something that might surprise you about {topic}...",
        "Let me tell you why {topic} is probably more important than you think.",
        "Most people have strong opinions about {topic}, but here's what they're missing."
      ]
    },
    narrative: {
      academic: [
        "The significance of {topic} becomes clear when we examine its historical context and contemporary implications.",
        "To understand the complexity of {topic}, we must first explore its origins and development over time.",
        "The story of {topic} reveals important lessons about human nature and societal progress.",
        "Examining {topic} through multiple perspectives provides valuable insights into our current challenges.",
        "The evolution of {topic} offers a fascinating glimpse into how ideas shape our world."
      ],
      conversational: [
        "Let me tell you a story about {topic} that changed everything.",
        "Picture this: a world where {topic} shapes every decision we make.",
        "The first time I really understood {topic}, it completely changed my perspective.",
        "There's an incredible story behind {topic} that most people never hear.",
        "Once upon a time, {topic} was just an idea - now look where we are."
      ]
    },
    analytical: {
      academic: [
        "A comprehensive analysis of {topic} reveals several critical factors that merit careful examination.",
        "The multifaceted nature of {topic} requires a systematic approach to fully understand its implications.",
        "Breaking down {topic} into its component parts allows us to better grasp its overall significance.",
        "The relationship between {topic} and broader societal trends deserves thorough investigation.",
        "Examining {topic} through various analytical frameworks provides valuable insights into its complexity."
      ],
      conversational: [
        "Let's break down {topic} and see what we really find when we dig deeper.",
        "When you really analyze {topic}, some surprising patterns start to emerge.",
        "Taking apart {topic} piece by piece reveals some interesting truths.",
        "If we look at {topic} from different angles, a clearer picture starts to form.",
        "There's more to {topic} than meets the eye - let me show you what I mean."
      ]
    }
  };

  const generateHooks = () => {
    if (!topic.trim()) {
      setGeneratedHooks(['Please enter a topic to generate hooks.']);
      return;
    }

    const templates = hookTemplates[essayType][tone];
    const hooks = templates.map(template => 
      template.replace(/{topic}/g, topic.trim())
    );
    
    setGeneratedHooks(hooks);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🪝 Essay Hook Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Generate compelling opening sentences for your essays
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Essay Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Essay Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., climate change, social media, education"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Essay Type
            </label>
            <select
              value={essayType}
              onChange={(e) => setEssayType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="argumentative">Argumentative</option>
              <option value="narrative">Narrative</option>
              <option value="analytical">Analytical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="academic">Academic</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateHooks}
          className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#d60000' }}
        >
          Generate Hook Ideas
        </button>
      </div>

      {generatedHooks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Generated Hooks
          </h2>
          
          <div className="space-y-4">
            {generatedHooks.map((hook, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-500"
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-800 dark:text-white leading-relaxed flex-1">
                    {hook}
                  </p>
                  <button
                    onClick={() => copyToClipboard(hook)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    style={{ backgroundColor: '#d60000' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 Tips for Using These Hooks:
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Customize the language to match your writing style</li>
              <li>• Make sure the hook connects to your thesis statement</li>
              <li>• Consider your audience and adjust the tone accordingly</li>
              <li>• Use specific examples or statistics to strengthen the hook</li>
              <li>• Keep it concise - one to two sentences maximum</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayHookGenerator; 