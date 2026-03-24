import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { getTrending, getPopular, getTopRated, getImageUrl, getTVDetails } from '../utils/tmdb';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import VideoPlayer from '../components/VideoPlayer';

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [heroTrailerKey, setHeroTrailerKey] = useState(null);
  const navigate = useNavigate();

  const HERO_MOVIE_ID = 66732;
  const HERO_MOVIE_TYPE = 'tv';

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingData, popularData, topRatedData] = await Promise.all([
          getTrending(),
          getPopular(),
          getTopRated()
        ]);
        
        setTrending(trendingData || []);
        setPopular(popularData || []);
        setTopRated(topRatedData || []);
        
        try {
          const heroDetails = await getTVDetails(HERO_MOVIE_ID);
          const videos = heroDetails?.videos?.results || [];
          const trailer = videos.find(v => 
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );
          if (trailer) {
            setHeroTrailerKey(trailer.key);
          }
        } catch (err) {
          console.error('Hero fetch error:', err);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handlePlayClick = () => {
    if (heroTrailerKey) {
      setShowVideo(true);
    } else {
      alert('No trailer available for this title');
    }
  };

  const handleMoreInfoClick = () => {
    navigate(`/detail/${HERO_MOVIE_TYPE}/${HERO_MOVIE_ID}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <div className="text-red-600 text-3xl font-bold mb-4">⚠️ Oops!</div>
        <div className="text-white text-xl mb-4">Failed to load movies</div>
        <div className="text-gray-400 text-sm mb-6">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trending.length && !popular.length && !topRated.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <div className="text-white text-2xl mb-4">No movies found</div>
        <div className="text-gray-400 mb-6">Check your connection</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="pt-0">
      {showVideo && heroTrailerKey && (
        <VideoPlayer 
          videoKey={heroTrailerKey}
          title="Stranger Things"
          onClose={() => setShowVideo(false)}
        />
      )}

      <div className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-black">
        <img 
          src="https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg"
          alt="Stranger Things"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://wallpapercave.com/wp/wp4056410.jpg';
          }}
        />
        
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

        <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-4xl z-10">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
            Stranger Things
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            <button 
              onClick={handlePlayClick}
              className="flex items-center justify-center gap-2 md:gap-3 bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-lg hover:bg-gray-300 transition font-bold text-base md:text-xl"
            >
              <FaPlay /> Play
            </button>
            <button 
              onClick={handleMoreInfoClick}
              className="flex items-center justify-center gap-2 md:gap-3 bg-gray-500 bg-opacity-70 text-white px-6 md:px-10 py-3 md:py-4 rounded-lg hover:bg-gray-600 transition font-bold text-base md:text-xl"
            >
              <FaInfoCircle /> More Info
            </button>
          </div>

          <p className="text-white text-sm md:text-lg lg:text-xl leading-relaxed max-w-2xl drop-shadow-lg">
            When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.
          </p>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-16 py-8 md:py-12 space-y-8 md:space-y-12">
        {trending.length > 0 && <MovieRow title="Trending Now" movies={trending} />}
        {popular.length > 0 && <MovieRow title="Popular on Strevia" movies={popular} />}
        {topRated.length > 0 && <MovieRow title="Top Rated" movies={topRated} />}
      </div>
    </div>
  );
}

function MovieRow({ title, movies }) {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    const updateFavs = () => {
      const favorites = JSON.parse(localStorage.getItem('strevia_favorites') || '[]');
      setFavs(favorites.map(f => f.id));
    };
    
    updateFavs();
    window.addEventListener('storage', updateFavs);
    window.addEventListener('favoritesChanged', updateFavs);
    
    return () => {
      window.removeEventListener('storage', updateFavs);
      window.removeEventListener('favoritesChanged', updateFavs);
    };
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMovieClick = (movie) => {
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${movie.id}`);
  };

  const toggleFavorite = (e, movie) => {
    e.stopPropagation();
    
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
    
    const favorites = JSON.parse(localStorage.getItem('strevia_favorites') || '[]');
    setFavs(favorites.map(f => f.id));
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">{title}</h2>
      
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 md:p-3 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <FaChevronLeft className="text-xl md:text-2xl" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-scroll scrollbar-hide pb-4 scroll-smooth"
        >
          {movies.map((movie) => (
            <div 
              key={movie.id}
              onClick={() => handleMovieClick(movie)}
              className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 rounded-lg hover:scale-105 transition cursor-pointer relative group/card"
            >
              <button
                onClick={(e) => toggleFavorite(e, movie)}
                className="absolute top-2 right-2 z-20 bg-black/70 hover:bg-black/90 p-2 rounded-full transition"
              >
                {favs.includes(movie.id) ? (
                  <FaHeart className="text-red-600 text-lg" />
                ) : (
                  <FaRegHeart className="text-white text-lg" />
                )}
              </button>

              <img 
                src={getImageUrl(movie.poster_path || movie.backdrop_path)}
                alt={movie.title || movie.name}
                className="w-full h-52 sm:h-56 md:h-60 lg:h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23333" width="200" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="mt-2">
                <h3 className="text-white text-sm font-semibold truncate">
                  {movie.title || movie.name}
                </h3>
                <p className="text-gray-400 text-xs">
                  ⭐ {movie.vote_average?.toFixed(1)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 md:p-3 rounded-l opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <FaChevronRight className="text-xl md:text-2xl" />
        </button>
      </div>
    </div>
  );
}

export default Home;