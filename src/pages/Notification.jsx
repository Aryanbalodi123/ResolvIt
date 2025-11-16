import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  FileText,
  PackageSearch,
  PackageCheck,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
  Sparkles
} from "lucide-react";

import { retrieveComplaint } from "../../services/ComplaintServices";
import { getLostItems, getFoundItems } from "../../services/LostFoundServices";

/**
 * Improved Notifications page
 * - expressive, vivid UI (chips with counts and unread badges)
 * - timeline-style cards with stronger contrast
 * - mark single / mark all read, dismiss, clear dismissed
 * - groups notifications by date (Today / Yesterday / Older)
 * - robust: defensive fetching, stable IDs, handles missing times
 * - persisted read/dismissed state in localStorage
 */

const STORAGE = {
  DISMISSED: "dismissedNotifs_v2",
  READ: "readNotifs_v2",
};

const TYPE_META = {
  complaint: {
    key: "complaint",
    label: "Complaints",
    Icon: FileText,
    colorGradient: "from-rose-400 to-red-500",
    pillBg: "bg-rose-50/70",
    dot: "bg-rose-500",
  },
  lost: {
    key: "lost",
    label: "Lost",
    Icon: PackageSearch,
    colorGradient: "from-pink-400 to-red-400",
    pillBg: "bg-pink-50/70",
    dot: "bg-pink-500",
  },
  found: {
    key: "found",
    label: "Found",
    Icon: PackageCheck,
    colorGradient: "from-emerald-400 to-green-500",
    pillBg: "bg-emerald-50/70",
    dot: "bg-emerald-500",
  },
};

function safeGet(obj, ...paths) {
  try {
    return paths.reduce((a, p) => (a && a[p] !== undefined ? a[p] : undefined), obj);
  } catch {
    return undefined;
  }
}

function genId(prefix, fallback) {
  if (prefix) return `${prefix}-${fallback}`;
  return `notif-${fallback}`;
}

function timeOrNow(t) {
  const d = new Date(t);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

// Group notifications into Today / Yesterday / Older
function groupByDate(list) {
  const groups = { Today: [], Yesterday: [], Older: [] };
  const now = new Date();
  for (const n of list) {
    const d = timeOrNow(n.time);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) groups.Today.push(n);
    else if (diffDays === 1) groups.Yesterday.push(n);
    else groups.Older.push(n);
  }
  return groups;
}

