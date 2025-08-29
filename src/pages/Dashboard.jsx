import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendComplaint } from "../../services/ComplaintServices";

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
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
    category: "infrastructure",
  });

  const recentComplaints = [
    {
      id: "C001",
      title: "Street Light Not Working",
      status: "pending",
      priority: "medium",
      date: "2024-08-15",
      location: "Main Street, Block A",
      description:
        "Street light has been out for 3 days, causing safety concerns",
      timeAgo: "3 days ago",
    },
    {
      id: "C002",
      title: "Water Supply Issue",
      status: "in-progress",
      priority: "high",
      date: "2024-08-12",
      location: "Park Avenue, Sector 5",
      description: "Inconsistent water supply for the past week",
      timeAgo: "6 days ago",
    },
    {
      id: "C003",
      title: "Noise Complaint",
      status: "resolved",
      priority: "low",
      date: "2024-08-08",
      location: "Green Valley Apartments",
      description: "Construction noise during restricted hours",
      timeAgo: "1 week ago",
    },
  ];

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

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      priority: "medium",
      category: "infrastructure",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("token") || "{}");

    const payload = {
      user_id: user.rollNumber ?? null,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      priority: formData.priority,
      category: formData.category,
      status: "pending",
      isResolved: false,
    };

    try {
      const data = await sendComplaint(payload);
      console.log("Complaint saved:", data);
      alert("Complaint submitted successfully!");
      handleModalClose();
    } catch (error) {
      console.error("Failed to send complaint:", error.message);
      alert("Error submitting complaint: " + error.message);
    }

    e.preventDefault();
    // Dummy submit handler
    console.log("Submitting complaint:", formData);
    alert(
      `Complaint submitted successfully!\n\nTitle: ${formData.title}\nCategory: ${formData.category}\nPriority: ${formData.priority}\nLocation: ${formData.location}\nDescription: ${formData.description}`
    );
    handleModalClose();
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
              Welcome back, Manage your complaints and stay updated on
              their progress.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-xl transition-colors backdrop-blur-sm">
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleModalOpen}
              className="bg-gradient-to-r from-pink-300 to-rose-300 text-white px-4 py-2 rounded-xl font-medium hover:from-pink-400 hover:to-rose-400 transition-all duration-200 shadow-md font-['Inter']"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              New Complaint
            </button>
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
            {recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-800 font-['Inter']">
                        {complaint.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-['Inter']">
                      {complaint.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center font-['Inter']">
                        <MapPin className="w-3 h-3 mr-1" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center font-['Inter']">
                        <Clock className="w-3 h-3 mr-1" />
                        {complaint.timeAgo}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleModalOpen}
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

              <button className="w-full p-4 bg-gradient-to-r from-purple-300 to-indigo-300 text-white rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 text-left shadow-md">
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

              <button className="w-full p-4 bg-white/30 border border-white/40 text-gray-700 rounded-xl hover:bg-white/40 transition-colors text-left backdrop-blur-sm">
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-xl font-semibold text-gray-800 font-['Inter']">
                New Complaint
              </h2>
              <button
                onClick={handleModalClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of the issue"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Street address or area"
                  required
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm font-['Inter']"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the issue"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm resize-none font-['Inter']"
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
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

export default Dashboard;
