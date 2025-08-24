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
      ? 'bg-rose-100/80 text-rose-700 border-rose-200/60' 
      : 'bg-green-100/80 text-green-700 border-green-200/60';
  };

  const getStatusColor = (status) => {
    return status === 'claimed' 
      ? 'bg-gray-100/80 text-gray-700 border-gray-200/60' 
      : 'bg-pink-100/80 text-pink-700 border-pink-200/60';
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
          <h1 className="text-2xl font-semibold text-gray-800 font-['Inter']">Lost & Found</h1>
          <p className="text-gray-600 mt-1 font-['Inter']">Help reunite lost items with their owners or find your missing belongings</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-purple-300 to-indigo-300 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 font-['Inter'] flex items-center shadow-md">
            <Search className="w-4 h-4 mr-2" />
            Report Found Item
          </button>
          <button className="bg-gradient-to-r from-rose-300 to-pink-300 text-white px-4 py-2 rounded-xl font-medium hover:from-rose-400 hover:to-pink-400 transition-all duration-200 font-['Inter'] flex items-center shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Report Lost Item
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors font-['Inter'] ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-pink-300 to-rose-300 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Browse All Items
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors font-['Inter'] ${
              activeTab === 'my-reports'
                ? 'bg-gradient-to-r from-pink-300 to-rose-300 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Reports (3)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filterOptions.map((option) => (
          <div key={option.value} className={`bg-white/40 backdrop-blur-sm rounded-xl border p-4 text-center transition-colors cursor-pointer ${
            selectedFilter === option.value ? 'border-pink-300/60 bg-pink-100/40' : 'border-white/40 hover:border-white/60'
          }`} onClick={() => setSelectedFilter(option.value)}>
            <div className="text-2xl font-semibold text-gray-800 font-['Inter']">{option.count}</div>
            <div className="text-sm text-gray-600 font-['Inter']">{option.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by item name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl focus:ring-2 focus:ring-pink-300/50 focus:border-transparent font-['Inter'] backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.slice(1).map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors font-['Inter'] ${
                  selectedFilter === option.value
                    ? 'bg-gradient-to-r from-pink-300 to-rose-300 text-white shadow-md'
                    : 'bg-white/30 text-gray-700 hover:bg-white/40 backdrop-blur-sm'
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
            <div key={item.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-6 hover:shadow-lg transition-all duration-200 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/40 rounded-xl backdrop-blur-sm">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 font-['Inter']">{item.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{item.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                <div className="bg-green-100/60 border border-green-200/60 rounded-xl p-3 mb-4 backdrop-blur-sm">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium font-['Inter']">Reward: {item.reward}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <div className="flex items-center space-x-4">
                  <button className="text-pink-600 hover:text-pink-700 text-sm font-medium font-['Inter'] flex items-center">
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
                <div className="text-xs text-gray-500 font-['Inter']">
                  ID: {item.id}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 p-12 text-center">
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 font-['Inter']">
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
                <button className="bg-gradient-to-r from-rose-300 to-pink-300 text-white px-6 py-3 rounded-xl font-medium hover:from-rose-400 hover:to-pink-400 transition-all duration-200 font-['Inter'] shadow-md">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Report Lost Item
                </button>
                <button className="bg-gradient-to-r from-purple-300 to-indigo-300 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 font-['Inter'] shadow-md">
                  <Search className="w-4 h-4 inline mr-2" />
                  Report Found Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-100/60 border border-blue-200/60 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-800 mb-3 font-['Inter'] flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Tips for Better Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
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