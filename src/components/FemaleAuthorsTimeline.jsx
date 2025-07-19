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
    { 
      id: 28, name: "Enheduanna", years: "c. 2285-2250 BCE", era: "ancient", 
      culture: "Sumerian", genre: "Poetry/Religious", 
      achievement: "World's first known author by name",
      works: ["The Exaltation of Inanna", "Temple Hymns"], 
      significance: "First known female writer in history, high priestess and poet",
      color: "#8B4513"
    },
    { 
      id: 29, name: "Christine de Pizan", years: "1364-1430", era: "ancient", 
      culture: "French", genre: "Poetry/Philosophy", 
      achievement: "First professional female writer in Europe",
      works: ["The Book of the City of Ladies"], 
      significance: "Challenged misogyny and advocated for women's education",
      color: "#8B4513"
    },
    { 
      id: 30, name: "Julian of Norwich", years: "1342-1416", era: "ancient", 
      culture: "English", genre: "Religious/Mystical", 
      achievement: "First woman to write a book in English",
      works: ["Revelations of Divine Love"], 
      significance: "Pioneered vernacular theological writing by women",
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
    { 
      id: 31, name: "Margaret Cavendish", years: "1623-1673", era: "renaissance", 
      culture: "English", genre: "Science Fiction/Philosophy", 
      achievement: "Wrote first science fiction by a woman",
      works: ["The Blazing World", "Observations upon Experimental Philosophy"], 
      significance: "Pioneer of science fiction and natural philosophy",
      color: "#CD853F"
    },
    { 
      id: 32, name: "Katherine Phillips", years: "1632-1664", era: "renaissance", 
      culture: "Welsh", genre: "Poetry", 
      achievement: "First woman to achieve recognition as a poet",
      works: ["Poems", "Friendship's Mystery"], 
      significance: "Established women's place in English literary culture",
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
    { 
      id: 33, name: "Fanny Burney", years: "1752-1840", era: "enlightenment", 
      culture: "English", genre: "Fiction", 
      achievement: "Pioneer of the novel of manners",
      works: ["Evelina", "Camilla"], 
      significance: "Influenced Jane Austen and shaped the domestic novel",
      color: "#DEB887"
    },
    { 
      id: 34, name: "Olympe de Gouges", years: "1748-1793", era: "enlightenment", 
      culture: "French", genre: "Political Writing", 
      achievement: "Revolutionary feminist and abolitionist",
      works: ["Declaration of the Rights of Woman"], 
      significance: "Advocated for women's rights during French Revolution",
      color: "#DEB887"
    },
    { 
      id: 35, name: "Maria Edgeworth", years: "1768-1849", era: "enlightenment", 
      culture: "Irish", genre: "Fiction", 
      achievement: "Pioneer of the regional novel",
      works: ["Castle Rackrent", "Belinda"], 
      significance: "Influenced Walter Scott and shaped Irish literature",
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
    { 
      id: 36, name: "Charlotte Brontë", years: "1816-1855", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Gothic romance pioneer",
      works: ["Jane Eyre", "Villette"], 
      significance: "Created the modern passionate heroine in literature",
      color: "#F4A460"
    },
    { 
      id: 37, name: "Emily Brontë", years: "1818-1848", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Romantic intensity master",
      works: ["Wuthering Heights"], 
      significance: "Created one of literature's most powerful love stories",
      color: "#F4A460"
    },
    { 
      id: 38, name: "Anne Brontë", years: "1820-1849", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Social realist and feminist",
      works: ["The Tenant of Wildfell Hall"], 
      significance: "Boldly addressed alcoholism and women's rights",
      color: "#F4A460"
    },
    { 
      id: 39, name: "Elizabeth Gaskell", years: "1810-1865", era: "romantic", 
      culture: "English", genre: "Fiction", 
      achievement: "Industrial novel pioneer",
      works: ["North and South", "Mary Barton"], 
      significance: "Exposed social conditions of working class",
      color: "#F4A460"
    },
    { 
      id: 40, name: "Louisa May Alcott", years: "1832-1888", era: "romantic", 
      culture: "American", genre: "Fiction", 
      achievement: "Children's literature master",
      works: ["Little Women", "Little Men"], 
      significance: "Created enduring coming-of-age stories for young women",
      color: "#F4A460"
    },
    { 
      id: 41, name: "Christina Rossetti", years: "1830-1894", era: "romantic", 
      culture: "English", genre: "Poetry", 
      achievement: "Victorian poetry luminary",
      works: ["Goblin Market", "Remember"], 
      significance: "Master of lyrical and narrative poetry",
      color: "#F4A460"
    },
    { 
      id: 42, name: "Kate Chopin", years: "1850-1904", era: "romantic", 
      culture: "American", genre: "Fiction", 
      achievement: "Early feminist fiction pioneer",
      works: ["The Awakening", "Bayou Folk"], 
      significance: "Explored women's sexuality and independence",
      color: "#F4A460"
    },
    { 
      id: 43, name: "Edith Wharton", years: "1862-1937", era: "romantic", 
      culture: "American", genre: "Fiction", 
      achievement: "First woman to win Pulitzer Prize",
      works: ["The Age of Innocence", "Ethan Frome"], 
      significance: "Master of social satire and psychological realism",
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
    { 
      id: 45, name: "Gertrude Stein", years: "1874-1946", era: "modern", 
      culture: "American", genre: "Experimental Fiction", 
      achievement: "Modernist experimental writer",
      works: ["The Autobiography of Alice B. Toklas", "Three Lives"], 
      significance: "Pioneer of experimental narrative and literary salon hostess",
      color: "#98FB98"
    },
    { 
      id: 46, name: "Willa Cather", years: "1873-1947", era: "modern", 
      culture: "American", genre: "Fiction", 
      achievement: "American frontier novelist",
      works: ["My Ántonia", "O Pioneers!"], 
      significance: "Captured the American pioneer experience with lyrical prose",
      color: "#98FB98"
    },
    { 
      id: 47, name: "Edna St. Vincent Millay", years: "1892-1950", era: "modern", 
      culture: "American", genre: "Poetry", 
      achievement: "Jazz Age poetic voice",
      works: ["Renascence", "The Harp-Weaver"], 
      significance: "Embodied modern woman's liberation and won Pulitzer Prize",
      color: "#98FB98"
    },
    { 
      id: 48, name: "Katherine Mansfield", years: "1888-1923", era: "modern", 
      culture: "New Zealand", genre: "Short Stories", 
      achievement: "Modernist short story master",
      works: ["The Garden Party", "Bliss"], 
      significance: "Revolutionized the short story form with psychological insight",
      color: "#98FB98"
    },
    { 
      id: 49, name: "Dorothy Parker", years: "1893-1967", era: "modern", 
      culture: "American", genre: "Humor/Poetry", 
      achievement: "Wit and social critic",
      works: ["Enough Rope", "Men I'm Not Married To"], 
      significance: "Sharp social satirist and founding member of Algonquin Round Table",
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
    { 
      id: 50, name: "Ursula K. Le Guin", years: "1929-2018", era: "contemporary", 
      culture: "American", genre: "Science Fiction/Fantasy", 
      achievement: "Science fiction and fantasy master",
      works: ["The Left Hand of Darkness", "A Wizard of Earthsea"], 
      significance: "Explored gender, politics, and anthropology through speculative fiction",
      color: "#DDA0DD"
    },
    { 
      id: 51, name: "Harper Lee", years: "1926-2016", era: "contemporary", 
      culture: "American", genre: "Fiction", 
      achievement: "Civil rights literature icon",
      works: ["To Kill a Mockingbird"], 
      significance: "Powerful exploration of racial injustice in American South",
      color: "#DDA0DD"
    },
    { 
      id: 52, name: "Octavia Butler", years: "1947-2006", era: "contemporary", 
      culture: "African American", genre: "Science Fiction", 
      achievement: "Afrofuturism pioneer",
      works: ["Kindred", "Parable of the Sower"], 
      significance: "First major Black female science fiction writer",
      color: "#DDA0DD"
    },
    { 
      id: 53, name: "Anne Rice", years: "1941-2021", era: "contemporary", 
      culture: "American", genre: "Gothic Fiction", 
      achievement: "Modern gothic master",
      works: ["Interview with the Vampire", "The Witching Hour"], 
      significance: "Revitalized vampire fiction and gothic romance",
      color: "#DDA0DD"
    },
    { 
      id: 54, name: "Joyce Carol Oates", years: "1938-present", era: "contemporary", 
      culture: "American", genre: "Fiction", 
      achievement: "Prolific literary voice",
      works: ["We Were the Mulvaneys", "Blonde"], 
      significance: "Explored American violence and family dynamics",
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
    },
    { 
      id: 55, name: "Donna Tartt", years: "1963-present", era: "current", 
      culture: "American", genre: "Literary Fiction", 
      achievement: "Pulitzer Prize winner",
      works: ["The Secret History", "The Goldfinch"], 
      significance: "Master of literary suspense and psychological depth",
      color: "#FFB6C1"
    },
    { 
      id: 56, name: "Gillian Flynn", years: "1971-present", era: "current", 
      culture: "American", genre: "Psychological Thriller", 
      achievement: "Dark psychological thriller pioneer",
      works: ["Gone Girl", "Sharp Objects"], 
      significance: "Redefined domestic thriller with unreliable female narrators",
      color: "#FFB6C1"
    },
    { 
      id: 57, name: "Suzanne Collins", years: "1962-present", era: "current", 
      culture: "American", genre: "Young Adult Fiction", 
      achievement: "Dystopian YA phenomenon",
      works: ["The Hunger Games trilogy"], 
      significance: "Created global YA dystopian craze with strong female protagonist",
      color: "#FFB6C1"
    },
    { 
      id: 58, name: "Ayana Mathis", years: "1973-present", era: "current", 
      culture: "African American", genre: "Fiction", 
      achievement: "Contemporary literary voice",
      works: ["The Twelve Tribes of Hattie"], 
      significance: "Powerful storytelling about African American family experience",
      color: "#FFB6C1"
    },
    { 
      id: 59, name: "Jhumpa Lahiri", years: "1967-present", era: "current", 
      culture: "Indian American", genre: "Fiction", 
      achievement: "Immigrant experience chronicler",
      works: ["Interpreter of Maladies", "The Namesake"], 
      significance: "Pulitzer Prize winner exploring immigrant identity",
      color: "#FFB6C1"
    },
    { 
      id: 60, name: "Elizabeth Strout", years: "1956-present", era: "current", 
      culture: "American", genre: "Fiction", 
      achievement: "Pulitzer Prize winner",
      works: ["Olive Kitteridge", "My Name is Lucy Barton"], 
      significance: "Master of interconnected short fiction and character studies",
      color: "#FFB6C1"
    },

    { 
      id: 61, name: "Celeste Ng", years: "1980-present", era: "current", 
      culture: "Chinese American", genre: "Fiction", 
      achievement: "Contemporary literary sensation",
      works: ["Everything I Never Told You", "Little Fires Everywhere"], 
      significance: "Explores race, identity, and family secrets in modern America",
      color: "#FFB6C1"
    },
    { 
      id: 62, name: "Roxane Gay", years: "1974-present", era: "current", 
      culture: "Haitian American", genre: "Essays/Fiction", 
      achievement: "Feminist cultural critic",
      works: ["Bad Feminist", "Hunger"], 
      significance: "Powerful voice on feminism, race, and body politics",
      color: "#FFB6C1"
    },

    { 
      id: 63, name: "Naomi Alderman", years: "1974-present", era: "current", 
      culture: "British", genre: "Speculative Fiction", 
      achievement: "Feminist dystopian novelist",
      works: ["The Power"], 
      significance: "Explores gender dynamics through speculative fiction",
      color: "#FFB6C1"
    },
    { 
      id: 64, name: "Brit Bennett", years: "1990-present", era: "current", 
      culture: "African American", genre: "Fiction", 
      achievement: "Young literary sensation",
      works: ["The Vanishing Half"], 
      significance: "Explores race, identity, and family across generations",
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