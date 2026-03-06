import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import type { StartupProfile, PartnerProfile, IndividualProfile } from "@shared/schema";
import { LogOut, ChevronRight, Check, Edit2, X, Mail, Phone, Linkedin, Globe, Github, FileText, MapPin, Briefcase } from "lucide-react";

function authHeaders() {
  return { "Content-Type": "application/json" };
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

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5 flex-1">
      <p className="text-[10px] text-white/25 uppercase tracking-wider ml-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
      />
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


// ─── Startup Dashboard as a proper component ────────────────────────────────────
const INDUSTRY_OPTIONS = ["Software & AI", "Fintech", "Healthtech", "Edtech", "D2C / Consumer", "SaaS", "Deeptech", "Climate", "Other"];
const STAGE_OPTIONS = [
  "Pre-Seed (Ideation Stage)",
  "Seed (MVP & Early traction)",
  "Series A (Generating Revenue)",
  "Series B/C/D (Expansion & Scaling)",
  "MNC (Global)"
];
const TEAM_SIZE_OPTIONS = ["Solo", "2–10", "11–50", "51–500", "500–1000", "1000+"];
const IS_REGISTERED_OPTIONS = ["Yes", "No"];

function StartupDashboard({ profile, session, signOut, patchMutation, connections, greeting, acceptMutation, declineMutation }: {
  profile: StartupProfile; session: any; signOut: () => void;
  patchMutation: any; connections: any[]; greeting: string;
  acceptMutation: any; declineMutation: any;
}) {
  const [editingCore, setEditingCore] = useState(false);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Core profile edit state (pre-fill from profile)
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [role, setRole] = useState(profile.role || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [location, setLocation] = useState(profile.location || "");
  const [industry, setIndustry] = useState<string[]>(Array.isArray(profile.industry) ? profile.industry : profile.industry ? [profile.industry] : []);
  const [customIndustry, setCustomIndustry] = useState("");
  const [stage, setStage] = useState<string>(profile.stage || "");
  const [teamSize, setTeamSize] = useState<string>(profile.team_size || "");
  const [isRegistered, setIsRegistered] = useState<string>(profile.is_registered || "");
  const [productDescription, setProductDescription] = useState(profile.product_description || "");
  const [problemSolved, setProblemSolved] = useState(profile.problem_solved || "");
  const [targetAudience, setTargetAudience] = useState(profile.target_audience || "");
  const [numUsers, setNumUsers] = useState(profile.num_users || "");
  const [monthlyRevenue, setMonthlyRevenue] = useState(profile.monthly_revenue || "");
  const [tractionHighlights, setTractionHighlights] = useState(profile.traction_highlights || "");


  function saveCore() {
    const finalIndustry = industry.includes("Other") && customIndustry.trim()
      ? [...industry.filter(i => i !== "Other"), customIndustry]
      : industry;

    patchMutation.mutate({
      company_name: companyName,
      full_name: fullName,
      role,
      email,
      phone,
      website,
      linkedin_url: linkedinUrl,
      location,
      industry: finalIndustry,
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

        <div className="flex flex-col gap-5">
          {/* ── Main startup profile card ──────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
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
                    setEmail(profile.email || "");
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
                      <p className="text-xs text-white/60 truncate" title={profile.email}>{profile.email}</p>
                      <p className="text-xs text-white/60 truncate mt-0.5">{profile.phone}</p>
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
                    <FormField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Prodizzy" />
                    <FormField label="Your Full Name" value={fullName} onChange={setFullName} placeholder="Jane Smith" />
                    <FormField label="Your Role" value={role} onChange={setRole} placeholder="Co-founder & CEO" />
                    <FormField label="Email" value={email} onChange={setEmail} type="email" placeholder="jane@prodizzy.com" />
                    <FormField label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
                    <FormField label="Website" value={website} onChange={setWebsite} placeholder="https://yourco.com" />
                    <FormField label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
                    <FormField label="Location" value={location} onChange={setLocation} placeholder="Delhi, India" />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/35 uppercase tracking-wider">Industry</p>
                      <PickMany options={INDUSTRY_OPTIONS} value={industry} onChange={(v) => setIndustry(v)} />
                    </div>
                    {industry.includes("Other") && (
                      <FormField label="Custom Industry" value={customIndustry} onChange={setCustomIndustry} placeholder="Your industry..." />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/35 uppercase tracking-wider">Stage</p>
                    <PickOne options={STAGE_OPTIONS} value={stage} onChange={(v) => setStage(v)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/35 uppercase tracking-wider">Team Size</p>
                      <PickOne options={TEAM_SIZE_OPTIONS} value={teamSize} onChange={(v) => setTeamSize(v)} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/35 uppercase tracking-wider">Registered Company?</p>
                      <PickOne options={IS_REGISTERED_OPTIONS} value={isRegistered} onChange={(v) => setIsRegistered(v)} />
                    </div>
                  </div>

                  <TextArea label="Product Description" value={productDescription} onChange={setProductDescription} placeholder="What does your product do?" />
                  <TextArea label="Problem Solved" value={problemSolved} onChange={setProblemSolved} placeholder="What specific problem are you addressing?" />
                  <FormField label="Target Audience" value={targetAudience} onChange={setTargetAudience} placeholder="SMBs, Students, D2C brands..." />
                  <TextArea label="Traction Highlights" value={tractionHighlights} onChange={setTractionHighlights} placeholder="Key milestones, partnerships, press..." />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Number of Users" value={numUsers} onChange={setNumUsers} placeholder="500 beta users" />
                    <FormField label="Monthly Revenue" value={monthlyRevenue} onChange={setMonthlyRevenue} placeholder="₹2L MRR" />
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


          {/* ── Connection Requests ──────────────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Connection Requests</h2>
            {connections && connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((conn: any) => (
                  <div key={conn.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{conn.investor?.firm_name || "Investor"}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            conn.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
                            conn.status === 'declined' ? 'bg-red-500/15 text-red-400' :
                            'bg-yellow-500/15 text-yellow-400'
                          }`}>
                            {conn.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 mb-1">{conn.investor?.investor_type} • {conn.investor?.check_size}</p>
                        {conn.message && (
                          <p className="text-sm text-white/70 italic mt-2">"{conn.message}"</p>
                        )}
                        {conn.status === 'accepted' && conn.investor?.email && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs text-green-400 font-medium mb-1">Contact Information:</p>
                            <p className="text-sm text-white/90">{conn.investor.email}</p>
                            {conn.investor.full_name && <p className="text-sm text-white/70">{conn.investor.full_name}</p>}
                          </div>
                        )}
                      </div>
                      {conn.status === 'pending' && !conn.startup_accepted && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptMutation.mutate(conn.id)}
                            disabled={acceptMutation.isPending}
                            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm rounded-lg transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineMutation.mutate(conn.id)}
                            disabled={declineMutation.isPending}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {conn.status === 'pending' && conn.startup_accepted && (
                        <div className="text-sm text-white/50">Waiting for investor...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-sm">No connection requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual Dashboard component ──────────────────────────────────────────
function IndividualDashboard({ profile, session, signOut, patchMutation, connections, greeting }: {
  profile: IndividualProfile; session: any; signOut: () => void;
  patchMutation: any; connections: any[]; greeting: string;
}) {
  const [editingCore, setEditingCore] = useState(false);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Form state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || "");
  const [profileType, setProfileType] = useState<"Student" | "Freelancer" | "Professional" | "Content Creator" | "Community Admin">(profile.profile_type as any);
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "");
  const [toolsUsed, setToolsUsed] = useState(profile.tools_used || "");
  const [lookingFor, setLookingFor] = useState(profile.looking_for?.[0] || "");
  const [preferredRoles, setPreferredRoles] = useState(profile.preferred_roles || "");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>(profile.preferred_industries?.split(", ") || []);
  const [availability, setAvailability] = useState(profile.availability || "");
  const [workMode, setWorkMode] = useState(profile.work_mode || "");
  const [expectedPay, setExpectedPay] = useState(profile.expected_pay || "");
  const [location, setLocation] = useState(profile.location || "");
  const [resumeUrl, setResumeUrl] = useState(profile.resume_url || "");
  const [projects, setProjects] = useState(profile.projects || "");
  const [achievements, setAchievements] = useState(profile.achievements || "");
  const [githubUrl, setGithubUrl] = useState(profile.github_url || "");

  // Constants
  const PROFILE_TYPES = ["Student", "Freelancer", "Professional", "Content Creator", "Community Admin"];
  const EXPERIENCE_LEVELS = ["Fresher", "0-2 years", "2-4 years", "4+ years"];
  const LOOKING_FOR_OPTIONS = ["Job", "Internship", "Freelance", "Collaboration"];
  const AVAILABILITY_OPTIONS = ["Full-time", "Part-time", "Project-based"];
  const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "Onsite"];

  function saveCore() {
    patchMutation.mutate({
      full_name: fullName,
      email,
      phone,
      location,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      resume_url: resumeUrl,
      profile_type: profileType,
      preferred_roles: preferredRoles,
      experience_level: experienceLevel,
      looking_for: lookingFor ? [lookingFor] : [],
      availability,
      work_mode: workMode,
      expected_pay: expectedPay,
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
          <p className="text-white/35 mt-1 text-sm">{profile.profile_type} · {profile.experience_level}</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Individual Profile</h2>
              <button onClick={() => setEditingCore(!editingCore)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs">
                {editingCore ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!editingCore ? (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                      {profile.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">{profile.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/45 text-sm">
                        <span>{profile.profile_type}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{profile.experience_level}</span>
                        {profile.location && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{profile.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Column 1 */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Contact & Progress</h3>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-3.5 h-3.5 text-white/30" />
                            <span className="text-white/70">{profile.email}</span>
                          </div>
                          {profile.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-3.5 h-3.5 text-white/30" />
                              <span className="text-white/70">{profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <Linkedin className="w-3.5 h-3.5 text-white/30" />
                            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn Profile &rarr;</a>
                          </div>
                          {profile.portfolio_url && (
                            <div className="flex items-center gap-3 text-sm">
                              <Globe className="w-3.5 h-3.5 text-white/30" />
                              <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-white/70 hover:underline truncate">{profile.portfolio_url.replace(/^https?:\/\//, "")}</a>
                            </div>
                          )}
                          {profile.resume_url && (
                            <div className="flex items-center gap-3 text-sm">
                              <FileText className="w-3.5 h-3.5 text-white/30" />
                              <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline transition-colors uppercase text-[10px] font-bold tracking-wider">View Resume</a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Profile & Expertise</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">You are</p>
                            <p className="text-sm text-white/70">{profile.profile_type}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Role / Services</p>
                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{profile.preferred_roles || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Experience</p>
                            <p className="text-sm text-white/70">{profile.experience_level}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Requirements</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1.5">Looking For</p>
                            <div className="flex flex-wrap gap-1.5">
                              {profile.looking_for && profile.looking_for.length > 0 && (
                                <Tag label={profile.looking_for[0]} color="bg-purple-500/10 text-purple-300 border-purple-500/10" />
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-white/20 uppercase mb-1">Availability</p>
                              <p className="text-sm text-white/70">{profile.availability || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/20 uppercase mb-1">Work Mode</p>
                              <p className="text-sm text-white/70">{profile.work_mode || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-white/20 uppercase mb-1">Location</p>
                              <p className="text-sm text-white/70">{profile.location || "Not specified"}</p>
                            </div>
                            {profile.expected_pay && (
                              <div>
                                <p className="text-[10px] text-white/20 uppercase mb-1">Expected Pay</p>
                                <p className="text-sm text-white/70">{profile.expected_pay}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {/* Section: Basic Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Full Name" value={fullName} onChange={setFullName} />
                      <FormField label="Email" value={email} onChange={setEmail} type="email" />
                      <FormField label="Phone Number" value={phone} onChange={setPhone} />
                      <FormField label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
                      <FormField label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} />
                      <FormField label="Portfolio URL" value={portfolioUrl} onChange={setPortfolioUrl} />
                      <FormField label="Resume URL" value={resumeUrl} onChange={setResumeUrl} />
                    </div>
                  </div>

                  {/* Section: Profile & Expertise */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Individual Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">You are</p>
                        <PickOne options={PROFILE_TYPES} value={profileType} onChange={(v) => setProfileType(v as any)} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">Experience Level</p>
                        <PickOne options={EXPERIENCE_LEVELS} value={experienceLevel} onChange={setExperienceLevel} />
                      </div>
                    </div>
                    <TextArea label="Preferred role / Services you provide" value={preferredRoles} onChange={setPreferredRoles} placeholder="Describe your core expertise..." />
                  </div>

                  {/* Section: Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Requirements</h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">Looking For</p>
                        <PickOne options={LOOKING_FOR_OPTIONS} value={lookingFor} onChange={setLookingFor} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">Availability</p>
                        <PickOne options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">Work Mode</p>
                        <PickOne options={WORK_MODE_OPTIONS} value={workMode} onChange={setWorkMode} />
                      </div>
                      <FormField label="Expected Pay" value={expectedPay} onChange={setExpectedPay} placeholder="$X/hr or $X/year" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/8 flex gap-3">
                    <button onClick={saveCore} disabled={patchMutation.isPending}
                      className="flex items-center gap-2 bg-white text-black text-xs font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50">
                      {patchMutation.isPending ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save Profile</>}
                    </button>
                    <button onClick={() => setEditingCore(false)}
                      className="text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-3">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Matches</h2>
            <p className="text-white/25 text-sm">Coming soon — we're curating based on your profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partner Dashboard component ─────────────────────────────────────────────
function PartnerDashboard({ profile, session, signOut, patchMutation, connections, greeting }: {
  profile: PartnerProfile; session: any; signOut: () => void;
  patchMutation: any; connections: any[]; greeting: string;
}) {
  const [editingCore, setEditingCore] = useState(false);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Form state
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [role, setRole] = useState(profile.role || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [partnerType, setPartnerType] = useState(profile.partner_type || "");
  const [services, setServices] = useState(
    Array.isArray(profile.services_offered)
      ? profile.services_offered.join(", ")
      : (profile.services_offered as string || "")
  );
  const [stages, setStages] = useState<string[]>(profile.stages_served || []);
  const [pricingModel, setPricingModel] = useState(profile.pricing_model || "");
  const [averageDealSize, setAverageDealSize] = useState(profile.average_deal_size || "");
  const [teamSize, setTeamSize] = useState(profile.team_size || "");
  const [yearsExperience, setYearsExperience] = useState(profile.years_experience || "");
  const [workMode, setWorkMode] = useState(profile.work_mode || "");
  const [portfolioLinks, setPortfolioLinks] = useState(profile.portfolio_links || "");
  const [certifications, setCertifications] = useState(profile.certifications || "");
  const [lookingFor, setLookingFor] = useState(profile.looking_for?.[0] || "");
  const [monthlyCapacity, setMonthlyCapacity] = useState(profile.monthly_capacity || "");
  const [preferredBudgetRange, setPreferredBudgetRange] = useState(profile.preferred_budget_range || "");

  const PARTNER_TYPES = ["Agency", "Investor", "Service Provider", "Institutional Firm"];
  const PRICING_MODELS = ["Fixed", "Hourly", "Commission", "Retainer"];
  const TEAM_SIZE_OPTIONS = ["Solo", "2-10", "11-50", "51-200", "200+"];
  const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Expansion", "MNC"];
  const LOOKING_FOR_OPTIONS = ["Clients", "Deal flow", "Partnerships"];

  function saveCore() {
    patchMutation.mutate({
      company_name: companyName,
      role,
      full_name: fullName,
      email,
      phone,
      website,
      linkedin_url: linkedinUrl,
      partner_type: partnerType,
      services_offered: services,
      stages_served: stages,
      pricing_model: pricingModel,
      average_deal_size: averageDealSize,
      team_size: teamSize,
      years_experience: yearsExperience,
      work_mode: workMode,
      portfolio_links: portfolioLinks,
      certifications: certifications,
      looking_for: lookingFor ? [lookingFor] : [],
      monthly_capacity: monthlyCapacity,
      preferred_budget_range: preferredBudgetRange
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
          <p className="text-white/35 mt-1 text-sm">{profile.company_name} · {profile.partner_type}</p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Partner Profile</h2>
              <button onClick={() => setEditingCore(!editingCore)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs">
                {editingCore ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!editingCore ? (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-white">{profile.company_name}</h2>
                      <p className="text-white/45 text-sm mt-1">{profile.partner_type}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-medium border border-white/10 text-xs">
                        {profile.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm leading-tight">{profile.full_name}</p>
                        <p className="text-white/40 text-[11px] uppercase tracking-wider mt-0.5">{profile.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Column 1 */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Contact & Links</h3>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-3.5 h-3.5 text-white/30" />
                            <span className="text-white/70">{profile.email}</span>
                          </div>
                          {profile.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-3.5 h-3.5 text-white/30" />
                              <span className="text-white/70">{profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <Linkedin className="w-3.5 h-3.5 text-white/30" />
                            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn Profile &rarr;</a>
                          </div>
                          {profile.website && (
                            <div className="flex items-center gap-3 text-sm">
                              <Globe className="w-3.5 h-3.5 text-white/30" />
                              <a href={profile.website} target="_blank" rel="noreferrer" className="text-white/70 hover:underline truncate">{profile.website.replace(/^https?:\/\//, "")}</a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Expertise</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1.5">Services Offered</p>
                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{profile.services_offered || "Not specified"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Operations</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Company Type</p>
                            <p className="text-sm text-white/70">{profile.partner_type || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Team Size</p>
                            <p className="text-sm text-white/70">{profile.team_size || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Experience</p>
                            <p className="text-sm text-white/70">{profile.years_experience || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Work Mode</p>
                            <p className="text-sm text-white/70">{profile.work_mode || "Not specified"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Requirements</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Pricing Model</p>
                            <p className="text-sm text-white/70">{profile.pricing_model || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Avg Deal Size</p>
                            <p className="text-sm text-white/70">{profile.average_deal_size || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Preferred Budget</p>
                            <p className="text-sm text-white/70">{profile.preferred_budget_range || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1">Monthly Capacity</p>
                            <p className="text-sm text-white/70">{profile.monthly_capacity || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-[10px] text-white/20 uppercase mb-1.5">Looking For</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.looking_for && profile.looking_for.length > 0 && <Tag label={profile.looking_for[0]} color="bg-purple-500/10 text-purple-300 border-purple-500/10" />}
                          </div>
                        </div>
                      </div>

                      {profile.portfolio_links && (
                        <div className="space-y-3 pt-2">
                          <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Portfolio</h3>
                          <div className="text-xs text-white/60">
                            <p className="leading-relaxed break-words">{profile.portfolio_links}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {/* Section: Basic Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Company Name" value={companyName} onChange={setCompanyName} />
                      <FormField label="Full Name" value={fullName} onChange={setFullName} />
                      <FormField label="Role" value={role} onChange={setRole} />
                      <FormField label="Email" value={email} onChange={setEmail} type="email" />
                      <FormField label="Phone" value={phone} onChange={setPhone} />
                      <FormField label="Website" value={website} onChange={setWebsite} />
                      <FormField label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
                    </div>
                  </div>

                  {/* Section: Partner Info */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Partner Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Partner Type</p>
                          <PickOne options={PARTNER_TYPES} value={partnerType} onChange={(v) => setPartnerType(v as any)} />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Work Mode</p>
                          <PickOne options={["Remote", "Hybrid", "Onsite"]} value={workMode} onChange={setWorkMode} />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Team Size</p>
                          <PickOne options={TEAM_SIZE_OPTIONS} value={teamSize} onChange={setTeamSize} />
                        </div>
                        <FormField label="Years Experience" value={yearsExperience} onChange={setYearsExperience} />
                      </div>

                      <TextArea label="What services do you offer?" value={services} onChange={setServices} placeholder="Describe the specific services and value you provide..." />

                      <FormField label="Portfolio Links" value={portfolioLinks} onChange={setPortfolioLinks} placeholder="https://..." />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Requirements</h3>
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/35 uppercase tracking-wider">What are you looking for?</p>
                        <PickOne options={LOOKING_FOR_OPTIONS} value={lookingFor} onChange={setLookingFor} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Pricing Model</p>
                          <PickOne options={PRICING_MODELS} value={pricingModel} onChange={setPricingModel} />
                        </div>
                        <FormField label="Average Deal Size" value={averageDealSize} onChange={setAverageDealSize} placeholder="e.g. $5k" />
                        <FormField label="Preferred Budget Range" value={preferredBudgetRange} onChange={setPreferredBudgetRange} placeholder="e.g. $10k+" />
                        <FormField label="Monthly Capacity" value={monthlyCapacity} onChange={setMonthlyCapacity} placeholder="e.g. 2 new slots" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/8 flex gap-3">
                    <button onClick={saveCore} className="bg-white text-black text-xs font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all active:scale-95">
                      Save changes
                    </button>
                    <button onClick={() => setEditingCore(false)} className="text-xs font-medium text-white/40 hover:text-white/70 transition-colors px-4 py-3">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Matches</h2>
            <p className="text-white/25 text-sm">Coming soon — we're curating based on your profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Investor Dashboard component ────────────────────────────────────────────
function InvestorDashboard({ profile, session, signOut, connections, matches, greeting }: {
  profile: any; session: any; signOut: () => void;
  connections: any[]; matches: any[]; greeting: string;
}) {
  const [, setLocation] = useLocation();
  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">Prodizzy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/discover')}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Discover Startups
            </button>
            <button onClick={signOut} className="text-white/50 hover:text-white/80 text-sm flex items-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{greeting}, {firstName} 👋</h1>
            <p className="text-white/50">Here are your recommended startup matches</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{profile.firm_name || profile.full_name}</h2>
                <p className="text-white/50 text-sm">{profile.investor_type} • {profile.check_size}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wider mb-1">Sectors</p>
                <div className="flex flex-wrap gap-2">
                  {profile.sectors?.map((s: string) => <Tag key={s} label={s} />)}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wider mb-1">Stages</p>
                <div className="flex flex-wrap gap-2">
                  {profile.stages?.map((s: string) => <Tag key={s} label={s} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Matches */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Recommended Matches</h2>
            {matches && matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((startup: any) => (
                  <div key={startup.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium">{startup.company_name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                            {startup.match_score}% match
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {startup.industry?.map((ind: string) => <Tag key={ind} label={ind} />)}
                          <Tag label={startup.stage} />
                        </div>
                        <p className="text-sm text-white/70 mb-2">{startup.product_description}</p>
                        <p className="text-xs text-white/50">📍 {startup.location}</p>
                        {startup.monthly_revenue && <p className="text-xs text-white/50 mt-1">💰 Revenue: {startup.monthly_revenue}</p>}
                      </div>
                      <button
                        onClick={() => setLocation('/discover')}
                        className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
                      >
                        View & Express Interest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-sm">No matches yet. We're curating startups based on your preferences.</p>
            )}
          </div>

          {/* My Connections */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">My Connections</h2>
            {connections && connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((conn: any) => (
                  <div key={conn.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{conn.startup?.company_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            conn.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
                            conn.status === 'declined' ? 'bg-red-500/15 text-red-400' :
                            'bg-yellow-500/15 text-yellow-400'
                          }`}>
                            {conn.status}
                          </span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {conn.startup?.industry && <Tag label={Array.isArray(conn.startup.industry) ? conn.startup.industry[0] : conn.startup.industry} />}
                          {conn.startup?.stage && <Tag label={conn.startup.stage} />}
                        </div>
                        {conn.message && (
                          <p className="text-sm text-white/70 italic mt-2">Your message: "{conn.message}"</p>
                        )}
                        {conn.status === 'accepted' && conn.startup?.email && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs text-green-400 font-medium mb-1">Contact Information:</p>
                            <p className="text-sm text-white/90">{conn.startup.email}</p>
                            {conn.startup.full_name && <p className="text-sm text-white/70">{conn.startup.full_name}</p>}
                            {conn.startup.linkedin_url && (
                              <a href={conn.startup.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                <Linkedin className="w-3 h-3" />
                                LinkedIn
                              </a>
                            )}
                            {conn.startup.website && (
                              <a href={conn.startup.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                <Globe className="w-3 h-3" />
                                Website
                              </a>
                            )}
                          </div>
                        )}
                        {conn.status === 'pending' && (
                          <p className="text-sm text-white/50 mt-2">Waiting for startup to respond...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/25 text-sm mb-4">No connections yet.</p>
                <button
                  onClick={() => setLocation('/discover')}
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Browse Startups
                </button>
              </div>
            )}
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

  const { data: profile, isLoading, isFetched } = useQuery<any | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile", { headers: authHeaders() });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("Failed to fetch profile");
      return r.json();
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const patchMutation = useMutation({
    mutationFn: (patch: any) =>
      fetch("/api/profile", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      }).then(r => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) =>
      fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'accepted' })
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] })
  });

  const declineMutation = useMutation({
    mutationFn: (connectionId: string) =>
      fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'declined' })
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connections'] })
  });

  const isInvestorProfile = profile?.type === 'investor' || (profile?.type === 'partner' && profile?.partner_type === 'Investor');
  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const r = await fetch('/api/matches?limit=10', { headers: authHeaders() });
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!session && !!isInvestorProfile
  });

  async function signOut() {
    qc.clear();
    await logout();
    setLocation("/");
  }

  if (authLoading || (isLoading && !profile)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (session && isFetched && !profile) {
    setLocation("/");
    return null;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (profile.type === "startup") {
    return <StartupDashboard profile={profile} session={session} signOut={signOut} patchMutation={patchMutation} connections={connections ?? []} greeting={greeting} acceptMutation={acceptMutation} declineMutation={declineMutation} />;
  }

  // Show Investor dashboard for both dedicated investor profile and partner who selected "Investor" as partner type
  if (profile.type === "investor" || (profile.type === "partner" && profile.partner_type === "Investor")) {
    const investorProfileShape = profile.type === "investor"
      ? profile
      : {
          ...profile,
          firm_name: profile.company_name || profile.firm_name,
          investor_type: profile.partner_type || "Investor",
          check_size: profile.check_size || "Not specified",
          sectors: profile.sectors ?? [],
          stages: profile.stages ?? [],
        };
    return <InvestorDashboard profile={investorProfileShape} session={session} signOut={signOut} connections={connections ?? []} matches={matches ?? []} greeting={greeting} />;
  }

  if (profile.type === "individual") {
    return <IndividualDashboard profile={profile} session={session} signOut={signOut} patchMutation={patchMutation} connections={connections ?? []} greeting={greeting} />;
  }

  if (profile.type === "partner") {
    return <PartnerDashboard profile={profile} session={session} signOut={signOut} patchMutation={patchMutation} connections={connections ?? []} greeting={greeting} />;
  }

  return null;
}
