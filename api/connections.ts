import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertConnectionSchema = z.object({
  startup_id: z.string().uuid(),
  message: z.string().optional(),
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

  // POST — investor expresses interest in a startup
  if (req.method === "POST") {
    // Verify the user has an investor profile
    const { data: invProfile } = await supabase
      .from("investor_profiles")
      .select("id, name, firm_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!invProfile) return res.status(403).json({ message: "Investor profile required" });

    try {
      const input = insertConnectionSchema.parse(req.body);
      const { data, error } = await supabase
        .from("connection_requests")
        .insert({ startup_id: input.startup_id, investor_id: invProfile.id, message: input.message ?? null })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") return res.status(409).json({ message: "Already expressed interest in this startup" });
        return res.status(500).json({ message: error.message });
      }
      return res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // GET — startups see incoming; investors see outgoing
  if (req.method === "GET") {
    // Check if user is a startup or investor
    const [{ data: startupProfile }, { data: invProfile }] = await Promise.all([
      supabase.from("startup_profiles").select("id").eq("user_id", user.id).maybeSingle(),
      supabase.from("investor_profiles").select("id").eq("user_id", user.id).maybeSingle(),
    ]);

    if (startupProfile) {
      // Startup: get incoming requests with investor info
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*, investor:investor_profiles(name, firm_name, investor_type, check_size)")
        .eq("startup_id", startupProfile.id)
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    }

    if (invProfile) {
      // Investor: get outgoing requests with startup info
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*, startup:startup_profiles(company_name, industry, stage)")
        .eq("investor_id", invProfile.id)
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ message: error.message });
      return res.json(data);
    }

    return res.json([]);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
