import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';
import {
  getTrending,
  getPopular,
  getTopRated,
  getImageUrl,
  getTVDetails
} from '../utils/tmdb';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite
} from '../utils/favorites';
import VideoPlayer from '../components/VideoPlayer';

function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [heroTrailerKey, setHeroTrailerKey] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingData, popularData, topRatedData] =
          await Promise.all([
            getTrending(),
            getPopular(),
            getTopRated()
          ]);

        setTrending(trendingData || []);
        setPopular(popularData || []);
        setTopRated(topRatedData || []);

        /* ===========================
           🔥 DYNAMIC BANNER LOGIC
        ============================ */

        const staticBanners = [
          {
            id: 66732,
            media_type: 'tv',
            title: 'Stranger Things',
            backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
            overview:
              'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.'
          },
          {
            id: 71446,
            media_type: 'tv',
            title: 'Money Heist',
            backdrop_path: '/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg',
            overview:
              'A mysterious man known as The Professor recruits a group of robbers to carry out the biggest heist in history.'
          }
        ];

        const combined = [
          ...(trendingData || []),
          ...(popularData || []),
          ...staticBanners
        ];

        const randomBanner =
          combined[Math.floor(Math.random() * combined.length)];

        setHeroData(randomBanner);

        if (randomBanner?.id) {
          try {
            const type =
              randomBanner.media_type === 'tv' ? 'tv' : 'movie';

            const details =
              type === 'tv'
                ? await getTVDetails(randomBanner.id)
                : null;

            const trailer = details?.videos?.results?.find(
              v =>
                v.site === 'YouTube' &&
                (v.type === 'Trailer' ||
                  v.type === 'Teaser')
            );

            if (trailer) {
              setHeroTrailerKey(trailer.key);
            }
          } catch (err) {
            console.error(err);
          }
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
    }
  };

  const handleMoreInfoClick = () => {
    if (!heroData) return;
    const type =
      heroData.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${heroData.id}`);
  };

  if (loading) {
    return (
<div className="min-h-screen flex items-center justify-center bg-black">
  <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Error loading movies
      </div>
    );
  }

  return (
    <div>

      {showVideo && heroTrailerKey && (
        <VideoPlayer
          videoKey={heroTrailerKey}
          title={heroData?.title || heroData?.name}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* ===========================
           HERO SECTION
      ============================ */}
      {heroData && (
        <div className="relative h-[70vh] md:h-screen w-full overflow-hidden bg-black">

          <img
            src={getImageUrl(
              heroData.backdrop_path,
              'original'
            )}
            alt={heroData.title || heroData.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-4xl z-10">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
              {heroData.title || heroData.name}
            </h1>

            <div className="flex gap-4 mb-6">
              <button
                onClick={handlePlayClick}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold"
              >
                <FaPlay /> Play
              </button>

              <button
                onClick={handleMoreInfoClick}
                className="flex items-center gap-2 bg-gray-500 bg-opacity-70 text-white px-6 py-3 rounded-lg font-bold"
              >
                <FaInfoCircle /> More Info
              </button>
            </div>

            <p className="text-white max-w-2xl">
              {heroData.overview}
            </p>
          </div>
        </div>
      )}

      {/* ===========================
           MOVIE ROWS
      ============================ */}
      <div className="px-6 md:px-12 py-12 space-y-12 bg-black">
        {trending.length > 0 && (
          <MovieRow
            title="Trending Now"
            movies={trending}
          />
        )}
        {popular.length > 0 && (
          <MovieRow
            title="Popular"
            movies={popular}
          />
        )}
        {topRated.length > 0 && (
          <MovieRow
            title="Top Rated"
            movies={topRated}
          />
        )}
      </div>
    </div>
  );
}

/* ===========================
   MOVIE ROW COMPONENT
=========================== */
function MovieRow({ title, movies }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    const favorites = JSON.parse(
      localStorage.getItem('strevia_favorites') ||
        '[]'
    );
    setFavs(favorites.map(f => f.id));
  }, []);

  const toggleFavorite = (e, movie) => {
    e.stopPropagation();

    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }

    const favorites = JSON.parse(
      localStorage.getItem('strevia_favorites') ||
        '[]'
    );
    setFavs(favorites.map(f => f.id));
  };

  const scroll = dir => {
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative group">
      <h2 className="text-white text-2xl font-bold mb-6">
        {title}
      </h2>

      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-3 opacity-0 group-hover:opacity-100 transition"
      >
        <FaChevronLeft />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-scroll scrollbar-hide"
      >
        {movies.map(movie => (
          <div
            key={movie.id}
            onClick={() =>
              navigate(
                `/detail/${movie.media_type || 'movie'}/${movie.id}`
              )
            }
            className="relative w-44 flex-shrink-0 cursor-pointer hover:scale-105 transition"
          >
            <button
              onClick={e =>
                toggleFavorite(e, movie)
              }
              className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
            >
              {favs.includes(movie.id) ? (
                <FaHeart className="text-red-600" />
              ) : (
                <FaRegHeart className="text-white" />
              )}
            </button>

            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title || movie.name}
              className="w-full h-64 object-cover rounded"
            />
            <div className="mt-2">
              <h3 className="text-white text-sm font-semibold truncate">
                {movie.title || movie.name}
              </h3>

              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <FaStar className="text-yellow-500" />
                {movie.vote_average?.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-3 opacity-0 group-hover:opacity-100 transition"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}

export default Home;