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
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

export const PartnerProfile = mongoose.model("PartnerProfile", PartnerProfileSchema);

const IndividualProfileSchema = new Schema({
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
    createdAt: { type: Date, default: Date.now },
}, { strict: false });

export const IndividualProfile = mongoose.model("IndividualProfile", IndividualProfileSchema);

// User Model for Authentication
const UserSchema = new Schema({
    googleId: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    displayName: String,
    avatarUrl: String,
    role: { type: String, default: "user", enum: ["user", "admin"] },
    profileType: { type: String, enum: ["startup", "investor", "partner", "individual"] },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);

// Intent Model for Intent-Based Matchmaking
const IntentSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    profile_type: { type: String, enum: ['startup', 'partner', 'individual'], required: true },
    intent_type: {
        type: String,
        enum: ['validation', 'hiring', 'partnerships', 'promotions', 'fundraising', 'clients', 'dealflow', 'jobs', 'freelance', 'internship', 'collaboration'],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'fulfilled', 'closed'],
        default: 'open'
    },
    metadata: Schema.Types.Mixed, // Intent-specific data
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Indexes for Intent model
IntentSchema.index({ user_id: 1, status: 1 }); // Fast user intent lookups
IntentSchema.index({ profile_type: 1, intent_type: 1 }); // Fast type-based queries
IntentSchema.index({ status: 1 }); // Fast status filtering
IntentSchema.index({ createdAt: -1 }); // Sort by recency

export const Intent = mongoose.model("Intent", IntentSchema);

// Connection Model - Generic for all profile types (Intent-based matching)
const ConnectionSchema = new Schema({
    // Generic fields for intent-based connections
    from_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    from_profile_type: {
        type: String,
        enum: ['startup', 'partner', 'individual', 'investor'],
        required: true
    },
    to_profile_type: {
        type: String,
        enum: ['startup', 'partner', 'individual', 'investor'],
        required: true
    },

    // Legacy fields for backward compatibility (optional)
    startup_id: { type: Schema.Types.ObjectId, ref: 'StartupProfile' },
    investor_id: { type: Schema.Types.ObjectId, ref: 'InvestorProfile' },

    message: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    from_accepted: { type: Boolean, default: false },
    to_accepted: { type: Boolean, default: false },

    // Legacy acceptance fields
    startup_accepted: { type: Boolean, default: false },
    investor_accepted: { type: Boolean, default: false },

    intent_id: { type: Schema.Types.ObjectId, ref: 'Intent' }, // Track which intent triggered this connection
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for performance
ConnectionSchema.index({ from_user_id: 1, to_user_id: 1 }, { unique: true }); // Prevent duplicates
ConnectionSchema.index({ from_user_id: 1, status: 1 }); // Fast sender connection lookups
ConnectionSchema.index({ to_user_id: 1, status: 1 }); // Fast receiver connection lookups
ConnectionSchema.index({ intent_id: 1 }); // Fast intent-based lookups
ConnectionSchema.index({ created_at: -1 }); // Sort by recency

// Legacy indexes for backward compatibility
ConnectionSchema.index({ startup_id: 1, investor_id: 1 });
ConnectionSchema.index({ investor_id: 1, status: 1 });
ConnectionSchema.index({ startup_id: 1, status: 1 });

export const Connection = mongoose.model("Connection", ConnectionSchema);

// Performance indexes for existing models
StartupProfileSchema.index({ approved: 1 });
StartupProfileSchema.index({ 'intent_fundraising.capital_amount': 1 });
StartupProfileSchema.index({ industry: 1 });
StartupProfileSchema.index({ stage: 1 });
StartupProfileSchema.index({ location: 'text' }); // Text search for location

InvestorProfileSchema.index({ user_id: 1 });
InvestorProfileSchema.index({ sectors: 1 });
InvestorProfileSchema.index({ stages: 1 });
