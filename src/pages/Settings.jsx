import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit3,
  Camera,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Save,
  X,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { getUserDetails, getUserComplaints } from "../../services/UserServices";
import { supabase } from "../../lib/SupabaseClient";

const Settings = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    joinDate: "",
    totalComplaints: 0,
    resolvedComplaints: 0,
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("rollNumber");

    if (!token || !userId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserDetails(userId);

        const complaintsData = await getUserComplaints(userId);
        const totalComplaints = complaintsData?.length || 0;
        const resolvedComplaints = complaintsData?.filter(
          (c) => c.status?.toLowerCase() === "resolved"
        ).length;

        const formattedProfile = {
          name: userData?.name || "User",
          email: userData?.email || "Not provided",
          joinDate: new Date(userData?.created_at).toLocaleDateString() || "N/A",
          totalComplaints,
          resolvedComplaints,
        };

        setUserProfile(formattedProfile);
        setEditedProfile(formattedProfile);

        Object.entries(formattedProfile).forEach(([key, value]) =>
          localStorage.setItem(key, value)
        );
      } catch (err) {
        console.error("Error fetching user info:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("users")
        .update({
          name: editedProfile.name,
          email: editedProfile.email,
        })
        .eq("rollNumber", localStorage.getItem("rollNumber"));

      if (error) throw error;

      setUserProfile(editedProfile);
      setIsEditing(false);
      alert("Profile updated successfully ✅");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-700 font-['Inter']">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">
            Settings
          </h1>
          <p className="text-gray-600 mt-1 font-['Inter']">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* ---------- Profile Section ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
          <div className="p-6 border-b border-white/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter'] flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm font-['Inter'] flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-3 py-1 rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-green-600 transition-all duration-200 font-['Inter'] flex items-center shadow-md"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white/30 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium hover:bg-white/40 transition-colors font-['Inter'] flex items-center backdrop-blur-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-10 h-10 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-400 to-green-500 text-white p-2 rounded-full hover:from-emerald-500 hover:to-green-600 transition-all duration-200 shadow-md">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 font-['Inter']">
                  {userProfile.name}
                </h3>
              
              </div>
            </div>

            {/* Editable Info */}
            {["name", "email"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter'] capitalize">
                  {field === "email"
                    ? "Email Address"
                    : "Full Name"}
                </label>
                {isEditing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={editedProfile[field]}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-white/20 rounded-xl font-['Inter'] backdrop-blur-sm">
                    {field === "email" ? (
                      <Mail className="w-4 h-4 mr-3 text-gray-500" />
                    ) : (
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                    )}
                    {userProfile[field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Account Overview ---------- */}
        <div className="space-y-6">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Account Overview
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">
                  Total Complaints
                </span>
                <span className="text-lg font-semibold text-gray-800 font-['Inter']">
                  {userProfile.totalComplaints}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">
                  Resolved Issues
                </span>
                <span className="text-lg font-semibold text-emerald-600 font-['Inter']">
                  {userProfile.resolvedComplaints}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">
                  Success Rate
                </span>
                <span className="text-lg font-semibold text-emerald-600 font-['Inter']">
                  {userProfile.totalComplaints > 0
                    ? Math.round(
                        (userProfile.resolvedComplaints /
                          userProfile.totalComplaints) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Logout ---------- */}
          <div className="bg-red-100/60 border border-red-200/60 rounded-xl backdrop-blur-sm">
            <div className="p-6 border-b border-red-200/60">
              <h2 className="text-lg font-semibold text-red-800 font-['Inter']">
                Account Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full p-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-rose-500 hover:to-rose-400 cursor-pointer transition-all duration-200 font-['Inter'] flex items-center justify-center shadow-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
              <p className="text-xs text-red-600 text-center font-['Inter']">
                You will be logged out of all devices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Logout Modal ---------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-xl max-w-md w-full p-6 border border-white/40">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
                  Sign Out
                </h3>
                <p className="text-gray-600 font-['Inter']">
                  Are you sure you want to sign out?
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-red-300 to-rose-300 text-white py-2 px-4 rounded-xl font-medium hover:from-red-400 hover:to-rose-400 transition-all duration-200 font-['Inter'] shadow-md"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-white/30 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-white/40 transition-colors font-['Inter'] backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
