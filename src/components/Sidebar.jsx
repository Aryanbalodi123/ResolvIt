import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useComplaintUpdates } from "../hooks/useComplaintUpdates";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div 
      className={`relative z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isExpanded ? "w-64" : "w-[72px]"
      } flex flex-col flex-shrink-0 h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)] my-6 ml-6 lg:my-10 lg:ml-10`}
    >
      <div className="bg-white/80 backdrop-blur-xl h-full w-full rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col relative py-8 overflow-hidden">
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 shadow-sm rounded-l-xl flex items-center justify-center hover:bg-gray-50 z-50 transition-colors"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Logo */}
        <div className="px-4 mb-8 flex items-center justify-center min-h-[40px]">
          <div className="w-10 h-10 bg-[#065F46] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            <h2 className="text-[16px] font-bold text-gray-900 font-['Inter'] tracking-tight">
              ComplaintUs
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.id === "dashboard";
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={isDashboard}
                className={({ isActive }) =>
                  `flex items-center rounded-full transition-all duration-200 font-['Inter'] group relative ${
                    isExpanded ? "px-4 py-3 w-full" : "justify-center w-12 h-12 mx-auto"
                  } ${
                    isActive
                      ? "bg-[#065F46] text-white shadow-md shadow-[#065F46]/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <Icon className={`w-[20px] h-[20px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
                      {item.liveBadge && liveUnread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow ring-2 ring-white animate-pulse">
                          {liveUnread > 9 ? "9+" : liveUnread}
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 overflow-hidden ml-0'}`}>
                      {item.label}
                    </span>

                    {/* Tooltip for collapsed state */}
                    {!isExpanded && (
                      <div className="absolute left-14 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

      </div>
    </div>
  );
};

export default Sidebar;
