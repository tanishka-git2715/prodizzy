import mongoose from "mongoose";
import { Waitlist, StartupProfile, InvestorProfile, PartnerProfile, IndividualProfile, User, Connection, Business, TeamMember, Campaign, CampaignApplication } from "./models";
import type {
  InsertWaitlistEntry,
  WaitlistResponse,
  InsertProfile,
  UpdateProfile,
  StartupProfile as StartupProfileType
} from "@shared/schema";
import crypto from "crypto";

interface DiscoverFilters {
  industry?: string;
  stage?: string;
  location?: string;
}

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined>;

  // Generic Profile Methods
  getProfileByUserId(userId: string): Promise<any | undefined>;
  upsertProfile(userId: string, email: string, profile: any, type: string): Promise<any>;
  patchProfile(userId: string, patch: any): Promise<any>;

  // Admin Methods
  getAllProfiles(type: string): Promise<any[]>;
  updateProfileApproval(type: string, userIdOrId: string, approved: boolean): Promise<any>;
  getAllUsers(): Promise<any[]>;
  getAllWaitlistEntries(): Promise<any[]>;
  getUserByGoogleId(googleId: string): Promise<any | undefined>;
  deleteProfile(type: string, id: string): Promise<void>;
  purgeLegacyProfiles(): Promise<{ startups: number; partners: number; individuals: number }>;

  // Connection Methods
  createConnection(investorUserId: string, startupId: string, message?: string): Promise<any>;
  getConnectionById(connectionId: string): Promise<any>;
  getConnectionsByInvestor(investorUserId: string): Promise<any[]>;
  getConnectionsByStartup(startupUserId: string): Promise<any[]>;
  updateConnectionStatus(connectionId: string, userId: string, status: 'accepted' | 'declined'): Promise<any>;
  checkExistingConnection(investorUserId: string, startupId: string): Promise<any>;

  // Discovery Methods
  getApprovedStartupsForInvestor(filters: DiscoverFilters): Promise<any[]>;

  // Matching Methods
  getMatchesForInvestor(investorUserId: string, limit?: number): Promise<any[]>;

  // Analytics Methods
  getActiveUsersCount(days: number): Promise<number>;
  getUserGrowthTrends(startDate: Date, endDate: Date): Promise<any[]>;
  getConnectionMetrics(): Promise<any>;
  getCohortData(): Promise<any[]>;
  getEngagementFunnel(): Promise<any>;
  getMarketplaceHealth(): Promise<any>;

  // Business Methods
  createBusiness(userId: string, businessData: any, ownerEmail: string): Promise<any>;
  getUserBusinesses(userId: string): Promise<any[]>;
  getBusinessById(businessId: string): Promise<any | undefined>;
  updateBusiness(businessId: string, updates: any): Promise<any>;
  deleteBusiness(businessId: string): Promise<void>;

  // Team Member Methods
  inviteTeamMember(businessId: string, email: string, invitedBy: string, role: string, permissions?: any): Promise<any>;
  getTeamMembers(businessId: string): Promise<any[]>;
  getTeamMemberByToken(token: string): Promise<any | undefined>;
  acceptInvite(token: string, userId: string): Promise<any>;
  updateTeamMember(businessId: string, memberId: string, updates: any): Promise<any>;
  removeTeamMember(businessId: string, memberId: string): Promise<void>;
  getUserBusinessMemberships(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse> {
    const doc = new Waitlist({ name: entry.name, email: entry.email, role: entry.role });
    await doc.save();
    return doc.toObject() as unknown as WaitlistResponse;
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined> {
    const doc = await Waitlist.findOne({ email });
    if (!doc) return undefined;
    return doc.toObject() as unknown as WaitlistResponse;
  }

  private async getCanonicalUserId(userId: string): Promise<string> {
    const user = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    return user ? user._id.toString() : userId;
  }

  private getModelByType(type: string) {
    switch (type) {
      case "startup":
      case "partner":
      case "individual": return IndividualProfile;
      case "investor": return InvestorProfile;
      case "business": return Business;
      default: return IndividualProfile;
    }
  }

  async getProfileByUserId(userId: string): Promise<any | undefined> {
    // 1. Resolve to canonical MongoDB ID
    const user = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();

    if (!user) return undefined;
    const actualId = user._id.toString();

    // 2. Try lookup by profileType if user knows it
    if (user.profileType) {
      const Model = this.getModelByType(user.profileType);
      const doc = await (Model as any).findOne({
        $or: [{ user_id: actualId }, { user_id: user.googleId }]
      }).lean();

      if (doc) {
        return { ...doc, type: user.profileType };
      }
    }

    // 3. Robust fallback: search all potential profile models
    const models = [
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" },
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" },
    ];

    const results = await Promise.all(
      models.map(async ({ model, type }) => {
        const doc = await (model as any).findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }]
        }).lean();
        if (doc) return { ...doc, type };
        return null;
      })
    );

    let profile = results.find(r => r !== null);

    // 3.5. If no profile found in main models, check if they own any businesses
    if (!profile) {
      const ownedBusiness = await Business.findOne({
        $or: [{ owner_user_id: actualId }, { owner_user_id: user.googleId }]
      }).lean();
      
      if (ownedBusiness) {
        profile = { ...ownedBusiness, type: "business", onboarding_completed: true };
      } else {
        // Finally check if they are a member of any business
        const membership = await TeamMember.findOne({
           $or: [{ user_id: actualId }, { user_id: user.googleId }],
           invite_status: "accepted"
        }).lean();
        
        if (membership) {
           const memberBusiness = await Business.findById(membership.business_id).lean();
           if (memberBusiness) {
             profile = { ...memberBusiness, type: "business", onboarding_completed: true, user_role: membership.role };
           }
        }
      }
    }

    // 4. Update user's profileType if found during fallback for faster future lookups
    if (profile && profile.onboarding_completed) {
      await User.findByIdAndUpdate(actualId, { profileType: profile.type });
    }

    return profile || undefined;
  }

  async getProfileStatus(userId: string): Promise<{ hasProfile: boolean, hasCompletedProfile: boolean, needsOnboarding: boolean }> {
    const user = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();

    if (!user) return { hasProfile: false, hasCompletedProfile: false, needsOnboarding: true };
    const actualId = user._id.toString();

    // Check by profileType if available
    if (user.profileType) {
      const Model = this.getModelByType(user.profileType);
      const doc = await (Model as any).findOne({
        $or: [{ user_id: actualId }, { user_id: user.googleId }]
      }).lean();

      if (doc) {
        return {
          hasProfile: true,
          hasCompletedProfile: !!(doc as any).onboarding_completed,
          needsOnboarding: !(doc as any).onboarding_completed
        };
      }
    }

    // Fallback search
    const models = [
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" },
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" }
    ];

    for (const { model } of models) {
      const doc = await (model as any).findOne({
        $or: [{ user_id: actualId }, { user_id: user.googleId }]
      }).lean();
      if (doc) {
        return {
          hasProfile: true,
          hasCompletedProfile: !!(doc as any).onboarding_completed,
          needsOnboarding: !(doc as any).onboarding_completed
        };
      }
    }

    // Checking for business profile ownership or membership
    const ownedBusiness = await Business.findOne({
      $or: [{ owner_user_id: actualId }, { owner_user_id: user.googleId }]
    }).lean();

    if (ownedBusiness) {
      return { hasProfile: true, hasCompletedProfile: true, needsOnboarding: false };
    }

    const membership = await TeamMember.findOne({
      $or: [{ user_id: actualId }, { user_id: user.googleId }],
      invite_status: "accepted"
    }).lean();

    if (membership) {
      return { hasProfile: true, hasCompletedProfile: true, needsOnboarding: false };
    }

    return { hasProfile: false, hasCompletedProfile: false, needsOnboarding: true };
  }

  async upsertProfile(userId: string, email: string, profile: any, type: string): Promise<any> {
    const Model = this.getModelByType(type);

    const user = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();

    if (!user) throw new Error("User not found");
    const actualId = user._id.toString();

    // Update user's profileType, availableProfiles and profile in parallel
    const updatedAvailableProfiles = Array.from(new Set([...(user.availableProfiles || []), type]));

    const [doc] = await Promise.all([
      (Model as any).findOneAndUpdate(
        { $or: [{ user_id: userId }, { user_id: user.googleId }] },
        { user_id: actualId, email, ...profile, onboarding_completed: true, type: type },
        { upsert: true, new: true }
      ).lean(),
      User.findByIdAndUpdate(actualId, {
        profileType: type,
        availableProfiles: updatedAvailableProfiles
      })
    ]);

    return { ...doc, type: type };
  }

  async patchProfile(userId: string, patch: any): Promise<any> {
    const actualId = await this.getCanonicalUserId(userId);
    // Find which profile the user has first
    const profile = await this.getProfileByUserId(actualId);
    if (!profile) throw new Error("Profile not found");

    const Model = this.getModelByType(profile.type);
    const doc = await (Model as any).findOneAndUpdate(
      { user_id: profile.user_id }, // Use the ID already in the profile doc
      { $set: patch },
      { new: true }
    ).lean();
    return { ...doc, type: profile.type };
  }

  async getAllProfiles(type: string): Promise<any[]> {
    const Model = this.getModelByType(type);
    // Exclude large intent fields for list views
    const projection = {
      intent_validation: 0,
      intent_hiring: 0,
      intent_partnerships: 0,
      intent_promotions: 0,
      intent_fundraising: 0
    };

    let query: any = {};

    const docs = await (Model as any).find(query, projection).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id.toString()
    }));
  }

  async updateProfileApproval(type: string, id: string, approved: boolean): Promise<any> {
    const Model = this.getModelByType(type);
    const doc = await (Model as any).findByIdAndUpdate(id, { approved }, { new: true });
    if (!doc) throw new Error("Profile not found");
    return doc.toObject();
  }

  async getAllUsers(): Promise<any[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  async getAllWaitlistEntries(): Promise<any[]> {
    return await Waitlist.find({}).sort({ createdAt: -1 });
  }

  async getUserByGoogleId(googleId: string): Promise<any | undefined> {
    return await User.findOne({ googleId });
  }

  async deleteProfile(type: string, id: string): Promise<void> {
    const Model = this.getModelByType(type);
    await (Model as any).findByIdAndDelete(id);
  }

  async purgeLegacyProfiles(): Promise<{ startups: number; partners: number; individuals: number }> {
    const startupResult = await StartupProfile.deleteMany({});
    const partnerResult = await PartnerProfile.deleteMany({});
    const individualResult = await IndividualProfile.deleteMany({});
    return {
      startups: startupResult.deletedCount || 0,
      partners: partnerResult.deletedCount || 0,
      individuals: individualResult.deletedCount || 0,
    };
  }

  // ==================== Connection Methods ====================

  /** Get existing InvestorProfile or create one from PartnerProfile when partner_type is "Investor" */
  async getOrCreateInvestorProfileForUser(userId: string): Promise<any> {
    const actualId = await this.getCanonicalUserId(userId);
    let investorProfile = await InvestorProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: userId }]
    });
    if (investorProfile) return investorProfile;

    // Check IndividualProfile for "Investor" role
    const indivProfile = await IndividualProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: userId }],
      roles: "Investor",
      onboarding_completed: true
    });
    if (indivProfile && indivProfile.investor_data) {
      investorProfile = await InvestorProfile.create({
        user_id: actualId,
        email: indivProfile.email || "",
        full_name: indivProfile.full_name || "",
        firm_name: "NA",
        investor_type: indivProfile.investor_data.investor_types?.[0] || "Angel",
        check_size: indivProfile.investor_data.ticket_size || "<$50k",
        sectors: indivProfile.investor_data.industries || [],
        stages: indivProfile.investor_data.investment_stages || [],
        geography: indivProfile.investor_data.geography || "",
        onboarding_completed: true,
        approved: !!indivProfile.approved,
      });
      return investorProfile;
    }

    const partnerProfile = await PartnerProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: userId }],
      partner_type: "Investor",
      onboarding_completed: true
    });
    if (!partnerProfile) return null;
    investorProfile = await InvestorProfile.create({
      user_id: actualId,
      email: partnerProfile.email as string,
      full_name: partnerProfile.full_name as string,
      firm_name: (partnerProfile.company_name as string) || "NA",
      investor_type: "Investor",
      check_size: "<$50k",
      sectors: [],
      stages: [],
      geography: "",
      onboarding_completed: true,
      approved: !!partnerProfile.approved,
    });
    return investorProfile;
  }

  async createConnection(investorUserId: string, startupId: string, message?: string) {
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
    if (!investorProfile) throw new Error("Investor profile not found");

    // Verify startup exists and is approved
    const startupProfile = await StartupProfile.findById(startupId);
    if (!startupProfile) throw new Error("Startup not found");
    if (!startupProfile.approved) throw new Error("Startup not approved");

    // Check for existing connection
    const existing = await Connection.findOne({
      startup_id: startupId,
      investor_id: investorProfile._id
    });

    if (existing) throw new Error("Connection already exists");

    const connection = new Connection({
      startup_id: startupId,
      investor_id: investorProfile._id,
      message: message || null,
      status: 'pending'
    });

    await connection.save();
    return connection.toObject();
  }

  async getConnectionById(connectionId: string) {
    const connection = await Connection.findById(connectionId)
      .populate('startup_id', 'company_name industry stage user_id email full_name linkedin_url website')
      .populate('investor_id', 'full_name firm_name investor_type check_size email user_id')
      .lean();
    return connection;
  }

  async getConnectionsByInvestor(investorUserId: string) {
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
    if (!investorProfile) return [];

    const connections = await Connection.find({ investor_id: investorProfile._id })
      .populate('startup_id', 'company_name industry stage user_id email full_name linkedin_url website')
      .sort({ created_at: -1 })
      .lean();

    // Format with anonymization logic based on status
    return connections.map(conn => {
      const startup = conn.startup_id as any;
      return {
        ...conn,
        id: conn._id.toString(),
        startup: conn.status === 'accepted' ? {
          company_name: startup.company_name,
          industry: startup.industry,
          stage: startup.stage,
          email: startup.email,
          full_name: startup.full_name,
          linkedin_url: startup.linkedin_url,
          website: startup.website,
        } : {
          company_name: startup.company_name,
          industry: startup.industry,
          stage: startup.stage,
          // No contact info until accepted
        }
      };
    });
  }

  async getConnectionsByStartup(startupUserId: string) {
    const actualId = await this.getCanonicalUserId(startupUserId);
    const startupProfile = await StartupProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: startupUserId }]
    }) || await IndividualProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: startupUserId }],
      roles: "Founder"
    });
    if (!startupProfile) return [];

    const connections = await Connection.find({ startup_id: startupProfile._id } as any)
      .populate('investor_id', 'full_name firm_name investor_type check_size email user_id')
      .sort({ created_at: -1 })
      .lean();

    // Format with anonymization logic
    return connections.map(conn => {
      const investor = conn.investor_id as any;
      return {
        ...conn,
        id: conn._id.toString(),
        investor: conn.status === 'accepted' ? {
          full_name: investor.full_name,
          firm_name: investor.firm_name,
          investor_type: investor.investor_type,
          check_size: investor.check_size,
          email: investor.email,
        } : {
          firm_name: investor.firm_name || "Anonymous Investor",
          investor_type: investor.investor_type,
          check_size: investor.check_size,
          // No contact info until accepted
        }
      };
    });
  }

  async updateConnectionStatus(connectionId: string, userId: string, status: 'accepted' | 'declined') {
    const connection = await Connection.findById(connectionId)
      .populate('startup_id', 'user_id')
      .populate('investor_id', 'user_id');

    if (!connection) throw new Error("Connection not found");

    const startup = connection.startup_id as any;
    const investor = connection.investor_id as any;

    const actualId = await this.getCanonicalUserId(userId);
    // Determine if user is startup or investor
    const isStartup = startup.user_id === actualId || startup.user_id === userId;
    const isInvestor = investor.user_id === actualId || investor.user_id === userId;

    if (!isStartup && !isInvestor) {
      throw new Error("Unauthorized to update this connection");
    }

    if (status === 'declined') {
      (connection as any).status = 'declined';
    } else if (status === 'accepted') {
      if (isStartup) {
        (connection as any).startup_accepted = true;
      } else if (isInvestor) {
        (connection as any).investor_accepted = true;
      }

      // If both accepted, mark as accepted
      if ((connection as any).startup_accepted && (connection as any).investor_accepted) {
        (connection as any).status = 'accepted';
      }
    }

    await connection.save();
    return this.getConnectionById(connectionId);
  }

  async checkExistingConnection(investorUserId: string, startupId: string) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return null;

    return await Connection.findOne({
      startup_id: startupId,
      investor_id: investorProfile._id
    }).lean();
  }

  // ==================== Discovery Methods ====================

  async getApprovedStartupsForInvestor(filters: DiscoverFilters) {
    const query: any = {
      $or: [
        { approved: true, roles: "Founder" },
        { approved: true, type: "startup" } // Compatibility
      ]
    };

    if (filters.industry) {
      query.industry = filters.industry;
    }

    if (filters.stage) {
      query.stage = filters.stage;
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    // Exclude sensitive fields (anonymization)
    const projection = {
      email: 0,
      full_name: 0,
      linkedin_url: 0,
      website: 0,
      deck_link: 0,
    };

    // Search both StartupProfile and IndividualProfile (Founder role)
    const [legacyStartups, newStartups] = await Promise.all([
      StartupProfile.find(query, projection).sort({ createdAt: -1 }).limit(100).lean(),
      IndividualProfile.find(query, projection).sort({ createdAt: -1 }).limit(100).lean()
    ]);

    const startups = [...legacyStartups, ...newStartups];

    // Add founder_label for anonymization and id for frontend
    return startups.map((s: any) => ({
      ...s,
      startup_data: s.startup_data, // Ensure startup_data is present for unified profiles
      id: s._id.toString(),
      founder_label: s.role || s.startup_data?.role || (s.roles?.includes("Founder") ? "Founder" : "Startup")
    }));
  }

  // ==================== Matching Methods ====================

  async getMatchesForInvestor(investorUserId: string, limit: number = 20) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return [];

    // Get approved startups (fundraising is optional)
    // Get approved startups from both collections
    const [legacyStartups, newStartups] = await Promise.all([
      StartupProfile.find({ approved: true }).limit(50).lean(),
      IndividualProfile.find({ approved: true, roles: "Founder" }).limit(50).lean()
    ]);

    const startups = [...legacyStartups, ...newStartups];

    // Score each startup
    const scoredStartups = startups.map(startup => {
      const score = this.calculateMatchScore(investorProfile, startup);
      return { startup, score };
    });

    // Sort by score and take top N
    scoredStartups.sort((a, b) => b.score - a.score);

    return scoredStartups.slice(0, limit).map(({ startup, score }) => ({
      ...startup,
      id: (startup as any)._id.toString(),
      match_score: score,
      founder_label: (startup as any).role || (startup as any).startup_data?.role || ((startup as any).roles?.includes("Founder") ? "Founder" : "Startup"),
      // Anonymize
      email: undefined,
      full_name: undefined,
      linkedin_url: undefined,
      website: undefined,
      deck_link: undefined,
    }));
  }

  private calculateMatchScore(investor: any, startup: any): number {
    let score = 0;

    // Sector match (40 points max)
    const industry = startup.industry || startup.startup_data?.industry;
    if (investor.sectors && industry) {
      const investorSectors = investor.sectors;
      const startupIndustries = Array.isArray(industry) ? industry : [industry];
      const sectorMatch = investorSectors.some((s: string) => startupIndustries.includes(s));
      if (sectorMatch) score += 40;
    }

    // Stage match (30 points max)
    const stage = startup.stage || startup.startup_data?.stage;
    if (investor.stages && stage) {
      const stageMatch = investor.stages.includes(stage);
      if (stageMatch) score += 30;
    }

    // Check size / ticket size match (30 points max)
    if (investor.check_size && startup.intent_fundraising?.ticket_size) {
      const checkSizeMatch = this.matchCheckSize(
        investor.check_size,
        startup.intent_fundraising.ticket_size
      );
      if (checkSizeMatch) score += 30;
    }

    return score;
  }

  private matchCheckSize(investorCheck: string, startupTicket: string): boolean {
    // Map ranges to numeric values for comparison
    const rangeMap: Record<string, [number, number]> = {
      '<$50k': [0, 50000],
      '$50k-$250k': [50000, 250000],
      '$250k-$1M': [250000, 1000000],
      '$1M-$5M': [1000000, 5000000],
      '$5M+': [5000000, Infinity]
    };

    const investorRange = rangeMap[investorCheck];
    const startupRange = rangeMap[startupTicket];

    if (!investorRange || !startupRange) return false;

    // Check if ranges overlap
    return investorRange[1] >= startupRange[0] && investorRange[0] <= startupRange[1];
  }

  // Analytics Methods Implementation
  async getActiveUsersCount(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const count = await User.countDocuments({
      lastLogin: { $gte: cutoffDate }
    });

    return count;
  }

  async getUserGrowthTrends(startDate: Date, endDate: Date): Promise<any[]> {
    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          startups: {
            $sum: { $cond: [{ $eq: ["$profileType", "startup"] }, 1, 0] }
          },
          partners: {
            $sum: { $cond: [{ $eq: ["$profileType", "partner"] }, 1, 0] }
          },
          individuals: {
            $sum: { $cond: [{ $eq: ["$profileType", "individual"] }, 1, 0] }
          },
          investors: {
            $sum: { $cond: [{ $eq: ["$profileType", "investor"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          count: 1,
          startups: 1,
          partners: 1,
          individuals: 1,
          investors: 1
        }
      }
    ]);

    return users;
  }

  async getConnectionMetrics(): Promise<any> {
    const totalConnections = await Connection.countDocuments({});
    const pendingConnections = await Connection.countDocuments({ status: "pending" });
    const acceptedConnections = await Connection.countDocuments({ status: "accepted" });
    const declinedConnections = await Connection.countDocuments({ status: "declined" });

    const acceptanceRate = totalConnections > 0
      ? ((acceptedConnections / (acceptedConnections + declinedConnections)) * 100) || 0
      : 0;

    // Get average time to respond (for accepted/declined connections)
    const respondedConnections = await Connection.find({
      status: { $in: ["accepted", "declined"] },
      updatedAt: { $exists: true }
    }).lean();

    let avgResponseTime = 0;
    if (respondedConnections.length > 0) {
      const totalResponseTime = respondedConnections.reduce((sum, conn) => {
        const created = new Date(conn.createdAt).getTime();
        const updated = new Date(conn.updatedAt).getTime();
        return sum + (updated - created);
      }, 0);
      avgResponseTime = totalResponseTime / respondedConnections.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Get repeat connection rate (users making multiple connections)
    const connectionsPerUser = await Connection.aggregate([
      {
        $group: {
          _id: "$investor_user_id",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          repeatUsers: {
            $sum: { $cond: [{ $gt: ["$count", 1] }, 1, 0] }
          }
        }
      }
    ]);

    const repeatRate = connectionsPerUser.length > 0
      ? (connectionsPerUser[0].repeatUsers / connectionsPerUser[0].totalUsers) * 100
      : 0;

    return {
      total: totalConnections,
      pending: pendingConnections,
      accepted: acceptedConnections,
      declined: declinedConnections,
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      avgResponseTimeDays: parseFloat(avgResponseTime.toFixed(2)),
      repeatConnectionRate: parseFloat(repeatRate.toFixed(2))
    };
  }

  async getCohortData(): Promise<any[]> {
    // Get users grouped by signup month
    const cohorts = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          userIds: { $push: "$_id" },
          signupCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // For each cohort, calculate retention for subsequent months
    const cohortData = await Promise.all(
      cohorts.map(async (cohort) => {
        const cohortDate = new Date(cohort._id.year, cohort._id.month - 1, 1);
        const cohortMonth = `${cohort._id.year}-${String(cohort._id.month).padStart(2, '0')}`;

        // Calculate retention for months 0, 1, 2, 3, 6 (if data exists)
        const retentionMonths = [0, 1, 2, 3, 6];
        const retention: any = {};

        for (const monthOffset of retentionMonths) {
          const checkDate = new Date(cohortDate);
          checkDate.setMonth(checkDate.getMonth() + monthOffset);

          const nextMonthDate = new Date(checkDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

          const activeUsers = await User.countDocuments({
            _id: { $in: cohort.userIds },
            lastLogin: { $gte: checkDate, $lt: nextMonthDate }
          });

          const retentionRate = cohort.signupCount > 0
            ? (activeUsers / cohort.signupCount) * 100
            : 0;

          retention[`month${monthOffset}`] = parseFloat(retentionRate.toFixed(2));
        }

        return {
          cohort: cohortMonth,
          signupCount: cohort.signupCount,
          retention
        };
      })
    );

    return cohortData;
  }

  async getEngagementFunnel(): Promise<any> {
    const totalSignups = await User.countDocuments({});

    // Profile completion - counting all actual profiles created
    const completedProfiles = await Promise.all([
      IndividualProfile.countDocuments({}),
      Business.countDocuments({})
    ]);
    const totalCompleted = completedProfiles.reduce((sum, count) => sum + count, 0);

    // Users who have browsed (made at least one connection attempt)
    const usersWithConnections = await Connection.distinct("investor_user_id");

    // First connection attempt
    const firstConnection = usersWithConnections.length;

    // Accepted connections
    const acceptedConnections = await Connection.countDocuments({ status: "accepted" });

    return {
      signups: totalSignups,
      profileCompleted: totalCompleted,
      firstBrowse: firstConnection,
      firstConnection: firstConnection,
      acceptedConnection: acceptedConnections,
      conversionRates: {
        signupToProfile: totalSignups > 0 ? ((totalCompleted / totalSignups) * 100).toFixed(2) : "0.00",
        profileToBrowse: totalCompleted > 0 ? ((firstConnection / totalCompleted) * 100).toFixed(2) : "0.00",
        browseToConnection: firstConnection > 0 ? ((firstConnection / firstConnection) * 100).toFixed(2) : "0.00",
        connectionToAccepted: firstConnection > 0 ? ((acceptedConnections / firstConnection) * 100).toFixed(2) : "0.00"
      }
    };
  }

  async getMarketplaceHealth(): Promise<any> {
    // Get counts by profile type
    const startupCount = await StartupProfile.countDocuments({ approved: true });
    const investorCount = await InvestorProfile.countDocuments({});
    const partnerCount = await PartnerProfile.countDocuments({ approved: true });
    const individualCount = await IndividualProfile.countDocuments({});
    const businessCount = await Business.countDocuments({});

    // Startup to investor ratio
    const startupToInvestorRatio = investorCount > 0
      ? (startupCount / investorCount).toFixed(2)
      : "0.00";

    // Active sellers (investors/partners who made at least 1 connection)
    const activeInvestors = await Connection.distinct("investor_user_id");
    const totalSellers = investorCount + partnerCount;

    const sellerLiquidityIndex = totalSellers > 0
      ? ((activeInvestors.length / totalSellers) * 100).toFixed(2)
      : "0.00";

    // Get connection metrics
    const connectionMetrics = await this.getConnectionMetrics();

    return {
      startupCount,
      investorCount,
      partnerCount,
      individualCount,
      businessCount,
      startupToInvestorRatio: parseFloat(startupToInvestorRatio),
      activeSellers: activeInvestors.length,
      totalSellers,
      sellerLiquidityIndex: parseFloat(sellerLiquidityIndex),
      connectionAcceptanceRate: connectionMetrics.acceptanceRate,
      avgConnectionsPerActiveUser: totalSellers > 0
        ? (connectionMetrics.total / totalSellers).toFixed(2)
        : "0.00"
    };
  }

  // =============================================
  // BUSINESS METHODS
  // =============================================

  async createBusiness(userId: string, businessData: any, ownerEmail: string): Promise<any> {
    const business = new Business({
      owner_user_id: userId,
      ...businessData,
      is_personal: businessData.is_personal || false,
      approved: false,
      onboarding_completed: true
    });
    await business.save();

    const email = ownerEmail;

    // Create owner team member record
    await this.inviteTeamMember(
      (business as any)._id.toString(),
      email,
      userId,
      "owner",
      {
        can_create_campaigns: true,
        can_edit_business: true,
        can_invite_members: true,
        can_view_analytics: true
      }
    );

    // Auto-accept owner's team member record
    const ownerMember = await TeamMember.findOne({
      business_id: (business as any)._id,
      email
    });
    if (ownerMember) {
      ownerMember.user_id = userId;
      ownerMember.invite_status = "accepted";
      ownerMember.accepted_at = new Date();
      await (ownerMember as any).save();
    }

    return business.toObject();
  }

  async getUserBusinesses(userId: string): Promise<any[]> {
    // Get businesses owned by user
    const ownedBusinesses = await Business.find({ owner_user_id: userId }).lean();

    // Get businesses where user is a team member
    const memberships = await TeamMember.find({
      user_id: userId,
      invite_status: "accepted"
    }).lean();

    const memberBusinessIds = memberships
      .map(m => m.business_id)
      .filter(id => !ownedBusinesses.some(b => b._id.toString() === id.toString()));

    const memberBusinesses = memberBusinessIds.length > 0
      ? await Business.find({ _id: { $in: memberBusinessIds } } as any).lean()
      : [];

    // Combine and add role information
    const allBusinesses = [
      ...ownedBusinesses.map(b => ({ ...b, user_role: "owner" })),
      ...memberBusinesses.map(b => {
        const membership = memberships.find(m => m.business_id.toString() === b._id.toString());
        return { ...b, user_role: membership?.role || "member" };
      })
    ];

    return allBusinesses;
  }

  async getBusinessById(businessId: string): Promise<any | undefined> {
    const business = await Business.findById(businessId).lean();
    return business || undefined;
  }

  async updateBusiness(businessId: string, updates: any): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!business) throw new Error("Business not found");
    return business.toObject();
  }

  async deleteBusiness(businessId: string): Promise<void> {
    // Delete all team members
    await TeamMember.deleteMany({ business_id: businessId });
    // Delete business
    await Business.findByIdAndDelete(businessId);
  }

  // =============================================
  // TEAM MEMBER METHODS
  // =============================================

  async inviteTeamMember(
    businessId: string,
    email: string,
    invitedBy: string,
    role: string = "member",
    permissions?: any
  ): Promise<any> {
    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");

    // Check if invite already exists
    const existing = await TeamMember.findOne({
      business_id: businessId,
      email: email,
      invite_status: "pending"
    });

    if (existing) {
      throw new Error("User already invited to this business");
    }

    // Check if user already member
    const existingMember = await TeamMember.findOne({
      business_id: businessId,
      email: email,
      invite_status: "accepted"
    });

    if (existingMember) {
      throw new Error("User is already a team member");
    }

    const defaultPermissions = {
      can_create_campaigns: true,
      can_edit_business: role === "admin" || role === "owner",
      can_invite_members: role === "admin" || role === "owner",
      can_view_analytics: true
    };

    const member = new TeamMember({
      business_id: businessId,
      email,
      role,
      invited_by: invitedBy,
      invite_token: inviteToken,
      invite_status: "pending",
      invited_at: new Date(),
      permissions: permissions || defaultPermissions
    });

    await member.save();
    return member.toObject();
  }

  async getTeamMembers(businessId: string): Promise<any[]> {
    const members = await TeamMember.find({ business_id: businessId })
      .sort({ createdAt: -1 })
      .lean();

    // Populate user info for accepted members
    const memberIds = members
      .filter(m => m.user_id)
      .map(m => m.user_id);

    const users = memberIds.length > 0
      ? await User.find({ _id: { $in: memberIds } }).lean()
      : [];

    return members.map(member => {
      const user = users.find(u => u._id.toString() === member.user_id);
      return {
        ...member,
        user: user ? {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email
        } : undefined
      };
    });
  }

  async getTeamMemberByToken(token: string): Promise<any | undefined> {
    const member = await TeamMember.findOne({ invite_token: token }).lean();
    if (!member) return undefined;

    // Also fetch business info
    const business = await Business.findById(member.business_id).lean();

    return {
      ...member,
      business: business ? {
        business_name: business.business_name,
        business_type: business.business_type,
        logo_url: business.logo_url
      } : undefined
    };
  }

  async acceptInvite(token: string, userId: string): Promise<any> {
    const member = await TeamMember.findOne({ invite_token: token });
    if (!member) throw new Error("Invalid invite token");

    if (member.invite_status === "accepted") {
      throw new Error("Invite already accepted");
    }

    member.user_id = userId;
    member.invite_status = "accepted";
    member.accepted_at = new Date();
    await member.save();

    return member.toObject();
  }

  async updateTeamMember(businessId: string, memberId: string, updates: any): Promise<any> {
    const member = await TeamMember.findOneAndUpdate(
      { _id: memberId, business_id: businessId },
      updates,
      { new: true }
    );

    if (!member) throw new Error("Team member not found");
    return member.toObject();
  }

  async removeTeamMember(businessId: string, memberId: string): Promise<void> {
    const result = await TeamMember.findOneAndDelete({
      _id: memberId,
      business_id: businessId
    });

    if (!result) throw new Error("Team member not found");
  }

  async getUserBusinessMemberships(userId: string): Promise<any[]> {
    const memberships = await TeamMember.find({
      user_id: userId,
      invite_status: "accepted"
    })
      .populate('business_id')
      .lean();

    return memberships;
  }

  // =============================================
  // CAMPAIGN METHODS
  // =============================================

  async createCampaign(businessId: string, userId: string, campaignData: any): Promise<any> {
    const campaign = new Campaign({
      business_id: businessId,
      created_by: userId,
      ...campaignData
    });

    await campaign.save();

    // Populate business and creator info
    const populated = await Campaign.findById(campaign._id)
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .lean();

    return populated;
  }

  async getCampaignById(campaignId: string): Promise<any | undefined> {
    const campaign = await Campaign.findById(campaignId)
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .lean();

    return this.enhanceCampaign(campaign);
  }

  private async enhanceCampaign(campaign: any): Promise<any> {
    if (!campaign) return campaign;

    // If no business, fetch individual profile
    if (!campaign.business_id) {
      const profile = await IndividualProfile.findOne({
        user_id: campaign.created_by
      }).lean();
      if (profile) {
        campaign.individual_profile = profile;
      }
    }
    return campaign;
  }

  private async enhanceCampaigns(campaigns: any[]): Promise<any[]> {
    if (!campaigns) return [];
    return Promise.all(campaigns.map(c => this.enhanceCampaign(c)));
  }

  async getCampaignsByBusiness(businessId: string): Promise<any[]> {
    const campaigns = await Campaign.find({ business_id: businessId })
      .sort({ createdAt: -1 })
      .lean();

    return campaigns;
  }

  async getActiveCampaigns(filters?: { category?: string; skills?: string[] }): Promise<any[]> {
    const query: any = { status: "active" };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    const campaigns = await Campaign.find(query)
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .sort({ createdAt: -1 })
      .lean();

    return this.enhanceCampaigns(campaigns);
  }

  async getPublicCampaigns(filters?: { category?: string; engagementType?: string; location?: string; skills?: string[] }): Promise<any[]> {
    const query: any = {
      status: "active",
      approved: true // Only show approved campaigns publicly
    };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.engagementType) {
      query.engagementType = filters.engagementType;
    }

    if (filters?.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters?.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    const campaigns = await Campaign.find(query)
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .sort({ createdAt: -1 })
      .lean();

    return this.enhanceCampaigns(campaigns);
  }

  async updateCampaign(campaignId: string, updates: any): Promise<any> {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .lean();

    if (!campaign) throw new Error("Campaign not found");
    return this.enhanceCampaign(campaign);
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    const result = await Campaign.findByIdAndDelete(campaignId);
    if (!result) throw new Error("Campaign not found");
  }

  async incrementCampaignViews(campaignId: string): Promise<void> {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { views: 1 } });
  }

  async incrementCampaignApplications(campaignId: string): Promise<void> {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { applications: 1 } });
  }

  async getCampaignStats(businessId: string): Promise<any> {
    const campaigns = await Campaign.find({ business_id: businessId }).lean() as any[];

    const stats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === "active").length,
      draft: campaigns.filter(c => c.status === "draft").length,
      closed: campaigns.filter(c => c.status === "closed").length,
      approved: campaigns.filter(c => c.approved).length,
      pendingApproval: campaigns.filter(c => c.status === "active" && !c.approved).length,
      totalViews: campaigns.reduce((sum, c) => sum + (Number(c.views) || 0), 0),
      totalApplications: campaigns.reduce((sum, c) => sum + (Number(c.applications) || 0), 0)
    };

    return stats;
  }

  // Individual campaign methods (for users without a business)
  async createIndividualCampaign(userId: string, campaignData: any): Promise<any> {
    const campaign = new Campaign({
      created_by: userId,
      business_id: undefined, // No business associated
      ...campaignData
    });

    await campaign.save();

    // Return the campaign with creator population
    const created = await Campaign.findById(campaign._id)
      .populate('created_by', 'displayName avatarUrl email')
      .lean();
    return created;
  }

  async getCampaignsByUser(userId: string): Promise<any[]> {
    const campaigns = await Campaign.find({
      created_by: userId,
      business_id: { $exists: false } // Only individual campaigns (no business)
    })
      .sort({ createdAt: -1 })
      .lean();

    return campaigns;
  }

  async getUserCampaignStats(userId: string): Promise<any> {
    const campaigns = await Campaign.find({
      created_by: userId,
      business_id: { $exists: false }
    }).lean() as any[];

    const stats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === "active").length,
      draft: campaigns.filter(c => c.status === "draft").length,
      closed: campaigns.filter(c => c.status === "closed").length,
      approved: campaigns.filter(c => c.approved).length,
      pendingApproval: campaigns.filter(c => c.status === "active" && !c.approved).length,
      totalViews: campaigns.reduce((sum, c) => sum + (Number(c.views) || 0), 0),
      totalApplications: campaigns.reduce((sum, c) => sum + (Number(c.applications) || 0), 0)
    };

    return stats;
  }

  async approveCampaign(campaignId: string, approved: boolean): Promise<any> {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { approved },
      { new: true }
    )
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .lean();

    if (!campaign) throw new Error("Campaign not found");
    return this.enhanceCampaign(campaign);
  }

  async getAllCampaignsForAdmin(): Promise<any[]> {
    const campaigns = await Campaign.find()
      .populate('business_id', 'business_name logo_url location industry business_type team_size website linkedin_url founded_year description')
      .populate('created_by', 'displayName avatarUrl email')
      .sort({ createdAt: -1 })
      .lean();

    return this.enhanceCampaigns(campaigns);
  }

  // =============================================
  // CAMPAIGN APPLICATION METHODS
  // =============================================

  async createCampaignApplication(campaignId: string, userId: string, applicationData: any): Promise<any> {
    // Check if user already applied
    const existing = await CampaignApplication.findOne({
      campaign_id: campaignId,
      user_id: userId
    });

    if (existing) {
      throw new Error("You have already applied to this campaign");
    }

    const application = new CampaignApplication({
      campaign_id: campaignId,
      user_id: userId,
      ...applicationData
    });

    await application.save();

    // Increment campaign applications count
    await this.incrementCampaignApplications(campaignId);

    return application.toObject();
  }

  async getCampaignApplications(campaignId: string, campaignApproved: boolean): Promise<any[]> {
    // Only return applications if the campaign is approved
    if (!campaignApproved) {
      return [];
    }

    const applications = await CampaignApplication.find({
      campaign_id: campaignId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Populate user and profile details
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const [user, profile] = await Promise.all([
          User.findOne({ _id: app.user_id }).lean(),
          this.getProfileByUserId(app.user_id)
        ]);

        return {
          ...app,
          user: user ? {
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl
          } : null,
          profile
        };
      })
    );

    return applicationsWithDetails;
  }

  async getAllCampaignApplicationsForAdmin(campaignId: string): Promise<any[]> {
    // Admin can see all applications regardless of approval, with full user details
    const applications = await CampaignApplication.find({ campaign_id: campaignId })
      .sort({ createdAt: -1 })
      .lean();

    // Populate user and profile details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const [user, profile] = await Promise.all([
          User.findOne({ _id: app.user_id }).lean(),
          this.getProfileByUserId(app.user_id)
        ]);

        return {
          ...app,
          user: user ? {
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.avatarUrl
          } : null,
          profile
        };
      })
    );

    return applicationsWithDetails;
  }

  async getUserApplications(userId: string): Promise<any[]> {
    const applications = await CampaignApplication.find({ user_id: userId })
      .populate('campaign_id', 'title business_id status approved')
      .sort({ createdAt: -1 })
      .lean();

    return applications;
  }

  async getCampaignApplicationById(applicationId: string): Promise<any | null> {
    return await CampaignApplication.findById(applicationId).lean();
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    const application = await CampaignApplication.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).lean();

    if (!application) throw new Error("Application not found");
    return application;
  }
}

export const storage = new DatabaseStorage();
