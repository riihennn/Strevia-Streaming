import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Navbar() {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [user, setUser]                   = useState(null);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // ── Load user from localStorage ──────────────────────────────────
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('strevia_current_user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch { setUser(null); }
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
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
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
    { to: '/',         label: 'Home' },
    { to: '/tv-shows', label: 'TV Shows' },
    { to: '/movies',   label: 'Movies' },
    { to: '/new',      label: 'New & Popular' },
    { to: '/mylist',   label: 'My List' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black via-black/50 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 md:py-5 max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link to="/" className="hover:opacity-80 transition flex-shrink-0">
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-red-700 tracking-wide">STREVIA</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden xl:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="text-white hover:text-gray-300 transition font-semibold text-sm lg:text-base whitespace-nowrap">
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-gray-700 w-48 lg:w-56 transition"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* ── LOGGED IN: avatar + dropdown ── */}
          {user ? (
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 group focus:outline-none"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center ring-2 ring-transparent group-hover:ring-red-500 transition overflow-hidden">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                  }
                </div>
                <FaChevronDown className={`text-white text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                  style={{ animation: 'fadeDown .15s ease-out' }}>
                  {/* User info header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                    <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 py-1">
                    <button onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-gray-800 hover:text-red-300 transition text-sm">
                      <FaSignOutAlt className="w-4 flex-shrink-0" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── LOGGED OUT: Sign In button ── */
            <Link to="/signin"
              className="hidden lg:block bg-red-600 hover:bg-red-700 text-white px-4 lg:px-6 py-2 rounded font-semibold transition text-xs lg:text-sm whitespace-nowrap">
              Sign In
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden text-white text-xl sm:text-2xl p-2">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-black bg-opacity-98 absolute top-full left-0 right-0 py-4 sm:py-6 px-4 sm:px-6 space-y-2 sm:space-y-4 shadow-2xl border-t border-gray-800">

          {/* Logged-in user banner */}
          {user && (
            <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3 mb-2 border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
                }
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mb-2">
            <div className="flex gap-2">
              <input type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md transition font-semibold">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Nav links */}
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className="block text-white hover:text-red-600 hover:bg-gray-900 transition font-semibold text-base sm:text-lg py-2 sm:py-3 px-3 rounded"
              onClick={() => setIsMobileMenuOpen(false)}>
              {label}
            </Link>
          ))}

          {/* Mobile auth section */}
          {user ? (
            <div className="border-t border-gray-800 pt-3 mt-2 space-y-1">
              <Link to="/profile"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-900 transition font-semibold text-base py-2 px-3 rounded"
                onClick={() => setIsMobileMenuOpen(false)}>
                <FaUser className="text-gray-500" /> Profile
              </Link>
              <Link to="/settings"
                className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-900 transition font-semibold text-base py-2 px-3 rounded"
                onClick={() => setIsMobileMenuOpen(false)}>
                <FaCog className="text-gray-500" /> Settings
              </Link>
              <button onClick={handleSignOut}
                className="flex items-center gap-3 w-full text-left text-red-400 hover:text-red-300 hover:bg-gray-900 transition font-semibold text-base py-2 px-3 rounded">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          ) : (
            <Link to="/signin"
              className="block bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-bold text-center text-base sm:text-lg mt-3 sm:mt-4"
              onClick={() => setIsMobileMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;