import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:3001/users';

function SignUp() {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check duplicate in db.json
      const checkRes = await fetch(`${API}?email=${encodeURIComponent(email.toLowerCase())}`);
      const existing = await checkRes.json();
      if (existing.length > 0) {
        setError('Email already registered. Please sign in.');
        return;
      }

      // 2. POST new user → db.json (json-server)
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(),
          password,
          createdAt: new Date().toISOString(),
        }),
      });
      const savedUser = await res.json();

      // 3. Save full user (with password) to strevia_users list in localStorage
      const localUsers = getLocalUsers();
      localUsers.push(savedUser);
      saveLocalUsers(localUsers);

      // 4. Save safe user (no password) to strevia_current_user
      const { password: _pw, ...safeUser } = savedUser;
      localStorage.setItem('strevia_current_user', JSON.stringify(safeUser));

      // 5. Notify Navbar to update immediately
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
      className="min-h-screen w-full flex items-center justify-center py-8"
      style={{ background: 'radial-gradient(ellipse at center, #1e1e2e 0%, #0d0d1b 100%)' }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="bg-black bg-opacity-85 rounded-lg p-6 md:p-8 shadow-2xl border border-gray-800">

          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-black text-red-700 tracking-wide">STREVIA</span>
          </Link>

          <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Create Account</h1>
          <p className="text-gray-400 text-xs mb-6">Sign up to start watching</p>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />
            <input
              type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />
            <input
              type="password" placeholder="Password (min. 6 characters)" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength="6"
              className="w-full px-4 py-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />
            <input
              type="password" placeholder="Confirm Password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6"
              className="w-full px-4 py-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-400 transition"
            />

            <button
              type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </>
              ) : 'Sign Up'}
            </button>

            <p className="text-xs text-gray-500 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-blue-500 hover:underline">Terms</Link>{' '}and{' '}
              <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-6 text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/signin" className="text-white hover:underline font-semibold">Sign in now</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;