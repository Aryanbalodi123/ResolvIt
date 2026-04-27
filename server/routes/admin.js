import express from "express";
import { Complaint } from "../models/Complaint.js";
import { User } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

async function attachUserDetails(complaints) {
  const userIds = Array.from(new Set(complaints.map((c) => String(c.user_id))));
  const users = await User.find({ rollNumber: { $in: userIds } }, { rollNumber: 1, name: 1, _id: 0 }).lean();

  const userMap = new Map(users.map((u) => [String(u.rollNumber), u]));

  return complaints.map((complaint) => ({
    ...complaint,
    user: userMap.get(String(complaint.user_id)) || null,
  }));
}

router.get("/complaints", async (_req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ created_at: -1 }).lean();
    const withUsers = await attachUserDetails(complaints);
    res.json(withUsers);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch admin complaints" });
  }
});

router.patch("/complaints/:complaintId", async (req, res) => {
  try {
    const complaintId = Number(req.params.complaintId);
    const updates = req.body || {};

    const patch = {
      assigned_to: updates.assigned_to,
      status: updates.status,
      priority: updates.priority,
    };

    if (patch.status === "resolved") {
      patch.resolved_at = new Date();
    }

    const updated = await Complaint.findOneAndUpdate(
      { complaint_id: complaintId },
      { $set: patch },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const withUser = await attachUserDetails([updated]);
    res.json(withUser[0]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update complaint" });
  }
});

export default router;
