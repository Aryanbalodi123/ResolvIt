import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { reportLostItem, reportFoundItem, getLostItems, getFoundItems, deleteLostItem } from '../../services/LostFoundServices';
import Modal from '../components/Modal'; 

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
  X,
  Loader2,
  PackageSearch,
  PackageCheck,
  Filter,
  Trash2,
  Mail
} from 'lucide-react';

const FormInput = ({ label, name, value, onChange, placeholder, required, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && '*'}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && '*'}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, children, required }) => (
   <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
      {label} {required && '*'}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
    >
      {children}
    </select>
  </div>
);

const FormImageInput = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
        {label}
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white/50 hover:bg-gray-50/80 transition-colors overflow-hidden relative">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 font-['Inter']">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 font-['Inter']">PNG, JPG, JPEG (MAX. 5MB)</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
};

const LostFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    } else {
      fetchAllItems();
    }
  }, [navigate]);

  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  // New Features State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [contactModalData, setContactModalData] = useState(null);
  
  const currentUser = localStorage.getItem("rollNumber") || localStorage.getItem("userId");

  const [lostFormData, setLostFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Personal Items',
    contactMethod: 'email', 
    contactDetails: '',
    dateLost: '',
    distinguishingFeatures: '',
    image: null
  });

  const [foundFormData, setFoundFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'General',
    dateFound: '',
    contactMethod: 'email', 
    contactDetails: '',
    image: null
  });


  const fetchAllItems = async () => {
    try {
      setIsLoading(true);
      
      const lostData = await getLostItems();
      const transformedLostItems = lostData.map(item => ({
        id: item.lost_id,
        title: item.title,
        type: 'lost',
        category: item.category || 'Other',
        date: item.date_lost,
        location: item.location,
        description: item.description,
        timeAgo: formatTimeAgo(item.date_lost),
        status: item.isResolved ? 'resolved' : 'active',
        imageUrl: item.lostimage || null,
        distinguishingFeatures: item.distinguishing_features,
        contactDetails: item.contact_details,
        user_id: item.user_id
      }));
      setLostItems(transformedLostItems);
      
    
      const foundData = await getFoundItems();
      const transformedFoundItems = foundData.map(item => ({
        id: item.lost_id,
        title: item.title,
        type: 'found',
        category: item.category || 'Other',
        date: item.date_lost,
        location: item.location,
        description: item.description,
        timeAgo: formatTimeAgo(item.date_lost),
        status: item.isResolved ? 'resolved' : 'active',
        imageUrl: item.lostimage || null,
        distinguishingFeatures: item.distinguishing_features,
        contactDetails: item.contact_details,
        user_id: item.user_id
      }));
      setFoundItems(transformedFoundItems);
      
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleLostModalOpen = () => setIsLostModalOpen(true);
  const handleFoundModalOpen = () => setIsFoundModalOpen(true);

  const handleLostModalClose = () => {
    if (isSubmitting) return; 
    setIsLostModalOpen(false);
    setLostFormData({
      title: '',
      description: '',
      location: '',
      category: 'Personal Items',
      contactMethod: 'email',
      contactDetails: '',
      dateLost: '',
      distinguishingFeatures: '',
      image: null
    });
  };

  const handleFoundModalClose = () => {
    if (isSubmitting) return;
    setIsFoundModalOpen(false);
    setFoundFormData({
      title: '',
      description: '',
      location: '',
      category: 'General',
      dateFound: '',
      contactMethod: 'email',
      contactDetails: '',
      image: null
    });
  };

  const handleLostInputChange = (e) => {
    const { name, value } = e.target;
    setLostFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFoundInputChange = (e) => {
    const { name, value } = e.target;
    setFoundFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("rollNumber") || localStorage.getItem("userId");
      await reportLostItem({
        ...lostFormData,
        user_id: userId
      });
      alert("Lost item reported successfully!");
      handleLostModalClose();
      fetchAllItems();
    } catch (error) {
      console.error("Failed to report lost item:", error.message);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("rollNumber") || localStorage.getItem("userId");
      await reportFoundItem({
        ...foundFormData,
        user_id: userId
      });
      alert("Found item reported successfully!");
      handleFoundModalClose();
      fetchAllItems();
    } catch (error) {
      console.error("Failed to report found item:", error.message);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete your reported item?")) {
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

  const filteredLostItems = lostItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredFoundItems = foundItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">Lost & Found</h1>
          <p className="text-gray-600 mt-1 font-['Inter']">Help reunite lost items with their owners or find your missing belongings</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleFoundModalOpen}
            className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-xl shadow-md flex items-center btn-animate font-['Inter']"
          >
            <Search className="w-4 h-4 mr-2" />
            Report Found Item
          </button>
          <button 
            onClick={handleLostModalOpen}
            className="bg-gradient-to-r from-pink-400 to-red-400 text-white px-4 py-2 rounded-xl shadow-md flex items-center btn-animate font-['Inter']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Lost Item
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent font-['Inter'] transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent font-['Inter'] transition-all appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Personal Items">Personal Items</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Documents">Documents</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Lost Items Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PackageSearch className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">Lost Items</h2>
              <span className="text-sm text-gray-500 font-['Inter']">({lostItems.length})</span>
            </div>
            
            {filteredLostItems.length === 0 ? (
              <div className="bg-red-50/50 backdrop-blur-sm rounded-xl border border-red-100/60 p-8 text-center">
                <p className="text-gray-500 font-['Inter']">No lost items match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredLostItems.map((item) => (
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
                        <div className="w-full h-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                           <ImageIcon className="w-32 h-32 text-white/20 transform group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 flex gap-2 z-10">
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider bg-red-500/90 backdrop-blur-md shadow-lg border border-white/10">
                        Lost
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider bg-white/95 backdrop-blur-md shadow-lg">
                        {item.status}
                      </span>
                    </div>

                    {/* Hover Sliding Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 h-full">
                      <div className="mt-auto transform transition-transform duration-500 group-hover:-translate-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-md line-clamp-2">{item.title}</h3>
                        <div className="flex items-center text-sm text-gray-300 font-medium mb-1 drop-shadow-sm">
                          <MapPin className="w-4 h-4 mr-1.5 text-red-400" /> {item.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-300 font-medium drop-shadow-sm mb-4">
                          <Calendar className="w-4 h-4 mr-1.5 text-red-400" /> {item.timeAgo}
                        </div>
                      </div>
                      
                      <div className="max-h-0 opacity-0 group-hover:max-h-[250px] group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-5">
                          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center border border-white/10">
                            <Tag className="w-3 h-3 mr-1.5 text-red-400" /> {item.category}
                          </span>
                          {item.distinguishingFeatures && (
                            <span className="text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center border border-white/10 line-clamp-1">
                              <CheckCircle className="w-3 h-3 mr-1.5 text-red-400" /> {item.distinguishingFeatures}
                            </span>
                          )}
                        </div>

                        {item.user_id === currentUser ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-red-100 bg-red-600/80 hover:bg-red-500 flex items-center justify-center font-['Inter'] hover:shadow-red-500/25 border border-red-500/50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Report
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setContactModalData(item); }}
                            className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-white bg-red-500 hover:bg-red-400 flex items-center justify-center font-['Inter'] hover:shadow-red-500/25 border border-red-400/50"
                          >
                            <Mail className="w-4 h-4 mr-2" /> Contact Finder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Found Items Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">Found Items</h2>
              <span className="text-sm text-gray-500 font-['Inter']">({foundItems.length})</span>
            </div>
            
            {filteredFoundItems.length === 0 ? (
              <div className="bg-emerald-50/50 backdrop-blur-sm rounded-xl border border-emerald-100/60 p-8 text-center">
                <p className="text-gray-500 font-['Inter']">No found items match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFoundItems.map((item) => (
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
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                           <ImageIcon className="w-32 h-32 text-white/20 transform group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 flex gap-2 z-10">
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider bg-emerald-500/90 backdrop-blur-md shadow-lg border border-white/10">
                        Found
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider bg-white/95 backdrop-blur-md shadow-lg">
                        {item.status}
                      </span>
                    </div>

                    {/* Hover Sliding Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 h-full">
                      <div className="mt-auto transform transition-transform duration-500 group-hover:-translate-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-md line-clamp-2">{item.title}</h3>
                        <div className="flex items-center text-sm text-gray-300 font-medium mb-1 drop-shadow-sm">
                          <MapPin className="w-4 h-4 mr-1.5 text-emerald-400" /> {item.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-300 font-medium drop-shadow-sm mb-4">
                          <Calendar className="w-4 h-4 mr-1.5 text-emerald-400" /> {item.timeAgo}
                        </div>
                      </div>
                      
                      <div className="max-h-0 opacity-0 group-hover:max-h-[250px] group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                        <p className="text-gray-200 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-5">
                          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center border border-white/10">
                            <Tag className="w-3 h-3 mr-1.5 text-emerald-400" /> {item.category}
                          </span>
                        </div>

                        {item.user_id === currentUser ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-red-100 bg-red-600/80 hover:bg-red-500 flex items-center justify-center font-['Inter'] hover:shadow-red-500/25 border border-red-500/50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Report
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setContactModalData(item); }}
                            className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-white bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center font-['Inter'] hover:shadow-emerald-500/25 border border-emerald-400/50"
                          >
                            <Mail className="w-4 h-4 mr-2" /> Claim Item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-emerald-800 mb-3 flex items-center font-['Inter']">
          <AlertTriangle className="w-5 h-5 mr-2 text-emerald-600" /> Tips for Better Results
        </h3>
        <p className="text-emerald-700 text-sm font-['Inter']">
          Include detailed descriptions, exact location, and time. If you lost an item, add distinguishing features.
        </p>
      </div>

      <Modal isOpen={isLostModalOpen} onClose={handleLostModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">Report Lost Item</h2>
          <button
            onClick={handleLostModalClose}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleLostSubmit} className="p-6 space-y-4">
          <FormInput label="Item Title" name="title" value={lostFormData.title} onChange={handleLostInputChange} placeholder="e.g., Black Leather Wallet" required />
          <FormTextarea label="Description" name="description" value={lostFormData.description} onChange={handleLostInputChange} placeholder="Brand, color, contents, etc." required />
          <FormInput label="Distinguishing Features" name="distinguishingFeatures" value={lostFormData.distinguishingFeatures} onChange={handleLostInputChange} placeholder="e.g., 'A' monogram, scratch on corner" />
          <FormInput label="Last Known Location" name="location" value={lostFormData.location} onChange={handleLostInputChange} placeholder="e.g., Library 2nd Floor, near stairs" required />
          <FormInput label="Date Lost" name="dateLost" value={lostFormData.dateLost} onChange={handleLostInputChange} type="date" required />
          <FormSelect label="Category" name="category" value={lostFormData.category} onChange={handleLostInputChange} required>
            <option>Personal Items</option>
            <option>Electronics</option>
            <option>Apparel</option>
            <option>Documents</option>
            <option>Other</option>
          </FormSelect>
          <FormInput label="Contact Details" name="contactDetails" value={lostFormData.contactDetails} onChange={handleLostInputChange} placeholder="Your email or phone number" required />
          <FormImageInput label="What does the item look like?" value={lostFormData.image} onChange={(base64) => setLostFormData(prev => ({ ...prev, image: base64 }))} />
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleLostModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-xl hover:from-pink-500 hover:to-red-500 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Report Lost"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isFoundModalOpen} onClose={handleFoundModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">Report Found Item</h2>
          <button
            onClick={handleFoundModalClose}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleFoundSubmit} className="p-6 space-y-4">
          <FormInput label="Item Title" name="title" value={foundFormData.title} onChange={handleFoundInputChange} placeholder="e.g., Blue Nike Backpack" required />
          <FormTextarea label="Description" name="description" value={foundFormData.description} onChange={handleFoundInputChange} placeholder="Any identifying marks, contents (if known)" required />
          <FormInput label="Location Found" name="location" value={foundFormData.location} onChange={handleFoundInputChange} placeholder="e.g., Cafeteria, Table 5" required />
          <FormInput label="Date Found" name="dateFound" value={foundFormData.dateFound} onChange={handleFoundInputChange} type="date" required />
          <FormSelect label="Category" name="category" value={foundFormData.category} onChange={handleFoundInputChange} required>
            <option>General</option>
            <option>Personal Items</option>
            <option>Electronics</option>
            <option>Apparel</option>
            <option>Documents</option>
            <option>Other</option>
          </FormSelect>
          <FormInput label="Your Contact Details (Optional)" name="contactDetails" value={foundFormData.contactDetails} onChange={handleFoundInputChange} placeholder="Your email or phone (if willing)" />
          <FormImageInput label="What does the item look like?" value={foundFormData.image} onChange={(base64) => setFoundFormData(prev => ({ ...prev, image: base64 }))} />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleFoundModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Report Found"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contact Details Modal */}
      <Modal isOpen={!!contactModalData} onClose={() => setContactModalData(null)}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">Contact Information</h2>
          <button
            onClick={() => setContactModalData(null)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 font-['Inter'] text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">
            {contactModalData?.type === 'lost' ? "Reach out to the person who lost this item:" : "Reach out to claim this item:"}
          </h3>
          <p className="text-xl font-bold text-blue-600 bg-blue-50 p-4 rounded-xl border border-blue-100 break-all select-all">
            {contactModalData?.contactDetails || "No contact info provided."}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Mention the item "{contactModalData?.title}" when contacting them.
          </p>
          <div className="pt-4">
            <button
              onClick={() => setContactModalData(null)}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default LostFound;