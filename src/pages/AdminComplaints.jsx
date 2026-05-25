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
  Loader2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { getAllComplaints, updateComplaint } from "../../services/AdminServices"; 
import Modal from '../components/Modal';

const departmentOptions = [
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

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const AdminComplaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [allComplaints, setAllComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: "Not Assigned",
    status: "pending",
    priority: "low",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100/80 text-amber-700 border-amber-200/60';
      case 'in-progress': return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
      case 'resolved': return 'bg-green-100/80 text-green-700 border-[#A7F3D0]/60';
      case 'rejected': return 'bg-red-100/80 text-red-700 border-red-200/60';
      default: return 'bg-gray-100/80 text-gray-700 border-gray-200/60';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800 bg-red-100/80';
      case 'medium': return 'text-amber-800 bg-amber-100/80';
      case 'low': return 'text-green-800 bg-green-100/80';
      default: return 'text-gray-600 bg-gray-100/60';
    }
  };

  const getStatusStats = () => {
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

  const handleAssignModalOpen = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignmentData({
      assigned_to: complaint.assigned_to || "Not Assigned",
      status: complaint.status,
      priority: complaint.priority || "low",
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignModalClose = () => {
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
    const { name, value } = e.target;
    setAssignmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    try {
      const updatedComplaint = await updateComplaint(
        selectedComplaint.complaint_id, 
        assignmentData
      );
      
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

  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesFilter = selectedFilter === 'all' || complaint.status === selectedFilter;
    
    if (!debouncedSearchQuery) return matchesFilter;

    const searchLower = debouncedSearchQuery.toLowerCase();
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchLower) ||
      complaint.description.toLowerCase().includes(searchLower) ||
      complaint.location.toLowerCase().includes(searchLower) ||
      (complaint.user?.name && complaint.user.name.toLowerCase().includes(searchLower)) ||
      (complaint.assigned_to && complaint.assigned_to.toLowerCase().includes(searchLower)) ||
      String(complaint.complaint_id).includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  const stats = getStatusStats();
  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { value: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-[#047857] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 w-full min-h-screen bg-[#F5F5F5] space-y-8">

      {/* Header & Hero Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-gray-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-['Inter'] mb-2">
              Complaint Management
            </h1>
            <p className="text-gray-400 font-['Inter'] max-w-lg text-sm leading-relaxed">
              Overview and manage all student complaints. Prioritize infrastructure issues, assign tickets to specific departments, and update statuses to keep the campus running smoothly.
            </p>
          </div>
        </div>

        {/* Stats Grid Widget */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {filterOptions.map((option) => {
            const isSelected = selectedFilter === option.value;
            let iconColor = "text-gray-400";
            if (option.value === 'pending') iconColor = "text-amber-500";
            if (option.value === 'in-progress') iconColor = "text-blue-500";
            if (option.value === 'resolved') iconColor = "text-emerald-500";
            
            return (
              <div
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`rounded-[1.5rem] p-5 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-gray-900 bg-gray-100 shadow-md ring-1 ring-gray-900/20' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
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
                <div className={`text-4xl font-black font-['Inter'] ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
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
          placeholder="Search complaints by title, user, location, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-4 py-2 bg-transparent border-none focus:ring-0 text-gray-800 font-['Inter'] outline-none placeholder-gray-400"
        />
      </div>

      {/* Full Width Row Data Cards */}
      <div className="space-y-4 pb-12">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => {
            let statusBorder = "border-l-gray-300";
            if(complaint.status === "pending") statusBorder = "border-l-amber-500";
            if(complaint.status === "in-progress") statusBorder = "border-l-blue-500";
            if(complaint.status === "resolved") statusBorder = "border-l-emerald-500";
            if(complaint.status === "rejected") statusBorder = "border-l-red-500";

            return (
              <div 
                key={complaint.complaint_id} 
                className={`bg-white rounded-2xl border border-gray-100 border-l-[6px] ${statusBorder} p-5 hover:shadow-lg transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group`}
              >
                {/* Left side: Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 font-['Inter'] uppercase tracking-wider">
                      #{String(complaint.complaint_id).substring(0, 8)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getPriorityColor(complaint.priority)} shadow-sm`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusColor(complaint.status)} border-0`}>
                      {complaint.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black text-gray-900 font-['Inter'] mb-1 line-clamp-1">{complaint.title}</h3>
                  <p className="text-gray-500 text-sm font-['Inter'] line-clamp-1 leading-relaxed mb-4">{complaint.description}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span className="truncate max-w-[120px]">{complaint.user ? complaint.user.name : `ID: ${complaint.user_id}`}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span className="truncate max-w-[150px]">{complaint.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Right side: Action & Assignment */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                  <div className="flex flex-col items-start lg:items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Dept</span>
                    <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                      {complaint.assigned_to || 'Unassigned'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleAssignModalOpen(complaint)}
                    className="text-[#065F46] bg-emerald-50 hover:bg-[#065F46] hover:text-white text-xs font-bold font-['Inter'] flex items-center px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <ClipboardEdit className="w-4 h-4 mr-2" />
                    Manage Ticket
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' ? 'No records match' : 'No complaints received yet'}
            </h3>
            <p className="text-gray-500 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "When students submit complaints, they will appear here."
              }
            </p>
          </div>
        )}
      </div>

      {}
      <Modal isOpen={isAssignModalOpen} onClose={handleAssignModalClose}>
        {selectedComplaint && (
          <>
            {}
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
              <p className="text-gray-700 font-['Inter'] border-l-4 border-green-300 pl-3 py-1 bg-[#ECFDF5]/50 rounded-r-md">
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
                  className="flex-1 px-4 py-2 bg-green-400 text-white rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-200 font-medium shadow-md font-['Inter'] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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