export default function Notifications() {
  const mountedRef = useRef(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters (multi-select)
  const [filters, setFilters] = useState({
    complaint: true,
    lost: true,
    found: true,
  });

  // persisted arrays
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.DISMISSED) || "[]");
    } catch {
      return [];
    }
  });
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.READ) || "[]");
    } catch {
      return [];
    }
  });

  // keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.DISMISSED, JSON.stringify(dismissed));
    } catch {}
  }, [dismissed]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.READ, JSON.stringify(readIds));
    } catch {}
  }, [readIds]);

  // robust fetch: services may reject or be undefined
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const settled = await Promise.allSettled([
      typeof retrieveComplaint === "function" ? retrieveComplaint() : Promise.resolve([]),
      typeof getLostItems === "function" ? getLostItems() : Promise.resolve([]),
      typeof getFoundItems === "function" ? getFoundItems() : Promise.resolve([]),
    ]);

    const complaints = settled[0].status === "fulfilled" ? settled[0].value || [] : [];
    const lost = settled[1].status === "fulfilled" ? settled[1].value || [] : [];
    const found = settled[2].status === "fulfilled" ? settled[2].value || [] : [];

    // Normalize & protect against duplicates
    const list = [];

    // complaints
    for (const c of complaints) {
      const id = safeGet(c, "complaint_id") || safeGet(c, "id") || genId("complaint", btoa((c.title || "") + (c.created_at || "")));
      list.push({
        id,
        type: "complaint",
        title: safeGet(c, "title") || "New complaint",
        message: safeGet(c, "description") || "",
        time: safeGet(c, "created_at") || safeGet(c, "date") || new Date().toISOString(),
        meta: { status: safeGet(c, "status"), priority: safeGet(c, "priority"), reporter: safeGet(c, "user") },
        raw: c,
      });
    }

    // lost
    for (const i of lost) {
      const id = safeGet(i, "lost_id") || safeGet(i, "id") || genId("lost", btoa((i.title || "") + (i.date_lost || "")));
      list.push({
        id,
        type: "lost",
        title: `Lost: ${safeGet(i, "title") || "Item reported"}`,
        message: safeGet(i, "description") || safeGet(i, "distinguishing_features") || "",
        time: safeGet(i, "date_lost") || safeGet(i, "date") || new Date().toISOString(),
        meta: { location: safeGet(i, "location"), category: safeGet(i, "category") },
        raw: i,
      });
    }

    // found
    for (const i of found) {
      const id = safeGet(i, "lost_id") || safeGet(i, "id") || genId("found", btoa((i.title || "") + (i.date_lost || "")));
      list.push({
        id,
        type: "found",
        title: `Found: ${safeGet(i, "title") || "Item found"}`,
        message: safeGet(i, "description") || "",
        time: safeGet(i, "date_lost") || safeGet(i, "date") || new Date().toISOString(),
        meta: { location: safeGet(i, "location"), category: safeGet(i, "category") },
        raw: i,
      });
    }

    // dedupe by id (most recent wins)
    const seen = new Map();
    // sort first by time desc so seen keeps newest
    list.sort((a, b) => new Date(b.time) - new Date(a.time));
    for (const n of list) {
      if (!seen.has(n.id)) seen.set(n.id, n);
    }
    const merged = Array.from(seen.values());

    // filter dismissed
    const filtered = merged.filter((n) => !dismissed.includes(n.id));

    if (mountedRef.current) {
      setNotifications(filtered);
      setLoading(false);
    }
  }, [dismissed]);

  // initial load + interval
  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    const id = setInterval(fetchAll, 120000); // 2 minutes
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchAll]);

  // helper actions
  const toggleFilter = (key) => setFilters((p) => ({ ...p, [key]: !p[key] }));
  const markRead = (id) => setReadIds((p) => (p.includes(id) ? p : [...p, id]));
  const markUnread = (id) => setReadIds((p) => p.filter((x) => x !== id));
  const dismissNotif = (id) => {
    setDismissed((p) => (p.includes(id) ? p : [...p, id]));
    setNotifications((p) => p.filter((n) => n.id !== id));
  };
  const markAllRead = () => setReadIds((p) => Array.from(new Set([...p, ...notifications.map((n) => n.id)])));
  const clearDismissed = () => {
    setDismissed([]);
    try {
      localStorage.removeItem(STORAGE.DISMISSED);
    } catch {}
  };

  // visible notifications according to filter
  const visible = useMemo(() => notifications.filter((n) => filters[n.type]), [notifications, filters]);

  // counts for chips
  const counts = useMemo(() => {
    const c = { complaint: 0, lost: 0, found: 0 };
    for (const n of notifications) c[n.type] = (c[n.type] || 0) + 1;
    const unread = { complaint: 0, lost: 0, found: 0 };
    for (const n of notifications) {
      if (!readIds.includes(n.id)) unread[n.type] = (unread[n.type] || 0) + 1;
    }
    return { totals: c, unread };
  }, [notifications, readIds]);

  // grouping
  const grouped = useMemo(() => groupByDate(visible), [visible]);

  function timeAgoLabel(t) {
    try {
      const d = timeOrNow(t);
      const s = Math.floor((Date.now() - d) / 1000);
      if (s < 60) return `${s}s`;
      if (s < 3600) return `${Math.floor(s / 60)}m`;
      if (s < 86400) return `${Math.floor(s / 3600)}h`;
      return `${Math.floor(s / 86400)}d`;
    } catch {
      return "";
    }
  }

  // UI: expressive styles, stronger contrast
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold font-['Inter'] text-emerald-900">Notifications</h1>
            <p className="text-sm text-emerald-600 font-['Inter']">Updates from complaints, lost & found — stay on top of activity.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-lg bg-white/80 backdrop-blur-md border border-white/50 text-sm hover:shadow-md transition font-['Inter']"
            aria-label="Mark all as read"
          >
            Mark all read
          </button>
          <button
            onClick={clearDismissed}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition font-['Inter']"
            aria-label="Clear dismissed"
            title="Restore dismissed notifications (dev)"
          >
            Clear dismissed
          </button>
        </div>
      </div>

      {/* Chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.keys(TYPE_META).map((k) => {
          const m = TYPE_META[k];
          const enabled = filters[k];
          const total = counts.totals[k] || 0;
          const unreadCount = counts.unread[k] || 0;

          return (
            <button
              key={k}
              onClick={() => toggleFilter(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                enabled
                  ? `bg-gradient-to-r ${m.colorGradient} text-white shadow-xl`
                  : "bg-white/20 text-gray-800 border border-white/30 hover:bg-white/30"
              }`}
              aria-pressed={enabled}
            >
              <m.Icon className="w-4 h-4" />
              <span>{m.label}</span>

              {/* counts & small unread badge */}
              <span className={`ml-2 inline-flex items-center gap-2 text-xs ${enabled ? "text-white/90" : "text-gray-700"}`}>
                <span className="px-2 py-0.5 rounded-full bg-white/20 font-semibold">{total}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-red-500 font-semibold">{unreadCount}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline / list (left, main) */}
        <div className="lg:col-span-2">
          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-100/60 rounded"></div>

            {/* Loading */}
            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <div className="py-12 text-center text-gray-600">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <div className="font-medium">You're all caught up</div>
                <div className="text-sm mt-1">No notifications match your selected filters.</div>
              </div>
            ) : (
              <>
                {Object.entries(grouped).map(([groupLabel, items]) =>
                  items.length > 0 ? (
                    <section key={groupLabel} className="mb-6">
                      <div className="mb-3">
                        <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-gray-700 font-semibold">{groupLabel}</div>
                      </div>

                      <div className="space-y-4">
                        {items.map((n) => {
                          const meta = TYPE_META[n.type];
                          const Icon = meta.Icon;
                          const isRead = readIds.includes(n.id);

                          return (
                            <article
                              key={n.id}
                              className={`relative bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-xl transition flex items-start gap-4`}
                              role="article"
                              aria-labelledby={`title-${n.id}`}
                            >
                              {/* dot */}
                              <div
                                className={`absolute -left-6 top-5 w-4 h-4 rounded-full ring-4 ring-white shadow ${
                                  isRead ? "bg-gray-300" : meta.dot
                                }`}
                                aria-hidden
                              />

                              {/* icon */}
                              <div className={`flex-none p-2 rounded-lg ${meta.pillBg} shadow-sm`}>
                                <Icon className="w-5 h-5 text-gray-800" />
                              </div>

                              {/* content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <h4
                                      id={`title-${n.id}`}
                                      className={`text-sm font-semibold font-['Inter'] ${isRead ? "text-gray-700" : "text-emerald-900"}`}
                                    >
                                      {n.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1 truncate">{n.message}</p>

                                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                                      <span className="px-2 py-0.5 rounded-full bg-white/10">{meta.label}</span>
                                      <span className="px-2 py-0.5 rounded-full bg-white/10">{n.meta?.category || n.meta?.status || n.meta?.location || ""}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2">
                                    <div className="text-xs text-gray-500">{timeAgoLabel(n.time)} ago</div>

                                    <div className="flex items-center gap-2">
                                      {/* mark read/unread */}
                                      <button
                                        onClick={() => {
                                          if (isRead) markUnread(n.id);
                                          else markRead(n.id);
                                        }}
                                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                                        title={isRead ? "Mark as unread" : "Mark as read"}
                                        aria-pressed={isRead}
                                      >
                                        {isRead ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-gray-500" />}
                                      </button>

                                 
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ) : null
                )}
              </>
            )}
          </div>
        </div>

        {/* Right column: quick stats & filters summary */}
        <aside className="space-y-4">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold font-['Inter']">Summary</div>
              <div className="text-xs text-gray-500">{notifications.length} total</div>
            </div>

            <div className="mt-3 space-y-2">
              {Object.keys(TYPE_META).map((k) => {
                const m = TYPE_META[k];
                const total = counts.totals[k] || 0;
                const unread = counts.unread[k] || 0;
                return (
                  <div key={k} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${m.pillBg}`}>
                        <m.Icon className="w-4 h-4" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-gray-500">{total} notifications</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      {unread > 0 ? <div className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">{unread} new</div> : <div className="text-xs text-gray-500">All read</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
            <div className="text-sm font-semibold font-['Inter']">Actions</div>
            <div className="mt-3 space-y-2">
              <button
                onClick={markAllRead}
                className="w-full px-3 py-2 rounded-lg bg-emerald-500 text-white hover:from-emerald-600 transition font-['Inter']"
              >
                Mark all read
              </button>
              <button
                onClick={() => {
                  // dismiss all currently visible
                  const ids = visible.map((n) => n.id);
                  setDismissed((p) => Array.from(new Set([...p, ...ids])));
                  setNotifications((p) => p.filter((n) => !ids.includes(n.id)));
                }}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm hover:bg-red-50 transition font-['Inter']"
              >
                Dismiss visible
              </button>
              <button
                onClick={clearDismissed}
                className="w-full px-3 py-2 rounded-lg bg-white/30 text-sm hover:shadow-md transition font-['Inter']"
              >
                Clear dismissed (restore)
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
