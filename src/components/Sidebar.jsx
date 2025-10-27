import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  User,
} from "lucide-react";

const Sidebar = () => {
const role = localStorage.getItem("role");

const menuItems = role === "user"
  ? [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { id: "complaints", label: "My Complaints", icon: FileText, badge: 2, path: "/complaints" },
      { id: "lost-found", label: "Lost & Found", icon: Search, path: "/lost-found" },
    ]
  : [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { id: "all-complaint", label: "All Complaints", icon: FileText, badge: 2, path: "/all-complaints" },
      { id: "lost-found", label: "Lost & Found", icon: Search, path: "/lost-found" },
    ];
  return (
    <div className="w-72 bg-gradient-to-b from-emerald-50/80 to-green-50/80 backdrop-blur-sm border-r border-white/40 min-h-full sticky top-0 shadow-lg shadow-green-100/20 z-40">
      {/* Header */}
      <div className="p-6 border-b border-white/40">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Portal</h2>
            <p className="text-sm text-emerald-600">User Dashboard</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">👋</span>
            <p className="text-sm font-medium text-emerald-700">Welcome</p>
          </div>
          <p className="text-lg font-semibold text-emerald-900">John Doe</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
                      : "text-emerald-700 hover:bg-white/60 hover:shadow-md hover:text-emerald-800"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-md">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-emerald-100/30 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
                : "text-emerald-700 hover:bg-white/60 hover:shadow-md hover:text-emerald-800"
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
