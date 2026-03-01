import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

// Strip contact vectors before sending to investors
function sanitize(profile: Record<string, unknown>) {
  const { email, name, linkedin_url, deck_link, website, ...safe } = profile;
  return { ...safe, founder_label: "Founder" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const token = req.headers.authorization?.slice(7);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data: { user } } = await authClient.auth.getUser(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const admin = isAdmin(user.email);

  // Gate: must be admin or have an investor_profile
  if (!admin) {
    const userClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: invProfile } = await userClient
      .from("investor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!invProfile) return res.status(403).json({ message: "Investor account required" });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  let query = supabase
    .from("startup_profiles")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const { industry, stage, fundraising_status, location } = req.query;
  if (industry) query = query.eq("industry", industry as string);
  if (stage) query = query.eq("stage", stage as string);
  if (fundraising_status) query = query.eq("fundraising_status", fundraising_status as string);
  if (location) query = query.ilike("location", `%${location}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });

  // Admins get full data; investors get sanitized data
  const result = admin ? data : (data ?? []).map(sanitize);
  return res.json(result);
}
