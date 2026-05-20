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
var Waitlist = import_mongoose.default.models.Waitlist || import_mongoose.default.model("Waitlist", WaitlistSchema);
var StartupProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  company_name: { type: String, required: true },
  role: { type: String, required: true },
  full_name: { type: String, required: true },
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
var StartupProfile = import_mongoose.default.models.StartupProfile || import_mongoose.default.model("StartupProfile", StartupProfileSchema);
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
var InvestorProfile = import_mongoose.default.models.InvestorProfile || import_mongoose.default.model("InvestorProfile", InvestorProfileSchema);
var PartnerProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  company_name: String,
  role: String,
  full_name: String,
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
var PartnerProfile = import_mongoose.default.models.PartnerProfile || import_mongoose.default.model("PartnerProfile", PartnerProfileSchema);
var IndividualProfileSchema = new import_mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  full_name: String,
  profile_photo: String,
  dob: String,
  location: String,
  linkedin_url: String,
  portfolio_url: String,
  resume_url: String,
  profile_type: String,
  // Legacy, kept for compatibility
  roles: [String],
  // New multi-select roles
  // Role-specific nested data
  investor_data: {
    investor_types: [String],
    investment_stages: [String],
    ticket_size: String,
    industries: [String],
    geography: String,
    specific_regions: String
  },
  student_data: {
    institution: String,
    course: String,
    year: String,
    communities: {
      is_member: Boolean,
      links: [String],
      admin_contact: String
    }
  },
  professional_data: {
    company: String,
    title: String,
    experience_years: String
  },
  freelancer_data: {
    service_areas: [String],
    experience_years: String,
    notable_clients: String,
    engagement_model: String,
    budget_range: String
  },
  consultant_data: {
    expertise_areas: [String],
    experience_level: String,
    support_types: [String]
  },
  creator_data: {
    platforms: [String],
    audience_size: String,
    niches: [String],
    profile_links: [String]
  },
  // Consolidated data for merged profiles
  startup_data: {
    company_name: String,
    role: String,
    stage: String,
    industry: [String],
    team_size: String,
    is_registered: String,
    product_description: String,
    target_audience: String,
    num_users: String,
    monthly_revenue: String,
    traction_highlights: String,
    website: String
  },
  partner_data: {
    partner_type: String,
    services_offered: [String],
    stages_served: [String],
    pricing_model: String,
    average_deal_size: String,
    years_experience: String,
    tools_tech_stack: String,
    case_studies: String,
    past_clients: String,
    certifications: String,
    monthly_capacity: String,
    preferred_budget_range: String
  },
  founder_status: String,
  skills: [String],
  experience_level: String,
  tools_used: String,
  looking_for: [String],
  // Changed to array for multi-select
  preferred_roles: String,
  preferred_industries: String,
  availability: String,
  work_mode: String,
  expected_pay: String,
  projects: String,
  achievements: String,
  github_url: String,
  onboarding_completed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });
var IndividualProfile = import_mongoose.default.models.IndividualProfile || import_mongoose.default.model("IndividualProfile", IndividualProfileSchema);
var UserSchema = new import_mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  displayName: String,
  avatarUrl: String,
  role: { type: String, default: "user", enum: ["user", "admin"] },
  profileType: { type: String, enum: ["startup", "investor", "partner", "individual", "business"], index: true },
  availableProfiles: { type: [String], default: [] },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
