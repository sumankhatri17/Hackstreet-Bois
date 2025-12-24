/**
 * Header Component
 *
 * TODO:
 * 1. Add user profile dropdown
 * 2. Add notifications icon
 * 3. Add navigation links based on user role
 * 4. Implement logout functionality
 * 5. Make responsive with mobile menu
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Header = () => {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">EduAssess</h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium text-sm"
            >
              Dashboard
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
