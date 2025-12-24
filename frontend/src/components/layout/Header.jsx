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

import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
              🎓
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </h1>
          </Link>

          {/* Navigation - Testing: All routes accessible */}
          <nav className="hidden md:flex space-x-2">
            <Link
              to="/student/dashboard"
              className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 font-medium transition-all duration-300 hover:shadow-md"
            >
              Student
            </Link>
            <Link
              to="/teacher/dashboard"
              className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 font-medium transition-all duration-300 hover:shadow-md"
            >
              Teacher
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 font-medium transition-all duration-300 hover:shadow-md"
            >
              Admin
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">
                  Hello, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
