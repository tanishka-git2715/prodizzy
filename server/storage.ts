import { Waitlist, StartupProfile, InvestorProfile, PartnerProfile, IndividualProfile, User, Connection } from "./models";
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
    // 1. Try to get the user first to see if they have a cached profileType
    const user = await User.findById(userId).lean();

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

    // 3. If found during fallback, update the user for next time
    if (profile && user) {
      await User.findByIdAndUpdate(userId, { profileType: profile.type });
    }

    return profile || undefined;
  }

  async upsertProfile(userId: string, email: string, profile: any, type: string): Promise<any> {
    const Model = this.getModelByType(type);

    // Update user's profileType and profile in parallel
    const [doc] = await Promise.all([
      (Model as any).findOneAndUpdate(
        { user_id: userId },
        { user_id: userId, email, ...profile, onboarding_completed: true },
        { upsert: true, new: true }
      ).lean(),
      User.findByIdAndUpdate(userId, { profileType: type })
    ]);

    return { ...doc, type: type };
  }

  async patchProfile(userId: string, patch: any): Promise<any> {
    // Find which profile the user has first
    const profile = await this.getProfileByUserId(userId);
    if (!profile) throw new Error("Profile not found");

    const Model = this.getModelByType(profile.type);
    const doc = await (Model as any).findOneAndUpdate(
      { user_id: userId },
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
    let investorProfile = await InvestorProfile.findOne({ user_id: userId });
    if (investorProfile) return investorProfile;
    const partnerProfile = await PartnerProfile.findOne({ user_id: userId, partner_type: "Investor" });
    if (!partnerProfile) return null;
    investorProfile = await InvestorProfile.create({
      user_id: userId,
      email: partnerProfile.email,
      full_name: partnerProfile.full_name,
      firm_name: partnerProfile.company_name,
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
    const startupProfile = await StartupProfile.findOne({ user_id: startupUserId });
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

    // Determine if user is startup or investor
    const isStartup = startup.user_id === userId;
    const isInvestor = investor.user_id === userId;

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
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
    if (!investorProfile) return null;

    return await Connection.findOne({
      startup_id: startupId,
      investor_id: investorProfile._id
    }).lean();
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
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
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
}

export const storage = new DatabaseStorage();
