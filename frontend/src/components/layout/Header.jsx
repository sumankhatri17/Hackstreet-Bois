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

import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-bold text-blue-600">EduAdapt</h1>
          </div>
          
          {/* Navigation - TODO: Add based on role */}
          <nav className="hidden md:flex space-x-6">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </a>
            {/* Add more navigation items */}
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Hello, {user.name}</span>
                <button 
                  onClick={logout}
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <a href="/login" className="text-blue-600 hover:text-blue-700">
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;