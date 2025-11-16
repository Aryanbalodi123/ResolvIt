import React, { useEffect, useState, useMemo } from "react";
import {
  Bell,
  FileText,
  PackageSearch,
  PackageCheck,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
} from "lucide-react";

import { retrieveComplaint } from "../../services/ComplaintServices";
import { getLostItems, getFoundItems } from "../../services/LostFoundServices";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    complaint: true,
    lost: true,
    found: true,
  });

  const [dismissed, setDismissed] = useState(() =>
    JSON.parse(localStorage.getItem("dismissedNotifs") || "[]")
  );

  const [readIds, setReadIds] = useState(() =>
    JSON.parse(localStorage.getItem("readNotifs") || "[]")
  );

  // Persist storage
  useEffect(() => {
    localStorage.setItem("dismissedNotifs", JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    localStorage.setItem("readNotifs", JSON.stringify(readIds));
  }, [readIds]);

  // Fetch and merge notifications
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const [cRes, lRes, fRes] = await Promise.allSettled([
        retrieveComplaint(),
        getLostItems(),
        getFoundItems(),
      ]);

      const complaints = cRes.status === "fulfilled" ? cRes.value || [] : [];
      const lost = lRes.status === "fulfilled" ? lRes.value || [] : [];
      const found = fRes.status === "fulfilled" ? fRes.value || [] : [];

      const list = [];

      complaints.forEach((c) =>
        list.push({
          id: c.complaint_id || c.id,
          type: "complaint",
          title: c.title,
          message: c.description,
          time: c.created_at,
          status: c.status,
          priority: c.priority,
        })
      );

      lost.forEach((i) =>
        list.push({
          id: "lost-" + (i.lost_id || i.id),
          type: "lost",
          title: `Lost: ${i.title}`,
          message: i.description,
          time: i.date_lost,
          location: i.location,
        })
      );

      found.forEach((i) =>
        list.push({
          id: "found-" + (i.lost_id || i.id),
          type: "found",
          title: `Found: ${i.title}`,
          message: i.description,
          time: i.date_lost,
          location: i.location,
        })
      );

      list.sort((a, b) => new Date(b.time) - new Date(a.time));

      if (mounted) {
        const filteredOut = list.filter((n) => !dismissed.includes(n.id));
        setNotifications(filteredOut);
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 120000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dismissed]);

  const meta = {
    complaint: {
      label: "Complaints",
      Icon: FileText,
      color: "from-rose-400 to-red-500",
      bg: "bg-red-50/60",
      dot: "text-red-500",
    },
    lost: {
      label: "Lost",
      Icon: PackageSearch,
      color: "from-pink-400 to-red-400",
      bg: "bg-pink-50/60",
      dot: "text-pink-500",
    },
    found: {
      label: "Found",
      Icon: PackageCheck,
      color: "from-emerald-400 to-green-500",
      bg: "bg-emerald-50/60",
      dot: "text-emerald-500",
    },
  };

  const toggleFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const markRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const dismissNotif = (id) => {
    setDismissed((s) => [...s, id]);
    setNotifications((s) => s.filter((n) => n.id !== id));
  };

  const visible = useMemo(
    () => notifications.filter((n) => filters[n.type]),
    [notifications, filters]
  );

  const formatAgo = (t) => {
    const d = new Date(t);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
          <Bell className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold font-['Inter'] text-emerald-900">
            Notifications
          </h1>
          <p className="text-sm text-emerald-600 font-['Inter']">
            All updates from complaints, lost & found.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.keys(meta).map((k) => {
          const selected = filters[k];
          return (
            <button
              key={k}
              onClick={() => toggleFilter(k)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 font-['Inter'] text-sm transition-all ${
                selected
                  ? `bg-gradient-to-r ${meta[k].color} text-white shadow-md`
                  : "bg-white/30 backdrop-blur-lg border border-white/40 text-gray-700 hover:bg-white/50"
              }`}
            >
              <span>{meta[k].label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications Container */}
      <div className="relative border-l-2 border-emerald-200/50 ml-3 pl-6 space-y-6">

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <p>No notifications found.</p>
          </div>
        ) : (
          visible.map((n) => {
            const M = meta[n.type];
            const isRead = readIds.includes(n.id);

            return (
              <div
                key={n.id}
                className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-6 w-5 h-5 rounded-full border-4 border-white shadow ${
                    isRead ? "bg-gray-300" : M.dot
                  }`}
                ></div>

                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl ${M.bg} shadow-sm flex items-center`}
                    >
                      <M.Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3
                        className={`font-['Inter'] text-sm font-semibold ${
                          isRead ? "text-gray-700" : "text-emerald-900"
                        }`}
                      >
                        {n.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 font-['Inter']">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-['Inter']">
                        <span>{M.label}</span>
                        <span>{formatAgo(n.time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition"
                        title="Mark as read"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissNotif(n.id)}
                      className="p-2 rounded-xl bg-white/50 hover:bg-red-100 transition"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
