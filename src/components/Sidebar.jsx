import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  User,
  Bell,
  ChevronDown
} from "lucide-react";
import { useComplaintUpdates } from "../hooks/useComplaintUpdates";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("name") || "User";
  const location = useLocation();

  const [liveUnread, setLiveUnread] = useState(() => {
    try {
      return Number(sessionStorage.getItem("liveUnread") || "0");
    } catch {
      return 0;
    }
  });

  useComplaintUpdates({
    onUpdated: () => {
      setLiveUnread((prev) => {
        const next = prev + 1;
        try { sessionStorage.setItem("liveUnread", String(next)); } catch { }
        return next;
      });
    },
    onCreated: () => {
      if (role === "admin") {
        setLiveUnread((prev) => {
          const next = prev + 1;
          try { sessionStorage.setItem("liveUnread", String(next)); } catch { }
          return next;
        });
      }
    },
  });

  useEffect(() => {
    if (location.pathname === "/notifications") {
      setLiveUnread(0);
      try { sessionStorage.removeItem("liveUnread"); } catch { }
    }
  }, [location.pathname]);

  const menuItems =
    role === "user"
      ? [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
          { id: "complaints", label: "My Complaints", icon: FileText, path: "/complaints" },
          { id: "lost-found", label: "Lost & Found", icon: Search, path: "/lost-found" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications", liveBadge: true },
        ]
      : [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
          { id: "all-complaint", label: "All Complaints", icon: FileText, path: "/all-complaints", liveBadge: true },
          { id: "lost-found", label: "Lost & Found", icon: Search, path: "/admin/lost-found" },
          { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
        ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 min-h-full sticky top-0 z-40 flex flex-col">
      {/* ─── Logo ─── */}
      <div className="px-6 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 font-['Inter'] tracking-tight">
              ComplaintUs
            </h2>
            <p className="text-[11px] text-gray-400 font-['Inter']">
              {role === "user" ? "Student Portal" : "Admin Portal"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-4 py-5">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.id === "dashboard";
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={isDashboard}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 font-['Inter'] group ${
                    isActive
                      ? "bg-orange-50 text-orange-600 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {item.liveBadge && liveUnread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow ring-2 ring-white animate-pulse">
                          {liveUnread > 9 ? "9+" : liveUnread}
                        </span>
                      )}
                    </div>
                    <span className="text-[13px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Settings — separated */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <NavLink
            to="/settings"
            end
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 font-['Inter'] group ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className={`w-[18px] h-[18px] ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="text-[13px]">Settings</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* ─── User Profile ─── */}
      <div className="px-4 py-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 font-['Inter'] truncate">{userName}</p>
            <p className="text-[11px] text-gray-400 font-['Inter']">{role === "admin" ? "Administrator" : "Student"}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
