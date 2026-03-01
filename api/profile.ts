import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const intentValidationSchema = z.object({
  feedback_type: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  product_link: z.string().optional(),
  specific_questions: z.string().optional(),
  timeline: z.string().optional(),
  response_count: z.string().optional(),
}).optional();

const intentHiringSchema = z.object({
  role: z.string().optional(),
  hiring_type: z.string().optional(),
  work_mode: z.string().optional(),
  budget_range: z.string().optional(),
  urgency: z.string().optional(),
  experience_level: z.string().optional(),
  key_skills: z.string().optional(),
}).optional();

const intentPartnershipsSchema = z.object({
  requirement_type: z.array(z.string()).optional(),
  partner_description: z.string().optional(),
  goals: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
}).optional();

const intentPromotionsSchema = z.object({
  promotion_type: z.array(z.string()).optional(),
  campaign_goal: z.string().optional(),
  target_audience: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  expected_outcome: z.string().optional(),
}).optional();

const intentFundraisingSchema = z.object({
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

const insertProfileSchema = z.object({
  full_name: z.string().min(1),
  role: z.string().min(1),
  company_name: z.string().min(1),
  company_description: z.string().min(1).max(130),
  industry: z.array(z.string()).min(1),
  stage: z.enum(["Idea", "Pre-Product", "Pre-Revenue", "Early Revenue", "Scaling"]),
  business_model: z.enum(["B2B", "B2C", "Marketplace", "SaaS", "D2C", "Other"]),
  target_customer: z.string().min(1),
  primary_problem: z.string().min(1),
  goals: z.array(z.string()).min(1),
  specific_ask: z.string().default(""),
  location: z.string().min(1),
  traction_range: z.string().optional(),
  revenue_status: z.string().optional(),
  fundraising_status: z.string().optional(),
  capital_use: z.array(z.string()).default([]),
  // New fields
  phone: z.string().optional(),
  website: z.string().optional(),
  product_link: z.string().optional(),
  is_registered: z.boolean().optional(),
  product_description: z.string().optional(),
  num_users: z.string().optional(),
  monthly_revenue: z.string().optional(),
  traction_highlights: z.string().optional(),
  intents: z.array(z.string()).default([]),
  // Conditional intent data
  intent_validation: intentValidationSchema,
  intent_hiring: intentHiringSchema,
  intent_partnerships: intentPartnershipsSchema,
  intent_promotions: intentPromotionsSchema,
  intent_fundraising: intentFundraisingSchema,
});

const updateProfileSchema = z.object({
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.slice(7);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  // Verify the JWT and get the user
  const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data: { user } } = await authClient.auth.getUser(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // DB client carries the user's JWT so RLS auth.uid() resolves correctly
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("startup_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Profile not found" });
    return res.json(data);
  }

  if (req.method === "PUT") {
    try {
      const input = insertProfileSchema.parse(req.body);
      const { data, error } = await supabase
        .from("startup_profiles")
        .upsert(
          { user_id: user.id, email: user.email, ...input, onboarding_completed: true },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const patch = updateProfileSchema.parse(req.body);
      const { data, error } = await supabase
        .from("startup_profiles")
        .update(patch)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
