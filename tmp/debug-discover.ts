
import { DatabaseStorage } from './server/storage';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const storage = new DatabaseStorage();
    console.log("Fetching public campaigns...");
    const campaigns = await storage.getPublicCampaigns({});
    console.log("Result length:", campaigns.length);
    if (campaigns.length > 0) {
      console.log("First campaign:", JSON.stringify(campaigns[0], null, 2));
    }
  } catch (error) {
    console.error("DEBUG ERROR:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
