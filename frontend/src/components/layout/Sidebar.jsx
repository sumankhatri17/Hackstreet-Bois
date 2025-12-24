/**
 * Sidebar Component
 *
 * TODO:
 * 1. Add navigation items based on user role (student/teacher/admin)
 * 2. Highlight active menu item
 * 3. Add collapsible functionality
 * 4. Make it responsive (hide on mobile, show on toggle)
 */

import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { user } = useAuthStore();

  // Testing menu - access all routes
  const menuItems = [
    { icon: "📊", label: "Student Dashboard", path: "/student/dashboard" },
    { icon: "📈", label: "Student Progress", path: "/student/progress" },
    { icon: "📚", label: "Student Resources", path: "/student/resources" },
    { icon: "👨‍🏫", label: "Teacher Dashboard", path: "/teacher/dashboard" },
    { icon: "⚙️", label: "Admin Dashboard", path: "/admin/dashboard" },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl h-screen sticky top-0 border-r border-gray-200">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="font-bold text-gray-800 text-lg">
            {user?.name || "Guest"}
          </h3>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {user?.role || "Explorer"}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="group flex items-center space-x-3 px-5 py-4 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 hover:shadow-md hover:translate-x-1"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
