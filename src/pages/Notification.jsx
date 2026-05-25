import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    FileText,
    PackageSearch,
    PackageCheck,
    CheckCircle2,
    Circle,
    Trash2,
    Sparkles,
    Loader2
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
        colorGradient: "bg-red-500",
        pillBg: "bg-rose-50/70",
        dot: "bg-rose-500",
    },
    lost: {
        key: "lost",
        label: "Lost",
        Icon: PackageSearch,
        colorGradient: "bg-pink-500",
        pillBg: "bg-pink-50/70",
        dot: "bg-pink-500",
    },
    found: {
        key: "found",
        label: "Found",
        Icon: PackageCheck,
        colorGradient: "bg-[#065F46]",
        pillBg: "bg-[#ECFDF5]/70",
        dot: "bg-[#065F46]",
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
            const id = safeGet(c, "complaint_id") || safeGet(c, "id") || genId("complaint", ((c.title || "") + (c.created_at || "")).replace(/[^a-zA-Z0-9]/g, ''));
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
            const id = safeGet(i, "lost_id") || safeGet(i, "id") || genId("lost", ((i.title || "") + (i.date_lost || "")).replace(/[^a-zA-Z0-9]/g, ''));
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
            const id = safeGet(i, "lost_id") || safeGet(i, "id") || genId("found", ((i.title || "") + (i.date_lost || "")).replace(/[^a-zA-Z0-9]/g, ''));
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
        <div className="w-full h-full p-6 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-[2rem] bg-[#065F46] shadow-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight font-['Inter']">
                            Notification Hub
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium font-['Inter']">
                            {totalUnread > 0 ? `You have ${totalUnread} new notifications waiting.` : "You're all caught up!"}
                        </p>
                    </div>
                </div>
            </div>

                {/* MOBILE QUICK ACTIONS */}
                <div className="sm:hidden rounded-xl p-3 border border-[#A7F3D0] bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="text-xs font-semibold text-green-800 mb-2.5">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={markAllRead}
                            className="px-3 py-2.5 rounded-lg bg-[#065F46] text-white text-sm font-medium shadow-md active:scale-95 transition"
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
                            className="px-3 py-2.5 rounded-lg border-2 border-green-300 text-sm font-medium bg-white text-green-700 active:scale-95 transition"
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
                <div className="w-full overflow-x-auto no-scrollbar pb-2">
                    <div className="flex items-center gap-3">
                        {Object.keys(TYPE_META).map((k) => {
                            const m = TYPE_META[k];
                            const enabled = filters[k];
                            const total = counts.totals[k] || 0;
                            const unreadCount = counts.unread[k] || 0;

                            return (
                                <button
                                    key={k}
                                    onClick={() => toggleFilter(k)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold active:scale-95 transition-all duration-300 font-['Inter'] ${enabled
                                            ? ` ${m.colorGradient} text-white shadow-lg`
                                            : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <m.Icon className="w-4 h-4" />
                                    {m.label}

                                    <span className="flex items-center gap-1.5 ml-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${enabled ? 'bg-black/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {total}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* BODY GRID */}
                <div className="flex flex-col xl:flex-row gap-8">
                    <div className="flex-1">
                        {loading ? (
                            <div className="py-20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-[#065F46] animate-spin" />
                            </div>
                        ) : visible.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-[3rem] shadow-sm border border-gray-100">
                                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <div className="font-black text-gray-900 text-2xl font-['Inter']">You're all caught up!</div>
                                <div className="text-gray-500 mt-2 font-medium font-['Inter']">No notifications match your selected filters.</div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {Object.entries(grouped).map(([dateGroup, items]) => {
                                    if (items.length === 0) return null;
                                    
                                    return (
                                        <div key={dateGroup} className="relative">
                                            <div className="sticky top-4 z-10 inline-block mb-6">
                                                <div className="px-4 py-2 rounded-full bg-gray-900 text-white font-bold text-sm font-['Inter'] shadow-md">
                                                    {dateGroup}
                                                </div>
                                            </div>
                                            
                                            <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-8">
                                                {items.map((n) => {
                                                    const meta = TYPE_META[n.type];
                                                    const Icon = meta.Icon;
                                                    const isRead = readIds.includes(n.id);

                                                    return (
                                                        <div key={n.id} className="relative group">
                                                            {/* Timeline Dot */}
                                                            <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white ${isRead ? 'bg-gray-300' : meta.dot} shadow-sm transition-colors`} />
                                                            
                                                            {/* Notification Card */}
                                                            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${isRead ? 'border-gray-50 bg-gray-50/50' : 'border-gray-100 bg-white'} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                                                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.pillBg} shadow-inner flex-shrink-0`}>
                                                                        <Icon className={`w-5 h-5 ${meta.dot.replace('bg-', 'text-')}`} />
                                                                    </div>
                                                                    
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                                            <div className="text-xs font-bold text-gray-800 font-['Inter'] uppercase tracking-wider">{meta.label}</div>
                                                                            <span className="text-xs font-bold text-gray-400 font-['Inter']">{timeAgoLabel(n.time)} ago</span>
                                                                        </div>
                                                                        
                                                                        <h4 className={`text-lg font-black font-['Inter'] leading-tight mb-2 ${isRead ? "text-gray-600" : "text-gray-900"}`}>
                                                                            {n.title}
                                                                        </h4>
                                                                        <p className={`text-sm font-['Inter'] leading-relaxed ${isRead ? "text-gray-400" : "text-gray-500"}`}>
                                                                            {n.message}
                                                                        </p>

                                                                        {(n.meta?.category || n.meta?.status || n.meta?.location) && (
                                                                            <div className="flex flex-wrap gap-2 pt-3">
                                                                                {n.meta?.category && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">{n.meta.category}</span>}
                                                                                {n.meta?.status && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">{n.meta.status}</span>}
                                                                            </div>
                                                                        )}

                                                                        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => isRead ? markUnread(n.id) : markRead(n.id)} className={`text-xs font-bold flex items-center hover:underline ${isRead ? 'text-gray-500' : 'text-[#065F46]'}`}>
                                                                                {isRead ? <Circle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                                                {isRead ? "Mark Unread" : "Mark Read"}
                                                                            </button>
                                                                            <button onClick={() => dismissNotif(n.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT ACTIONS / SUMMARY */}
                    <div className="w-full xl:w-80 space-y-6 flex-shrink-0">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-6 font-['Inter']">Summary</h3>
                            <div className="space-y-4">
                                {Object.keys(TYPE_META).map((k) => {
                                    const m = TYPE_META[k];
                                    const total = counts.totals[k] || 0;
                                    const unread = counts.unread[k] || 0;
                                    return (
                                        <div key={k} className="flex items-center justify-between group cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.pillBg}`}>
                                                    <m.Icon className={`w-4 h-4 ${m.dot.replace('bg-', 'text-')}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 font-['Inter']">{m.label}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{total} Total</span>
                                                </div>
                                            </div>
                                            {unread > 0 ? (
                                                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                    {unread}
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 mb-4 font-['Inter']">Quick Tools</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={markAllRead}
                                    className="w-full py-3.5 rounded-2xl bg-[#065F46] text-white font-bold text-sm shadow-md hover:bg-[#064E3B] hover:-translate-y-0.5 transition-all duration-300 font-['Inter'] flex justify-center items-center"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Read
                                </button>
                                <button
                                    onClick={() => {
                                        const ids = visible.map((n) => n.id);
                                        setDismissed((p) => Array.from(new Set([...p, ...ids])));
                                        setNotifications((p) => p.filter((n) => !ids.includes(n.id)));
                                    }}
                                    className="w-full py-3.5 rounded-2xl bg-white border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all duration-300 font-['Inter']"
                                >
                                    Dismiss Visible
                                </button>
                                <button
                                    onClick={clearDismissed}
                                    className="w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all duration-300 font-['Inter']"
                                >
                                    Restore Dismissed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}