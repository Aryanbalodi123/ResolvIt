import express from "express";
import { LostFound } from "../models/LostFound.js";
import { getNextNumericId } from "../utils/nextId.js";
import { asRollNumber } from "../utils/normalize.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

function mapPayload(payload, type) {
  return {
    title: payload.title,
    description: payload.description,
    location: payload.location,
    category: payload.category,
    contact_details: payload.contactDetails,
    date_lost: payload.dateLost || payload.dateFound || payload.date_lost || new Date(),
    distinguishing_features: payload.distinguishingFeatures || payload.distinguishing_features || "",
    isResolved: Boolean(payload.isResolved ?? false),
    user_id: asRollNumber(payload.user_id),
    type,
  };
}

router.post("/lost", async (req, res) => {
  try {
    const requestUserId = asRollNumber(req.body?.user_id);
    if (req.auth?.role !== "admin" && requestUserId !== String(req.auth?.rollNumber || "")) {
      return res.status(403).json({ message: "Cannot create record for another user" });
    }

    const lostId = await getNextNumericId(LostFound, "lost_id");
    const created = await LostFound.create({
      lost_id: lostId,
      ...mapPayload(req.body || {}, "lost"),
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to report lost item" });
  }
});

router.post("/found", async (req, res) => {
  try {
    const requestUserId = asRollNumber(req.body?.user_id);
    if (req.auth?.role !== "admin" && requestUserId !== String(req.auth?.rollNumber || "")) {
      return res.status(403).json({ message: "Cannot create record for another user" });
    }

    const lostId = await getNextNumericId(LostFound, "lost_id");
    const created = await LostFound.create({
      lost_id: lostId,
      ...mapPayload(req.body || {}, "found"),
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to report found item" });
  }
});

router.get("/lost", async (_req, res) => {
  try {
    const items = await LostFound.find({ type: "lost" }).sort({ lost_id: -1 }).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch lost items" });
  }
});

router.get("/found", async (_req, res) => {
  try {
    const items = await LostFound.find({ type: "found" }).sort({ lost_id: -1 }).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch found items" });
  }
});

router.delete("/:lostId", async (req, res) => {
  try {
    const lostId = Number(req.params.lostId);
    if (req.auth?.role === "admin") {
      await LostFound.deleteOne({ lost_id: lostId });
      return res.status(204).send();
    }

    await LostFound.deleteOne({
      lost_id: lostId,
      user_id: String(req.auth?.rollNumber || ""),
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete item" });
  }
});

export default router;
