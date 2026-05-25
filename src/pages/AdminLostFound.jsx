import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLostItems, getFoundItems, deleteLostItem } from "../../services/LostFoundServices";
import {
  MapPin,
  Calendar,
  Tag,
  Image as ImageIcon,
  PackageSearch,
  PackageCheck,
  Loader2,
} from "lucide-react";

export default function LostFound() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setIsLoading(true);

      const lost = await getLostItems();
      setLostItems(
        lost.map((item) => ({
          id: item.lost_id,
          title: item.title,
          category: item.category || "Other",
          timeAgo: timeAgo(item.date_lost),
          location: item.location,
          description: item.description,
          imageUrl: item.lostimage || null,
        }))
      );

      const found = await getFoundItems();
      setFoundItems(
        found.map((item) => ({
          id: item.lost_id,
          title: item.title,
          category: item.category || "Other",
          timeAgo: timeAgo(item.date_lost),
          location: item.location,
          description: item.description,
          imageUrl: item.lostimage || null,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      try {
        await deleteLostItem(id);
        setLostItems(prev => prev.filter(item => item.id !== id));
        setFoundItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete record.");
      }
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const allItems = [...lostItems.map(i => ({...i, type: 'lost'})), ...foundItems.map(i => ({...i, type: 'found'}))]
    .sort((a, b) => new Date(b.date || b.timeAgo) - new Date(a.date || a.timeAgo));
  const totalReports = allItems.length;

  return (
    <div className="p-6 lg:p-10 w-full min-h-screen space-y-8 bg-[#F5F5F5]">

      {/* Header & Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Hero Card */}
        <div className="md:col-span-8 bg-gray-900 rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-['Inter'] mb-4 leading-tight">
              Admin Lost & Found <br/><span className="text-gray-400">Management</span>
            </h1>
            <p className="text-gray-300 max-w-lg font-['Inter'] text-sm md:text-base leading-relaxed">
              Oversee and manage all lost and found items. Permanently remove resolved or inappropriate reports to keep the platform clean.
            </p>
          </div>
        </div>

        {/* Floating Stat Widgets */}
        <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 font-['Inter']">Total Records</div>
              <div className="text-4xl font-black text-gray-900 font-['Inter']">{totalReports}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageSearch className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 font-['Inter']">Action Required</div>
              <div className="text-4xl font-black text-gray-900 font-['Inter']">0</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* Lost Items Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <PackageSearch className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-['Inter'] tracking-tight">Reported Lost</h2>
                <p className="text-sm text-gray-500 font-medium font-['Inter']">Manage {lostItems.length} missing items</p>
              </div>
            </div>

            {lostItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                <div className="font-black text-gray-400 text-xl font-['Inter']">No lost items match your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lostItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    isLost={true} 
                    handleDelete={handleDelete} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Found Items Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl text-[#065F46]">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-['Inter'] tracking-tight">Reported Found</h2>
                <p className="text-sm text-gray-500 font-medium font-['Inter']">{foundItems.length} items waiting to be claimed</p>
              </div>
            </div>

            {foundItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                <div className="font-black text-gray-400 text-xl font-['Inter']">No found items match your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foundItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    isLost={false} 
                    handleDelete={handleDelete} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Reusable card component for grid
function ItemCard({ item, isLost, handleDelete }) {
  const badgeColor = isLost ? 'bg-red-500' : 'bg-[#065F46]';
  return (
    <div className="relative group rounded-[2rem] overflow-hidden h-[380px] shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer w-full flex flex-col justify-end">
      {/* Image or Solid Vibrant Block */}
      <div className="absolute inset-0 bg-gray-900">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-80 group-hover:opacity-100" 
          />
        ) : (
          <div className={`w-full h-full ${badgeColor} flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-700`}>
              {isLost ? <PackageSearch className="w-20 h-20 text-white/30" /> : <PackageCheck className="w-20 h-20 text-white/30" />}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${badgeColor} shadow-md`}>
          {isLost ? "Lost" : "Found"}
        </span>
      </div>

      {/* Animated Content Block */}
      <div className="relative z-10 p-6 transform transition-transform duration-500 group-hover:-translate-y-2">
        <h3 className="text-xl font-black text-white leading-tight mb-2 drop-shadow-sm line-clamp-2">{item.title}</h3>
        <div className="flex items-center text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">
          <MapPin className={`w-3.5 h-3.5 mr-1.5 ${isLost ? 'text-red-400' : 'text-emerald-400'}`} /> {item.location}
        </div>
        <div className="flex items-center text-xs font-bold text-gray-300 uppercase tracking-wide mb-4">
          <Calendar className={`w-3.5 h-3.5 mr-1.5 ${isLost ? 'text-red-400' : 'text-emerald-400'}`} /> {item.timeAgo}
        </div>

        {/* Hidden expanding info */}
        <div className="max-h-0 opacity-0 group-hover:max-h-[250px] group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
          <p className="text-gray-300 text-xs mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
            className="w-full py-2.5 rounded-xl font-bold transition-all text-white bg-red-600 hover:bg-red-700 flex items-center justify-center font-['Inter'] text-xs shadow-xl"
          >
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}
