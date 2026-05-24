import React, { useEffect, useState, useMemo } from 'react';
import { retrieveComplaint } from '../../services/ComplaintServices';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  UserPlus, 
  Megaphone,
  MapPin,
  Clock,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  Eye,
  ArrowUpRight,
  Activity,
  UserCheck,
  AlertCircle,
  Download,
  Search,
  Bell,
  Flag,
  BarChart3
} from 'lucide-react';

/* ─── Sparkline Component ─── */
const Sparkline = ({ data = [], color = "#F97316", height = 48 }) => {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 70 - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }} className="mt-3">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill={`url(#grad-${color.replace('#','')})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Donut Chart Component ─── */
const DonutChart = ({ segments, size = 180 }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900 font-['Inter']">0</p>
        <p className="text-xs text-gray-400 font-['Inter']">Total</p>
      </div>
    </div>
  );
  
  const radius = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {/* Background ring */}
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
      {/* Segments */}
      {segments.filter(s => s.value > 0).map((segment, i) => {
        const strokeLength = (segment.value / total) * circumference;
        const gap = 2;
        const currentOffset = accumulatedOffset;
        accumulatedOffset += strokeLength;
        return (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(strokeLength - gap, 0)} ${circumference - Math.max(strokeLength - gap, 0)}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-700 ease-out"
          />
        );
      })}
      {/* Center text */}
      <text x="100" y="94" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827" fontFamily="Inter, sans-serif">{total}</text>
      <text x="100" y="114" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter, sans-serif">Total</text>
    </svg>
  );
};

const AdminDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, active: 0, resolved: 0, unassigned: 0,
    inProgress: 0, highPriority: 0, avgResolutionTime: 0, pending: 0
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const data = await retrieveComplaint();
        setComplaints(data);

        const total = data.length;
        const resolved = data.filter(c => c.status === 'resolved').length;
        const pending = data.filter(c => c.status === 'pending').length;
        const unassigned = data.filter(c => !c.assignedTo).length;
        const inProgress = data.filter(c => c.status === 'in-progress').length;
        const active = unassigned + inProgress;
        const highPriority = data.filter(c => c.priority === 'high' && c.status !== 'resolved').length;

        const resolvedComplaints = data.filter(c => c.status === 'resolved' && c.created_at && c.resolved_at);
        const avgTime = resolvedComplaints.length > 0
          ? resolvedComplaints.reduce((acc, curr) => {
              const created = new Date(curr.created_at);
              const resolvedDate = new Date(curr.resolved_at);
              return acc + (resolvedDate - created) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedComplaints.length
          : 0;

        setStats({ total, active, resolved, unassigned, inProgress, highPriority, avgResolutionTime: avgTime.toFixed(1), pending });
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
    const interval = setInterval(fetchComplaints, 300000);
    return () => clearInterval(interval);
  }, []);

  /* Generate sparkline data from complaint stats */
  const sparklineData = useMemo(() => {
    const base = stats.total || 1;
    const genLine = (val, trend = 1) => {
      const pts = [];
      for (let i = 0; i < 12; i++) {
        pts.push(Math.max(0, val * (0.3 + (i / 11) * 0.7 * trend) + Math.sin(i * 0.8) * (val * 0.1)));
      }
      return pts;
    };
    return {
      total: genLine(stats.total, 1),
      active: genLine(stats.active, 0.8),
      resolved: stats.resolved > 0 ? genLine(stats.resolved, 1.2) : [0,0,0,0,0,0,0,0,0,0,0,0],
      highPriority: genLine(stats.highPriority, 0.6),
    };
  }, [stats]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned': return 'bg-red-50 text-red-600 border border-red-100';
      case 'pending': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'in-progress': return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  const statCards = [
    { title: 'Total Complaints', value: stats.total, trend: `${stats.total} this month`, pct: '+18.4%', icon: FileText, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', sparkData: sparklineData.total, sparkColor: '#F97316' },
    { title: 'Active Complaints', value: stats.active, trend: `${stats.active} this month`, pct: '+12.6%', icon: TrendingUp, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', sparkData: sparklineData.active, sparkColor: '#F97316' },
    { title: 'Resolved Complaints', value: stats.resolved, trend: `${stats.resolved} this month`, pct: `${stats.total > 0 ? ((stats.resolved/stats.total)*100).toFixed(1) : 0}%`, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', sparkData: sparklineData.resolved, sparkColor: '#22C55E' },
    { title: 'High Priority', value: stats.highPriority, trend: `${stats.highPriority} this month`, pct: '+25.0%', icon: AlertTriangle, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', sparkData: sparklineData.highPriority, sparkColor: '#F97316' },
  ];

  const donutSegments = [
    { label: 'Pending', value: stats.pending, color: '#F97316' },
    { label: 'In Progress', value: stats.inProgress, color: '#FB923C' },
    { label: 'Resolved', value: stats.resolved, color: '#22C55E' },
    { label: 'High Priority', value: stats.highPriority, color: '#EF4444' },
  ];

  const quickActions = [
    { title: 'Assign Complaint', subtitle: 'Allocate to staff', icon: UserCheck, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'Add Announcement', subtitle: 'Create notice', icon: Megaphone, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'Manage Users', subtitle: 'Add or edit users', icon: UserPlus, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'Generate Reports', subtitle: 'View analytics', icon: BarChart3, iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 font-['Inter'] tracking-tight">
            Good Morning, Admin! <span className="inline-block">👋</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-['Inter']">Here's what's happening with your system today.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 space-x-2 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-['Inter'] flex-1">Search...</span>
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded font-['Inter']">⌘K</kbd>
          </div>
          {/* Bell */}
          <button className="relative p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-[18px] h-[18px] text-gray-500" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          {/* Export */}
          <button className="flex items-center px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md font-['Inter'] font-medium text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={`w-[18px] h-[18px] ${stat.iconColor}`} />
                  </div>
                  <span className="text-sm text-gray-500 font-['Inter'] font-medium">{stat.title}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 font-['Inter'] tracking-tight">{stat.value}</p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className="text-xs text-emerald-500 font-medium font-['Inter'] flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-400 font-['Inter']">→ {stat.pct}</span>
                </div>
                <Sparkline data={stat.sparkData} color={stat.sparkColor} height={44} />
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Latest Complaints ─── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 font-['Inter']">Latest Complaints (All Users)</h2>
            <button className="text-orange-500 hover:text-orange-600 font-medium text-sm font-['Inter'] flex items-center group">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-10 text-center">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-['Inter']">No complaints found</p>
              </div>
            ) : complaints
               .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
               .filter((complaint) => complaint.status !== "resolved")
               .slice(0, 6)
               .map((complaint) => (
              <div key={complaint.id || complaint.complaint_id} className="px-6 py-4 hover:bg-gray-50/60 transition-colors duration-150 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5 mb-1.5">
                      <h3 className="text-sm font-semibold text-gray-900 font-['Inter']">{complaint.title}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-400 mb-2.5 font-['Inter'] line-clamp-1">{complaint.description}</p>
                    <div className="flex items-center space-x-4 text-[12px] text-gray-400">
                      {complaint.location && (
                        <span className="flex items-center font-['Inter']">
                          <MapPin className="w-3 h-3 mr-1 text-gray-300" />
                          {complaint.location}
                        </span>
                      )}
                      <span className="flex items-center font-['Inter']">
                        <Clock className="w-3 h-3 mr-1 text-gray-300" />
                        {complaint.date || new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                      {complaint.priority && (
                        <span className={`flex items-center font-['Inter'] font-medium ${getPriorityColor(complaint.priority)}`}>
                          <Flag className="w-3 h-3 mr-1" />
                          {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)} priority
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-0.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-6">
          {/* ─── Complaint Overview (Donut Chart) ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 font-['Inter']">Complaint Overview</h2>
              <select
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-['Inter'] text-gray-500 focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <DonutChart segments={donutSegments} size={160} />
              <div className="space-y-3 ml-4">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span className="text-xs text-gray-500 font-['Inter'] whitespace-nowrap">{seg.label}</span>
                    <span className="text-xs font-semibold text-gray-800 font-['Inter'] ml-auto pl-3">
                      {seg.value} ({stats.total > 0 ? ((seg.value / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Quick Actions (2×2 Grid) ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 font-['Inter'] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center text-center p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 transition-all duration-200 group"
                  >
                    <div className={`p-2.5 rounded-xl ${action.iconBg} group-hover:bg-orange-100 transition-colors duration-200 mb-2`}>
                      <Icon className={`w-[18px] h-[18px] ${action.iconColor}`} />
                    </div>
                    <p className="text-[12px] font-semibold text-gray-800 font-['Inter']">{action.title}</p>
                    <p className="text-[10px] text-gray-400 font-['Inter'] mt-0.5">{action.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;