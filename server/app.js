import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import complaintsRoutes from "./routes/complaints.js";
import adminRoutes from "./routes/admin.js";
import lostFoundRoutes from "./routes/lostFound.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "resolvit-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lost-found", lostFoundRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
