import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { LogOut, ChevronDown, ChevronUp, X } from "lucide-react";
import type { PublicStartupProfile } from "@shared/schema";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

const INDUSTRIES = ["FinTech", "HealthTech", "AI/ML", "SaaS B2B", "Consumer", "Marketplace", "DeepTech", "Other"];
const STAGES = ["Idea", "Pre-Product", "Pre-Revenue", "Early Revenue", "Scaling"];
const FUNDRAISING = ["Not raising", "Planning", "Actively raising", "Closed recently"];

const GOAL_COLORS: Record<string, string> = {
  Investors: "bg-red-500/15 text-red-400 border-red-500/20",
  Customers: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Co-founders": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Partners: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Enterprise Clients": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Mentors: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Talent: "bg-green-500/15 text-green-400 border-green-500/20",
};

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/15 hover:border-white/30 hover:text-white/70"}`}>
      {label}
    </button>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-white/8 text-white/50 border-white/10"}`}>{label}</span>;
}

// Interest modal
function InterestModal({ startup, token, onClose }: { startup: PublicStartupProfile; token: string; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => fetch("/api/connections", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ startup_id: startup.id, message: message || undefined }),
    }).then(async r => { if (!r.ok) throw new Error((await r.json()).message); return r.json(); }),
    onSuccess: () => setDone(true),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }} className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-2xl">✓</div>
            <h3 className="text-white font-semibold">Interest registered</h3>
            <p className="text-white/40 text-sm">The Prodizzy team will facilitate an intro. We'll be in touch.</p>
            <button onClick={onClose} className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">Express interest</h3>
                <p className="text-white/40 text-xs mt-0.5">{startup.company_name}</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Our team will review your interest and facilitate a warm intro. You won't have direct access to the founder's contact info.
            </p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Why are you interested? (optional — helps our team make a better intro)"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
            />
            {mutation.error && <p className="text-red-400 text-xs">{(mutation.error as Error).message}</p>}
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? "Submitting…" : "Submit interest"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Startup card
function StartupCard({ profile, token }: { profile: PublicStartupProfile; token: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-white font-semibold">{profile.company_name}</h3>
            <span className="text-white/25 text-xs">{profile.location}</span>
          </div>
          <p className="text-white/50 text-sm">{profile.company_description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(profile.industry)
            ? profile.industry.map(ind => <Tag key={ind} label={ind} />)
            : <Tag label={profile.industry} />
          }
          <Tag label={profile.stage} />
          {profile.business_model && <Tag label={profile.business_model} />}
        </div>

        {profile.goals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.goals.map(g => <Tag key={g} label={g} color={GOAL_COLORS[g]} />)}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-white/35">
          {profile.traction_range && <span>Users: <span className="text-white/60">{profile.traction_range}</span></span>}
          {profile.fundraising_status && <span>Raising: <span className="text-white/60">{profile.fundraising_status}</span></span>}
          {profile.revenue_status && <span>Revenue: <span className="text-white/60">{profile.revenue_status}</span></span>}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="space-y-3 pt-3 border-t border-white/6 text-sm">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Who pays them</p>
                  <p className="text-white/65">{profile.target_customer}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Problem they solve</p>
                  <p className="text-white/65">{profile.primary_problem}</p>
                </div>
                {profile.capital_use?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Capital use</p>
                    <p className="text-white/65">{profile.capital_use.join(", ")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors">
            {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More details</>}
          </button>
          <button onClick={() => setShowModal(true)}
            className="ml-auto bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
            Express interest
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <InterestModal startup={profile} token={token} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function Discover() {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [fundraising, setFundraising] = useState("");
  const [locationQ, setLocationQ] = useState("");

  async function signOut() {
    await firebaseSignOut(auth);
    setLocation("/");
  }

  const params = new URLSearchParams();
  if (industry) params.set("industry", industry);
  if (stage) params.set("stage", stage);
  if (fundraising) params.set("fundraising_status", fundraising);
  if (locationQ) params.set("location", locationQ);

  const { data: profiles, isLoading, error } = useQuery<PublicStartupProfile[]>({
    queryKey: ["discover", industry, stage, fundraising, locationQ],
    queryFn: async () => {
      const r = await fetch(`/api/discover?${params.toString()}`, { headers: authHeaders(session!.access_token) });
      if (r.status === 403) throw new Error("investor_gate");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session,
    retry: false,
  });

  if (error && (error as Error).message === "investor_gate") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-center">
        <div className="space-y-4 max-w-sm">
          <h2 className="text-white text-xl font-semibold">Investor access required</h2>
          <p className="text-white/40 text-sm">You need an investor profile to browse startups.</p>
          <button onClick={() => setLocation("/investor-onboard")} className="bg-white text-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors">
            Set up investor profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
            <span className="font-semibold tracking-tight">Prodizzy</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors text-sm">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </nav>

      {/* Filter bar */}
      <div className="sticky top-[61px] z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-white/30 uppercase tracking-wider mr-1">Industry</span>
            {INDUSTRIES.map(i => <FilterPill key={i} label={i} active={industry === i} onClick={() => setIndustry(p => p === i ? "" : i)} />)}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-white/30 uppercase tracking-wider mr-1">Stage</span>
            {STAGES.map(s => <FilterPill key={s} label={s} active={stage === s} onClick={() => setStage(p => p === s ? "" : s)} />)}
            <span className="text-xs text-white/30 uppercase tracking-wider ml-2 mr-1">Fundraising</span>
            {FUNDRAISING.map(f => <FilterPill key={f} label={f} active={fundraising === f} onClick={() => setFundraising(p => p === f ? "" : f)} />)}
          </div>
          <div className="flex items-center gap-3">
            <input value={locationQ} onChange={e => setLocationQ(e.target.value)} placeholder="Filter by location…"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-white/25 w-48" />
            {(industry || stage || fundraising || locationQ) && (
              <button onClick={() => { setIndustry(""); setStage(""); setFundraising(""); setLocationQ(""); }}
                className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Browse Startups</h1>
          <p className="text-white/35 text-sm mt-1">
            {profiles ? `${profiles.length} approved startup${profiles.length !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          </div>
        )}

        {profiles?.length === 0 && !isLoading && (
          <div className="text-center py-20 text-white/30">No approved startups match your filters yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles?.map(p => <StartupCard key={p.id} profile={p} token={session!.access_token} />)}
        </div>
      </div>
    </div>
  );
}
