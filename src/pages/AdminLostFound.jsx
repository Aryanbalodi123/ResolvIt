import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLostItems, getFoundItems } from "../../services/LostFoundServices";
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
          images: item.lostimage ? 1 : 0,
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
          images: item.lostimage ? 1 : 0,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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
          />

          {/* FOUND ITEMS */}
          <Section
            icon={<PackageCheck className="w-6 h-6 text-emerald-500" />}
            title="Found Items"
            count={foundItems.length}
            items={foundItems}
            badgeColor="bg-emerald-100/80 text-emerald-700 border-emerald-200/60"
          />
        </>
      )}
    </div>
  );
}

/* Smaller reusable component */
function Section({ icon, title, count, items, badgeColor }) {
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
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/40 backdrop-blur-xl rounded-xl border border-white/40 p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">
                  {item.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-lg font-medium border ${badgeColor}`}
                >
                  {title === "Lost Items" ? "Lost" : "Found"}
                </span>
              </div>

              <p className="text-gray-600 mb-3">{item.description}</p>

              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {item.location}
                </p>

                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  {item.timeAgo}
                </p>

                <p className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  {item.category}
                </p>

                {item.images > 0 && (
                  <p className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                    {item.images} photo(s)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
