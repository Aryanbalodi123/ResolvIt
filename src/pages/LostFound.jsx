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
      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#065F46]/20 focus:border-[#065F46] bg-gray-50 font-['Inter']"
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
      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#065F46]/20 focus:border-[#065F46] bg-gray-50 font-['Inter']"
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
      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#065F46]/20 focus:border-[#065F46] bg-gray-50 font-['Inter']"
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

  const allFilteredItems = [...filteredLostItems, ...filteredFoundItems].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const totalReports = lostItems.length + foundItems.length;
  const totalResolved = lostItems.filter(i => i.status === 'resolved').length + foundItems.filter(i => i.status === 'resolved').length;
  const successRate = totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0;

  return (
    <div className="p-6 lg:p-10 w-full min-h-screen space-y-8 bg-[#F5F5F5]">
      
      {/* Header & Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Hero Card */}
        <div className="md:col-span-8 bg-[#065F46] rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-['Inter'] mb-4 leading-tight">
              Lost & Found <br/><span className="text-emerald-200">Central Hub</span>
            </h1>
            <p className="text-emerald-50 max-w-lg font-['Inter'] text-sm md:text-base leading-relaxed">
              Help reunite lost items with their owners or find your missing belongings. Together we build a more connected community.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 mt-10">
            <button 
              onClick={handleLostModalOpen}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-red-500/20 font-bold flex items-center transition-transform hover:-translate-y-1 font-['Inter']"
            >
              <PackageSearch className="w-5 h-5 mr-2" /> Report Lost
            </button>
            <button 
              onClick={handleFoundModalOpen}
              className="bg-white hover:bg-gray-50 text-[#065F46] px-6 py-3 rounded-xl shadow-lg font-bold flex items-center transition-transform hover:-translate-y-1 font-['Inter']"
            >
              <PackageCheck className="w-5 h-5 mr-2" /> Report Found
            </button>
          </div>
        </div>

        {/* Floating Stat Widgets */}
        <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 font-['Inter']">Total Active</div>
              <div className="text-4xl font-black text-gray-900 font-['Inter']">{totalReports}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-[#065F46]" />
            </div>
          </div>
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
              <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1 font-['Inter']">Success Rate</div>
              <div className="text-4xl font-black text-gray-900 font-['Inter']">{successRate}%</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search & Filters */}
      <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between sticky top-4 z-20">
        <div className="relative flex-1 w-full flex items-center px-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-4 py-2 bg-transparent border-none focus:ring-0 text-gray-800 font-['Inter'] outline-none placeholder-gray-400"
          />
        </div>
        <div className="w-px h-8 bg-gray-200 hidden md:block mx-2"></div>
        <div className="flex items-center space-x-2 px-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {['All', 'General', 'Personal Items', 'Electronics', 'Apparel', 'Documents'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all font-['Inter'] ${
                categoryFilter === cat 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-[#065F46]" />
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
                <p className="text-sm text-gray-500 font-medium font-['Inter']">Help find these {filteredLostItems.length} missing items</p>
              </div>
            </div>

            {filteredLostItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                <div className="font-black text-gray-400 text-xl font-['Inter']">No lost items match your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLostItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    isLost={true} 
                    currentUser={currentUser} 
                    handleDelete={handleDelete} 
                    setContactModalData={setContactModalData} 
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
                <p className="text-sm text-gray-500 font-medium font-['Inter']">{filteredFoundItems.length} items waiting to be claimed</p>
              </div>
            </div>

            {filteredFoundItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                <div className="font-black text-gray-400 text-xl font-['Inter']">No found items match your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoundItems.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    isLost={false} 
                    currentUser={currentUser} 
                    handleDelete={handleDelete} 
                    setContactModalData={setContactModalData} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-[24px] p-6">
        <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center font-['Inter']">
          <AlertTriangle className="w-5 h-5 mr-2 text-[#047857]" /> Tips for Better Results
        </h3>
        <p className="text-green-700 text-sm font-['Inter']">
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
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
              className="flex-1 px-4 py-2 bg-[#065F46] text-white rounded-xl hover:bg-[#064E3B] transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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

// Reusable card component for grid
function ItemCard({ item, isLost, currentUser, handleDelete, setContactModalData }) {
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
          
          {item.user_id === currentUser ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
              className="w-full py-2.5 rounded-xl font-bold transition-all text-white bg-gray-800 hover:bg-red-600 flex items-center justify-center font-['Inter'] text-xs backdrop-blur-md border border-white/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setContactModalData(item); }}
              className={`w-full py-2.5 rounded-xl font-bold transition-all text-white ${isLost ? 'bg-red-500 hover:bg-red-600' : 'bg-[#065F46] hover:bg-[#064E3B]'} flex items-center justify-center font-['Inter'] text-xs shadow-xl`}
            >
              <Mail className="w-3.5 h-3.5 mr-2" /> {isLost ? 'Contact Finder' : 'Claim Item'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}