var User = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);
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
var Connection = import_mongoose.default.models.Connection || import_mongoose.default.model("Connection", ConnectionSchema);
var BusinessSchema = new import_mongoose.Schema({
  owner_user_id: { type: String, required: true },
  business_name: { type: String, required: true },
  business_type: {
    type: String,
    enum: ["Startup", "Agency", "Enterprise", "Institution"],
    required: true
  },
  industry: [String],
  website: String,
  linkedin_url: String,
  logo_url: String,
  description: String,
  team_size: String,
  location: String,
  founded_year: Number,
  approved: { type: Boolean, default: false },
  onboarding_completed: { type: Boolean, default: false },
  is_personal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
BusinessSchema.index({ owner_user_id: 1 });
BusinessSchema.index({ approved: 1 });
BusinessSchema.index({ business_name: "text" });
var Business = import_mongoose.default.models.Business || import_mongoose.default.model("Business", BusinessSchema);
var TeamMemberSchema = new import_mongoose.Schema({
  business_id: { type: import_mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  user_id: String,
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member"
  },
  invited_by: String,
  invite_status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  },
  invite_token: { type: String, unique: true, sparse: true },
  invited_at: { type: Date, default: Date.now },
  accepted_at: Date,
  permissions: {
    can_create_campaigns: { type: Boolean, default: true },
    can_edit_business: { type: Boolean, default: false },
    can_invite_members: { type: Boolean, default: false },
    can_view_analytics: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});
TeamMemberSchema.index({ business_id: 1, user_id: 1 }, { unique: true, sparse: true });
TeamMemberSchema.index({ business_id: 1 });
TeamMemberSchema.index({ user_id: 1 });
TeamMemberSchema.index({ invite_token: 1 });
TeamMemberSchema.index({ email: 1 });
var TeamMember = import_mongoose.default.models.TeamMember || import_mongoose.default.model("TeamMember", TeamMemberSchema);
var CampaignSchema = new import_mongoose.Schema({
  business_id: { type: import_mongoose.Schema.Types.ObjectId, ref: "Business" },
  created_by: { type: String, ref: "User", required: true },
  // user_id of creator
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Hiring", "Freelance", "Creator", "Startup", "Testing", "Students", "Advisory", "Fundraising", "Agency", "General", "Growth", "Other"],
    required: true
  },
  templateId: String,
  targetProfiles: [String],
  engagementType: {
    type: String,
    enum: ["Internship", "Project-based", "Part-time", "Full-time", "Partnership", "Open / Flexible"]
  },
  compensation: {
    type: String,
    enum: ["Unpaid", "Paid", "Performance-based", "Equity", "Flexible"]
  },
  deadline: String,
  // ISO date string
  skills: { type: [String], default: [] },
  location: String,
  attachments: { type: [String], default: [] },
  referenceLink: String,
  customFields: import_mongoose.Schema.Types.Mixed,
  // Template-specific fields
  status: {
    type: String,
    enum: ["draft", "active", "paused", "closed"],
    default: "draft"
  },
  approved: { type: Boolean, default: false },
  // Admin approval required
  views: { type: Number, default: 0 },
  applications: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
CampaignSchema.index({ business_id: 1 });
CampaignSchema.index({ created_by: 1 });
CampaignSchema.index({ status: 1, approved: 1, createdAt: -1 });
CampaignSchema.index({ category: 1 });
CampaignSchema.index({ engagementType: 1 });
CampaignSchema.index({ createdAt: -1 });
CampaignSchema.index({ title: "text", description: "text" });
var Campaign = import_mongoose.default.models.Campaign || import_mongoose.default.model("Campaign", CampaignSchema);
var CampaignApplicationSchema = new import_mongoose.Schema({
  campaign_id: { type: import_mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  user_id: { type: String, required: true },
  message: String,
  contact_details: String,
  // Phone number or other contact method
  reference_link: String,
  resume_url: String,
  portfolio_url: String,
  answers: import_mongoose.Schema.Types.Mixed,
  // Custom question answers
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "approved"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
CampaignApplicationSchema.index({ campaign_id: 1 });
CampaignApplicationSchema.index({ user_id: 1 });
CampaignApplicationSchema.index({ campaign_id: 1, user_id: 1 }, { unique: true });
CampaignApplicationSchema.index({ status: 1 });
CampaignApplicationSchema.index({ createdAt: -1 });
var CampaignApplication = import_mongoose.default.models.CampaignApplication || import_mongoose.default.model("CampaignApplication", CampaignApplicationSchema);
StartupProfileSchema.index({ approved: 1 });
StartupProfileSchema.index({ "intent_fundraising.capital_amount": 1 });
StartupProfileSchema.index({ industry: 1 });
StartupProfileSchema.index({ stage: 1 });
StartupProfileSchema.index({ location: "text" });
InvestorProfileSchema.index({ user_id: 1 });
InvestorProfileSchema.index({ sectors: 1 });
InvestorProfileSchema.index({ stages: 1 });

// server/storage.ts
var import_crypto = __toESM(require("crypto"), 1);
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
      case "partner":
      case "individual":
        return IndividualProfile;
      case "investor":
        return InvestorProfile;
      case "business":
        return Business;
      default:
        return IndividualProfile;
    }
  }
  async getProfileByUserId(userId) {
    const user = await User.findOne({
      $or: [
        { _id: import_mongoose2.default.isValidObjectId(userId) ? userId : new import_mongoose2.default.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    if (!user) return void 0;
    const actualId = user._id.toString();
    if (user.profileType) {
      if (user.profileType === "business") {
        const ownedBusiness = await Business.findOne({
          $or: [{ owner_user_id: actualId }, { owner_user_id: user.googleId }]
        }).lean();
        if (ownedBusiness) return { ...ownedBusiness, type: "business", onboarding_completed: true };
        const membership = await TeamMember.findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }],
          invite_status: "accepted"
        }).lean();
        if (membership) {
          const memberBusiness = await Business.findById(membership.business_id).lean();
          if (memberBusiness) return { ...memberBusiness, type: "business", onboarding_completed: true, user_role: membership.role };
        }
      } else {
        const Model = this.getModelByType(user.profileType);
        const doc = await Model.findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }]
        }).lean();
        if (doc) {
          return { ...doc, type: user.profileType };
        }
      }
    }
    const models = [
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" },
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" }
    ];
    const results = await Promise.all(
      models.map(async ({ model, type }) => {
        const doc = await model.findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }]
        }).lean();
        if (doc) return { ...doc, type };
        return null;
      })
    );
    let profile = results.find((r) => r !== null);
    if (!profile) {
      const ownedBusiness = await Business.findOne({
        $or: [{ owner_user_id: actualId }, { owner_user_id: user.googleId }]
      }).lean();
      if (ownedBusiness) {
        profile = { ...ownedBusiness, type: "business", onboarding_completed: true };
      } else {
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
    if (profile && profile.onboarding_completed) {
      await User.findByIdAndUpdate(actualId, { profileType: profile.type });
    }
    return profile || void 0;
  }
  async getProfileStatus(userId) {
    const user = await User.findOne({
      $or: [
        { _id: import_mongoose2.default.isValidObjectId(userId) ? userId : new import_mongoose2.default.Types.ObjectId() },
        { googleId: userId }
      ]
    }).lean();
    if (!user) return { hasProfile: false, hasCompletedProfile: false, needsOnboarding: true };
    const actualId = user._id.toString();
    if (user.profileType) {
      if (user.profileType === "business") {
        const ownedBusiness2 = await Business.findOne({
          $or: [{ owner_user_id: actualId }, { owner_user_id: user.googleId }]
        }).lean();
        if (ownedBusiness2) return { hasProfile: true, hasCompletedProfile: true, needsOnboarding: false };
        const membership2 = await TeamMember.findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }],
          invite_status: "accepted"
        }).lean();
        if (membership2) return { hasProfile: true, hasCompletedProfile: true, needsOnboarding: false };
      } else {
        const Model = this.getModelByType(user.profileType);
        const doc = await Model.findOne({
          $or: [{ user_id: actualId }, { user_id: user.googleId }]
        }).lean();
        if (doc) {
          return {
            hasProfile: true,
            hasCompletedProfile: !!doc.onboarding_completed,
            needsOnboarding: !doc.onboarding_completed
          };
        }
      }
    }
    const models = [
      { model: StartupProfile, type: "startup" },
      { model: PartnerProfile, type: "partner" },
      { model: IndividualProfile, type: "individual" },
      { model: InvestorProfile, type: "investor" }
    ];
    for (const { model } of models) {
      const doc = await model.findOne({
        $or: [{ user_id: actualId }, { user_id: user.googleId }]
      }).lean();
      if (doc) {
        return {
          hasProfile: true,
          hasCompletedProfile: !!doc.onboarding_completed,
          needsOnboarding: !doc.onboarding_completed
        };
      }
    }
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
    const updatedAvailableProfiles = Array.from(/* @__PURE__ */ new Set([...user.availableProfiles || [], type]));
    const [doc] = await Promise.all([
      Model.findOneAndUpdate(
        { $or: [{ user_id: userId }, { user_id: user.googleId }] },
        { user_id: actualId, email, ...profile, onboarding_completed: true, type },
        { upsert: true, new: true }
      ).lean(),
      User.findByIdAndUpdate(actualId, {
        profileType: type,
        availableProfiles: updatedAvailableProfiles
      })
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
    let query = {};
    const docs = await Model.find(query, projection).sort({ createdAt: -1 }).lean();
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
  async approveAllProfiles(type) {
    const Model = this.getModelByType(type);
    const result = await Model.updateMany({ approved: { $ne: true } }, { approved: true });
    return result.modifiedCount || 0;
  }
  async purgeLegacyProfiles() {
    const startupResult = await StartupProfile.deleteMany({});
    const partnerResult = await PartnerProfile.deleteMany({});
    const individualResult = await IndividualProfile.deleteMany({});
    return {
      startups: startupResult.deletedCount || 0,
      partners: partnerResult.deletedCount || 0,
      individuals: individualResult.deletedCount || 0
    };
  }
  // ==================== Connection Methods ====================
  /** Get existing InvestorProfile or create one from PartnerProfile when partner_type is "Investor" */
  async getOrCreateInvestorProfileForUser(userId) {
    const actualId = await this.getCanonicalUserId(userId);
    let investorProfile = await InvestorProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: userId }]
    });
    if (investorProfile) return investorProfile;
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
        approved: !!indivProfile.approved
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
    }) || await IndividualProfile.findOne({
      $or: [{ user_id: actualId }, { user_id: startupUserId }],
      roles: "Founder"
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
      $or: [
        { approved: true, roles: "Founder" },
        { approved: true, type: "startup" }
        // Compatibility
      ]
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
      deck_link: 0
    };
    const [legacyStartups, newStartups] = await Promise.all([
      StartupProfile.find(query, projection).sort({ createdAt: -1 }).limit(100).lean(),
      IndividualProfile.find(query, projection).sort({ createdAt: -1 }).limit(100).lean()
    ]);
    const startups = [...legacyStartups, ...newStartups];
    return startups.map((s) => ({
      ...s,
      startup_data: s.startup_data,
      // Ensure startup_data is present for unified profiles
      id: s._id.toString(),
      founder_label: s.role || s.startup_data?.role || (s.roles?.includes("Founder") ? "Founder" : "Startup")
    }));
  }
  // ==================== Matching Methods ====================
  async getMatchesForInvestor(investorUserId, limit = 20) {
    const actualId = await this.getCanonicalUserId(investorUserId);
    const investorProfile = await this.getOrCreateInvestorProfileForUser(actualId);
    if (!investorProfile) return [];
    const [legacyStartups, newStartups] = await Promise.all([
      StartupProfile.find({ approved: true }).limit(50).lean(),
      IndividualProfile.find({ approved: true, roles: "Founder" }).limit(50).lean()
    ]);
    const startups = [...legacyStartups, ...newStartups];
    const scoredStartups = startups.map((startup) => {
      const score = this.calculateMatchScore(investorProfile, startup);
      return { startup, score };
    });
    scoredStartups.sort((a, b) => b.score - a.score);
    return scoredStartups.slice(0, limit).map(({ startup, score }) => ({
      ...startup,
      id: startup._id.toString(),
      match_score: score,
      founder_label: startup.role || startup.startup_data?.role || (startup.roles?.includes("Founder") ? "Founder" : "Startup"),
      // Anonymize
      email: void 0,
      full_name: void 0,
      linkedin_url: void 0,
      website: void 0,
      deck_link: void 0
    }));
  }
  calculateMatchScore(investor, startup) {
    let score = 0;
    const industry = startup.industry || startup.startup_data?.industry;
    if (investor.sectors && industry) {
      const investorSectors = investor.sectors;
      const startupIndustries = Array.isArray(industry) ? industry : [industry];
      const sectorMatch = investorSectors.some((s) => startupIndustries.includes(s));
      if (sectorMatch) score += 40;
    }
    const stage = startup.stage || startup.startup_data?.stage;
    if (investor.stages && stage) {
      const stageMatch = investor.stages.includes(stage);
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
      IndividualProfile.countDocuments({}),
      Business.countDocuments({})
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
    const individualCount = await IndividualProfile.countDocuments({});
    const businessCount = await Business.countDocuments({});
    const startupToInvestorRatio = investorCount > 0 ? (startupCount / investorCount).toFixed(2) : "0.00";
    const activeInvestors = await Connection.distinct("investor_user_id");
    const totalSellers = investorCount + partnerCount;
    const sellerLiquidityIndex = totalSellers > 0 ? (activeInvestors.length / totalSellers * 100).toFixed(2) : "0.00";
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
      avgConnectionsPerActiveUser: totalSellers > 0 ? (connectionMetrics.total / totalSellers).toFixed(2) : "0.00"
    };
  }
  // =============================================
  // BUSINESS METHODS
  // =============================================
  async createBusiness(userId, businessData, ownerEmail) {
    const business = new Business({
      owner_user_id: userId,
      ...businessData,
      is_personal: businessData.is_personal || false,
      approved: false,
      onboarding_completed: true
    });
    await business.save();
    const email = ownerEmail;
    await this.inviteTeamMember(
      business._id.toString(),
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
    const ownerMember = await TeamMember.findOne({
      business_id: business._id,
      email
    });
    if (ownerMember) {
      ownerMember.user_id = userId;
      ownerMember.invite_status = "accepted";
      ownerMember.accepted_at = /* @__PURE__ */ new Date();
      await ownerMember.save();
    }
    return business.toObject();
  }
  async getUserBusinesses(userId) {
    const ownedBusinesses = await Business.find({ owner_user_id: userId }).lean();
    const memberships = await TeamMember.find({
      user_id: userId,
      invite_status: "accepted"
    }).lean();
    const memberBusinessIds = memberships.map((m) => m.business_id).filter((id) => !ownedBusinesses.some((b) => b._id.toString() === id.toString()));
    const memberBusinesses = memberBusinessIds.length > 0 ? await Business.find({ _id: { $in: memberBusinessIds } }).lean() : [];
    const allBusinesses = [
      ...ownedBusinesses.map((b) => ({ ...b, user_role: "owner" })),
      ...memberBusinesses.map((b) => {
        const membership = memberships.find((m) => m.business_id.toString() === b._id.toString());
        return { ...b, user_role: membership?.role || "member" };
      })
    ];
    return allBusinesses;
  }
  async getBusinessById(businessId) {
    const business = await Business.findById(businessId).lean();
    return business || void 0;
  }
  async updateBusiness(businessId, updates) {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { ...updates, updatedAt: /* @__PURE__ */ new Date() },
      { new: true }
    );
    if (!business) throw new Error("Business not found");
    return business.toObject();
  }
  async deleteBusiness(businessId) {
    await TeamMember.deleteMany({ business_id: businessId });
    await Business.findByIdAndDelete(businessId);
  }
  // =============================================
  // TEAM MEMBER METHODS
  // =============================================
  async inviteTeamMember(businessId, email, invitedBy, role = "member", permissions) {
    const inviteToken = import_crypto.default.randomBytes(32).toString("hex");
    const existing = await TeamMember.findOne({
      business_id: businessId,
      email,
      invite_status: "pending"
    });
    if (existing) {
      throw new Error("User already invited to this business");
    }
    const existingMember = await TeamMember.findOne({
      business_id: businessId,
      email,
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
      invited_at: /* @__PURE__ */ new Date(),
      permissions: permissions || defaultPermissions
    });
    await member.save();
    return member.toObject();
  }
  async getTeamMembers(businessId) {
    const members = await TeamMember.find({ business_id: businessId }).sort({ createdAt: -1 }).lean();
    const memberIds = members.filter((m) => m.user_id).map((m) => m.user_id);
    const users = memberIds.length > 0 ? await User.find({ _id: { $in: memberIds } }).lean() : [];
    return members.map((member) => {
      const user = users.find((u) => u._id.toString() === member.user_id);
      return {
        ...member,
        user: user ? {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email
        } : void 0
      };
    });
  }
  async getTeamMemberByToken(token) {
    const member = await TeamMember.findOne({ invite_token: token }).lean();
    if (!member) return void 0;
    const business = await Business.findById(member.business_id).lean();
    return {
      ...member,
      business: business ? {
        business_name: business.business_name,
        business_type: business.business_type,
        logo_url: business.logo_url
      } : void 0
    };
  }
  async acceptInvite(token, userId) {
    const member = await TeamMember.findOne({ invite_token: token });
    if (!member) throw new Error("Invalid invite token");
    if (member.invite_status === "accepted") {
      throw new Error("Invite already accepted");
    }
    member.user_id = userId;
    member.invite_status = "accepted";
    member.accepted_at = /* @__PURE__ */ new Date();
    await member.save();
    return member.toObject();
  }
  async updateTeamMember(businessId, memberId, updates) {
    const member = await TeamMember.findOneAndUpdate(
      { _id: memberId, business_id: businessId },
      updates,
      { new: true }
    );
    if (!member) throw new Error("Team member not found");
    return member.toObject();
  }
  async removeTeamMember(businessId, memberId) {
    const result = await TeamMember.findOneAndDelete({
      _id: memberId,
      business_id: businessId
    });
    if (!result) throw new Error("Team member not found");
  }
  async getUserBusinessMemberships(userId) {
    const memberships = await TeamMember.find({
      user_id: userId,
      invite_status: "accepted"
    }).populate("business_id").lean();
    return memberships;
  }
  // =============================================
  // CAMPAIGN METHODS
  // =============================================
  async createCampaign(businessId, userId, campaignData) {
    const campaign = new Campaign({
      business_id: businessId,
      created_by: userId,
      ...campaignData
    });
    await campaign.save();
    const populated = await Campaign.findById(campaign._id).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").lean();
    return populated;
  }
  async getCampaignById(campaignId) {
    const campaign = await Campaign.findById(campaignId).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").lean();
    return this.enhanceCampaign(campaign);
  }
  async enhanceCampaign(campaign) {
    if (!campaign) return campaign;
    if (campaign.created_by && typeof campaign.created_by === "object") {
      campaign.creator = campaign.created_by;
    }
    if (campaign.business_id && typeof campaign.business_id === "object") {
      campaign.business = campaign.business_id;
    }
    const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
    if (!campaign.business_id && creatorId) {
      const profile = await IndividualProfile.findOne({
        user_id: creatorId
      }).lean();
      if (profile) {
        campaign.individual_profile = profile;
        if (campaign.creator && typeof campaign.creator === "object") {
          campaign.creator.profileId = profile._id.toString();
        }
      }
    }
    return campaign;
  }
  async enhanceCampaigns(campaigns) {
    if (!campaigns || campaigns.length === 0) return [];
    campaigns.forEach((campaign) => {
      if (campaign.created_by && typeof campaign.created_by === "object") {
        campaign.creator = campaign.created_by;
      }
      if (campaign.business_id && typeof campaign.business_id === "object") {
        campaign.business = campaign.business_id;
      }
    });
    const campaignsToPopulate = campaigns.filter((c) => !c.business_id);
    if (campaignsToPopulate.length > 0) {
      const creatorIds = [...new Set(campaignsToPopulate.map(
        (c) => c.created_by?._id?.toString() || c.created_by?.toString()
      ).filter(Boolean))];
      if (creatorIds.length > 0) {
        const profiles = await IndividualProfile.find({
          user_id: { $in: creatorIds }
        }).lean();
        const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
        campaignsToPopulate.forEach((campaign) => {
          const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
          if (creatorId && profileMap.has(creatorId)) {
            const profile = profileMap.get(creatorId);
            campaign.individual_profile = profile;
            if (campaign.creator && typeof campaign.creator === "object") {
              campaign.creator.profileId = profile._id.toString();
            }
          }
        });
      }
    }
    return campaigns;
  }
  async getCampaignsByBusiness(businessId) {
    const campaigns = await Campaign.find({ business_id: businessId }).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").sort({ createdAt: -1 }).lean();
    return this.enhanceCampaigns(campaigns);
  }
  async getActiveCampaigns(filters) {
    const query = { status: "active" };
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }
    const campaigns = await Campaign.find(query).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").sort({ createdAt: -1 }).lean();
    return this.enhanceCampaigns(campaigns);
  }
  async getPublicCampaigns(filters) {
    const query = {
      status: "active",
      approved: true
      // Only show approved campaigns publicly
    };
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.engagementType) {
      query.engagementType = filters.engagementType;
    }
    if (filters?.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }
    if (filters?.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }
    const campaigns = await Campaign.find(query).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").sort({ createdAt: -1 }).lean();
    return this.enhanceCampaigns(campaigns);
  }
  async updateCampaign(campaignId, updates) {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { ...updates, updatedAt: /* @__PURE__ */ new Date() },
      { new: true }
    ).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").lean();
    if (!campaign) throw new Error("Campaign not found");
    return this.enhanceCampaign(campaign);
  }
  async deleteCampaign(campaignId) {
    const result = await Campaign.findByIdAndDelete(campaignId);
    if (!result) throw new Error("Campaign not found");
  }
  async incrementCampaignViews(campaignId) {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { views: 1 } });
  }
  async incrementCampaignApplications(campaignId) {
    await Campaign.findByIdAndUpdate(campaignId, { $inc: { applications: 1 } });
  }
  async getCampaignStats(businessId) {
    const campaigns = await Campaign.find({ business_id: businessId }).lean();
    const approvedCampaignIds = campaigns.filter((c) => c.approved).map((c) => c._id);
    const totalAppCount = await CampaignApplication.countDocuments({
      campaign_id: { $in: approvedCampaignIds },
      status: { $in: ["accepted", "approved"] }
    });
    const stats = {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active" && c.approved).length,
      draft: campaigns.filter((c) => c.status === "draft").length,
      closed: campaigns.filter((c) => c.status === "closed").length,
      approved: campaigns.filter((c) => c.approved).length,
      pendingApproval: campaigns.filter((c) => c.status === "active" && !c.approved).length,
      totalViews: campaigns.reduce((sum, c) => sum + (Number(c.views) || 0), 0),
      totalApplications: totalAppCount
    };
    return stats;
  }
  // Individual campaign methods (for users without a business)
  async createIndividualCampaign(userId, campaignData) {
    const campaign = new Campaign({
      created_by: userId,
      business_id: void 0,
      // No business associated
      ...campaignData
    });
    await campaign.save();
    const created = await Campaign.findById(campaign._id).populate("created_by", "displayName avatarUrl email").lean();
    return this.enhanceCampaign(created);
  }
  async getCampaignsByUser(userId) {
    const campaigns = await Campaign.find({
      created_by: userId,
      business_id: { $exists: false }
      // Only individual campaigns (no business)
    }).populate("created_by", "displayName avatarUrl email").sort({ createdAt: -1 }).lean();
    return this.enhanceCampaigns(campaigns);
  }
  async getUserCampaignStats(userId) {
    const campaigns = await Campaign.find({
      created_by: userId,
      business_id: { $exists: false }
    }).lean();
    const approvedCampaignIds = campaigns.filter((c) => c.approved).map((c) => c._id);
    const totalAppCount = await CampaignApplication.countDocuments({
      campaign_id: { $in: approvedCampaignIds },
      status: { $in: ["accepted", "approved"] }
    });
    const stats = {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active" && c.approved).length,
      draft: campaigns.filter((c) => c.status === "draft").length,
      closed: campaigns.filter((c) => c.status === "closed").length,
      approved: campaigns.filter((c) => c.approved).length,
      pendingApproval: campaigns.filter((c) => c.status === "active" && !c.approved).length,
      totalViews: campaigns.reduce((sum, c) => sum + (Number(c.views) || 0), 0),
      totalApplications: totalAppCount
    };
    return stats;
  }
  async approveCampaign(campaignId, approved) {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { approved },
      { new: true }
    ).populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").lean();
    if (!campaign) throw new Error("Campaign not found");
    return this.enhanceCampaign(campaign);
  }
  async getAllCampaignsForAdmin() {
    const campaigns = await Campaign.find().populate("business_id", "business_name logo_url location industry business_type team_size website linkedin_url founded_year description").populate("created_by", "displayName avatarUrl email").sort({ createdAt: -1 }).lean();
    return this.enhanceCampaigns(campaigns);
  }
  // =============================================
  // CAMPAIGN APPLICATION METHODS
  // =============================================
  async createCampaignApplication(campaignId, userId, applicationData) {
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
    await this.incrementCampaignApplications(campaignId);
    return application.toObject();
  }
  async getCampaignApplications(campaignId, campaignApproved, isOwner = false) {
    if (!campaignApproved && !isOwner) {
      return [];
    }
    const applications = await CampaignApplication.find({
      campaign_id: campaignId
    }).sort({ createdAt: -1 }).lean();
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app3) => {
        const [user, profile] = await Promise.all([
          User.findOne({ _id: app3.user_id }).lean(),
          this.getProfileByUserId(app3.user_id)
        ]);
        return {
          ...app3,
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
  async getAllCampaignApplicationsForAdmin(campaignId) {
    const applications = await CampaignApplication.find({ campaign_id: campaignId }).sort({ createdAt: -1 }).lean();
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app3) => {
        const [user, profile] = await Promise.all([
          User.findOne({ _id: app3.user_id }).lean(),
          this.getProfileByUserId(app3.user_id)
        ]);
        return {
          ...app3,
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
  async getUserApplications(userId) {
    const applications = await CampaignApplication.find({ user_id: userId }).populate("campaign_id", "title business_id status approved").sort({ createdAt: -1 }).lean();
    return applications.map((app3) => ({
      ...app3,
      campaign: app3.campaign_id,
      campaign_id: app3.campaign_id?._id?.toString() || app3.campaign_id?.toString()
    }));
  }
  async getCampaignApplicationById(applicationId) {
    return await CampaignApplication.findById(applicationId).lean();
  }
  async updateApplicationStatus(applicationId, status) {
    const application = await CampaignApplication.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).lean();
    if (!application) throw new Error("Application not found");
    return application;
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
  website: import_zod.z.string().regex(/^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/, "Invalid website URL format").optional().or(import_zod.z.literal("")),
  linkedin_url: import_zod.z.string().regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, "Invalid LinkedIn URL format").optional().or(import_zod.z.literal("")),
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
  intent_fundraising: intentFundraisingSchema,
  profile_photo: import_zod.z.string().optional()
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
  thesis: import_zod.z.string().optional(),
  profile_photo: import_zod.z.string().optional()
});
var insertPartnerSchema = import_zod.z.object({
  company_name: import_zod.z.string().min(1, "Company name is required"),
  role: import_zod.z.string().min(1, "Your role is required"),
  full_name: import_zod.z.string().min(1, "Full name is required"),
  email: import_zod.z.string().email("Valid email required"),
  website: import_zod.z.string().optional(),
  linkedin_url: import_zod.z.string().optional(),
  partner_type: import_zod.z.string().min(1, "Partner type is required"),
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
  preferred_budget_range: import_zod.z.string().optional(),
  profile_photo: import_zod.z.string().optional()
});
var insertIndividualSchema = import_zod.z.object({
  full_name: import_zod.z.string().min(1, "Name is required"),
  email: import_zod.z.string().email("Valid email required"),
  dob: import_zod.z.string().optional(),
  location: import_zod.z.string().optional(),
  linkedin_url: import_zod.z.string().optional(),
  portfolio_url: import_zod.z.string().optional(),
  profile_photo: import_zod.z.string().optional(),
  roles: import_zod.z.array(import_zod.z.string()).default([]),
  // Conditional data
  investor_data: import_zod.z.any().optional(),
  student_data: import_zod.z.any().optional(),
  professional_data: import_zod.z.any().optional(),
  freelancer_data: import_zod.z.any().optional(),
  consultant_data: import_zod.z.any().optional(),
  creator_data: import_zod.z.any().optional(),
  // Consolidated data for merged profiles
  startup_data: import_zod.z.any().optional(),
  partner_data: import_zod.z.any().optional(),
  founder_status: import_zod.z.string().optional(),
  skills: import_zod.z.array(import_zod.z.string()).default([]),
  experience_level: import_zod.z.string().optional(),
  tools_used: import_zod.z.string().optional(),
  looking_for: import_zod.z.array(import_zod.z.string()).optional(),
  preferred_roles: import_zod.z.string().optional(),
  preferred_industries: import_zod.z.string().optional(),
  availability: import_zod.z.string().optional(),
  work_mode: import_zod.z.string().optional(),
  expected_pay: import_zod.z.string().optional(),
  resume_url: import_zod.z.string().optional(),
  projects: import_zod.z.string().optional(),
  achievements: import_zod.z.string().optional(),
  github_url: import_zod.z.string().optional()
});
var insertConnectionSchema = import_zod.z.object({
  startup_id: import_zod.z.string(),
  message: import_zod.z.string().optional()
});
var insertBusinessSchema = import_zod.z.object({
  business_name: import_zod.z.string().min(1, "Business name is required"),
  business_type: import_zod.z.string().min(1, "Business type is required"),
  industry: import_zod.z.array(import_zod.z.string()).optional(),
  website: import_zod.z.string().regex(/^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/, "Please enter a valid website (e.g., example.com)").optional().or(import_zod.z.literal("")),
  linkedin_url: import_zod.z.string().regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, "Please enter a valid LinkedIn URL").optional().or(import_zod.z.literal("")),
  logo_url: import_zod.z.string().optional().or(import_zod.z.literal("")),
  description: import_zod.z.string().optional(),
  team_size: import_zod.z.string().optional(),
  location: import_zod.z.string().optional(),
  founded_year: import_zod.z.number().int().min(1900).max((/* @__PURE__ */ new Date()).getFullYear()).optional(),
  is_personal: import_zod.z.boolean().optional().default(false)
});
var updateBusinessSchema = insertBusinessSchema.partial();
var inviteTeamMemberSchema = import_zod.z.object({
  email: import_zod.z.string().email("Valid email required"),
  role: import_zod.z.enum(["admin", "member"]).default("member"),
  permissions: import_zod.z.object({
    can_create_campaigns: import_zod.z.boolean().default(true),
    can_edit_business: import_zod.z.boolean().default(false),
    can_invite_members: import_zod.z.boolean().default(false),
    can_view_analytics: import_zod.z.boolean().default(true)
  }).optional()
});
var updateTeamMemberSchema = import_zod.z.object({
  role: import_zod.z.enum(["owner", "admin", "member"]).optional(),
  permissions: import_zod.z.object({
    can_create_campaigns: import_zod.z.boolean().optional(),
    can_edit_business: import_zod.z.boolean().optional(),
    can_invite_members: import_zod.z.boolean().optional(),
    can_view_analytics: import_zod.z.boolean().optional()
  }).optional()
});
var insertCampaignSchema = import_zod.z.object({
  title: import_zod.z.string().min(1, "Campaign title is required"),
  description: import_zod.z.string().min(1, "Campaign description is required"),
  category: import_zod.z.enum([
    "Hiring",
    "Freelance",
    "Creator",
    "Startup",
    "Testing",
    "Students",
    "Advisory",
    "Fundraising",
    "Agency",
    "General",
    "Growth",
    "Other"
  ]),
  templateId: import_zod.z.string().optional(),
  targetProfiles: import_zod.z.array(import_zod.z.string()).optional(),
  engagementType: import_zod.z.enum([
    "Internship",
    "Project-based",
    "Part-time",
    "Full-time",
    "Partnership",
    "Open / Flexible"
  ]).optional(),
  compensation: import_zod.z.enum([
    "Unpaid",
    "Paid",
    "Performance-based",
    "Equity",
    "Flexible"
  ]).optional(),
  deadline: import_zod.z.string().optional(),
  // ISO date string
  skills: import_zod.z.array(import_zod.z.string()).optional(),
  location: import_zod.z.string().optional(),
  attachments: import_zod.z.array(import_zod.z.string()).optional(),
  referenceLink: import_zod.z.string().optional(),
  customFields: import_zod.z.record(import_zod.z.any()).optional(),
  // Template-specific custom fields
  status: import_zod.z.enum(["draft", "active", "completed", "cancelled"]).default("active")
});
var updateCampaignSchema = insertCampaignSchema.partial();
var insertCampaignApplicationSchema = import_zod.z.object({
  campaign_id: import_zod.z.string(),
  message: import_zod.z.string().optional(),
  contact_details: import_zod.z.string().optional(),
  reference_link: import_zod.z.string().optional(),
  resume_url: import_zod.z.string().optional(),
  portfolio_url: import_zod.z.string().optional(),
  answers: import_zod.z.record(import_zod.z.any()).optional()
  // Custom question answers
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

// server/email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[EMAIL] SMTP credentials missing. Emails will be logged to console only.");
    return null;
  }
  return import_nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}
