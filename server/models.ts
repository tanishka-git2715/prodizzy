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

// Performance indexes for existing models
StartupProfileSchema.index({ approved: 1 });
StartupProfileSchema.index({ 'intent_fundraising.capital_amount': 1 });
StartupProfileSchema.index({ industry: 1 });
StartupProfileSchema.index({ stage: 1 });
StartupProfileSchema.index({ location: 'text' }); // Text search for location

InvestorProfileSchema.index({ user_id: 1 });
InvestorProfileSchema.index({ sectors: 1 });
InvestorProfileSchema.index({ stages: 1 });
