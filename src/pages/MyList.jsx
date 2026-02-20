import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { getFavorites, removeFromFavorites } from '../utils/favorites';
import { getImageUrl } from '../utils/tmdb';

function MyList() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
    
    const handleFavChange = () => loadFavorites();
    window.addEventListener('favoritesChanged', handleFavChange);
    
    return () => window.removeEventListener('favoritesChanged', handleFavChange);
  }, []);

  const loadFavorites = () => {
    const favs = getFavorites();
    setFavorites(favs);
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeFromFavorites(id);
    loadFavorites();
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  const handleMovieClick = (movie) => {
    const type = movie.media_type || 'movie';
    navigate(`/detail/${type}/${movie.id}`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black pt-20">
        <FaHeart className="text-gray-600 text-6xl mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">Your list is empty</h2>
        <p className="text-gray-400 mb-6">Add movies and shows to your list</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold"
        >
          Browse Content
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-20 px-4 md:px-8 lg:px-16 pb-12">
      <div className="mb-8">
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">My List</h1>
        <p className="text-gray-400 text-sm md:text-base">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} in your list
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {favorites.map((movie) => (
          <div
            key={movie.id}
            onClick={() => handleMovieClick(movie)}
            className="relative group cursor-pointer"
          >
            <button
              onClick={(e) => handleRemove(e, movie.id)}
              className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-red-600 p-2 rounded-full transition"
            >
              <FaTrash className="text-white text-sm" />
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
              <p className="text-gray-400 text-xs">
                ⭐ {movie.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyList;