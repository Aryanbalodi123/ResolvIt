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
import { imageToDataUrl } from "../utils/imageToDataUrl";

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
  Image,
} from "lucide-react";

/* ─── Sparkline Component ─── */
const Sparkline = ({ data = [], color = "#065F46", height = 48 }) => {
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
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D1FAE5] focus:border-[#047857] bg-white font-['Inter'] text-sm transition-colors" />
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">{label} {required && "*"}</label>
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D1FAE5] focus:border-[#047857] bg-white font-['Inter'] text-sm transition-colors" />
  </div>
);

const FormSelect = ({ label, name, value, onChange, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">{label} {required && "*"}</label>
    <select name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D1FAE5] focus:border-[#047857] bg-white font-['Inter'] text-sm transition-colors">{children}</select>
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
    title: "", description: "", location: "", priority: "medium", category: "infrastructure", image: "", imageName: "",
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

    const fetchAllData = async ({ showLoading = false } = {}) => {
      if (showLoading) setIsLoading(true);
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
      finally {
        if (showLoading) setIsLoading(false);
      }
    };

    fetchAllData({ showLoading: true });
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
      { title: "My Complaints", value: totalC, subtitle: `${pending} pending, ${inProg} in progress`, icon: FileText, iconBg: "bg-rose-100", iconColor: "text-rose-600", sparkData: genLine(totalC, 1), sparkColor: "#e11d48", cardBg: "bg-rose-50 border-rose-100" },
      { title: "Lost & Found", value: lostItems?.length || 0, subtitle: `${activeLost} active, ${resolvedLost} resolved`, icon: Search, iconBg: "bg-blue-100", iconColor: "text-blue-600", sparkData: genLine(lostItems?.length || 0, 0.8), sparkColor: "#2563eb", cardBg: "bg-blue-50 border-blue-100" },
      { title: "Resolved Cases", value: resolved, subtitle: "All time", icon: CheckCircle, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", sparkData: resolved > 0 ? genLine(resolved, 1.2) : [0,0,0,0,0,0,0,0,0,0,0,0], sparkColor: "#059669", cardBg: "bg-[#ECFDF5] border-[#D1FAE5]" },
    ];
  }, [userComplaints, lostItems]);

  const donutSegments = useMemo(() => {
    const pending = userComplaints?.filter((c) => c.status === "pending").length || 0;
    const inProg = userComplaints?.filter((c) => c.status === "in-progress").length || 0;
    const resolved = userComplaints?.filter((c) => c.status === "resolved").length || 0;
    return [
      { label: "Pending", value: pending, color: "#065F46" },
      { label: "In Progress", value: inProg, color: "#047857" },
      { label: "Resolved", value: resolved, color: "#047857" },
    ];
  }, [userComplaints]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-[#ECFDF5] text-green-700 border border-[#D1FAE5]";
      case "in-progress": return "bg-gray-100 text-gray-600 border border-gray-200";
      case "resolved": return "bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]";
      default: return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const handleComplaintModalOpen = () => setIsComplaintModalOpen(true);
  const handleComplaintModalClose = () => {
    if (isSubmitting) return;
    setIsComplaintModalOpen(false);
    setComplaintFormData({ title: "", description: "", location: "", priority: "medium", category: "infrastructure", image: "", imageName: "" });
  };
  const handleComplaintInputChange = (e) => { const { name, value } = e.target; setComplaintFormData((prev) => ({ ...prev, [name]: value })); };
  const handleComplaintImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setComplaintFormData((prev) => ({ ...prev, image: "", imageName: "" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }

    try {
      const image = await imageToDataUrl(file);
      setComplaintFormData((prev) => ({ ...prev, image, imageName: file.name }));
    } catch (err) {
      console.error("Failed to read complaint image:", err);
      alert("Could not read the selected image.");
    }
  };
  const isOnlyWhitespace = (text) => !text.trim();
  const isOnlyNumbers = (text) => /^[0-9]+$/.test(text.trim());

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const { title, description } = complaintFormData;
    if (isOnlyWhitespace(title) || isOnlyWhitespace(description)) { alert("Title and Description cannot be empty or only spaces."); return; }
    if (isOnlyNumbers(title) || isOnlyNumbers(description)) { alert("Title and Description cannot contain only numbers."); return; }
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 w-full">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-['Inter'] tracking-tight">
            Welcome back, {userDetails?.name || "User"}! <span className="inline-block hover:animate-bounce cursor-default">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 text-base font-['Inter']">Manage your complaints and stay updated on their progress.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleComplaintModalOpen}
            className="flex items-center px-5 py-3 bg-[#065F46] text-white rounded-full hover:bg-[#064E3B] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-['Inter'] font-semibold text-sm">
            <Plus className="w-5 h-5 mr-2" />
            New Complaint
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`rounded-3xl border p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${stat.cardBg}`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-2xl ${stat.iconBg} shadow-inner`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-sm text-gray-600 font-['Inter'] font-bold uppercase tracking-wider">{stat.title}</span>
              </div>
              <p className="text-4xl font-black text-gray-900 font-['Inter'] tracking-tight drop-shadow-sm">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1.5 font-['Inter'] font-medium">{stat.subtitle}</p>
              <Sparkline data={stat.sparkData} color={stat.sparkColor} height={50} />
            </div>
          );
        })}
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Recent Complaints ─── */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 font-['Inter']">Recent Complaints</h2>
            <button onClick={() => navigate("/complaints")}
              className="px-4 py-2 bg-gray-50 text-[#047857] hover:bg-green-50 rounded-full font-bold text-sm font-['Inter'] flex items-center group transition-colors">
              View all <ArrowUpRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto p-2">
            {!Array.isArray(userComplaints) || userComplaints.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-['Inter'] font-medium">No complaints yet. Click the button above to create one.</p>
              </div>
            ) : (
              userComplaints.slice(0, 6).map((complaint) => (
                <div key={complaint.complaint_id} className="p-4 mx-2 my-1 hover:bg-gray-50 rounded-2xl transition-all duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-base font-bold text-gray-900 font-['Inter'] truncate">{complaint.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-500 mb-3 font-['Inter'] line-clamp-2 leading-relaxed">{complaint.description}</p>
                      {complaint.complaint_image && (
                        <a
                          href={complaint.complaint_image}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-3 block overflow-hidden rounded-xl border border-gray-100"
                        >
                          <img
                            src={complaint.complaint_image}
                            alt={`${complaint.title} attachment`}
                            className="h-28 w-full object-cover"
                          />
                        </a>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-400 font-medium">
                        {complaint.location && (
                          <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{complaint.location}
                          </span>
                        )}
                        <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {complaint.priority && (
                          <span className={`flex items-center px-2.5 py-1 rounded-lg ${complaint.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Flag className="w-3.5 h-3.5 mr-1.5" />{complaint.priority} priority
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#065F46] hover:border-[#D1FAE5] hover:bg-[#ECFDF5] rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-8">
          {/* ─── Complaint Status (Donut Chart) ─── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 font-['Inter'] mb-8">Overall Status</h2>
            <div className="flex flex-col items-center justify-center">
              <DonutChart segments={donutSegments} size={180} />
              <div className="w-full grid grid-cols-3 gap-2 mt-8">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 text-center">
                    <span className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: seg.color }}></span>
                    <span className="text-lg font-black text-gray-900 leading-none">{seg.value}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ─── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 font-['Inter'] mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleComplaintModalOpen}
                className="flex flex-col items-center justify-center p-6 bg-rose-50/50 border border-rose-100 rounded-[1.5rem] hover:bg-rose-100 hover:scale-105 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-[13px] font-bold text-gray-900 font-['Inter']">New Complaint</p>
              </button>
              <button onClick={handleLostFoundModalOpen}
                className="flex flex-col items-center justify-center p-6 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] hover:bg-blue-100 hover:scale-105 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-[13px] font-bold text-gray-900 font-['Inter']">Lost & Found</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Image Proof <span className="text-gray-400">(optional)</span></label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 font-['Inter']">
              <Image className="h-4 w-4 text-gray-400" />
              {complaintFormData.imageName || "Upload complaint image"}
              <input type="file" accept="image/*" onChange={handleComplaintImageChange} className="hidden" />
            </label>
            {complaintFormData.image && (
              <img src={complaintFormData.image} alt="Selected complaint proof" className="mt-3 h-32 w-full rounded-xl border border-gray-200 object-cover" />
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={handleComplaintModalClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium font-['Inter'] text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#065F46] text-white rounded-xl hover:bg-[#064E3B] transition-all duration-200 font-medium shadow-sm font-['Inter'] text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
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
            <button onClick={() => setReportType("found")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${reportType === "found" ? "bg-[#065F46] text-white shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-700"}`}>
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
            <button type="submit" disabled={isSubmitting} className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all duration-200 font-medium shadow-sm font-['Inter'] text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center ${reportType === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-[#065F46] hover:bg-[#065F46]"}`}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : reportType === "lost" ? "Report Lost Item" : "Report Found Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
