import React, { useState, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "User", role: "" });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Available global pages to search
  const searchablePages = [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "My Complaints", path: "/complaints", icon: Search },
    { title: "Lost & Found", path: "/lost-found", icon: Search },
    { title: "Notifications", path: "/notifications", icon: Bell },
    { title: "Settings", path: "/settings", icon: Settings },
  ];

  useEffect(() => {
    const name = localStorage.getItem("name") || "User";
    const role = localStorage.getItem("role") || "student";
    setUser({ name, role });
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const lowerQ = searchQuery.toLowerCase();
    const matches = searchablePages.filter(p => p.title.toLowerCase().includes(lowerQ));
    setSuggestions(matches);
  }, [searchQuery]);

  // Handle keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("complaints")) return "Complaints";
    if (path.includes("lost-found")) return "Lost & Found";
    if (path.includes("settings")) return "Settings";
    if (path.includes("notifications")) return "Notifications";
    return "Home";
  };

  return (
    <div className="w-full pt-6 lg:pt-10 pb-4 px-6 lg:px-10 z-30 sticky top-0 bg-[#F5F5F5]/80 backdrop-blur-md">
      <div className="w-full flex items-center justify-between">
        {/* Left Side: Page Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100 flex items-center">
            <LayoutDashboard className="w-4 h-4 text-[#065F46] mr-2" />
            <span className="font-semibold text-gray-800 font-['Inter'] text-sm">{getPageTitle()}</span>
          </div>
        </div>

        {/* Center: Global Search (Pill) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6 relative">
          <div className={`w-full px-4 py-2.5 flex items-center transition-all duration-300 relative z-50 ${
            (isSearchFocused && searchQuery.trim()) 
              ? 'bg-white border-2 border-[#065F46]/40 shadow-xl rounded-t-[1.5rem] rounded-b-none' 
              : isSearchFocused 
                ? 'bg-white border-2 border-[#065F46]/40 shadow-xl rounded-full' 
                : 'bg-white border-2 border-gray-200/80 rounded-full shadow-sm hover:border-gray-300'
          }`}>
            <Search className={`w-4 h-4 mr-2 transition-colors ${isSearchFocused ? 'text-[#065F46]' : 'text-gray-400'}`} />
            <input 
              id="global-search-input"
              type="text" 
              placeholder="Search pages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
              className="!bg-transparent !border-0 !border-transparent !outline-none !ring-0 !shadow-none focus:!border-transparent focus:!ring-0 focus:!outline-none focus:!shadow-none w-full text-sm font-['Inter'] text-gray-800 placeholder-gray-400 font-medium !p-0"
              autoComplete="off"
            />
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors border ${isSearchFocused ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              ⌘K
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 bg-white border-x-2 border-b-2 border-[#065F46]/40 rounded-b-[1.5rem] shadow-2xl z-40 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.length > 0 ? (
                suggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        navigate(item.path);
                        setSearchQuery("");
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-[#ECFDF5] group-hover:text-[#065F46] transition-colors text-gray-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 font-['Inter']">
                        {item.title}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500 font-['Inter'] flex flex-col items-center">
                  <Search className="w-6 h-6 text-gray-300 mb-2" />
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
          
          {/* Backdrop for mobile/focus */}
          {isSearchFocused && (
            <div className="fixed inset-0 z-30" onClick={() => setIsSearchFocused(false)} />
          )}
        </div>

        {/* Right Side: Actions (Pill) */}
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-[#065F46] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-[#065F46] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <div className="flex items-center space-x-2 pl-1 pr-3 cursor-pointer group" onClick={() => navigate('/settings')}>
            <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#065F46]">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-800 font-['Inter'] group-hover:text-[#065F46] transition-colors line-clamp-1 max-w-[100px]">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-['Inter'] capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
