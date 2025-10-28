import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { sendComplaint } from "../../services/ComplaintServices";
import { getUserComplaints } from "../../services/UserServices";
import Modal from '../components/Modal';

const Complaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    const interval = setInterval(fetchComplaints, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100/80 text-amber-700 border-amber-200/60';
      case 'in-progress': return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
      case 'resolved': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60';
      default: return 'bg-gray-100/80 text-gray-700 border-gray-200/60';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100/80 border-red-200/60';
      case 'medium': return 'text-amber-800 bg-amber-100/80 border-amber-200/60';
      case 'low': return 'text-green-800 bg-green-100/80 border-green-200/60';
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
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(searchLower) ||
        complaint.description.toLowerCase().includes(searchLower) ||
        complaint.location.toLowerCase().includes(searchLower) ||
        complaint.category.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">My Complaints</h1>
          <p className="text-gray-600 mt-1 font-['Inter']">Track and manage all your submitted complaints</p>
        </div>
        <button
          onClick={handleComplaintModalOpen}
          className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-['Inter'] flex items-center shadow-md btn-animate"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.map((option) => (
          <div
            key={option.value}
            className={`bg-white/40 backdrop-blur-sm rounded-xl border p-4 text-center transition-colors cursor-pointer ${
              selectedFilter === option.value ? 'border-emerald-300/60 bg-emerald-100/40' : 'border-white/40 hover:border-white/60'
            }`}
            onClick={() => setSelectedFilter(option.value)}
          >
            <div className="text-2xl font-semibold text-gray-800 font-['Inter']">{option.count}</div>
            <div className="text-sm text-gray-600 font-['Inter']">{option.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, location, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors font-['Inter'] ${
                  selectedFilter === option.value
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md'
                    : 'bg-white/30 text-gray-700 hover:bg-white/40 backdrop-blur-sm'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 bg-red-50/50 border border-red-200/60 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium">Failed to load complaints</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 font-['Inter']">
                {searchQuery || selectedFilter !== 'all' ? 'No complaints found' : 'You haven\'t submitted any complaints yet.'}
              </h3>
              <p className="text-gray-500 mt-2 text-sm font-['Inter']">
                {searchQuery || selectedFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Click "New Complaint" to get started.'}
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 transition-all hover:shadow-lg card-hover"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-['Inter']">
                      {complaint.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} priority
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-700 border border-gray-200/60">
                        {complaint.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 font-['Inter']">{complaint.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1 font-['Inter']">
                        <MapPin className="w-4 h-4" />
                        <span>{complaint.location}</span>
                      </div>
                      <div className="flex items-center gap-1 font-['Inter']">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
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
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
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
              className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter']"
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
