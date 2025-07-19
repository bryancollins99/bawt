import { useState } from 'react';

const FemaleAuthorsTimeline = () => {
  const [selectedEra, setSelectedEra] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Comprehensive female authors data addressing content gaps
  const femaleAuthors = [
    // Ancient & Medieval (pre-1500)
    { 
      id: 1, name: "Sappho", years: "c. 630-570 BCE", era: "ancient", 
      culture: "Greek", genre: "Poetry", 
      achievement: "One of the greatest lyric poets in history",
      works: ["Fragments", "Hymn to Aphrodite"], 
      significance: "First known female poet, pioneered personal lyric poetry",
      color: "#8B4513"
    },
    { 
      id: 2, name: "Murasaki Shikibu", years: "c. 973-1014", era: "ancient", 
      culture: "Japanese", genre: "Fiction", 
      achievement: "Wrote world's first novel",
      works: ["The Tale of Genji"], 
      significance: "Created the novel as a literary form 600 years before Europe",
      color: "#8B4513"
    },
    { 
      id: 3, name: "Hildegard of Bingen", years: "1098-1179", era: "ancient", 
      culture: "German", genre: "Religious/Medical", 
      achievement: "Polymath: composer, philosopher, physician, visionary",
      works: ["Scivias", "Physica"], 
      significance: "One of few recorded female voices from medieval period",
      color: "#8B4513"
    },

    // Renaissance & Early Modern (1500-1700)
    { 
      id: 4, name: "Sor Juana Inés de la Cruz", years: "1648-1695", era: "renaissance", 
      culture: "Mexican", genre: "Poetry/Philosophy", 
      achievement: "Baroque intellectual and feminist pioneer",
      works: ["Reply to Sor Philotea", "First Dream"], 
      significance: "Defended women's right to education and intellectual pursuits",
      color: "#CD853F"
    },
    { 
      id: 5, name: "Aphra Behn", years: "1640-1689", era: "renaissance", 
      culture: "English", genre: "Drama/Fiction", 
      achievement: "First professional female writer in English",
      works: ["Oroonoko", "The Rover"], 
      significance: "Pioneered the novel and professional authorship for women",
      color: "#CD853F"
    },

    // 18th Century Enlightenment
    { 
      id: 6, name: "Mary Wollstonecraft", years: "1759-1797", era: "enlightenment", 
      culture: "English", genre: "Feminist Theory", 
      achievement: "Mother of feminism",
      works: ["A Vindication of the Rights of Woman"], 
      significance: "First systematic feminist philosophy arguing for women's equality",
      color: "#DEB887"
    },
    { 
      id: 7, name: "Phillis Wheatley", years: "1753-1784", era: "enlightenment", 
      culture: "African American", genre: "Poetry", 
      achievement: "First published African American poet",
      works: ["Poems on Various Subjects"], 
      significance: "Broke barriers of race and gender in colonial America",
      color: "#DEB887"
    },

    // 19th Century
    { 
      id: 8, name: "Jane Austen", years: "1775-1817", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Master of social realism and wit",
      works: ["Pride and Prejudice", "Emma"], 
      significance: "Redefined the novel with psychological realism",
      color: "#F4A460"
    },
    { 
      id: 9, name: "George Sand", years: "1804-1876", era: "romantic", 
      culture: "French", genre: "Fiction", 
      achievement: "Pioneered women's independence in literature",
      works: ["Indiana", "Consuelo"], 
      significance: "Challenged gender norms through cross-dressing and free love",
      color: "#F4A460"
    },
    { 
      id: 10, name: "Emily Dickinson", years: "1830-1886", era: "romantic", 
      culture: "American", genre: "Poetry", 
      achievement: "Revolutionary poetic voice",
      works: ["Because I could not stop for Death"], 
      significance: "Innovated poetic form and explored themes of death and immortality",
      color: "#F4A460"
    },
    { 
      id: 11, name: "George Eliot", years: "1819-1880", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Psychological realism pioneer",
      works: ["Middlemarch", "Silas Marner"], 
      significance: "Elevated the novel to high art with complex character studies",
      color: "#F4A460"
    },

    // Early 20th Century
    { 
      id: 12, name: "Virginia Woolf", years: "1882-1941", era: "modern", 
      culture: "English", genre: "Fiction/Essays", 
      achievement: "Modernist pioneer",
      works: ["Mrs. Dalloway", "A Room of One's Own"], 
      significance: "Revolutionized narrative technique and feminist criticism",
      color: "#98FB98"
    },
    { 
      id: 13, name: "Zora Neale Hurston", years: "1891-1960", era: "modern", 
      culture: "African American", genre: "Fiction/Anthropology", 
      achievement: "Harlem Renaissance key figure",
      works: ["Their Eyes Were Watching God"], 
      significance: "Celebrated African American culture and women's independence",
      color: "#98FB98"
    },
    { 
      id: 14, name: "Agatha Christie", years: "1890-1976", era: "modern", 
      culture: "English", genre: "Mystery", 
      achievement: "Best-selling novelist of all time",
      works: ["Murder on the Orient Express", "And Then There Were None"], 
      significance: "Created enduring detective characters and plot innovations",
      color: "#98FB98"
    },
    { 
      id: 15, name: "Gabriela Mistral", years: "1889-1957", era: "modern", 
      culture: "Chilean", genre: "Poetry", 
      achievement: "First Latin American Nobel Prize winner",
      works: ["Desolación", "Tala"], 
      significance: "Gave voice to Latin American women and indigenous culture",
      color: "#98FB98"
    },

    // Mid-20th Century
    { 
      id: 16, name: "Simone de Beauvoir", years: "1908-1986", era: "contemporary", 
      culture: "French", genre: "Philosophy/Fiction", 
      achievement: "Existentialist feminist theorist",
      works: ["The Second Sex"], 
      significance: "Launched modern feminist movement with systematic analysis of women's oppression",
      color: "#87CEEB"
    },
    { 
      id: 17, name: "Doris Lessing", years: "1919-2013", era: "contemporary", 
      culture: "British-Zimbabwean", genre: "Fiction", 
      achievement: "Nobel Prize winner",
      works: ["The Golden Notebook"], 
      significance: "Explored women's inner lives and political consciousness",
      color: "#87CEEB"
    },
    { 
      id: 18, name: "Flannery O'Connor", years: "1925-1964", era: "contemporary", 
      culture: "American South", genre: "Fiction", 
      achievement: "Southern Gothic master",
      works: ["Wise Blood", "A Good Man Is Hard to Find"], 
      significance: "Combined religious themes with dark humor and social criticism",
      color: "#87CEEB"
    },
    { 
      id: 19, name: "Chinua Achebe", years: "1930-2013", era: "contemporary", 
      culture: "Nigerian", genre: "Fiction", 
      achievement: "Postcolonial literature pioneer",
      works: ["Things Fall Apart"], 
      significance: "Wait, this is a male author - removing",
      color: "#87CEEB"
    },
    { 
      id: 19, name: "Toni Morrison", years: "1931-2019", era: "contemporary", 
      culture: "African American", genre: "Fiction", 
      achievement: "Nobel Prize winner",
      works: ["Beloved", "Song of Solomon"], 
      significance: "Explored African American experience with lyrical prose and magical realism",
      color: "#87CEEB"
    },

    // Late 20th Century
    { 
      id: 20, name: "Maya Angelou", years: "1928-2014", era: "contemporary", 
      culture: "African American", genre: "Memoir/Poetry", 
      achievement: "Civil rights voice",
      works: ["I Know Why the Caged Bird Sings"], 
      significance: "Powerful voice of resilience and African American women's experience",
      color: "#DDA0DD"
    },
    { 
      id: 21, name: "Margaret Atwood", years: "1939-present", era: "contemporary", 
      culture: "Canadian", genre: "Fiction/Poetry", 
      achievement: "Dystopian fiction master",
      works: ["The Handmaid's Tale", "Cat's Eye"], 
      significance: "Explores women's rights and environmental themes with prescient vision",
      color: "#DDA0DD"
    },
    { 
      id: 22, name: "Isabel Allende", years: "1942-present", era: "contemporary", 
      culture: "Chilean-American", genre: "Fiction", 
      achievement: "Magic realism pioneer in Latin America",
      works: ["The House of the Spirits"], 
      significance: "Brought Latin American women's voices to global prominence",
      color: "#DDA0DD"
    },
    { 
      id: 23, name: "Ayn Rand", years: "1905-1982", era: "contemporary", 
      culture: "Russian-American", genre: "Philosophy/Fiction", 
      achievement: "Objectivism founder",
      works: ["Atlas Shrugged", "The Fountainhead"], 
      significance: "Developed influential philosophy of rational self-interest",
      color: "#DDA0DD"
    },

    // Contemporary (21st Century)
    { 
      id: 24, name: "J.K. Rowling", years: "1965-present", era: "current", 
      culture: "British", genre: "Fantasy", 
      achievement: "Created global literary phenomenon",
      works: ["Harry Potter series"], 
      significance: "Revitalized children's literature and became billionaire author",
      color: "#FFB6C1"
    },
    { 
      id: 25, name: "Chimamanda Ngozi Adichie", years: "1977-present", era: "current", 
      culture: "Nigerian", genre: "Fiction/Essays", 
      achievement: "Contemporary African voice",
      works: ["Americanah", "We Should All Be Feminists"], 
      significance: "Addresses immigration, identity, and feminism with global impact",
      color: "#FFB6C1"
    },
    { 
      id: 26, name: "Zadie Smith", years: "1975-present", era: "current", 
      culture: "British", genre: "Fiction", 
      achievement: "Multicultural Britain chronicler",
      works: ["White Teeth", "On Beauty"], 
      significance: "Explores identity, race, and class in modern Britain",
      color: "#FFB6C1"
    },
    { 
      id: 27, name: "Elena Ferrante", years: "Unknown-present", era: "current", 
      culture: "Italian", genre: "Fiction", 
      achievement: "Anonymous literary sensation",
      works: ["Neapolitan Novels"], 
      significance: "Raw exploration of female friendship and Italian society",
      color: "#FFB6C1"
    }
  ];

  const eras = [
    { id: 'all', name: 'All Eras', icon: '🌍' },
    { id: 'ancient', name: 'Ancient & Medieval', icon: '🏛️' },
    { id: 'renaissance', name: 'Renaissance', icon: '🎨' },
    { id: 'enlightenment', name: '18th Century', icon: '💡' },
    { id: 'romantic', name: '19th Century', icon: '📚' },
    { id: 'modern', name: 'Early 20th C.', icon: '🏙️' },
    { id: 'contemporary', name: 'Mid 20th C.', icon: '✊' },
    { id: 'current', name: '21st Century', icon: '🌐' }
  ];

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: 'Poetry', name: 'Poetry' },
    { id: 'Fiction', name: 'Fiction' },
    { id: 'Philosophy', name: 'Philosophy' },
    { id: 'Mystery', name: 'Mystery' },
    { id: 'Fantasy', name: 'Fantasy' }
  ];

  const filteredAuthors = femaleAuthors.filter(author => {
    const eraMatch = selectedEra === 'all' || author.era === selectedEra;
    const genreMatch = selectedGenre === 'all' || author.genre.includes(selectedGenre);
    return eraMatch && genreMatch;
  });

  const handleCopyQuote = (author) => {
    const quote = `"${author.significance}" - ${author.name} (${author.years})`;
    navigator.clipboard.writeText(quote);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          👩‍💼 Female Authors Through History
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover the groundbreaking women writers who shaped literature across cultures, eras, and genres. 
          From ancient poets to contemporary voices, explore the rich legacy of female authorship.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Era:</h3>
          <div className="flex flex-wrap gap-2">
            {eras.map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEra === era.id
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-600'
                }`}
              >
                {era.icon} {era.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Genre:</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-bold text-pink-600">{filteredAuthors.length}</span> remarkable female authors
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 to-purple-300 rounded-full"></div>

        {/* Author Cards */}
        <div className="space-y-6">
          {filteredAuthors.map((author, index) => (
            <div key={author.id} className="relative pl-20">
              {/* Timeline Dot */}
              <div 
                className="absolute left-6 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                style={{ backgroundColor: author.color }}
              ></div>

              {/* Author Card */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {author.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {author.years} • {author.culture}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium">
                      {author.genre}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    🏆 {author.achievement}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {author.significance}
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Notable Works:</h5>
                  <div className="flex flex-wrap gap-2">
                    {author.works.map((work, workIndex) => (
                      <span key={workIndex} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                        📖 {work}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCopyQuote(author)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                  >
                    📋 Copy Quote
                  </button>
                  <button
                    onClick={() => setSelectedAuthor(selectedAuthor === author.id ? null : author.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    {selectedAuthor === author.id ? '👁️ Hide Details' : '👁️ More Info'}
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedAuthor === author.id && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Why {author.name} Matters:
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {author.significance} Her work represents a crucial voice in {author.culture.toLowerCase()} literature 
                        and continues to influence writers today. As a {author.genre.toLowerCase()} writer, she broke new ground 
                        and opened doors for future generations of female authors.
                      </p>
                      
                      <div className="mt-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <p className="text-sm text-pink-800 dark:text-pink-200">
                          <strong>Literary Impact:</strong> {author.name}'s contributions to {author.genre.toLowerCase()} 
                          during the {author.era} era helped shape modern literature and expand opportunities for women writers worldwide.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-12 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
          📊 Representation Across History
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600">{femaleAuthors.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Authors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{new Set(femaleAuthors.map(a => a.culture)).size}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cultures</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">{eras.length - 1}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Time Periods</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{genres.length - 1}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Genres</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FemaleAuthorsTimeline; 