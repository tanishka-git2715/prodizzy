
import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === WAITLIST ===
export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlistEntries).omit({
  id: true,
  createdAt: true
}).extend({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Founder", "Student", "Operator", "Freelancer", "Investor", "Agency", "Other"]),
});

export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;
export type CreateWaitlistRequest = InsertWaitlistEntry;
export type WaitlistResponse = WaitlistEntry;

// =============================================
// STARTUP PROFILE
// =============================================

// Intent-specific conditional schemas
export const intentValidationSchema = z.object({
  feedback_type: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  product_link: z.string().optional(),
  specific_questions: z.string().optional(),
  timeline: z.string().optional(),
  response_count: z.string().optional(),
}).optional();

export const intentHiringSchema = z.object({
  role: z.string().optional(),
  hiring_type: z.string().optional(),
  work_mode: z.string().optional(),
  budget_range: z.string().optional(),
  urgency: z.string().optional(),
  experience_level: z.string().optional(),
  key_skills: z.string().optional(),
}).optional();

export const intentPartnershipsSchema = z.object({
  requirement_type: z.array(z.string()).optional(),
  partner_description: z.string().optional(),
  goals: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
}).optional();

export const intentPromotionsSchema = z.object({
  promotion_type: z.array(z.string()).optional(),
  campaign_goal: z.string().optional(),
  target_audience: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  expected_outcome: z.string().optional(),
}).optional();

export const intentFundraisingSchema = z.object({
  capital_amount: z.string().optional(),
  fund_use: z.string().optional(),
  funding_type: z.string().optional(),
  annual_revenue: z.string().optional(),
  existing_loans: z.string().optional(),
  pitch_deck_link: z.string().optional(),
  investors_approached: z.string().optional(),
  investor_feedback: z.string().optional(),
  compliance_status: z.string().optional(),
  gst_filing_status: z.string().optional(),
  past_defaults: z.string().optional(),
  fundraising_reason: z.string().optional(),
  investor_types_sought: z.string().optional(),
  ticket_size: z.string().optional(),
  ready_for_engagement: z.string().optional(),
}).optional();

export const insertProfileSchema = z.object({
  // Section 1: Basic Details
  company_name: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Your role is required"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required").optional(), // Often handled by auth but good to have
  website: z.string().regex(/^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/, "Invalid website URL format").optional().or(z.literal("")),
  linkedin_url: z.string().regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, "Invalid LinkedIn URL format").optional().or(z.literal("")),

  // Section 2: Startup Profile
  stage: z.enum([
    "Pre-Seed (Ideation Stage)",
    "Seed (MVP & Early traction)",
    "Series A (Generating Revenue)",
    "Series B/C/D (Expansion & Scaling)",
    "MNC (Global)"
  ]),
  industry: z.array(z.string()).min(1, "Select at least one industry"),
  team_size: z.enum(["Solo", "2–10", "11–50", "51–500", "500–1000", "1000+"]),
  location: z.string().min(1, "Location is required"),
  is_registered: z.enum(["Yes", "No"]),

  // Section 3: Product & Traction
  product_description: z.string().min(1, "Product description is required"),
  problem_solved: z.string().optional(),
  target_audience: z.string().min(1, "Target audience is required"),
  num_users: z.string().optional(),
  monthly_revenue: z.string().optional(),
  traction_highlights: z.string().optional(),

  // Internal/System fields
  intents: z.array(z.string()).default([]),
  // Keep these for backward compatibility/internal use if needed
  company_description: z.string().optional(),
  business_model: z.string().optional(),
  target_customer: z.string().optional(),
  primary_problem: z.string().optional(),
  goals: z.array(z.string()).default([]),
  specific_ask: z.string().default(""),
  traction_range: z.string().optional(),
  revenue_status: z.string().optional(),
  fundraising_status: z.string().optional(),
  capital_use: z.array(z.string()).default([]),

  // Conditional intent data
  intent_validation: intentValidationSchema,
  intent_hiring: intentHiringSchema,
  intent_partnerships: intentPartnershipsSchema,
  intent_promotions: intentPromotionsSchema,
  intent_fundraising: intentFundraisingSchema,
  profile_photo: z.string().optional(),
});

export const updateProfileSchema = z.object({
  team_size: z.string().optional(),
  missing_roles: z.array(z.string()).optional(),
  hiring_urgency: z.string().optional(),
  partnership_why: z.array(z.string()).optional(),
  ideal_partner_type: z.string().optional(),
  partnership_maturity: z.string().optional(),
  round_type: z.string().optional(),
  investor_warmth: z.array(z.string()).optional(),
  geography: z.string().optional(),
  speed_preference: z.string().optional(),
  risk_appetite: z.string().optional(),
  existing_backers: z.string().optional(),
  notable_customers: z.string().optional(),
  deck_link: z.string().optional(),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
}).partial();

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type StartupProfile = InsertProfile & {
  id: string;
  user_id: string;
  email: string;
  approved: boolean;
  onboarding_completed: boolean;
  created_at: string;
  // Compatibility fields that might not be in InsertProfile
  missing_roles?: string[] | null;
  hiring_urgency?: string | null;
  partnership_why?: string[] | null;
  ideal_partner_type?: string | null;
  partnership_maturity?: string | null;
  round_type?: string | null;
  investor_warmth?: string[] | null;
  geography?: string | null;
  speed_preference?: string | null;
  risk_appetite?: string | null;
  existing_backers?: string | null;
  notable_customers?: string | null;
  deck_link?: string | null;
};

