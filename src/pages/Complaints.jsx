import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Eye,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  MoreVertical,
  FileText,
  MessageSquare,
  ExternalLink,
  X,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { sendComplaint } from "../../services/ComplaintServices";
import { getUserComplaints } from "../../services/UserServices";
import Modal from '../components/Modal';
import { useLiveComplaintList } from '../hooks/useComplaintUpdates';

const Complaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [complaintFormData, setComplaintFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
    category: "infrastructure",
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const rollNumber = localStorage.getItem("rollNumber");
        if (!rollNumber) throw new Error("User not authenticated");
        const userComplaints = await getUserComplaints(rollNumber);
        setComplaints(userComplaints || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
    // Polling removed — live updates handled by WebSocket below
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── Live real-time updates via Socket.io ──────────────────────────────
  // When admin patches a complaint, the server pushes 'complaint:updated'
  // and the hook patches the local state in-place — no full refetch needed.
  const rollNumber = localStorage.getItem("rollNumber");
  const { connected: socketConnected } = useLiveComplaintList(
    complaints,
    setComplaints,
    { userRollNumber: rollNumber }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100/80 text-amber-700 border-amber-200/60';
      case 'in-progress': return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
      case 'resolved': return 'bg-green-100/80 text-green-700 border-[#A7F3D0]/60';
      default: return 'bg-gray-100/80 text-gray-700 border-gray-200/60';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100/80 border-red-200/60';
      case 'medium': return 'text-amber-800 bg-amber-100/80 border-amber-200/60';
      case 'low': return 'text-green-800 bg-green-100/80 border-[#A7F3D0]/60';
      default: return 'text-gray-600 bg-gray-100/60';
    }
  };

  const getStatusStats = () => {
    const stats = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});
    return {
      total: complaints.length,
      pending: stats.pending || 0,
      inProgress: stats['in-progress'] || 0,
      resolved: stats.resolved || 0
    };
  };

  const handleComplaintModalOpen = () => {
    setIsComplaintModalOpen(true);
  };

  const handleComplaintModalClose = () => {
    if (isSubmitting) return;
    setIsComplaintModalOpen(false);
    setComplaintFormData({
      title: "",
      description: "",
      location: "",
      priority: "medium",
      category: "infrastructure",
    });
  };

  const handleComplaintInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("token") || "{}");
      if (!userInfo.rollNumber) throw new Error("User not authenticated");

      const payload = {
        user_id: userInfo.rollNumber,
        title: complaintFormData.title,
        description: complaintFormData.description,
        location: complaintFormData.location,
        priority: complaintFormData.priority,
        category: complaintFormData.category,
        status: "pending"
      };

      await sendComplaint(payload);
      handleComplaintModalClose();
      const updatedComplaints = await getUserComplaints(userInfo.rollNumber);
      setComplaints(updatedComplaints || []);
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getStatusStats();
  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { value: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  const filteredComplaints = complaints
    .filter(complaint => selectedFilter === 'all' || complaint.status === selectedFilter)
    .filter(complaint => {
      if (!debouncedSearchQuery) return true;
      const searchLower = debouncedSearchQuery.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(searchLower) ||
        complaint.description.toLowerCase().includes(searchLower) ||
        complaint.location.toLowerCase().includes(searchLower) ||
        complaint.category.toLowerCase().includes(searchLower) ||
        String(complaint.complaint_id).includes(searchLower)
      );
    });

  return (
    <div className="p-6 lg:p-10 w-full min-h-screen bg-[#F5F5F5] space-y-8">
      
      {/* Header & Hero Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#065F46] rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight font-['Inter']">
                My Complaints
              </h1>
              {/* Live connection badge */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border backdrop-blur-md transition-all ${
                  socketConnected
                    ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500/20 text-amber-100 border-amber-400/30'
                }`}
              >
                {socketConnected
                  ? <><Wifi className="w-4 h-4 animate-pulse" /> Live Sync</>
                  : <><WifiOff className="w-4 h-4" /> Reconnecting...</>}
              </div>
            </div>
            <p className="text-emerald-100 font-['Inter'] max-w-md text-sm leading-relaxed">
              Track your submitted issues. We ensure every complaint is addressed promptly to improve our campus infrastructure.
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <button
              onClick={handleComplaintModalOpen}
              className="bg-white text-[#065F46] px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 font-['Inter'] flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 mr-2" />
              File New Complaint
            </button>
          </div>
        </div>

        {/* Stats Grid Widget */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {filterOptions.map((option) => {
            const isSelected = selectedFilter === option.value;
            let iconColor = "text-gray-400";
            let bgLight = "bg-white";
            if (option.value === 'pending') iconColor = "text-amber-500";
            if (option.value === 'in-progress') iconColor = "text-blue-500";
            if (option.value === 'resolved') iconColor = "text-emerald-500";
            
            return (
              <div
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`rounded-[1.5rem] p-5 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-[#065F46] bg-emerald-50 shadow-md ring-1 ring-[#065F46]/20' 
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider font-['Inter']">
                    {option.label}
                  </div>
                  <div className={`p-2 rounded-full bg-gray-50 group-hover:scale-110 transition-transform ${iconColor}`}>
                    {option.value === 'all' && <FileText className="w-4 h-4" />}
                    {option.value === 'pending' && <Clock className="w-4 h-4" />}
                    {option.value === 'in-progress' && <Loader2 className="w-4 h-4" />}
                    {option.value === 'resolved' && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
                <div className={`text-4xl font-black font-['Inter'] ${isSelected ? 'text-[#065F46]' : 'text-gray-900'}`}>
                  {option.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 flex items-center relative z-20">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="Search complaints by title, ID, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-4 py-2 bg-transparent border-none focus:ring-0 text-gray-800 font-['Inter'] outline-none placeholder-gray-400"
        />
      </div>

      {/* Ticket Style Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-[#065F46] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-white rounded-[2rem] border border-red-100 shadow-sm">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-bold text-lg">Failed to load complaints</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {filteredComplaints.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-[3rem] shadow-sm border border-gray-100">
              <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <h3 className="text-2xl font-black text-gray-900 font-['Inter']">
                {searchQuery || selectedFilter !== 'all' ? 'No matches found' : 'No complaints filed'}
              </h3>
              <p className="text-gray-500 mt-2 font-medium font-['Inter']">
                {searchQuery || selectedFilter !== 'all' ? 'Try a different search term.' : 'Click the button above to file your first complaint.'}
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => {
              // Determine dynamic border color based on status
              let statusBorder = "border-l-gray-300";
              if(complaint.status === "pending") statusBorder = "border-l-amber-500";
              if(complaint.status === "in-progress") statusBorder = "border-l-blue-500";
              if(complaint.status === "resolved") statusBorder = "border-l-emerald-500";

              return (
                <div
                  key={complaint.complaint_id}
                  className={`bg-white rounded-[2rem] border border-gray-100 border-l-[6px] ${statusBorder} p-6 hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-50 to-transparent opacity-50 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-xs font-bold text-gray-400 font-['Inter'] uppercase tracking-wider">
                      #{String(complaint.complaint_id).substring(0, 8)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPriorityColor(complaint.priority)} border-0 shadow-sm`}>
                      {complaint.priority}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 font-['Inter'] line-clamp-2 leading-tight relative z-10">
                    {complaint.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-6 font-['Inter'] line-clamp-3 leading-relaxed relative z-10">
                    {complaint.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50 space-y-3 relative z-10">
                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="truncate">{complaint.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                      
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(complaint.status)} border-0`}>
                        {complaint.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal isOpen={isComplaintModalOpen} onClose={handleComplaintModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">New Complaint</h2>
          <button
            onClick={handleComplaintModalClose}
            disabled={isSubmitting}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={complaintFormData.title}
              onChange={handleComplaintInputChange}
              placeholder="e.g., Broken streetlight on main road"
              required
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                Category
              </label>
              <select
                name="category"
                value={complaintFormData.category}
                onChange={handleComplaintInputChange}
                className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="utilities">Utilities</option>
                <option value="safety">Safety</option>
                <option value="hostel">Hostel</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                Priority
              </label>
              <select
                name="priority"
                value={complaintFormData.priority}
                onChange={handleComplaintInputChange}
                className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={complaintFormData.location}
              onChange={handleComplaintInputChange}
              placeholder="e.g., Outside 'A' Block, near library"
              required
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={complaintFormData.description}
              onChange={handleComplaintInputChange}
              placeholder="Provide as much detail as possible..."
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter']"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleComplaintModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-400 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Complaint"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Complaints;
