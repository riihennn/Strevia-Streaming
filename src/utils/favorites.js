// Get all favorites from localStorage
export const getFavorites = () => {
  const favorites = localStorage.getItem('strevia_favorites');
  return favorites ? JSON.parse(favorites) : [];
};

// Add a movie to favorites
export const addToFavorites = (movie) => {
  const favorites = getFavorites();
  
  // Check if already exists
  const exists = favorites.find(fav => fav.id === movie.id);
  if (exists) return favorites;
  
  // Add movie with additional info
  const favoriteMovie = {
    id: movie.id,
    title: movie.title || movie.name,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    media_type: movie.media_type || 'movie',
    addedAt: new Date().toISOString()
  };
  
  favorites.push(favoriteMovie);
  localStorage.setItem('strevia_favorites', JSON.stringify(favorites));
  return favorites;
};

// Remove from favorites
export const removeFromFavorites = (movieId) => {
  const favorites = getFavorites();
  const updated = favorites.filter(fav => fav.id !== movieId);
  localStorage.setItem('strevia_favorites', JSON.stringify(updated));
  return updated;
};

// Check if movie is in favorites
export const isFavorite = (movieId) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === movieId);
};