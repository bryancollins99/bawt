import React, { useState, useMemo } from 'react';

const FamousPoemsTimeline = () => {
  const [selectedCentury, setSelectedCentury] = useState('all');
  const [selectedMovement, setSelectedMovement] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const poems = [
    // Ancient/Classical
    { year: "7th century BCE", title: "Fragment 31", poet: "Sappho", movement: "Ancient Greek", nationality: "Greek", description: "One of the most famous surviving fragments from the ancient Greek poet Sappho, often called the greatest lyric poet.", excerpt: "He seems to me equal to gods that man...", significance: "One of the earliest and most influential love poems in Western literature." },
    
    // Medieval/Renaissance
    { year: 1387, title: "The Canterbury Tales (Prologue)", poet: "Geoffrey Chaucer", movement: "Medieval", nationality: "English", description: "The opening to Chaucer's masterwork, beginning with the famous 'April showers' passage.", excerpt: "Whan that Aprille with his shoures soote...", significance: "Foundational work of English literature, establishing English as a literary language." },
    
    { year: 1609, title: "Sonnet 18 ('Shall I compare thee to a summer's day?')", poet: "William Shakespeare", movement: "Renaissance", nationality: "English", description: "Perhaps the most famous love sonnet ever written.", excerpt: "Shall I compare thee to a summer's day? / Thou art more lovely and more temperate...", significance: "Defines the English sonnet form and remains one of the most quoted poems in English." },
    
    { year: 1667, title: "Paradise Lost (Opening)", poet: "John Milton", movement: "Renaissance", nationality: "English", description: "Epic poem about the fall of man, opening with one of literature's greatest invocations.", excerpt: "Of Man's first disobedience, and the fruit / Of that forbidden tree whose mortal taste...", significance: "Greatest epic poem in English, profoundly influential on later literature." },
    
    // 18th Century
    { year: 1785, title: "To a Mouse", poet: "Robert Burns", movement: "Romantic", nationality: "Scottish", description: "Burns' reflection on disturbing a mouse's nest while plowing, containing the famous line about 'best laid plans.'", excerpt: "The best-laid schemes o' mice an' men / Gang aft agley...", significance: "Gave John Steinbeck the title for 'Of Mice and Men' and exemplifies Burns' humanitarianism." },
    
    { year: 1794, title: "The Tyger", poet: "William Blake", movement: "Romantic", nationality: "English", description: "Blake's most famous poem questioning the nature of creation and evil.", excerpt: "Tyger Tyger, burning bright, / In the forests of the night...", significance: "One of the most anthologized poems in English, central to Romantic poetry." },
    
    // 19th Century
    { year: 1798, title: "The Rime of the Ancient Mariner", poet: "Samuel Taylor Coleridge", movement: "Romantic", nationality: "English", description: "Supernatural ballad about a mariner who kills an albatross and faces supernatural consequences.", excerpt: "It is an ancient Mariner, / And he stoppeth one of three...", significance: "Foundational work of English Romanticism, source of many common phrases." },
    
    { year: 1816, title: "Kubla Khan", poet: "Samuel Taylor Coleridge", movement: "Romantic", nationality: "English", description: "Dream-poem about the Mongol emperor's pleasure dome, allegedly written under opium influence.", excerpt: "In Xanadu did Kubla Khan / A stately pleasure-dome decree...", significance: "Famous for its mysterious, dreamlike quality and the story of its composition." },
    
    { year: 1818, title: "Ozymandias", poet: "Percy Bysshe Shelley", movement: "Romantic", nationality: "English", description: "Sonnet about the ruins of a once-mighty pharaoh's statue, commenting on the transience of power.", excerpt: "Look on my Works, ye Mighty, and despair!", significance: "Powerful meditation on hubris and the impermanence of earthly power." },
    
    { year: 1819, title: "Ode to a Nightingale", poet: "John Keats", movement: "Romantic", nationality: "English", description: "Keats' meditation on mortality, beauty, and the eternal song of the nightingale.", excerpt: "My heart aches, and a drowsy numbness pains / My sense...", significance: "Considered one of the greatest odes in English literature." },
    
    { year: 1845, title: "The Raven", poet: "Edgar Allan Poe", movement: "Gothic", nationality: "American", description: "Narrative poem about a man's descent into madness as he's visited by a talking raven.", excerpt: "Once upon a midnight dreary, while I pondered, weak and weary...", significance: "Most famous American poem of the 19th century, master class in rhythm and rhyme." },
    
    { year: 1847, title: "Annabel Lee", poet: "Edgar Allan Poe", movement: "Gothic", nationality: "American", description: "Poe's haunting ballad about love that transcends death.", excerpt: "It was many and many a year ago, / In a kingdom by the sea...", significance: "Exemplifies Poe's theory of poetry and his obsession with beautiful death." },
    
    { year: 1855, title: "Song of Myself", poet: "Walt Whitman", movement: "Transcendentalist", nationality: "American", description: "Epic free-verse celebration of the self and American democracy.", excerpt: "I celebrate myself, and sing myself, / And what I assume you shall assume...", significance: "Revolutionary in form and content, defined American poetry." },
    
    { year: 1862, title: "Because I could not stop for Death", poet: "Emily Dickinson", movement: "American Renaissance", nationality: "American", description: "Dickinson's personification of Death as a courteous carriage driver.", excerpt: "Because I could not stop for Death – / He kindly stopped for me...", significance: "One of the most perfect poems about mortality ever written." },
    
    { year: 1888, title: "If—", poet: "Rudyard Kipling", movement: "Victorian", nationality: "British", description: "Poem of fatherly advice about maintaining integrity in the face of adversity.", excerpt: "If you can keep your head when all about you / Are losing theirs and blaming it on you...", significance: "Voted Britain's favorite poem multiple times, epitome of Victorian values." },
    
    { year: 1895, title: "We Wear the Mask", poet: "Paul Laurence Dunbar", movement: "African American Literature", nationality: "American", description: "Powerful poem about the hidden pain behind the smiling faces of African Americans.", excerpt: "We wear the mask that grins and lies, / It hides our cheeks and shades our eyes...", significance: "Prescient analysis of the psychological effects of racism in America." },
    
    // Early 20th Century
    { year: 1915, title: "In Flanders Fields", poet: "John McCrae", movement: "War Poetry", nationality: "Canadian", description: "WWI poem that became synonymous with remembrance of fallen soldiers.", excerpt: "In Flanders fields the poppies blow / Between the crosses, row on row...", significance: "Most iconic WWI poem, established the poppy as symbol of remembrance." },
    
    { year: 1915, title: "The Love Song of J. Alfred Prufrock", poet: "T.S. Eliot", movement: "Modernist", nationality: "American-British", description: "Modernist masterpiece about urban alienation and paralysis.", excerpt: "Let us go then, you and I, / When the evening is spread out against the sky...", significance: "Launched modernist poetry, influenced countless later poets." },
    
    { year: 1920, title: "The Second Coming", poet: "W.B. Yeats", movement: "Modernist", nationality: "Irish", description: "Apocalyptic vision of civilization's collapse and renewal.", excerpt: "Things fall apart; the centre cannot hold; / Mere anarchy is loosed upon the world...", significance: "Most quoted poem in English according to many studies." },
    
    { year: 1922, title: "The Waste Land", poet: "T.S. Eliot", movement: "Modernist", nationality: "American-British", description: "Modernist epic about spiritual desolation in the post-WWI world.", excerpt: "April is the cruellest month, breeding / Lilacs out of the dead land...", significance: "Most important poem of the 20th century, redefined what poetry could be." },
    
    { year: 1923, title: "The Red Wheelbarrow", poet: "William Carlos Williams", movement: "Imagist", nationality: "American", description: "Minimalist poem about finding significance in everyday objects.", excerpt: "so much depends / upon / a red wheel / barrow...", significance: "Most anthologized poem of the last 25 years, exemplifies Imagist principles." },
    
    { year: 1926, title: "Harlem", poet: "Langston Hughes", movement: "Harlem Renaissance", nationality: "American", description: "Powerful meditation on deferred dreams and racial inequality.", excerpt: "What happens to a dream deferred? / Does it dry up like a raisin in the sun?", significance: "Defining poem of the Harlem Renaissance, inspired 'A Raisin in the Sun.'" },
    
    { year: 1928, title: "Thirteen Ways of Looking at a Blackbird", poet: "Wallace Stevens", movement: "Modernist", nationality: "American", description: "Philosophical poem exploring perception and reality through thirteen perspectives.", excerpt: "I was of three minds, / Like a tree / In which there are three blackbirds.", significance: "Masterpiece of philosophical poetry, infinitely imitated." },
    
    { year: 1947, title: "Do Not Go Gentle into That Good Night", poet: "Dylan Thomas", movement: "Neo-Romantic", nationality: "Welsh", description: "Villanelle urging resistance against death, written for his dying father.", excerpt: "Do not go gentle into that good night, / Old age should burn and rave at close of day...", significance: "Most famous villanelle in English, powerful meditation on mortality." },
    
    { year: 1956, title: "Howl", poet: "Allen Ginsberg", movement: "Beat", nationality: "American", description: "Beat Generation manifesto about social outcasts and spiritual seeking.", excerpt: "I saw the best minds of my generation destroyed by madness...", significance: "Defining poem of the Beat Generation, broke barriers of censorship and form." },
    
    { year: 1960, title: "We Real Cool", poet: "Gwendolyn Brooks", movement: "African American", nationality: "American", description: "Powerful poem about young Black men and their choices.", excerpt: "We real cool. We / Left school. We / Lurk late...", significance: "Masterpiece of rhythm and social commentary, Brooks' most famous work." },
    
    { year: 1962, title: "Daddy", poet: "Sylvia Plath", movement: "Confessional", nationality: "American", description: "Intense confessional poem about the poet's relationship with her father and husband.", excerpt: "You do not do, you do not do / Any more, black shoe...", significance: "Most famous confessional poem, controversial and powerful exploration of trauma." },
    
    { year: 1976, title: "One Art", poet: "Elizabeth Bishop", movement: "Confessional", nationality: "American", description: "Villanelle about the art of losing and acceptance of loss.", excerpt: "The art of losing isn't hard to master; / so many things seem filled with the intent / to be lost...", significance: "Perfect example of form serving emotion, Bishop's most beloved poem." },
    
    { year: 1978, title: "Power", poet: "Audre Lorde", movement: "Feminist", nationality: "American", description: "Powerful poem about race, justice, and the murder of Clifford Glover.", excerpt: "The difference between poetry and rhetoric / is being ready to kill yourself / instead of your children.", significance: "Crucial work of intersectional feminism and social justice poetry." },
    
    { year: 1986, title: "Still I Rise", poet: "Maya Angelou", movement: "Civil Rights", nationality: "American", description: "Triumphant anthem of resilience in the face of oppression.", excerpt: "You may write me down in history / With your bitter, twisted lies...", significance: "Became anthem of empowerment, widely quoted and celebrated." },
    
    { year: 2013, title: "Rape Joke", poet: "Patricia Lockwood", movement: "Contemporary", nationality: "American", description: "Viral poem that broke the internet with its unflinching examination of sexual assault.", excerpt: "The rape joke is that you were nineteen.", significance: "Redefined what poetry could do in the digital age, sparked global conversation." }
  ];

  const centuries = [
    { value: 'all', label: 'All Periods' },
    { value: 'ancient', label: 'Ancient & Medieval' },
    { value: '16th-17th', label: '16th-17th Century' },
    { value: '18th', label: '18th Century' },
    { value: '19th', label: '19th Century' },
    { value: '20th', label: '20th Century' },
    { value: '21st', label: '21st Century' }
  ];

  const movements = [
    { value: 'all', label: 'All Movements' },
    { value: 'Ancient Greek', label: 'Ancient Greek' },
    { value: 'Medieval', label: 'Medieval' },
    { value: 'Renaissance', label: 'Renaissance' },
    { value: 'Romantic', label: 'Romantic' },
    { value: 'Victorian', label: 'Victorian' },
    { value: 'Modernist', label: 'Modernist' },
    { value: 'Harlem Renaissance', label: 'Harlem Renaissance' },
    { value: 'Beat', label: 'Beat Generation' },
    { value: 'Confessional', label: 'Confessional' },
    { value: 'Contemporary', label: 'Contemporary' }
  ];

  const getYearFromString = (yearStr) => {
    if (typeof yearStr === 'number') return yearStr;
    if (yearStr.includes('century BCE')) return -600;
    const match = yearStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredPoems = useMemo(() => {
    return poems.filter(poem => {
      const year = getYearFromString(poem.year);
      
      const matchesCentury = selectedCentury === 'all' || 
        (selectedCentury === 'ancient' && year < 1500) ||
        (selectedCentury === '16th-17th' && year >= 1500 && year < 1700) ||
        (selectedCentury === '18th' && year >= 1700 && year < 1800) ||
        (selectedCentury === '19th' && year >= 1800 && year < 1900) ||
        (selectedCentury === '20th' && year >= 1900 && year < 2000) ||
        (selectedCentury === '21st' && year >= 2000);
      
      const matchesMovement = selectedMovement === 'all' || poem.movement === selectedMovement;
      
      const matchesSearch = searchTerm === '' || 
        poem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poem.poet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poem.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCentury && matchesMovement && matchesSearch;
    });
  }, [selectedCentury, selectedMovement, searchTerm]);

  const getMovementColor = (movement) => {
    const colors = {
      'Ancient Greek': 'bg-purple-100 text-purple-800',
      'Medieval': 'bg-amber-100 text-amber-800',
      'Renaissance': 'bg-emerald-100 text-emerald-800',
      'Romantic': 'bg-rose-100 text-rose-800',
      'Victorian': 'bg-indigo-100 text-indigo-800',
      'Modernist': 'bg-cyan-100 text-cyan-800',
      'Harlem Renaissance': 'bg-orange-100 text-orange-800',
      'Beat': 'bg-lime-100 text-lime-800',
      'Confessional': 'bg-pink-100 text-pink-800',
      'Contemporary': 'bg-slate-100 text-slate-800'
    };
    return colors[movement] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalPoems: poems.length,
    countries: [...new Set(poems.map(p => p.nationality))].length,
    movements: [...new Set(poems.map(p => p.movement))].length,
    timeSpan: '2,700+ years'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Most Famous Poems of All Time
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          A chronological journey through the most iconic poems in the English language and world literature
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPoems}</div>
            <div className="text-sm text-blue-800">Iconic Poems</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.countries}</div>
            <div className="text-sm text-green-800">Countries</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.movements}</div>
            <div className="text-sm text-purple-800">Literary Movements</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.timeSpan}</div>
            <div className="text-sm text-orange-800">Time Span</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Century Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Period</label>
            <select 
              value={selectedCentury}
              onChange={(e) => setSelectedCentury(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {centuries.map(century => (
                <option key={century.value} value={century.value}>{century.label}</option>
              ))}
            </select>
          </div>

          {/* Movement Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Movement</label>
            <select 
              value={selectedMovement}
              onChange={(e) => setSelectedMovement(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {movements.map(movement => (
                <option key={movement.value} value={movement.value}>{movement.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Poems</label>
            <input
              type="text"
              placeholder="Search by title, poet, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredPoems.length} of {poems.length} poems
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {filteredPoems.map((poem, index) => (
          <div key={`${poem.year}-${poem.title}`} className="flex gap-6 group">
            {/* Year */}
            <div className="flex-shrink-0 w-24 text-right">
              <div className="text-lg font-bold text-gray-900">{poem.year}</div>
            </div>

            {/* Timeline line */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-md"></div>
              {index < filteredPoems.length - 1 && (
                <div className="w-0.5 h-20 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      "{poem.title}"
                    </h3>
                    <p className="text-lg text-gray-700 font-medium">by {poem.poet}</p>
                    <p className="text-sm text-gray-500">{poem.nationality}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMovementColor(poem.movement)}`}>
                      {poem.movement}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{poem.description}</p>
                
                {poem.excerpt && (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-3 bg-blue-50 p-3 rounded-r">
                    "{poem.excerpt}"
                  </blockquote>
                )}
                
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <strong>Literary Significance:</strong> {poem.significance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">About This Timeline</h3>
        <p className="text-gray-600 mb-4">
          This timeline showcases the most iconic and influential poems in the English language and world literature, 
          spanning from ancient Greece to the digital age. Sources include the <a href="https://lithub.com/the-32-most-iconic-poems-in-the-english-language/" className="text-blue-600 hover:underline">Literary Hub's list of iconic poems</a> and extensive literary scholarship.
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>📜 Covers 2,700+ years of poetry from Sappho to contemporary voices</p>
          <p>🌍 Includes poets from {stats.countries} countries and regions</p>
          <p>🎭 Represents {stats.movements} major literary movements and periods</p>
          <p>💫 Features the most quoted, anthologized, and culturally significant poems</p>
        </div>
      </div>
    </div>
  );
};

export default FamousPoemsTimeline; 