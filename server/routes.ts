
import type { Express } from "express";
import type { Server } from "http";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertProfileSchema, updateProfileSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

async function getUserFromRequest(req: any): Promise<{ id: string; email: string; token: string } | null> {
  const token = req.headers.authorization?.slice(7);
  if (!token) return null;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      token
    };
  } catch (error) {
    console.error("Firebase auth error:", error);
    return null;
  }
}

// DB client that carries the user's JWT so RLS auth.uid() resolves correctly
// DB client that uses either a Service Role Key (bypassing RLS) or the ANON_KEY
function dbClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
  return createClient(process.env.SUPABASE_URL!, key);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.waitlist.create.path, async (req, res) => {
    try {
      const input = api.waitlist.create.input.parse(req.body);

      const existing = await storage.getWaitlistEntryByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "This email is already on the waitlist." });
      }

      const entry = await storage.createWaitlistEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // GET /api/profile
  app.get(api.profile.get.path, async (req, res) => {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { data, error } = await dbClient()
      .from("startup_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Profile not found" });
    return res.json(data);
  });

  // PUT /api/profile — full upsert after onboarding
  app.put(api.profile.upsert.path, async (req, res) => {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      const input = insertProfileSchema.parse(req.body);
      const { data, error } = await dbClient()
        .from("startup_profiles")
        .upsert(
          { user_id: user.id, email: user.email, ...input, onboarding_completed: true },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // PATCH /api/profile — progressive profiling updates
  app.patch(api.profile.update.path, async (req, res) => {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      const patch = updateProfileSchema.parse(req.body);
      const { data, error } = await dbClient()
        .from("startup_profiles")
        .update(patch)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
