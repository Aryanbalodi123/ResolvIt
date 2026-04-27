import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config({ path: ".env.local" });

dotenv.config();

const PORT = Number(process.env.API_PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  await connectDB(MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});
