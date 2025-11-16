import React, { useEffect, useState, useMemo } from "react";
import {
  Bell,
  FileText,
  PackageSearch,
  PackageCheck,
  Eye,
  Trash2,
  CheckCircle,
  X
} from "lucide-react";

// attempt to reuse your existing services if present
import { retrieveComplaint } from "../../services/ComplaintServices";
import { getLostItems, getFoundItems } from "../../services/LostFoundServices";

/**
 * Notifications page
 * - creates notifications from complaints, lost items and found items
 * - 3 chips to toggle: Complaints / Lost / Found (multi-select)
 * - mark-as-read, dismiss, mark all read
 * - uses your glassmorphism / gradient theme conventions
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // chip filter state (multi-select). default: all enabled
  const [filters, setFilters] = useState({
    complaint: true,
    lost: true,
    found: true,
  });

  // store dismissed ids locally so dismissed items don't show again
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
    } catch {
      return [];
    }
  });

  // read ids persisted
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("readNotifications") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("dismissedNotifications", JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    localStorage.setItem("readNotifications", JSON.stringify(readIds));
  }, [readIds]);

  // fetch and build notifications from your services
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // try parallel fetches; if a service is missing, fallback to empty array
        const [complaintsRes, lostRes, foundRes] = await Promise.allSettled([
          retrieveComplaint ? retrieveComplaint() : Promise.resolve([]),
          getLostItems ? getLostItems() : Promise.resolve([]),
          getFoundItems ? getFoundItems() : Promise.resolve([]),
        ]);

        const complaints = complaintsRes.status === "fulfilled" ? complaintsRes.value || [] : [];
        const lostItems = lostRes.status === "fulfilled" ? lostRes.value || [] : [];
        const foundItems = foundRes.status === "fulfilled" ? foundRes.value || [] : [];

        const notifList = [];

        // complaints -> notifications
        for (const c of complaints) {
          // guard: ensure we have an id and created_at
          const id = c.id || c.complaint_id || `complaint-${c.title}-${c.created_at}`;
          const date = c.created_at || c.date || new Date().toISOString();
          notifList.push({
            id,
            type: "complaint",
            title: c.title || "New complaint",
            message: (c.description || "").slice(0, 140),
            meta: {
              status: c.status,
              priority: c.priority,
              reporter: c.user || c.reported_by,
            },
            date,
            raw: c,
          });
        }

        // lost items
        for (const l of lostItems) {
          const id = l.lost_id || l.id || `lost-${l.title}-${l.date || l.date_lost}`;
          const date = l.date_lost || l.date || new Date().toISOString();
          notifList.push({
            id,
            type: "lost",
            title: `Lost — ${l.title || "Item reported lost"}`,
            message: (l.description || l.distinguishing_features || "").slice(0, 140),
            meta: {
              location: l.location,
              category: l.category,
            },
            date,
            raw: l,
          });
        }

        // found items
        for (const f of foundItems) {
          const id = f.lost_id || f.id || `found-${f.title}-${f.date || f.date_lost}`;
          const date = f.date_lost || f.date || new Date().toISOString();
          notifList.push({
            id,
            type: "found",
            title: `Found — ${f.title || "Item found"}`,
            message: (f.description || "").slice(0, 140),
            meta: {
              location: f.location,
              category: f.category,
            },
            date,
            raw: f,
          });
        }

        // sort newest first
        notifList.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (mounted) {
          // filter out dismissed items
          const filtered = notifList.filter((n) => !dismissed.includes(n.id));
          setNotifications(filtered);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    // refresh every 2.5 minutes
    const interval = setInterval(fetchAll, 150000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dismissed]); // re-run when dismissed changes

  const toggleFilter = (key) =>
    setFilters((s) => ({ ...s, [key]: !s[key] }));

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        if (!filters[n.type]) return false;
        return true;
      }),
    [notifications, filters]
  );

  const isRead = (id) => readIds.includes(id);

  const markRead = (id) => {
    if (!isRead(id)) setReadIds((s) => [...s, id]);
  };

  const markAllRead = () => {
    const ids = notifications.map((n) => n.id);
    setReadIds((s) => Array.from(new Set([...s, ...ids])));
  };

  const dismiss = (id) => {
    setDismissed((s) => Array.from(new Set([...s, id])));
    // also remove from current notifications list immediately
    setNotifications((s) => s.filter((n) => n.id !== id));
  };

  const formatTimeAgo = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000); // seconds
      if (diff < 60) return `${diff}s`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
      return `${Math.floor(diff / 86400)}d`;
    } catch {
      return "";
    }
  };

  // small helpers to map type -> icon + color classes
  const typeMeta = {
    complaint: {
      label: "Complaint",
      Icon: FileText,
      color: "from-rose-400 to-rose-500",
      bg: "bg-rose-50/80",
      text: "text-rose-700",
    },
    lost: {
      label: "Lost",
      Icon: PackageSearch,
      color: "from-pink-400 to-red-400",
      bg: "bg-red-50/80",
      text: "text-red-700",
    },
    found: {
      label: "Found",
      Icon: PackageCheck,
      color: "from-emerald-400 to-green-500",
      bg: "bg-emerald-50/80",
      text: "text-emerald-700",
    },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-emerald-900 font-['Inter']">Announcements</h1>
            <p className="text-sm text-emerald-600 font-['Inter']">Latest complaints, lost & found reports — filter what you want to see.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 font-['Inter'] text-sm hover:shadow-md transition"
          >
            Mark all read
          </button>
          <button
            onClick={() => {
              // clear local persisted read state (useful in dev)
              localStorage.removeItem("readNotifications");
              setReadIds([]);
            }}
            className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-gray-600 hover:bg-white/20 transition"
            title="Reset read (dev)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {["complaint", "lost", "found"].map((k) => {
          const meta = typeMeta[k];
          const enabled = filters[k];
          const count = notifications.filter((n) => n.type === k).length;
          return (
            <button
              key={k}
              onClick={() => toggleFilter(k)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                enabled
                  ? `bg-gradient-to-r ${meta.color} text-white shadow-md`
                  : "bg-white/30 text-gray-700 border border-white/40"
              }`}
            >
              <meta.Icon className="w-4 h-4" />
              <span className="capitalize">{meta.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${enabled ? "bg-white/20" : "bg-white/50 text-gray-800"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-emerald-100/30 flex items-center justify-between">
          <div className="text-sm text-emerald-700 font-['Inter']">
            Showing <span className="font-semibold">{visibleNotifications.length}</span> notifications
          </div>
          <div className="text-xs text-gray-500 font-['Inter']">Updated: {new Date().toLocaleString()}</div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <div className="font-medium">No notifications</div>
            <div className="text-sm mt-1">Toggle chips above to include other notification types.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/30">
            {visibleNotifications.map((n) => {
              const meta = typeMeta[n.type] || {};
              const Icon = meta.Icon || FileText;
              const read = isRead(n.id);
              return (
                <div key={n.id} className={`p-4 flex items-start gap-4 hover:bg-white/10 transition ${read ? "opacity-80" : "bg-white/5"}`}>
                  <div className={`p-3 rounded-2xl ${meta.bg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${read ? "text-gray-700" : "text-emerald-900"} font-['Inter']`}>
                            {n.title}
                          </h3>
                          <span className="text-xs text-gray-500">{n.meta?.category || n.meta?.status || ""}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1 font-['Inter']">{n.message}</p>
                      </div>

                      <div className="text-right text-xs text-gray-500 font-['Inter']">
                        <div>{formatTimeAgo(n.date)} ago</div>
                        <div className="mt-2 flex items-center gap-2">
                          {!read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="px-2 py-1 rounded-lg bg-white/20 text-sm hover:shadow-md transition"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // view action - navigate to relevant page if you want
                              // for now mark read and console log raw payload
                              markRead(n.id);
                              console.log("open notification raw:", n.raw);
                              // if you have routing: navigate to complaint / lost / found details
                            }}
                            className="px-2 py-1 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => dismiss(n.id)}
                            className="px-2 py-1 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition"
                            title="Dismiss"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-['Inter']">
                      <span className="px-2 py-1 rounded-full bg-white/20">{meta.label}</span>
                      <span className="px-2 py-1 rounded-full bg-white/10">{new Date(n.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
