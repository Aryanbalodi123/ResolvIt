import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  MapPin, 
  Calendar, 
  User,
  Filter,
  Search,
  FileText,
  MessageSquare,
  ClipboardEdit,
  X,
  Loader2
} from 'lucide-react';
import { getAllComplaints, updateComplaint } from "../../services/AdminServices"; // Import admin services
import Modal from '../components/Modal'; // <-- 1. Import the new Modal component

// Define department options
const departmentOptions = [
  // ... (same options)
  "Not Assigned",
  "Infrastructure",
  "Utilities",
  "Security",
  "Maintenance",
  "IT Services",
  "Administration",
  "Hostel Management",
  "Other"
];

// Define status options
const statusOptions = [
  // ... (same options)
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

// Define priority options
const priorityOptions = [
  // ... (same options)
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const AdminComplaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allComplaints, setAllComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for assigning/updating
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: "Not Assigned",
    status: "pending",
    priority: "low",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all complaints on component mount
  useEffect(() => {
    // ... (same logic)
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const data = await getAllComplaints();
        setAllComplaints(data || []);
        setError(null);
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch complaints:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    // ... (same logic)
    switch (status) {
      case 'pending': return 'bg-amber-100/80 text-amber-700 border-amber-200/60';
      case 'in-progress': return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
      case 'resolved': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60';
      case 'rejected': return 'bg-red-100/80 text-red-700 border-red-200/60';
      default: return 'bg-gray-100/80 text-gray-700 border-gray-200/60';
    }
  };

  const getPriorityColor = (priority) => {
    // ... (same logic)
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100/80';
      case 'medium': return 'text-amber-800 bg-amber-100/80';
      case 'low': return 'text-green-800 bg-green-100/80';
      default: return 'text-gray-600 bg-gray-100/60';
    }
  };

  const getStatusStats = () => {
    // ... (same logic)
    const stats = allComplaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allComplaints.length,
      pending: stats.pending || 0,
      inProgress: stats['in-progress'] || 0,
      resolved: stats.resolved || 0
    };
  };

  // --- Assignment Modal Handlers ---
  const handleAssignModalOpen = (complaint) => {
    // ... (same logic)
    setSelectedComplaint(complaint);
    setAssignmentData({
      assigned_to: complaint.assigned_to || "Not Assigned",
      status: complaint.status,
      priority: complaint.priority || "low",
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignModalClose = () => {
    // ... (same logic)
    setIsAssignModalOpen(false);
    setSelectedComplaint(null);
    setIsUpdating(false);
    setAssignmentData({
      assigned_to: "Not Assigned",
      status: "pending",
      priority: "low",
    });
  };

  const handleAssignmentInputChange = (e) => {
    // ... (same logic)
    const { name, value } = e.target;
    setAssignmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignmentSubmit = async (e) => {
    // ... (same logic)
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    try {
      const updatedComplaint = await updateComplaint(
        selectedComplaint.complaint_id, 
        assignmentData
      );
      
      // Update the complaint in the local state
      setAllComplaints(prevComplaints =>
        prevComplaints.map(c =>
          c.complaint_id === updatedComplaint.complaint_id ? updatedComplaint : c
        )
      );
      
      alert("Complaint updated successfully!");
      handleAssignModalClose();
    } catch (error) {
      console.error("Failed to update complaint:", error.message);
      alert("Error updating complaint: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  // --- End Modal Handlers ---

  const filteredComplaints = allComplaints.filter(complaint => {
    // ... (same logic)
    const matchesFilter = selectedFilter === 'all' || complaint.status === selectedFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchLower) ||
      complaint.description.toLowerCase().includes(searchLower) ||
      complaint.location.toLowerCase().includes(searchLower) ||
      (complaint.user?.name && complaint.user.name.toLowerCase().includes(searchLower)) ||
      (complaint.assigned_to && complaint.assigned_to.toLowerCase().includes(searchLower));
      
    return matchesFilter && matchesSearch;
  });

  const stats = getStatusStats();
  const filterOptions = [
    // ... (same logic)
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { value: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  if (isLoading) {
    // ... (same logic)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    // ... (same logic)
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ... (same logic) */}
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
        {/* ... (same logic) */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, location, user, department..."
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
            <div key={complaint.complaint_id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 hover:shadow-lg transition-all duration-200 card-hover">
              {/* ... (same card content) ... */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{complaint.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{complaint.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center font-['Inter']">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">User:</span>
                      <span className="ml-1">{complaint.user ? complaint.user.name : `ID: ${complaint.user_id}`}</span>
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <MapPin className="w-4 h-4 mr-2" />
                      {complaint.location}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">ID:</span>
                      <span className="ml-1">{complaint.complaint_id}</span>
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <ClipboardEdit className="w-4 h-4 mr-2" />
                      <span className="font-medium">Assigned:</span>
                      <span className="ml-1">{complaint.assigned_to || 'Not Assigned'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 bg-white/40 px-2 py-1 rounded-lg font-['Inter'] backdrop-blur-sm">
                        {complaint.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleAssignModalOpen(complaint)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium font-['Inter'] flex items-center group bg-emerald-50/50 hover:bg-emerald-100/60 px-3 py-1 rounded-lg transition-colors"
                        >
                          <ClipboardEdit className="w-4 h-4 mr-1.5" />
                          Assign / Update
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
            {/* ... (same empty state content) ... */}
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' ? 'No complaints found' : 'No complaints received yet'}
            </h3>
            <p className="text-gray-600 mb-6 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "When students submit complaints, they will appear here."
              }
            </p>
          </div>
        )}
      </div>

      {/* 2. Replace the old modal structure with the new Modal component */}
      <Modal isOpen={isAssignModalOpen} onClose={handleAssignModalClose}>
        {selectedComplaint && (
          <>
            {/* The modal content (header, form) is now placed *inside* the Modal component.
              The .modal-center class from modal.css will provide the white
              background, border-radius, and max-width.
            */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
                Update Complaint #{selectedComplaint.complaint_id}
              </h2>
              <button
                onClick={handleAssignModalClose}
                disabled={isUpdating}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
              <p className="text-gray-700 font-['Inter'] border-l-4 border-emerald-300 pl-3 py-1 bg-emerald-50/50 rounded-r-md">
                <strong>Title:</strong> {selectedComplaint.title}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Assign to Department
                </label>
                <select
                  name="assigned_to"
                  value={assignmentData.assigned_to}
                  onChange={handleAssignmentInputChange}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                >
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Set Status
                </label>
                <select
                  name="status"
                  value={assignmentData.status}
                  onChange={handleAssignmentInputChange}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Set Priority
                </label>
                <select
                  name="priority"
                  value={assignmentData.priority}
                  onChange={handleAssignmentInputChange}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleAssignModalClose}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Update Complaint"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaints;