import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  User,
  Bell
} from "lucide-react";
import { useComplaintUpdates } from "../hooks/useComplaintUpdates";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const location = useLocation();

  // ── Live unread badge ─────────────────────────────────────────────────────
  const [liveUnread, setLiveUnread] = useState(() => {
    try {
      return Number(sessionStorage.getItem("liveUnread") || "0");
    } catch {
      return 0;
    }
  });

  // Increment badge on every incoming complaint update
  useComplaintUpdates({
    onUpdated: () => {
      setLiveUnread((prev) => {
        const next = prev + 1;
        try { sessionStorage.setItem("liveUnread", String(next)); } catch { }
        return next;
      });
    },
    onCreated: () => {
      // Admins: new complaint badge
      if (role === "admin") {
        setLiveUnread((prev) => {
          const next = prev + 1;
          try { sessionStorage.setItem("liveUnread", String(next)); } catch { }
          return next;
        });
      }
    },
  });

  // Clear badge when user visits /notifications
  useEffect(() => {
    if (location.pathname === "/notifications") {
      setLiveUnread(0);
      try { sessionStorage.removeItem("liveUnread"); } catch { }
    }
  }, [location.pathname]);

  const menuItems =
    role === "user"
      ? [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
          },
          {
            id: "complaints",
            label: "My Complaints",
            icon: FileText,
            path: "/complaints",
          },
          {
            id: "lost-found",
            label: "Lost & Found",
            icon: Search,
            path: "/lost-found",
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
            liveBadge: true,
          },
        ]
      : [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin",
          },
          {
            id: "all-complaint",
            label: "All Complaints",
            icon: FileText,
            path: "/all-complaints",
            liveBadge: true,
          },
          {
            id: "lost-found",
            label: "Lost & Found",
            icon: Search,
            path: "/admin/lost-found",
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
          },
        ];

  return (
    <div className="w-72 bg-gradient-to-b from-emerald-50/80 to-green-50/80 backdrop-blur-sm border-r border-white/40 min-h-full sticky top-0 shadow-lg shadow-green-100/20 z-40">
      {/* Logo and portal type header */}
      <div className="p-6 border-b border-white/40">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">
              ComplaintUs
            </h2>
            <p className="text-sm text-emerald-600">
              {localStorage.getItem("role") === "user"
                ? "Student Portal"
                : "Admin Portal"}
            </p>
          </div>
        </div>
      </div>

      {/* Main navigation menu */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.id === "dashboard";
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={isDashboard}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg"
                      : "text-emerald-700 hover:bg-white/60 hover:shadow-md hover:text-emerald-800"
                  }`
                }
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {/* Live pulsing badge */}
                  {item.liveBadge && liveUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md ring-2 ring-white animate-pulse">
                      {liveUnread > 9 ? "9+" : liveUnread}
                    </span>
                  )}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Settings navigation at bottom */}
      <div className="p-4 border-t border-emerald-100/30 mt-auto">
        <NavLink
          to="/settings"
          end
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

