import React from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Plus, 
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const recentComplaints = [
    {
      id: 'C001',
      title: 'Street Light Not Working',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-15',
      location: 'Main Street, Block A',
      description: 'Street light has been out for 3 days, causing safety concerns'
    },
    {
      id: 'C002',
      title: 'Water Supply Issue',
      status: 'in-progress',
      priority: 'high',
      date: '2024-08-12',
      location: 'Park Avenue, Sector 5',
      description: 'Inconsistent water supply for the past week'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200';
      case 'in-progress': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200';
      case 'resolved': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 font-['Poppins']">Welcome back, John! 👋</h1>
          <p className="text-blue-100 text-lg font-['Inter']">Manage your complaints and stay updated on their progress</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 font-['Poppins']">3</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">My Complaints</h3>
          <p className="text-sm text-gray-500 mt-1">1 pending, 1 in progress</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 font-['Poppins']">2</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">Lost & Found</h3>
          <p className="text-sm text-gray-500 mt-1">1 lost, 1 found item</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 font-['Poppins']">1</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">Resolved</h3>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-800 font-['Poppins']">Recent Complaints</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 font-['Inter']">{complaint.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 font-['Inter']">{complaint.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {complaint.date}
                      </span>
                    </div>
                    {getPriorityIcon(complaint.priority)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-800 font-['Poppins']">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Plus className="w-5 h-5" />
                <span className="font-semibold font-['Inter']">New Complaint</span>
              </div>
            </button>
            
            <button className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Search className="w-5 h-5" />
                <span className="font-semibold font-['Inter']">Report Lost Item</span>
              </div>
            </button>
            
            <button className="w-full p-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center justify-center space-x-3">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold font-['Inter']">Send Feedback</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;