async function sendInviteEmail(recipientEmail, businessName, inviterName, inviteToken) {
  const transporter = createTransporter();
  const frontendUrl = process.env.APP_URL || "http://localhost:5000";
  const inviteUrl = `${frontendUrl}/invite/${inviteToken}`;
  const emailContent = {
    from: `"Prodizzy Team" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `You've been invited to join ${businessName} on Prodizzy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #000000;">
        <div style="background: #E63946; padding: 40px 30px; text-align: center;">
          <div style="width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.1); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Team Invitation</h1>
        </div>

        <div style="background: #0a0a0a; padding: 40px 30px; color: rgba(255,255,255,0.8);">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi there! \u{1F44B}</p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong style="color: #fff;">${inviterName}</strong> has invited you to join their business
            <strong style="color: #E63946;">${businessName}</strong> on Prodizzy.
          </p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            As a team member, you'll be able to create campaigns, manage collaborations,
            and help grow the business together.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteUrl}"
               style="background: #E63946;
                      color: white;
                      padding: 16px 40px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-top: 30px;">
            <p style="font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 8px 0;">Or copy and paste this link:</p>
            <a href="${inviteUrl}" style="color: #E63946; word-break: break-all; font-size: 13px;">${inviteUrl}</a>
          </div>

          <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 30px; text-align: center;">
            This invitation will expire in 7 days.
          </p>
        </div>

        <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.3); font-size: 12px; background: #000000;">
          <p style="margin: 0 0 8px 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
          <p style="margin: 0; color: rgba(255,255,255,0.5);">\u2014 The Prodizzy Team</p>
        </div>
      </div>
    `
  };
  if (!transporter) {
    console.log(`
