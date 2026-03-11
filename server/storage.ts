import mongoose from "mongoose";
import { Waitlist, StartupProfile, InvestorProfile, PartnerProfile, IndividualProfile, User, Connection, Intent } from "./models";
import type {
  InsertWaitlistEntry,
  WaitlistResponse,
  InsertProfile,
  UpdateProfile,
  StartupProfile as StartupProfileType
} from "@shared/schema";

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

  // Connection Methods (Legacy - Investor/Startup only)
  createConnection(investorUserId: string, startupId: string, message?: string): Promise<any>;
  getConnectionById(connectionId: string): Promise<any>;
  getConnectionsByInvestor(investorUserId: string): Promise<any[]>;
  getConnectionsByStartup(startupUserId: string): Promise<any[]>;
  updateConnectionStatus(connectionId: string, userId: string, status: 'accepted' | 'declined'): Promise<any>;
  checkExistingConnection(investorUserId: string, startupId: string): Promise<any>;

  // Generic Connection Methods (Intent-based)
  createGenericConnection(
    fromUserId: string,
    toUserId: string,
    fromProfileType: string,
    toProfileType: string,
    message?: string,
    intentId?: string
  ): Promise<any>;
  getConnectionsByUser(userId: string): Promise<any[]>;
  getReceivedConnectionRequests(userId: string): Promise<any[]>;
  getSentConnectionRequests(userId: string): Promise<any[]>;
  acceptConnection(connectionId: string, userId: string): Promise<any>;
  declineConnection(connectionId: string, userId: string): Promise<any>;

  // Discovery Methods
  getApprovedStartupsForInvestor(filters: DiscoverFilters): Promise<any[]>;

  // Matching Methods
  getMatchesForInvestor(investorUserId: string, limit?: number): Promise<any[]>;

  // Intent Methods
  createIntent(userId: string, intentData: any): Promise<any>;
  getUserIntents(userId: string, status?: string): Promise<any[]>;
  updateIntent(intentId: string, userId: string, updates: any): Promise<any>;
  deleteIntent(intentId: string, userId: string): Promise<void>;
  getMatchesForIntent(intentId: string, userId: string, limit?: number): Promise<any[]>;
  getMatchesForUserIntents(userId: string, limit?: number): Promise<any[]>;

  // Analytics Methods
  getActiveUsersCount(days: number): Promise<number>;
  getUserGrowthTrends(startDate: Date, endDate: Date): Promise<any[]>;
  getConnectionMetrics(): Promise<any>;
  getCohortData(): Promise<any[]>;
  getEngagementFunnel(): Promise<any>;
  getMarketplaceHealth(): Promise<any>;
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
      case "startup": return StartupProfile;
      case "investor": return InvestorProfile;
      case "partner": return PartnerProfile;
      case "individual": return IndividualProfile;
      default: return StartupProfile;
    }
  }

  async getProfileByUserId(userId: string): Promise<any | undefined> {
    // 1. Try to get the user first. Use findOne to avoid CastError if userId is a googleId
    const user = await User.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();

    if (user?.profileType) {
      const Model = this.getModelByType(user.profileType);
      let doc = await (Model as any).findOne({ user_id: userId }).lean();

      // Fallback to googleId if not found by MongoDB ID
      if (!doc && user?.googleId && user.googleId !== userId) {
        doc = await (Model as any).findOne({ user_id: user.googleId }).lean();
      }

      if (doc) {
        return { ...doc, type: user.profileType };
      }
    }

    // 2. Fallback: Check all models in parallel if profileType is missing or profile not found
    const models = [
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" },
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" }
    ];

    const results = await Promise.all(
      models.map(async ({ model, type }) => {
        // Search by the provided userId (could be _id or googleId)
        let doc = await (model as any).findOne({ user_id: userId }).lean();

        // If not found and we have a googleId, search by that too (backward compatibility)
        if (!doc && user?.googleId && user.googleId !== userId) {
          doc = await (model as any).findOne({ user_id: user.googleId }).lean();
        }

        if (doc) return { ...doc, type };
        return null;
      })
    );

    const profile = results.find(r => r !== null);

    // 3. If found during fallback and it is completed, update the user for next time
    if (profile && user && profile.onboarding_completed) {
      await User.findByIdAndUpdate(userId, { profileType: profile.type });
    }

    return profile || undefined;
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

    // Update user's profileType and profile in parallel
    const [doc] = await Promise.all([
      (Model as any).findOneAndUpdate(
        { $or: [{ user_id: userId }, { user_id: user.googleId }] },
        { user_id: actualId, email, ...profile, onboarding_completed: true },
        { upsert: true, new: true }
      ).lean(),
      User.findByIdAndUpdate(actualId, { profileType: type })
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
    const docs = await (Model as any).find({}, projection).sort({ createdAt: -1 }).lean();
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

  // ==================== Connection Methods ====================

  /** Get existing InvestorProfile or create one from PartnerProfile when partner_type is "Investor" */
  async getOrCreateInvestorProfileForUser(userId: string): Promise<any> {
    const actualId = await this.getCanonicalUserId(userId);
    let investorProfile = await InvestorProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: userId }]
    });
    if (investorProfile) return investorProfile;
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
    });
    if (!startupProfile) return [];

    const connections = await Connection.find({ startup_id: startupProfile._id })
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
      connection.status = 'declined';
    } else if (status === 'accepted') {
      if (isStartup) {
        connection.startup_accepted = true;
      } else if (isInvestor) {
        connection.investor_accepted = true;
      }

      // If both accepted, mark as accepted
      if (connection.startup_accepted && connection.investor_accepted) {
        connection.status = 'accepted';
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

  // ==================== Generic Connection Methods (Intent-based) ====================

  async createGenericConnection(
    fromUserId: string,
    toUserId: string,
    fromProfileType: string,
    toProfileType: string,
    message?: string,
    intentId?: string
  ) {
    const actualFromId = await this.getCanonicalUserId(fromUserId);
    const actualToId = await this.getCanonicalUserId(toUserId);

    // Check for existing connection (bidirectional)
    const existing = await Connection.findOne({
      $or: [
        { from_user_id: actualFromId, to_user_id: actualToId },
        { from_user_id: actualToId, to_user_id: actualFromId }
      ]
    });

    if (existing) throw new Error("Connection already exists");

    const connection = new Connection({
      from_user_id: actualFromId,
      to_user_id: actualToId,
      from_profile_type: fromProfileType,
      to_profile_type: toProfileType,
      message: message || null,
      status: 'pending',
      intent_id: intentId || null,
    });

    await connection.save();
    return connection.toObject();
  }

  async getConnectionsByUser(userId: string) {
    const actualId = await this.getCanonicalUserId(userId);

    const connections = await Connection.find({
      $or: [
        { from_user_id: actualId },
        { to_user_id: actualId }
      ]
    })
      .populate('intent_id', 'intent_type metadata')
      .sort({ created_at: -1 })
      .lean();

    // Populate profile info for each connection
    const populated = await Promise.all(
      connections.map(async (conn: any) => {
        const isFrom = conn.from_user_id.toString() === actualId;
        const otherUserId = isFrom ? conn.to_user_id : conn.from_user_id;
        const otherProfileType = isFrom ? conn.to_profile_type : conn.from_profile_type;

        // Get other user's profile
        let otherProfile = null;
        if (otherProfileType === 'startup') {
          otherProfile = await StartupProfile.findOne({ user_id: otherUserId }).lean();
        } else if (otherProfileType === 'individual') {
          otherProfile = await IndividualProfile.findOne({ user_id: otherUserId }).lean();
        } else if (otherProfileType === 'partner') {
          otherProfile = await PartnerProfile.findOne({ user_id: otherUserId }).lean();
        } else if (otherProfileType === 'investor') {
          otherProfile = await InvestorProfile.findOne({ user_id: otherUserId }).lean();
        }

        return {
          ...conn,
          id: conn._id.toString(),
          is_sender: isFrom,
          other_profile: otherProfile,
          other_profile_type: otherProfileType
        };
      })
    );

    return populated;
  }

  async getReceivedConnectionRequests(userId: string) {
    const actualId = await this.getCanonicalUserId(userId);

    const connections = await Connection.find({
      to_user_id: actualId,
      status: 'pending'
    })
      .populate('intent_id', 'intent_type metadata')
      .sort({ created_at: -1 })
      .lean();

    const populated = await Promise.all(
      connections.map(async (conn: any) => {
        let fromProfile = null;
        if (conn.from_profile_type === 'startup') {
          fromProfile = await StartupProfile.findOne({ user_id: conn.from_user_id }).lean();
        } else if (conn.from_profile_type === 'individual') {
          fromProfile = await IndividualProfile.findOne({ user_id: conn.from_user_id }).lean();
        } else if (conn.from_profile_type === 'partner') {
          fromProfile = await PartnerProfile.findOne({ user_id: conn.from_user_id }).lean();
        } else if (conn.from_profile_type === 'investor') {
          fromProfile = await InvestorProfile.findOne({ user_id: conn.from_user_id }).lean();
        }

        return {
          ...conn,
          id: conn._id.toString(),
          from_profile: fromProfile,
        };
      })
    );

    return populated;
  }

  async getSentConnectionRequests(userId: string) {
    const actualId = await this.getCanonicalUserId(userId);

    const connections = await Connection.find({
      from_user_id: actualId,
      status: 'pending'
    })
      .populate('intent_id', 'intent_type metadata')
      .sort({ created_at: -1 })
      .lean();

    const populated = await Promise.all(
      connections.map(async (conn: any) => {
        let toProfile = null;
        if (conn.to_profile_type === 'startup') {
          toProfile = await StartupProfile.findOne({ user_id: conn.to_user_id }).lean();
        } else if (conn.to_profile_type === 'individual') {
          toProfile = await IndividualProfile.findOne({ user_id: conn.to_user_id }).lean();
        } else if (conn.to_profile_type === 'partner') {
          toProfile = await PartnerProfile.findOne({ user_id: conn.to_user_id }).lean();
        } else if (conn.to_profile_type === 'investor') {
          toProfile = await InvestorProfile.findOne({ user_id: conn.to_user_id }).lean();
        }

        return {
          ...conn,
          id: conn._id.toString(),
          to_profile: toProfile,
        };
      })
    );

    return populated;
  }

  async acceptConnection(connectionId: string, userId: string) {
    const actualId = await this.getCanonicalUserId(userId);
    const connection = await Connection.findById(connectionId);

    if (!connection) throw new Error("Connection not found");

    const isReceiver = connection.to_user_id.toString() === actualId;
    if (!isReceiver) throw new Error("Only the receiver can accept a connection");

    connection.to_accepted = true;
    connection.status = 'accepted';
    await connection.save();

    return connection.toObject();
  }

  async declineConnection(connectionId: string, userId: string) {
    const actualId = await this.getCanonicalUserId(userId);
    const connection = await Connection.findById(connectionId);

    if (!connection) throw new Error("Connection not found");

    const isReceiver = connection.to_user_id.toString() === actualId;
    if (!isReceiver) throw new Error("Only the receiver can decline a connection");

    connection.status = 'declined';
    await connection.save();

    return connection.toObject();
  }

  // ==================== Discovery Methods ====================

  async getApprovedStartupsForInvestor(filters: DiscoverFilters) {
    const query: any = {
      approved: true,
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
      phone: 0
    };

    const startups = await StartupProfile.find(query, projection)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Add founder_label for anonymization and id for frontend
    return startups.map(s => ({
      ...s,
      id: s._id.toString(),
      founder_label: s.role || "Founder"
    }));
  }

  // ==================== Matching Methods ====================

  async getMatchesForInvestor(investorUserId: string, limit: number = 20) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return [];

    // Get approved startups (fundraising is optional)
    const startups = await StartupProfile.find({
      approved: true,
    }).limit(100).lean();

    // Score each startup
    const scoredStartups = startups.map(startup => {
      const score = this.calculateMatchScore(investorProfile, startup);
      return { startup, score };
    });

    // Sort by score and take top N
    scoredStartups.sort((a, b) => b.score - a.score);

    return scoredStartups.slice(0, limit).map(({ startup, score }) => ({
      ...startup,
      id: startup._id.toString(),
      match_score: score,
      founder_label: startup.role || "Founder",
      // Anonymize
      email: undefined,
      full_name: undefined,
      linkedin_url: undefined,
      website: undefined,
      deck_link: undefined,
      phone: undefined
    }));
  }

  private calculateMatchScore(investor: any, startup: any): number {
    let score = 0;

    // Sector match (40 points max)
    if (investor.sectors && startup.industry) {
      const investorSectors = investor.sectors;
      const startupIndustries = Array.isArray(startup.industry) ? startup.industry : [startup.industry];
      const sectorMatch = investorSectors.some((s: string) => startupIndustries.includes(s));
      if (sectorMatch) score += 40;
    }

    // Stage match (30 points max)
    if (investor.stages && startup.stage) {
      const stageMatch = investor.stages.includes(startup.stage);
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

  // ==================== Intent Management Methods ====================

  async createIntent(userId: string, intentData: any): Promise<any> {
    const actualId = await this.getCanonicalUserId(userId);

    const intent = new Intent({
      user_id: actualId,
      profile_type: intentData.profile_type,
      intent_type: intentData.intent_type,
      metadata: intentData.metadata || {},
      status: 'open'
    });

    await intent.save();
    return intent.toObject();
  }

  async getUserIntents(userId: string, status?: string): Promise<any[]> {
    const actualId = await this.getCanonicalUserId(userId);

    const query: any = { user_id: actualId };
    if (status) {
      query.status = status;
    }

    const intents = await Intent.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return intents.map(intent => ({
      ...intent,
      id: intent._id.toString()
    }));
  }

  async updateIntent(intentId: string, userId: string, updates: any): Promise<any> {
    const actualId = await this.getCanonicalUserId(userId);

    // Verify the intent belongs to the user
    const intent = await Intent.findOne({ _id: intentId, user_id: actualId });
    if (!intent) throw new Error("Intent not found or unauthorized");

    // Update allowed fields
    const allowedUpdates = ['status', 'metadata'];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    updateData.updatedAt = new Date();

    const updated = await Intent.findByIdAndUpdate(
      intentId,
      { $set: updateData },
      { new: true }
    ).lean();

    return {
      ...updated,
      id: updated!._id.toString()
    };
  }

  async deleteIntent(intentId: string, userId: string): Promise<void> {
    const actualId = await this.getCanonicalUserId(userId);

    const result = await Intent.findOneAndDelete({
      _id: intentId,
      user_id: actualId
    });

    if (!result) throw new Error("Intent not found or unauthorized");
  }

  async getMatchesForIntent(intentId: string, userId: string, limit: number = 20): Promise<any[]> {
    const actualId = await this.getCanonicalUserId(userId);

    // Verify the intent belongs to the user
    const intent = await Intent.findOne({ _id: intentId, user_id: actualId }).lean();
    if (!intent) throw new Error("Intent not found or unauthorized");

    let candidatePool: any[] = [];

    // Determine candidate pool based on intent type
    switch (intent.intent_type) {
      case 'hiring':
        // Match with Individuals
        candidatePool = await IndividualProfile.find({
          looking_for: { $in: ['job', 'freelance', 'internship'] },
          approved: true,
          onboarding_completed: true
        }).limit(100).lean();
        break;

      case 'partnerships':
      case 'promotions':
        // Match with Partners
        candidatePool = await PartnerProfile.find({
          approved: true,
          onboarding_completed: true
        }).limit(100).lean();
        break;

      case 'fundraising':
        // Match with Investors
        candidatePool = await InvestorProfile.find({
          approved: true,
          onboarding_completed: true
        }).limit(100).lean();
        break;

      case 'clients':
      case 'dealflow':
        // Partner looking for clients -> match with Startups
        candidatePool = await StartupProfile.find({
          approved: true,
          onboarding_completed: true
        }).limit(100).lean();
        break;

      case 'jobs':
      case 'freelance':
      case 'internship':
        // Individual looking for jobs -> match with Startups that have hiring intent
        candidatePool = await StartupProfile.find({
          approved: true,
          onboarding_completed: true
        }).limit(100).lean();
        break;

      default:
        return [];
    }

    // Score each candidate
    const scoredMatches = candidatePool.map(candidate => ({
      profile: candidate,
      score: this.calculateIntentMatchScore(intent, candidate)
    }));

    // Sort by score descending, filter score >= 40
    const topMatches = scoredMatches
      .filter(m => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return topMatches.map(({ profile, score }) => ({
      ...profile,
      id: profile._id.toString(),
      match_score: score
    }));
  }

  async getMatchesForUserIntents(userId: string, limit: number = 20): Promise<any[]> {
    const actualId = await this.getCanonicalUserId(userId);

    // Get user's active intents
    const intents = await Intent.find({
      user_id: actualId,
      status: 'open'
    }).lean();

    if (intents.length === 0) return [];

    // Get matches for each intent and aggregate
    const allMatches = await Promise.all(
      intents.map(intent => this.getMatchesForIntent(intent._id.toString(), userId, 10))
    );

    // Flatten and deduplicate by profile ID
    const uniqueMatches = new Map();
    for (const matches of allMatches) {
      for (const match of matches) {
        const existingMatch = uniqueMatches.get(match.id);
        // Keep the match with the higher score
        if (!existingMatch || match.match_score > existingMatch.match_score) {
          uniqueMatches.set(match.id, match);
        }
      }
    }

    // Convert back to array and sort by score
    return Array.from(uniqueMatches.values())
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  private calculateIntentMatchScore(intent: any, candidate: any): number {
    let score = 0;

    // Intent Compatibility (40 points)
    score += this.scoreIntentAlignment(intent, candidate);

    // Profile Alignment (30 points)
    score += this.scoreProfileAlignment(intent, candidate);

    // Budget/Compensation Match (20 points)
    score += this.scoreBudgetMatch(intent, candidate);

    // Availability & Urgency (10 points)
    score += this.scoreAvailability(intent, candidate);

    return Math.min(score, 100);
  }

  private scoreIntentAlignment(intent: any, candidate: any): number {
    // Base alignment score based on intent type and candidate profile
    let score = 0;

    switch (intent.intent_type) {
      case 'hiring':
        // Check if candidate is looking for jobs
        if (candidate.looking_for) {
          const lookingFor = Array.isArray(candidate.looking_for)
            ? candidate.looking_for
            : [candidate.looking_for];

          if (lookingFor.includes('job') || lookingFor.includes('freelance') || lookingFor.includes('internship')) {
            score += 20;
          }
        }

        // Check skill match
        if (intent.metadata?.key_skills && candidate.skills) {
          const intentSkills = intent.metadata.key_skills;
          const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills : [candidate.skills];

          const hasMatch = intentSkills.some((skill: string) =>
            candidateSkills.some((cSkill: string) =>
              cSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );

          if (hasMatch) score += 20;
        }
        break;

      case 'fundraising':
        // Check sector match
        if (candidate.sectors && intent.metadata?.industry) {
          const sectorMatch = candidate.sectors.includes(intent.metadata.industry);
          if (sectorMatch) score += 20;
        }

        // Check stage match
        if (candidate.stages && intent.metadata?.stage) {
          const stageMatch = candidate.stages.includes(intent.metadata.stage);
          if (stageMatch) score += 20;
        }
        break;

      case 'partnerships':
      case 'promotions':
        // Check service match
        if (candidate.services_offered && intent.metadata?.service_type) {
          const serviceMatch = candidate.services_offered.includes(intent.metadata.service_type);
          if (serviceMatch) score += 40;
        }
        break;

      default:
        score += 20; // Base compatibility score
    }

    return score;
  }

  private scoreProfileAlignment(intent: any, candidate: any): number {
    let score = 0;

    // Industry/sector match (10 points)
    if (intent.metadata?.preferred_industries && candidate.industry) {
      const industries = Array.isArray(intent.metadata.preferred_industries)
        ? intent.metadata.preferred_industries
        : [intent.metadata.preferred_industries];

      const candidateIndustry = Array.isArray(candidate.industry)
        ? candidate.industry
        : [candidate.industry];

      const hasMatch = industries.some((ind: string) => candidateIndustry.includes(ind));
      if (hasMatch) score += 10;
    }

    // Stage match (10 points)
    if (intent.metadata?.stage && candidate.stages_served) {
      const stageMatch = candidate.stages_served.includes(intent.metadata.stage);
      if (stageMatch) score += 10;
    }

    // Location match (10 points)
    if (intent.metadata?.location && candidate.location) {
      const locationMatch = candidate.location.toLowerCase().includes(intent.metadata.location.toLowerCase());
      if (locationMatch) score += 10;
    }

    return score;
  }

  private scoreBudgetMatch(intent: any, candidate: any): number {
    let score = 0;

    // Budget/compensation matching
    if (intent.metadata?.budget_range && candidate.expected_pay) {
      // Simple string comparison for now
      // TODO: Implement proper range overlap logic
      score += 10;
    }

    if (intent.metadata?.ticket_size && candidate.check_size) {
      // Use existing check size matching logic
      const match = this.matchCheckSize(candidate.check_size, intent.metadata.ticket_size);
      if (match) score += 20;
    }

    return score;
  }

  private scoreAvailability(intent: any, candidate: any): number {
    let score = 0;

    // Availability match
    if (intent.metadata?.availability && candidate.availability) {
      const match = intent.metadata.availability === candidate.availability;
      if (match) score += 5;
    }

    // Urgency bonus
    if (intent.metadata?.urgency === 'high') {
      score += 5;
    }

    return score;
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

    // Profile completion
    const completedProfiles = await Promise.all([
      StartupProfile.countDocuments({ onboarding_completed: true }),
      PartnerProfile.countDocuments({ onboarding_completed: true }),
      IndividualProfile.countDocuments({ onboarding_completed: true }),
      InvestorProfile.countDocuments({ onboarding_completed: true })
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
}

export const storage = new DatabaseStorage();
