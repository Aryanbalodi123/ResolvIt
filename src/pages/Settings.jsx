import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  Save,
  AlertTriangle,
  Mail,
  Phone,
  Lock
} from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Cityville'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    statusUpdates: true,
    marketing: false
  });

  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSignout = () => {
    // Handle signout logic here
    console.log('User signed out');
    setShowSignoutConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">Settings</h1>
        <p className="text-gray-600 font-['Inter'] mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold font-['Poppins']">Profile Information</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Full Name</label>
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Inter'] transition-all duration-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Inter'] transition-all duration-200" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Inter'] transition-all duration-200" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">Address</label>
                <textarea 
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Inter'] transition-all duration-200 resize-none" 
                />
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-['Inter'] flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold font-['Poppins']">Notifications</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium font-['Inter']">Email Notifications</h4>
                    <p className="text-sm text-gray-500 font-['Inter']">Updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium font-['Inter']">Push Notifications</h4>
                    <p className="text-sm text-gray-500 font-['Inter']">Browser notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium font-['Inter']">Status Updates</h4>
                    <p className="text-sm text-gray-500 font-['Inter']">Complaint status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.statusUpdates}
                      onChange={() => handleNotificationChange('statusUpdates')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold font-['Poppins']">Security</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-['Inter']">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              
              <button 
                onClick={() => setShowSignoutConfirm(true)}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 font-['Inter']"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Danger Zone */}
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
        <div className="p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 font-['Poppins']">Danger Zone</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-900 font-['Inter']">Delete Account</h4>
              <p className="text-sm text-gray-600 font-['Inter'] mt-1">Permanently delete your account and all associated data</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 font-['Inter']">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">Sign Out</h3>
              <p className="text-gray-600 mb-6 font-['Inter']">Are you sure you want to sign out of your account?</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowSignoutConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 font-['Inter']"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSignout}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 font-['Inter']"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;