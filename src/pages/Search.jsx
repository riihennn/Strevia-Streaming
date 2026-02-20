import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMulti, getImageUrl } from '../utils/tmdb';

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'movie', 'tv'

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchMulti(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMovieClick = (item) => {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${item.id}`);
  };

  // Filter results
  const filteredResults = results.filter(item => {
    if (filter === 'all') return item.media_type === 'movie' || item.media_type === 'tv';
    return item.media_type === filter;
  });

  return (
    <div className="bg-black min-h-screen pt-20 px-4 md:px-8 lg:px-16 pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        
        {query && (
          <p className="text-gray-400 text-sm md:text-base">
            Found {filteredResults.length} results
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      {query && results.length > 0 && (
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-2 text-sm md:text-base font-semibold transition ${
              filter === 'all'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').length})
          </button>
          <button
            onClick={() => setFilter('movie')}
            className={`pb-3 px-2 text-sm md:text-base font-semibold transition ${
              filter === 'movie'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies ({results.filter(r => r.media_type === 'movie').length})
          </button>
          <button
            onClick={() => setFilter('tv')}
            className={`pb-3 px-2 text-sm md:text-base font-semibold transition ${
              filter === 'tv'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TV Shows ({results.filter(r => r.media_type === 'tv').length})
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-white text-xl">Searching...</div>
        </div>
      )}

      {/* No Query */}
      {!query && !loading && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">
            Search for movies and TV shows
          </p>
        </div>
      )}

      {/* No Results */}
      {query && !loading && filteredResults.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">
            No results found for "{query}"
          </p>
          <p className="text-gray-500 text-sm">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && filteredResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMovieClick(item)}
              className="cursor-pointer hover:scale-105 transition"
            >
              <img
                src={getImageUrl(item.poster_path)}
                alt={item.title || item.name}
                className="w-full h-auto rounded-lg mb-2"
              />
              <h3 className="text-white text-sm font-semibold truncate">
                {item.title || item.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span>⭐ {item.vote_average?.toFixed(1)}</span>
                <span className="capitalize">{item.media_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;