import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendComplaint } from "../../services/ComplaintServices";
import { retrieveComplaint } from "../../services/ComplaintServices";

import {
  FileText,
  Search,
  CheckCircle,
  Plus,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  ArrowUpRight,
  X,
  Star,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await retrieveComplaint();
        setComplaints(data || []);
        console.log("Fetched complaints:", data);
      } catch (err) {
        console.error("Error fetching complaints:", err.message);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Modal states
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Form data states
  const [complaintFormData, setComplaintFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
    category: "infrastructure",
  });

  const [lostFoundFormData, setLostFoundFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    category: "electronics",
    type: "lost", // lost or found
    contactInfo: "",
    dateOccurred: "",
  });

  const [feedbackFormData, setFeedbackFormData] = useState({
    subject: "",
    category: "general",
    rating: 5,
    message: "",
    contactEmail: "",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100/80 text-orange-700 border-orange-200/60";
      case "in-progress":
        return "bg-pink-100/80 text-pink-700 border-pink-200/60";
      case "resolved":
        return "bg-green-100/80 text-green-700 border-green-200/60";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-200/60";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-rose-600 bg-rose-100/60";
      case "medium":
        return "text-orange-600 bg-orange-100/60";
      case "low":
        return "text-green-600 bg-green-100/60";
      default:
        return "text-gray-600 bg-gray-100/60";
    }
  };

  const stats = [
    {
      title: "My Complaints",
      value: "3",
      subtitle: "1 pending, 1 in progress",
      icon: FileText,
      color: "from-pink-300 to-rose-300",
      bgColor: "bg-pink-100/60",
      textColor: "text-pink-700",
    },
    {
      title: "Lost & Found",
      value: "2",
      subtitle: "1 lost, 1 found item",
      icon: Search,
      color: "from-purple-300 to-indigo-300",
      bgColor: "bg-purple-100/60",
      textColor: "text-purple-700",
    },
    {
      title: "Resolved",
      value: "1",
      subtitle: "This month",
      icon: CheckCircle,
      color: "from-green-300 to-emerald-300",
      bgColor: "bg-green-100/60",
      textColor: "text-green-700",
    },
  ];

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
      status: "pending",
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

  // Modal handlers for Lost & Found
  const handleLostFoundModalOpen = () => {
    setIsLostFoundModalOpen(true);
  };

  const handleLostFoundModalClose = () => {
    setIsLostFoundModalOpen(false);
    setLostFoundFormData({
      itemName: "",
      description: "",
      location: "",
      category: "electronics",
      type: "lost",
      contactInfo: "",
      dateOccurred: "",
    });
  };

  const handleLostFoundInputChange = (e) => {
    const { name, value } = e.target;
    setLostFoundFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLostFoundSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting lost/found item:", lostFoundFormData);
    alert(
      `${
        lostFoundFormData.type === "lost" ? "Lost" : "Found"
      } item reported successfully!\n\nItem: ${
        lostFoundFormData.itemName
      }\nLocation: ${lostFoundFormData.location}\nDate: ${
        lostFoundFormData.dateOccurred
      }`
    );
    handleLostFoundModalClose();
  };

  // Modal handlers for Feedback
  const handleFeedbackModalOpen = () => {
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackModalClose = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackFormData({
      subject: "",
      category: "general",
      rating: 5,
      message: "",
      contactEmail: "",
    });
  };

  const handleFeedbackInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting feedback:", feedbackFormData);
    alert(
      `Feedback submitted successfully!\n\nSubject: ${feedbackFormData.subject}\nRating: ${feedbackFormData.rating}/5 stars\nCategory: ${feedbackFormData.category}`
    );
    handleFeedbackModalClose();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">
              Good Morning, {/*user.name*/}
            </h1>
            <p className="text-gray-600 mt-1 font-['Inter']">
              Welcome back, Manage your complaints and stay updated on their
              progress.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 hover:shadow-lg transition-all duration-200 card-hover"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-xl ${stat.bgColor} backdrop-blur-sm`}
                >
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <span className="text-2xl font-semibold text-gray-800 font-['Inter']">
                  {stat.value}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 font-['Inter']">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 font-['Inter']">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
          {/* Header */}
          <div className="p-6 border-b border-white/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Recent Complaints
              </h2>
              <button className="text-pink-600 hover:text-pink-700 font-medium text-sm font-['Inter'] flex items-center">
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Scrollable section with fixed height */}
          <div className="divide-y divide-white/30 h-80 overflow-y-auto">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* Left side: title, desc, meta */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title */}
                    <h3 className="text-sm font-medium text-gray-800 font-['Inter']">
                      {complaint.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 font-['Inter']">
                      {complaint.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center font-['Inter']">
                        <MapPin className="w-3 h-3 mr-1" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center font-['Inter']">
                        <Clock className="w-3 h-3 mr-1" />
                        {complaint.created_at}
                      </span>
                      {complaint.status !== "pending" && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority} priority
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: status badge */}
                  <span
                    className={`px-2 py-0.5 ml-4 rounded-lg text-xs font-medium border ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white/40 backdrop-blur-sm h-full rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleComplaintModalOpen}
                className="w-full p-4 bg-gradient-to-r from-pink-300 to-rose-300 text-white rounded-xl hover:from-pink-400 hover:to-rose-400 transition-all duration-200 text-left shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">
                      New Complaint
                    </div>
                    <div className="text-xs text-white/80 font-['Inter']">
                      Report a new issue
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleLostFoundModalOpen}
                className="w-full p-4 bg-gradient-to-r from-purple-300 to-indigo-300 text-white rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 text-left shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">
                      Report Lost Item
                    </div>
                    <div className="text-xs text-white/80 font-['Inter']">
                      Add to lost & found
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleFeedbackModalOpen}
                className="w-full p-4 bg-white/30 border border-white/40 text-gray-700 rounded-xl hover:bg-white/40 transition-colors text-left backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">
                      Send Feedback
                    </div>
                    <div className="text-xs text-gray-600 font-['Inter']">
                      Share your thoughts
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Lost & Found Modal */}
      {isLostFoundModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Lost & Found Report
              </h2>
              <button
                onClick={handleLostFoundModalClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLostFoundSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="lost"
                      checked={lostFoundFormData.type === "lost"}
                      onChange={handleLostFoundInputChange}
                      className="mr-2 text-purple-600 focus:ring-purple-300"
                    />
                    <span className="font-['Inter'] text-sm">Lost Item</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="found"
                      checked={lostFoundFormData.type === "found"}
                      onChange={handleLostFoundInputChange}
                      className="mr-2 text-purple-600 focus:ring-purple-300"
                    />
                    <span className="font-['Inter'] text-sm">Found Item</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={lostFoundFormData.itemName}
                    onChange={handleLostFoundInputChange}
                    placeholder="Item name"
                    required
                    className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter'] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                    Category
                  </label>
                  <select
                    name="category"
                    value={lostFoundFormData.category}
                    onChange={handleLostFoundInputChange}
                    className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter'] text-sm"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="books">Books/Documents</option>
                    <option value="keys">Keys</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={lostFoundFormData.location}
                    onChange={handleLostFoundInputChange}
                    placeholder="Where?"
                    required
                    className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter'] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOccurred"
                    value={lostFoundFormData.dateOccurred}
                    onChange={handleLostFoundInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter'] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                  Contact Information <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={lostFoundFormData.contactInfo}
                  onChange={handleLostFoundInputChange}
                  placeholder="Phone number or email"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter'] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter']">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={lostFoundFormData.description}
                  onChange={handleLostFoundInputChange}
                  placeholder="Brief description of the item"
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter'] text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={handleLostFoundModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter'] text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-300 to-indigo-300 text-white rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 font-medium shadow-md font-['Inter'] text-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
                Send Feedback
              </h2>
              <button
                onClick={handleFeedbackModalClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={feedbackFormData.subject}
                  onChange={handleFeedbackInputChange}
                  placeholder="What is your feedback about?"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Category
                </label>
                <select
                  name="category"
                  value={feedbackFormData.category}
                  onChange={handleFeedbackInputChange}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="ui-ux">UI/UX Improvement</option>
                  <option value="performance">Performance Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFeedbackFormData((prev) => ({
                          ...prev,
                          rating: star,
                        }))
                      }
                      className={`p-1 transition-colors ${
                        star <= feedbackFormData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackFormData.rating ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 font-['Inter']">
                    {feedbackFormData.rating}/5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={feedbackFormData.message}
                  onChange={handleFeedbackInputChange}
                  placeholder="Please share your detailed feedback..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter']"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={feedbackFormData.contactEmail}
                  onChange={handleFeedbackInputChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleFeedbackModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/60 border border-gray-300/60 rounded-xl hover:bg-gray-200/60 transition-colors font-medium font-['Inter']"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-300 to-indigo-300 text-white rounded-xl hover:from-blue-400 hover:to-indigo-400 transition-all duration-200 font-medium shadow-md font-['Inter']"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
