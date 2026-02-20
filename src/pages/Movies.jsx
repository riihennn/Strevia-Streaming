import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoviesOnly, getImageUrl } from '../utils/tmdb';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favs, setFavs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, [page]);

  useEffect(() => {
    updateFavorites();
    
    const handleFavChange = () => updateFavorites();
    window.addEventListener('favoritesChanged', handleFavChange);
    
    return () => window.removeEventListener('favoritesChanged', handleFavChange);
  }, []);

  const updateFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('strevia_favorites') || '[]');
    setFavs(favorites.map(f => f.id));
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMoviesOnly(page);
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 500));
      setLoading(false);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/detail/movie/${movie.id}`);
  };

  const toggleFavorite = (e, movie) => {
    e.stopPropagation();
    
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites({ ...movie, media_type: 'movie' });
    }
    
    updateFavorites();
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="text-white text-2xl">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-20 px-4 md:px-8 lg:px-16 pb-12">
      
      <div className="mb-8">
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">Movies</h1>
        <p className="text-gray-400 text-sm md:text-base">
          Browse popular movies
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => handleMovieClick(movie)}
            className="relative group cursor-pointer"
          >
            <button
              onClick={(e) => toggleFavorite(e, movie)}
              className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-black/90 p-2 rounded-full transition"
            >
              {favs.includes(movie.id) ? (
                <FaHeart className="text-red-600 text-sm" />
              ) : (
                <FaRegHeart className="text-white text-sm" />
              )}
            </button>

            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full h-auto rounded-lg hover:scale-105 transition"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23333" width="200" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="mt-2">
              <h3 className="text-white text-sm font-semibold truncate">
                {movie.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>
        <span className="text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Movies;