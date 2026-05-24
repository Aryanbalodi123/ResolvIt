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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-semibold text-gray-800">Lost & Found</h1>

      {/* Loader */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* LOST ITEMS */}
          <Section
            icon={<PackageSearch className="w-6 h-6 text-red-500" />}
            title="Lost Items"
            count={lostItems.length}
            items={lostItems}
            badgeColor="bg-red-100/80 text-red-700 border-red-200/60"
            onDelete={handleDelete}
          />

          {/* FOUND ITEMS */}
          <Section
            icon={<PackageCheck className="w-6 h-6 text-emerald-500" />}
            title="Found Items"
            count={foundItems.length}
            items={foundItems}
            badgeColor="bg-emerald-100/80 text-emerald-700 border-emerald-200/60"
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}

function Section({ icon, title, count, items, badgeColor, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500">({count})</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-md border p-8 rounded-xl text-center">
          <p className="text-gray-500">No items reported yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item) => {
            const isLost = title === "Lost Items";
            const colorClass = isLost ? "pink" : "emerald";
            const colorClassDark = isLost ? "red" : "emerald";
            const badgeBg = isLost ? "bg-red-500" : "bg-emerald-500";
            
            return (
              <div key={item.id} className="relative group rounded-3xl overflow-hidden h-[420px] shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 bg-gray-900">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${isLost ? 'from-rose-500 to-orange-400' : 'from-emerald-500 to-teal-400'} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500`}>
                       <ImageIcon className="w-32 h-32 text-white/20 transform group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                {/* Top Badges */}
                <div className="absolute top-5 left-5 flex gap-2 z-10">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${isLost ? 'bg-red-500/90' : 'bg-emerald-500/90'} backdrop-blur-md shadow-lg border border-white/10`}>
                    {isLost ? "Lost" : "Found"}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider bg-white/95 backdrop-blur-md shadow-lg">
                    {item.status || 'Active'}
                  </span>
                </div>

                {/* Hover Sliding Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 h-full">
                  <div className="mt-auto transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-md line-clamp-2">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-300 font-medium mb-1 drop-shadow-sm">
                      <MapPin className={`w-4 h-4 mr-1.5 text-${colorClassDark}-400`} /> {item.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-300 font-medium drop-shadow-sm mb-4">
                      <Calendar className={`w-4 h-4 mr-1.5 text-${colorClassDark}-400`} /> {item.timeAgo}
                    </div>
                  </div>
                  
                  <div className="max-h-0 opacity-0 group-hover:max-h-[250px] group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                    <p className="text-gray-200 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center border border-white/10">
                        <Tag className={`w-3 h-3 mr-1.5 text-${colorClassDark}-400`} /> {item.category}
                      </span>
                    </div>

                    <button onClick={() => onDelete(item.id)} className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-red-100 bg-red-600/80 hover:bg-red-500 backdrop-blur-md flex items-center justify-center font-['Inter'] hover:shadow-red-500/25 border border-red-500/50">
                      Delete Record
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    )}
    </div>
  );
}
