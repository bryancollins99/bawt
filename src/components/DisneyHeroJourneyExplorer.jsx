import React, { useState } from 'react';

const DisneyHeroJourneyExplorer = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareMovies, setCompareMovies] = useState([]);

  const heroJourneyStages = [
    { id: 1, name: "Ordinary World", description: "The hero's normal life before transformation" },
    { id: 2, name: "Call to Adventure", description: "The inciting incident that starts the journey" },
    { id: 3, name: "Refusal of the Call", description: "Initial hesitation or fear" },
    { id: 4, name: "Meeting the Mentor", description: "Encountering a wise figure who gives advice" },
    { id: 5, name: "Crossing the Threshold", description: "Committing to the adventure" },
    { id: 6, name: "Tests & Allies", description: "Facing challenges and meeting companions" },
    { id: 7, name: "Approach to the Inmost Cave", description: "Preparing for the major challenge" },
    { id: 8, name: "The Ordeal", description: "The crisis point of the journey" },
    { id: 9, name: "The Reward", description: "Surviving and gaining something important" },
    { id: 10, name: "The Road Back", description: "Beginning the journey home" },
    { id: 11, name: "Resurrection", description: "Final test and transformation" },
    { id: 12, name: "Return with Elixir", description: "Coming home changed with wisdom to share" }
  ];

  const disneyMovies = [
    {
      id: 1,
      title: "The Lion King",
      year: 1994,
      hero: "Simba",
      color: "#F4A261",
      stages: {
        1: { scene: "Pride Lands with his family", quote: "Everything the light touches is our kingdom" },
        2: { scene: "Scar encourages visit to elephant graveyard", quote: "Life's not fair, is it?" },
        3: { scene: "Simba hesitates about responsibility", quote: "I can't go back. What would it prove anyway?" },
        4: { scene: "Rafiki shows Simba his father's spirit", quote: "Remember who you are" },
        5: { scene: "Deciding to return to Pride Rock", quote: "I'm going back!" },
        6: { scene: "Reuniting with Nala and Timon & Pumbaa", quote: "It's time!" },
        7: { scene: "Approaching Pride Rock", quote: "This is my kingdom. If I don't fight for it, who will?" },
        8: { scene: "Confronting Scar and the truth about Mufasa", quote: "I killed Mufasa!" },
        9: { scene: "Defeating Scar and overcoming self-doubt", quote: "I am not who I used to be" },
        10: { scene: "Taking responsibility as king", quote: "It is time" },
        11: { scene: "Final transformation into true king", quote: "We are one" },
        12: { scene: "Restoring the Pride Lands and the circle of life", quote: "And so we are all connected in the great Circle of Life" }
      }
    },
    {
      id: 2,
      title: "Mulan",
      year: 1998,
      hero: "Mulan",
      color: "#E63946",
      stages: {
        1: { scene: "Living with her family, trying to be a perfect daughter", quote: "A girl can bring her family great honor in one way, by striking a good match" },
        2: { scene: "Father called to war despite his condition", quote: "Fa Zhou!" },
        3: { scene: "Knowing she can't let her father go", quote: "If I were truly to be myself, I would break my family's heart" },
        4: { scene: "Meeting Mushu the dragon", quote: "I'm gonna hit you so hard, it'll make your ancestors dizzy!" },
        5: { scene: "Disguising as a man and joining the army", quote: "From now on, you have my trust" },
        6: { scene: "Training camp with fellow soldiers", quote: "Let's get down to business, to defeat the Huns" },
        7: { scene: "Preparing for battle against the Huns", quote: "Now all of China knows you're here" },
        8: { scene: "The mountain battle and avalanche", quote: "You missed! How could you miss? He was three feet in front of you!" },
        9: { scene: "Saving the army and proving her worth", quote: "The flower that blooms in adversity is the most rare and beautiful of all" },
        10: { scene: "Racing to warn Shang about the palace attack", quote: "The Emperor!" },
        11: { scene: "Final battle at the palace", quote: "You took away my victory!" },
        12: { scene: "Honored by the Emperor and returning home", quote: "The greatest gift and honor is having you for a daughter" }
      }
    },
    {
      id: 3,
      title: "Hercules",
      year: 1997,
      hero: "Hercules",
      color: "#F77F00",
      stages: {
        1: { scene: "Living as an outcast on earth", quote: "I have often dreamed of a far off place where a hero's welcome would be waiting for me" },
        2: { scene: "Discovery of his true parentage", quote: "My boy... my little Hercules" },
        3: { scene: "Hesitation about becoming a true hero", quote: "But I'm not a hero. I'm nothing" },
        4: { scene: "Training with Philoctetes", quote: "Rule number 95: Concentrate!" },
        5: { scene: "Leaving for Thebes to prove himself", quote: "I'm ready!" },
        6: { scene: "Fighting monsters and meeting Meg", quote: "It's a small underworld after all" },
        7: { scene: "Realizing he must face Hades", quote: "Face it, kid, you're too sweet" },
        8: { scene: "Meg's sacrifice and Hercules losing his strength", quote: "People always do crazy things when they're in love" },
        9: { scene: "True heroism through sacrifice", quote: "A true hero isn't measured by the size of his strength, but by the strength of his heart" },
        10: { scene: "Rescuing Meg from the Underworld", quote: "This is the moment of truth" },
        11: { scene: "Becoming a true hero through love", quote: "A true hero isn't measured by the size of his strength, but by the strength of his heart" },
        12: { scene: "Choosing love over godhood", quote: "A life without Meg, even an immortal life, would be empty" }
      }
    },
    {
      id: 4,
      title: "Aladdin",
      year: 1992,
      hero: "Aladdin",
      color: "#9B59B6",
      stages: {
        1: { scene: "Living as a 'street rat' in Agrabah", quote: "One jump ahead of the bread line" },
        2: { scene: "Jafar's offer to retrieve the lamp", quote: "You're a diamond in the rough" },
        3: { scene: "Fear of entering the Cave of Wonders", quote: "I can't do this" },
        4: { scene: "Meeting the Genie", quote: "Ten thousand years will give you such a crick in the neck!" },
        5: { scene: "Entering the palace as Prince Ali", quote: "Prince Ali, fabulous he, Ali Ababwa" },
        6: { scene: "Winning Jasmine's heart and facing Jafar's plots", quote: "Do you trust me?" },
        7: { scene: "Preparing for final confrontation with Jafar", quote: "The universe is mine to command!" },
        8: { scene: "Battle with Jafar as a giant snake", quote: "You little fool! You thought you could defeat the most powerful being on earth!" },
        9: { scene: "Outsmarting Jafar with the genie's power", quote: "The most powerful being in the universe, and you're stuck living in a lamp!" },
        10: { scene: "Using final wish to free the Genie", quote: "I wish for your freedom" },
        11: { scene: "Being accepted by the Sultan", quote: "Princess Jasmine, my daughter" },
        12: { scene: "Finding true love and self-acceptance", quote: "I am not a prize to be won!" }
      }
    },
    {
      id: 5,
      title: "Toy Story",
      year: 1995,
      hero: "Woody",
      color: "#E74C3C",
      stages: {
        1: { scene: "Leading Andy's toys as the favorite", quote: "Reach for the sky!" },
        2: { scene: "Buzz Lightyear's arrival threatens his position", quote: "There's a snake in my boot!" },
        3: { scene: "Refusing to accept Buzz as a threat", quote: "I am not a toy!" },
        4: { scene: "Learning to work with Buzz", quote: "To infinity and beyond!" },
        5: { scene: "Both toys lost outside Andy's room", quote: "We're not in the toy box anymore" },
        6: { scene: "Escaping Sid's house together", quote: "Come on, Buzz" },
        7: { scene: "Preparing to escape Sid's torture", quote: "Play nice!" },
        8: { scene: "Confronting Sid and his toy-destroying habits", quote: "So play nice!" },
        9: { scene: "Working together to catch up to Andy", quote: "I can fly around this galaxy with my eyes closed" },
        10: { scene: "Racing to return to Andy before moving", quote: "Andy's coming!" },
        11: { scene: "Successful rescue and friendship", quote: "Strange things are happening to me" },
        12: { scene: "Sharing leadership and friendship", quote: "You've got a friend in me" }
      }
    },
    {
      id: 6,
      title: "Moana",
      year: 2016,
      hero: "Moana",
      color: "#3498DB",
      stages: {
        1: { scene: "Life on Motunui island as chief's daughter", quote: "The village of Motunui is all you need" },
        2: { scene: "Ocean chooses her to restore Te Fiti's heart", quote: "The ocean chose you" },
        3: { scene: "Father forbids leaving the reef", quote: "No one goes beyond the reef!" },
        4: { scene: "Grandmother Tala reveals the truth and gives the heart", quote: "The ocean doesn't help you, you help yourself" },
        5: { scene: "Setting sail beyond the reef", quote: "I am Moana of Motunui" },
        6: { scene: "Finding and convincing Maui to help", quote: "If you wear a dress and have an animal sidekick, you're a princess" },
        7: { scene: "Approaching Te Ka", quote: "Let her come to me" },
        8: { scene: "Maui loses his hook and abandons her", quote: "Without my hook, I am nothing" },
        9: { scene: "Realizing Te Ka is Te Fiti", quote: "I have crossed the horizon to find you" },
        10: { scene: "Restoring Te Fiti's heart", quote: "This is not who you are" },
        11: { scene: "Te Fiti's restoration and Maui's redemption", quote: "Thank you" },
        12: { scene: "Returning home as a wayfinder", quote: "We were voyagers" }
      }
    },
    {
      id: 7,
      title: "Finding Nemo",
      year: 2003,
      hero: "Marlin",
      color: "#FF6B35",
      stages: {
        1: { scene: "Overprotective life with Nemo on the reef", quote: "Now, what's the one thing we have to remember about the ocean?" },
        2: { scene: "Nemo is captured by divers", quote: "Daddy!" },
        3: { scene: "Fear of leaving the anemone", quote: "I can't lose you too" },
        4: { scene: "Meeting Dory who offers to help", quote: "I suffer from short-term memory loss" },
        5: { scene: "Leaving the reef to find Nemo", quote: "Just keep swimming" },
        6: { scene: "Facing sharks, jellyfish, and other dangers", quote: "Fish are friends, not food" },
        7: { scene: "Approaching the dentist's office", quote: "P. Sherman, 42 Wallaby Way, Sydney" },
        8: { scene: "Near-death experience with the whale", quote: "It's time to let go" },
        9: { scene: "Learning to trust and let go", quote: "I trust you" },
        10: { scene: "Racing to save Dory and other fish", quote: "Dory!" },
        11: { scene: "Final rescue with Nemo's help", quote: "Dad, I can do it!" },
        12: { scene: "New relationship with Nemo, more trusting", quote: "See you after school, Dad!" }
      }
    },
    {
      id: 8,
      title: "Up",
      year: 2009,
      hero: "Carl",
      color: "#8E44AD",
      stages: {
        1: { scene: "Life with Ellie, then alone after her death", quote: "Adventure is out there!" },
        2: { scene: "Threat of being moved to Shady Oaks", quote: "They can have our house when they pry it from our cold, dead hands" },
        3: { scene: "Reluctance to leave his memories", quote: "I don't want your help" },
        4: { scene: "Russell becomes his unlikely companion", quote: "I'm gonna help you cross something off your list" },
        5: { scene: "House takes flight with balloons", quote: "We're on our way, Ellie" },
        6: { scene: "Adventures in Paradise Falls", quote: "I was hiding under your porch because I love you" },
        7: { scene: "Approaching Muntz's dirigible", quote: "Charles Muntz is my hero" },
        8: { scene: "Battle with Muntz over Kevin", quote: "You came here in that?" },
        9: { scene: "Saving Russell and Kevin", quote: "Russell! Hang on!" },
        10: { scene: "Letting go of the house", quote: "It's just a house" },
        11: { scene: "Defeating Muntz and saving his friends", quote: "Thanks for the adventure" },
        12: { scene: "New life with Russell as surrogate grandson", quote: "Ellie, it worked!" }
      }
    },
    {
      id: 9,
      title: "Pocahontas",
      year: 1995,
      hero: "Pocahontas",
      color: "#27AE60",
      stages: {
        1: { scene: "Life with her tribe in harmony with nature", quote: "Steady as the beating drum" },
        2: { scene: "Vision of a spinning arrow and arriving settlers", quote: "What I love most about rivers is you can't step in the same river twice" },
        3: { scene: "Torn between duty and curiosity", quote: "Father, for many nights now I've been having a very strange dream" },
        4: { scene: "Grandmother Willow's guidance", quote: "Listen with your heart, you will understand" },
        5: { scene: "Meeting John Smith", quote: "You think I'm an ignorant savage" },
        6: { scene: "Learning about each other's worlds", quote: "Can you paint with all the colors of the wind?" },
        7: { scene: "Growing tensions between their peoples", quote: "This is what we feared the white man would bring" },
        8: { scene: "John Smith's capture and near execution", quote: "If you kill him, you'll have to kill me too" },
        9: { scene: "Stopping the execution through courage", quote: "Look around you. This is where the path of hatred has brought us" },
        10: { scene: "John Smith's injury and departure", quote: "Come with me?" },
        11: { scene: "Choosing her people over love", quote: "I'm needed here" },
        12: { scene: "Bringing peace and understanding", quote: "Now I know why the spirit brought us together" }
      }
    },
    {
      id: 10,
      title: "Coco",
      year: 2017,
      hero: "Miguel",
      color: "#FF8C00",
      stages: {
        1: { scene: "Living with music-hating family", quote: "Music has always been banned in my family" },
        2: { scene: "Discovering Ernesto de la Cruz is his great-great-grandfather", quote: "He's family!" },
        3: { scene: "Family forbids music despite his dreams", quote: "The music, it's not just in me, it is me" },
        4: { scene: "Meeting Héctor in the Land of the Dead", quote: "I just need to borrow it" },
        5: { scene: "Entering the Land of the Dead", quote: "Welcome to the Land of the Dead!" },
        6: { scene: "Navigating the spirit world with Héctor", quote: "We're family!" },
        7: { scene: "Approaching Ernesto's concert", quote: "The whole world will know my name!" },
        8: { scene: "Discovering Ernesto's betrayal of Héctor", quote: "That's my guitar!" },
        9: { scene: "Learning the truth about his family", quote: "You're my great-great-grandson!" },
        10: { scene: "Racing back to save Héctor", quote: "She's forgetting me" },
        11: { scene: "Performing for Coco to save Héctor", quote: "Remember me, though I have to say goodbye" },
        12: { scene: "Music returns to the family", quote: "Music's the only way I can reach her" }
      }
    },
    {
      id: 11,
      title: "Brave",
      year: 2012,
      hero: "Merida",
      color: "#E67E22",
      stages: {
        1: { scene: "Scottish princess resisting royal duties", quote: "I want my freedom!" },
        2: { scene: "Forced betrothal ceremony", quote: "I'll be shooting for my own hand!" },
        3: { scene: "Running away to avoid marriage", quote: "I won't go through with it!" },
        4: { scene: "Meeting the witch in the forest", quote: "I want a spell that changes my mum" },
        5: { scene: "Giving Elinor the spell cake", quote: "Mum, you can't do this to me!" },
        6: { scene: "Dealing with Elinor as a bear", quote: "Mum, is that you?" },
        7: { scene: "Preparing to fix the spell", quote: "We have to get back before they find her" },
        8: { scene: "Elinor nearly lost to the bear's mind", quote: "Mum, you're scaring me!" },
        9: { scene: "Breaking the spell through love", quote: "I love you" },
        10: { scene: "Returning to face the clans", quote: "We've all got to be brave enough to see it" },
        11: { scene: "Final transformation and understanding", quote: "Our fate lives within us" },
        12: { scene: "New relationship with her mother and freedom", quote: "There are those who say fate is something beyond our command" }
      }
    },
    {
      id: 12,
      title: "The Jungle Book",
      year: 1967,
      hero: "Mowgli",
      color: "#2ECC71",
      stages: {
        1: { scene: "Living with wolves in the jungle", quote: "For ten seasons the man-cub has lived among us" },
        2: { scene: "Shere Khan's return threatens his safety", quote: "The man-cub must go!" },
        3: { scene: "Resistance to leaving the jungle", quote: "I'm not afraid of Shere Khan!" },
        4: { scene: "Bagheera guides him toward the village", quote: "You must go to the man-village" },
        5: { scene: "Leaving the wolf pack", quote: "Go on! Get out of here!" },
        6: { scene: "Meeting Baloo and jungle adventures", quote: "Look for the bare necessities" },
        7: { scene: "Approaching the ancient ruins", quote: "I wanna be like you" },
        8: { scene: "Confrontation with Shere Khan", quote: "Are you afraid of me?" },
        9: { scene: "Using fire against Shere Khan", quote: "I'm not afraid of you!" },
        10: { scene: "Walking toward the man-village", quote: "Mowgli, come back!" },
        11: { scene: "Choosing between two worlds", quote: "He's where he belongs" },
        12: { scene: "Finding his place with humans while keeping jungle friends", quote: "That's the last we'll see of him" }
      }
    }
  ];

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareMovies([]);
    setSelectedMovie(null);
  };

  const addToCompare = (movie) => {
    if (compareMovies.length < 3 && !compareMovies.find(m => m.id === movie.id)) {
      setCompareMovies([...compareMovies, movie]);
    }
  };

  const removeFromCompare = (movieId) => {
    setCompareMovies(compareMovies.filter(m => m.id !== movieId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            🎬 Disney Hero's Journey Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how 12 beloved Disney movies follow Joseph Campbell's timeless Hero's Journey structure. 
            Explore each stage, compare different films, and understand the magic behind great storytelling.
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={toggleCompareMode}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                compareMode 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {compareMode ? '📊 Exit Compare Mode' : '🔄 Compare Movies'}
            </button>
            <button
              onClick={() => {
                setSelectedMovie(null);
                setSelectedStage(null);
                setCompareMovies([]);
                setCompareMode(false);
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Compare Mode */}
        {compareMode && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">🔍 Compare Movies</h3>
            <p className="text-gray-600 mb-4">Select up to 3 movies to compare their hero's journey stages:</p>
            
            {compareMovies.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Selected Movies:</h4>
                <div className="flex flex-wrap gap-3">
                  {compareMovies.map(movie => (
                    <div 
                      key={movie.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300"
                    >
                      <span style={{ color: movie.color }}>{movie.title}</span>
                      <button
                        onClick={() => removeFromCompare(movie.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Movie Grid */}
        {!selectedMovie && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {disneyMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:bg-white transition-all cursor-pointer transform hover:scale-105 shadow-lg border border-gray-200 hover:shadow-xl"
                onClick={() => compareMode ? addToCompare(movie) : setSelectedMovie(movie)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: movie.color }}>
                    {movie.title}
                  </h3>
                  <span className="text-sm text-gray-500">({movie.year})</span>
                </div>
                <p className="text-gray-600 mb-4">
                  <strong>Hero:</strong> {movie.hero}
                </p>
                
                {compareMode ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {compareMovies.find(m => m.id === movie.id) ? '✅ Selected' : 'Click to add'}
                    </span>
                    {compareMovies.find(m => m.id === movie.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCompare(movie.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                    Explore Journey 🚀
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Compare View */}
        {compareMode && compareMovies.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-6">Journey Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b border-gray-300">Stage</th>
                    {compareMovies.map(movie => (
                                              <th key={movie.id} className="text-left p-3 border-b border-gray-300" style={{ color: movie.color }}>
                        {movie.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heroJourneyStages.map(stage => (
                    <tr key={stage.id} className="border-b border-gray-200">
                      <td className="p-3 font-semibold">
                        <div>
                          <div className="text-yellow-400">{stage.name}</div>
                                                      <div className="text-sm text-gray-600">{stage.description}</div>
                        </div>
                      </td>
                      {compareMovies.map(movie => (
                        <td key={movie.id} className="p-3">
                          <div className="text-sm">
                            <div className="font-medium mb-1">{movie.stages[stage.id]?.scene}</div>
                            <div className="text-gray-600 italic">"{movie.stages[stage.id]?.quote}"</div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Individual Movie View */}
        {selectedMovie && !compareMode && (
          <div className="space-y-8">
            {/* Movie Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-gray-200">
              <h2 className="text-4xl font-bold mb-4" style={{ color: selectedMovie.color }}>
                {selectedMovie.title} ({selectedMovie.year})
              </h2>
              <p className="text-xl text-gray-600">
                Follow <strong>{selectedMovie.hero}</strong>'s journey through all 12 stages
              </p>
              <button
                onClick={() => setSelectedMovie(null)}
                                  className="mt-4 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all"
              >
                ← Back to Movies
              </button>
            </div>

            {/* Hero's Journey Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroJourneyStages.map((stage) => (
                <div
                  key={stage.id}
                  className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-all shadow-lg border border-gray-200 hover:shadow-xl ${
                    selectedStage === stage.id ? 'ring-2 ring-yellow-400 bg-white' : 'hover:bg-white'
                  }`}
                  onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                      {stage.id}
                    </div>
                    <h3 className="text-lg font-bold text-yellow-400">{stage.name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                                              <h4 className="font-semibold text-gray-800 mb-1">Scene:</h4>
                        <p className="text-gray-600 text-sm">{selectedMovie.stages[stage.id]?.scene}</p>
                    </div>
                    
                    {selectedStage === stage.id && (
                                              <div className="border-t border-gray-200 pt-3">
                          <h4 className="font-semibold text-gray-800 mb-1">Quote:</h4>
                          <p className="text-gray-600 text-sm italic">
                          "{selectedMovie.stages[stage.id]?.quote}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    {selectedStage === stage.id ? 'Click to collapse' : 'Click for quote'}
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Section */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">✨ Writing Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Story Structure Lessons:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Every great story needs a relatable "ordinary world"</li>
                    <li>• The mentor figure provides wisdom and tools</li>
                    <li>• Multiple tests build character development</li>
                    <li>• The ordeal reveals true character</li>
                    <li>• Return with wisdom benefits others</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Why This Works:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Universal human experience of growth</li>
                    <li>• Clear emotional arc audiences connect with</li>
                    <li>• Satisfying resolution and transformation</li>
                    <li>• Balance of challenge and triumph</li>
                    <li>• Timeless wisdom in modern stories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Based on Joseph Campbell's "The Hero with a Thousand Faces" • Created for Become a Writer Today</p>
        </div>
      </div>
    </div>
  );
};

export default DisneyHeroJourneyExplorer; 