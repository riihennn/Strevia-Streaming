import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:3001/users';

function SignIn() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  // ── helpers ──────────────────────────────────────────────────────
  const getLocalUsers = () => {
    try { return JSON.parse(localStorage.getItem('strevia_users')) || []; }
    catch { return []; }
  };

  const saveLocalUsers = (users) =>
    localStorage.setItem('strevia_users', JSON.stringify(users));

  // ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Fetch user by email from db.json
      const res   = await fetch(`${API}?email=${encodeURIComponent(email.toLowerCase())}`);
      const users = await res.json();
      const user  = users.find((u) => u.password === password);

      if (!user) {
        setError('Invalid email or password.');
        return;
      }

      // 2. Sync this user into strevia_users localStorage list
      //    (add if not present, update if already there)
      const localUsers  = getLocalUsers();
      const existsIndex = localUsers.findIndex((u) => u.id === user.id);
      if (existsIndex >= 0) {
        localUsers[existsIndex] = user;          // update
      } else {
        localUsers.push(user);                   // add
      }
      saveLocalUsers(localUsers);

      // 3. Save safe user (no password) to strevia_current_user
      const { password: _pw, ...safeUser } = user;
      localStorage.setItem('strevia_current_user', JSON.stringify(safeUser));

      // 4. Notify Navbar to update immediately
      window.dispatchEvent(new Event('strevia_auth_change'));

      navigate('/');
    } catch {
      setError('Cannot reach db.json. Run:  npx json-server db.json --port 3001');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="bg-black bg-opacity-80 rounded-lg p-8 md:p-12 shadow-2xl backdrop-blur-sm">

          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-black text-red-700 tracking-wide">STREVIA</span>
          </Link>

          <h1 className="text-white text-3xl md:text-4xl font-bold mb-8">Sign In</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="w-full px-5 py-4 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />
            <input
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password"
              className="w-full px-5 py-4 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />

            <button
              type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold py-4 rounded transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center cursor-pointer hover:text-gray-300 transition">
                <input
                  type="checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 cursor-pointer accent-red-600"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="hover:underline hover:text-gray-300 transition">
                Need help?
              </Link>
            </div>
          </form>

          <div className="mt-8 text-gray-400 text-base">
            New to Strevia?{' '}
            <Link to="/signup" className="text-white hover:underline font-semibold">Sign up now</Link>.
          </div>

          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <Link to="/learn-more" className="text-blue-500 hover:underline">Learn more</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;