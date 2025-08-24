import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Eye,
  Filter,
  Tag,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Image as ImageIcon,
  Package
} from 'lucide-react';

const LostFound = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  const lostFoundItems = [
    {
      id: 'LF001',
      title: 'iPhone 13 Pro',
      type: 'lost',
      category: 'Electronics',
      date: '2024-08-20',
      location: 'Central Park, Near Fountain',
      description: 'Lost my iPhone 13 Pro in midnight green color with a black case. Has a small scratch on the back.',
      timeAgo: '4 hours ago',
      contact: 'john.doe@email.com',
      phone: '+91 98765 43210',
      reward: '₹5,000',
      status: 'active',
      images: 1
    },
    {
      id: 'LF002',
      title: 'Brown Leather Wallet',
      type: 'found',
      category: 'Personal Items',
      date: '2024-08-19',
      location: 'Coffee Shop, Sector 17',
      description: 'Found a brown leather wallet with some cards and cash. No ID found inside.',
      timeAgo: '1 day ago',
      contact: 'finder@email.com',
      phone: '+91 87654 32109',
      reward: null,
      status: 'claimed',
      images: 2
    },
    {
      id: 'LF003',
      title: 'Blue Backpack',
      type: 'lost',
      category: 'Bags',
      date: '2024-08-18',
      location: 'Metro Station, Platform 2',
      description: 'Lost my blue Nike backpack containing laptop, books, and personal items. Very important documents inside.',
      timeAgo: '2 days ago',
      contact: 'student@email.com',
      phone: '+91 76543 21098',
      reward: '₹3,000',
      status: 'active',
      images: 1
    },
    {
      id: 'LF004',
      title: 'Car Keys with Remote',
      type: 'found',
      category: 'Keys',
      date: '2024-08-17',
      location: 'Shopping Mall Parking',
      description: 'Found car keys with Honda remote and a few other keys on a keychain.',
      timeAgo: '3 days ago',
      contact: 'helper@email.com',
      phone: '+91 65432 10987',
      reward: null,
      status: 'active',
      images: 1
    },
    {
      id: 'LF005',
      title: 'Gold Ring',
      type: 'lost',
      category: 'Jewelry',
      date: '2024-08-16',
      location: 'Gym, Sector 22',
      description: 'Lost my gold wedding ring in the gym locker room. Has initials "M&S" engraved inside.',
      timeAgo: '4 days ago',
      contact: 'married@email.com',
      phone: '+91 54321 09876',
      reward: '₹10,000',
      status: 'active',
      images: 0
    }
  ];

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-50 text-red-700 border-red-200' 
      : 'bg-green-50 text-green-700 border-green-200';
  };

  const getStatusColor = (status) => {
    return status === 'claimed' 
      ? 'bg-gray-50 text-gray-700 border-gray-200' 
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electronics': return <Phone className="w-4 h-4" />;
      case 'Personal Items': return <Package className="w-4 h-4" />;
      case 'Bags': return <Package className="w-4 h-4" />;
      case 'Keys': return <Tag className="w-4 h-4" />;
      case 'Jewelry': return <Tag className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStats = () => {
    const stats = lostFoundItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: lostFoundItems.length,
      lost: stats.lost || 0,
      found: stats.found || 0,
      active: stats.active || 0,
      claimed: stats.claimed || 0
    };
  };

  const filteredItems = lostFoundItems.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter || item.status === selectedFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = getStats();
  const filterOptions = [
    { value: 'all', label: 'All Items', count: stats.total },
    { value: 'lost', label: 'Lost', count: stats.lost },
    { value: 'found', label: 'Found', count: stats.found },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'claimed', label: 'Claimed', count: stats.claimed }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-['Inter']">Lost & Found</h1>
          <p className="text-gray-500 mt-1 font-['Inter']">Help reunite lost items with their owners or find your missing belongings</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors font-['Inter'] flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Report Found Item
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors font-['Inter'] flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Report Lost Item
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors font-['Inter'] ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse All Items
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors font-['Inter'] ${
              activeTab === 'my-reports'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Reports (3)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filterOptions.map((option) => (
          <div key={option.value} className={`bg-white rounded-lg border p-4 text-center transition-colors cursor-pointer ${
            selectedFilter === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSelectedFilter(option.value)}>
            <div className="text-2xl font-semibold text-gray-900 font-['Inter']">{option.count}</div>
            <div className="text-sm text-gray-600 font-['Inter']">{option.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by item name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Inter']"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.slice(1).map((option) => (
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

      {/* Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 font-['Inter']">{item.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{item.description}</p>

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center font-['Inter']">
                  <MapPin className="w-4 h-4 mr-2" />
                  {item.location}
                </div>
                <div className="flex items-center font-['Inter']">
                  <Calendar className="w-4 h-4 mr-2" />
                  {item.timeAgo}
                </div>
                <div className="flex items-center font-['Inter']">
                  <Tag className="w-4 h-4 mr-2" />
                  {item.category}
                </div>
                {item.images > 0 && (
                  <div className="flex items-center font-['Inter']">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {item.images} photo{item.images > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {item.reward && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium font-['Inter']">Reward: {item.reward}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium font-['Inter'] flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  {item.status === 'active' && (
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium font-['Inter'] flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Contact Owner
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-['Inter']">
                  ID: {item.id}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' ? 'No items found' : 'No lost & found items'}
            </h3>
            <p className="text-gray-600 mb-6 font-['Inter']">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "No items have been reported yet. Be the first to help someone find their lost item!"
              }
            </p>
            {(!searchQuery && selectedFilter === 'all') && (
              <div className="flex justify-center space-x-3">
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors font-['Inter']">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Report Lost Item
                </button>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors font-['Inter']">
                  <Search className="w-4 h-4 inline mr-2" />
                  Report Found Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3 font-['Inter'] flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Tips for Better Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="font-['Inter']">
            <strong>For Lost Items:</strong> Include detailed descriptions, exact location, and time when lost. Offer a reasonable reward if possible.
          </div>
          <div className="font-['Inter']">
            <strong>For Found Items:</strong> Describe the item without revealing unique identifying features until the owner proves ownership.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFound;