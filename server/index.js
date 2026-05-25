import { createServer } from "http";
import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocketServer } from "./socket/socketServer.js";

const PORT = Number(process.env.API_PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [];

async function start() {
  await connectDB(MONGODB_URI);

  const httpServer = createServer(app);

  initSocketServer(httpServer, ALLOWED_ORIGINS);

  httpServer.listen(PORT, () => {
    console.log(`API server + WebSocket running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
