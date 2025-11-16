import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    FileText,
    PackageSearch,
    PackageCheck,
    CheckCircle2,
    Circle,
    Trash2,
    Sparkles
} from "lucide-react";

import { retrieveComplaint } from "../../services/ComplaintServices";
import { getLostItems, getFoundItems } from "../../services/LostFoundServices";

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

    const [filters, setFilters] = useState({
        complaint: true,
        lost: true,
        found: true,
    });

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

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE.DISMISSED, JSON.stringify(dismissed));
        } catch { }
    }, [dismissed]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE.READ, JSON.stringify(readIds));
        } catch { }
    }, [readIds]);

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

        const list = [];

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

        const seen = new Map();
        list.sort((a, b) => new Date(b.time) - new Date(a.time));
        for (const n of list) {
            if (!seen.has(n.id)) seen.set(n.id, n);
        }
        const merged = Array.from(seen.values());

        const filtered = merged.filter((n) => !dismissed.includes(n.id));

        if (mountedRef.current) {
            setNotifications(filtered);
            setLoading(false);
        }
    }, [dismissed]);

    useEffect(() => {
        mountedRef.current = true;
        fetchAll();
        const id = setInterval(fetchAll, 120000);
        return () => {
            mountedRef.current = false;
            clearInterval(id);
        };
    }, [fetchAll]);

    const toggleFilter = (key) => setFilters((p) => ({ ...p, [key]: !p[key] }));
    const markRead = (id) => setReadIds((p) => (p.includes(id) ? p : [...p, id]));
    const markUnread = (id) => setReadIds((p) => p.filter((x) => x !== id));
    const dismissNotif = (id) => {
        setDismissed((p) => (p.includes(id) ? p : [...p, id]));
        setNotifications((p) => p.filter((n) => n.id !== id));
    };
    const markAllRead = () =>
        setReadIds((p) => Array.from(new Set([...p, ...notifications.map((n) => n.id)])));
    const clearDismissed = () => {
        setDismissed([]);
        try {
            localStorage.removeItem(STORAGE.DISMISSED);
        } catch { }
    };

    const visible = useMemo(() => notifications.filter((n) => filters[n.type]), [notifications, filters]);

    const counts = useMemo(() => {
        const c = { complaint: 0, lost: 0, found: 0 };
        for (const n of notifications) c[n.type] = (c[n.type] || 0) + 1;

        const unread = { complaint: 0, lost: 0, found: 0 };
        for (const n of notifications) {
            if (!readIds.includes(n.id)) unread[n.type] = (unread[n.type] || 0) + 1;
        }
        return { totals: c, unread };
    }, [notifications, readIds]);

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

    const totalUnread = Object.values(counts.unread).reduce((a, b) => a + b, 0);

    return (
        <div className="w-full h-screen overflow-y-auto bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>

                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-emerald-900">
                                Notifications
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-600 mt-0.5">
                                {totalUnread > 0 ? `${totalUnread} unread notification${totalUnread > 1 ? 's' : ''}` : "You're all caught up!"}
                            </p>
                        </div>
                    </div>

                </div>

                {/* MOBILE QUICK ACTIONS */}
                <div className="sm:hidden rounded-xl p-3 border border-emerald-200 bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="text-xs font-semibold text-emerald-800 mb-2.5">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={markAllRead}
                            className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium shadow-md active:scale-95 transition"
                        >
                            Mark All Read
                        </button>
                        <button
                            onClick={() => {
                                const ids = visible.map((n) => n.id);
                                setDismissed((p) =>
                                    Array.from(new Set([...p, ...ids]))
                                );
                                setNotifications((p) => p.filter((n) => !ids.includes(n.id)));
                            }}
                            className="px-3 py-2.5 rounded-lg border-2 border-emerald-300 text-sm font-medium bg-white text-emerald-700 active:scale-95 transition"
                        >
                            Dismiss All
                        </button>
                        <button
                            onClick={clearDismissed}
                            className="col-span-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 active:scale-95 transition"
                        >
                            Restore Dismissed
                        </button>
                    </div>
                </div>

                {/* FILTER CHIPS */}
                <div className="w-full overflow-x-auto">
                    <div className="flex items-center gap-2 sm:gap-3 pb-2">
                        {Object.keys(TYPE_META).map((k) => {
                            const m = TYPE_META[k];
                            const enabled = filters[k];
                            const total = counts.totals[k] || 0;
                            const unreadCount = counts.unread[k] || 0;

                            return (
                                <button
                                    key={k}
                                    onClick={() => toggleFilter(k)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold active:scale-95 transition-all shadow-md ${enabled
                                            ? `bg-gradient-to-r ${m.colorGradient} text-white`
                                            : "bg-white text-gray-700 border-2 border-gray-200"
                                        }`}
                                >
                                    <m.Icon className="w-4 h-4" />
                                    {m.label}

                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs ${enabled ? "text-white" : "text-gray-600"
                                            }`}
                                    >
                                        <span className={`px-2 py-0.5 rounded-full ${enabled ? 'bg-white/20' : 'bg-gray-100'}`}>
                                            {total}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* BODY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2">
                        {/* Desktop timeline */}
                        <div className="hidden sm:block relative pl-6">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-200 rounded"></div>

                            {loading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                                </div>
                            ) : visible.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                                    <div className="font-semibold text-gray-800 text-lg">You're all caught up!</div>
                                    <div className="text-sm text-gray-600 mt-1">No notifications match your selected filters.</div>
                                </div>
                            ) : (
                                <>
                                    {Object.entries(grouped).map(([groupLabel, items]) =>
                                        items.length > 0 ? (
                                            <section key={groupLabel} className="mb-6">
                                                <div className="mb-3">
                                                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-xs text-emerald-800 font-bold border border-emerald-300">
                                                        {groupLabel}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {items.map((n) => {
                                                        const meta = TYPE_META[n.type];
                                                        const Icon = meta.Icon;
                                                        const isRead = readIds.includes(n.id);

                                                        return (
                                                            <article
                                                                key={n.id}
                                                                className="relative bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm hover:shadow-xl transition flex items-start gap-4"
                                                            >
                                                                <div
                                                                    className={`absolute -left-6 top-5 w-4 h-4 rounded-full ring-4 ring-white shadow-md ${isRead ? "bg-gray-300" : meta.dot
                                                                        }`}
                                                                />

                                                                <div className={`flex-none p-2.5 rounded-xl ${meta.pillBg} shadow-sm border border-white`}>
                                                                    <Icon className="w-5 h-5 text-gray-800" />
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="min-w-0">
                                                                            <h4
                                                                                className={`text-sm font-bold ${isRead ? "text-gray-600" : "text-emerald-900"
                                                                                    }`}
                                                                            >
                                                                                {n.title}
                                                                            </h4>
                                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>

                                                                            <div className="mt-3 flex items-center gap-2 text-xs">
                                                                                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                                                                    {meta.label}
                                                                                </span>
                                                                                {(n.meta?.category || n.meta?.status || n.meta?.location) && (
                                                                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                                                                        {n.meta?.category || n.meta?.status || n.meta?.location}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-col items-end gap-2">
                                                                            <div className="text-xs text-gray-500 font-medium">{timeAgoLabel(n.time)} ago</div>

                                                                            <div className="flex items-center gap-2">
                                                                                {/* <button
                                                                                    onClick={() => (isRead ? markUnread(n.id) : markRead(n.id))}
                                                                                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                                                                                    title={isRead ? "Mark as unread" : "Mark as read"}
                                                                                >
                                                                                    {isRead ? (
                                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                                                    ) : (
                                                                                        <Circle className="w-4 h-4 text-gray-400" />
                                                                                    )}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => dismissNotif(n.id)}
                                                                                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                                </button> */}
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

                        {/* MOBILE CARD VIEW */}
                        <div className="sm:hidden space-y-4">
                            {loading ? (
                                <div className="py-16 flex items-center justify-center">
                                    <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                                </div>
                            ) : visible.length === 0 ? (
                                <div className="py-16 text-center bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
                                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                                    <div className="text-base font-bold text-gray-800">You're all caught up!</div>
                                    <div className="text-sm text-gray-600 mt-2">No notifications match your filters.</div>
                                </div>
                            ) : (
                                <>
                                    {Object.entries(grouped).map(([groupLabel, items]) =>
                                        items.length > 0 ? (
                                            <section key={groupLabel} className="space-y-3">
                                                <div className="pb-2">
                                                    <div className="inline-block px-3 py-1.5 rounded-full bg-emerald-100 text-xs text-emerald-800 font-bold border border-emerald-300 shadow-sm">
                                                        {groupLabel}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {items.map((n) => {
                                                        const meta = TYPE_META[n.type];
                                                        const Icon = meta.Icon;
                                                        const isRead = readIds.includes(n.id);

                                                        return (
                                                            <article
                                                                key={n.id}
                                                                className={`rounded-xl p-4 border-2 ${isRead ? "border-gray-200 bg-gray-50" : "border-emerald-200 bg-white"
                                                                    } shadow-sm`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`p-2.5 rounded-lg ${meta.pillBg} shadow-sm flex-shrink-0`}>
                                                                        <Icon className="w-4 h-4 text-gray-800" />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                                            <h4
                                                                                className={`text-sm font-bold ${isRead ? "text-gray-600" : "text-emerald-900"
                                                                                    }`}
                                                                            >
                                                                                {n.title}
                                                                            </h4>
                                                                            <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                                                                                {timeAgoLabel(n.time)}
                                                                            </span>
                                                                        </div>

                                                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                                            {n.message}
                                                                        </p>

                                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700 font-medium">
                                                                                {meta.label}
                                                                            </span>
                                                                            {(n.meta?.status ||
                                                                                n.meta?.location ||
                                                                                n.meta?.category) && (
                                                                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700 font-medium">
                                                                                        {n.meta?.category ||
                                                                                            n.meta?.status ||
                                                                                            n.meta?.location}
                                                                                    </span>
                                                                                )}
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            {/* <div className="w-full flex justify-end">
                                                                                <button
                                                                                    onClick={() => (isRead ? markUnread(n.id) : markRead(n.id))}
                                                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white active:scale-95 transition shadow-sm"
                                                                                >
                                                                                    {isRead ? (
                                                                                        <Circle className="w-5 h-5" />
                                                                                    ) : (
                                                                                        <CheckCircle2 className="w-5 h-5" />
                                                                                    )}
                                                                                </button>
                                                                            </div> */}



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

                    {/* DESKTOP RIGHT SIDEBAR */}
                    <aside className="hidden lg:block space-y-4">
                        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-bold text-gray-900">Summary</div>
                                <div className="text-xs text-gray-600 font-medium">{notifications.length} total</div>
                            </div>

                            <div className="space-y-3">
                                {Object.keys(TYPE_META).map((k) => {
                                    const m = TYPE_META[k];
                                    const total = counts.totals[k] || 0;
                                    const unread = counts.unread[k] || 0;
                                    return (
                                        <div key={k} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${m.pillBg} shadow-sm`}>
                                                    <m.Icon className="w-4 h-4" />
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-semibold text-gray-800">{m.label}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {total} notification{total !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm">
                                                {unread > 0 ? (
                                                    <div className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm">
                                                        {unread}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-medium">All read</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-md">
                            <div className="text-sm font-bold text-gray-900 mb-4">Actions</div>
                            <div className="space-y-2">
                                <button
                                    onClick={markAllRead}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:shadow-lg transition"
                                >
                                    Mark all read
                                </button>
                                <button
                                    onClick={() => {
                                        const ids = visible.map((n) => n.id);
                                        setDismissed((p) => Array.from(new Set([...p, ...ids])));
                                        setNotifications((p) => p.filter((n) => !ids.includes(n.id)));
                                    }}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                                >
                                    Dismiss visible
                                </button>
                                <button
                                    onClick={clearDismissed}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Restore dismissed
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}