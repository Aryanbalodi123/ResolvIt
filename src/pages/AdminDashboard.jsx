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
const Sparkline = ({ data = [], color = "#047857", height = 48 }) => {
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
      case 'pending': return 'bg-[#ECFDF5] text-green-700 border border-[#D1FAE5]';
      case 'in-progress': return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'resolved': return 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-[#047857]';
      case 'low': return 'text-[#047857]';
      default: return 'text-gray-500';
    }
  };

  const statCards = [
    { title: 'Total Complaints', value: stats.total, trend: `${stats.total} this month`, pct: '+18.4%', icon: FileText, iconBg: 'bg-white/20', iconColor: 'text-white', sparkData: sparklineData.total, sparkColor: '#ffffff', cardBg: 'bg-emerald-500 border-emerald-600 text-white', trendColor: 'text-emerald-100' },
    { title: 'Active Complaints', value: stats.active, trend: `${stats.active} this month`, pct: '+12.6%', icon: TrendingUp, iconBg: 'bg-white/20', iconColor: 'text-white', sparkData: sparklineData.active, sparkColor: '#ffffff', cardBg: 'bg-green-500 border-green-600 text-white', trendColor: 'text-green-100' },
    { title: 'Resolved Complaints', value: stats.resolved, trend: `${stats.resolved} this month`, pct: `${stats.total > 0 ? ((stats.resolved/stats.total)*100).toFixed(1) : 0}%`, icon: CheckCircle, iconBg: 'bg-white/20', iconColor: 'text-white', sparkData: sparklineData.resolved, sparkColor: '#ffffff', cardBg: 'bg-teal-500 border-teal-600 text-white', trendColor: 'text-teal-100' },
    { title: 'High Priority', value: stats.highPriority, trend: `${stats.highPriority} this month`, pct: '+25.0%', icon: AlertTriangle, iconBg: 'bg-white/20', iconColor: 'text-white', sparkData: sparklineData.highPriority, sparkColor: '#ffffff', cardBg: 'bg-cyan-600 border-cyan-700 text-white', trendColor: 'text-cyan-100' },
  ];

  const donutSegments = [
    { label: 'Pending', value: stats.pending, color: '#047857' },
    { label: 'In Progress', value: stats.inProgress, color: '#047857' },
    { label: 'Resolved', value: stats.resolved, color: '#047857' },
    { label: 'High Priority', value: stats.highPriority, color: '#EF4444' },
  ];

  const quickActions = [
    { title: 'Assign Complaint', subtitle: 'Allocate to staff', icon: UserCheck, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#047857]' },
    { title: 'Add Announcement', subtitle: 'Create notice', icon: Megaphone, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#047857]' },
    { title: 'Manage Users', subtitle: 'Add or edit users', icon: UserPlus, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#047857]' },
    { title: 'Generate Reports', subtitle: 'View analytics', icon: BarChart3, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#047857]' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 w-full">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-['Inter'] tracking-tight">
            Good Morning, Admin! <span className="inline-block hover:animate-bounce cursor-default">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 text-base font-['Inter']">Here's what's happening with your system today.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export */}
          <button className="flex items-center px-5 py-3 bg-[#065F46] text-white rounded-full hover:bg-[#064E3B] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-['Inter'] font-semibold text-sm">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-[2rem] border p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${stat.cardBg}`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-2xl ${stat.iconBg} shadow-inner`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-sm font-['Inter'] font-bold uppercase tracking-wider text-white/90">{stat.title}</span>
                </div>
                <p className="text-4xl font-black font-['Inter'] tracking-tight drop-shadow-sm text-white">{stat.value}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs font-bold font-['Inter'] flex items-center bg-white/20 text-white px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </span>
                  <span className={`text-xs font-bold font-['Inter'] ${stat.trendColor || 'text-white/80'}`}>→ {stat.pct}</span>
                </div>
                <Sparkline data={stat.sparkData} color={stat.sparkColor} height={50} />
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Latest Complaints ─── */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 font-['Inter']">Latest Complaints (All Users)</h2>
            <button className="px-4 py-2 bg-gray-50 text-[#047857] hover:bg-green-50 rounded-full font-bold text-sm font-['Inter'] flex items-center group transition-colors">
              View all <ArrowUpRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-['Inter'] font-medium">No complaints found</p>
              </div>
            ) : complaints
               .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
               .filter((complaint) => complaint.status !== "resolved")
               .slice(0, 6)
               .map((complaint) => (
              <div key={complaint.id || complaint.complaint_id} className="p-4 mx-2 my-1 hover:bg-gray-50 rounded-2xl transition-all duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-bold text-gray-900 font-['Inter'] truncate">{complaint.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-500 mb-3 font-['Inter'] line-clamp-2 leading-relaxed">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-400 font-medium">
                      {complaint.location && (
                        <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {complaint.location}
                        </span>
                      )}
                      <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {complaint.date || new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {complaint.priority && (
                        <span className={`flex items-center px-2.5 py-1 rounded-lg ${complaint.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          <Flag className="w-3.5 h-3.5 mr-1.5" />
                          {complaint.priority} priority
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#065F46] hover:border-[#D1FAE5] hover:bg-[#ECFDF5] rounded-xl transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#065F46] hover:border-[#D1FAE5] hover:bg-[#ECFDF5] rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-8">
          {/* ─── Complaint Overview (Donut Chart) ─── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 font-['Inter']">Overview</h2>
              <select
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-bold font-['Inter'] text-gray-600 focus:ring-2 focus:ring-[#D1FAE5] focus:border-[#047857]"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div className="flex flex-col items-center justify-center">
              <DonutChart segments={donutSegments} size={200} />
              <div className="w-full grid grid-cols-2 gap-3 mt-8">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 text-center">
                    <span className="w-3 h-3 rounded-full mb-2 shadow-sm" style={{ backgroundColor: seg.color }}></span>
                    <span className="text-xl font-black text-gray-900 leading-none mb-1">
                      {seg.value}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {seg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Quick Actions (2×2 Grid) ─── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 font-['Inter'] mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center justify-center p-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] hover:bg-gray-100 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center bg-white group-hover:scale-110 transition-transform mb-3`}>
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <p className="text-[13px] font-bold text-gray-900 font-['Inter'] leading-tight">{action.title}</p>
                    <p className="text-[10px] text-gray-500 font-['Inter'] mt-1">{action.subtitle}</p>
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