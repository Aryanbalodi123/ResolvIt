import React, { use, useEffect, useState } from 'react';
import { retrieveComplaint } from '../../services/ComplaintServices';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  UserPlus, 
  Megaphone,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  ArrowUpRight,
  Settings,
  Bell,
  Activity,
  UserCheck,
  AlertCircle,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [complaints, setComplaints] = useState([]); 
    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await retrieveComplaint();
        setComplaints(data || []);
      } catch (err) {
        console.error("Error fetching complaints:", err.message);
      }
    };

    fetchData();

    // Increase the interval to reduce server load and improve performance
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'bg-red-50/90 text-red-700 border-red-100';
      case 'pending': return 'bg-amber-50/90 text-amber-700 border-amber-100';
      case 'in-progress': return 'bg-emerald-50/90 text-emerald-700 border-emerald-100';
      case 'resolved': return 'bg-green-50/90 text-green-700 border-green-100';
      default: return 'bg-gray-50/90 text-gray-700 border-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50/80 border border-red-100';
      case 'medium': return 'text-amber-600 bg-amber-50/80 border border-amber-100';
      case 'low': return 'text-emerald-600 bg-emerald-50/80 border border-emerald-100';
      default: return 'text-gray-600 bg-gray-50/80 border border-gray-100';
    }
  };

  const stats = [
    {
      title: 'Total Complaints',
      value: '247',
      subtitle: '+12 from last month',
      icon: FileText,
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-50/90',
      textColor: 'text-emerald-700',
      trend: '+4.8%'
    },
    {
      title: 'Active Complaints',
      value: '89',
      subtitle: '23 unassigned, 66 in progress',
      icon: Activity,
      color: 'from-green-400 to-teal-500',
      bgColor: 'bg-green-50/90',
      textColor: 'text-green-700',
      trend: '-2.1%'
    },
    {
      title: 'Resolved This Month',
      value: '158',
      subtitle: '64% resolution rate',
      icon: CheckCircle,
      color: 'from-teal-400 to-emerald-500',
      bgColor: 'bg-teal-50/90',
      textColor: 'text-teal-700',
      trend: '+8.3%'
    },
    {
      title: 'Active Users',
      value: '1,243',
      subtitle: '+47 new this month',
      icon: Users,
      color: 'from-blue-300 to-cyan-300',
      bgColor: 'bg-blue-100/60',
      textColor: 'text-blue-700',
      trend: '+3.2%'
    }
  ];



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">Good Morning,</h1>
            <p className="text-gray-600 mt-1 font-['Inter']">Hope you are doing well!</p>
          </div>
          <div className="flex items-center space-x-3">
          
            <button className="bg-gradient-to-r from-pink-300 to-rose-300 text-white px-4 py-2 rounded-xl font-medium hover:from-pink-400 hover:to-rose-400 transition-all duration-200 shadow-md font-['Inter']">
              <Download className="w-4 h-4 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 hover:shadow-lg transition-all duration-200 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} backdrop-blur-sm`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
           
              </div>
              <div>
                <span className="text-2xl font-semibold text-gray-800 font-['Inter']">{stat.value}</span>
                <h3 className="font-medium text-gray-800 mt-1 font-['Inter']">{stat.title}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Complaints */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
          <div className="p-6 border-b border-white/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">Latest Complaints (All Users)</h2>
           
            </div>
          </div>
          <div className="divide-y divide-white/30">
            {complaints
             .filter((complaint) => complaint.status !== "success")   
            .map((complaint) => (
              <div key={complaint.id} className="p-6 hover:bg-white/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-800 font-['Inter']">{complaint.title}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-['Inter']">{complaint.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center font-['Inter']">
                        <MapPin className="w-3 h-3 mr-1" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center font-['Inter']">
                        <Clock className="w-3 h-3 mr-1" />
                        {complaint.date}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center font-['Inter']">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Reported by: {complaint.user}
                      </span>
                      {complaint.assignedTo && (
                        <span className="flex items-center font-['Inter']">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Assigned: {complaint.assignedTo}
                        </span>
                      )}
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full p-4 bg-gradient-to-r from-pink-300 to-rose-300 text-white rounded-xl hover:from-pink-400 hover:to-rose-400 transition-all duration-200 text-left shadow-md">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">Assign Complaint</div>
                    <div className="text-xs text-white/80 font-['Inter']">Allocate to staff/department</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-gradient-to-r from-purple-300 to-indigo-300 text-white rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 text-left shadow-md">
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">Add Announcement</div>
                    <div className="text-xs text-white/80 font-['Inter']">Create system notice</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 bg-white/30 border border-white/40 text-gray-700 rounded-xl hover:bg-white/40 transition-colors text-left backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-5 h-5" />
                  <div>
                    <div className="font-medium font-['Inter']">Manage Users</div>
                    <div className="text-xs text-gray-600 font-['Inter']">User & staff management</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="p-6 border-b border-white/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 font-['Inter']">System Performance</h2>
                <select 
                  className="text-sm bg-white/30 border border-white/40 rounded-lg px-3 py-1 font-['Inter']"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Complaints received</span>
                  <span className="text-sm font-medium text-gray-800 font-['Inter']">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Complaints resolved</span>
                  <span className="text-sm font-medium text-gray-800 font-['Inter']">158</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Average resolution time</span>
                  <span className="text-sm font-medium text-gray-800 font-['Inter']">3.2 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Pending high-priority</span>
                  <span className="text-sm font-medium text-red-600 font-['Inter']">12</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/30">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-['Inter']">Resolution rate improved by 15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;