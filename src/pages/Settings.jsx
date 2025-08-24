import React, { useState } from 'react';
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
    // Handle logout logic here
    console.log('Logging out...');
    setShowLogoutModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-['Inter']">Settings</h1>
          <p className="text-gray-500 mt-1 font-['Inter']">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 font-['Inter'] flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm font-['Inter'] flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors font-['Inter'] flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors font-['Inter'] flex items-center"
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
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 font-['Inter']">{userProfile.name}</h3>
                <p className="text-gray-500 font-['Inter']">Member since {userProfile.joinDate}</p>
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg font-['Inter']">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg font-['Inter']">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg font-['Inter']">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                  />
                ) : (
                  <div className="flex items-start px-3 py-2 bg-gray-50 rounded-lg font-['Inter']">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                    {userProfile.address}
                  </div>
                )}
              </div>
            </div>

            {/* Password Section (only show in edit mode) */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 font-['Inter'] flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
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
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">Account Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Total Complaints</span>
                <span className="text-lg font-semibold text-gray-900 font-['Inter']">{userProfile.totalComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Resolved Issues</span>
                <span className="text-lg font-semibold text-green-600 font-['Inter']">{userProfile.resolvedComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-['Inter']">Success Rate</span>
                <span className="text-lg font-semibold text-blue-600 font-['Inter']">
                  {userProfile.totalComplaints > 0 ? Math.round((userProfile.resolvedComplaints / userProfile.totalComplaints) * 100) : 0}%
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 font-['Inter']">
                  Member since {userProfile.joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900 font-['Inter']">Account Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-['Inter'] flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-['Inter']">Sign Out</h3>
                <p className="text-gray-500 font-['Inter']">Are you sure you want to sign out?</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 font-['Inter']">
              You will be logged out of your account and redirected to the login page. Any unsaved changes will be lost.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors font-['Inter']"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors font-['Inter']"
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