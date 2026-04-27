import express from "express";
import { User } from "../models/User.js";
import { Complaint } from "../models/Complaint.js";
import { LostFound } from "../models/LostFound.js";
import { asRollNumber } from "../utils/normalize.js";
import { requireAuth, requireSameUserOrAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use("/:rollNumber", requireSameUserOrAdmin);

router.get("/:rollNumber", async (req, res) => {
  try {
    const rollNumber = asRollNumber(req.params.rollNumber);
    const user = await User.findOne({ rollNumber }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch user" });
  }
});

router.put("/:rollNumber", async (req, res) => {
  try {
    const rollNumber = asRollNumber(req.params.rollNumber);
    const updates = {};

    if (typeof req.body?.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (typeof req.body?.email === "string") {
      updates.email = req.body.email.trim().toLowerCase();
    }

    const user = await User.findOneAndUpdate({ rollNumber }, { $set: updates }, { new: true }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update user" });
  }
});

router.get("/:rollNumber/complaints", async (req, res) => {
  try {
    const rollNumber = asRollNumber(req.params.rollNumber);
    const complaints = await Complaint.find({ user_id: rollNumber })
      .sort({ created_at: -1 })
      .lean();

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch complaints" });
  }
});

router.get("/:rollNumber/lost-items", async (req, res) => {
  try {
    const rollNumber = asRollNumber(req.params.rollNumber);
    const items = await LostFound.find({ user_id: rollNumber }).sort({ date_lost: -1 }).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch lost items" });
  }
});

export default router;
