import React, { useState,useEffect } from 'react';
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
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
      useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
          navigate("/login", { replace: true });
        }
      }, [navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 98765 43210',
    address: 'Sector 17, Chandigarh, India',
    joinDate: 'January 2024',
    totalComplaints: 4,
    resolvedComplaints: 1
  });

  const [editedProfile, setEditedProfile] = useState({...userProfile});

  const handleSave = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    console.log('Logging out...');
    setShowLogoutModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">Settings</h1>
          <p className="text-gray-600 mt-1 font-['Inter']">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
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
                  className="text-pink-600 hover:text-pink-700 font-medium text-sm font-['Inter'] flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-pink-300 to-rose-300 text-white px-3 py-1 rounded-xl text-sm font-medium hover:from-pink-400 hover:to-rose-400 transition-all duration-200 font-['Inter'] flex items-center shadow-md"
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
                <div className="w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-10 h-10 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-300 to-rose-300 text-white p-2 rounded-full hover:from-pink-400 hover:to-rose-400 transition-all duration-200 shadow-md">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 font-['Inter']">{userProfile.name}</h3>
                <p className="text-gray-600 font-['Inter']">Member since {userProfile.joinDate}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-white/20 rounded-xl font-['Inter'] backdrop-blur-sm">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    {userProfile.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-white/20 rounded-xl font-['Inter'] backdrop-blur-sm">
                    <Mail className="w-4 h-4 mr-3 text-gray-500" />
                    {userProfile.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-white/20 rounded-xl font-['Inter'] backdrop-blur-sm">
                    <Phone className="w-4 h-4 mr-3 text-gray-500" />
                    {userProfile.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Address</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                  />
                ) : (
                  <div className="flex items-start px-3 py-2 bg-white/20 rounded-xl font-['Inter'] backdrop-blur-sm">
                    <MapPin className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                    {userProfile.address}
                  </div>
                )}
              </div>
            </div>

            {/* Password Section (only show in edit mode) */}
            {isEditing && (
              <div className="pt-6 border-t border-white/30">
                <h3 className="text-lg font-medium text-gray-800 mb-4 font-['Inter'] flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-3 py-2 pr-10 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">Account Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Total Complaints</span>
                <span className="text-lg font-semibold text-gray-800 font-['Inter']">{userProfile.totalComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Resolved Issues</span>
                <span className="text-lg font-semibold text-green-600 font-['Inter']">{userProfile.resolvedComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Success Rate</span>
                <span className="text-lg font-semibold text-pink-600 font-['Inter']">
                  {userProfile.totalComplaints > 0 ? Math.round((userProfile.resolvedComplaints / userProfile.totalComplaints) * 100) : 0}%
                </span>
              </div>
              <div className="pt-4 border-t border-white/30">
                <div className="text-xs text-gray-600 font-['Inter']">
                  Member since {userProfile.joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-100/60 border border-red-200/60 rounded-xl backdrop-blur-sm">
            <div className="p-6 border-b border-red-200/60">
              <h2 className="text-lg font-semibold text-red-800 font-['Inter']">Account Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full p-3 bg-gradient-to-r from-red-300 to-rose-300 text-white rounded-xl hover:from-red-400 hover:to-rose-400 transition-all duration-200 font-['Inter'] flex items-center justify-center shadow-md"
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-xl max-w-md w-full p-6 border border-white/40">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">Sign Out</h3>
                <p className="text-gray-600 font-['Inter']">Are you sure you want to sign out?</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 font-['Inter']">
              You will be logged out of your account and redirected to the login page. Any unsaved changes will be lost.
            </p>
            
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