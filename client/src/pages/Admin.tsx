import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Check, X, ChevronDown, ChevronUp, Trash2, Users, TrendingUp, Activity, FileText } from "lucide-react";
import type { StartupProfile, PartnerProfile, IndividualProfile, Business } from "@shared/schema";
import { MetricCard } from "@/components/admin/MetricCard";
import { GrowthChart } from "@/components/admin/GrowthChart";
import { CohortTable } from "@/components/admin/CohortTable";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { ensureHttps } from "@/lib/utils";

type ProfileType = "startup" | "partner" | "individual" | "business";
type AdminTab = "overview" | "growth" | "marketplace" | "profiles" | ProfileType | "users";

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

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteMutation.mutate();
    }
  };

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
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
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
                  {profile.linkedin_url && <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                  {profile.deck_link && <a href={ensureHttps(profile.deck_link)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Deck</a>}
                  {profile.website && <a href={ensureHttps(profile.website)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Website</a>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BusinessProfileRow({ profile, profileType }: { profile: Business; profileType: ProfileType }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) =>
      fetch(`/api/admin?id=${profile._id}&type=${profileType}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ approved }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin?id=${profile._id}&type=${profileType}`, {
        method: "DELETE",
        headers: authHeaders(),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this business?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.business_name}</span>
            <Tag label={profile.business_type} />
            {profile.industry && profile.industry.length > 0 && (
              Array.isArray(profile.industry)
                ? profile.industry.map(ind => <Tag key={ind} label={ind} />)
                : <Tag label={profile.industry as any} />
            )}
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">
            {profile.location || "Location —"}{profile.team_size ? ` · Team: ${profile.team_size}` : ""}{profile.founded_year ? ` · Founded ${profile.founded_year}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!profile.approved ? (
            <button
              onClick={() => approveMutation.mutate(true)}
              disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50"
            >
              <Check className="w-3 h-3" /> Approve
            </button>
          ) : (
            <button
              onClick={() => approveMutation.mutate(false)}
              disabled={approveMutation.isPending}
              className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Revoke
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {profile.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-white/65 leading-relaxed">{profile.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Location</p>
                <p className="text-white/65">{profile.location || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Team Size</p>
                <p className="text-white/65">{profile.team_size || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Founded Year</p>
                <p className="text-white/65">{profile.founded_year || "—"}</p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-white/6">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Links</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  {profile.website && (
                    <a href={ensureHttps(profile.website)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">
                      Website
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      LinkedIn
                    </a>
                  )}
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

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteMutation.mutate();
    }
  };

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
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
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
                <p className="text-white/65">{profile.services_offered || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Stages Served</p>
                <p className="text-white/65">
                  {profile.stages_served?.join(", ") || "—"}
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
                  {profile.website && <a href={ensureHttps(profile.website)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Website</a>}
                  {profile.linkedin_url && <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                </div>
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

  // Helper for rendering role-specific nested data
  const renderRoleData = (role: string, data: any) => {
    if (!data) return null;
    return (
      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
        <p className="text-[10px] font-bold text-white/40 uppercase mb-2 tracking-widest">{role} Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
          {Object.entries(data).map(([key, val]: [string, any]) => {
            if (typeof val === 'object' && val !== null) {
              return (
                <div key={key} className="col-span-2">
                  <span className="text-white/30 capitalize">{key.replace(/_/g, " ")}: </span>
                  <span className="text-white/70">{JSON.stringify(val)}</span>
                </div>
              );
            }
            return (
              <div key={key}>
                <span className="text-white/30 capitalize">{key.replace(/_/g, " ")}: </span>
                <span className="text-white/70">{String(val)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ approved }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin?id=${profile.id}&type=${profileType}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-profiles", profileType] }),
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={`border rounded-xl transition-colors ${profile.approved ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-white/[0.02]"}`}>
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{profile.full_name}</span>
            <div className="flex gap-1">
              {profile.roles?.map(r => <Tag key={r} label={r} />)}
            </div>
            {profile.approved
              ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">Approved</span>
              : <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Pending</span>
            }
          </div>
          <p className="text-white/35 text-xs mt-0.5 truncate">{profile.email} · {profile.location} · {profile.availability}</p>
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
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/60 transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/6 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Skills</p>
                  <p className="text-white/65">{Array.isArray(profile.skills) ? profile.skills.join(", ") : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Looking for</p>
                  <p className="text-white/65">{Array.isArray(profile.looking_for) ? profile.looking_for.join(", ") : String(profile.looking_for || "—")}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Availability</p>
                  <p className="text-white/65">{profile.availability} · {profile.work_mode}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-white/65">{profile.location} · DOB: {profile.dob || "—"}</p>
                </div>
              </div>
              {/* Conditional Data Blocks */}
              {profile.roles?.includes("Founder") && profile.founder_status && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1 tracking-widest">Founder Status</p>
                  <p className="text-xs text-white/70">{profile.founder_status}</p>
                </div>
              )}
              {profile.roles?.includes("Investor") && renderRoleData("Investor", profile.investor_data)}
              {profile.roles?.includes("Student") && renderRoleData("Student", profile.student_data)}
              {profile.roles?.includes("Working Professional") && renderRoleData("Professional", profile.professional_data)}
              {profile.roles?.includes("Freelancer / Service Provider") && renderRoleData("Freelancer", profile.freelancer_data)}
              {profile.roles?.includes("Consultant / Mentor / Advisor") && renderRoleData("Consultant", profile.consultant_data)}
              {profile.roles?.includes("Content Creator / Community Admin") && renderRoleData("Creator", profile.creator_data)}

              <div className="border-t border-white/6 pt-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact & Links</p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>Email: <span className="text-white/75">{profile.email}</span></span>
                  <span>Phone: <span className="text-white/75">{profile.phone || "—"}</span></span>
                  {profile.linkedin_url && <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                  {profile.portfolio_url && <a href={ensureHttps(profile.portfolio_url)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Portfolio</a>}
                  {profile.resume_url && <a href={ensureHttps(profile.resume_url)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">Resume</a>}
                  {profile.github_url && <a href={ensureHttps(profile.github_url)} target="_blank" rel="noreferrer" className="text-white/75 hover:underline">GitHub</a>}
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
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [profileTab, setProfileTab] = useState<ProfileType | "users">("startup");

  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useQuery<any[]>({
    queryKey: ["admin-profiles", profileTab],
    queryFn: async () => {
      const r = await fetch(`/api/admin?type=${profileTab}`, { headers: authHeaders() });
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "profiles" && profileTab !== "users",
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
    enabled: !!session && activeTab === "profiles" && profileTab === "users",
    retry: false,
  });

  // Analytics queries
  const { data: overviewData } = useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics/overview", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "overview",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: growthData } = useQuery({
    queryKey: ["admin-analytics-growth"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics/growth", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "growth",
    staleTime: 5 * 60 * 1000,
  });

  const { data: engagementData } = useQuery({
    queryKey: ["admin-analytics-engagement"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics/engagement", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && (activeTab === "overview" || activeTab === "growth"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: marketplaceData } = useQuery({
    queryKey: ["admin-analytics-marketplace"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics/marketplace", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && (activeTab === "overview" || activeTab === "marketplace"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: cohortData } = useQuery({
    queryKey: ["admin-analytics-cohorts"],
    queryFn: async () => {
      const r = await fetch("/api/admin/analytics/cohorts", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session && activeTab === "growth",
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = activeTab === "profiles" && (profileTab === "users" ? usersLoading : profilesLoading);
  const error = activeTab === "profiles" && (profileTab === "users" ? usersError : profilesError);

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
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { type: "overview" as AdminTab, label: "Overview", icon: Activity },
            { type: "growth" as AdminTab, label: "Growth", icon: TrendingUp },
            { type: "marketplace" as AdminTab, label: "Marketplace", icon: Users },
            { type: "profiles" as AdminTab, label: "Profiles", icon: FileText },
          ].map(tab => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors shrink-0 flex items-center gap-2 ${activeTab === tab.type
                ? "border-white text-white"
                : "border-transparent text-white/40 hover:text-white/60"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Tab */}
        {activeTab === "overview" && overviewData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Users" value={overviewData.totalUsers} subtitle="All registered users" />
              <MetricCard title="Monthly Active Users" value={overviewData.mau} subtitle={`${overviewData.engagementRate}% engagement rate`} />
              <MetricCard title="Total Connections" value={overviewData.totalConnections} subtitle={`${overviewData.acceptanceRate}% acceptance rate`} />
              <MetricCard title="Daily Active Users" value={overviewData.dau} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard title="Startups" value={overviewData.startupCount} subtitle="Approved profiles" />
              <MetricCard title="Investors" value={overviewData.investorCount} subtitle="Active on platform" />
              <MetricCard title="Partners" value={overviewData.partnerCount} subtitle="Approved profiles" />
            </div>

            {engagementData && <FunnelChart data={engagementData} />}
          </>
        )}

        {/* Growth Tab */}
        {activeTab === "growth" && (
          <>
            {growthData && (
              <GrowthChart
                data={growthData.trends || []}
                title="User Signups Over Time"
                description={`${growthData.totalNewUsers} new users in selected period`}
                dataKeys={[
                  { key: "count", label: "Total Signups", color: "#3b82f6" },
                  { key: "cumulative", label: "Cumulative Total", color: "#8b5cf6" },
                ]}
                type="line"
              />
            )}

            {growthData && (
              <GrowthChart
                data={growthData.trends || []}
                title="Signups by Profile Type"
                description="Breakdown of new users by type"
                dataKeys={[
                  { key: "startups", label: "Startups", color: "#3b82f6" },
                  { key: "partners", label: "Partners", color: "#8b5cf6" },
                  { key: "individuals", label: "Individuals", color: "#ec4899" },
                  { key: "investors", label: "Investors", color: "#10b981" },
                ]}
                type="area"
              />
            )}

            {cohortData && <CohortTable data={cohortData} />}
          </>
        )}

        {/* Marketplace Tab */}
        {activeTab === "marketplace" && marketplaceData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Startup to Investor Ratio"
                value={marketplaceData.startupToInvestorRatio}
                subtitle="Supply-demand balance"
              />
              <MetricCard
                title="Seller Liquidity Index"
                value={`${marketplaceData.sellerLiquidityIndex}%`}
                subtitle={`${marketplaceData.activeSellers} / ${marketplaceData.totalSellers} active`}
              />
              <MetricCard
                title="Connection Acceptance Rate"
                value={`${marketplaceData.connectionAcceptanceRate}%`}
                subtitle="Match quality indicator"
              />
              <MetricCard
                title="Avg Connections per User"
                value={marketplaceData.avgConnectionsPerActiveUser}
                subtitle="User engagement"
              />
            </div>

            {marketplaceData.connections && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Connections" value={marketplaceData.connections.total} />
                <MetricCard title="Pending" value={marketplaceData.connections.pending} subtitle="Awaiting response" />
                <MetricCard title="Accepted" value={marketplaceData.connections.accepted} subtitle="Successful matches" />
                <MetricCard
                  title="Avg Response Time"
                  value={`${marketplaceData.connections.avgResponseTimeDays} days`}
                  subtitle="Time to accept/decline"
                />
              </div>
            )}
          </>
        )}

        {/* Profiles Tab - Existing functionality */}
        {activeTab === "profiles" && (
          <>
            {/* Profile Sub-Tabs */}
            <div className="border-b border-white/5">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[
                  { type: "startup" as const, label: "Startups" },
                  { type: "partner" as const, label: "Partners" },
                  { type: "individual" as const, label: "Individuals" },
                  { type: "business" as const, label: "Businesses" },
                  { type: "users" as const, label: "All Users" },
                ].map(tab => (
                  <button
                    key={tab.type}
                    onClick={() => setProfileTab(tab.type)}
                    className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${profileTab === tab.type
                      ? "border-white text-white"
                      : "border-transparent text-white/40 hover:text-white/60"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: profileTab === "users" ? "Total Users" : `Total ${profileTab.charAt(0).toUpperCase() + profileTab.slice(1)}s`,
                  value: profileTab === "users" ? (users?.length ?? "...") : (profiles?.length ?? "...")
                },
                { label: "Pending approval", value: profileTab === "users" ? "—" : (pending.length || "0") },
                { label: "Approved", value: profileTab === "users" ? "—" : (approved.length || "0") },
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
            {profileTab === "users" && users && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Registered Users ({users.length})</h2>
                <div className="grid grid-cols-1 gap-3">
                  {users.map(u => <UserRow key={u.id || u.googleId || u._id} user={u} />)}
                </div>
              </div>
            )}

            {/* Pending */}
            {profileTab !== "users" && pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Pending approval ({pending.length})</h2>
                {pending.map(p => {
                  const pt = profileTab as ProfileType;
                  if (profileTab === "startup") return <StartupProfileRow key={p.id} profile={p as StartupProfile} profileType={pt} />;
                  if (profileTab === "partner") return <PartnerProfileRow key={p.id} profile={p as PartnerProfile} profileType={pt} />;
                  if (profileTab === "individual") return <IndividualProfileRow key={p.id} profile={p as IndividualProfile} profileType={pt} />;
                  return <BusinessProfileRow key={p._id} profile={p as Business} profileType={pt} />;
                })}
              </div>
            )}

            {/* Approved */}
            {profileTab !== "users" && approved.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Approved ({approved.length})</h2>
                {approved.map(p => {
                  const pt = profileTab as ProfileType;
                  if (profileTab === "startup") return <StartupProfileRow key={p.id} profile={p as StartupProfile} profileType={pt} />;
                  if (profileTab === "partner") return <PartnerProfileRow key={p.id} profile={p as PartnerProfile} profileType={pt} />;
                  if (profileTab === "individual") return <IndividualProfileRow key={p.id} profile={p as IndividualProfile} profileType={pt} />;
                  return <BusinessProfileRow key={p._id} profile={p as Business} profileType={pt} />;
                })}
              </div>
            )}

            {profiles?.length === 0 && !isLoading && (
              <div className="text-center py-12 text-white/30">No profiles yet.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