========================================`);
    console.log(`[MOCK EMAIL - TEAM INVITE]`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Business: ${businessName}`);
    console.log(`Invited by: ${inviterName}`);
    console.log(`Invite URL: ${inviteUrl}`);
    console.log(`========================================
`);
    return;
  }
  try {
    await transporter.sendMail(emailContent);
    console.log(`[EMAIL] Team invite sent to ${recipientEmail} for business ${businessName}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send invite to ${recipientEmail}:`, error);
    throw new Error("Failed to send invitation email");
  }
}

// server/ssr.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_meta = {};
var _dirname = typeof __dirname !== "undefined" ? __dirname : (() => {
  const { fileURLToPath } = require("url");
  return import_path.default.dirname(fileURLToPath(import_meta.url));
})();
var cachedHtml = "";
function findHtmlOnFs() {
  const isDev = process.env.NODE_ENV !== "production";
  const candidates = isDev ? [import_path.default.join(process.cwd(), "client/index.html")] : [
    import_path.default.join(_dirname, "index.html"),
    // api/index.html — copied by build:vercel
    "/var/task/api/index.html",
    import_path.default.join(process.cwd(), "dist/public/index.html"),
    import_path.default.join(process.cwd(), "public/index.html"),
    import_path.default.join(process.cwd(), "index.html"),
    "/var/task/dist/public/index.html"
  ];
  for (const p of candidates) {
    if (import_fs.default.existsSync(p)) {
      console.log(`[SSR] Found index.html at: ${p}`);
      return p;
    }
  }
  return "";
}
async function getHtml(req) {
  if (cachedHtml) return cachedHtml;
  const fsPath = findHtmlOnFs();
  if (fsPath) {
    cachedHtml = import_fs.default.readFileSync(fsPath, "utf-8");
    return cachedHtml;
  }
  try {
    const protoHeader = req.headers["x-forwarded-proto"];
    const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || "https";
    const host = req.get("host") || "prodizzy.com";
    const cdnUrl = `${proto}://${host}/`;
    console.log(`[SSR] Fetching index.html from CDN: ${cdnUrl}`);
    const resp = await fetch(cdnUrl);
    if (resp.ok) {
      cachedHtml = await resp.text();
      console.log(`[SSR] Cached index.html from CDN (${cachedHtml.length} bytes)`);
      return cachedHtml;
    }
    console.error(`[SSR] CDN returned ${resp.status}`);
  } catch (e) {
    console.error("[SSR] CDN fetch failed:", e);
  }
  return "";
}
async function handleCampaignSSR(req, res, next) {
  const campaignId = req.params.id;
  console.log(`[SSR] Handling campaign: ${campaignId}`);
  try {
    const [html, campaign] = await Promise.all([
      getHtml(req),
      storage.getCampaignById(campaignId)
    ]);
    if (!html) {
      console.error("[SSR] Could not get index.html \u2014 redirecting to root");
      return res.redirect(302, "/");
    }
    if (!campaign || campaign.status === "draft") {
      console.log(`[SSR] Campaign not found or draft: ${campaignId} \u2014 serving SPA`);
      return res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
    }
    console.log(`[SSR] Injecting meta tags for: ${campaign.title}`);
    const title = campaign.title;
    const businessName = campaign.business?.business_name || campaign.individual_profile?.full_name || "Prodizzy";
    const protoHeader = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || "https";
    const host = req.get("host") || "prodizzy.com";
    const baseUrl = `${protocol}://${host}`;
    const url = `${baseUrl}/c/${campaignId}`;
    let image = campaign.business?.logo_url || campaign.individual_profile?.profile_photo || `${baseUrl}/logo.png`;
    if (image && typeof image === "string" && image.startsWith("/")) {
      image = `${baseUrl}${image}`;
    }
    const cleanDesc = (campaign.description || "").replace(/<[^>]*>/g, "").slice(0, 300);
    const detailedDescription = `Check out this opportunity:
${campaign.title}

${cleanDesc}

Apply now : ${url}`;
    let out = html.replace(/<title>[^<]*<\/title>/gi, "").replace(/<meta[^>]*name=["']description["'][^>]*>/gi, "").replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, "").replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, "");
    const metaTags = `
    <!-- Campaign SSR Metadata -->
    <title>${escapeHtml(title)} | ${escapeHtml(businessName)}</title>
    <meta name="description" content="${escapeHtml(detailedDescription)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(detailedDescription)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="Prodizzy">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(detailedDescription)}">
    <meta name="twitter:image" content="${image}">`;
    if (!out.includes('prefix="og: http://ogp.me/ns#"')) {
      out = out.replace(/<html([^>]*)>/i, '<html$1 prefix="og: http://ogp.me/ns#">');
    }
    out = out.replace(/<head\b[^>]*>/i, `$&
${metaTags}`);
    console.log(`[SSR] Sending SSR HTML for campaign ${campaignId}`);
    res.status(200).set({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }).send(out);
  } catch (error) {
    console.error("SSR Error:", error);
    next();
  }
}
function escapeHtml(text2) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text2.replace(/[&<>"']/g, (m) => map[m]);
}

// server/routes.ts
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
async function ensureBusinessOwner(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const businessId = req.params.id || req.params.businessId;
  const userId = req.user._id?.toString() || req.user.id;
  try {
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    if (business.owner_user_id !== userId) {
      return res.status(403).json({ message: "Only business owner can perform this action" });
    }
    req.business = business;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function ensureBusinessAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const businessId = req.params.id || req.params.businessId;
  const userId = req.user._id?.toString() || req.user.id;
  try {
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    if (business.owner_user_id === userId) {
      req.business = business;
      req.userRole = "owner";
      return next();
    }
    const members = await storage.getTeamMembers(businessId);
    const member = members.find((m) => m.user_id === userId);
    if (!member || member.invite_status !== "accepted") {
      return res.status(403).json({ message: "Access denied" });
    }
    const isAdmin = member.role === "admin" || member.role === "owner";
    const hasPermission = member.permissions?.can_edit_business;
    if (!isAdmin && !hasPermission) {
      return res.status(403).json({ message: "Admin access or 'Edit Business' permission required" });
    }
    req.business = business;
    req.userRole = member.role;
    req.membership = member;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function ensureBusinessMember(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const businessId = req.params.id || req.params.businessId;
  const userId = req.user._id?.toString() || req.user.id;
  try {
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    if (business.owner_user_id === userId) {
      req.business = business;
      req.userRole = "owner";
      return next();
    }
    const members = await storage.getTeamMembers(businessId);
    const member = members.find((m) => m.user_id === userId);
    if (!member || member.invite_status !== "accepted") {
      return res.status(403).json({ message: "Access denied" });
    }
    req.business = business;
    req.userRole = member.role;
    req.membership = member;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
function canActAsInvestor(profile) {
  return !!profile && (profile.type === "investor" || profile.type === "partner" && profile.partner_type === "Investor" && !!profile.approved);
}
async function registerRoutes(httpServer2, app3) {
  app3.get("/c/:id", handleCampaignSSR);
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
  app3.get("/api/public/business/:id", async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      const {
        _id,
        business_name,
        business_type,
        logo_url,
        industry,
        location,
        description,
        website,
        linkedin_url,
        team_size,
        founded_year,
        approved
      } = business;
      res.json({
        _id,
        business_name,
        business_type,
        logo_url,
        industry,
        location,
        description,
        website,
        linkedin_url,
        team_size,
        founded_year,
        approved
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      if (!id || !type) {
        return res.status(400).json({ message: "ID and type are required" });
      }
      const result = await storage.updateProfileApproval(type, id, approved);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/admin/approve-all", ensureAdmin, async (req, res) => {
    try {
      const { type } = req.body;
      if (!type) {
        return res.status(400).json({ message: "Profile type is required" });
      }
      const count = await storage.approveAllProfiles(type);
      res.json({ message: `Successfully approved ${count} profiles`, count });
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
  app3.post("/api/admin/purge-legacy", ensureAdmin, async (req, res) => {
    try {
      const result = await storage.purgeLegacyProfiles();
      res.json({ message: "Legacy profiles purged", ...result });
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
        individualCount: marketplaceHealth.individualCount,
        businessCount: marketplaceHealth.businessCount,
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
  app3.post("/api/business", ensureAuthenticated, async (req, res) => {
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
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/business", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const businesses = await storage.getUserBusinesses(userId);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/business/:id", ensureAuthenticated, ensureBusinessMember, async (req, res) => {
    try {
      res.json(req.business);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/business/:id", ensureAuthenticated, ensureBusinessAdmin, async (req, res) => {
    try {
      const businessId = req.params.id;
      const updates = updateBusinessSchema.parse(req.body);
      const business = await storage.updateBusiness(businessId, updates);
      res.json(business);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.delete("/api/business/:id", ensureAuthenticated, ensureBusinessOwner, async (req, res) => {
    try {
      const businessId = req.params.id;
      await storage.deleteBusiness(businessId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/business/:id/members", ensureAuthenticated, ensureBusinessAdmin, async (req, res) => {
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
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/business/:id/members", ensureAuthenticated, ensureBusinessMember, async (req, res) => {
    try {
      const businessId = req.params.id;
      const members = await storage.getTeamMembers(businessId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/business/:id/members/:memberId", ensureAuthenticated, ensureBusinessAdmin, async (req, res) => {
    try {
      const businessId = req.params.id;
      const memberId = req.params.memberId;
      const updates = updateTeamMemberSchema.parse(req.body);
      const member = await storage.updateTeamMember(businessId, memberId, updates);
      res.json(member);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.delete("/api/business/:id/members/:memberId", ensureAuthenticated, ensureBusinessAdmin, async (req, res) => {
    try {
      const businessId = req.params.id;
      const memberId = req.params.memberId;
      await storage.removeTeamMember(businessId, memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/invite/:token", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/invite/:token/accept", ensureAuthenticated, async (req, res) => {
    try {
      const token = req.params.token;
      const userId = req.user._id?.toString() || req.user.id;
      const member = await storage.acceptInvite(token, userId);
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/campaigns/discover", async (req, res) => {
    try {
      const filters = {
        category: req.query.category,
        engagementType: req.query.engagementType,
        location: req.query.location,
        skills: req.query.skills ? req.query.skills.split(",") : void 0
      };
      const campaigns = await storage.getPublicCampaigns(filters);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/business/:businessId/campaigns", ensureAuthenticated, async (req, res) => {
    try {
      const businessId = req.params.businessId;
      const userId = req.user._id?.toString() || req.user.id;
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      const isOwner = business.owner_user_id === userId;
      if (!isOwner) {
        const members = await storage.getTeamMembers(businessId);
        const member = members.find((m) => m.user_id === userId && m.invite_status === "accepted");
        if (!member || !member.permissions.can_create_campaigns) {
          return res.status(403).json({ message: "Permission denied: cannot create campaigns" });
        }
      }
      const input = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(businessId, userId, input);
      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/business/:businessId/campaigns", ensureAuthenticated, ensureBusinessMember, async (req, res) => {
    try {
      const businessId = req.params.businessId;
      const campaigns = await storage.getCampaignsByBusiness(businessId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/business/:businessId/campaigns/stats", ensureAuthenticated, ensureBusinessMember, async (req, res) => {
    try {
      const businessId = req.params.businessId;
      const stats = await storage.getCampaignStats(businessId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/campaigns", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const input = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createIndividualCampaign(userId, input);
      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/user/campaigns", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const campaigns = await storage.getCampaignsByUser(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/user/campaigns/stats", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const stats = await storage.getUserCampaignStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/campaigns/:id", ensureAuthenticated, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      await storage.incrementCampaignViews(campaignId);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/campaigns/:id", ensureAuthenticated, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
      const isCreator = creatorId === userId;
      let isAuthorized = isCreator;
      if (!isAuthorized && campaign.business_id) {
        const business = await storage.getBusinessById(campaign.business_id);
        if (business && business.owner_user_id === userId) {
          isAuthorized = true;
        } else if (business) {
          const members = await storage.getTeamMembers(campaign.business_id);
          const member = members.find((m) => m.user_id === userId && m.invite_status === "accepted");
          if (member && (member.permissions.can_create_campaigns || member.role === "admin" || member.role === "owner")) {
            isAuthorized = true;
          }
        }
      }
      if (!isAuthorized) {
        return res.status(403).json({ message: "Permission denied" });
      }
      const updates = updateCampaignSchema.parse(req.body);
      const updatedCampaign = await storage.updateCampaign(campaignId, updates);
      res.json(updatedCampaign);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.delete("/api/campaigns/:id", ensureAuthenticated, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
      const isCreator = creatorId === userId;
      let isOwner = false;
      if (campaign.business_id) {
        const business = await storage.getBusinessById(campaign.business_id);
        if (business) isOwner = business.owner_user_id === userId;
      }
      if (!isOwner && !isCreator) {
        return res.status(403).json({ message: "Permission denied" });
      }
      await storage.deleteCampaign(campaignId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/campaigns", ensureAuthenticated, async (req, res) => {
    try {
      const filters = {
        category: req.query.category,
        skills: req.query.skills ? req.query.skills.split(",") : void 0
      };
      const campaigns = await storage.getActiveCampaigns(filters);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/campaigns/:id/public", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      if (campaign.status !== "active") {
        return res.status(404).json({ message: "Campaign not available" });
      }
      await storage.incrementCampaignViews(campaignId);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/campaigns/:id/apply", ensureAuthenticated, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;
      const input = insertCampaignApplicationSchema.parse(req.body);
      const application = await storage.createCampaignApplication(campaignId, userId, input);
      res.status(201).json(application);
    } catch (err) {
      if (err instanceof import_zod3.z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      if (err.message === "You have already applied to this campaign") {
        return res.status(409).json({ message: err.message });
      }
      res.status(500).json({ message: err.message });
    }
  });
  app3.get("/api/campaigns/:id/applications", ensureAuthenticated, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user._id?.toString() || req.user.id;
      const campaign = await storage.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
      const isCreator = creatorId === userId;
      let isAuthorized = isCreator;
      if (!isAuthorized && campaign.business_id) {
        try {
          const business = await storage.getBusinessById(campaign.business_id);
          if (business.owner_user_id === userId) {
            isAuthorized = true;
          } else {
            const members = await storage.getTeamMembers(campaign.business_id);
            const member = members.find((m) => m.user_id === userId && m.invite_status === "accepted");
            if (member) isAuthorized = true;
          }
        } catch (_) {
        }
      }
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      const applications = await storage.getCampaignApplications(campaignId, campaign.approved, isAuthorized);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/my-applications", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user._id?.toString() || req.user.id;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/applications/:id/status", ensureAuthenticated, async (req, res) => {
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
      const campaign = await storage.getCampaignById(application.campaign_id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      const creatorId = campaign.created_by?._id?.toString() || campaign.created_by?.toString();
      const isCreator = creatorId === userId;
      let isOwner = false;
      let isMember = false;
      if (campaign.business_id) {
        const business = await storage.getBusinessById(campaign.business_id);
        if (business) {
          isOwner = business.owner_user_id === userId;
          if (!isOwner) {
            const members = await storage.getTeamMembers(campaign.business_id);
            const member = members.find((m) => m.user_id === userId && m.invite_status === "accepted");
            if (member) isMember = true;
          }
        }
      }
      if (!isCreator && !isOwner && !isMember && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updated = await storage.updateApplicationStatus(applicationId, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/campaigns", ensureAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaignsForAdmin();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/admin/campaigns/:id/approve", ensureAdmin, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const { approved } = req.body;
      const campaign = await storage.approveCampaign(campaignId, approved);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.get("/api/admin/campaigns/:id/applications", ensureAdmin, async (req, res) => {
    try {
      const campaignId = req.params.id;
      const applications = await storage.getAllCampaignApplicationsForAdmin(campaignId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/admin/applications/:id/status", ensureAdmin, async (req, res) => {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
      if (!["accepted", "approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const application = await storage.updateApplicationStatus(applicationId, status);
      res.json(application);
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
  app3.use(
    (0, import_express_session.default)({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        dbName: "prodizzy",
        // Specify the DB name
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
  const hasGoogleAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  if (hasGoogleAuth) {
    let callbackURL = "/api/auth/google/callback";
    if (process.env.APP_URL) {
      callbackURL = `${process.env.APP_URL}/api/auth/google/callback`;
    } else if (process.env.VERCEL_URL) {
      callbackURL = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
    }
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
      if (import_mongoose3.default.isValidObjectId(id)) {
        const user2 = await User.findById(id).lean();
        if (user2) return done(null, user2);
      }
      const user = await User.findOne({ googleId: id }).lean();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  if (hasGoogleAuth) {
    app3.get(
      "/api/auth/google",
      import_passport.default.authenticate("google", {
        scope: ["profile", "email"]
        // removed prompt: "select_account" to allow seamless login for returning users
      })
    );
    app3.get(
      "/api/auth/google/callback",
      import_passport.default.authenticate("google", { failureRedirect: "/login?error=google" }),
      async (req, res) => {
        try {
          if (req.user) {
            const user = req.user;
            const userId = user._id?.toString() || user.id;
            if (user.profileType === "admin") {
              return res.redirect("/admin");
            }
            if (user.profileType && user.profileType !== "none") {
              return res.redirect("/dashboard");
            }
            const profile = await storage.getProfileByUserId(userId);
            console.log(`[Auth Google Callback] userId: ${userId}, profileFound: ${!!profile}, onboardingCompleted: ${profile?.onboarding_completed}`);
            if (profile && profile.onboarding_completed) {
              return res.redirect("/dashboard");
            }
            if (user.role === "admin") {
              return res.redirect("/admin");
            }
          }
        } catch (error) {
          console.error("Error in Google Auth callback redirect logic:", error);
        }
        res.redirect("/individual-onboard");
      }
    );
  } else {
    app3.get("/api/auth/google", (_req, res) => {
      res.status(501).json({
        message: "Google Authentication is not configured on this server.",
        details: "Please verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in environment variables."
      });
    });
  }
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
        const nodemailer2 = await import("nodemailer");
        const transporter = nodemailer2.createTransport({
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
      req.login(user, async (err) => {
        if (err) return next(err);
        const userId = user._id?.toString() || user.id;
        const profileStatus = await storage.getProfileStatus(userId);
        res.json({
          ...user.toObject ? user.toObject() : user,
          id: userId,
          profileStatus
        });
      });
    } catch (error) {
      next(error);
    }
  });
  app3.get("/api/auth/me", async (req, res) => {
    if (req.isAuthenticated()) {
      const userId = req.user._id?.toString() || req.user.id;
      const profileStatus = await storage.getProfileStatus(userId);
      const user = {
        ...req.user,
        id: userId,
        profileStatus
      };
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
    limit: "100mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express.default.urlencoded({ limit: "100mb", extended: false }));
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
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (req.method !== "GET" && capturedJsonResponse && res.statusCode < 400) {
        const bodyStr = JSON.stringify(capturedJsonResponse);
        if (bodyStr.length < 1e3) {
          logLine += ` :: ${bodyStr}`;
        } else {
          logLine += ` :: [Large Body: ${bodyStr.length} bytes]`;
        }
      } else if (res.statusCode >= 400 && capturedJsonResponse) {
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
