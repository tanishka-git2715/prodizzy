import mongoose, { Schema, Document } from "mongoose";

// Waitlist Model
const WaitlistSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Waitlist = mongoose.model("Waitlist", WaitlistSchema);

// Profile Schemas are more complex. Let's use a flexible approach for the shared data.

const StartupProfileSchema = new Schema({
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
    intent_fundraising: Object,
}, { strict: false });

export const StartupProfile = mongoose.model("StartupProfile", StartupProfileSchema);

const InvestorProfileSchema = new Schema({
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
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

export const InvestorProfile = mongoose.model("InvestorProfile", InvestorProfileSchema);

const PartnerProfileSchema = new Schema({
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
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

export const PartnerProfile = mongoose.model("PartnerProfile", PartnerProfileSchema);

const IndividualProfileSchema = new Schema({
    user_id: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    full_name: String,
    profile_photo: String,
    dob: String,
    location: String,
    linkedin_url: String,
    portfolio_url: String,
    resume_url: String,
    profile_type: String, // Legacy, kept for compatibility
    roles: [String], // New multi-select roles

    // Role-specific nested data
    investor_data: {
        investor_types: [String],
        investment_stages: [String],
        ticket_size: String,
        industries: [String],
        geography: String,
        specific_regions: String,
    },
    student_data: {
        institution: String,
        course: String,
        year: String,
        communities: {
            is_member: Boolean,
            links: [String],
            admin_contact: String,
        }
    },
    professional_data: {
        company: String,
        title: String,
        experience_years: String,
    },
    freelancer_data: {
        service_areas: [String],
        experience_years: String,
        notable_clients: String,
        engagement_model: String,
        budget_range: String,
    },
    consultant_data: {
        expertise_areas: [String],
        experience_level: String,
        support_types: [String],
    },
    creator_data: {
        platforms: [String],
        audience_size: String,
        niches: [String],
        profile_links: [String],
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
        website: String,
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
        preferred_budget_range: String,
    },

    founder_status: String,
    skills: [String],
    experience_level: String,
    tools_used: String,
    looking_for: [String], // Changed to array for multi-select
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
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

export const IndividualProfile = mongoose.model("IndividualProfile", IndividualProfileSchema);

// User Model for Authentication
const UserSchema = new Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    displayName: String,
    avatarUrl: String,
    role: { type: String, default: "user", enum: ["user", "admin"] },
    profileType: { type: String, enum: ["startup", "investor", "partner", "individual"] },
    availableProfiles: { type: [String], default: [] },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);

// Connection Model for Investor-Startup Matching
const ConnectionSchema = new Schema({
    startup_id: { type: Schema.Types.ObjectId, ref: 'StartupProfile', required: true },
    investor_id: { type: Schema.Types.ObjectId, ref: 'InvestorProfile', required: true },
    message: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    startup_accepted: { type: Boolean, default: false },
    investor_accepted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for performance
ConnectionSchema.index({ startup_id: 1, investor_id: 1 }, { unique: true }); // Prevent duplicates
ConnectionSchema.index({ investor_id: 1, status: 1 }); // Fast investor connection lookups
ConnectionSchema.index({ startup_id: 1, status: 1 }); // Fast startup connection lookups
ConnectionSchema.index({ created_at: -1 }); // Sort by recency

export const Connection = mongoose.model("Connection", ConnectionSchema);

// Business Model - Company profiles separate from individual profiles
const BusinessSchema = new Schema({
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
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Indexes for Business
BusinessSchema.index({ owner_user_id: 1 });
BusinessSchema.index({ approved: 1 });
BusinessSchema.index({ business_name: 'text' }); // Text search for business name

export const Business = mongoose.model("Business", BusinessSchema);

// TeamMember Model - Manages team access to business profiles
const TeamMemberSchema = new Schema({
    business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
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

// Indexes for TeamMember
TeamMemberSchema.index({ business_id: 1, user_id: 1 }, { unique: true, sparse: true }); // Prevent duplicate members
TeamMemberSchema.index({ business_id: 1 }); // Fast team member lookups
TeamMemberSchema.index({ user_id: 1 }); // Find all businesses a user belongs to
TeamMemberSchema.index({ invite_token: 1 }); // Fast invite token lookups
TeamMemberSchema.index({ email: 1 }); // Search by email

export const TeamMember = mongoose.model("TeamMember", TeamMemberSchema);

// Campaign Model - Opportunity campaigns created by businesses
const CampaignSchema = new Schema({
    business_id: { type: Schema.Types.ObjectId, ref: 'Business' },
    created_by: { type: String, required: true }, // user_id of creator
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
        enum: ["Full-time", "Part-time", "Contract", "Project-based", "Equity", "Internship", "Freelance", "Long-term", "Advisory"]
    },
    budget: String,
    deadline: String, // ISO date string
    skills: { type: [String], default: [] },
    location: String,
    attachments: { type: [String], default: [] },
    customFields: Schema.Types.Mixed, // Template-specific fields
    status: {
        type: String,
        enum: ["draft", "active", "paused", "closed"],
        default: "draft"
    },
    approved: { type: Boolean, default: false }, // Admin approval required
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Indexes for Campaign
CampaignSchema.index({ business_id: 1 }); // Fast business campaign lookups
CampaignSchema.index({ created_by: 1 }); // Find campaigns by creator
CampaignSchema.index({ status: 1 }); // Filter by status
CampaignSchema.index({ category: 1 }); // Filter by category
CampaignSchema.index({ createdAt: -1 }); // Sort by recency
CampaignSchema.index({ title: 'text', description: 'text' }); // Text search

export const Campaign = mongoose.model("Campaign", CampaignSchema);

// CampaignApplication Model - Applications/responses to campaigns
const CampaignApplicationSchema = new Schema({
    campaign_id: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    user_id: { type: String, required: true },
    message: String,
    contact_details: String, // Phone number or other contact method
    resume_url: String,
    portfolio_url: String,
    answers: Schema.Types.Mixed, // Custom question answers
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Indexes for CampaignApplication
CampaignApplicationSchema.index({ campaign_id: 1 }); // Find applications by campaign
CampaignApplicationSchema.index({ user_id: 1 }); // Find applications by user
CampaignApplicationSchema.index({ campaign_id: 1, user_id: 1 }, { unique: true }); // Prevent duplicate applications
CampaignApplicationSchema.index({ status: 1 }); // Filter by status
CampaignApplicationSchema.index({ createdAt: -1 }); // Sort by recency

export const CampaignApplication = mongoose.model("CampaignApplication", CampaignApplicationSchema);

// Performance indexes for existing models
StartupProfileSchema.index({ approved: 1 });
StartupProfileSchema.index({ 'intent_fundraising.capital_amount': 1 });
StartupProfileSchema.index({ industry: 1 });
StartupProfileSchema.index({ stage: 1 });
StartupProfileSchema.index({ location: 'text' }); // Text search for location

InvestorProfileSchema.index({ user_id: 1 });
InvestorProfileSchema.index({ sectors: 1 });
InvestorProfileSchema.index({ stages: 1 });
