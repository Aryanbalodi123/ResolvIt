import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:4000";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const SocketContext = createContext(null);

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside <SocketProvider>");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // ── Initialise socket connection ──────────────────────────────────────────
  const connect = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Don't connect if user is not logged in

    // If a socket already exists and is connected, reuse it
    if (socketRef.current?.connected) return;

    // Tear down any previous disconnected socket before creating a new one
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      // Randomised jitter prevents thundering-herd on server restart
      randomizationFactor: 0.5,
      timeout: 10000,
      withCredentials: true,
    });

    // ── Core lifecycle events ───────────────────────────────────────────────
    socket.on("connect", () => {
      setConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      // "io server disconnect" means the server intentionally dropped us;
      // don't auto-reconnect in that case (it'll loop on auth failure).
      if (reason === "io server disconnect") {
        socket.connect(); // re-auth and reconnect
      }
    });

    socket.on("connect_error", (err) => {
      setConnectionError(err.message);
      setConnected(false);
    });

    socketRef.current = socket;
  }, []);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnectionError(null);
    }
  }, []);

  // ── Connect on mount, disconnect on unmount ─────────────────────────────
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // ── Re-connect when auth token changes (e.g. login / logout) ───────────
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "authToken") {
        if (e.newValue) {
          disconnect();
          // Small delay to let logout state settle before reconnecting
          setTimeout(connect, 100);
        } else {
          disconnect();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [connect, disconnect]);

  // ── Stable event subscription helper ───────────────────────────────────
  /**
   * Subscribe to a socket event. The listener is automatically cleaned up
   * when the calling component unmounts.
   *
   * Usage inside a component:
   *   const { on } = useSocket();
   *   useEffect(() => on("complaint:updated", handler), [on]);
   *
   * @param {string} event
   * @param {(...args: any[]) => void} listener
   * @returns {() => void} Cleanup function
   */
  const on = useCallback((event, listener) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, []);

  const value = {
    /** The raw socket.io-client Socket instance (use sparingly; prefer `on`) */
    socket: socketRef,
    /** Whether the socket is currently connected */
    connected,
    /** Last connection error message, or null */
    connectionError,
    /** Subscribe to a socket event, returns a cleanup function */
    on,
    /** Force reconnect (e.g. after login) */
    connect,
    /** Disconnect (e.g. on logout) */
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
