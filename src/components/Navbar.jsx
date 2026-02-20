import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { searchMulti, getImageUrl } from '../utils/tmdb'; // adjust path if needed

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // ── Load user from localStorage ────────────────────────────────────
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('strevia_current_user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    load();
    window.addEventListener('strevia_auth_change', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('strevia_auth_change', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  // ── Scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Debounced search suggestions ─────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchMulti(searchQuery.trim());
        const filtered = data
          .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 6); // show max 6 suggestions
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggestion fetch error:', err);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (item) => {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${item.id}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('strevia_current_user');
    window.dispatchEvent(new Event('strevia_auth_change'));
    setUser(null);
    setDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/tv-shows', label: 'TV Shows' },
    { to: '/movies', label: 'Movies' },
    { to: '/new', label: 'New & Popular' },
    { to: '/mylist', label: 'My List' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="text-red-600 font-extrabold text-2xl tracking-widest shrink-0">
            STREVIA
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-gray-300 hover:text-white text-sm font-medium transition"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Search with suggestions */}
            <div ref={searchRef} className="relative hidden sm:block">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search..."
                  className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-gray-700 w-48 lg:w-56 transition"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaSearch size={14} />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onMouseDown={() => handleSuggestionClick(item)} // mousedown fires before blur
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-800 transition text-left"
                    >
                      {/* Poster thumbnail */}
                      <img
                        src={
                          item.poster_path
                            ? getImageUrl(item.poster_path, 'w92')
                            : 'https://via.placeholder.com/40x56?text=?'
                        }
                        alt={item.title || item.name}
                        className="w-8 h-11 object-cover rounded shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {item.title || item.name}
                        </p>
                        <p className="text-gray-400 text-xs capitalize">
                          {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                          {(item.release_date || item.first_air_date) &&
                            ` • ${(item.release_date || item.first_air_date).slice(0, 4)}`}
                        </p>
                      </div>
                      {item.vote_average > 0 && (
                        <span className="text-yellow-400 text-xs shrink-0">
                          ⭐ {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* "See all results" footer */}
                  <button
                    onMouseDown={handleSearchSubmit}
                    className="w-full px-3 py-2 text-center text-red-400 hover:text-red-300 text-sm font-medium hover:bg-gray-800 transition border-t border-gray-700"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {/* ── LOGGED IN: avatar + dropdown ── */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 group focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <FaChevronDown
                    className={`text-white text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm"
                    >
                      <FaUser size={12} /> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm"
                    >
                      <FaCog size={12} /> Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 transition text-sm border-t border-gray-700"
                    >
                      <FaSignOutAlt size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-white text-xl sm:text-2xl p-2"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-black/95 border-t border-gray-800 px-4 py-4 space-y-4">
          {user && (
            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV shows..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition"
            >
              <FaSearch />
            </button>
          </form>

          {/* Mobile suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-800 transition text-left"
                >
                  <img
                    src={
                      item.poster_path
                        ? getImageUrl(item.poster_path, 'w92')
                        : 'https://via.placeholder.com/40x56?text=?'
                    }
                    alt={item.title || item.name}
                    className="w-8 h-11 object-cover rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title || item.name}</p>
                    <p className="text-gray-400 text-xs capitalize">
                      {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                      {(item.release_date || item.first_air_date) &&
                        ` • ${(item.release_date || item.first_air_date).slice(0, 4)}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Nav links */}
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block text-gray-300 hover:text-white py-2 text-base font-medium transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Mobile auth */}
          {user ? (
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 py-2 text-gray-300 hover:text-white transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser size={14} /> Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 py-2 text-gray-300 hover:text-white transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaCog size={14} /> Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 py-2 text-red-400 hover:text-red-300 transition w-full"
              >
                <FaSignOutAlt size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="block text-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md font-semibold transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;