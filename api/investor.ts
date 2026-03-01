import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertInvestorSchema = z.object({
  name: z.string().min(1),
  firm_name: z.string().optional(),
  investor_type: z.enum(["VC", "Angel", "Family Office", "Strategic", "Other"]),
  check_size: z.enum(["<$50k", "$50k-$250k", "$250k-$1M", "$1M-$5M", "$5M+"]),
  sectors: z.array(z.string()).min(1),
  stages: z.array(z.string()).min(1),
  geography: z.string().default(""),
  thesis: z.string().optional(),
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
      .from("investor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Profile not found" });
    return res.json(data);
  }

  if (req.method === "PUT") {
    try {
      const input = insertInvestorSchema.parse(req.body);
      const { data, error } = await supabase
        .from("investor_profiles")
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

  return res.status(405).json({ message: "Method not allowed" });
}
