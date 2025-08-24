import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  User
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'My Complaints', icon: FileText, badge: 2 },
    { id: 'lost-found', label: 'Lost & Found', icon: Search }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-pink-100/60 to-orange-100/60 backdrop-blur-sm border-r border-white/30 min-h-full sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-orange-300 rounded-xl flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Portal</h2>
            <p className="text-sm text-gray-600">User Dashboard</p>
          </div>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">👋</span>
            <p className="text-sm font-medium text-gray-700">Welcome</p>
          </div>
          <p className="text-lg font-semibold text-gray-800">John Doe</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-pink-300 to-orange-300 text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/30 hover:shadow-sm'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-white/30 mt-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-pink-300 to-orange-300 text-white shadow-md'
              : 'text-gray-700 hover:bg-white/30 hover:shadow-sm'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;