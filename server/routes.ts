import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertProfileSchema, updateProfileSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function ensureAuthenticated(req: Request, res: Response, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function ensureAdmin(req: Request, res: Response, next: any) {
  if (req.isAuthenticated() && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

/** True if profile can browse startups: dedicated investor, or approved partner who selected "Investor" */
function canActAsInvestor(profile: any): boolean {
  return !!profile && (
    profile.type === "investor" ||
    (profile.type === "partner" && profile.partner_type === "Investor" && !!profile.approved)
  );
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

  // Dashboard Initialization (Consolidated for performance)
  app.get("/api/dashboard-init", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;

      // Fetch profile first as it determines if we need connections/matches
      const profile = await storage.getProfileByUserId(userId);

      if (!profile) {
        return res.json({ user: req.user, profile: null });
      }

      const promises: any = {};

      // Fetch connections if applicable
      if (canActAsInvestor(profile) || profile.type === 'startup') {
        promises.connections = canActAsInvestor(profile)
          ? storage.getConnectionsByInvestor(userId)
          : storage.getConnectionsByStartup(userId);
      }

      // Fetch matches if investor
      if (canActAsInvestor(profile)) {
        promises.matches = storage.getMatchesForInvestor(userId, 10);
      }

      const results = await Promise.all(Object.values(promises));
      const response: any = {
        user: { ...req.user, id: req.user._id?.toString() || req.user.id },
        profile
      };

      Object.keys(promises).forEach((key, index) => {
        response[key] = results[index];
      });

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Profile Routes
  app.get("/api/profile", ensureAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.user.googleId || req.user.id);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      return res.json(profile);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Generic upsert for any profile type
  app.put("/api/profile", ensureAuthenticated, async (req: any, res) => {
    try {
      const { type, ...profileData } = req.body;
      if (!type) return res.status(400).json({ message: "Profile type is required" });

      const data = await storage.upsertProfile(
        req.user._id?.toString() || req.user.id,
        req.user.email,
        profileData,
        type
      );
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  });

  // Patch (partial update) the current user's profile
  app.patch("/api/profile", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const data = await storage.patchProfile(userId, req.body);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  });


  // Admin Routes
  app.get("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const type = req.query.type as string;
      if (!type) return res.status(400).json({ message: "Type is required" });
      const profiles = await storage.getAllProfiles(type);
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const id = req.query.id as string;
      const type = req.query.type as string;
      const { approved } = req.body;

      if (!id || !type) return res.status(400).json({ message: "ID and Type are required" });

      const result = await storage.updateProfileApproval(type, id, approved);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const id = req.query.id as string;
      const type = req.query.type as string;

      if (!id || !type) return res.status(400).json({ message: "ID and Type are required" });

      await storage.deleteProfile(type, id);
      res.json({ message: "Profile deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Analytics Endpoints
  app.get("/api/admin/analytics/overview", ensureAdmin, async (req, res) => {
    try {
      const totalUsers = await storage.getAllUsers();
      const mau = await storage.getActiveUsersCount(30);
      const dau = await storage.getActiveUsersCount(1);
      const connectionMetrics = await storage.getConnectionMetrics();
      const marketplaceHealth = await storage.getMarketplaceHealth();

      res.json({
        totalUsers: totalUsers.length,
        mau,
        dau,
        engagementRate: totalUsers.length > 0 ? ((mau / totalUsers.length) * 100).toFixed(2) : "0.00",
        totalConnections: connectionMetrics.total,
        acceptanceRate: connectionMetrics.acceptanceRate,
        startupCount: marketplaceHealth.startupCount,
        investorCount: marketplaceHealth.investorCount,
        partnerCount: marketplaceHealth.partnerCount
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/growth", ensureAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const growthData = await storage.getUserGrowthTrends(start, end);

      // Calculate cumulative totals
      let cumulativeTotal = 0;
      const enrichedData = growthData.map(item => {
        cumulativeTotal += item.count;
        return {
          ...item,
          cumulative: cumulativeTotal
        };
      });

      res.json({
        trends: enrichedData,
        totalNewUsers: growthData.reduce((sum, item) => sum + item.count, 0)
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/engagement", ensureAdmin, async (req, res) => {
    try {
      const funnelData = await storage.getEngagementFunnel();
      res.json(funnelData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/marketplace", ensureAdmin, async (req, res) => {
    try {
      const marketplaceHealth = await storage.getMarketplaceHealth();
      const connectionMetrics = await storage.getConnectionMetrics();

      res.json({
        ...marketplaceHealth,
        connections: connectionMetrics
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/cohorts", ensureAdmin, async (req, res) => {
    try {
      const cohortData = await storage.getCohortData();
      res.json(cohortData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/waitlist", ensureAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== Intent Management Endpoints ====================

  // AI Intent Parsing Helper
  async function parseIntentWithAI(userText: string, profileType: string) {
    const systemPrompt = `You are an intent parser for Prodizzy, a networking platform for startups, partners, and individuals.

User's profile type: ${profileType}

Parse the user's natural language description into a structured intent object.

Possible intent types:
- For Startups: hiring, fundraising, partnerships, promotions, validation
- For Partners: clients, dealflow, partnerships
- For Individuals: jobs, freelance, internship, collaboration

Extract relevant metadata based on intent type. Be generous with interpretation - if information is missing, use reasonable defaults or mark as "not specified".

IMPORTANT: Response must be valid JSON in this format:
{
  "intent_type": "...",
  "confidence": 0-100,
  "metadata": { ... intent-specific fields ... }
}

If you're unsure about the intent type (confidence < 60), return:
{
  "intent_type": "unclear",
  "confidence": <score>,
  "suggestions": ["possible intent 1", "possible intent 2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // POST /api/intents/parse-ai - Parse natural language into structured intent
  app.post("/api/intents/parse-ai", ensureAuthenticated, async (req: any, res) => {
    try {
      const { text, profile_type } = req.body;

      if (!text || !profile_type) {
        return res.status(400).json({ message: "text and profile_type are required" });
      }

      const parsed = await parseIntentWithAI(text, profile_type);
      res.json(parsed);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/intents - Create new intent
  app.post("/api/intents", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const { profile_type, intent_type, metadata } = req.body;

      if (!profile_type || !intent_type) {
        return res.status(400).json({ message: "profile_type and intent_type are required" });
      }

      const intent = await storage.createIntent(userId, { profile_type, intent_type, metadata });
      res.status(201).json(intent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/intents - Get user's intents
  app.get("/api/intents", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const status = req.query.status as string | undefined;

      const intents = await storage.getUserIntents(userId, status);
      res.json(intents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH /api/intents/:id - Update intent
  app.patch("/api/intents/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const intentId = req.params.id;

      const intent = await storage.updateIntent(intentId, userId, req.body);
      res.json(intent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE /api/intents/:id - Delete intent
  app.delete("/api/intents/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const intentId = req.params.id;

      await storage.deleteIntent(intentId, userId);
      res.json({ message: "Intent deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/matches/intents - Get matches for user's active intents
  app.get("/api/matches/intents", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;

      const matches = await storage.getMatchesForUserIntents(userId, limit);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/matches/intents/:intentId - Get matches for specific intent
  app.get("/api/matches/intents/:intentId", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const intentId = req.params.intentId;
      const limit = parseInt(req.query.limit as string) || 20;

      const matches = await storage.getMatchesForIntent(intentId, userId, limit);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== Matchmaking Endpoints ====================

  // GET /api/discover - Investor browse startups
  app.get("/api/discover", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;

      const profile = await storage.getProfileByUserId(userId);
      if (!profile || !canActAsInvestor(profile)) {
        return res.status(403).json({ message: "Investor profile required" });
      }

      const filters = {
        industry: req.query.industry as string,
        stage: req.query.stage as string,
        location: req.query.location as string,
      };

      const startups = await storage.getApprovedStartupsForInvestor(filters);
      res.json(startups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/connections - Create connection (supports both legacy and generic)
  app.post("/api/connections", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const { startup_id, target_id, message, intent_id } = req.body;

      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Legacy format (investor → startup)
      if (startup_id && !target_id) {
        if (!canActAsInvestor(profile)) {
          return res.status(403).json({ message: "Investor profile required" });
        }
        const connection = await storage.createConnection(userId, startup_id, message);
        return res.status(201).json(connection);
      }

      // New generic format (intent-based matching)
      if (target_id) {
        const targetProfile = await storage.getProfileByUserId(target_id);
        if (!targetProfile) {
          return res.status(404).json({ message: "Target profile not found" });
        }

        const connection = await storage.createGenericConnection(
          userId,
          target_id,
          profile.type,
          targetProfile.type,
          message,
          intent_id
        );
        return res.status(201).json(connection);
      }

      return res.status(400).json({ message: "Either startup_id or target_id is required" });
    } catch (error: any) {
      if (error.message === "Connection already exists") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/connections - Get user's connections (supports all profile types)
  app.get("/api/connections", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Try generic connections first
      const genericConnections = await storage.getConnectionsByUser(userId);
      if (genericConnections && genericConnections.length > 0) {
        return res.json(genericConnections);
      }

      // Fallback to legacy connections for backward compatibility
      let connections;
      if (canActAsInvestor(profile)) {
        connections = await storage.getConnectionsByInvestor(userId);
      } else if (profile.type === 'startup') {
        connections = await storage.getConnectionsByStartup(userId);
      } else {
        connections = [];
      }

      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/connections/received - Get received connection requests
  app.get("/api/connections/received", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connections = await storage.getReceivedConnectionRequests(userId);
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/connections/sent - Get sent connection requests
  app.get("/api/connections/sent", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connections = await storage.getSentConnectionRequests(userId);
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/connections/:id/accept - Accept connection
  app.post("/api/connections/:id/accept", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connectionId = req.params.id;
      const connection = await storage.acceptConnection(connectionId, userId);
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/connections/:id/decline - Decline connection
  app.post("/api/connections/:id/decline", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connectionId = req.params.id;
      const connection = await storage.declineConnection(connectionId, userId);
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH /api/connections/:id - Accept/decline connection (legacy)
  app.patch("/api/connections/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connectionId = req.params.id;
      const { status } = req.body;

      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'accepted' or 'declined'" });
      }

      const connection = await storage.updateConnectionStatus(connectionId, userId, status);
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/matches - Get recommended matches for investor
  app.get("/api/matches", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);

      if (!profile || !canActAsInvestor(profile)) {
        return res.status(403).json({ message: "Investor profile required" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const matches = await storage.getMatchesForInvestor(userId, limit);

      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


  return httpServer;
}

