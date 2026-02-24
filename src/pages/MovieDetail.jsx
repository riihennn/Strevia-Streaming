import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVDetails, getImageUrl } from '../utils/tmdb';
import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';
import { FaPlay, FaPlus, FaStar, FaClock, FaHeart, FaRegHeart } from 'react-icons/fa';
import VideoPlayer from '../components/VideoPlayer';

function MovieDetail() {
  const { id, type } = useParams();
  const navigate = useNavigate();

  // ✅ SCROLL TO TOP FIX
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = type === 'tv' 
          ? await getTVDetails(id) 
          : await getMovieDetails(id);
        setDetails(data);
        setIsFav(isFavorite(parseInt(id)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  const handlePlayClick = () => {
    const videos = details?.videos?.results?.filter(
      v => v.site === 'YouTube' && 
          (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')
    ) || [];

    if (videos.length > 0) {
      const officialTrailer = videos.find(v => 
        v.name.toLowerCase().includes('official trailer')
      );
      
      const trailer = officialTrailer || videos[0];
      setSelectedTrailer(trailer.key);
      setShowVideo(true);
    } else {
      alert('No videos available for this title');
    }
  };

  const toggleFavorite = () => {
    const movieData = {
      id: details.id,
      title: details.title || details.name,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      vote_average: details.vote_average,
      media_type: type
    };

    if (isFav) {
      removeFromFavorites(details.id);
      setIsFav(false);
    } else {
      addToFavorites(movieData);
      setIsFav(true);
    }

    window.dispatchEvent(new Event('favoritesChanged'));
  };

  if (loading) {
    return (
<div className="min-h-screen flex items-center justify-center bg-black">
  <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
</div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="text-white text-2xl">Movie not found</div>
      </div>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;

  return (
    <div className="bg-black min-h-screen pt-16">

      {showVideo && selectedTrailer && (
        <VideoPlayer 
          videoKey={selectedTrailer}
          title={title}
          onClose={() => {
            setShowVideo(false);
            setSelectedTrailer(null);
          }}
        />
      )}

      <div 
        className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full"
        style={{
          backgroundImage: `url(${getImageUrl(details.backdrop_path, 'original')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

        <div className="relative h-full flex flex-col justify-end pb-8 md:pb-12 px-4 md:px-8 lg:px-12 max-w-4xl">
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-2xl">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-white text-sm md:text-base mb-3 md:mb-4">
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-500" />
              {details.vote_average?.toFixed(1)}
            </span>
            <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
            {details.runtime && (
              <span className="flex items-center gap-1">
                <FaClock />
                {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {details.genres?.slice(0, 4).map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-gray-800 bg-opacity-70 text-white text-xs md:text-sm rounded"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handlePlayClick}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-200 transition font-bold text-sm md:text-base"
            >
              <FaPlay /> Play Trailer
            </button>
            <button 
              onClick={toggleFavorite}
              className="flex items-center justify-center gap-2 bg-gray-600 bg-opacity-70 text-white px-6 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-500 transition font-bold text-sm md:text-base"
            >
              {isFav ? <FaHeart className="text-red-600" /> : <FaRegHeart />}
              {isFav ? 'Remove from List' : 'Add to My List'}
            </button>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="px-4 md:px-8 lg:px-12 py-6 md:py-10">
        
        <div className="mb-8 md:mb-12">
          <h2 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">Overview</h2>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed max-w-4xl">
            {details.overview || 'No overview available.'}
          </p>
        </div>

        {details.credits?.cast && details.credits.cast.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">Cast</h2>
            <div className="flex gap-3 md:gap-4 overflow-x-scroll scrollbar-hide pb-4">
              {details.credits.cast.slice(0, 10).map((person) => (
                <div key={person.id} className="flex-shrink-0 w-28 md:w-32">
                  <img
                    src={getImageUrl(person.profile_path, 'w185')}
                    alt={person.name}
                    className="w-full h-40 md:h-44 object-cover rounded-lg mb-2"
                  />
                  <p className="text-white text-xs md:text-sm font-semibold truncate">
                    {person.name}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.similar?.results && details.similar.results.length > 0 && (
          <div>
            <h2 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {details.similar.results.slice(0, 12).map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    navigate(`/detail/${type}/${movie.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="cursor-pointer hover:scale-105 transition"
                >
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <p className="text-white text-xs md:text-sm truncate">
                    {movie.title || movie.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;