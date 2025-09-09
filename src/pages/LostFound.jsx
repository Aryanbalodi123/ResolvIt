import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { reportLostItem, reportFoundItem } from '../../services/LostFoundServices'; // ✅ added reportFoundItem

import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Tag,
  CheckCircle,
  MoreVertical,
  Image as ImageIcon,
  AlertTriangle,
  X
} from 'lucide-react';

const LostFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
  
  // 🔹 Lost item form state
  const [lostFormData, setLostFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Personal Items',
    contactMethod: 'email',
    contactDetails: '',
    dateLost: '',
    distinguishingFeatures: ''
  });

  // 🔹 Found item form state
  const [foundFormData, setFoundFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'General',
    dateFound: '',
    contactMethod: 'email',
    contactDetails: ''
  });

  const lostFoundItems = [
    {
      id: 'LF001',
      title: 'iPhone 13 Pro',
      type: 'lost',
      category: 'Electronics',
      date: '2024-08-20',
      location: 'Central Park, Near Fountain',
      description: 'Lost my iPhone 13 Pro in midnight green color with a black case.',
      timeAgo: '4 hours ago',
      status: 'active',
      images: 1
    },
    {
      id: 'LF003',
      title: 'Blue Backpack',
      type: 'lost',
      category: 'Bags',
      date: '2024-08-18',
      location: 'Metro Station, Platform 2',
      description: 'Lost my blue Nike backpack containing laptop, books, and documents.',
      timeAgo: '2 days ago',
      status: 'active',
      images: 1
    }
  ];

  // 🔹 Modal handlers
  const handleLostModalOpen = () => setIsLostModalOpen(true);
  const handleFoundModalOpen = () => setIsFoundModalOpen(true);

  const handleLostModalClose = () => {
    setIsLostModalOpen(false);
    setLostFormData({
      title: '',
      description: '',
      location: '',
      category: 'Personal Items',
      contactMethod: 'email',
      contactDetails: '',
      dateLost: '',
      distinguishingFeatures: ''
    });
  };

  const handleFoundModalClose = () => {
    setIsFoundModalOpen(false);
    setFoundFormData({
      title: '',
      description: '',
      location: '',
      category: 'General',
      dateFound: '',
      contactMethod: 'email',
      contactDetails: ''
    });
  };

  // 🔹 Input handlers
  const handleLostInputChange = (e) => {
    const { name, value } = e.target;
    setLostFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFoundInputChange = (e) => {
    const { name, value } = e.target;
    setFoundFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit handlers
  const handleLostSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportLostItem(lostFormData);
      alert("Lost item reported successfully!");
      handleLostModalClose();
    } catch (error) {
      console.error("Failed to report lost item:", error.message);
    }
  };

  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportFoundItem(foundFormData);
      alert("Found item reported successfully!");
      handleFoundModalClose();
    } catch (error) {
      console.error("Failed to report found item:", error.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Lost & Found</h1>
          <p className="text-gray-600 mt-1">Help reunite lost items with their owners or find your missing belongings</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleFoundModalOpen}
            className="bg-gradient-to-r from-purple-300 to-indigo-300 text-white px-4 py-2 rounded-xl shadow-md flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Report Found Item
          </button>
          <button 
            onClick={handleLostModalOpen}
            className="bg-gradient-to-r from-rose-300 to-pink-300 text-white px-4 py-2 rounded-xl shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Lost Item
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lostFoundItems.map((item) => (
          <div key={item.id} className="bg-white/40 backdrop-blur-sm rounded-xl border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                <div className="flex space-x-2 mt-1">
                  <span className="px-2 py-1 rounded-lg text-xs bg-rose-100 text-rose-700 border border-rose-200">{item.type}</span>
                  <span className="px-2 py-1 rounded-lg text-xs bg-pink-100 text-pink-700 border border-pink-200">{item.status}</span>
                </div>
              </div>
              <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {item.location}</div>
              <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {item.timeAgo}</div>
              <div className="flex items-center"><Tag className="w-4 h-4 mr-2" /> {item.category}</div>
              {item.images > 0 && <div className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> {item.images} photo(s)</div>}
            </div>
      
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-xs text-gray-500">ID: {item.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> Tips for Better Results
        </h3>
        <p className="text-blue-700 text-sm">
          Include detailed descriptions, exact location, and time when lost.
        </p>
      </div>

      {/* Report Lost Item Modal */}
      {isLostModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Report Lost Item</h2>
              <button onClick={handleLostModalClose} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLostSubmit} className="p-6 space-y-4">
              <input type="text" name="title" value={lostFormData.title} onChange={handleLostInputChange} placeholder="Item Title" required className="w-full border rounded p-2" />
              <textarea name="description" value={lostFormData.description} onChange={handleLostInputChange} placeholder="Description" required className="w-full border rounded p-2" />
              <input type="text" name="location" value={lostFormData.location} onChange={handleLostInputChange} placeholder="Location" required className="w-full border rounded p-2" />
              <button type="submit" className="w-full bg-pink-400 text-white py-2 rounded">Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* Report Found Item Modal */}
      {isFoundModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Report Found Item</h2>
              <button onClick={handleFoundModalClose} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFoundSubmit} className="p-6 space-y-4">
              <input type="text" name="title" value={foundFormData.title} onChange={handleFoundInputChange} placeholder="Item Title" required className="w-full border rounded p-2" />
              <textarea name="description" value={foundFormData.description} onChange={handleFoundInputChange} placeholder="Description" required className="w-full border rounded p-2" />
              <input type="text" name="location" value={foundFormData.location} onChange={handleFoundInputChange} placeholder="Location" required className="w-full border rounded p-2" />
              <button type="submit" className="w-full bg-indigo-400 text-white py-2 rounded">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
