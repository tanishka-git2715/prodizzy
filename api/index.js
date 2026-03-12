"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// _api-src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => handler
});
module.exports = __toCommonJS(index_exports);

// server/app.ts
var import_express = __toESM(require("express"), 1);

// server/storage.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);

// server/models.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var WaitlistSchema = new import_mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var Waitlist = import_mongoose.default.model("Waitlist", WaitlistSchema);
var StartupProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  company_name: { type: String, required: true },
  role: { type: String, required: true },
  full_name: { type: String, required: true },
  phone: String,
  website: String,
  linkedin_url: String,
  stage: String,
  industry: [String],
  team_size: String,
  location: String,
  is_registered: String,
  product_description: String,
  problem_solved: String,
  target_audience: String,
  num_users: String,
  monthly_revenue: String,
  traction_highlights: String,
  intents: [String],
  onboarding_completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // Intent data
  intent_validation: Object,
  intent_hiring: Object,
  intent_partnerships: Object,
  intent_promotions: Object,
  intent_fundraising: Object
}, { strict: false });
var StartupProfile = import_mongoose.default.model("StartupProfile", StartupProfileSchema);
var InvestorProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  full_name: { type: String, required: true },
  firm_name: String,
  investor_type: String,
  check_size: String,
  sectors: [String],
  stages: [String],
  geography: String,
  thesis: String,
  onboarding_completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
var InvestorProfile = import_mongoose.default.model("InvestorProfile", InvestorProfileSchema);
var PartnerProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  company_name: String,
  role: String,
  full_name: String,
  phone: String,
  website: String,
  linkedin_url: String,
  partner_type: String,
  services_offered: [String],
  stages_served: [String],
  pricing_model: String,
  average_deal_size: String,
  team_size: String,
  years_experience: String,
  tools_tech_stack: String,
  work_mode: String,
  portfolio_links: String,
  case_studies: String,
  past_clients: String,
  certifications: String,
  looking_for: String,
  monthly_capacity: String,
  preferred_budget_range: String,
  onboarding_completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
var PartnerProfile = import_mongoose.default.model("PartnerProfile", PartnerProfileSchema);
var IndividualProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  full_name: String,
  phone: String,
  linkedin_url: String,
  profile_type: String,
  skills: [String],
  experience_level: String,
  portfolio_url: String,
  tools_used: String,
  looking_for: String,
  preferred_roles: String,
  preferred_industries: String,
  availability: String,
  work_mode: String,
  expected_pay: String,
  location: String,
  resume_url: String,
  projects: String,
  achievements: String,
  github_url: String,
  onboarding_completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
var IndividualProfile = import_mongoose.default.model("IndividualProfile", IndividualProfileSchema);
var UserSchema = new import_mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  displayName: String,
  avatarUrl: String,
  role: { type: String, default: "user", enum: ["user", "admin"] },
  profileType: { type: String, enum: ["startup", "investor", "partner", "individual"] },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
