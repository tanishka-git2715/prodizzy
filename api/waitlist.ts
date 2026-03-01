import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertWaitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Founder", "Student", "Operator", "Freelancer", "Investor", "Agency", "Other"]),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );

  try {
    const input = insertWaitlistSchema.parse(req.body);

    const { data: existing } = await supabase
      .from("waitlist_entries")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: "This email is already on the waitlist." });
    }

    const { data, error } = await supabase
      .from("waitlist_entries")
      .insert({ name: input.name, email: input.email, role: input.role })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({ ...data, createdAt: data.created_at });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join("."),
      });
    }
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
