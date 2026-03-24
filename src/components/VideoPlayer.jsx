import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

function VideoPlayer({ videoKey, onClose, title }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!videoKey) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition text-3xl z-10"
        >
          <FaTimes />
        </button>

        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={title || "Video Player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Video not playing? 
            <a 
              href={`https://www.youtube.com/watch?v=${videoKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-2"
            >
              Watch on YouTube
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;