import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { StartupProfile, PartnerProfile, IndividualProfile } from "@shared/schema";

type ProfileType = "startup" | "partner" | "investor" | "individual";
type AdminTab = ProfileType | "users" | "waitlist";

function authHeaders() {
  return { "Content-Type": "application/json" };
}

function Tag({ label }: { label: string }) {
  return <span className="px-2 py-0.5 rounded-full text-xs border bg-white/5 text-white/50 border-white/10">{label}</span>;
}

function StartupProfileRow({ profile, profileType }: { profile: StartupProfile; profileType: ProfileType }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ approved }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.company_name}</span>
            {Array.isArray(profile.industry)
              ? profile.industry.map(ind => <Tag key={ind} label={ind} />)
              : <Tag label={profile.industry} />
            }
            <Tag label={profile.stage} />
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">{profile.full_name} · {profile.role} · {profile.email} · {profile.phone}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!profile.approved ? (
            <button onClick={() => approveMutation.mutate(true)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50">
              <Check className="w-3 h-3" /> Approve
            </button>
          ) : (
            <button onClick={() => approveMutation.mutate(false)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50">
              <X className="w-3 h-3" /> Revoke
            </button>
          )}
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Product Description</p>
                <p className="text-white/65 leading-relaxed">{profile.product_description}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Target audience</p>
                <p className="text-white/65">{profile.target_audience}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Team Size</p>
                <p className="text-white/65">{profile.team_size}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Registered?</p>
                <p className="text-white/65">{profile.is_registered}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Location</p>
                <p className="text-white/65">{profile.location}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Metrics</p>
                <p className="text-white/65">{profile.num_users || "0"} users · {profile.monthly_revenue || "No revenue"}</p>
              </div>
              {profile.traction_highlights && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Traction Highlights</p>
                  <p className="text-white/65 leading-relaxed">{profile.traction_highlights}</p>
                </div>
              )}
              {/* Contact info — visible to admin only */}
              <div className="sm:col-span-2 pt-2 border-t border-white/6">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact (admin only)</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>Email: <span className="text-white/75">{profile.email}</span></span>
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                  {profile.deck_link && <a href={profile.deck_link} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Deck</a>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Website</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserRow({ user }: { user: any }) {
  return (
    <div className="border border-white/8 bg-white/[0.02] rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white/20 text-xs font-bold">{user.displayName?.charAt(0) || user.email.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{user.displayName || "Unknown User"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
            {user.role || 'user'}
          </span>
        </div>
        <p className="text-white/35 text-xs mt-0.5 truncate">{user.email} · Registered {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="text-xs text-white/20 tabular-nums">
        ID: {user.googleId || user._id}
      </div>
    </div>
  );
}

function WaitlistRow({ entry }: { entry: any }) {
  return (
    <div className="border border-white/8 bg-white/[0.02] rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
        <span className="text-violet-400 text-xs font-bold">{entry.name?.charAt(0) || "?"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{entry.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight border bg-violet-500/10 text-violet-400 border-violet-500/20">{entry.role}</span>
        </div>
        <p className="text-white/35 text-xs mt-0.5 truncate">{entry.email} · Joined {new Date(entry.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function PartnerProfileRow({ profile, profileType }: { profile: PartnerProfile; profileType: ProfileType }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ approved }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.company_name}</span>
            <Tag label={profile.partner_type} />
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">{profile.full_name} · {profile.email} · {profile.phone}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!profile.approved ? (
            <button onClick={() => approveMutation.mutate(true)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50">
              <Check className="w-3 h-3" /> Approve
            </button>
          ) : (
            <button onClick={() => approveMutation.mutate(false)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50">
              <X className="w-3 h-3" /> Revoke
            </button>
          )}
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Services</p>
                <p className="text-white/65">{profile.services_offered?.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Industries & Stages</p>
                <p className="text-white/65">
                  Industries: {profile.industries_served?.join(", ") || "—"}
                  <br />
                  Stages: {profile.stages_served?.join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Team size</p>
                <p className="text-white/65">{profile.team_size || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Experience</p>
                <p className="text-white/65">{profile.years_experience || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>Email: <span className="text-white/75">{profile.email}</span></span>
                  <span>Phone: <span className="text-white/75">{profile.phone}</span></span>
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Website</a>}
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InvestorProfileRow({ profile, profileType }: { profile: any; profileType: ProfileType }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ approved }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.full_name || profile.name}</span>
            <Tag label={profile.investor_type} />
            <Tag label={profile.check_size} />
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">{profile.firm_name ? `${profile.firm_name} · ` : ""}{profile.email}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!profile.approved ? (
            <button onClick={() => approveMutation.mutate(true)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50">
              <Check className="w-3 h-3" /> Approve
            </button>
          ) : (
            <button onClick={() => approveMutation.mutate(false)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50">
              <X className="w-3 h-3" /> Revoke
            </button>
          )}
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Thesis</p>
                <p className="text-white/65 leading-relaxed">{profile.thesis || "No thesis provided"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Sectors & Stages</p>
                <p className="text-white/65">
                  Sectors: {profile.sectors?.join(", ") || "—"}
                  <br />
                  Stages: {profile.stages?.join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Geography</p>
                <p className="text-white/65">{profile.geography || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Contact</p>
                <p className="text-white/65">{profile.email}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IndividualProfileRow({ profile, profileType }: { profile: IndividualProfile; profileType: ProfileType }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ approved }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.full_name}</span>
            <Tag label={profile.profile_type} />
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">{profile.email} · {profile.phone} · {profile.experience_level}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!profile.approved ? (
            <button onClick={() => approveMutation.mutate(true)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50">
              <Check className="w-3 h-3" /> Approve
            </button>
          ) : (
            <button onClick={() => approveMutation.mutate(false)} disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50">
              <X className="w-3 h-3" /> Revoke
            </button>
          )}
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Skills</p>
                <p className="text-white/65">{profile.skills?.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Looking for</p>
                <p className="text-white/65">{profile.looking_for?.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Availability</p>
                <p className="text-white/65">{profile.availability} · {profile.work_mode}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Location</p>
                <p className="text-white/65">{profile.location}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>Email: <span className="text-white/75">{profile.email}</span></span>
                  <span>Phone: <span className="text-white/75">{profile.phone}</span></span>
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                  {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Portfolio</a>}
                  {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">GitHub</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const { session, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("startup");

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useQuery<any[]>({
    queryKey: ["admin-profiles", activeTab],
    queryFn: async () => {
      const r = await fetch(`/api/admin?type=${activeTab}`, { headers: authHeaders() });
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab !== "users",
    retry: false,
  });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const r = await fetch(`/api/admin/users`, { headers: authHeaders() });
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "users",
    retry: false,
  });

  const { data: waitlist, isLoading: waitlistLoading, error: waitlistError } = useQuery<any[]>({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const r = await fetch(`/api/admin/waitlist`, { headers: authHeaders() });
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "waitlist",
    retry: false,
  });

  const isLoading = activeTab === "users" ? usersLoading : activeTab === "waitlist" ? waitlistLoading : profilesLoading;
  const error = activeTab === "users" ? usersError : activeTab === "waitlist" ? waitlistError : profilesError;

  async function signOut() {
    await logout();
    setLocation("/");
  }

  if (error && (error as Error).message === "forbidden") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/40 text-sm">
        Access denied.
      </div>
    );
  }

  const pending = profiles?.filter(p => !p.approved) ?? [];
  const approved = profiles?.filter(p => p.approved) ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
            <span className="font-semibold tracking-tight">Admin</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors text-sm">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-black/60 border-b border-white/5 px-6">
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { type: "startup" as AdminTab, label: "Startups" },
            { type: "partner" as AdminTab, label: "Partners" },
            { type: "investor" as AdminTab, label: "Investors" },
            { type: "individual" as AdminTab, label: "Individuals" },
            { type: "users" as AdminTab, label: "All Users" },
            { type: "waitlist" as AdminTab, label: "Waitlist" },
          ].map(tab => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${activeTab === tab.type
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/60"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users?.length ?? (activeTab === "users" ? "..." : "—") },
            { label: "Filtered profiles", value: profiles?.length ?? (activeTab !== "users" ? "..." : "—") },
            { label: "Pending approval", value: pending.length || (activeTab !== "users" ? "0" : "—") },
            { label: "Approved", value: approved.length || (activeTab !== "users" ? "0" : "—") },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          </div>
        )}

        {/* Users List */}
        {activeTab === "users" && users && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Registered Users ({users.length})</h2>
            <div className="grid grid-cols-1 gap-3">
              {users.map(u => <UserRow key={u.id || u.googleId || u._id} user={u} />)}
            </div>
          </div>
        )}

        {/* Waitlist */}
        {activeTab === "waitlist" && waitlist && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Waitlist Signups ({waitlist.length})</h2>
            <div className="grid grid-cols-1 gap-3">
              {waitlist.map((e: any) => <WaitlistRow key={e._id} entry={e} />)}
            </div>
            {waitlist.length === 0 && <div className="text-center py-12 text-white/30">No waitlist entries yet.</div>}
          </div>
        )}

        {/* Pending */}
        {activeTab !== "users" && pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Pending approval ({pending.length})</h2>
            {pending.map(p => {
              if (activeTab === "startup") return <StartupProfileRow key={p.id} profile={p as StartupProfile} profileType={activeTab} />;
              if (activeTab === "partner") return <PartnerProfileRow key={p.id} profile={p as PartnerProfile} profileType={activeTab} />;
              if (activeTab === "investor") return <InvestorProfileRow key={p.id} profile={p} profileType={activeTab} />;
              return <IndividualProfileRow key={p.id} profile={p as IndividualProfile} profileType={activeTab} />;
            })}
          </div>
        )}

        {/* Approved */}
        {activeTab !== "users" && approved.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Approved ({approved.length})</h2>
            {approved.map(p => {
              if (activeTab === "startup") return <StartupProfileRow key={p.id} profile={p as StartupProfile} profileType={activeTab} />;
              if (activeTab === "partner") return <PartnerProfileRow key={p.id} profile={p as PartnerProfile} profileType={activeTab} />;
              if (activeTab === "investor") return <InvestorProfileRow key={p.id} profile={p} profileType={activeTab} />;
              return <IndividualProfileRow key={p.id} profile={p as IndividualProfile} profileType={activeTab} />;
            })}
          </div>
        )}

        {profiles?.length === 0 && !isLoading && (
          <div className="text-center py-12 text-white/30">No profiles yet.</div>
        )}
      </div>
    </div>
  );
}
