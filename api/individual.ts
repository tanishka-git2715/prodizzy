import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertIndividualSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  profile_type: z.enum(["Student", "Freelancer", "Professional", "Content Creator", "Community Admin"]),
  skills: z.array(z.string()).default([]),
  experience_level: z.string().optional(),
  tools_used: z.string().optional(),
  looking_for: z.array(z.string()).default([]),
  preferred_roles: z.string().optional(),
  preferred_industries: z.string().optional(),
  availability: z.string().optional(),
  work_mode: z.string().optional(),
  expected_pay: z.string().optional(),
  location: z.string().optional(),
  resume_url: z.string().optional(),
  projects: z.string().optional(),
  achievements: z.string().optional(),
  github_url: z.string().optional(),
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
      .from("individual_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Profile not found" });
    return res.json(data);
  }

  if (req.method === "PUT") {
    try {
      const input = insertIndividualSchema.parse(req.body);
      const { data, error } = await supabase
        .from("individual_profiles")
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