var User = import_mongoose.default.model("User", UserSchema);
var ConnectionSchema = new import_mongoose.Schema({
  startup_id: { type: import_mongoose.Schema.Types.ObjectId, ref: "StartupProfile", required: true },
  investor_id: { type: import_mongoose.Schema.Types.ObjectId, ref: "InvestorProfile", required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  },
  startup_accepted: { type: Boolean, default: false },
  investor_accepted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
ConnectionSchema.index({ startup_id: 1, investor_id: 1 }, { unique: true });
ConnectionSchema.index({ investor_id: 1, status: 1 });
ConnectionSchema.index({ startup_id: 1, status: 1 });
ConnectionSchema.index({ created_at: -1 });
var Connection = import_mongoose.default.model("Connection", ConnectionSchema);
StartupProfileSchema.index({ approved: 1 });
StartupProfileSchema.index({ "intent_fundraising.capital_amount": 1 });
StartupProfileSchema.index({ industry: 1 });
StartupProfileSchema.index({ stage: 1 });
StartupProfileSchema.index({ location: "text" });
InvestorProfileSchema.index({ user_id: 1 });
InvestorProfileSchema.index({ sectors: 1 });
InvestorProfileSchema.index({ stages: 1 });

// server/storage.ts
var DatabaseStorage = class {
  async createWaitlistEntry(entry) {
    const doc = new Waitlist({ name: entry.name, email: entry.email, role: entry.role });
    await doc.save();
    return doc.toObject();
  }
  async getWaitlistEntryByEmail(email) {
    const doc = await Waitlist.findOne({ email });
    if (!doc) return void 0;
    return doc.toObject();
  }
  async getCanonicalUserId(userId) {
    const user = await User.findOne({
      $or: [
        { _id: import_mongoose2.default.isValidObjectId(userId) ? userId : new import_mongoose2.default.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    return user ? user._id.toString() : userId;
  }
  getModelByType(type) {
    switch (type) {
      case "startup":
        return StartupProfile;
      case "investor":
        return InvestorProfile;
      case "partner":
        return PartnerProfile;
      case "individual":
        return IndividualProfile;
      default:
        return StartupProfile;
    }
  }
  async getProfileByUserId(userId) {
    const user = await User.findOne({
      $or: [
        { _id: import_mongoose2.default.isValidObjectId(userId) ? userId : new import_mongoose2.default.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    if (user?.profileType) {
      const Model = this.getModelByType(user.profileType);
      let doc = await Model.findOne({ user_id: userId }).lean();
      if (!doc && user?.googleId && user.googleId !== userId) {
        doc = await Model.findOne({ user_id: user.googleId }).lean();
      }
      if (doc) {
        return { ...doc, type: user.profileType };
      }
    }
    const models = [
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" },
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" }
    ];
    const results = await Promise.all(
      models.map(async ({ model, type }) => {
        let doc = await model.findOne({ user_id: userId }).lean();
        if (!doc && user?.googleId && user.googleId !== userId) {
          doc = await model.findOne({ user_id: user.googleId }).lean();
        }
        if (doc) return { ...doc, type };
        return null;
      })
    );
    const profile = results.find((r) => r !== null);
    if (profile && user && profile.onboarding_completed) {
      await User.findByIdAndUpdate(userId, { profileType: profile.type });
    }
    return profile || void 0;
  }
  async upsertProfile(userId, email, profile, type) {
    const Model = this.getModelByType(type);
    const user = await User.findOne({
      $or: [
        { _id: import_mongoose2.default.isValidObjectId(userId) ? userId : new import_mongoose2.default.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    if (!user) throw new Error("User not found");
    const actualId = user._id.toString();
    const [doc] = await Promise.all([
      Model.findOneAndUpdate(
        { $or: [{ user_id: userId }, { user_id: user.googleId }] },
        { user_id: actualId, email, ...profile, onboarding_completed: true },
        { upsert: true, new: true }
      ).lean(),
      User.findByIdAndUpdate(actualId, { profileType: type })
    ]);
    return { ...doc, type };
  }
  async patchProfile(userId, patch) {
    const actualId = await this.getCanonicalUserId(userId);
    const profile = await this.getProfileByUserId(actualId);
    if (!profile) throw new Error("Profile not found");
    const Model = this.getModelByType(profile.type);
    const doc = await Model.findOneAndUpdate(
      { user_id: profile.user_id },
      // Use the ID already in the profile doc
      { $set: patch },
      { new: true }
    ).lean();
    return { ...doc, type: profile.type };
  }
  async getAllProfiles(type) {
    const Model = this.getModelByType(type);
    const projection = {
      intent_validation: 0,
      intent_hiring: 0,
      intent_partnerships: 0,
      intent_promotions: 0,
      intent_fundraising: 0
    };
    const docs = await Model.find({}, projection).sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      ...d,
      id: d._id.toString()
    }));
  }
  async updateProfileApproval(type, id, approved) {
    const Model = this.getModelByType(type);
    const doc = await Model.findByIdAndUpdate(id, { approved }, { new: true });
    if (!doc) throw new Error("Profile not found");
    return doc.toObject();
  }
  async getAllUsers() {
    return await User.find({}).sort({ createdAt: -1 });
  }
  async getAllWaitlistEntries() {
    return await Waitlist.find({}).sort({ createdAt: -1 });
  }
  async getUserByGoogleId(googleId) {
    return await User.findOne({ googleId });
  }
  async deleteProfile(type, id) {
    const Model = this.getModelByType(type);
    await Model.findByIdAndDelete(id);
  }
  // ==================== Connection Methods ====================
  /** Get existing InvestorProfile or create one from PartnerProfile when partner_type is "Investor" */
  async getOrCreateInvestorProfileForUser(userId) {
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
      email: partnerProfile.email,
      full_name: partnerProfile.full_name,
      firm_name: partnerProfile.company_name || "NA",
      investor_type: "Investor",
      check_size: "<$50k",
      sectors: [],
      stages: [],
      geography: "",
      onboarding_completed: true,
      approved: !!partnerProfile.approved
    });
    return investorProfile;
  }
  async createConnection(investorUserId, startupId, message) {
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
    if (!investorProfile) throw new Error("Investor profile not found");
    const startupProfile = await StartupProfile.findById(startupId);
    if (!startupProfile) throw new Error("Startup not found");
    if (!startupProfile.approved) throw new Error("Startup not approved");
    const existing = await Connection.findOne({
      startup_id: startupId,
      investor_id: investorProfile._id
    });
    if (existing) throw new Error("Connection already exists");
    const connection = new Connection({
      startup_id: startupId,
      investor_id: investorProfile._id,
      message: message || null,
      status: "pending"
    });
    await connection.save();
    return connection.toObject();
  }
  async getConnectionById(connectionId) {
    const connection = await Connection.findById(connectionId).populate("startup_id", "company_name industry stage user_id email full_name linkedin_url website").populate("investor_id", "full_name firm_name investor_type check_size email user_id").lean();
    return connection;
  }
  async getConnectionsByInvestor(investorUserId) {
    const investorProfile = await this.getOrCreateInvestorProfileForUser(investorUserId);
    if (!investorProfile) return [];
    const connections = await Connection.find({ investor_id: investorProfile._id }).populate("startup_id", "company_name industry stage user_id email full_name linkedin_url website").sort({ created_at: -1 }).lean();
    return connections.map((conn) => {
      const startup = conn.startup_id;
      return {
        ...conn,
        id: conn._id.toString(),
        startup: conn.status === "accepted" ? {
          company_name: startup.company_name,
          industry: startup.industry,
          stage: startup.stage,
          email: startup.email,
          full_name: startup.full_name,
          linkedin_url: startup.linkedin_url,
          website: startup.website
        } : {
          company_name: startup.company_name,
          industry: startup.industry,
          stage: startup.stage
          // No contact info until accepted
        }
      };
    });
  }
  async getConnectionsByStartup(startupUserId) {
    const actualId = await this.getCanonicalUserId(startupUserId);
    const startupProfile = await StartupProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: startupUserId }]
    });
    if (!startupProfile) return [];
    const connections = await Connection.find({ startup_id: startupProfile._id }).populate("investor_id", "full_name firm_name investor_type check_size email user_id").sort({ created_at: -1 }).lean();
    return connections.map((conn) => {
      const investor = conn.investor_id;
      return {
        ...conn,
        id: conn._id.toString(),
        investor: conn.status === "accepted" ? {
          full_name: investor.full_name,
          firm_name: investor.firm_name,
          investor_type: investor.investor_type,
          check_size: investor.check_size,
          email: investor.email
        } : {
          firm_name: investor.firm_name || "Anonymous Investor",
          investor_type: investor.investor_type,
          check_size: investor.check_size
          // No contact info until accepted
        }
      };
    });
  }
  async updateConnectionStatus(connectionId, userId, status) {
    const connection = await Connection.findById(connectionId).populate("startup_id", "user_id").populate("investor_id", "user_id");
    if (!connection) throw new Error("Connection not found");
    const startup = connection.startup_id;
    const investor = connection.investor_id;
    const actualId = await this.getCanonicalUserId(userId);
    const isStartup = startup.user_id === actualId || startup.user_id === userId;
    const isInvestor = investor.user_id === actualId || investor.user_id === userId;
    if (!isStartup && !isInvestor) {
      throw new Error("Unauthorized to update this connection");
    }
    if (status === "declined") {
      connection.status = "declined";
    } else if (status === "accepted") {
      if (isStartup) {
        connection.startup_accepted = true;
      } else if (isInvestor) {
        connection.investor_accepted = true;
      }
      if (connection.startup_accepted && connection.investor_accepted) {
        connection.status = "accepted";
      }
    }
    await connection.save();
    return this.getConnectionById(connectionId);
  }
  async checkExistingConnection(investorUserId, startupId) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return null;
    return await Connection.findOne({
      startup_id: startupId,
      investor_id: investorProfile._id
    }).lean();
  }
  // ==================== Discovery Methods ====================
  async getApprovedStartupsForInvestor(filters) {
    const query = {
      approved: true
    };
    if (filters.industry) {
      query.industry = filters.industry;
    }
    if (filters.stage) {
      query.stage = filters.stage;
    }
    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }
    const projection = {
      email: 0,
      full_name: 0,
      linkedin_url: 0,
      website: 0,
      deck_link: 0,
      phone: 0
    };
    const startups = await StartupProfile.find(query, projection).sort({ createdAt: -1 }).limit(100).lean();
    return startups.map((s) => ({
      ...s,
      id: s._id.toString(),
      founder_label: s.role || "Founder"
    }));
  }
  // ==================== Matching Methods ====================
  async getMatchesForInvestor(investorUserId, limit = 20) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return [];
    const startups = await StartupProfile.find({
      approved: true
    }).limit(100).lean();
    const scoredStartups = startups.map((startup) => {
      const score = this.calculateMatchScore(investorProfile, startup);
      return { startup, score };
    });
    scoredStartups.sort((a, b) => b.score - a.score);
    return scoredStartups.slice(0, limit).map(({ startup, score }) => ({
      ...startup,
      id: startup._id.toString(),
      match_score: score,
      founder_label: startup.role || "Founder",
      // Anonymize
      email: void 0,
      full_name: void 0,
      linkedin_url: void 0,
      website: void 0,
      deck_link: void 0,
      phone: void 0
    }));
  }
  calculateMatchScore(investor, startup) {
    let score = 0;
    if (investor.sectors && startup.industry) {
      const investorSectors = investor.sectors;
      const startupIndustries = Array.isArray(startup.industry) ? startup.industry : [startup.industry];
      const sectorMatch = investorSectors.some((s) => startupIndustries.includes(s));
      if (sectorMatch) score += 40;
    }
    if (investor.stages && startup.stage) {
      const stageMatch = investor.stages.includes(startup.stage);
      if (stageMatch) score += 30;
    }
    if (investor.check_size && startup.intent_fundraising?.ticket_size) {
      const checkSizeMatch = this.matchCheckSize(
        investor.check_size,
        startup.intent_fundraising.ticket_size
      );
      if (checkSizeMatch) score += 30;
    }
    return score;
  }
  matchCheckSize(investorCheck, startupTicket) {
    const rangeMap = {
      "<$50k": [0, 5e4],
      "$50k-$250k": [5e4, 25e4],
      "$250k-$1M": [25e4, 1e6],
      "$1M-$5M": [1e6, 5e6],
      "$5M+": [5e6, Infinity]
    };
    const investorRange = rangeMap[investorCheck];
    const startupRange = rangeMap[startupTicket];
    if (!investorRange || !startupRange) return false;
    return investorRange[1] >= startupRange[0] && investorRange[0] <= startupRange[1];
  }
  // Analytics Methods Implementation
  async getActiveUsersCount(days) {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const count = await User.countDocuments({
      lastLogin: { $gte: cutoffDate }
    });
    return count;
  }
  async getUserGrowthTrends(startDate, endDate) {
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
  async getConnectionMetrics() {
    const totalConnections = await Connection.countDocuments({});
    const pendingConnections = await Connection.countDocuments({ status: "pending" });
    const acceptedConnections = await Connection.countDocuments({ status: "accepted" });
    const declinedConnections = await Connection.countDocuments({ status: "declined" });
    const acceptanceRate = totalConnections > 0 ? acceptedConnections / (acceptedConnections + declinedConnections) * 100 || 0 : 0;
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
      avgResponseTime = totalResponseTime / respondedConnections.length / (1e3 * 60 * 60 * 24);
    }
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
    const repeatRate = connectionsPerUser.length > 0 ? connectionsPerUser[0].repeatUsers / connectionsPerUser[0].totalUsers * 100 : 0;
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
  async getCohortData() {
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
    const cohortData = await Promise.all(
      cohorts.map(async (cohort) => {
        const cohortDate = new Date(cohort._id.year, cohort._id.month - 1, 1);
        const cohortMonth = `${cohort._id.year}-${String(cohort._id.month).padStart(2, "0")}`;
        const retentionMonths = [0, 1, 2, 3, 6];
        const retention = {};
        for (const monthOffset of retentionMonths) {
          const checkDate = new Date(cohortDate);
          checkDate.setMonth(checkDate.getMonth() + monthOffset);
          const nextMonthDate = new Date(checkDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          const activeUsers = await User.countDocuments({
            _id: { $in: cohort.userIds },
            lastLogin: { $gte: checkDate, $lt: nextMonthDate }
          });
          const retentionRate = cohort.signupCount > 0 ? activeUsers / cohort.signupCount * 100 : 0;
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
  async getEngagementFunnel() {
    const totalSignups = await User.countDocuments({});
    const completedProfiles = await Promise.all([
      StartupProfile.countDocuments({ onboarding_completed: true }),
      PartnerProfile.countDocuments({ onboarding_completed: true }),
      IndividualProfile.countDocuments({ onboarding_completed: true }),
      InvestorProfile.countDocuments({ onboarding_completed: true })
    ]);
    const totalCompleted = completedProfiles.reduce((sum, count) => sum + count, 0);
    const usersWithConnections = await Connection.distinct("investor_user_id");
    const firstConnection = usersWithConnections.length;
    const acceptedConnections = await Connection.countDocuments({ status: "accepted" });
    return {
      signups: totalSignups,
      profileCompleted: totalCompleted,
      firstBrowse: firstConnection,
      firstConnection,
      acceptedConnection: acceptedConnections,
      conversionRates: {
        signupToProfile: totalSignups > 0 ? (totalCompleted / totalSignups * 100).toFixed(2) : "0.00",
        profileToBrowse: totalCompleted > 0 ? (firstConnection / totalCompleted * 100).toFixed(2) : "0.00",
        browseToConnection: firstConnection > 0 ? (firstConnection / firstConnection * 100).toFixed(2) : "0.00",
        connectionToAccepted: firstConnection > 0 ? (acceptedConnections / firstConnection * 100).toFixed(2) : "0.00"
      }
    };
  }
  async getMarketplaceHealth() {
    const startupCount = await StartupProfile.countDocuments({ approved: true });
    const investorCount = await InvestorProfile.countDocuments({});
    const partnerCount = await PartnerProfile.countDocuments({ approved: true });
    const startupToInvestorRatio = investorCount > 0 ? (startupCount / investorCount).toFixed(2) : "0.00";
    const activeInvestors = await Connection.distinct("investor_user_id");
    const totalSellers = investorCount + partnerCount;
    const sellerLiquidityIndex = totalSellers > 0 ? (activeInvestors.length / totalSellers * 100).toFixed(2) : "0.00";
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
      avgConnectionsPerActiveUser: totalSellers > 0 ? (connectionMetrics.total / totalSellers).toFixed(2) : "0.00"
    };
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
var import_zod2 = require("zod");

// shared/schema.ts
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var import_zod = require("zod");
var waitlistEntries = (0, import_pg_core.pgTable)("waitlist_entries", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  role: (0, import_pg_core.varchar)("role", { length: 50 }).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var insertWaitlistSchema = (0, import_drizzle_zod.createInsertSchema)(waitlistEntries).omit({
  id: true,
  createdAt: true
}).extend({
  email: import_zod.z.string().email("Please enter a valid email address"),
  role: import_zod.z.enum(["Founder", "Student", "Operator", "Freelancer", "Investor", "Agency", "Other"])
});
var intentValidationSchema = import_zod.z.object({
  feedback_type: import_zod.z.array(import_zod.z.string()).optional(),
  target_audience: import_zod.z.string().optional(),
  product_link: import_zod.z.string().optional(),
  specific_questions: import_zod.z.string().optional(),
  timeline: import_zod.z.string().optional(),
  response_count: import_zod.z.string().optional()
}).optional();
var intentHiringSchema = import_zod.z.object({
  role: import_zod.z.string().optional(),
  hiring_type: import_zod.z.string().optional(),
  work_mode: import_zod.z.string().optional(),
  budget_range: import_zod.z.string().optional(),
  urgency: import_zod.z.string().optional(),
  experience_level: import_zod.z.string().optional(),
  key_skills: import_zod.z.string().optional()
}).optional();
var intentPartnershipsSchema = import_zod.z.object({
  requirement_type: import_zod.z.array(import_zod.z.string()).optional(),
  partner_description: import_zod.z.string().optional(),
  goals: import_zod.z.string().optional(),
  budget: import_zod.z.string().optional(),
  timeline: import_zod.z.string().optional()
}).optional();
var intentPromotionsSchema = import_zod.z.object({
  promotion_type: import_zod.z.array(import_zod.z.string()).optional(),
  campaign_goal: import_zod.z.string().optional(),
  target_audience: import_zod.z.string().optional(),
  budget: import_zod.z.string().optional(),
  timeline: import_zod.z.string().optional(),
  expected_outcome: import_zod.z.string().optional()
}).optional();
var intentFundraisingSchema = import_zod.z.object({
  capital_amount: import_zod.z.string().optional(),
  fund_use: import_zod.z.string().optional(),
  funding_type: import_zod.z.string().optional(),
  annual_revenue: import_zod.z.string().optional(),
  existing_loans: import_zod.z.string().optional(),
  pitch_deck_link: import_zod.z.string().optional(),
  investors_approached: import_zod.z.string().optional(),
  investor_feedback: import_zod.z.string().optional(),
  compliance_status: import_zod.z.string().optional(),
  gst_filing_status: import_zod.z.string().optional(),
  past_defaults: import_zod.z.string().optional(),
  fundraising_reason: import_zod.z.string().optional(),
  investor_types_sought: import_zod.z.string().optional(),
  ticket_size: import_zod.z.string().optional(),
  ready_for_engagement: import_zod.z.string().optional()
}).optional();
var insertProfileSchema = import_zod.z.object({
  // Section 1: Basic Details
  company_name: import_zod.z.string().min(1, "Company name is required"),
  role: import_zod.z.string().min(1, "Your role is required"),
  full_name: import_zod.z.string().min(1, "Full name is required"),
  email: import_zod.z.string().email("Valid email required").optional(),
  // Often handled by auth but good to have
  phone: import_zod.z.string().optional(),
  website: import_zod.z.string().url("Valid URL required").optional().or(import_zod.z.literal("")),
  linkedin_url: import_zod.z.string().url("Valid LinkedIn URL required").optional().or(import_zod.z.literal("")),
  // Section 2: Startup Profile
  stage: import_zod.z.enum([
    "Pre-Seed (Ideation Stage)",
    "Seed (MVP & Early traction)",
    "Series A (Generating Revenue)",
    "Series B/C/D (Expansion & Scaling)",
    "MNC (Global)"
  ]),
  industry: import_zod.z.array(import_zod.z.string()).min(1, "Select at least one industry"),
  team_size: import_zod.z.enum(["Solo", "2\u201310", "11\u201350", "51\u2013500", "500\u20131000", "1000+"]),
  location: import_zod.z.string().min(1, "Location is required"),
  is_registered: import_zod.z.enum(["Yes", "No"]),
  // Section 3: Product & Traction
  product_description: import_zod.z.string().min(1, "Product description is required"),
  problem_solved: import_zod.z.string().optional(),
  target_audience: import_zod.z.string().min(1, "Target audience is required"),
  num_users: import_zod.z.string().optional(),
  monthly_revenue: import_zod.z.string().optional(),
  traction_highlights: import_zod.z.string().optional(),
  // Internal/System fields
  intents: import_zod.z.array(import_zod.z.string()).default([]),
  // Keep these for backward compatibility/internal use if needed
  company_description: import_zod.z.string().optional(),
  business_model: import_zod.z.string().optional(),
  target_customer: import_zod.z.string().optional(),
  primary_problem: import_zod.z.string().optional(),
  goals: import_zod.z.array(import_zod.z.string()).default([]),
  specific_ask: import_zod.z.string().default(""),
  traction_range: import_zod.z.string().optional(),
  revenue_status: import_zod.z.string().optional(),
  fundraising_status: import_zod.z.string().optional(),
  capital_use: import_zod.z.array(import_zod.z.string()).default([]),
  // Conditional intent data
  intent_validation: intentValidationSchema,
  intent_hiring: intentHiringSchema,
  intent_partnerships: intentPartnershipsSchema,
  intent_promotions: intentPromotionsSchema,
  intent_fundraising: intentFundraisingSchema
});
var updateProfileSchema = import_zod.z.object({
  team_size: import_zod.z.string().optional(),
  missing_roles: import_zod.z.array(import_zod.z.string()).optional(),
  hiring_urgency: import_zod.z.string().optional(),
  partnership_why: import_zod.z.array(import_zod.z.string()).optional(),
  ideal_partner_type: import_zod.z.string().optional(),
  partnership_maturity: import_zod.z.string().optional(),
  round_type: import_zod.z.string().optional(),
  investor_warmth: import_zod.z.array(import_zod.z.string()).optional(),
  geography: import_zod.z.string().optional(),
  speed_preference: import_zod.z.string().optional(),
  risk_appetite: import_zod.z.string().optional(),
  existing_backers: import_zod.z.string().optional(),
  notable_customers: import_zod.z.string().optional(),
  deck_link: import_zod.z.string().optional(),
  website: import_zod.z.string().optional(),
  linkedin_url: import_zod.z.string().optional()
}).partial();
var insertInvestorSchema = import_zod.z.object({
  full_name: import_zod.z.string().min(1, "Name is required"),
  firm_name: import_zod.z.string().optional(),
  investor_type: import_zod.z.enum(["VC", "Angel", "Family Office", "Strategic", "Other"]),
  check_size: import_zod.z.enum(["<$50k", "$50k-$250k", "$250k-$1M", "$1M-$5M", "$5M+"]),
  sectors: import_zod.z.array(import_zod.z.string()).min(1, "Select at least one sector"),
  stages: import_zod.z.array(import_zod.z.string()).min(1, "Select at least one stage"),
  geography: import_zod.z.string().default(""),
  thesis: import_zod.z.string().optional()
});
var insertPartnerSchema = import_zod.z.object({
  company_name: import_zod.z.string().min(1, "Company name is required"),
  role: import_zod.z.string().min(1, "Your role is required"),
  full_name: import_zod.z.string().min(1, "Full name is required"),
  email: import_zod.z.string().email("Valid email required"),
  phone: import_zod.z.string().optional(),
  website: import_zod.z.string().optional(),
  linkedin_url: import_zod.z.string().optional(),
  partner_type: import_zod.z.enum(["Agency", "Investor", "Service Provider", "Institutional Firm"]),
  services_offered: import_zod.z.array(import_zod.z.string()).default([]),
  stages_served: import_zod.z.array(import_zod.z.string()).default([]),
  pricing_model: import_zod.z.string().optional(),
  average_deal_size: import_zod.z.string().optional(),
  team_size: import_zod.z.string().optional(),
  years_experience: import_zod.z.string().optional(),
  tools_tech_stack: import_zod.z.string().optional(),
  work_mode: import_zod.z.string().optional(),
  portfolio_links: import_zod.z.string().optional(),
  case_studies: import_zod.z.string().optional(),
  past_clients: import_zod.z.string().optional(),
  certifications: import_zod.z.string().optional(),
  looking_for: import_zod.z.string().optional(),
  monthly_capacity: import_zod.z.string().optional(),
  preferred_budget_range: import_zod.z.string().optional()
});
var insertIndividualSchema = import_zod.z.object({
  full_name: import_zod.z.string().min(1, "Name is required"),
  email: import_zod.z.string().email("Valid email required"),
  phone: import_zod.z.string().optional(),
  linkedin_url: import_zod.z.string().optional(),
  portfolio_url: import_zod.z.string().optional(),
  profile_type: import_zod.z.enum(["Student", "Freelancer", "Professional", "Content Creator", "Community Admin"]),
  skills: import_zod.z.array(import_zod.z.string()).default([]),
  experience_level: import_zod.z.string().optional(),
  tools_used: import_zod.z.string().optional(),
  looking_for: import_zod.z.string().optional(),
  preferred_roles: import_zod.z.string().optional(),
  preferred_industries: import_zod.z.string().optional(),
  availability: import_zod.z.string().optional(),
  work_mode: import_zod.z.string().optional(),
  expected_pay: import_zod.z.string().optional(),
  location: import_zod.z.string().optional(),
  resume_url: import_zod.z.string().optional(),
  projects: import_zod.z.string().optional(),
  achievements: import_zod.z.string().optional(),
  github_url: import_zod.z.string().optional()
});
var insertConnectionSchema = import_zod.z.object({
  startup_id: import_zod.z.string(),
  message: import_zod.z.string().optional()
});

// shared/routes.ts
var errorSchemas = {
  validation: import_zod2.z.object({
    message: import_zod2.z.string(),
    field: import_zod2.z.string().optional()
  }),
  conflict: import_zod2.z.object({
    message: import_zod2.z.string()
  }),
  internal: import_zod2.z.object({
    message: import_zod2.z.string()
  })
};
var api = {
  waitlist: {
    create: {
      method: "POST",
      path: "/api/waitlist",
      input: insertWaitlistSchema,
      responses: {
        201: import_zod2.z.custom(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict
      }
    }
  },
  profile: {
    get: {
      method: "GET",
      path: "/api/profile"
    },
    upsert: {
      method: "PUT",
      path: "/api/profile",
      input: insertProfileSchema
    },
    update: {
      method: "PATCH",
      path: "/api/profile",
      input: updateProfileSchema
    }
  },
  discover: {
    get: {
      method: "GET",
      path: "/api/discover"
    }
  },
  connections: {
    create: {
      method: "POST",
      path: "/api/connections"
    },
    list: {
      method: "GET",
      path: "/api/connections"
    },
    update: {
      method: "PATCH",
      path: "/api/connections/:id"
    }
  },
  matches: {
    get: {
      method: "GET",
      path: "/api/matches"
    }
  }
};

// server/routes.ts
var import_zod3 = require("zod");
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}
function canActAsInvestor(profile) {
  return !!profile && (profile.type === "investor" || profile.type === "partner" && profile.partner_type === "Investor" && !!profile.approved);
}
async function registerRoutes(httpServer2, app3) {
  app3.post(api.waitlist.create.path, async (req, res) => {
    try {
      const input = api.waitlist.create.input.parse(req.body);
      const existing = await storage.getWaitlistEntryByEmail(input.email);
      if (existing) {
        return res.status(409).json({ message: "This email is already on the waitlist." });
      }
      const entry = await storage.createWaitlistEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      throw err;
    }
  });
  app3.get("/api/dashboard-init", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.json({ user: req.user, profile: null });
      }
      const promises = {};
      if (canActAsInvestor(profile) || profile.type === "startup") {
        promises.connections = canActAsInvestor(profile) ? storage.getConnectionsByInvestor(userId) : storage.getConnectionsByStartup(userId);
      }
      if (canActAsInvestor(profile)) {
        promises.matches = storage.getMatchesForInvestor(userId, 10);
      }
      const results = await Promise.all(Object.values(promises));
      const response = {
        user: { ...req.user, id: req.user._id?.toString() || req.user.id },
        profile
      };
      Object.keys(promises).forEach((key, index) => {
        response[key] = results[index];
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/profile", ensureAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.user.googleId || req.user.id);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      return res.json(profile);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
  app3.put("/api/profile", ensureAuthenticated, async (req, res) => {
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
      return res.status(500).json({ message: err.message });
    }
  });
  app3.patch("/api/profile", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const data = await storage.patchProfile(userId, req.body);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const type = req.query.type;
      if (!type) return res.status(400).json({ message: "Type is required" });
      const profiles = await storage.getAllProfiles(type);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const id = req.query.id;
      const type = req.query.type;
      const { approved } = req.body;
      if (!id || !type) return res.status(400).json({ message: "ID and Type are required" });
      const result = await storage.updateProfileApproval(type, id, approved);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.delete("/api/admin", ensureAdmin, async (req, res) => {
    try {
      const id = req.query.id;
      const type = req.query.type;
      if (!id || !type) return res.status(400).json({ message: "ID and Type are required" });
      await storage.deleteProfile(type, id);
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/analytics/overview", ensureAdmin, async (req, res) => {
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
        engagementRate: totalUsers.length > 0 ? (mau / totalUsers.length * 100).toFixed(2) : "0.00",
        totalConnections: connectionMetrics.total,
        acceptanceRate: connectionMetrics.acceptanceRate,
        startupCount: marketplaceHealth.startupCount,
        investorCount: marketplaceHealth.investorCount,
        partnerCount: marketplaceHealth.partnerCount
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/analytics/growth", ensureAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3);
      const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
      const growthData = await storage.getUserGrowthTrends(start, end);
      let cumulativeTotal = 0;
      const enrichedData = growthData.map((item) => {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/analytics/engagement", ensureAdmin, async (req, res) => {
    try {
      const funnelData = await storage.getEngagementFunnel();
      res.json(funnelData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/analytics/marketplace", ensureAdmin, async (req, res) => {
    try {
      const marketplaceHealth = await storage.getMarketplaceHealth();
      const connectionMetrics = await storage.getConnectionMetrics();
      res.json({
        ...marketplaceHealth,
        connections: connectionMetrics
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/analytics/cohorts", ensureAdmin, async (req, res) => {
    try {
      const cohortData = await storage.getCohortData();
      res.json(cohortData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/waitlist", ensureAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/discover", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile || !canActAsInvestor(profile)) {
        return res.status(403).json({ message: "Investor profile required" });
      }
      const filters = {
        industry: req.query.industry,
        stage: req.query.stage,
        location: req.query.location
      };
      const startups = await storage.getApprovedStartupsForInvestor(filters);
      res.json(startups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/connections", ensureAuthenticated, async (req, res) => {
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
    } catch (error) {
      if (error.message === "Connection already exists") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/connections", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      let connections;
      if (canActAsInvestor(profile)) {
        connections = await storage.getConnectionsByInvestor(userId);
      } else if (profile.type === "startup") {
        connections = await storage.getConnectionsByStartup(userId);
      } else {
        return res.status(403).json({ message: "Only investors and startups can view connections" });
      }
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/connections/:id", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const connectionId = req.params.id;
      const { status } = req.body;
      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Status must be 'accepted' or 'declined'" });
      }
      const connection = await storage.updateConnectionStatus(connectionId, userId, status);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/matches", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const profile = await storage.getProfileByUserId(userId);
      if (!profile || !canActAsInvestor(profile)) {
        return res.status(403).json({ message: "Investor profile required" });
      }
      const limit = parseInt(req.query.limit) || 20;
      const matches = await storage.getMatchesForInvestor(userId, limit);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  return httpServer2;
}

// server/auth.ts
var import_passport = __toESM(require("passport"), 1);
var import_passport_google_oauth20 = require("passport-google-oauth20");
var import_passport_local = require("passport-local");
var import_express_session = __toESM(require("express-session"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_connect_mongo = __toESM(require("connect-mongo"), 1);
var import_mongoose3 = __toESM(require("mongoose"), 1);
var MongoStore = import_connect_mongo.default.default || import_connect_mongo.default;
function setupAuth(app3) {
  const sessionSecret = process.env.SESSION_SECRET || "prodizzy_default_secret";
  const clientPromise = import_mongoose3.default.connection.asPromise().then((conn) => conn.getClient());
  app3.use(
    (0, import_express_session.default)({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise,
        dbName: "test",
        // Or specify the DB name if different from URI
        ttl: 14 * 24 * 60 * 60
        // 14 days
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 14 * 24 * 60 * 60 * 1e3
      }
    })
  );
  app3.use(import_passport.default.initialize());
  app3.use(import_passport.default.session());
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = process.env.APP_URL ? `${process.env.APP_URL}/api/auth/google/callback` : "/api/auth/google/callback";
    import_passport.default.use(
      new import_passport_google_oauth20.Strategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
              if (profile.emails && profile.emails.length > 0) {
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                  user.googleId = profile.id;
                  user.displayName = user.displayName || profile.displayName;
                  user.avatarUrl = user.avatarUrl || profile.photos?.[0].value;
                  await user.save();
                }
              }
              if (!user) {
                user = new User({
                  googleId: profile.id,
                  email: profile.emails?.[0].value,
                  displayName: profile.displayName,
                  avatarUrl: profile.photos?.[0].value
                });
                await user.save();
              }
            }
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth credentials missing. Google login disabled.");
  }
  import_passport.default.use(
    new import_passport_local.Strategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const isMatch = await import_bcryptjs.default.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  import_passport.default.serializeUser((user, done) => {
    done(null, user.id);
  });
  import_passport.default.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        $or: [
          { _id: import_mongoose3.default.isValidObjectId(id) ? id : new import_mongoose3.default.Types.ObjectId() },
          { googleId: id }
        ]
      }).lean();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app3.get(
    "/api/auth/google",
    import_passport.default.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account"
      // always show account chooser
    })
  );
  app3.get(
    "/api/auth/google/callback",
    import_passport.default.authenticate("google", { failureRedirect: "/login?error=google" }),
    async (req, res) => {
      try {
        if (req.user) {
          const userId = req.user._id?.toString() || req.user.id;
          const profile = await storage.getProfileByUserId(userId);
          console.log(`[Auth Google Callback] userId: ${userId}, profileFound: ${!!profile}, onboardingCompleted: ${profile?.onboarding_completed}`);
          if (profile && profile.onboarding_completed) {
            return res.redirect("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error in Google Auth callback redirect logic:", error);
      }
      res.redirect("/");
    }
  );
  app3.post("/api/auth/send-otp", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          displayName: email.split("@")[0]
        });
      }
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        await transporter.sendMail({
          from: `"Prodizzy Support" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Your Prodizzy Login Code",
          html: `
                        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto; padding: 20px; color: #333;">
                            <h2 style="color: #E63946;">Welcome to Prodizzy</h2>
                            <p>Here is your one-time verification code to sign in:</p>
                            <h1 style="font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h1>
                            <p>This code will expire in 10 minutes.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #999;">If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                    `
        });
      } else {
        console.warn("[MAIL] SMTP credentials missing. Falling back to mock email.");
        console.log(`
========================================`);
        console.log(`[MOCK EMAIL] To: ${email}`);
        console.log(`[MOCK EMAIL] OTP: ${otp}`);
        console.log(`========================================
`);
      }
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      next(error);
    }
  });
  app3.post("/api/auth/verify-otp", async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      if (!user.otpExpiresAt || /* @__PURE__ */ new Date() > user.otpExpiresAt) {
        return res.status(400).json({ message: "OTP has expired" });
      }
      user.otp = void 0;
      user.otpExpiresAt = void 0;
      await user.save();
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app3.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = { ...req.user, id: req.user._id?.toString() || req.user.id };
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app3.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });
}

// server/db.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var isConnected = false;
var connectDB = async () => {
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
    const db = await import_mongoose4.default.connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 1e4,
      connectTimeoutMS: 1e4
    });
    isConnected = db.connection.readyState === 1;
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

// server/app.ts
var import_http = require("http");
var app = (0, import_express.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express.default.urlencoded({ extended: false }));
app.set("trust proxy", 1);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
async function setupApp() {
  await connectDB();
  setupAuth(app);
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  return { app, httpServer };
}

// _api-src/index.ts
var app2;
var setupPromise = null;
async function handler(req, res) {
  if (!app2) {
    try {
      if (!setupPromise) {
        setupPromise = setupApp();
      }
      const result = await setupPromise;
      app2 = result.app;
    } catch (error) {
      setupPromise = null;
      console.error("[Vercel] Setup failed:", error.message, error.stack);
      return res.status(500).json({
        error: "Server Initialization Failed",
        details: error.message || String(error)
      });
    }
  }
  return app2(req, res);
}
