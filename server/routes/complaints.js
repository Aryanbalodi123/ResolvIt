import express from "express";
import { Complaint } from "../models/Complaint.js";
import { User } from "../models/User.js";
import { getNextNumericId } from "../utils/nextId.js";
import { asRollNumber } from "../utils/normalize.js";
import { requireAuth } from "../middleware/auth.js";
import { emitComplaintCreated } from "../socket/socketServer.js";
import { sendComplaintCreatedEmail } from "../utils/email.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    const requestUserId = asRollNumber(payload.user_id);

    if (req.auth?.role !== "admin" && requestUserId !== String(req.auth?.rollNumber || "")) {
      return res.status(403).json({ message: "Cannot create complaint for another user" });
    }

    const complaintId = await getNextNumericId(Complaint, "complaint_id");

    const created = await Complaint.create({
      complaint_id: complaintId,
      user_id: asRollNumber(payload.user_id),
      title: String(payload.title || "").trim(),
      description: String(payload.description || "").trim(),
      status: payload.status || "pending",
      location: payload.location || "",
      category: payload.category || "",
      priority: payload.priority || "medium",
      assigned_to: payload.assigned_to || "",
    });

    // ── Real-time push: notify admins a new complaint has arrived ─────────
    try {
      emitComplaintCreated(created.toObject());
    } catch (socketErr) {
      console.error("[socket] emitComplaintCreated failed:", socketErr.message);
    }

    // ── Email Notification ──────────────────────────────────────────────────
    try {
      const user = await User.findOne({ rollNumber: created.user_id }).lean();
      if (user) {
        // Send email asynchronously without blocking the response
        sendComplaintCreatedEmail(user, created).catch(err => 
          console.error("[email] Background send failed:", err.message)
        );
      }
    } catch (emailErr) {
      console.error("[email] Failed to trigger creation email:", emailErr.message);
    }

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create complaint" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ created_at: -1 }).lean();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch complaints" });
  }
});

export default router;