// Sanitized version shown to investors (no contact vectors)
export type PublicStartupProfile = Omit<StartupProfile, "email" | "name" | "linkedin_url" | "deck_link" | "website"> & {
  founder_label: string;
};

// =============================================
// INVESTOR PROFILE
// =============================================

export const insertInvestorSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  firm_name: z.string().optional(),
  investor_type: z.enum(["VC", "Angel", "Family Office", "Strategic", "Other"]),
  check_size: z.enum(["<$50k", "$50k-$250k", "$250k-$1M", "$1M-$5M", "$5M+"]),
  sectors: z.array(z.string()).min(1, "Select at least one sector"),
  stages: z.array(z.string()).min(1, "Select at least one stage"),
  geography: z.string().default(""),
  thesis: z.string().optional(),
  profile_photo: z.string().optional(),
});

export type InsertInvestor = z.infer<typeof insertInvestorSchema>;

export type InvestorProfile = InsertInvestor & {
  id: string;
  user_id: string;
  email: string;
  approved: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

// =============================================
// PARTNER PROFILE
// =============================================

export const insertPartnerSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Your role is required"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
  partner_type: z.string().min(1, "Partner type is required"),
  services_offered: z.array(z.string()).default([]),
  stages_served: z.array(z.string()).default([]),
  pricing_model: z.string().optional(),
  average_deal_size: z.string().optional(),
  team_size: z.string().optional(),
  years_experience: z.string().optional(),
  tools_tech_stack: z.string().optional(),
  work_mode: z.string().optional(),
  portfolio_links: z.string().optional(),
  case_studies: z.string().optional(),
  past_clients: z.string().optional(),
  certifications: z.string().optional(),
  looking_for: z.string().optional(),
  monthly_capacity: z.string().optional(),
  preferred_budget_range: z.string().optional(),
  profile_photo: z.string().optional(),
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export type PartnerProfile = InsertPartner & {
  id: string;
  user_id: string;
  approved: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

// =============================================
// INDIVIDUAL PROFILE
// =============================================

export const insertIndividualSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  dob: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  profile_photo: z.string().optional(),
  roles: z.array(z.string()).default([]),

  // Conditional data
  investor_data: z.any().optional(),
  student_data: z.any().optional(),
  professional_data: z.any().optional(),
  freelancer_data: z.any().optional(),
  consultant_data: z.any().optional(),
  creator_data: z.any().optional(),

  // Consolidated data for merged profiles
  startup_data: z.any().optional(),
  partner_data: z.any().optional(),

  founder_status: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience_level: z.string().optional(),
  tools_used: z.string().optional(),
  looking_for: z.array(z.string()).optional(),
  preferred_roles: z.string().optional(),
  preferred_industries: z.string().optional(),
  availability: z.string().optional(),
  work_mode: z.string().optional(),
  expected_pay: z.string().optional(),
  resume_url: z.string().optional(),
  projects: z.string().optional(),
  achievements: z.string().optional(),
  github_url: z.string().optional(),
});

export type InsertIndividual = z.infer<typeof insertIndividualSchema>;

