import React, { useState, useMemo } from 'react';

const StephenKingTimeline = () => {
  const [selectedDecade, setSelectedDecade] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const books = [
    // 1970s
    { year: 1974, title: "Carrie", type: "novel", pages: 199, awards: [], pseudonym: false, description: "A bullied teenage girl discovers she has telekinetic powers. King's debut novel." },
    { year: 1975, title: "'Salem's Lot", type: "novel", pages: 439, awards: ["World Fantasy Award nominee"], pseudonym: false, description: "Vampires invade a small Maine town." },
    { year: 1977, title: "The Shining", type: "novel", pages: 447, awards: [], pseudonym: false, description: "A writer's descent into madness at an isolated hotel." },
    { year: 1977, title: "Rage", type: "novel", pages: 211, awards: [], pseudonym: true, description: "A disturbed student holds his class hostage. Published as Richard Bachman." },
    { year: 1978, title: "Night Shift", type: "collection", pages: 336, awards: [], pseudonym: false, description: "King's first short story collection." },
    { year: 1978, title: "The Stand", type: "novel", pages: 823, awards: ["World Fantasy Award nominee"], pseudonym: false, description: "Post-apocalyptic epic about good vs. evil." },
    { year: 1979, title: "The Long Walk", type: "novel", pages: 384, awards: [], pseudonym: true, description: "Dystopian tale of a deadly walking competition. Published as Richard Bachman." },
    { year: 1979, title: "The Dead Zone", type: "novel", pages: 428, awards: [], pseudonym: false, description: "A man gains psychic abilities after a coma." },

    // 1980s
    { year: 1980, title: "Firestarter", type: "novel", pages: 426, awards: [], pseudonym: false, description: "A young girl with pyrokinetic abilities." },
    { year: 1981, title: "Roadwork", type: "novel", pages: 274, awards: [], pseudonym: true, description: "A man's obsession with urban development. Published as Richard Bachman." },
    { year: 1981, title: "Cujo", type: "novel", pages: 319, awards: ["British Fantasy Award winner"], pseudonym: false, description: "A rabid dog terrorizes a family." },
    { year: 1981, title: "Danse Macabre", type: "nonfiction", pages: 400, awards: ["Hugo Award winner"], pseudonym: false, description: "King's examination of horror in film and literature." },
    { year: 1982, title: "The Running Man", type: "novel", pages: 219, awards: [], pseudonym: true, description: "Dystopian reality TV death game. Published as Richard Bachman." },
    { year: 1982, title: "The Dark Tower: The Gunslinger", type: "novel", pages: 224, awards: [], pseudonym: false, description: "First book in the Dark Tower series." },
    { year: 1982, title: "Different Seasons", type: "collection", pages: 527, awards: [], pseudonym: false, description: "Four novellas including 'The Shawshank Redemption' and 'The Body'." },
    { year: 1983, title: "Christine", type: "novel", pages: 526, awards: [], pseudonym: false, description: "A possessed 1958 Plymouth Fury." },
    { year: 1983, title: "Pet Sematary", type: "novel", pages: 374, awards: ["World Fantasy Award nominee"], pseudonym: false, description: "Ancient burial ground brings the dead back wrong." },
    { year: 1983, title: "Cycle of the Werewolf", type: "novella", pages: 127, awards: [], pseudonym: false, description: "Monthly werewolf attacks in a small town." },
    { year: 1984, title: "The Talisman", type: "novel", pages: 646, awards: ["World Fantasy Award nominee"], pseudonym: false, description: "Co-written with Peter Straub. A boy's quest across parallel worlds." },
    { year: 1984, title: "Thinner", type: "novel", pages: 309, awards: [], pseudonym: true, description: "A curse causes rapid weight loss. Published as Richard Bachman." },
    { year: 1985, title: "Skeleton Crew", type: "collection", pages: 512, awards: [], pseudonym: false, description: "Short story collection including 'The Mist'." },
    { year: 1986, title: "It", type: "novel", pages: 1138, awards: ["British Fantasy Award winner"], pseudonym: false, description: "Children battle an ancient evil in Derry, Maine." },
    { year: 1987, title: "The Eyes of the Dragon", type: "novel", pages: 326, awards: [], pseudonym: false, description: "Fantasy novel originally written for his daughter." },
    { year: 1987, title: "The Dark Tower II: The Drawing of the Three", type: "novel", pages: 400, awards: [], pseudonym: false, description: "Second Dark Tower book." },
    { year: 1987, title: "Misery", type: "novel", pages: 310, awards: ["Bram Stoker Award winner"], pseudonym: false, description: "A writer held captive by his 'number one fan'." },
    { year: 1987, title: "The Tommyknockers", type: "novel", pages: 558, awards: [], pseudonym: false, description: "Alien influence corrupts a small town." },
    { year: 1989, title: "The Dark Half", type: "novel", pages: 431, awards: [], pseudonym: false, description: "A writer's pseudonym takes on a life of its own." },

    // 1990s
    { year: 1990, title: "Four Past Midnight", type: "collection", pages: 763, awards: [], pseudonym: false, description: "Four novellas including 'The Langoliers'." },
    { year: 1990, title: "The Stand: Complete & Uncut Edition", type: "novel", pages: 1152, awards: [], pseudonym: false, description: "Expanded version with 400+ additional pages." },
    { year: 1991, title: "The Dark Tower III: The Waste Lands", type: "novel", pages: 512, awards: [], pseudonym: false, description: "Third Dark Tower book." },
    { year: 1991, title: "Needful Things", type: "novel", pages: 690, awards: [], pseudonym: false, description: "The devil opens a shop in Castle Rock." },
    { year: 1992, title: "Gerald's Game", type: "novel", pages: 352, awards: [], pseudonym: false, description: "A woman handcuffed to a bed after her husband dies." },
    { year: 1992, title: "Dolores Claiborne", type: "novel", pages: 305, awards: [], pseudonym: false, description: "A woman confesses to murder." },
    { year: 1993, title: "Nightmares & Dreamscapes", type: "collection", pages: 816, awards: [], pseudonym: false, description: "Short story collection." },
    { year: 1994, title: "Insomnia", type: "novel", pages: 787, awards: [], pseudonym: false, description: "An elderly man's sleeplessness reveals hidden realities." },
    { year: 1995, title: "Rose Madder", type: "novel", pages: 420, awards: [], pseudonym: false, description: "A woman escapes an abusive marriage." },
    { year: 1996, title: "The Green Mile", type: "novel", pages: 400, awards: ["Bram Stoker Award winner"], pseudonym: false, description: "A gentle giant with healing powers on death row." },
    { year: 1996, title: "Desperation", type: "novel", pages: 704, awards: ["Locus Award winner"], pseudonym: false, description: "A possessed sheriff terrorizes travelers." },
    { year: 1996, title: "The Regulators", type: "novel", pages: 480, awards: [], pseudonym: true, description: "Companion novel to Desperation. Published as Richard Bachman." },
    { year: 1997, title: "The Dark Tower IV: Wizard and Glass", type: "novel", pages: 787, awards: [], pseudonym: false, description: "Fourth Dark Tower book, Roland's backstory." },
    { year: 1998, title: "Bag of Bones", type: "novel", pages: 529, awards: ["Bram Stoker Award winner", "British Fantasy Award winner"], pseudonym: false, description: "A widowed writer haunted by his wife's ghost." },
    { year: 1999, title: "The Girl Who Loved Tom Gordon", type: "novel", pages: 224, awards: [], pseudonym: false, description: "A young girl lost in the woods." },
    { year: 1999, title: "Hearts in Atlantis", type: "collection", pages: 528, awards: [], pseudonym: false, description: "Connected stories about the 1960s." },

    // 2000s
    { year: 2000, title: "On Writing", type: "nonfiction", pages: 288, awards: [], pseudonym: false, description: "Part memoir, part masterclass on writing." },
    { year: 2001, title: "Dreamcatcher", type: "novel", pages: 620, awards: [], pseudonym: false, description: "Childhood friends battle alien invasion." },
    { year: 2001, title: "Black House", type: "novel", pages: 625, awards: [], pseudonym: false, description: "Co-written with Peter Straub. Sequel to The Talisman." },
    { year: 2002, title: "Everything's Eventual", type: "collection", pages: 464, awards: [], pseudonym: false, description: "Short story collection." },
    { year: 2002, title: "From a Buick 8", type: "novel", pages: 368, awards: [], pseudonym: false, description: "A mysterious car with supernatural properties." },
    { year: 2003, title: "The Dark Tower V: Wolves of the Calla", type: "novel", pages: 714, awards: [], pseudonym: false, description: "Fifth Dark Tower book." },
    { year: 2004, title: "The Dark Tower VI: Song of Susannah", type: "novel", pages: 432, awards: [], pseudonym: false, description: "Sixth Dark Tower book." },
    { year: 2004, title: "The Dark Tower VII: The Dark Tower", type: "novel", pages: 845, awards: ["British Fantasy Award winner"], pseudonym: false, description: "Final Dark Tower book." },
    { year: 2005, title: "The Colorado Kid", type: "novel", pages: 184, awards: [], pseudonym: false, description: "A mystery that defies solution." },
    { year: 2006, title: "Cell", type: "novel", pages: 351, awards: [], pseudonym: false, description: "Cell phones turn users into zombies." },
    { year: 2006, title: "Lisey's Story", type: "novel", pages: 528, awards: ["Bram Stoker Award winner"], pseudonym: false, description: "A widow discovers her late husband's secrets." },
    { year: 2007, title: "Blaze", type: "novel", pages: 304, awards: [], pseudonym: true, description: "A mentally disabled man's kidnapping scheme. Published as Richard Bachman." },
    { year: 2008, title: "Duma Key", type: "novel", pages: 607, awards: [], pseudonym: false, description: "An artist's paintings come to life." },
    { year: 2008, title: "Just After Sunset", type: "collection", pages: 367, awards: [], pseudonym: false, description: "Short story collection." },
    { year: 2009, title: "Under the Dome", type: "novel", pages: 1074, awards: [], pseudonym: false, description: "A town trapped under an invisible barrier." },

    // 2010s
    { year: 2010, title: "Full Dark, No Stars", type: "collection", pages: 368, awards: [], pseudonym: false, description: "Four dark novellas." },
    { year: 2011, title: "11/22/63", type: "novel", pages: 849, awards: [], pseudonym: false, description: "Time travel to prevent JFK's assassination." },
    { year: 2012, title: "The Dark Tower: The Wind Through the Keyhole", type: "novel", pages: 336, awards: [], pseudonym: false, description: "Dark Tower book 4.5." },
    { year: 2013, title: "Joyland", type: "novel", pages: 283, awards: [], pseudonym: false, description: "Murder mystery at an amusement park." },
    { year: 2013, title: "Doctor Sleep", type: "novel", pages: 531, awards: [], pseudonym: false, description: "Sequel to The Shining." },
    { year: 2014, title: "Mr. Mercedes", type: "novel", pages: 435, awards: ["Edgar Award winner"], pseudonym: false, description: "First Bill Hodges trilogy book." },
    { year: 2014, title: "Revival", type: "novel", pages: 405, awards: [], pseudonym: false, description: "A preacher's dangerous obsession with electricity." },
    { year: 2015, title: "Finders Keepers", type: "novel", pages: 434, awards: [], pseudonym: false, description: "Second Bill Hodges trilogy book." },
    { year: 2015, title: "The Bazaar of Bad Dreams", type: "collection", pages: 495, awards: [], pseudonym: false, description: "Short story collection." },
    { year: 2016, title: "End of Watch", type: "novel", pages: 432, awards: [], pseudonym: false, description: "Third Bill Hodges trilogy book." },
    { year: 2017, title: "Sleeping Beauties", type: "novel", pages: 702, awards: [], pseudonym: false, description: "Co-written with Owen King. Women fall into mysterious sleep." },
    { year: 2018, title: "The Outsider", type: "novel", pages: 560, awards: [], pseudonym: false, description: "Detective investigates an impossible crime." },
    { year: 2018, title: "Elevation", type: "novella", pages: 144, awards: [], pseudonym: false, description: "A man begins losing weight but not mass." },
    { year: 2019, title: "The Institute", type: "novel", pages: 557, awards: [], pseudonym: false, description: "Children with psychic abilities imprisoned." },

    // 2020s
    { year: 2020, title: "If It Bleeds", type: "collection", pages: 446, awards: [], pseudonym: false, description: "Four novellas including 'The Life of Chuck'." },
    { year: 2021, title: "Later", type: "novel", pages: 256, awards: [], pseudonym: false, description: "A boy who can see dead people." },
    { year: 2021, title: "Billy Summers", type: "novel", pages: 528, awards: [], pseudonym: false, description: "A hitman's final job." },
    { year: 2022, title: "Fairy Tale", type: "novel", pages: 608, awards: [], pseudonym: false, description: "A teenager discovers a portal to another world." },
    { year: 2023, title: "Holly", type: "novel", pages: 464, awards: [], pseudonym: false, description: "Holly Gibney investigates academic predators." },
    { year: 2024, title: "You Like It Darker", type: "collection", pages: 502, awards: [], pseudonym: false, description: "Twelve stories of suspense and horror." }
  ];

  const decades = [
    { value: 'all', label: 'All Years' },
    { value: '1970s', label: '1970s' },
    { value: '1980s', label: '1980s' },
    { value: '1990s', label: '1990s' },
    { value: '2000s', label: '2000s' },
    { value: '2010s', label: '2010s' },
    { value: '2020s', label: '2020s' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'novel', label: 'Novels' },
    { value: 'collection', label: 'Collections' },
    { value: 'nonfiction', label: 'Non-fiction' },
    { value: 'novella', label: 'Novellas' }
  ];

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesDecade = selectedDecade === 'all' || 
        (selectedDecade === '1970s' && book.year >= 1970 && book.year < 1980) ||
        (selectedDecade === '1980s' && book.year >= 1980 && book.year < 1990) ||
        (selectedDecade === '1990s' && book.year >= 1990 && book.year < 2000) ||
        (selectedDecade === '2000s' && book.year >= 2000 && book.year < 2010) ||
        (selectedDecade === '2010s' && book.year >= 2010 && book.year < 2020) ||
        (selectedDecade === '2020s' && book.year >= 2020);
      
      const matchesType = selectedType === 'all' || book.type === selectedType;
      
      const matchesSearch = searchTerm === '' || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDecade && matchesType && matchesSearch;
    });
  }, [selectedDecade, selectedType, searchTerm]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'novel': return 'bg-blue-100 text-blue-800';
      case 'collection': return 'bg-green-100 text-green-800';
      case 'nonfiction': return 'bg-purple-100 text-purple-800';
      case 'novella': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalBooks: books.length,
    novels: books.filter(b => b.type === 'novel').length,
    collections: books.filter(b => b.type === 'collection').length,
    awards: books.reduce((acc, book) => acc + book.awards.length, 0),
    bachmanBooks: books.filter(b => b.pseudonym).length
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Stephen King Complete Timeline
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          A comprehensive chronological guide to all of Stephen King's published works (1974-2024)
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBooks}</div>
            <div className="text-sm text-blue-800">Total Books</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.novels}</div>
            <div className="text-sm text-green-800">Novels</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.collections}</div>
            <div className="text-sm text-purple-800">Collections</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.awards}</div>
            <div className="text-sm text-orange-800">Awards</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.bachmanBooks}</div>
            <div className="text-sm text-red-800">Bachman Books</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Decade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Decade</label>
            <select 
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {decades.map(decade => (
                <option key={decade.value} value={decade.value}>{decade.label}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {filteredBooks.map((book, index) => (
          <div key={`${book.year}-${book.title}`} className="flex gap-6 group">
            {/* Year */}
            <div className="flex-shrink-0 w-20 text-right">
              <div className="text-lg font-bold text-gray-900">{book.year}</div>
            </div>

            {/* Timeline line */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md"></div>
              {index < filteredBooks.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {book.title}
                    {book.pseudonym && (
                      <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        Richard Bachman
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(book.type)}`}>
                      {book.type.charAt(0).toUpperCase() + book.type.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {book.pages} pages
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{book.description}</p>
                
                {book.awards.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {book.awards.map((award, i) => (
                      <span key={i} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        🏆 {award}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">About This Timeline</h3>
        <p className="text-gray-600 mb-4">
          This comprehensive timeline includes all of Stephen King's major published works from 1974 to 2024, 
          sourced from Wikipedia and verified against multiple databases. It includes novels, short story collections, 
          non-fiction works, and notable novellas.
        </p>
        <div className="text-sm text-gray-500">
          <p>📚 Includes {stats.bachmanBooks} books published under the pseudonym Richard Bachman</p>
          <p>🏆 Covers {stats.awards} major literary awards and nominations</p>
          <p>📖 Represents over 50 years of publishing history</p>
        </div>
      </div>
    </div>
  );
};

export default StephenKingTimeline; 