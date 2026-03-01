import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set. Please add it to your Vercel project settings.");
  }

  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    const db = await mongoose.connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = db.connection.readyState === 1;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

export default mongoose;
