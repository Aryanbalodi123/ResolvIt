import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { sendComplaint } from "../../services/ComplaintServices";

const Complaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Form data states
  const [complaintFormData, setComplaintFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
    category: "infrastructure",
  });

  const userComplaints = [
    {
      id: 'C001',
      title: 'Street Light Not Working',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-15',
      location: 'Main Street, Block A',
      description: 'Street light has been out for 3 days, causing safety concerns for pedestrians during night hours.',
      category: 'Infrastructure',
      timeAgo: '3 days ago',
      responses: 0
    },
    {
      id: 'C002',
      title: 'Water Supply Issue',
      status: 'in-progress',
      priority: 'high',
      date: '2024-08-12',
      location: 'Park Avenue, Sector 5',
      description: 'Inconsistent water supply for the past week. Water pressure is very low during morning hours.',
      category: 'Utilities',
      timeAgo: '6 days ago',
      responses: 2
    },
    {
      id: 'C003',
      title: 'Noise Complaint',
      status: 'resolved',
      priority: 'low',
      date: '2024-08-08',
      location: 'Green Valley Apartments',
      description: 'Construction noise during restricted hours (after 6 PM). Issue has been resolved by local authorities.',
      category: 'Noise',
      timeAgo: '1 week ago',
      responses: 5
    },
    {
      id: 'C004',
      title: 'Garbage Collection Delay',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-18',
      location: 'Rose Garden Colony',
      description: 'Garbage has not been collected for 4 days. Starting to cause hygiene issues in the area.',
      category: 'Sanitation',
      timeAgo: '1 day ago',
      responses: 1
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100/80 text-orange-700 border-orange-200/60';
      case 'in-progress': return 'bg-emerald-50/90 text-emerald-700 border-emerald-100';
      case 'resolved': return 'bg-green-100/80 text-green-700 border-green-200/60';
      default: return 'bg-gray-100/80 text-gray-700 border-gray-200/60';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-100/60';
      case 'medium': return 'text-orange-600 bg-orange-100/60';
      case 'low': return 'text-green-600 bg-green-100/60';
      default: return 'text-gray-600 bg-gray-100/60';
    }
  };

  const getStatusStats = () => {
    const stats = userComplaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: userComplaints.length,
      pending: stats.pending || 0,
      inProgress: stats['in-progress'] || 0,
      resolved: stats.resolved || 0
    };
  };

  // Modal handlers for Complaint
  const handleComplaintModalOpen = () => {
    setIsComplaintModalOpen(true);
  };

  const handleComplaintModalClose = () => {
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

    const user = JSON.parse(localStorage.getItem("token") || "{}");

    const payload = {
      user_id: user.rollNumber ?? null,
      title: complaintFormData.title,
      description: complaintFormData.description,
      location: complaintFormData.location,
      priority: null,
      category: complaintFormData.category,
      status: "pending"
    };

    try {
      const data = await sendComplaint(payload);
      console.log("Complaint saved:", data);
      alert("Complaint submitted successfully!");
      handleComplaintModalClose();
    } catch (error) {
      console.error("Failed to send complaint:", error.message);
      alert("Error submitting complaint: " + error.message);
    }
  };

  const filteredComplaints = userComplaints.filter(complaint => {
    const matchesFilter = selectedFilter === 'all' || complaint.status === selectedFilter;
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = getStatusStats();
  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { value: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">


      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.map((option) => (
          <div key={option.value} className={`bg-white/40 backdrop-blur-sm rounded-xl border p-4 text-center transition-colors cursor-pointer ${
            selectedFilter === option.value ? 'border-emerald-200 bg-emerald-50/40' : 'border-white/40 hover:border-white/60'
          }`} onClick={() => setSelectedFilter(option.value)}>
            <div className="text-2xl font-semibold text-gray-800 font-['Inter']">{option.count}</div>
            <div className="text-sm text-gray-600 font-['Inter']">{option.label}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
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
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg'
                    : 'bg-white/30 text-gray-700 hover:bg-white/40 backdrop-blur-sm'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 hover:shadow-lg transition-all duration-200 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{complaint.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{complaint.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center font-['Inter']">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">ID:</span>
                      <span className="ml-1">{complaint.id}</span>
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <MapPin className="w-4 h-4 mr-2" />
                      {complaint.location}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <Calendar className="w-4 h-4 mr-2" />
                      {complaint.timeAgo}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {complaint.responses} responses
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 bg-white/40 px-2 py-1 rounded-lg font-['Inter'] backdrop-blur-sm">
                        {complaint.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium font-['Inter'] flex items-center group">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-12 text-center">
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' ? 'No complaints found' : 'No complaints yet'}
            </h3>
            <p className="text-gray-600 mb-6 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't submitted any complaints. Click the button below to get started."
              }
            </p>
            {(!searchQuery && selectedFilter === 'all') && (
              <button 
                onClick={handleComplaintModalOpen}
                className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-500 hover:to-green-600 transition-all duration-300 font-['Inter'] shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Submit Your First Complaint
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination (if needed) */}
      {filteredComplaints.length > 10 && (
        <div className="flex justify-center pt-6">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm bg-white/30 border border-white/40 rounded-xl hover:bg-white/40 font-['Inter'] backdrop-blur-sm">
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-gradient-to-r from-pink-300 to-rose-300 text-white rounded-xl font-['Inter'] shadow-md">
              1
            </button>
            <button className="px-3 py-2 text-sm bg-white/30 border border-white/40 rounded-xl hover:bg-white/40 font-['Inter'] backdrop-blur-sm">
              2
            </button>
            <button className="px-3 py-2 text-sm bg-white/30 border border-white/40 rounded-xl hover:bg-white/40 font-['Inter'] backdrop-blur-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
                New Complaint
              </h2>
              <button
                onClick={handleComplaintModalClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors"
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
                  placeholder="Brief description of the issue"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                />
              </div>

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
                  <option value="environment">Environment</option>
                  <option value="transportation">Transportation</option>
                  <option value="other">Other</option>
                </select>
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
                  placeholder="Street address or area"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
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
                  placeholder="Detailed description of the issue"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter']"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleComplaintModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter']"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-300 to-rose-300 text-white rounded-xl hover:from-pink-400 hover:to-rose-400 transition-all duration-200 font-medium shadow-md font-['Inter']"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;