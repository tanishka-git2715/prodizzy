
import { supabase } from "./db";
import type { InsertWaitlistEntry, WaitlistResponse, InsertProfile, UpdateProfile, StartupProfile } from "@shared/schema";

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined>;
  getProfileByUserId(userId: string): Promise<StartupProfile | undefined>;
  upsertProfile(userId: string, email: string, profile: InsertProfile): Promise<StartupProfile>;
  patchProfile(userId: string, patch: UpdateProfile): Promise<StartupProfile>;
}

export class DatabaseStorage implements IStorage {
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse> {
    const { data, error } = await supabase
      .from("waitlist_entries")
      .insert({ name: entry.name, email: entry.email, role: entry.role })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, createdAt: data.created_at } as WaitlistResponse;
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined> {
    const { data, error } = await supabase
      .from("waitlist_entries")
      .select()
      .eq("email", email)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return { ...data, createdAt: data.created_at } as WaitlistResponse;
  }

  async getProfileByUserId(userId: string): Promise<StartupProfile | undefined> {
    const { data, error } = await supabase
      .from("startup_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return data as StartupProfile;
  }

  async upsertProfile(userId: string, email: string, profile: InsertProfile): Promise<StartupProfile> {
    const { data, error } = await supabase
      .from("startup_profiles")
      .upsert(
        { user_id: userId, email, ...profile, onboarding_completed: true },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as StartupProfile;
  }

  async patchProfile(userId: string, patch: UpdateProfile): Promise<StartupProfile> {
    const { data, error } = await supabase
      .from("startup_profiles")
      .update(patch)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as StartupProfile;
  }
}

export const storage = new DatabaseStorage();
