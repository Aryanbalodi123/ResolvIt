import mongoose from "mongoose";

let connectionPromise;

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      dbName: "resolvit",
    });
  }

  await connectionPromise;
  return mongoose.connection;
}
