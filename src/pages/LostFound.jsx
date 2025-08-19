import React from 'react';
import { 
  Plus, 
  Eye, 
  MapPin, 
  Calendar, 
  Search,
  Package,
  AlertCircle
} from 'lucide-react';

const LostFound = () => {
  const lostFoundItems = [
    {
      id: 'LF001',
      title: 'Lost Black Wallet',
      type: 'lost',
      date: '2024-08-17',
      location: 'City Mall, Food Court',
      description: 'Black leather wallet containing credit cards, driving license, and some cash. Brand: Tommy Hilfiger.',
      category: 'Personal Items',
      contactInfo: 'john.doe@email.com'
    },
    {
      id: 'LF002',
      title: 'Found iPhone 13',
      type: 'found',
      date: '2024-08-14',
      location: 'Central Park, Near Fountain',
      description: 'iPhone 13 with blue case found on park bench. Screen protector has small crack on top right.',
      category: 'Electronics',
      contactInfo: 'Available at Security Office'
    },
    {
      id: 'LF003',
      title: 'Lost Car Keys',
      type: 'lost',
      date: '2024-08-16',
      location: 'Shopping Complex Parking',
      description: 'Car keys with Honda logo and red keychain. Two house keys attached.',
      category: 'Keys',
      contactInfo: '+1 (555) 123-4567'
    },
    {
      id: 'LF004',
      title: 'Found Prescription Glasses',
      type: 'found',
      date: '2024-08-13',
      location: 'Public Library, Reading Section',
      description: 'Black frame prescription glasses in a brown case. Brand appears to be Ray-Ban.',
      category: 'Personal Items',
      contactInfo: 'Available at Reception'
    }
  ];

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' 
      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
  };

  const getTypeIcon = (type) => {
    return type === 'lost' 
      ? <AlertCircle className="w-5 h-5 text-red-500" />
      : <Package className="w-5 h-5 text-green-500" />;
  };

  const getStats = () => {
    const stats = lostFoundItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: lostFoundItems.length,
      lost: stats.lost || 0,
      found: stats.found || 0
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">Lost & Found</h1>
          <p className="text-gray-600 font-['Inter'] mt-1">Report lost items or help others find their belongings</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 font-['Inter']">
            <Plus className="w-4 h-4 inline mr-2" />
            Report Lost
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 font-['Inter']">
            <Plus className="w-4 h-4 inline mr-2" />
            Report Found
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 font-['Poppins']">{stats.total}</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">Total Items</h3>
          <p className="text-sm text-gray-500 mt-1">All reported items</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-red-600 font-['Poppins']">{stats.lost}</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">Lost Items</h3>
          <p className="text-sm text-gray-500 mt-1">Waiting to be found</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600 font-['Poppins']">{stats.found}</span>
          </div>
          <h3 className="font-semibold text-gray-800 font-['Inter']">Found Items</h3>
          <p className="text-sm text-gray-500 mt-1">Waiting for owners</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {lostFoundItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 font-['Poppins']">{item.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 font-['Inter'] leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <span className="flex items-center font-['Inter']">
                    <span className="font-medium mr-1">ID:</span>
                    {item.id}
                  </span>
                  <span className="flex items-center font-['Inter']">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.location}
                  </span>
                  <span className="flex items-center font-['Inter']">
                    <Calendar className="w-4 h-4 mr-1" />
                    {item.date}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 font-['Inter']">Contact: </span>
                  <span className="text-sm text-gray-600 font-['Inter']">{item.contactInfo}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {getTypeIcon(item.type)}
                <button className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 hover:border-blue-300">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {lostFoundItems.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">No items reported yet</h3>
          <p className="text-gray-600 mb-6 font-['Inter']">Be the first to report a lost or found item in your community.</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 font-['Inter']">
              <Plus className="w-4 h-4 inline mr-2" />
              Report Lost Item
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 font-['Inter']">
              <Plus className="w-4 h-4 inline mr-2" />
              Report Found Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;