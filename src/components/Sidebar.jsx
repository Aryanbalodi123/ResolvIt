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
    <div className="w-72 bg-white/80 backdrop-blur-lg shadow-2xl border-r border-gray-200/50 min-h-screen sticky top-0">
      {/* Header */}
      <div className="p-8 border-b border-gray-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 font-['Poppins']">Portal</h2>
            <p className="text-sm text-gray-500 font-['Inter']">User Dashboard</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 font-['Inter']">👋 Welcome</p>
          <p className="text-lg font-semibold text-gray-900 font-['Poppins']">John Doe</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-8">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 font-['Inter'] ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="p-6 border-t border-gray-200/50">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 font-['Inter'] ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;