import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocketServer } from "./socket/socketServer.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PORT = Number(process.env.API_PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;

// Allowed origins for CORS / Socket.io — extend via env var in production
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:4000"];

async function start() {
  await connectDB(MONGODB_URI);

  // Wrap Express in a plain http.Server so Socket.io can share the same port
  const httpServer = createServer(app);

  // Initialise Socket.io — must happen before routes try to emit events
  initSocketServer(httpServer, ALLOWED_ORIGINS);

  httpServer.listen(PORT, () => {
    console.log(`API server + WebSocket running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
