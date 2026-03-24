import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 text-gray-400 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Social Media Icons */}
        <div className="flex gap-6 mb-8">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FaFacebookF className="text-2xl" />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FaInstagram className="text-2xl" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FaTwitter className="text-2xl" />
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FaYoutube className="text-2xl" />
          </a>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1 */}
          <div>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:underline text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:underline text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" className="hover:underline text-sm">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link to="/new" className="hover:underline text-sm">
                  New & Popular
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <ul className="space-y-3">
              <li>
                <Link to="/mylist" className="hover:underline text-sm">
                  My List
                </Link>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Account
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:underline text-sm">
                  Media Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Cookie Preferences
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:underline text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Speed Test
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Legal Notices
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline text-sm">
                  Corporate Info
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Service Code Button */}
        <div className="mb-8">
          <button className="border border-gray-600 text-gray-400 px-4 py-2 text-sm hover:border-white hover:text-white transition">
            Service Code
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-500">
          © 2025 Strevia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;