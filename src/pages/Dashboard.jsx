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
  AlertTriangle,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  ArrowUpRight
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
      description: 'Street light has been out for 3 days, causing safety concerns',
      timeAgo: '3 days ago'
    },
    {
      id: 'C002',
      title: 'Water Supply Issue',
      status: 'in-progress',
      priority: 'high',
      date: '2024-08-12',
      location: 'Park Avenue, Sector 5',
      description: 'Inconsistent water supply for the past week',
      timeAgo: '6 days ago'
    },
    {
      id: 'C003',
      title: 'Noise Complaint',
      status: 'resolved',
      priority: 'low',
      date: '2024-08-08',
      location: 'Green Valley Apartments',
      description: 'Construction noise during restricted hours',
      timeAgo: '1 week ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = [
    {
      title: 'My Complaints',
      value: '3',
      subtitle: '1 pending, 1 in progress',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Lost & Found',
      value: '2',
      subtitle: '1 lost, 1 found item',
      icon: Search,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Resolved',
      value: '1',
      subtitle: 'This month',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-['Inter']">Dashboard</h1>
            <p className="text-gray-500 mt-1 font-['Inter']">Welcome back, John! Manage your complaints and stay updated on their progress.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors font-['Inter']">
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
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <span className="text-2xl font-semibold text-gray-900 font-['Inter']">{stat.value}</span>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 font-['Inter']">{stat.title}</h3>
                <p className="text-sm text-gray-500 mt-1 font-['Inter']">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">Recent Complaints</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm font-['Inter'] flex items-center">
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentComplaints.map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 font-['Inter']">{complaint.title}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-['Inter']">{complaint.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center font-['Inter']">
                        <MapPin className="w-3 h-3 mr-1" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center font-['Inter']">
                        <Clock className="w-3 h-3 mr-1" />
                        {complaint.timeAgo}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
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
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">New Complaint</div>
                    <div className="text-xs text-blue-100 font-['Inter']">Report a new issue</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">Report Lost Item</div>
                    <div className="text-xs text-purple-100 font-['Inter']">Add to lost & found</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">Send Feedback</div>
                    <div className="text-xs text-gray-500 font-['Inter']">Share your thoughts</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 font-['Inter']">This Month</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Complaints submitted</span>
                  <span className="text-sm font-medium text-gray-900 font-['Inter']">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Issues resolved</span>
                  <span className="text-sm font-medium text-gray-900 font-['Inter']">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Average response time</span>
                  <span className="text-sm font-medium text-gray-900 font-['Inter']">2 days</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-['Inter']">Response time improved by 20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;