import React, { useState } from 'react';

const ReportTopicsGenerator = () => {
  const [subject, setSubject] = useState('any');
  const [reportType, setReportType] = useState('any');
  const [gradeLevel, setGradeLevel] = useState('any');
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const topicsDatabase = {
    technology: [
      {
        title: "Technology's Effect on Society",
        description: "Explore how modern technology impacts relationships, work-life balance, and daily life.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["How has social media changed human communication?", "What are the positive and negative effects of smartphones?"]
      },
      {
        title: "Anxiety and Social Media",
        description: "Research the connection between social media usage and mental health in teens.",
        type: "informational",
        grade: ["middle", "high"],
        questions: ["How does Instagram affect self-esteem?", "What role does dopamine play in social media addiction?"]
      },
      {
        title: "The Rise of E-learning",
        description: "Analyze the growth of online education and its impact on traditional schooling.",
        type: "comparative",
        grade: ["high", "college"],
        questions: ["How effective is online learning vs. in-person education?", "What are the accessibility benefits of e-learning?"]
      }
    ],
    social: [
      {
        title: "Gun Control in America",
        description: "Examine different perspectives on gun control legislation in the United States.",
        type: "persuasive",
        grade: ["high", "college"],
        questions: ["How do US gun laws compare to other countries?", "What factors contribute to gun violence?"]
      },
      {
        title: "Should School Uniforms Be Mandatory?",
        description: "Debate the pros and cons of requiring school uniforms in public education.",
        type: "persuasive",
        grade: ["middle", "high"],
        questions: ["How do uniforms affect student self-expression?", "Do uniforms reduce bullying and social pressure?"]
      },
      {
        title: "Present-Day Slavery",
        description: "Investigate modern forms of slavery and human trafficking around the world.",
        type: "informational",
        grade: ["high", "college"],
        questions: ["What are the different types of modern slavery?", "Which populations are most vulnerable?"]
      },
      {
        title: "Trans Rights: Legal Age for Transition",
        description: "Explore the debate around appropriate ages for gender transition procedures.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["What does current medical research say?", "How do different countries approach this issue?"]
      }
    ],
    environment: [
      {
        title: "Analyze the Causes of Wildfires",
        description: "Study the environmental and human factors contributing to increasing wildfire frequency.",
        type: "analytical",
        grade: ["middle", "high", "college"],
        questions: ["How does climate change affect wildfire patterns?", "What prevention strategies are most effective?"]
      },
      {
        title: "Impact of Global Warming on the Environment",
        description: "Examine climate change effects on ecosystems, weather patterns, and wildlife.",
        type: "informational",
        grade: ["middle", "high", "college"],
        questions: ["How are glaciers and ice sheets changing?", "What species are most threatened?"]
      },
      {
        title: "The Effects of Urbanization on Wildlife",
        description: "Research how city expansion impacts local animal populations and habitats.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["Which species adapt best to urban environments?", "What conservation efforts are most successful?"]
      },
      {
        title: "Impact of Plastic Waste on Marine Life",
        description: "Investigate how plastic pollution affects ocean ecosystems and marine animals.",
        type: "informational",
        grade: ["middle", "high"],
        questions: ["How does plastic waste reach the ocean?", "Which marine species are most affected?"]
      }
    ],
    health: [
      {
        title: "Should Assisted Suicide Be Legal?",
        description: "Examine ethical, medical, and legal arguments around end-of-life choices.",
        type: "persuasive",
        grade: ["high", "college"],
        questions: ["What are the current laws in different states?", "How do medical professionals view this issue?"]
      },
      {
        title: "Does Music Have Healing Powers?",
        description: "Research the therapeutic effects of music on mental and physical health.",
        type: "informational",
        grade: ["middle", "high"],
        questions: ["How is music therapy used in medical settings?", "What scientific evidence supports music's healing effects?"]
      },
      {
        title: "Mental Health Impact of Social Media on Teens",
        description: "Study the psychological effects of social media use among teenagers.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["What are the warning signs of social media addiction?", "Which platforms have the greatest impact?"]
      }
    ],
    education: [
      {
        title: "No Child Left Behind: Did It Work?",
        description: "Evaluate the effectiveness of this major education policy reform.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["What were the intended goals vs. actual outcomes?", "How did standardized testing change?"]
      },
      {
        title: "Compare the UK and US Education Systems",
        description: "Analyze the differences between British and American approaches to education.",
        type: "comparative",
        grade: ["high", "college"],
        questions: ["Which system better prepares students for success?", "How do extracurricular activities differ?"]
      },
      {
        title: "How Does Single Parenting Impact Child Development?",
        description: "Research the effects of single-parent households on children's well-being and success.",
        type: "analytical",
        grade: ["high", "college"],
        questions: ["What are the challenges and advantages?", "How do support systems make a difference?"]
      }
    ],
    current: [
      {
        title: "Social Impacts of the COVID-19 Pandemic",
        description: "Examine how the pandemic changed society, work, and social interactions.",
        type: "analytical",
        grade: ["middle", "high", "college"],
        questions: ["How did remote work affect family dynamics?", "What mental health challenges emerged?"]
      },
      {
        title: "Sustainable Farming and Food Security",
        description: "Explore how sustainable agriculture practices can address global food needs.",
        type: "informational",
        grade: ["high", "college"],
        questions: ["What farming methods are most sustainable?", "How can we feed a growing global population?"]
      }
    ]
  };

  const generateTopics = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let filteredTopics = [];
      
      // Get topics from selected subject or all subjects
      const subjectsToSearch = subject === 'any' ? Object.keys(topicsDatabase) : [subject];
      
      subjectsToSearch.forEach(subj => {
        topicsDatabase[subj].forEach(topic => {
          // Filter by report type
          if (reportType === 'any' || topic.type === reportType) {
            // Filter by grade level
            if (gradeLevel === 'any' || topic.grade.includes(gradeLevel)) {
              filteredTopics.push({
                ...topic,
                subject: subj,
                id: Math.random().toString(36).substr(2, 9)
              });
            }
          }
        });
      });
      
      // Shuffle and limit to 6 topics
      const shuffled = filteredTopics.sort(() => 0.5 - Math.random());
      setGeneratedTopics(shuffled.slice(0, 6));
      setIsGenerating(false);
    }, 800);
  };

  const copyTopic = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getSubjectColor = (subject) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      social: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      environment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      education: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      current: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getTypeColor = (type) => {
    const colors = {
      informational: 'bg-blue-500',
      persuasive: 'bg-red-500', 
      analytical: 'bg-green-500',
      comparative: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📝 Report Writing Topics Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Discover engaging report topics for students based on subject, type, and grade level
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Customize Your Topics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Area
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any Subject</option>
              <option value="technology">Technology & Social Media</option>
              <option value="social">Social Issues</option>
              <option value="environment">Environment & Climate</option>
              <option value="health">Health & Medicine</option>
              <option value="education">Education & Family</option>
              <option value="current">Current Events</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any Type</option>
              <option value="informational">Informational</option>
              <option value="persuasive">Persuasive/Argumentative</option>
              <option value="analytical">Analytical</option>
              <option value="comparative">Comparative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any Grade</option>
              <option value="middle">Middle School</option>
              <option value="high">High School</option>
              <option value="college">College</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateTopics}
          disabled={isGenerating}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Topics...
            </span>
          ) : (
            '🎯 Generate Report Topics'
          )}
        </button>
      </div>

      {/* Generated Topics */}
      {generatedTopics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            📚 Your Report Topics ({generatedTopics.length})
          </h3>
          
          {generatedTopics.map((topic) => (
            <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(topic.subject)}`}>
                    {topic.subject.charAt(0).toUpperCase() + topic.subject.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{backgroundColor: getTypeColor(topic.type).split('-')[1]}}>
                    {topic.type.charAt(0).toUpperCase() + topic.type.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                    {topic.grade.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
                  </span>
                </div>
                
                <button
                  onClick={() => copyTopic(topic.title)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                  title="Copy topic title"
                >
                  ��
                </button>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {topic.title}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {topic.description}
              </p>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🤔 Research Questions to Consider:
                </h5>
                <ul className="space-y-1">
                  {topic.questions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          
          <div className="text-center mt-6">
            <button
              onClick={generateTopics}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              🔄 Generate More Topics
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      {generatedTopics.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
            💡 How to Use This Tool
          </h3>
          <div className="space-y-2 text-blue-700 dark:text-blue-300">
            <p><strong>1. Choose your filters:</strong> Select subject area, report type, and grade level</p>
            <p><strong>2. Generate topics:</strong> Click the button to get customized topic suggestions</p>
            <p><strong>3. Explore ideas:</strong> Each topic includes research questions to get you started</p>
            <p><strong>4. Copy and research:</strong> Use the copy button to save topics you like</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💫 Pro Tip:</strong> Start with "Any" filters to see all options, then narrow down by subject or type. 
              The more specific your topic, the easier your research will be!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTopicsGenerator;
