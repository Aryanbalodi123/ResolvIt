import { verifyAuthToken } from "../utils/jwt.js";

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice(7).trim();
}

export function requireAuth(req, res, next) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const payload = verifyAuthToken(token);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

export function requireSameUserOrAdmin(req, res, next) {
  const requestedRoll = String(req.params.rollNumber || "").trim();
  const authRoll = String(req.auth?.rollNumber || "").trim();

  if (req.auth?.role === "admin" || requestedRoll === authRoll) {
    return next();
  }

  return res.status(403).json({ message: "Forbidden" });
}
