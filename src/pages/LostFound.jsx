import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { reportLostItem, reportFoundItem, getLostItems, getFoundItems } from '../../services/LostFoundServices';
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
  PackageCheck
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

  // Separate states for lost and found items
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

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

  const [foundFormData, setFoundFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'General',
    dateFound: '',
    contactMethod: 'email', 
    contactDetails: ''
  });

  // Fetch both lost and found items
  const fetchAllItems = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lost items
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
        images: item.lostimage ? 1 : 0,
        distinguishingFeatures: item.distinguishing_features,
        contactDetails: item.contact_details
      }));
      setLostItems(transformedLostItems);
      
      // Fetch found items
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
        images: item.lostimage ? 1 : 0,
        distinguishingFeatures: item.distinguishing_features,
        contactDetails: item.contact_details
      }));
      setFoundItems(transformedFoundItems);
      
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format time ago
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
      const userId = localStorage.getItem("userId");
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
      const userId = localStorage.getItem("userId");
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
            
            {lostItems.length === 0 ? (
              <div className="bg-red-50/50 backdrop-blur-sm rounded-xl border border-red-100/60 p-8 text-center">
                <p className="text-gray-500 font-['Inter']">No lost items reported yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {lostItems.map((item) => (
                  <div key={item.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 card-hover">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{item.title}</h3>
                        <div className="flex space-x-2 mt-1 flex-wrap gap-y-2">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100/80 text-red-700 border border-red-200/60">
                            Lost
                          </span>
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100/80 text-gray-700 border border-gray-200/60">
                            {item.status}
                          </span>
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
                      {item.distinguishingFeatures && (
                        <div className="flex items-start font-['Inter']">
                          <CheckCircle className="w-4 h-4 mr-2 text-gray-500 mt-0.5" /> 
                          <span className="text-xs">{item.distinguishingFeatures}</span>
                        </div>
                      )}
                      {item.images > 0 && <div className="flex items-center font-['Inter']"><ImageIcon className="w-4 h-4 mr-2 text-gray-500" /> {item.images} photo(s)</div>}
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
            
            {foundItems.length === 0 ? (
              <div className="bg-emerald-50/50 backdrop-blur-sm rounded-xl border border-emerald-100/60 p-8 text-center">
                <p className="text-gray-500 font-['Inter']">No found items reported yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {foundItems.map((item) => (
                  <div key={item.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 card-hover">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{item.title}</h3>
                        <div className="flex space-x-2 mt-1 flex-wrap gap-y-2">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100/80 text-emerald-700 border border-emerald-200/60">
                            Found
                          </span>
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100/80 text-gray-700 border border-gray-200/60">
                            {item.status}
                          </span>
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