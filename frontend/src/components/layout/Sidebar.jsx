/**
 * Sidebar Component
 * Peer-to-Peer Learning Platform Navigation
 *
 * TODO:
 * 1. Highlight active menu item
 * 2. Add collapsible functionality
 * 3. Make it responsive (hide on mobile, show on toggle)
 */

import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Sidebar = () => {
  const { user } = useAuthStore();

  // Menu items for peer-to-peer learning platform
  const menuItems = [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "My Progress",
      path: "/dashboard/progress",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      label: "Resources",
      path: "/dashboard/resources",
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: "Assessment",
      path: "/assessment/initial",
    },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white h-screen sticky top-0 border-r border-gray-100">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h3 className="font-semibold text-gray-900 text-center text-base">
            {user?.name || "Guest"}
          </h3>
          <p className="text-sm text-gray-500 text-center mt-1">Student</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-medium group"
            >
              <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
