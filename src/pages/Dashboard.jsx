import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  reportLostItem,
  reportFoundItem,
} from "../../services/LostFoundServices";
import {
  sendComplaint,
  retrieveComplaint,
} from "../../services/ComplaintServices";
import {
  getUserDetails,
  getUserComplaints,
  getUserLostItems,
} from "../../services/UserServices";
import "./Dashboard.css";
import Modal from "../components/Modal";

import {
  FileText,
  Search,
  CheckCircle,
  Plus,
  MessageSquare,
  MapPin,
  Clock,
  AlertTriangle,
  TrendingUp,
  Eye,
  ArrowUpRight,
  X,
  Loader2,
  Package,
  PackageOpen,
  Flag,
  Bell,
} from "lucide-react";

/* ─── Sparkline Component ─── */
const Sparkline = ({ data = [], color = "#F97316", height = 48 }) => {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 70 - 15;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height }} className="mt-3">
      <defs>
        <linearGradient id={`ugrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill={`url(#ugrad-${color.replace("#", "")})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Donut Chart Component ─── */
const DonutChart = ({ segments, size = 150 }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0)
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 font-['Inter']">0</p>
          <p className="text-xs text-gray-400 font-['Inter']">Total</p>
        </div>
      </div>
    );
  const radius = 55;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
      {segments.filter((s) => s.value > 0).map((segment, i) => {
        const strokeLength = (segment.value / total) * circumference;
        const gap = 2;
        const currentOffset = accumulatedOffset;
        accumulatedOffset += strokeLength;
        return (
          <circle
            key={i} cx="80" cy="80" r={radius} fill="none" stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(strokeLength - gap, 0)} ${circumference - Math.max(strokeLength - gap, 0)}`}
            strokeDashoffset={-currentOffset} strokeLinecap="round" transform="rotate(-90 80 80)"
            className="transition-all duration-700 ease-out"
          />
        );
      })}
      <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827" fontFamily="Inter, sans-serif">{total}</text>
      <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter, sans-serif">Total</text>
    </svg>
  );
};

/* ─── Form Components ─── */
const FormInput = ({ label, name, value, onChange, placeholder, required, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">{label} {required && "*"}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white font-['Inter'] text-sm transition-colors" />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">{label} {required && "*"}</label>
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white font-['Inter'] text-sm transition-colors" />
  </div>
);

const FormSelect = ({ label, name, value, onChange, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">{label} {required && "*"}</label>
    <select name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white font-['Inter'] text-sm transition-colors">{children}</select>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [userComplaints, setUserComplaints] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState("lost");

  const [complaintFormData, setComplaintFormData] = useState({
    title: "", description: "", location: "", priority: "medium", category: "infrastructure",
  });
  const [lostFoundFormData, setLostFoundFormData] = useState({
    title: "", description: "", location: "", category: "Personal Items", contactDetails: "", date: "", distinguishingFeatures: "",
  });
  const [feedbackFormData, setFeedbackFormData] = useState({
    subject: "", category: "general", rating: 5, message: "", contactEmail: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userInfo = {};
    try {
      userInfo = {
        email: localStorage.getItem("email") || "", joinDate: localStorage.getItem("joinDate") || "",
        name: localStorage.getItem("name") || "", resolvedComplaints: localStorage.getItem("resolvedComplaints") || 0,
        role: localStorage.getItem("role") || "", rollNumber: localStorage.getItem("rollNumber") || "",
        token: localStorage.getItem("token") || "", totalComplaints: localStorage.getItem("totalComplaints") || 0,
      };
    } catch (e) { console.error("Error building user info:", e); userInfo = {}; }

    if (!token || !userInfo.rollNumber) { navigate("/login", { replace: true }); return; }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const userId = userInfo.rollNumber;
        const [userDetailsData, userComplaintsData, userLostItemsData] = await Promise.all([
          getUserDetails(userId), getUserComplaints(userId), getUserLostItems(userId),
        ]);
        if (userDetailsData) setUserDetails(userDetailsData);
        if (Array.isArray(userComplaintsData)) setUserComplaints(userComplaintsData);
        if (Array.isArray(userLostItemsData)) setLostItems(userLostItemsData);
        const complaintsData = await retrieveComplaint();
        if (Array.isArray(complaintsData)) setComplaints(complaintsData);
      } catch (err) { console.error("Error fetching data:", err.message); }
      finally { setIsLoading(false); }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const stats = useMemo(() => {
    const pending = userComplaints?.filter((c) => c.status === "pending").length || 0;
    const inProg = userComplaints?.filter((c) => c.status === "in-progress").length || 0;
    const resolved = userComplaints?.filter((c) => c.status === "resolved").length || 0;
    const totalC = userComplaints?.length || 0;
    const activeLost = lostItems?.filter((item) => !item.isResolved).length || 0;
    const resolvedLost = lostItems?.filter((item) => item.isResolved).length || 0;

    const genLine = (val, trend = 1) => {
      const pts = [];
      for (let i = 0; i < 12; i++) pts.push(Math.max(0, val * (0.3 + (i / 11) * 0.7 * trend) + Math.sin(i * 0.8) * (val * 0.1)));
      return pts;
    };

    return [
      { title: "My Complaints", value: totalC, subtitle: `${pending} pending, ${inProg} in progress`, icon: FileText, iconBg: "bg-orange-50", iconColor: "text-orange-500", sparkData: genLine(totalC, 1), sparkColor: "#F97316" },
      { title: "Lost & Found", value: lostItems?.length || 0, subtitle: `${activeLost} active, ${resolvedLost} resolved`, icon: Search, iconBg: "bg-blue-50", iconColor: "text-blue-500", sparkData: genLine(lostItems?.length || 0, 0.8), sparkColor: "#3B82F6" },
      { title: "Resolved Cases", value: resolved, subtitle: "All time", icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", sparkData: resolved > 0 ? genLine(resolved, 1.2) : [0,0,0,0,0,0,0,0,0,0,0,0], sparkColor: "#22C55E" },
    ];
  }, [userComplaints, lostItems]);

  const donutSegments = useMemo(() => {
    const pending = userComplaints?.filter((c) => c.status === "pending").length || 0;
    const inProg = userComplaints?.filter((c) => c.status === "in-progress").length || 0;
    const resolved = userComplaints?.filter((c) => c.status === "resolved").length || 0;
    return [
      { label: "Pending", value: pending, color: "#F97316" },
      { label: "In Progress", value: inProg, color: "#FB923C" },
      { label: "Resolved", value: resolved, color: "#22C55E" },
    ];
  }, [userComplaints]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-orange-50 text-orange-600 border border-orange-100";
      case "in-progress": return "bg-gray-100 text-gray-600 border border-gray-200";
      case "resolved": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default: return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const handleComplaintModalOpen = () => setIsComplaintModalOpen(true);
  const handleComplaintModalClose = () => {
    if (isSubmitting) return;
    setIsComplaintModalOpen(false);
    setComplaintFormData({ title: "", description: "", location: "", priority: "medium", category: "infrastructure" });
  };
  const handleComplaintInputChange = (e) => { const { name, value } = e.target; setComplaintFormData((prev) => ({ ...prev, [name]: value })); };
  const isOnlyWhitespace = (text) => !text.trim();
  const isOnlyNumbers = (text) => /^[0-9]+$/.test(text.trim());

  const handleComplaintSubmit = async (e) => {
    const { title, description } = complaintFormData;
    if (isOnlyWhitespace(title) || isOnlyWhitespace(description)) { alert("Title and Description cannot be empty or only spaces."); return; }
    if (isOnlyNumbers(title) || isOnlyNumbers(description)) { alert("Title and Description cannot contain only numbers."); return; }
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("token") || "{}");
      if (!userInfo.rollNumber) throw new Error("User not authenticated");
      await sendComplaint({ user_id: userInfo.rollNumber, ...complaintFormData, status: "pending" });
      handleComplaintModalClose();
      const updatedComplaints = await getUserComplaints(userInfo.rollNumber);
      if (Array.isArray(updatedComplaints)) setUserComplaints(updatedComplaints);
    } catch (err) { console.error("Error submitting complaint:", err); alert("Failed to submit complaint. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleLostFoundModalOpen = () => setIsLostFoundModalOpen(true);
  const handleLostFoundModalClose = () => {
    if (isSubmitting) return;
    setIsLostFoundModalOpen(false);
    setReportType("lost");
    setLostFoundFormData({ title: "", description: "", location: "", category: "Personal Items", contactDetails: "", date: "", distinguishingFeatures: "" });
  };
  const handleLostFoundInputChange = (e) => { const { name, value } = e.target; setLostFoundFormData((prev) => ({ ...prev, [name]: value })); };

  const handleLostFoundSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("token") || "{}");
      if (!userInfo.rollNumber) throw new Error("User not authenticated");
      let payload = { user_id: userInfo.rollNumber, title: lostFoundFormData.title, description: lostFoundFormData.description, location: lostFoundFormData.location, category: lostFoundFormData.category, contactDetails: lostFoundFormData.contactDetails };
      if (reportType === "lost") { payload.dateLost = lostFoundFormData.date; payload.distinguishingFeatures = lostFoundFormData.distinguishingFeatures; await reportLostItem(payload); }
      else { payload.dateFound = lostFoundFormData.date; await reportFoundItem(payload); }
      alert(`Successfully reported ${reportType} item!`);
      handleLostFoundModalClose();
      const updatedLostItems = await getUserLostItems(userInfo.rollNumber);
      if (Array.isArray(updatedLostItems)) setLostItems(updatedLostItems);
    } catch (err) { console.error(`Failed to report ${reportType} item:`, err.message); alert(`Error: ${err.message}`); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 font-['Inter'] tracking-tight">
            Welcome back, {userDetails?.name || "User"}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-['Inter']">Manage your complaints and stay updated on their progress.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 space-x-2 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-['Inter'] flex-1">Search...</span>
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded font-['Inter']">⌘K</kbd>
          </div>
          <button className="relative p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-[18px] h-[18px] text-gray-500" />
          </button>
          <button onClick={handleComplaintModalOpen}
            className="flex items-center px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md font-['Inter'] font-medium text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`w-[18px] h-[18px] ${stat.iconColor}`} />
                </div>
                <span className="text-sm text-gray-500 font-['Inter'] font-medium">{stat.title}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-['Inter'] tracking-tight">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-['Inter']">{stat.subtitle}</p>
              <Sparkline data={stat.sparkData} color={stat.sparkColor} height={44} />
            </div>
          );
        })}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Recent Complaints ─── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 font-['Inter']">Recent Complaints</h2>
            <button onClick={() => navigate("/complaints")}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm font-['Inter'] flex items-center group">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
            {!Array.isArray(userComplaints) || userComplaints.length === 0 ? (
              <div className="p-10 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm font-['Inter']">No complaints yet. Click the button above to create one.</p>
              </div>
            ) : (
              userComplaints.slice(0, 6).map((complaint) => (
                <div key={complaint.complaint_id} className="px-6 py-4 hover:bg-gray-50/60 transition-colors duration-150 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <h3 className="text-sm font-semibold text-gray-900 font-['Inter']">{complaint.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-400 mb-2.5 font-['Inter'] line-clamp-1">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-400">
                        {complaint.location && (
                          <span className="flex items-center font-['Inter']">
                            <MapPin className="w-3 h-3 mr-1 text-gray-300" />{complaint.location}
                          </span>
                        )}
                        <span className="flex items-center font-['Inter']">
                          <Clock className="w-3 h-3 mr-1 text-gray-300" />{new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                        {complaint.priority && (
                          <span className={`flex items-center font-['Inter'] font-medium ${complaint.priority === 'high' ? 'text-red-500' : complaint.priority === 'medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                            <Flag className="w-3 h-3 mr-1" />{complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)} priority
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-6">
          {/* ─── Complaint Status (Donut Chart) ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 font-['Inter'] mb-5">My Complaint Status</h2>
            <div className="flex items-center justify-between">
              <DonutChart segments={donutSegments} size={140} />
              <div className="space-y-3 ml-4">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span className="text-xs text-gray-500 font-['Inter']">{seg.label}</span>
                    <span className="text-xs font-semibold text-gray-800 font-['Inter'] ml-auto pl-3">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 font-['Inter'] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleComplaintModalOpen}
                className="flex flex-col items-center text-center p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 transition-all duration-200 group">
                <div className="p-2.5 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors duration-200 mb-2">
                  <Plus className="w-[18px] h-[18px] text-orange-500" />
                </div>
                <p className="text-[12px] font-semibold text-gray-800 font-['Inter']">New Complaint</p>
                <p className="text-[10px] text-gray-400 font-['Inter'] mt-0.5">Report an issue</p>
              </button>
              <button onClick={handleLostFoundModalOpen}
                className="flex flex-col items-center text-center p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 transition-all duration-200 group">
                <div className="p-2.5 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200 mb-2">
                  <Search className="w-[18px] h-[18px] text-blue-500" />
                </div>
                <p className="text-[12px] font-semibold text-gray-800 font-['Inter']">Lost & Found</p>
                <p className="text-[10px] text-gray-400 font-['Inter'] mt-0.5">Report an item</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Complaint Modal ─── */}
      <Modal isOpen={isComplaintModalOpen} onClose={handleComplaintModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">New Complaint</h2>
          <button onClick={handleComplaintModalClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4">
          <FormInput label="Title" name="title" value={complaintFormData.title} onChange={handleComplaintInputChange} placeholder="e.g., Broken streetlight on main road" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect label="Category" name="category" value={complaintFormData.category} onChange={handleComplaintInputChange}>
              <option value="infrastructure">Infrastructure</option><option value="utilities">Utilities</option><option value="safety">Safety</option><option value="hostel">Hostel</option><option value="maintenance">Maintenance</option><option value="other">Other</option>
            </FormSelect>
            <FormSelect label="Priority" name="priority" value={complaintFormData.priority} onChange={handleComplaintInputChange}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </FormSelect>
          </div>
          <FormInput label="Location" name="location" value={complaintFormData.location} onChange={handleComplaintInputChange} placeholder="e.g., Outside 'A' Block, near library" required />
          <FormTextarea label="Description" name="description" value={complaintFormData.description} onChange={handleComplaintInputChange} placeholder="Provide as much detail as possible..." required />
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={handleComplaintModalClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium font-['Inter'] text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 font-medium shadow-sm font-['Inter'] text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Complaint"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Lost & Found Modal ─── */}
      <Modal isOpen={isLostFoundModalOpen} onClose={handleLostFoundModalClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">Report an Item</h2>
          <button onClick={handleLostFoundModalClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pb-0">
          <div className="flex bg-gray-50 rounded-xl p-1 space-x-1">
            <button onClick={() => setReportType("lost")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${reportType === "lost" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-700"}`}>
              <Package className="w-4 h-4" /><span>I Lost Something</span>
            </button>
            <button onClick={() => setReportType("found")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${reportType === "found" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-700"}`}>
              <PackageOpen className="w-4 h-4" /><span>I Found Something</span>
            </button>
          </div>
        </div>
        <form onSubmit={handleLostFoundSubmit} className="p-6 space-y-4">
          <FormInput label="Item Title" name="title" value={lostFoundFormData.title} onChange={handleLostFoundInputChange} placeholder="e.g., Black Leather Wallet" required />
          <FormTextarea label="Description" name="description" value={lostFoundFormData.description} onChange={handleLostFoundInputChange} placeholder="Brand, color, contents..." required />
          {reportType === "lost" && <FormInput label="Distinguishing Features" name="distinguishingFeatures" value={lostFoundFormData.distinguishingFeatures} onChange={handleLostFoundInputChange} placeholder="e.g., 'A' monogram, scratch on corner" />}
          <FormInput label={reportType === "lost" ? "Last Known Location" : "Location Found"} name="location" value={lostFoundFormData.location} onChange={handleLostFoundInputChange} placeholder="e.g., Library 2nd Floor" required />
          <FormInput label={reportType === "lost" ? "Date Lost" : "Date Found"} name="date" value={lostFoundFormData.date} onChange={handleLostFoundInputChange} type="date" required />
          <FormSelect label="Category" name="category" value={lostFoundFormData.category} onChange={handleLostFoundInputChange} required>
            <option>Personal Items</option><option>Electronics</option><option>Apparel</option><option>Documents</option><option>Other</option>
          </FormSelect>
          <FormInput label="Your Contact Details" name="contactDetails" value={lostFoundFormData.contactDetails} onChange={handleLostFoundInputChange} placeholder="Your email or phone number" required />
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={handleLostFoundModalClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium font-['Inter'] text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all duration-200 font-medium shadow-sm font-['Inter'] text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center ${reportType === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : reportType === "lost" ? "Report Lost Item" : "Report Found Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
