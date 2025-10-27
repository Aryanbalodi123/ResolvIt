import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { reportLostItem, reportFoundItem } from '../../services/LostFoundServices';
import Modal from '../components/Modal'; // <-- 1. Import the Modal component

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
  Loader2 // <-- Added for loading state
} from 'lucide-react';

// 隼 FIX: Move form components outside the 'LostFound' component
// This prevents them from being re-defined on every render, which causes focus loss.

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
  
  // 隼 Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 隼 Lost item form state
  const [lostFormData, setLostFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Personal Items',
    contactMethod: 'email', // This can be simplified, we'll just use contactDetails
    contactDetails: '',
    dateLost: '',
    distinguishingFeatures: ''
  });

  // 隼 Found item form state
  const [foundFormData, setFoundFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'General',
    dateFound: '',
    contactMethod: 'email', // Also simplified
    contactDetails: ''
  });

  const lostFoundItems = [
    // ... (Your mock data remains the same)
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

  // 隼 Modal handlers
  const handleLostModalOpen = () => setIsLostModalOpen(true);
  const handleFoundModalOpen = () => setIsFoundModalOpen(true);

  const handleLostModalClose = () => {
    if (isSubmitting) return; // Don't close while submitting
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
    if (isSubmitting) return;
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

  // 隼 Input handlers
  const handleLostInputChange = (e) => {
    const { name, value } = e.target;
    setLostFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFoundInputChange = (e) => {
    const { name, value } = e.target;
    setFoundFormData(prev => ({ ...prev, [name]: value }));
  };

  // 隼 Submit handlers
  const handleLostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reportLostItem(lostFormData);
      alert("Lost item reported successfully!");
      handleLostModalClose();
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
      await reportFoundItem(foundFormData);
      alert("Found item reported successfully!");
      handleFoundModalClose();
    } catch (error) {
      console.error("Failed to report found item:", error.message);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 隼 Form components are now defined *above* LostFound

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
            className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-xl shadow-md flex items-center btn-animate font-['Inter']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Lost Item
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lostFoundItems.map((item) => (
          <div key={item.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{item.title}</h3>
                <div className="flex space-x-2 mt-1 flex-wrap gap-y-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    item.type === 'lost' ? 'bg-red-100/80 text-red-700 border-red-200/60' : 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60'
                  }`}>{item.type}</span>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100/80 text-gray-700 border-gray-200/60">{item.status}</span>
                </div>
              </div>
              <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 mb-4 font-['Inter']">{item.description}</p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center font-['Inter']"><MapPin className="w-4 h-4 mr-2 text-gray-500" /> {item.location}</div>
              <div className="flex items-center font-['Inter']"><Calendar className="w-4 h-4 mr-2 text-gray-500" /> {item.timeAgo}</div>
              <div className="flex items-center font-['Inter']"><Tag className="w-4 h-4 mr-2 text-gray-500" /> {item.category}</div>
              {item.images > 0 && <div className="flex items-center font-['Inter']"><ImageIcon className="w-4 h-4 mr-2 text-gray-500" /> {item.images} photo(s)</div>}
            </div>
        
            <div className="flex justify-between items-center border-t border-white/30 pt-4">
              <span className="text-xs text-gray-500 font-['Inter']">ID: {item.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-emerald-800 mb-3 flex items-center font-['Inter']">
          <AlertTriangle className="w-5 h-5 mr-2 text-emerald-600" /> Tips for Better Results
        </h3>
        <p className="text-emerald-700 text-sm font-['Inter']">
          Include detailed descriptions, exact location, and time. If you lost an item, add distinguishing features.
        </p>
      </div>

      {/* 2. Replace old modal with Modal Component */}
      {/* Report Lost Item Modal */}
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

      {/* Report Found Item Modal */}
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
    </div>
  );
};

export default LostFound;