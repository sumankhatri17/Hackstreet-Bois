/**
 * Sidebar Component
 * 
 * TODO:
 * 1. Add navigation items based on user role (student/teacher/admin)
 * 2. Highlight active menu item
 * 3. Add collapsible functionality
 * 4. Make it responsive (hide on mobile, show on toggle)
 */

import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  
  // TODO: Define menu items based on user role
  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📚', label: 'Assessments', path: '/assessments' },
    { icon: '📈', label: 'Progress', path: '/progress' },
    { icon: '⚙️', label: 'Settings', path: '/settings' }
  ];
  
  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="font-semibold text-gray-800">{user?.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;