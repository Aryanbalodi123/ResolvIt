import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Search,
  MoreVertical,
  FileText,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

const Complaints = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userComplaints = [
    {
      id: 'C001',
      title: 'Street Light Not Working',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-15',
      location: 'Main Street, Block A',
      description: 'Street light has been out for 3 days, causing safety concerns for pedestrians during night hours.',
      category: 'Infrastructure',
      timeAgo: '3 days ago',
      responses: 0
    },
    {
      id: 'C002',
      title: 'Water Supply Issue',
      status: 'in-progress',
      priority: 'high',
      date: '2024-08-12',
      location: 'Park Avenue, Sector 5',
      description: 'Inconsistent water supply for the past week. Water pressure is very low during morning hours.',
      category: 'Utilities',
      timeAgo: '6 days ago',
      responses: 2
    },
    {
      id: 'C003',
      title: 'Noise Complaint',
      status: 'resolved',
      priority: 'low',
      date: '2024-08-08',
      location: 'Green Valley Apartments',
      description: 'Construction noise during restricted hours (after 6 PM). Issue has been resolved by local authorities.',
      category: 'Noise',
      timeAgo: '1 week ago',
      responses: 5
    },
    {
      id: 'C004',
      title: 'Garbage Collection Delay',
      status: 'pending',
      priority: 'medium',
      date: '2024-08-18',
      location: 'Rose Garden Colony',
      description: 'Garbage has not been collected for 4 days. Starting to cause hygiene issues in the area.',
      category: 'Sanitation',
      timeAgo: '1 day ago',
      responses: 1
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

  const filteredComplaints = userComplaints.filter(complaint => {
    const matchesFilter = selectedFilter === 'all' || complaint.status === selectedFilter;
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = getStatusStats();
  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
    { value: 'resolved', label: 'Resolved', count: stats.resolved }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-['Inter']">My Complaints</h1>
          <p className="text-gray-500 mt-1 font-['Inter']">Track and manage all your submitted complaints</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors font-['Inter'] flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.map((option) => (
          <div key={option.value} className={`bg-white rounded-lg border p-4 text-center transition-colors ${
            selectedFilter === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-2xl font-semibold text-gray-900 font-['Inter']">{option.count}</div>
            <div className="text-sm text-gray-600 font-['Inter']">{option.label}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors font-['Inter'] ${
                  selectedFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 font-['Inter']">{complaint.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{complaint.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center font-['Inter']">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">ID:</span>
                      <span className="ml-1">{complaint.id}</span>
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <MapPin className="w-4 h-4 mr-2" />
                      {complaint.location}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <Calendar className="w-4 h-4 mr-2" />
                      {complaint.timeAgo}
                    </div>
                    <div className="flex items-center font-['Inter']">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {complaint.responses} responses
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-['Inter']">
                        {complaint.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium font-['Inter'] flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' ? 'No complaints found' : 'No complaints yet'}
            </h3>
            <p className="text-gray-600 mb-6 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't submitted any complaints. Click the button below to get started."
              }
            </p>
            {(!searchQuery && selectedFilter === 'all') && (
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors font-['Inter']">
                <Plus className="w-4 h-4 inline mr-2" />
                Submit Your First Complaint
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination (if needed) */}
      {filteredComplaints.length > 10 && (
        <div className="flex justify-center pt-6">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-['Inter']">
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg font-['Inter']">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-['Inter']">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-['Inter']">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;