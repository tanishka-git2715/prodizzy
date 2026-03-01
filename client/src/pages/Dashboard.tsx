import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import type { StartupProfile, PartnerProfile, IndividualProfile } from "@shared/schema";
import { LogOut, ChevronRight, Check, Edit2, X } from "lucide-react";

function authHeaders() {
  return { "Content-Type": "application/json" };
}

function matchScore(p: StartupProfile): number {
  const fields = [
    p.company_name, p.phone, p.linkedin_url,
    p.stage, p.industry, p.team_size, p.location, p.is_registered,
    p.product_description, p.problem_solved, p.target_audience,
    p.num_users, p.monthly_revenue, p.traction_highlights, p.website
  ];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== "" && (Array.isArray(f) ? f.length > 0 : true)).length;
  return Math.round((filled / fields.length) * 100);
}

const GOAL_COLORS: Record<string, string> = {
  Investors: "bg-red-500/15 text-red-400 border-red-500/20",
  Customers: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Co-founders": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Partners: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Enterprise Clients": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Mentors: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Talent: "bg-green-500/15 text-green-400 border-green-500/20",
};

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-white/8 text-white/50 border-white/10"}`}>
      {label}
    </span>
  );
}

function PickOne({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${value === o ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/15 hover:border-white/30 hover:text-white/70"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function PickMany({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${value.includes(o) ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/15 hover:border-white/30 hover:text-white/70"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/35 uppercase tracking-wider">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/35 uppercase tracking-wider">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none" />
    </div>
  );
}

interface ProCardProps {
  title: string; unlockLabel: string; isFilled: boolean;
  filledPreview: React.ReactNode; form: React.ReactNode;
  onSave: () => void; saving: boolean;
}
function ProCard({ title, unlockLabel, isFilled, filledPreview, form, onSave, saving }: ProCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-medium text-sm">{title}</h3>
          {!isFilled && <p className="text-white/30 text-xs mt-0.5">{unlockLabel}</p>}
        </div>
        {isFilled ? (
          <button onClick={() => setOpen(o => !o)} className="text-white/30 hover:text-white/60 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            {open ? "Cancel" : "Complete"} <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {isFilled && !open && <div className="text-sm text-white/50">{filledPreview}</div>}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="space-y-4 pt-2 border-t border-white/8">
              {form}
              <button onClick={() => { onSave(); setOpen(false); }} disabled={saving}
                className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
                <Check className="w-3 h-3" /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Startup Dashboard as a proper component ────────────────────────────────────
const INDUSTRY_OPTIONS = ["Software & AI", "Fintech", "Healthtech", "Edtech", "D2C / Consumer", "SaaS", "Deeptech", "Climate", "Other"];
const STAGE_OPTIONS = ["Idea / Pre-product", "MVP (no traction)", "Seed (MVP & Early traction)", "Early Revenue", "Growth", "Series A+"];
const TEAM_SIZE_OPTIONS = ["Solo", "2–5", "6–10", "11–50", "50+"];
const IS_REGISTERED_OPTIONS = ["Yes", "No", "In progress"];

function StartupDashboard({ profile, session, signOut, patchMutation, connections, greeting }: {
  profile: StartupProfile; session: any; signOut: () => void;
  patchMutation: any; connections: any[]; greeting: string;
}) {
  const [editingCore, setEditingCore] = useState(false);
  const score = matchScore(profile);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Core profile edit state (pre-fill from profile)
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [role, setRole] = useState(profile.role || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [location, setLocation] = useState(profile.location || "");
  const [industry, setIndustry] = useState<string[]>(Array.isArray(profile.industry) ? profile.industry : profile.industry ? [profile.industry] : []);
  const [stage, setStage] = useState(profile.stage || "");
  const [teamSize, setTeamSize] = useState(profile.team_size || "");
  const [isRegistered, setIsRegistered] = useState(profile.is_registered || "");
  const [productDescription, setProductDescription] = useState(profile.product_description || "");
  const [problemSolved, setProblemSolved] = useState(profile.problem_solved || "");
  const [targetAudience, setTargetAudience] = useState(profile.target_audience || "");
  const [numUsers, setNumUsers] = useState(profile.num_users || "");
  const [monthlyRevenue, setMonthlyRevenue] = useState(profile.monthly_revenue || "");
  const [tractionHighlights, setTractionHighlights] = useState(profile.traction_highlights || "");

  // Progressive profiling state
  const [missingRoles, setMissingRoles] = useState<string[]>([]);
  const [hiringUrgency, setHiringUrgency] = useState("");
  const [partnershipWhy, setPartnershipWhy] = useState<string[]>([]);
  const [idealPartnerType, setIdealPartnerType] = useState("");
  const [partnershipMaturity, setPartnershipMaturity] = useState("");
  const [roundType, setRoundType] = useState("");
  const [investorWarmth, setInvestorWarmth] = useState<string[]>([]);
  const [geography, setGeography] = useState("");
  const [speedPreference, setSpeedPreference] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("");
  const [existingBackers, setExistingBackers] = useState("");
  const [notableCustomers, setNotableCustomers] = useState("");
  const [deckLink, setDeckLink] = useState("");
  const [websiteExtra, setWebsiteExtra] = useState("");
  const [linkedinUrlExtra, setLinkedinUrlExtra] = useState("");

  function saveCore() {
    patchMutation.mutate({
      company_name: companyName,
      full_name: fullName,
      role,
      phone,
      website,
      linkedin_url: linkedinUrl,
      location,
      industry,
      stage,
      team_size: teamSize,
      is_registered: isRegistered,
      product_description: productDescription,
      problem_solved: problemSolved,
      target_audience: targetAudience,
      num_users: numUsers,
      monthly_revenue: monthlyRevenue,
      traction_highlights: tractionHighlights,
    });
    setEditingCore(false);
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

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
          <p className="text-white/35 mt-1 text-sm">{profile.company_name} · {profile.role} · {profile.stage}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main startup profile card ──────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Startup Profile</h2>
              <button
                onClick={() => {
                  // Reset form to current profile values on open
                  if (!editingCore) {
                    setCompanyName(profile.company_name || "");
                    setFullName(profile.full_name || "");
                    setRole(profile.role || "");
                    setPhone(profile.phone || "");
                    setWebsite(profile.website || "");
                    setLinkedinUrl(profile.linkedin_url || "");
                    setLocation(profile.location || "");
                    setIndustry(Array.isArray(profile.industry) ? profile.industry : profile.industry ? [profile.industry] : []);
                    setStage(profile.stage || "");
                    setTeamSize(profile.team_size || "");
                    setIsRegistered(profile.is_registered || "");
                    setProductDescription(profile.product_description || "");
                    setProblemSolved(profile.problem_solved || "");
                    setTargetAudience(profile.target_audience || "");
                    setNumUsers(profile.num_users || "");
                    setMonthlyRevenue(profile.monthly_revenue || "");
                    setTractionHighlights(profile.traction_highlights || "");
                  }
                  setEditingCore(e => !e);
                }}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs"
              >
                {editingCore ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!editingCore ? (
                /* ── VIEW MODE ── */
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold tracking-tight">{profile.company_name}</h2>
                      <p className="text-white/45 text-sm mt-1 leading-relaxed max-w-xl">{profile.product_description}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-medium border border-white/10 text-xs">
                        {profile.full_name?.[0]?.toUpperCase() || profile.company_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm leading-tight">{profile.full_name}</p>
                        <p className="text-white/40 text-[11px] uppercase tracking-wider mt-0.5">{profile.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(profile.industry) ? profile.industry.map(ind => <Tag key={ind} label={ind} />) : <Tag label={profile.industry} />}
                    <Tag label={profile.stage} />
                    <Tag label={`Team: ${profile.team_size}`} />
                    <Tag label={`Registered: ${profile.is_registered}`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-4">
                      {profile.problem_solved && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Problem solved</p>
                          <p className="text-white/70 leading-relaxed">{profile.problem_solved}</p>
                        </div>
                      )}
                      {profile.target_audience && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Target audience</p>
                          <p className="text-white/70">{profile.target_audience}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {profile.location && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Location</p>
                          <p className="text-white/70">{profile.location}</p>
                        </div>
                      )}
                      {profile.traction_highlights && (
                        <div>
                          <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Traction Highlights</p>
                          <p className="text-white/70 leading-relaxed">{profile.traction_highlights}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Contact</p>
                      <p className="text-xs text-white/60 truncate">{profile.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">LinkedIn</p>
                      <a href={profile.linkedin_url || "#"} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate block">Profile &rarr;</a>
                    </div>
                    {profile.website && (
                      <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Website</p>
                        <a href={profile.website} target="_blank" rel="noreferrer" className="text-xs text-white/60 hover:underline truncate block">{profile.website.replace(/^https?:\/\//, "")}</a>
                      </div>
                    )}
                  </div>

                  {profile.goals?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.goals.map(g => <Tag key={g} label={g} color={GOAL_COLORS[g]} />)}
                    </div>
                  )}

                  {(profile.num_users || profile.monthly_revenue) && (
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-white/6 text-xs">
                      {profile.num_users && <span className="text-white/40">Users: <span className="text-white/70">{profile.num_users}</span></span>}
                      {profile.monthly_revenue && <span className="text-white/40">Revenue: <span className="text-white/70">{profile.monthly_revenue}</span></span>}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* ── EDIT MODE ── */
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Prodizzy" />
                    <TextInput label="Your Full Name" value={fullName} onChange={setFullName} placeholder="Jane Smith" />
                    <TextInput label="Your Role" value={role} onChange={setRole} placeholder="Co-founder & CEO" />
                    <TextInput label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                    <TextInput label="Website" value={website} onChange={setWebsite} placeholder="https://yourco.com" />
                    <TextInput label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
                    <TextInput label="Location" value={location} onChange={setLocation} placeholder="Delhi, India" />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-white/35 uppercase tracking-wider">Industry</p>
                    <PickMany options={INDUSTRY_OPTIONS} value={industry} onChange={setIndustry} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/35 uppercase tracking-wider">Stage</p>
                    <PickOne options={STAGE_OPTIONS} value={stage} onChange={setStage} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/35 uppercase tracking-wider">Team Size</p>
                      <PickOne options={TEAM_SIZE_OPTIONS} value={teamSize} onChange={setTeamSize} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/35 uppercase tracking-wider">Registered Company?</p>
                      <PickOne options={IS_REGISTERED_OPTIONS} value={isRegistered} onChange={setIsRegistered} />
                    </div>
                  </div>

                  <TextArea label="Product Description" value={productDescription} onChange={setProductDescription} placeholder="What does your product do?" />
                  <TextArea label="Problem Solved" value={problemSolved} onChange={setProblemSolved} placeholder="What problem are you solving?" />
                  <TextInput label="Target Audience" value={targetAudience} onChange={setTargetAudience} placeholder="SMBs, Students, D2C brands..." />
                  <TextArea label="Traction Highlights" value={tractionHighlights} onChange={setTractionHighlights} placeholder="Key milestones, partnerships, press..." />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput label="Number of Users" value={numUsers} onChange={setNumUsers} placeholder="500 beta users" />
                    <TextInput label="Monthly Revenue" value={monthlyRevenue} onChange={setMonthlyRevenue} placeholder="₹2L MRR" />
                  </div>

                  <div className="pt-3 border-t border-white/8 flex gap-3">
                    <button onClick={saveCore} disabled={patchMutation.isPending}
                      className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
                      <Check className="w-3 h-3" /> {patchMutation.isPending ? "Saving…" : "Save changes"}
                    </button>
                    <button onClick={() => setEditingCore(false)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2.5">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Match Readiness ─────────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Match Readiness</h2>
            <div className="text-5xl font-bold tabular-nums">{score}%</div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div className="h-full bg-red-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            {score < 80 && <p className="text-xs text-white/35">Complete the sections below to improve match quality →</p>}
            {score >= 80 && <p className="text-xs text-white/35">Your profile is highly optimized for matching.</p>}
            <div className="pt-2 border-t border-white/6 space-y-1 text-xs text-white/35">
              <p>Onboarding complete ✓</p>
              {profile.team_size && <p>Team signals ✓</p>}
              {profile.partnership_maturity && <p>Partnership readiness ✓</p>}
              {profile.round_type && <p>Fundraising intel ✓</p>}
              {profile.geography && <p>Constraints ✓</p>}
              {profile.linkedin_url && <p>Credibility ✓</p>}
            </div>
          </div>

          {/* ── Progressive ProCards ────────────────────────────────────────────── */}
          <ProCard title="Team Signals" unlockLabel="Improve talent matching" isFilled={!!profile.team_size}
            filledPreview={<div className="space-y-1">
              {profile.team_size && <p>Size: {profile.team_size}</p>}
              {profile.missing_roles?.length ? <p>Missing: {profile.missing_roles.join(", ")}</p> : null}
              {profile.hiring_urgency && <p>Urgency: {profile.hiring_urgency}</p>}
            </div>}
            form={<div className="space-y-4">
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Team size</p>
                <PickOne options={["Solo", "2-5", "6-15", "15+"]} value={teamSize || profile.team_size || ""} onChange={setTeamSize} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Missing roles</p>
                <PickMany options={["Engineering", "Design", "Sales", "Marketing", "Operations", "Finance"]}
                  value={missingRoles.length ? missingRoles : profile.missing_roles || []} onChange={setMissingRoles} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Hiring urgency</p>
                <PickOne options={["Exploring", "Active", "Critical"]} value={hiringUrgency || profile.hiring_urgency || ""} onChange={setHiringUrgency} /></div>
            </div>}
            onSave={() => patchMutation.mutate({ team_size: (teamSize || profile.team_size || undefined) as any, missing_roles: missingRoles.length ? missingRoles : profile.missing_roles || undefined, hiring_urgency: (hiringUrgency || profile.hiring_urgency || undefined) as any })}
            saving={patchMutation.isPending} />

          <ProCard title="Partnership Readiness" unlockLabel="Improve partner matching" isFilled={!!profile.partnership_maturity}
            filledPreview={<div className="space-y-1">
              {profile.partnership_why?.length ? <p>Why: {profile.partnership_why.join(", ")}</p> : null}
              {profile.ideal_partner_type && <p>Type: {profile.ideal_partner_type}</p>}
              {profile.partnership_maturity && <p>Maturity: {profile.partnership_maturity}</p>}
            </div>}
            form={<div className="space-y-4">
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Why partnerships?</p>
                <PickMany options={["Distribution", "Tech", "Credibility", "Sales", "Other"]}
                  value={partnershipWhy.length ? partnershipWhy : profile.partnership_why || []} onChange={setPartnershipWhy} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Ideal partner type</p>
                <PickOne options={["Startup", "Enterprise", "Agency", "Creator", "Other"]} value={idealPartnerType || profile.ideal_partner_type || ""} onChange={setIdealPartnerType} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Maturity</p>
                <PickOne options={["Exploring", "Actively closing", "Proven channel"]} value={partnershipMaturity || profile.partnership_maturity || ""} onChange={setPartnershipMaturity} /></div>
            </div>}
            onSave={() => patchMutation.mutate({ partnership_why: partnershipWhy.length ? partnershipWhy : profile.partnership_why || undefined, ideal_partner_type: idealPartnerType || profile.ideal_partner_type || undefined, partnership_maturity: partnershipMaturity || profile.partnership_maturity || undefined })}
            saving={patchMutation.isPending} />

          <ProCard title="Fundraising Intel" unlockLabel="Improve investor matching" isFilled={!!profile.round_type}
            filledPreview={<div className="space-y-1">
              {profile.round_type && <p>Round: {profile.round_type}</p>}
              {profile.investor_warmth?.length ? <p>Targets: {profile.investor_warmth.join(", ")}</p> : null}
            </div>}
            form={<div className="space-y-4">
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Round type</p>
                <PickOne options={["Pre-seed", "Seed", "Angel", "Strategic", "Other"]} value={roundType || profile.round_type || ""} onChange={setRoundType} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Investor types</p>
                <PickMany options={["Angels", "VCs", "Strategic investors", "Operators"]}
                  value={investorWarmth.length ? investorWarmth : profile.investor_warmth || []} onChange={setInvestorWarmth} /></div>
            </div>}
            onSave={() => patchMutation.mutate({ round_type: roundType || profile.round_type || undefined, investor_warmth: investorWarmth.length ? investorWarmth : profile.investor_warmth || undefined })}
            saving={patchMutation.isPending} />

          <ProCard title="Constraints" unlockLabel="Improve match precision" isFilled={!!profile.geography}
            filledPreview={<div className="space-y-1">
              {profile.geography && <p>Geography: {profile.geography}</p>}
              {profile.speed_preference && <p>Speed: {profile.speed_preference}</p>}
              {profile.risk_appetite && <p>Risk: {profile.risk_appetite}</p>}
            </div>}
            form={<div className="space-y-4">
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Geography focus</p>
                <PickOne options={["Global", "India", "Southeast Asia", "US", "Europe"]} value={geography || profile.geography || ""} onChange={setGeography} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Intro preference</p>
                <PickOne options={["Fast intros", "Curated slow intros"]} value={speedPreference || profile.speed_preference || ""} onChange={setSpeedPreference} /></div>
              <div className="space-y-1.5"><p className="text-xs text-white/35 uppercase tracking-wider">Risk appetite</p>
                <PickOne options={["Low", "Medium", "High"]} value={riskAppetite || profile.risk_appetite || ""} onChange={setRiskAppetite} /></div>
            </div>}
            onSave={() => patchMutation.mutate({ geography: geography || profile.geography || undefined, speed_preference: speedPreference || profile.speed_preference || undefined, risk_appetite: riskAppetite || profile.risk_appetite || undefined })}
            saving={patchMutation.isPending} />

          <ProCard title="Credibility" unlockLabel="Build trust with matches" isFilled={!!profile.linkedin_url || !!profile.deck_link}
            filledPreview={<div className="space-y-1">
              {profile.existing_backers && <p>Backers: {profile.existing_backers}</p>}
              {profile.notable_customers && <p>Customers: {profile.notable_customers}</p>}
              {profile.website && <p>Website: {profile.website}</p>}
            </div>}
            form={<div className="space-y-3">
              <TextInput label="Existing backers" value={existingBackers || profile.existing_backers || ""} onChange={setExistingBackers} placeholder="YC W24, Angel list" />
              <TextInput label="Notable customers" value={notableCustomers || profile.notable_customers || ""} onChange={setNotableCustomers} placeholder="HDFC, Swiggy, OYO" />
              <TextInput label="Deck link" value={deckLink || profile.deck_link || ""} onChange={setDeckLink} placeholder="https://docsend.com/..." />
              <TextInput label="Website" value={websiteExtra || profile.website || ""} onChange={setWebsiteExtra} placeholder="https://yourco.com" />
              <TextInput label="LinkedIn URL" value={linkedinUrlExtra || profile.linkedin_url || ""} onChange={setLinkedinUrlExtra} placeholder="https://linkedin.com/in/..." />
            </div>}
            onSave={() => patchMutation.mutate({ existing_backers: existingBackers || profile.existing_backers || undefined, notable_customers: notableCustomers || profile.notable_customers || undefined, deck_link: deckLink || profile.deck_link || undefined, website: websiteExtra || profile.website || undefined, linkedin_url: linkedinUrlExtra || profile.linkedin_url || undefined })}
            saving={patchMutation.isPending} />

          {/* ── Activity ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                Investor Interest {connections && connections.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{connections.length}</span>
                )}
              </h2>
              {(!connections || connections.length === 0) ? (
                <p className="text-white/25 text-sm">Investor interest requests will appear here once your profile is approved.</p>
              ) : (
                <div className="space-y-3">
                  {connections.map((c: any) => (
                    <div key={c.id} className="border border-white/8 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white/80 text-sm font-medium">{c.investor?.name ?? "Investor"}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 capitalize">{c.status}</span>
                      </div>
                      {c.investor?.firm_name && <p className="text-white/40 text-xs">{c.investor.firm_name} · {c.investor.investor_type} · {c.investor.check_size}</p>}
                      {c.message && <p className="text-white/50 text-xs italic">"{c.message}"</p>}
                      <p className="text-white/25 text-xs">Our team will facilitate this intro.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Matches</h2>
              <p className="text-white/25 text-sm">Coming soon — we're curating based on your profile.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { session, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const { data: connections } = useQuery<any[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const r = await fetch("/api/connections", { headers: authHeaders() });
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!session,
  });

  const { data: profile, isLoading, isFetched } = useQuery<StartupProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile", { headers: authHeaders() });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("Failed to fetch profile");
      return r.json();
    },
    enabled: !!session,
  });

  const { data: partnerProfile, isLoading: partnerLoading, isFetched: partnerFetched } = useQuery<PartnerProfile | null>({
    queryKey: ["partner-profile"],
    queryFn: async () => {
      if (!session) return null;
      const r = await fetch("/api/partner", { headers: authHeaders() });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("Failed to fetch partner profile");
      return r.json();
    },
    enabled: !!session,
  });

  const { data: individualProfile, isLoading: individualLoading, isFetched: individualFetched } = useQuery<IndividualProfile | null>({
    queryKey: ["individual-profile"],
    queryFn: async () => {
      if (!session) return null;
      const r = await fetch("/api/individual", { headers: authHeaders() });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("Failed to fetch individual profile");
      return r.json();
    },
    enabled: !!session,
  });

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<StartupProfile>) =>
      fetch("/api/profile", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  async function signOut() {
    qc.clear();
    await logout();
    setLocation("/");
  }

  const anyLoading = isLoading || partnerLoading || individualLoading;
  const startupReady = !session || isFetched;
  const partnerReady = !session || partnerFetched;
  const individualReady = !session || individualFetched;

  if (authLoading || anyLoading || !startupReady || !partnerReady || !individualReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  const allFetched = (!session) || (isFetched && partnerFetched && individualFetched);
  if (session && allFetched && !profile && !partnerProfile && !individualProfile) {
    // Redirect to home page which shows the role selection modal (Startup / Partner / Individual)
    setLocation("/");
    return null;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Startup dashboard view
  if (profile) {
    return <StartupDashboard profile={profile} session={session} signOut={signOut} patchMutation={patchMutation} connections={connections ?? []} greeting={greeting} />;
  }

  // ── Individual dashboard view
  if (individualProfile) {
    const firstName = (individualProfile.full_name || "").split(" ")[0] || "there";
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
              <span className="font-semibold tracking-tight">Prodizzy</span>
            </div>
            <button onClick={signOut} className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors text-sm">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
            <p className="text-white/35 mt-1 text-sm">{individualProfile.profile_type} · {individualProfile.location || "Location not set"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Overview</h2>
              <p className="text-white/40 text-sm">We&apos;re rolling out tailored opportunities for individuals — roles, gigs, and collaborations based on your profile.</p>
              {individualProfile.looking_for?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/35 uppercase tracking-wider">You&apos;re looking for</p>
                  <div className="flex flex-wrap gap-2">{individualProfile.looking_for.map((g: string) => <Tag key={g} label={g} />)}</div>
                </div>
              )}
            </div>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Profile snapshot</h2>
              {individualProfile.skills?.length > 0 && (
                <div className="space-y-1.5 text-sm">
                  <p className="text-xs text-white/35 uppercase tracking-wider">Skills</p>
                  <p className="text-white/70">{individualProfile.skills.join(", ")}</p>
                </div>
              )}
              {individualProfile.experience_level && (
                <div className="space-y-1.5 text-sm">
                  <p className="text-xs text-white/35 uppercase tracking-wider">Experience</p>
                  <p className="text-white/70">{individualProfile.experience_level}</p>
                </div>
              )}
              {(individualProfile.availability || individualProfile.work_mode) && (
                <div className="space-y-1.5 text-sm">
                  <p className="text-xs text-white/35 uppercase tracking-wider">Availability</p>
                  <p className="text-white/70">{individualProfile.availability || "—"} {individualProfile.work_mode && `· ${individualProfile.work_mode}`}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Partner dashboard view
  if (partnerProfile) {
    const firstName = (partnerProfile.full_name || "").split(" ")[0] || "there";
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
              <span className="font-semibold tracking-tight">Prodizzy</span>
            </div>
            <button onClick={signOut} className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors text-sm">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
            <p className="text-white/35 mt-1 text-sm">{partnerProfile.partner_type} · {partnerProfile.company_name}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Your Partner Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {partnerProfile.services_offered?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Services</p>
                  <p className="text-white/70">{partnerProfile.services_offered.join(", ")}</p>
                </div>
              )}
              {partnerProfile.industries_served?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Industries</p>
                  <p className="text-white/70">{partnerProfile.industries_served.join(", ")}</p>
                </div>
              )}
              {partnerProfile.stages_served?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Stages</p>
                  <p className="text-white/70">{partnerProfile.stages_served.join(", ")}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Contact</p>
                <p className="text-white/70">{partnerProfile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
    </div>
  );
}
