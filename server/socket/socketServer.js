import { Server } from "socket.io";
import { verifyAuthToken } from "../utils/jwt.js";

/**
 * Room naming conventions:
 *  - Authenticated user:  "user:{rollNumber}"   → receives updates for their own complaints
 *  - Admin users:         "admin"               → receives every complaint update
 *  - Global broadcast:    "global"              → all authenticated sockets (new lost/found, etc.)
 */

let _io = null;

/**
 * Initialise the Socket.io server and attach it to an existing http.Server.
 * Must be called once during startup — before any routes need to emit events.
 *
 * @param {import("http").Server} httpServer
 * @param {string[]} allowedOrigins
 * @returns {import("socket.io").Server}
 */
export function initSocketServer(httpServer, allowedOrigins = []) {
  if (_io) return _io;

  _io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Prefer WebSocket; fall back to polling automatically
    transports: ["websocket", "polling"],
    // Ping / heartbeat settings — keep connections alive without flooding
    pingTimeout: 20000,
    pingInterval: 25000,
    // Per-message compression
    perMessageDeflate: {
      threshold: 1024,
    },
  });

  // ─── Authentication middleware ─────────────────────────────────────────────
  _io.use((socket, next) => {
    try {
      // Clients pass their JWT in the socket auth handshake:
      //   io({ auth: { token: localStorage.getItem("authToken") } })
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("UNAUTHORIZED: missing token"));
      }

      const payload = verifyAuthToken(token);
      // Attach decoded identity to the socket instance
      socket.data.rollNumber = String(payload.rollNumber || "").trim();
      socket.data.role = String(payload.role || "user").trim();
      socket.data.userId = socket.data.rollNumber;

      return next();
    } catch {
      return next(new Error("UNAUTHORIZED: invalid or expired token"));
    }
  });

  // ─── Connection handler ────────────────────────────────────────────────────
  _io.on("connection", (socket) => {
    const { rollNumber, role } = socket.data;

    // Place socket into its personal room
    socket.join(`user:${rollNumber}`);
    // Global room for system-wide broadcasts
    socket.join("global");

    // Admins also join the admin room to receive all complaint events
    if (role === "admin") {
      socket.join("admin");
    }

    // Confirm connection to the client
    socket.emit("connection:ack", {
      rollNumber,
      role,
      serverTime: new Date().toISOString(),
    });

    // ── Client can explicitly re-join rooms if needed (e.g. token refresh) ──
    socket.on("room:join", (roomName, cb) => {
      // Only allow joining own room or global; admins can join "admin"
      const allowed =
        roomName === `user:${rollNumber}` ||
        roomName === "global" ||
        (role === "admin" && roomName === "admin");

      if (allowed) {
        socket.join(roomName);
        if (typeof cb === "function") cb({ ok: true });
      } else {
        if (typeof cb === "function") cb({ ok: false, error: "Forbidden" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] ${rollNumber} (${role}) disconnected — ${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`[socket] Error for ${rollNumber}:`, err.message);
    });
  });

  console.log("[socket] Socket.io server initialised");
  return _io;
}

/**
 * Returns the initialised Socket.io instance.
 * Throws if called before initSocketServer().
 */
export function getIO() {
  if (!_io) {
    throw new Error(
      "Socket.io server has not been initialised. Call initSocketServer() first."
    );
  }
  return _io;
}

// ─── Typed event emitters ──────────────────────────────────────────────────
// These are the canonical functions used by route handlers to push events.
// Using explicit functions instead of raw io.to().emit() keeps the event
// contract in a single place and makes future changes easy.

/**
 * Notify the owner of a complaint (and all admins) that its status / fields changed.
 *
 * @param {{ complaint_id: number, user_id: string, status: string, priority: string, assigned_to: string, updated_at: string }} complaint
 */
export function emitComplaintUpdated(complaint) {
  const io = getIO();
  const payload = buildComplaintPayload(complaint);

  // Emit to the specific user who owns the complaint
  io.to(`user:${complaint.user_id}`).emit("complaint:updated", payload);

  // Emit to all admins (so admin dashboards refresh live)
  io.to("admin").emit("complaint:updated", payload);
}

/**
 * Notify all connected clients that a new complaint was filed.
 * Admins see it on their dashboard; users don't need it (they already have it).
 *
 * @param {{ complaint_id: number, user_id: string, status: string }} complaint
 */
export function emitComplaintCreated(complaint) {
  const io = getIO();
  const payload = buildComplaintPayload(complaint);

  // Only admins receive "new complaint" notifications in real time
  io.to("admin").emit("complaint:created", payload);
}

/**
 * Broadcast a system-level notification to all authenticated users.
 *
 * @param {{ title: string, message: string, type?: string }} data
 */
export function emitSystemNotification(data) {
  const io = getIO();
  io.to("global").emit("notification:system", {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildComplaintPayload(complaint) {
  return {
    complaint_id: complaint.complaint_id,
    user_id: complaint.user_id,
    title: complaint.title,
    status: complaint.status,
    priority: complaint.priority,
    assigned_to: complaint.assigned_to,
    complaint_image: complaint.complaint_image || "",
    resolved_at: complaint.resolved_at ?? null,
    updated_at: complaint.updated_at || complaint.updatedAt || new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };
}
