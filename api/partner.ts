import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertPartnerSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  company_name: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
  partner_type: z.enum(["Agency", "Investor", "Service Provider", "Institutional Firm"]),
  services_offered: z.array(z.string()).default([]),
  industries_served: z.array(z.string()).default([]),
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
  looking_for: z.array(z.string()).default([]),
  monthly_capacity: z.string().optional(),
  preferred_budget_range: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.slice(7);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data: { user } } = await authClient.auth.getUser(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("partner_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Profile not found" });
    return res.json(data);
  }

  if (req.method === "PUT") {
    try {
      const input = insertPartnerSchema.parse(req.body);
      const { data, error } = await supabase
        .from("partner_profiles")
        .upsert(
          { user_id: user.id, ...input, onboarding_completed: true },
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

  return res.status(405).json({ message: "Method not allowed" });
}
