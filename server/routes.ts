import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertProfileSchema, updateProfileSchema, insertBusinessSchema, updateBusinessSchema, inviteTeamMemberSchema, updateTeamMemberSchema, insertCampaignSchema, updateCampaignSchema, insertCampaignApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { sendInviteEmail } from "./email";
import { handleCampaignSSR } from "./ssr";

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

/** Business Access Control Middleware */
async function ensureBusinessOwner(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const businessId = req.params.id || req.params.businessId;
  const userId = (req.user as any)._id?.toString() || (req.user as any).id;

  try {
    const business = await storage.getBusinessById(businessId as string);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.owner_user_id !== userId) {
      return res.status(403).json({ message: "Only business owner can perform this action" });
    }

    (req as any).business = business;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function ensureBusinessAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const businessId = req.params.id || req.params.businessId;
  const userId = (req.user as any)._id?.toString() || (req.user as any).id;

  try {
    const business = await storage.getBusinessById(businessId as string);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Check if owner
    if (business.owner_user_id === userId) {
      (req as any).business = business;
      (req as any).userRole = "owner";
      return next();
    }

    // Check if admin/member
    const members = await storage.getTeamMembers(businessId as string);
    const member = members.find(m => m.user_id === userId);

    if (!member || member.invite_status !== "accepted") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (member.role !== "admin" && member.role !== "owner") {
      return res.status(403).json({ message: "Admin access required" });
    }

    (req as any).business = business;
    (req as any).userRole = member.role;
    (req as any).membership = member;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function ensureBusinessMember(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const businessId = req.params.id || req.params.businessId;
  const userId = (req.user as any)._id?.toString() || (req.user as any).id;

  try {
    const business = await storage.getBusinessById(businessId as string);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Check if owner
    if (business.owner_user_id === userId) {
      (req as any).business = business;
      (req as any).userRole = "owner";
      return next();
    }

    // Check if member
    const members = await storage.getTeamMembers(businessId as string);
    const member = members.find(m => m.user_id === userId);

    if (!member || member.invite_status !== "accepted") {
      return res.status(403).json({ message: "Access denied" });
    }

    (req as any).business = business;
    (req as any).userRole = member.role;
    (req as any).membership = member;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
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

  // SSR for campaign pages (must be before static file serving)
  app.get("/c/:id", handleCampaignSSR);

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

  // POST /api/admin/purge-legacy - Bulk delete all old Startup and Partner profiles
  app.post("/api/admin/purge-legacy", ensureAdmin, async (req, res) => {
    try {
      const result = await storage.purgeLegacyProfiles();
      res.json({ message: "Legacy profiles purged", ...result });
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
        individualCount: marketplaceHealth.individualCount,
        businessCount: marketplaceHealth.businessCount,
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

  // POST /api/connections - Investor expresses interest
  app.post("/api/connections", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const { startup_id, message } = req.body;

      if (!startup_id) {
        return res.status(400).json({ message: "startup_id is required" });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (!profile || !canActAsInvestor(profile)) {
        return res.status(403).json({ message: "Investor profile required" });
      }

      const connection = await storage.createConnection(userId, startup_id, message);
      res.status(201).json(connection);
    } catch (error: any) {
      if (error.message === "Connection already exists") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/connections - Get user's connections
  app.get("/api/connections", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      let connections;
      if (canActAsInvestor(profile)) {
        connections = await storage.getConnectionsByInvestor(userId);
      } else if (profile.type === 'startup') {
        connections = await storage.getConnectionsByStartup(userId);
      } else {
        return res.status(403).json({ message: "Only investors and startups can view connections" });
      }

      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PATCH /api/connections/:id - Accept/decline connection
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

  // =============================================
  // BUSINESS ROUTES
  // =============================================

  // Create business profile
  app.post("/api/business", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const ownerEmail = req.user.email;
      if (!ownerEmail) {
        return res.status(400).json({ message: "User email is required to create a business" });
      }
      const input = insertBusinessSchema.parse(req.body);

      const business = await storage.createBusiness(userId, input, ownerEmail);
      res.status(201).json(business);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Get user's businesses (owned + member)
  app.get("/api/business", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const businesses = await storage.getUserBusinesses(userId);
      res.json(businesses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get specific business
  app.get("/api/business/:id", ensureAuthenticated, ensureBusinessMember, async (req: any, res) => {
    try {
      // Business already loaded by middleware
      res.json(req.business);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update business (owner/admin only)
  app.patch("/api/business/:id", ensureAuthenticated, ensureBusinessAdmin, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      const updates = updateBusinessSchema.parse(req.body);

      const business = await storage.updateBusiness(businessId, updates);
      res.json(business);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Delete business (owner only)
  app.delete("/api/business/:id", ensureAuthenticated, ensureBusinessOwner, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      await storage.deleteBusiness(businessId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================
  // TEAM MEMBER ROUTES
  // =============================================

  // Invite team member
  app.post("/api/business/:id/members", ensureAuthenticated, ensureBusinessAdmin, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;
      const input = inviteTeamMemberSchema.parse(req.body);

      const member = await storage.inviteTeamMember(
        businessId,
        input.email,
        userId,
        input.role,
        input.permissions
      );

      // Send invite email
      const business = await storage.getBusinessById(businessId);
      const inviterName = req.user.displayName || req.user.email || "A team member";

      await sendInviteEmail(
        input.email,
        business.business_name,
        inviterName,
        member.invite_token
      );

      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Get team members
  app.get("/api/business/:id/members", ensureAuthenticated, ensureBusinessMember, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      const members = await storage.getTeamMembers(businessId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update team member (owner/admin only)
  app.patch("/api/business/:id/members/:memberId", ensureAuthenticated, ensureBusinessAdmin, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      const memberId = req.params.memberId;
      const updates = updateTeamMemberSchema.parse(req.body);

      const member = await storage.updateTeamMember(businessId, memberId, updates);
      res.json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Remove team member (owner/admin only)
  app.delete("/api/business/:id/members/:memberId", ensureAuthenticated, ensureBusinessAdmin, async (req: any, res) => {
    try {
      const businessId = req.params.id;
      const memberId = req.params.memberId;

      await storage.removeTeamMember(businessId, memberId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================
  // INVITE TOKEN ROUTES (Public)
  // =============================================

  // Verify invite token (public - no auth required)
  app.get("/api/invite/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const member = await storage.getTeamMemberByToken(token);

      if (!member) {
        return res.status(404).json({ message: "Invalid or expired invite" });
      }

      if (member.invite_status !== "pending") {
        return res.status(400).json({ message: "Invite already used" });
      }

      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Accept invite
  app.post("/api/invite/:token/accept", ensureAuthenticated, async (req: any, res) => {
    try {
      const token = req.params.token;
      const userId = req.user._id?.toString() || req.user.id;

      const member = await storage.acceptInvite(token, userId);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================
  // CAMPAIGN ROUTES
  // =============================================

  // Create campaign (business members with permission)
  app.post("/api/business/:businessId/campaigns", ensureAuthenticated, async (req: any, res) => {
    try {
      const businessId = req.params.businessId;
      const userId = req.user._id?.toString() || req.user.id;

      // Check if user has permission to create campaigns
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Check if owner
      const isOwner = business.owner_user_id === userId;

      // If not owner, check team membership and permissions
      if (!isOwner) {
        const members = await storage.getTeamMembers(businessId);
        const member = members.find(m => m.user_id === userId && m.invite_status === "accepted");

        if (!member || !member.permissions.can_create_campaigns) {
          return res.status(403).json({ message: "Permission denied: cannot create campaigns" });
        }
      }

      const input = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(businessId, userId, input);

      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Get all campaigns for a business
  app.get("/api/business/:businessId/campaigns", ensureAuthenticated, ensureBusinessMember, async (req: any, res) => {
    try {
      const businessId = req.params.businessId;
      const campaigns = await storage.getCampaignsByBusiness(businessId);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get campaign statistics for a business
  app.get("/api/business/:businessId/campaigns/stats", ensureAuthenticated, ensureBusinessMember, async (req: any, res) => {
    try {
      const businessId = req.params.businessId;
      const stats = await storage.getCampaignStats(businessId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single campaign
  app.get("/api/campaigns/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaignById(campaignId);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Increment views
      await storage.incrementCampaignViews(campaignId);

      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update campaign
  app.patch("/api/campaigns/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;

      // Get campaign to check permissions
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check if user is business owner or has edit permissions
      const business = await storage.getBusinessById(campaign.business_id);
      const isOwner = business.owner_user_id === userId;

      if (!isOwner) {
        const members = await storage.getTeamMembers(campaign.business_id);
        const member = members.find(m => m.user_id === userId && m.invite_status === "accepted");

        if (!member || (!member.permissions.can_create_campaigns && member.role !== "admin")) {
          return res.status(403).json({ message: "Permission denied" });
        }
      }

      const updates = updateCampaignSchema.parse(req.body);
      const updatedCampaign = await storage.updateCampaign(campaignId, updates);

      res.json(updatedCampaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;

      // Get campaign to check permissions
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Only business owner or campaign creator can delete
      const business = await storage.getBusinessById(campaign.business_id);
      const isOwner = business.owner_user_id === userId;
      const isCreator = campaign.created_by === userId;

      if (!isOwner && !isCreator) {
        return res.status(403).json({ message: "Permission denied" });
      }

      await storage.deleteCampaign(campaignId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Browse active campaigns (public discover)
  app.get("/api/campaigns", ensureAuthenticated, async (req: any, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined
      };

      const campaigns = await storage.getActiveCampaigns(filters);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PUBLIC: View single campaign (no auth required for sharing)
  app.get("/api/campaigns/:id/public", async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaignById(campaignId);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Only show active campaigns publicly (shareable regardless of approval)
      if (campaign.status !== "active") {
        return res.status(404).json({ message: "Campaign not available" });
      }

      // Increment views
      await storage.incrementCampaignViews(campaignId);

      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================
  // CAMPAIGN APPLICATION ROUTES
  // =============================================

  // Apply to campaign
  app.post("/api/campaigns/:id/apply", ensureAuthenticated, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;

      const input = insertCampaignApplicationSchema.parse(req.body);
      const application = await storage.createCampaignApplication(campaignId, userId, input);

      res.status(201).json(application);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      if ((err as Error).message === "You have already applied to this campaign") {
        return res.status(409).json({ message: (err as Error).message });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Get applications for a campaign (only if approved)
  app.get("/api/campaigns/:id/applications", ensureAuthenticated, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;

      // Get campaign to check ownership and approval
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Check if user owns the campaign's business
      const business = await storage.getBusinessById(campaign.business_id);
      const isOwner = business.owner_user_id === userId;

      if (!isOwner) {
        const members = await storage.getTeamMembers(campaign.business_id);
        const member = members.find(m => m.user_id === userId && m.invite_status === "accepted");

        if (!member) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      // Get applications (filtered by approval status)
      const applications = await storage.getCampaignApplications(campaignId, campaign.approved);

      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's applications
  app.get("/api/my-applications", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update application status (accept/reject)
  app.patch("/api/applications/:id/status", ensureAuthenticated, async (req: any, res) => {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
      const userId = req.user._id?.toString() || req.user.id;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.getCampaignApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the campaign's business
      const campaign = await storage.getCampaignById(application.campaign_id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const business = await storage.getBusinessById(campaign.business_id);
      const isOwner = business.owner_user_id === userId;

      if (!isOwner) {
        const members = await storage.getTeamMembers(campaign.business_id);
        const member = members.find(m => m.user_id === userId && m.invite_status === "accepted");

        if (!member && req.user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized" });
        }
      }

      const updated = await storage.updateApplicationStatus(applicationId, status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================
  // ADMIN CAMPAIGN ROUTES
  // =============================================

  // Get all campaigns for admin
  app.get("/api/admin/campaigns", ensureAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaignsForAdmin();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Approve/reject campaign
  app.patch("/api/admin/campaigns/:id/approve", ensureAdmin, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const { approved } = req.body;

      const campaign = await storage.approveCampaign(campaignId, approved);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all applications for a campaign (admin view - shows all regardless of approval)
  app.get("/api/admin/campaigns/:id/applications", ensureAdmin, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const applications = await storage.getAllCampaignApplicationsForAdmin(campaignId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


  return httpServer;
}

