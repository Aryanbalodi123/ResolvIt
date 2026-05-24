import { useCallback, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * useComplaintUpdates
 *
 * Subscribes to real-time complaint events from the server and calls
 * the appropriate callback. Designed to be used inside components that
 * display complaint lists or details.
 *
 * @param {object} handlers
 * @param {(payload: ComplaintPayload) => void} [handlers.onUpdated]
 *   Called when an existing complaint's status / priority / assignment changes.
 *   Payload includes: complaint_id, user_id, status, priority, assigned_to,
 *                     resolved_at, updated_at, timestamp
 *
 * @param {(payload: ComplaintPayload) => void} [handlers.onCreated]
 *   Called when a new complaint is filed (admins only — server sends this only
 *   to users in the "admin" room).
 *
 * @param {(payload: SystemNotification) => void} [handlers.onSystemNotification]
 *   Called for system-wide broadcasts.
 *
 * @example
 * // Inside Complaints.jsx:
 * useComplaintUpdates({
 *   onUpdated: (payload) => {
 *     setComplaints(prev =>
 *       prev.map(c => c.complaint_id === payload.complaint_id ? { ...c, ...payload } : c)
 *     );
 *   },
 * });
 */
export function useComplaintUpdates({ onUpdated, onCreated, onSystemNotification } = {}) {
  const { on, connected } = useSocket();

  // Keep handler refs stable so we don't re-subscribe on every render
  const onUpdatedRef = useRef(onUpdated);
  const onCreatedRef = useRef(onCreated);
  const onSystemRef = useRef(onSystemNotification);

  useEffect(() => { onUpdatedRef.current = onUpdated; }, [onUpdated]);
  useEffect(() => { onCreatedRef.current = onCreated; }, [onCreated]);
  useEffect(() => { onSystemRef.current = onSystemNotification; }, [onSystemNotification]);

  // ── complaint:updated ──────────────────────────────────────────────────────
  useEffect(() => {
    return on("complaint:updated", (payload) => {
      onUpdatedRef.current?.(payload);
    });
  }, [on]);

  // ── complaint:created ──────────────────────────────────────────────────────
  useEffect(() => {
    return on("complaint:created", (payload) => {
      onCreatedRef.current?.(payload);
    });
  }, [on]);

  // ── notification:system ────────────────────────────────────────────────────
  useEffect(() => {
    return on("notification:system", (payload) => {
      onSystemRef.current?.(payload);
    });
  }, [on]);

  return { connected };
}

/**
 * useLiveComplaintList
 *
 * Higher-level hook that manages a complaint list with live updates.
 * Automatically patches, prepends, or removes items as socket events arrive.
 *
 * @param {Array} initialComplaints - The initial fetched list
 * @param {Function} setComplaints  - State setter from useState
 * @param {object}  [options]
 * @param {string}  [options.userRollNumber] - When set, only processes updates
 *                  for complaints owned by this user (client-side safety guard)
 */
export function useLiveComplaintList(initialComplaints, setComplaints, options = {}) {
  const { userRollNumber } = options;

  const handleUpdated = useCallback((payload) => {
    // Optional: guard so user pages only react to their own complaints
    if (userRollNumber && String(payload.user_id) !== String(userRollNumber)) {
      return;
    }

    setComplaints((prev) => {
      const index = prev.findIndex((c) => c.complaint_id === payload.complaint_id);
      if (index === -1) return prev; // Not in this user's list; ignore

      const updated = [...prev];
      updated[index] = { ...updated[index], ...payload };
      return updated;
    });
  }, [setComplaints, userRollNumber]);

  const handleCreated = useCallback((payload) => {
    // Only admins receive this; prepend to list
    setComplaints((prev) => {
      // Avoid duplicates if the REST response already added it
      if (prev.some((c) => c.complaint_id === payload.complaint_id)) return prev;
      return [payload, ...prev];
    });
  }, [setComplaints]);

  const { connected } = useComplaintUpdates({
    onUpdated: handleUpdated,
    onCreated: handleCreated,
  });

  return { connected };
}
