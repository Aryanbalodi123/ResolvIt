import React from 'react';
import { 
  Plus, 
  Eye, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const Complaints = () => {
  const userComplaints = [
    {
      id: 'C001',
      title: 'Street Light Not Working',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-15',
      location: 'Main Street, Block A',
      description: 'Street light has been out for 3 days, causing safety concerns for pedestrians during night hours.'
    },
    {
      id: 'C002',
      title: 'Water Supply Issue',
      status: 'in-progress',
      priority: 'high',
      date: '2024-08-12',
      location: 'Park Avenue, Sector 5',
      description: 'Inconsistent water supply for the past week. Water pressure is very low during morning hours.'
    },
    {
      id: 'C003',
      title: 'Noise Complaint',
      status: 'resolved',
      priority: 'low',
      date: '2024-08-08',
      location: 'Green Valley Apartments',
      description: 'Construction noise during restricted hours (after 6 PM). Issue has been resolved by local authorities.'
    },
    {
      id: 'C004',
      title: 'Garbage Collection Delay',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-18',
      location: 'Rose Garden Colony',
      description: 'Garbage has not been collected for 4 days. Starting to cause hygiene issues in the area.'
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

  const getStatusStats = () => {
    const stats = userComplaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: userComplaints.length,
      pending: stats.pending || 0,
      inProgress: stats['in-progress'] || 0,
      resolved: stats.resolved || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">My Complaints</h1>
          <p className="text-gray-600 font-['Inter'] mt-1">Track and manage all your submitted complaints</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-['Inter']">
          <Plus className="w-4 h-4 inline mr-2" />
          New Complaint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 font-['Poppins']">{stats.total}</div>
            <div className="text-sm text-gray-600 font-['Inter']">Total</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-yellow-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 font-['Poppins']">{stats.pending}</div>
            <div className="text-sm text-gray-600 font-['Inter']">Pending</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 font-['Poppins']">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 font-['Inter']">In Progress</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 font-['Poppins']">{stats.resolved}</div>
            <div className="text-sm text-gray-600 font-['Inter']">Resolved</div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {userComplaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 font-['Poppins']">{complaint.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{complaint.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center font-['Inter']">
                    <span className="font-medium mr-1">ID:</span>
                    {complaint.id}
                  </span>
                  <span className="flex items-center font-['Inter']">
                    <MapPin className="w-4 h-4 mr-1" />
                    {complaint.location}
                  </span>
                  <span className="flex items-center font-['Inter']">
                    <Calendar className="w-4 h-4 mr-1" />
                    {complaint.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {getPriorityIcon(complaint.priority)}
                <button className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 hover:border-blue-300">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no complaints) */}
      {userComplaints.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">No complaints yet</h3>
          <p className="text-gray-600 mb-6 font-['Inter']">You haven't submitted any complaints. Click the button below to get started.</p>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-['Inter']">
            <Plus className="w-4 h-4 inline mr-2" />
            Submit Your First Complaint
          </button>
        </div>
      )}
    </div>
  );
};

export default Complaints;