import { Waitlist, StartupProfile, InvestorProfile, PartnerProfile, IndividualProfile, User } from "./models";
import type {
  InsertWaitlistEntry,
  WaitlistResponse,
  InsertProfile,
  UpdateProfile,
  StartupProfile as StartupProfileType
} from "@shared/schema";

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined>;

  // Generic Profile Methods
  getProfileByUserId(userId: string): Promise<any | undefined>;
  upsertProfile(userId: string, email: string, profile: any, type: string): Promise<any>;
  patchProfile(userId: string, patch: any): Promise<any>;

  // Admin Methods
  getAllProfiles(type: string): Promise<any[]>;
  updateProfileApproval(type: string, userIdOrId: string, approved: boolean): Promise<any>;
  getAllUsers(): Promise<any[]>;
  getAllWaitlistEntries(): Promise<any[]>;
  getUserByGoogleId(googleId: string): Promise<any | undefined>;
  deleteProfile(type: string, id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistResponse> {
    const doc = new Waitlist({ name: entry.name, email: entry.email, role: entry.role });
    await doc.save();
    return doc.toObject() as unknown as WaitlistResponse;
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistResponse | undefined> {
    const doc = await Waitlist.findOne({ email });
    if (!doc) return undefined;
    return doc.toObject() as unknown as WaitlistResponse;
  }

  private getModelByType(type: string) {
    switch (type) {
      case "startup": return StartupProfile;
      case "investor": return InvestorProfile;
      case "partner": return PartnerProfile;
      case "individual": return IndividualProfile;
      default: return StartupProfile;
    }
  }

  async getProfileByUserId(userId: string): Promise<any | undefined> {
    // Check all models to find where the user has a profile
    const models = [StartupProfile, InvestorProfile, PartnerProfile, IndividualProfile];
    for (const Model of models) {
      // Use projection to exclude large intent objects if not needed, 
      // but for now let's just ensure we use .lean() for speed
      const doc = await (Model as any).findOne({ user_id: userId }).lean();
      if (doc) {
        const obj = { ...doc };
        obj.type = Model.modelName.replace("Profile", "").toLowerCase();
        return obj;
      }
    }
    return undefined;
  }

  async upsertProfile(userId: string, email: string, profile: any, type: string): Promise<any> {
    const Model = this.getModelByType(type);
    const doc = await (Model as any).findOneAndUpdate(
      { user_id: userId },
      { user_id: userId, email, ...profile, onboarding_completed: true },
      { upsert: true, new: true }
    ).lean();
    return doc;
  }

  async patchProfile(userId: string, patch: any): Promise<any> {
    // Find which profile the user has first
    const profile = await this.getProfileByUserId(userId);
    if (!profile) throw new Error("Profile not found");

    const Model = this.getModelByType(profile.type);
    const doc = await (Model as any).findOneAndUpdate(
      { user_id: userId },
      { $set: patch },
      { new: true }
    ).lean();
    return doc;
  }

  async getAllProfiles(type: string): Promise<any[]> {
    const Model = this.getModelByType(type);
    // Exclude large intent fields for list views
    const projection = {
      intent_validation: 0,
      intent_hiring: 0,
      intent_partnerships: 0,
      intent_promotions: 0,
      intent_fundraising: 0
    };
    const docs = await (Model as any).find({}, projection).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id.toString()
    }));
  }

  async updateProfileApproval(type: string, id: string, approved: boolean): Promise<any> {
    const Model = this.getModelByType(type);
    const doc = await (Model as any).findByIdAndUpdate(id, { approved }, { new: true });
    if (!doc) throw new Error("Profile not found");
    return doc.toObject();
  }

  async getAllUsers(): Promise<any[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  async getAllWaitlistEntries(): Promise<any[]> {
    return await Waitlist.find({}).sort({ createdAt: -1 });
  }

  async getUserByGoogleId(googleId: string): Promise<any | undefined> {
    return await User.findOne({ googleId });
  }

  async deleteProfile(type: string, id: string): Promise<void> {
    const Model = this.getModelByType(type);
    await (Model as any).findByIdAndDelete(id);
  }
}

export const storage = new DatabaseStorage();
