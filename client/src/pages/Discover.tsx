import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, ChevronUp, Filter, MapPin, X } from "lucide-react";
import type { PublicStartupProfile } from "@shared/schema";

function authHeaders() {
  return { "Content-Type": "application/json" };
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-white text-black border-white" : "bg-transparent text-white/55 border-white/15 hover:border-white/30 hover:text-white/80"}`}>
      {label}
    </button>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-white/8 text-white/50 border-white/10"}`}>{label}</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="h-3 w-20 bg-white/10 rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-20 bg-white/10 rounded-full" />
        <div className="h-6 w-14 bg-white/10 rounded-full" />
      </div>
      <div className="h-9 w-32 bg-white/10 rounded-lg" />
    </div>
  );
}

// Interest modal
function InterestModal({ startup, onClose }: { startup: PublicStartupProfile; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => fetch("/api/connections", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ startup_id: startup.id, message: message || undefined }),
    }).then(async r => { if (!r.ok) throw new Error((await r.json()).message); return r.json(); }),
    onSuccess: () => setDone(true),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }} className="w-full max-w-md bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/50"
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
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Submitting…" : "Submit interest"}
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Startup card
function StartupCard({ profile, hasExpressedInterest }: { profile: PublicStartupProfile; hasExpressedInterest?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const industries = Array.isArray(profile.industry) ? profile.industry : profile.industry ? [profile.industry] : [];
  const headline = profile.product_description || profile.company_description || "No description provided yet.";

  return (
    <>
      <div className="group bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-colors">
        <div>
          <div className="flex items-start justify-between mb-1 gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-semibold tracking-tight truncate">{profile.company_name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/35">
                {profile.founder_label && (
                  <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/55">
                    {profile.founder_label}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-white/45">{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
            {hasExpressedInterest && (
              <span className="ml-2 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-medium text-emerald-300 shrink-0">
                Interest sent
              </span>
            )}
          </div>
          <p className="text-white/65 text-sm leading-relaxed line-clamp-3">{headline}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {industries.slice(0, 2).map(ind => <Tag key={ind} label={ind} />)}
          {industries.length > 2 && <Tag label={`+${industries.length - 2}`} />}
          {profile.stage && <Tag label={profile.stage} />}
        </div>

        {profile.goals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.goals.map(g => <Tag key={g} label={g} color={GOAL_COLORS[g]} />)}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-white/35">
          {profile.num_users && <span>Users: <span className="text-white/60">{profile.num_users}</span></span>}
          {profile.monthly_revenue && <span>MRR: <span className="text-white/60">{profile.monthly_revenue}</span></span>}
          {(profile as any)?.intent_fundraising?.capital_amount && (
            <span>
              Raising: <span className="text-white/60">{(profile as any).intent_fundraising.capital_amount}</span>
            </span>
          )}
          {(profile as any)?.intent_fundraising?.ticket_size && (
            <span>
              Ticket: <span className="text-white/60">{(profile as any).intent_fundraising.ticket_size}</span>
            </span>
          )}
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
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More details</>}
          </button>
          <Button
            onClick={() => !hasExpressedInterest && setShowModal(true)}
            size="sm"
            className="ml-auto"
            disabled={hasExpressedInterest}
            variant={hasExpressedInterest ? "outline" : "default"}
          >
            {hasExpressedInterest ? "Interest sent" : "Express interest"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <InterestModal startup={profile} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function Discover() {
  const { session, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [fundraising, setFundraising] = useState("");
  const [locationQ, setLocationQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  async function signOut() {
    await logout();
    setLocation("/");
  }

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (industry) p.set("industry", industry);
    if (stage) p.set("stage", stage);
    // kept for future backend support (currently ignored by server)
    if (fundraising) p.set("fundraising_status", fundraising);
    if (locationQ) p.set("location", locationQ);
    return p;
  }, [industry, stage, fundraising, locationQ]);

  const hasActiveFilters = !!(industry || stage || fundraising || locationQ);

  // Existing connections so we can mark startups with interest already sent
  const { data: connections } = useQuery<any[]>({
    queryKey: ["discover-connections"],
    queryFn: async () => {
      const r = await fetch("/api/connections", { headers: authHeaders() });
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: profiles, isLoading, error } = useQuery<PublicStartupProfile[]>({
    queryKey: ["discover", industry, stage, fundraising, locationQ],
    queryFn: async () => {
      const r = await fetch(`/api/discover?${params.toString()}`, { headers: authHeaders() });
      if (r.status === 403) throw new Error("investor_gate");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!session,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new (smoother filtering)
  });

  const interestedStartupIds = useMemo(() => {
    const set = new Set<string>();
    if (!connections) return set;
    for (const c of connections as any[]) {
      const startupIdField = (c as any).startup_id;
      const fromStartupId =
        typeof startupIdField === "string"
          ? startupIdField
          : startupIdField?._id;
      const fromStartup = (c as any).startup?.id;
      if (fromStartupId) set.add(String(fromStartupId));
      if (fromStartup) set.add(String(fromStartup));
    }
    return set;
  }, [connections]);

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
            <div>
              <div className="font-semibold tracking-tight leading-tight">Prodizzy</div>
              <div className="text-[11px] text-white/35 leading-tight -mt-0.5">Discover</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(v => !v)}
              className="border-white/10 text-white/80 bg-white/0 hover:bg-white/5"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">On</span>}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut} className="border-white/10 text-white/80 bg-white/0 hover:bg-white/5">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Filter panel */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-[65px] z-30 overflow-hidden border-b border-white/5 bg-black/90 backdrop-blur-xl"
          >
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-white/30 uppercase tracking-wider mr-1">Industry</span>
                  {INDUSTRIES.map(i => <FilterPill key={i} label={i} active={industry === i} onClick={() => setIndustry(p => p === i ? "" : i)} />)}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-white/30 uppercase tracking-wider mr-1">Stage</span>
                  {STAGES.map(s => <FilterPill key={s} label={s} active={stage === s} onClick={() => setStage(p => p === s ? "" : s)} />)}
                  <span className="text-[11px] text-white/30 uppercase tracking-wider ml-2 mr-1">Fundraising</span>
                  {FUNDRAISING.map(f => <FilterPill key={f} label={f} active={fundraising === f} onClick={() => setFundraising(p => p === f ? "" : f)} />)}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={locationQ}
                      onChange={e => setLocationQ(e.target.value)}
                      placeholder="Filter by location…"
                      className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-white/25 w-64"
                    />
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setIndustry(""); setStage(""); setFundraising(""); setLocationQ(""); }}
                      className="flex items-center gap-1 text-xs text-white/35 hover:text-white/70 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse startups</h1>
            <p className="text-white/35 text-sm mt-1">
              {profiles ? `${profiles.length} approved startup${profiles.length !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
          {!filtersOpen && (
            <div className="text-xs text-white/30">
              Tip: use <span className="text-white/50">Filters</span> to narrow by stage/industry.
            </div>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {profiles?.length === 0 && !isLoading && (
          <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-10 text-center">
            <div className="text-white font-semibold">No startups found</div>
            <div className="text-white/40 text-sm mt-1">Try clearing filters or broadening stage/industry.</div>
            {hasActiveFilters && (
              <div className="mt-5">
                <Button
                  variant="outline"
                  onClick={() => { setIndustry(""); setStage(""); setFundraising(""); setLocationQ(""); }}
                  className="border-white/10 text-white/80 bg-white/0 hover:bg-white/5"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles?.map(p => (
            <StartupCard
              key={p.id}
              profile={p}
              hasExpressedInterest={interestedStartupIds.has(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
