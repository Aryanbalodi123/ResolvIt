import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, Clock, AlertCircle, Info, X, Zap } from "lucide-react";
import { useComplaintUpdates } from "../hooks/useComplaintUpdates";

// ─────────────────────────────────────────────────────────────────────────────
// Status metadata
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  resolved: {
    icon: CheckCircle,
    bg: "bg-[#065F46]",
    border: "border-green-400/40",
    text: "Complaint Resolved",
    sub: (title) => `"${title}" has been marked as resolved.`,
  },
  "in-progress": {
    icon: Clock,
    bg: "from-blue-500 to-indigo-500",
    border: "border-blue-400/40",
    text: "Complaint In Progress",
    sub: (title) => `"${title}" is now being worked on.`,
  },
  pending: {
    icon: AlertCircle,
    bg: "from-amber-500 to-green-500",
    border: "border-amber-400/40",
    text: "Complaint Pending",
    sub: (title) => `"${title}" has been moved back to pending.`,
  },
};

const DEFAULT_CONFIG = {
  icon: Info,
  bg: "from-gray-600 to-gray-700",
  border: "border-gray-400/40",
  text: "Complaint Updated",
  sub: (title) => `"${title}" has been updated.`,
};

const AUTO_DISMISS_MS = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
  const config = STATUS_CONFIG[toast.status] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Entrance animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto dismiss
  useEffect(() => {
    const t = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 350);
  }

  return (
    <div
      className={`relative flex items-start gap-3 w-full max-w-sm rounded-2xl border shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-350 ${config.border} bg-white/95
        ${visible && !exiting ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      role="alert"
      aria-live="polite"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1  ${config.bg}`} />

      {/* Icon */}
      <div className={`ml-4 mt-3.5 flex-shrink-0 w-9 h-9 rounded-xl  ${config.bg} flex items-center justify-center shadow-lg`}>
        <Icon className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
      </div>

      {/* Content */}
      <div className="flex-1 py-3 pr-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">{config.text}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
              {config.sub(toast.title || `Complaint #${toast.complaint_id}`)}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 font-medium">Just now</p>
          </div>

          <button
            onClick={dismiss}
            className="flex-shrink-0 mt-0.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-1 right-0 h-0.5 bg-gray-100">
          <div
            className={`h-full  ${config.bg} origin-left`}
            style={{
              animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast Container — renders fixed in bottom-right, stacks toasts
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveToastContainer() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const addToast = (payload) => {
    const id = nextId.current++;
    setToasts((prev) => {
      // Cap at 4 simultaneous toasts — drop the oldest
      const capped = prev.length >= 4 ? prev.slice(1) : prev;
      return [...capped, { id, ...payload }];
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useComplaintUpdates({
    onUpdated: (payload) => {
      // Don't toast for brand-new pending complaints (that's a create event)
      addToast(payload);
    },
    onSystemNotification: (payload) => {
      addToast({
        complaint_id: null,
        title: payload.title,
        status: "info",
        message: payload.message,
      });
    },
  });

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        aria-label="Live notifications"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <ToastItem toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
}
