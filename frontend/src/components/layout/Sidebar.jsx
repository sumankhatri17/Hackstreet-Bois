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
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "📈", label: "My Progress", path: "/dashboard/progress" },
    { icon: "📚", label: "Resources", path: "/dashboard/resources" },
    { icon: "🎓", label: "Initial Assessment", path: "/assessment/initial" },
    { icon: "⚙️", label: "Admin Dashboard", path: "/admin/dashboard" },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white shadow-sm h-screen sticky top-0 border-r border-gray-200">
      <div className="p-4 lg:p-6">
        {/* User Profile Section */}
        <div className="mb-6 lg:mb-8 text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-200 rounded-full mx-auto mb-2 lg:mb-3 flex items-center justify-center">
            <span className="text-xl lg:text-2xl">👤</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">
            {user?.name || "Guest"}
          </h3>
          <p className="text-xs lg:text-sm text-gray-500 capitalize">
            {user?.role || "User"}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm lg:text-base"
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
