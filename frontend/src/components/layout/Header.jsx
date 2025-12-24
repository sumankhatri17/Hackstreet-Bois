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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl">🎓</span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              EduAssess
            </h1>
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
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 text-sm">
                  Hello, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
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
            <Link
              to="/admin/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Teacher
            </Link>
            <Link
              to="/admin/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
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