export type IndividualProfile = InsertIndividual & {
  id: string;
  user_id: string;
  approved: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

// =============================================
// CONNECTION REQUESTS
// =============================================

export const insertConnectionSchema = z.object({
  startup_id: z.string(),
  message: z.string().optional(),
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type ConnectionRequest = {
  id: string;
  startup_id: string;
  investor_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  startup_accepted: boolean;
  investor_accepted: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  investor?: {
    full_name?: string;
    firm_name?: string;
    investor_type?: string;
    check_size?: string;
    email?: string; // Only when accepted
  };
  startup?: {
    company_name?: string;
    industry?: string | string[];
    stage?: string;
    email?: string; // Only when accepted
    full_name?: string; // Only when accepted
    linkedin_url?: string; // Only when accepted
    website?: string; // Only when accepted
  };
};

// Matched startup type with scoring
export type MatchedStartup = PublicStartupProfile & {
  match_score: number;
};

// =============================================
// BUSINESS PROFILE
// =============================================

export const insertBusinessSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_type: z.string().min(1, "Business type is required"),
  industry: z.array(z.string()).optional(),
  website: z.string().regex(/^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/, "Please enter a valid website (e.g., example.com)").optional().or(z.literal("")),
  linkedin_url: z.string().regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, "Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  logo_url: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  team_size: z.string().optional(),
  location: z.string().optional(),
  founded_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  is_personal: z.boolean().optional().default(false),
});

export const updateBusinessSchema = insertBusinessSchema.partial();

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type UpdateBusiness = z.infer<typeof updateBusinessSchema>;

export type Business = {
  _id: string;
  owner_user_id: string;
  business_name: string;
  business_type: "Startup" | "Agency" | "Enterprise" | "Institution";
  industry?: string[];
  website?: string;
  linkedin_url?: string;
  logo_url?: string;
  description?: string;
  team_size?: string;
  location?: string;
  founded_year?: number;
  approved: boolean;
  onboarding_completed: boolean;
  is_personal: boolean;
  createdAt: string;
  updatedAt: string;
};

// =============================================
// TEAM MEMBER
// =============================================

export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "member"]).default("member"),
  permissions: z.object({
    can_create_campaigns: z.boolean().default(true),
    can_edit_business: z.boolean().default(false),
    can_invite_members: z.boolean().default(false),
    can_view_analytics: z.boolean().default(true),
  }).optional(),
});

export const updateTeamMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member"]).optional(),
  permissions: z.object({
    can_create_campaigns: z.boolean().optional(),
    can_edit_business: z.boolean().optional(),
    can_invite_members: z.boolean().optional(),
    can_view_analytics: z.boolean().optional(),
  }).optional(),
});

export type InviteTeamMember = z.infer<typeof inviteTeamMemberSchema>;
export type UpdateTeamMember = z.infer<typeof updateTeamMemberSchema>;

export type TeamMember = {
  _id: string;
  business_id: string;
  user_id?: string;
  email: string;
  role: "owner" | "admin" | "member";
  invited_by: string;
  invite_status: "pending" | "accepted" | "declined";
  invite_token?: string;
  invited_at: string;
  accepted_at?: string;
  permissions: {
    can_create_campaigns: boolean;
    can_edit_business: boolean;
    can_invite_members: boolean;
    can_view_analytics: boolean;
  };
  createdAt: string;
  // Populated fields when joined with User
  user?: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  };
};

// =============================================
// CAMPAIGN
// =============================================

export const insertCampaignSchema = z.object({
  title: z.string().min(1, "Campaign title is required"),
  description: z.string().min(1, "Campaign description is required"),
  category: z.enum([
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
  templateId: z.string().optional(),
  targetProfiles: z.array(z.string()).optional(),
  engagementType: z.enum([
    "Internship",
    "Project-based",
    "Part-time",
    "Full-time",
    "Partnership",
    "Open / Flexible"
  ]).optional(),
  compensation: z.enum([
    "Unpaid",
    "Paid",
    "Performance-based",
    "Equity",
    "Flexible"
  ]).optional(),
  deadline: z.string().optional(), // ISO date string
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  referenceLink: z.string().optional(),
  customFields: z.record(z.any()).optional(), // Template-specific custom fields
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("active"),
});

export const updateCampaignSchema = insertCampaignSchema.partial();

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;

export type Campaign = {
  _id: string;
  business_id?: string; // Optional - for business campaigns only
  created_by: string; // user_id of creator
  title: string;
  description: string;
  category: string;
  templateId?: string;
  targetProfiles?: string[];
  engagementType?: string;
  compensation?: string;
  deadline?: string;
  skills: string[];
  location?: string;
  attachments: string[];
  customFields?: Record<string, any>;
  status: "draft" | "active" | "paused" | "closed";
  approved: boolean; // Admin approval required
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  business?: {
    _id: string;
    business_name: string;
    logo_url?: string;
    location?: string;
    industry?: string[];
    business_type?: string;
    team_size?: string;
    website?: string;
    linkedin_url?: string;
    founded_year?: number;
    description?: string;
  };
  creator?: {
    _id: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    profileId?: string;
  };
  individual_profile?: IndividualProfile;
};

// =============================================
// CAMPAIGN APPLICATION
// =============================================

export const insertCampaignApplicationSchema = z.object({
  campaign_id: z.string(),
  message: z.string().optional(),
  contact_details: z.string().optional(),
  resume_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  answers: z.record(z.any()).optional(), // Custom question answers
});

export type InsertCampaignApplication = z.infer<typeof insertCampaignApplicationSchema>;

export type CampaignApplication = {
  _id: string;
  campaign_id: string;
  user_id: string;
  message?: string;
  contact_details?: string;
  resume_url?: string;
  portfolio_url?: string;
  answers?: Record<string, any>;
  status: "pending" | "accepted" | "rejected" | "approved";
  createdAt: string;
  updatedAt: string;
  // Populated fields
  user?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
  campaign?: {
    _id: string;
    title: string;
    business_id: string;
  };
  profile?: any;
};
