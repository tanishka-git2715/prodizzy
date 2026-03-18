import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import type { StartupProfile, PartnerProfile, IndividualProfile } from "@shared/schema";
import { LogOut, ChevronRight, Check, Edit2, X, Mail, Linkedin, Globe, Github, FileText, MapPin, Briefcase, Plus, Camera } from "lucide-react";
import { ensureHttps } from "@/lib/utils";
import { BusinessCard } from "@/components/business/BusinessCard";
import { ProfileDetailView } from "@/components/ProfileDetailView";

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

function FormField({ label, value, onChange, placeholder, type = "text", className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className || "flex-1"}`}>
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
  const [, navigate] = useLocation();

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const response = await fetch("/api/business", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch businesses");
      return response.json();
    }
  });

  // Core profile edit state (pre-fill from profile)
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [role, setRole] = useState(profile.role || "");
  const [email, setEmail] = useState(profile.email || "");
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
  const [profilePhoto, setProfilePhoto] = useState(profile.profile_photo || "");

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChangeImmediate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePhoto(base64);
        patchMutation.mutate({ profile_photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };


  function saveCore() {
    const finalIndustry = industry.includes("Other") && customIndustry.trim()
      ? [...industry.filter(i => i !== "Other"), customIndustry]
      : industry;

    patchMutation.mutate({
      company_name: companyName,
      full_name: fullName,
      role,
      email,
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
      profile_photo: profilePhoto,
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
                      <div className="relative group w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-medium border border-white/10 text-xs overflow-hidden">
                        {profile.profile_photo ? (
                          <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          profile.full_name?.[0]?.toUpperCase() || profile.company_name?.[0]?.toUpperCase()
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-4 h-4 text-white/70" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChangeImmediate} />
                        </label>
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
                    </div>
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">LinkedIn</p>
                      <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate block">Profile &rarr;</a>
                    </div>
                    {profile.website && (
                      <div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Website</p>
                        <a href={ensureHttps(profile.website)} target="_blank" rel="noreferrer" className="text-xs text-white/60 hover:underline truncate block">{profile.website.replace(/^https?:\/\//, "")}</a>
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
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

          {/* ── Your Businesses ────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Your Businesses</h2>
              <button
                onClick={() => navigate("/business/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Business
              </button>
            </div>

            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((business: any) => (
                  <BusinessCard
                    key={business._id}
                    business={business}
                    onClick={() => navigate(`/business/${business._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div>
                  <p className="text-white/50 text-sm">No businesses yet</p>
                  <p className="text-white/25 text-xs mt-1">Create a business profile to manage campaigns and team members</p>
                </div>
              </div>
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
  // Constants
  const ROLE_OPTIONS = ["Founder", "Investor", "Student", "Working Professional", "Freelancer / Service Provider", "Consultant / Mentor / Advisor", "Content Creator / Community Admin", "Other (Specify)"];
  const FOUNDER_STATUS_OPTIONS = ["Pre-Seed (Ideation Stage)", "Seed (MVP & Early Traction)", "Series A (Generating Revenue)", "Series B/C/D (Expansion & Scaling)", "MNC (Global)"];
  const INVESTOR_TYPE_OPTIONS = ["Angel Investor", "Venture Capital Professional", "Investment Scout", "Syndicate Lead / Member", "Family Office Representative", "Corporate Investor", "Other (Specify)"];
  const INVESTOR_STAGE_OPTIONS = ["Pre-Seed (Ideation Stage)", "Seed (MVP & Early Traction)", "Series A (Generating Revenue)", "Series B/C/D (Expansion & Scaling)", "MNC (Global)"];
  const TICKET_SIZE_OPTIONS = ["Below ₹10 Lakhs", "₹10–50 Lakhs", "₹50 Lakhs – ₹1 Crore", "₹1 Crore+", "Depends on startup"];
  const INDUSTRY_OPTIONS = ["Software & AI", "E-commerce & Retail", "Finance & Payments", "Healthcare & Wellness", "Education & Training", "Food & Beverage", "Transportation & Delivery", "Real Estate & Construction", "Marketing & Advertising", "Energy & Sustainability", "Other (Specify)"];
  const GEO_OPTIONS = ["India", "Global", "Specific Regions (Specify)"];
  const STUDY_YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Postgraduate", "Recent Graduate"];
  const EXP_OPTIONS = ["0–2 years", "2–4 years", "4–8 years", "8+ years"];
  const FREELANCE_EXP_OPTIONS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];
  const ENGAGEMENT_OPTIONS = ["Hourly", "Project-based", "Monthly Retainer", "Equity-based (for startups)"];
  const BUDGET_RANGE_OPTIONS = ["Below ₹10K", "₹10K–50K", "₹50K–2L", "₹2L+", "Depends on scope"];
  const EXPERTISE_OPTIONS = ["Business Strategy", "Growth & Marketing", "Fundraising & Investor Readiness", "Operations & Scaling", "Finance & Startup Metrics", "Career Guidance / Leadership Coaching", "Technology / AI Advisory", "Community & Ecosystem Building", "Other (Specify)"];
  const CONSULTANT_EXP_OPTIONS = ["5–10 years", "10–15 years", "15–20 years", "20+ years"];
  const SUPPORT_TYPE_OPTIONS = ["Paid consulting sessions", "Mentorship / coaching", "Project-based advisory", "Long-term strategic advisory", "Equity-based startup advisory", "Other (Specify)"];
  const PLATFORM_OPTIONS = ["Instagram", "YouTube", "LinkedIn", "X (Twitter)", "WhatsApp Community", "Telegram", "Discord", "Newsletter / Blog", "Podcast", "Other (Specify)"];
  const AUDIENCE_SIZE_OPTIONS = ["Below 1K", "1K – 10K", "10K – 50K", "50K – 1L", "1L+"];
  const NICHE_OPTIONS = ["Technology / Web3 / AI", "Startups & Business", "Finance & Investing", "Education & Careers", "Productivity", "Marketing & Growth", "Design & Creativity", "Lifestyle", "Gaming", "Entertainment", "Student Community", "Founder Community", "Other (Specify)"];
  const SKILL_OPTIONS = ["Software development", "AI & Automation", "Branding & Marketing", "UI/UX & Graphic Designing", "Content Creation & Copywriting", "Video editing", "Research & Data Analytics", "Finance & Trading", "Product & Operations", "Community & Event Management", "Other (Specify)"];
  const AVAILABILITY_OPTIONS = ["Full-time", "Part-time", "Nights & Weekends", "Project-based"];
  const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "On-site", "Flexible"];

  const [, setLocation] = useLocation();
  const [editingCore, setEditingCore] = useState(false);
  const firstName = profile.full_name?.split(" ")[0] || "there";
  const [, navigate] = useLocation();

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const response = await fetch("/api/business", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch businesses");
      return response.json();
    }
  });

  // Form state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [dob, setDob] = useState((profile as any).dob || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || "");
  const [roles, setRoles] = useState<string[]>(Array.isArray((profile as any).roles) ? (profile as any).roles : []);
  const [profilePhoto, setProfilePhoto] = useState(profile.profile_photo || "");

  // Role-specific states
  const [investorData, setInvestorData] = useState((profile as any).investor_data || {});
  const [studentData, setStudentData] = useState((profile as any).student_data || {});
  const [professionalData, setProfessionalData] = useState((profile as any).professional_data || {});
  const [freelancerData, setFreelancerData] = useState((profile as any).freelancer_data || {});
  const [consultantData, setConsultantData] = useState((profile as any).consultant_data || {});
  const [creatorData, setCreatorData] = useState((profile as any).creator_data || {});
  const [otherRoleSpec, setOtherRoleSpec] = useState((profile as any).other_role_spec || "");

  const [founderStatus, setFounderStatus] = useState((profile as any).founder_status || "");
  const [startupData, setStartupData] = useState<any>((profile as any).startup_data || {});
  
  // Extract initial skills and handle custom "Other" skill
  const initialSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const knownSkills = initialSkills.filter(s => SKILL_OPTIONS.includes(s));
  const customSkills = initialSkills.filter(s => !SKILL_OPTIONS.includes(s));
  
  const [skills, setSkills] = useState<string[]>(customSkills.length > 0 ? [...knownSkills, "Other (Specify)"] : knownSkills);
  const [skillOther, setSkillOther] = useState(customSkills.join(", "));
  
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "");
  const [toolsUsed, setToolsUsed] = useState(profile.tools_used || "");
  const [preferredRoles, setPreferredRoles] = useState(profile.preferred_roles || "");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>(typeof profile.preferred_industries === 'string' ? profile.preferred_industries.split(", ") : []);
  const [availability, setAvailability] = useState(profile.availability || "");
  const [workMode, setWorkMode] = useState(profile.work_mode || "");
  const [location, setLocationState] = useState(profile.location || "");
  const [resumeUrl, setResumeUrl] = useState(profile.resume_url || "");

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectPhotoUpload = (base64: string) => {
    setProfilePhoto(base64);
    patchMutation.mutate({ profile_photo: base64 });
  };

  function DetailRow({ label, value }: { label: string; value: string | string[] | undefined | null }) {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(", ") : value;
    return (
      <div>
        <p className="text-[10px] text-white/20 uppercase mb-1">{label}</p>
        <p className="text-sm text-white/70">{displayValue}</p>
      </div>
    );
  }

  function saveCore() {
    patchMutation.mutate({
      full_name: fullName,
      email,
      dob,
      location,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      resume_url: resumeUrl,
      roles,
      founder_status: roles.includes("Founder") ? founderStatus : undefined,
      startup_data: roles.includes("Founder") ? startupData : undefined,
      investor_data: roles.includes("Investor") ? investorData : undefined,
      student_data: roles.includes("Student") ? studentData : undefined,
      professional_data: roles.includes("Working Professional") ? (() => {
        const { notice_period, ...rest } = professionalData;
        return rest;
      })() : undefined,
      freelancer_data: roles.includes("Freelancer / Service Provider") ? freelancerData : undefined,
      consultant_data: roles.includes("Consultant / Mentor / Advisor") ? consultantData : undefined,
      creator_data: roles.includes("Content Creator / Community Admin") ? creatorData : undefined,
      other_role_spec: roles.includes("Other (Specify)") ? otherRoleSpec : undefined,
      skills: skills.includes("Other (Specify)") ? [...skills.filter(s => s !== "Other (Specify)"), ...skillOther.split(",").map(s => s.trim())].filter(Boolean) : skills,
      experience_level: experienceLevel,
      tools_used: toolsUsed,
      preferred_roles: preferredRoles,
      preferred_industries: preferredIndustries.join(", "),
      availability,
      work_mode: workMode,
      profile_photo: profilePhoto,
    });
    setEditingCore(false);
  }

  const isFounder = (profile as any).roles?.includes("Founder");
  const isInvestor = (profile as any).roles?.includes("Investor");
  const isOther = (profile as any).roles?.includes("Other (Specify)");
  const isShortPath = isFounder || isOther;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
            <p className="text-white/35 mt-1 text-sm">
              {(profile as any).roles?.join(" · ") || "User"} · {profile.location}
            </p>
          </div>

          {isFounder && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setLocation("/join-startup")}
              className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              Create Business Dashboard
            </motion.button>
          )}
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
                  <ProfileDetailView profile={profile} onPhotoUpload={handleDirectPhotoUpload} />
                </motion.div>

              ) : (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Basic Details</h3>
                      <div className="space-y-3">
                        <FormField label="Full Name" value={fullName} onChange={setFullName} />
                        <FormField label="Email" value={email} onChange={setEmail} type="email" />
                        <FormField label="Location" value={location} onChange={setLocationState} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Professional Links</h3>
                      <div className="space-y-3">
                        <FormField label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} />
                        <FormField label="Portfolio URL" value={portfolioUrl} onChange={setPortfolioUrl} />
                        <div className="space-y-1.5 flex-1">
                          <p className="text-[10px] text-white/25 uppercase tracking-wider ml-1">Resume Upload</p>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setResumeUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                          />
                          {resumeUrl && resumeUrl.length < 500 && (
                            <p className="text-xs text-white/40 ml-1">Current file uploaded (or URL provided)</p>
                          )}
                          {resumeUrl && resumeUrl.length >= 500 && (
                            <p className="text-xs text-green-400/70 ml-1">File selected and ready to save</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Roles</h3>
                    <div className="space-y-2">
                      <p className="text-xs text-white/35 uppercase tracking-wider">What describes you best?</p>
                      <PickMany options={ROLE_OPTIONS} value={roles} onChange={setRoles} />
                    </div>
                  </div>

                  {roles.includes("Founder") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Startup Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Current Status</p>
                          <PickOne options={FOUNDER_STATUS_OPTIONS} value={founderStatus} onChange={setFounderStatus} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Company Name" value={startupData.company_name || ""} onChange={(v) => setStartupData({ ...startupData, company_name: v })} />
                          <FormField label="Your Role" value={startupData.role || ""} onChange={(v) => setStartupData({ ...startupData, role: v })} placeholder="e.g. CEO, Founder" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Industry</p>
                          <PickOne options={INDUSTRY_OPTIONS} value={startupData.industry || ""} onChange={(v) => setStartupData({ ...startupData, industry: v })} />
                          {startupData.industry === "Other (Specify)" && (
                            <FormField label="Specify Industry" value={startupData.industry_other || ""} onChange={(v) => setStartupData({ ...startupData, industry_other: v })} placeholder="e.g. AgriTech, Space Tech" />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Team Size</p>
                            <PickOne options={["Solo", "2–10", "11–50", "51–500", "500–1000", "1000+"]} value={startupData.team_size || ""} onChange={(v) => setStartupData({ ...startupData, team_size: v })} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Is your startup registered?</p>
                            <PickOne options={["Yes", "No"]} value={startupData.is_registered || ""} onChange={(v) => setStartupData({ ...startupData, is_registered: v })} />
                          </div>
                        </div>
                        <TextArea label="Product Description" value={startupData.product_description || ""} onChange={(v) => setStartupData({ ...startupData, product_description: v })} />
                        <FormField label="Target Audience" value={startupData.target_audience || ""} onChange={(v) => setStartupData({ ...startupData, target_audience: v })} placeholder="Who is it for?" />
                        <FormField label="Company Website" value={startupData.website || ""} onChange={(v) => setStartupData({ ...startupData, website: v })} placeholder="https://..." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="No. of Users" value={startupData.num_users || ""} onChange={(v) => setStartupData({ ...startupData, num_users: v })} placeholder="e.g. 500" />
                          <FormField label="Monthly Revenue" value={startupData.monthly_revenue || ""} onChange={(v) => setStartupData({ ...startupData, monthly_revenue: v })} placeholder="e.g. $5k" />
                        </div>
                        <TextArea label="Traction Highlights" value={startupData.traction_highlights || ""} onChange={(v) => setStartupData({ ...startupData, traction_highlights: v })} />
                      </div>
                    </div>
                  )}

                  {roles.includes("Investor") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Investor Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Investor Type</p>
                          <PickMany options={INVESTOR_TYPE_OPTIONS} value={investorData.investor_types || []} onChange={(next) => {
                            setInvestorData({ ...investorData, investor_types: next });
                          }} />
                        </div>
                        {investorData.investor_types?.includes("Other (Specify)") && (
                          <FormField label="Specify Investor Type" value={investorData.investor_type_other || ""} onChange={(v) => setInvestorData({ ...investorData, investor_type_other: v })} placeholder="e.g. Micro VC..." />
                        )}
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Stage Focus</p>
                          <PickMany options={INVESTOR_STAGE_OPTIONS} value={investorData.investment_stages || []} onChange={(next) => {
                            setInvestorData({ ...investorData, investment_stages: next });
                          }} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Ticket Size</p>
                          <PickOne options={TICKET_SIZE_OPTIONS} value={investorData.ticket_size || ""} onChange={(v) => setInvestorData({ ...investorData, ticket_size: v })} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Preferred Industries</p>
                          <PickMany options={INDUSTRY_OPTIONS} value={investorData.industries || []} onChange={(next) => {
                            setInvestorData({ ...investorData, industries: next });
                          }} />
                        </div>
                        {investorData.industries?.includes("Other (Specify)") && (
                          <FormField label="Specify Industry" value={investorData.industry_other || ""} onChange={(v) => setInvestorData({ ...investorData, industry_other: v })} placeholder="e.g. Creator Economy, Space Tech..." />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Geographic Focus</p>
                            <PickOne options={GEO_OPTIONS} value={investorData.geography || ""} onChange={(v) => setInvestorData({ ...investorData, geography: v })} />
                          </div>
                          {investorData.geography === "Specific Regions (Specify)" && (
                            <FormField label="Specify Regions" value={investorData.specific_regions || ""} onChange={(v) => setInvestorData({ ...investorData, specific_regions: v })} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {roles.includes("Student") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Student Info</h3>
                      <div className="space-y-4">
                        <FormField label="University Name" value={studentData.institution || ""} onChange={(v) => setStudentData({ ...studentData, institution: v })} />
                        <FormField label="Course" value={studentData.course || ""} onChange={(v) => setStudentData({ ...studentData, course: v })} />
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Year of Study</p>
                          <PickOne options={STUDY_YEAR_OPTIONS} value={studentData.year || ""} onChange={(v) => setStudentData({ ...studentData, year: v })} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Student Communities?</p>
                          <PickOne options={["Yes", "No"]} value={studentData.communities?.is_member ? "Yes" : "No"} onChange={(v) => setStudentData({
                            ...studentData,
                            communities: { ...studentData.communities, is_member: v === "Yes" }
                          })} />
                        </div>
                        {studentData.communities?.is_member && (
                          <div className="space-y-4 pt-2">
                            <FormField label="Community Links (comma separated)" value={Array.isArray(studentData.communities?.links) ? studentData.communities.links.join(", ") : ""} onChange={(v) => setStudentData({
                              ...studentData,
                              communities: { ...studentData.communities, links: v.split(",").map(s => s.trim()) }
                            })} />
                            <FormField label="Admin Contact" value={studentData.communities?.admin_contact || ""} onChange={(v) => setStudentData({
                              ...studentData,
                              communities: { ...studentData.communities, admin_contact: v }
                            })} />
                          </div>
                        )}
                        <div className="space-y-4 pt-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Skills</p>
                          <PickMany options={SKILL_OPTIONS} value={skills} onChange={setSkills} />
                          {skills.includes("Other (Specify)") && (
                            <FormField label="Specify Other Skills" value={skillOther} onChange={setSkillOther} placeholder="E.g. Musical Performance, Legal Advisory..." />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Availability</p>
                            <PickOne options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Preferred Work Mode</p>
                            <PickOne options={WORK_MODE_OPTIONS} value={workMode} onChange={setWorkMode} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {roles.includes("Working Professional") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Professional Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <FormField label="Company Name" value={professionalData.company || ""} onChange={(v) => setProfessionalData({ ...professionalData, company: v })} />
                          <FormField label="Job Title" value={professionalData.title || ""} onChange={(v) => setProfessionalData({ ...professionalData, title: v })} />
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Years of Experience</p>
                            <PickOne options={EXP_OPTIONS} value={professionalData.experience_years || ""} onChange={(v) => setProfessionalData({ ...professionalData, experience_years: v })} />
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Skills</p>
                          <PickMany options={SKILL_OPTIONS} value={skills} onChange={setSkills} />
                          {skills.includes("Other (Specify)") && (
                            <FormField label="Specify Other Skills" value={skillOther} onChange={setSkillOther} placeholder="E.g. Musical Performance, Legal Advisory..." />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Availability</p>
                            <PickOne options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Preferred Work Mode</p>
                            <PickOne options={WORK_MODE_OPTIONS} value={workMode} onChange={setWorkMode} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {roles.includes("Freelancer / Service Provider") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Freelancer Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Freelance Experience</p>
                          <PickOne options={FREELANCE_EXP_OPTIONS} value={freelancerData.experience_years || ""} onChange={(v) => setFreelancerData({ ...freelancerData, experience_years: v })} />
                        </div>
                        <TextArea label="Notable Clients / Projects" value={freelancerData.notable_clients || ""} onChange={(v) => setFreelancerData({ ...freelancerData, notable_clients: v })} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Engagement Model</p>
                            <PickOne options={ENGAGEMENT_OPTIONS} value={freelancerData.engagement_model || ""} onChange={(v) => setFreelancerData({ ...freelancerData, engagement_model: v })} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Typical Budget Range</p>
                            <PickOne options={BUDGET_RANGE_OPTIONS} value={freelancerData.budget_range || ""} onChange={(v) => setFreelancerData({ ...freelancerData, budget_range: v })} />
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Skills</p>
                          <PickMany options={SKILL_OPTIONS} value={skills} onChange={setSkills} />
                          {skills.includes("Other (Specify)") && (
                            <FormField label="Specify Other Skills" value={skillOther} onChange={setSkillOther} placeholder="E.g. Musical Performance, Legal Advisory..." />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Availability</p>
                            <PickOne options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-white/35 uppercase tracking-wider">Preferred Work Mode</p>
                            <PickOne options={WORK_MODE_OPTIONS} value={workMode} onChange={setWorkMode} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {roles.includes("Consultant / Mentor / Advisor") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Consultant Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Primary Expertise</p>
                          <PickMany options={EXPERTISE_OPTIONS} value={consultantData.expertise_areas || []} onChange={(next) => {
                            setConsultantData({ ...consultantData, expertise_areas: next });
                          }} />
                        </div>
                        {(consultantData.expertise_areas || []).includes("Other (Specify)") && (
                          <FormField label="Specify Expertise" value={consultantData.expertise_other || ""} onChange={(v) => setConsultantData({ ...consultantData, expertise_other: v })} placeholder="E.g. Legal Advisory, Climate Tech..." />
                        )}
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Experience Level</p>
                          <PickOne options={CONSULTANT_EXP_OPTIONS} value={consultantData.experience_level || ""} onChange={(v) => setConsultantData({ ...consultantData, experience_level: v })} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Support Type</p>
                          <PickMany options={SUPPORT_TYPE_OPTIONS} value={consultantData.support_types || []} onChange={(next) => {
                            setConsultantData({ ...consultantData, support_types: next });
                          }} />
                        </div>
                        {(consultantData.support_types || []).includes("Other (Specify)") && (
                          <FormField label="Specify Support Type" value={consultantData.support_type_other || ""} onChange={(v) => setConsultantData({ ...consultantData, support_type_other: v })} placeholder="E.g. Technical reviews, due diligence..." />
                        )}
                      </div>
                    </div>
                  )}

                  {roles.includes("Content Creator / Community Admin") && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Creator Info</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Platforms</p>
                          <PickMany options={PLATFORM_OPTIONS} value={creatorData.platforms || []} onChange={(next) => {
                            setCreatorData({ ...creatorData, platforms: next });
                          }} />
                        </div>
                        {(creatorData.platforms || []).includes("Other (Specify)") && (
                          <FormField label="Specify Platform" value={creatorData.platform_other || ""} onChange={(v) => setCreatorData({ ...creatorData, platform_other: v })} placeholder="E.g. Threads, TikTok..." />
                        )}
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Audience Size</p>
                          <PickOne options={AUDIENCE_SIZE_OPTIONS} value={creatorData.audience_size || ""} onChange={(v) => setCreatorData({ ...creatorData, audience_size: v })} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Niches</p>
                          <PickMany options={NICHE_OPTIONS} value={creatorData.niches || []} onChange={(next) => {
                            setCreatorData({ ...creatorData, niches: next });
                          }} />
                        </div>
                        {(creatorData.niches || []).includes("Other (Specify)") && (
                          <FormField label="Specify Niche" value={creatorData.niche_other || ""} onChange={(v) => setCreatorData({ ...creatorData, niche_other: v })} placeholder="E.g. Travel, Fitness..." />
                        )}
                        <TextArea label="Profile / Community Links (comma separated)" value={Array.isArray(creatorData.profile_links) ? creatorData.profile_links.join(", ") : ""} onChange={(v) => setCreatorData({ ...creatorData, profile_links: v.split(",").map(s => s.trim()) })} />
                      </div>
                    </div>
                  )}

                    {roles.includes("Other (Specify)") && (
                      <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <FormField label="Specify Other Role" value={otherRoleSpec} onChange={setOtherRoleSpec} />
                      </div>
                    )}




                  <div className="pt-6 flex gap-4">
                    <button
                      onClick={saveCore}
                      disabled={patchMutation.isPending}
                      className="px-8 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {patchMutation.isPending ? "Saving..." : "Save Profile"}
                    </button>
                    <button
                      onClick={() => setEditingCore(false)}
                      className="px-6 py-3 text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )
              }
            </AnimatePresence >
          </div >

          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Matches</h2>
            <p className="text-white/25 text-sm">Coming soon — we're curating based on your profile.</p>
          </div>

          {/* ── Your Businesses ────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Your Businesses</h2>
              <button
                onClick={() => navigate("/business/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Business
              </button>
            </div>

            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((business: any) => (
                  <BusinessCard
                    key={business._id}
                    business={business}
                    onClick={() => navigate(`/business/${business._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div>
                  <p className="text-white/50 text-sm">No businesses yet</p>
                  <p className="text-white/25 text-xs mt-1">Create a business profile to manage campaigns and team members</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partner Dashboard component ─────────────────────────────────────────────
function PartnerDashboard({ profile, session, signOut, patchMutation, connections, greeting, showInvestorSection, investorMatches, investorConnections }: {
  profile: PartnerProfile; session: any; signOut: () => void;
  patchMutation: any; connections: any[]; greeting: string;
  showInvestorSection?: boolean; investorMatches?: any[]; investorConnections?: any[];
}) {
  const [, setLocation] = useLocation();
  const [, navigate] = useLocation();
  const [editingCore, setEditingCore] = useState(false);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const response = await fetch("/api/business", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch businesses");
      return response.json();
    }
  });

  // Form state
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [role, setRole] = useState(profile.role || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [email, setEmail] = useState(profile.email || "");
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
  const [monthlyCapacity, setMonthlyCapacity] = useState(profile.monthly_capacity || "");
  const [preferredBudgetRange, setPreferredBudgetRange] = useState(profile.preferred_budget_range || "");
  const [profilePhoto, setProfilePhoto] = useState(profile.profile_photo || "");

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChangeImmediate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePhoto(base64);
        patchMutation.mutate({ profile_photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const [partnerTypeOther, setPartnerTypeOther] = useState("");
  const [pricingModelOther, setPricingModelOther] = useState("");

  const PARTNER_TYPES = ["Agency", "Investor", "Service Provider", "Institutional Firm", "Other (Specify)"];
  const PRICING_MODELS = ["Fixed", "Hourly", "Commission", "Retainer", "Other (Specify)"];
  const TEAM_SIZE_OPTIONS = ["Solo", "2-10", "11-50", "51-200", "200+"];
  const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Expansion", "MNC"];

  function saveCore() {
    patchMutation.mutate({
      company_name: companyName,
      role,
      full_name: fullName,
      email,
      website,
      linkedin_url: linkedinUrl,
      partner_type: partnerType === "Other (Specify)" ? partnerTypeOther : partnerType,
      services_offered: services,
      stages_served: stages,
      pricing_model: pricingModel === "Other (Specify)" ? pricingModelOther : pricingModel,
      average_deal_size: averageDealSize,
      team_size: teamSize,
      years_experience: yearsExperience,
      work_mode: workMode,
      portfolio_links: portfolioLinks,
      certifications: certifications,
      monthly_capacity: monthlyCapacity,
      preferred_budget_range: preferredBudgetRange,
      profile_photo: profilePhoto,
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
                      <div className="relative group w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-medium border border-white/10 text-xs overflow-hidden">
                        {profile.profile_photo ? (
                          <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          profile.full_name?.[0]?.toUpperCase()
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-4 h-4 text-white/70" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChangeImmediate} />
                        </label>
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
                          <div className="flex items-center gap-3 text-sm">
                            <Linkedin className="w-3.5 h-3.5 text-white/30" />
                            <a href={ensureHttps(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LinkedIn Profile &rarr;</a>
                          </div>
                          {profile.website && (
                            <div className="flex items-center gap-3 text-sm">
                              <Globe className="w-3.5 h-3.5 text-white/30" />
                              <a href={ensureHttps(profile.website)} target="_blank" rel="noreferrer" className="text-white/70 hover:underline truncate">{profile.website.replace(/^https?:\/\//, "")}</a>
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
                          {profile.stages_served && profile.stages_served.length > 0 && (
                            <div>
                              <p className="text-[10px] text-white/20 uppercase mb-1.5">Stages Served</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {profile.stages_served.map(s => <Tag key={s} label={s} />)}
                              </div>
                            </div>
                          )}
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
                      </div>

                      {profile.certifications && (
                        <div className="space-y-3 pt-2">
                          <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Certifications</h3>
                          <div className="text-xs text-white/60 text-white/70 leading-relaxed">{profile.certifications}</div>
                        </div>
                      )}

                      {profile.portfolio_links && (
                        <div className="space-y-3 pt-2">
                          <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Portfolio / Work Links</h3>
                          <div className="text-xs text-white/60">
                            <p className="leading-relaxed break-words text-blue-400/80">{profile.portfolio_links}</p>
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
                    <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Company Name" value={companyName} onChange={setCompanyName} />
                      <FormField label="Full Name" value={fullName} onChange={setFullName} />
                      <FormField label="Role" value={role} onChange={setRole} />
                      <FormField label="Email" value={email} onChange={setEmail} type="email" />
                      <FormField label="Website" value={website} onChange={setWebsite} />
                      <FormField label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
                    </div>
                  </div>

                  {/* Section: Partner Info */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Partner Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Partner Type</p>
                          <PickOne options={PARTNER_TYPES} value={partnerType} onChange={(v) => setPartnerType(v as any)} />
                          {partnerType === "Other (Specify)" && (
                            <FormField label="Specify Partner Type" value={partnerTypeOther} onChange={setPartnerTypeOther} placeholder="e.g. Legal Firm" />
                          )}
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
                      <h3 className="text-xs font-semibold text-white/20 uppercase tracking-widest pb-2">Requirements</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs text-white/35 uppercase tracking-wider">Pricing Model</p>
                          <PickOne options={PRICING_MODELS} value={pricingModel} onChange={setPricingModel} />
                          {pricingModel === "Other (Specify)" && (
                            <FormField label="Specify Pricing Model" value={pricingModelOther} onChange={setPricingModelOther} placeholder="e.g. Performance-based" />
                          )}
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

          {/* Investor section: only for approved partner-investors, added below original dashboard */}
          {showInvestorSection && (
            <div className="space-y-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Browse startups</h2>
                <button
                  onClick={() => setLocation('/discover')}
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Discover Startups
                </button>
              </div>

              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">My Connections</h2>
                {investorConnections && investorConnections.length > 0 ? (
                  <div className="space-y-4">
                    {investorConnections.map((conn: any) => (
                      <div key={conn.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-medium">{conn.startup?.company_name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
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
                            {conn.status === 'accepted' && conn.startup?.email && (
                              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-xs text-green-400 font-medium mb-1">Contact:</p>
                                <p className="text-sm text-white/90">{conn.startup.email}</p>
                                {conn.startup.linkedin_url && (
                                  <a href={conn.startup.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                  </a>
                                )}
                              </div>
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
          )}

          {/* ── Your Businesses ────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Your Businesses</h2>
              <button
                onClick={() => setLocation("/business/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Business
              </button>
            </div>

            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((business: any) => (
                  <BusinessCard
                    key={business._id}
                    business={business}
                    onClick={() => setLocation(`/business/${business._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div>
                  <p className="text-white/50 text-sm">No businesses yet</p>
                  <p className="text-white/25 text-xs mt-1">Create a business profile to manage campaigns and team members</p>
                </div>
              </div>
            )}
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

  // Fetch user's businesses
  const { data: businesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const response = await fetch("/api/business", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch businesses");
      return response.json();
    }
  });

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
                <h2 className="text-xl font-semibold text-white mb-1">
                  {(profile.firm_name && profile.firm_name !== "NA") ? profile.firm_name : profile.full_name}
                </h2>
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'accepted' ? 'bg-green-500/15 text-green-400' :
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

          {/* ── Your Businesses ────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Your Businesses</h2>
              <button
                onClick={() => setLocation("/business/create")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white/70 hover:text-white transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Business
              </button>
            </div>

            {businessesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map((business: any) => (
                  <BusinessCard
                    key={business._id}
                    business={business}
                    onClick={() => setLocation(`/business/${business._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div>
                  <p className="text-white/50 text-sm">No businesses yet</p>
                  <p className="text-white/25 text-xs mt-1">Create a business profile to manage campaigns and team members</p>
                </div>
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

  const { data: dashboardData, isLoading, isFetched } = useQuery<any>({
    queryKey: ["dashboard-init"],
    queryFn: async () => {
      const r = await fetch("/api/dashboard-init", { headers: authHeaders() });
      if (!r.ok) throw new Error("Failed to initialize dashboard");
      const data = await r.json();

      // Seed other query caches so profile/connections lookups elsewhere still work
      if (data.profile) qc.setQueryData(["profile"], data.profile);
      if (data.connections) qc.setQueryData(["connections"], data.connections);
      if (data.matches) qc.setQueryData(["matches"], data.matches);

      return data;
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const profile = dashboardData?.profile;
  const connections = dashboardData?.connections;
  const matches = dashboardData?.matches;

  const patchMutation = useMutation({
    mutationFn: (patch: any) =>
      fetch("/api/profile", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(patch),
      }).then(r => r.json()),
    onMutate: async (patch) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ["dashboard-init"] });

      // Snapshot previous value for rollback
      const previousData = qc.getQueryData(["dashboard-init"]);

      // Optimistically update cache
      qc.setQueryData(["dashboard-init"], (old: any) => ({
        ...old,
        profile: { ...old?.profile, ...patch }
      }));

      return { previousData };
    },
    onError: (err, patch, context) => {
      // Rollback on error
      if (context?.previousData) {
        qc.setQueryData(["dashboard-init"], context.previousData);
      }
    },
    onSuccess: (data: any) => {
      // Invalidate to fetch fresh data from server
      qc.invalidateQueries({ queryKey: ["dashboard-init"] });
      qc.invalidateQueries({ queryKey: ["profile"] }); // Keep for backward compatibility
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

  // Matches logic is now handled in dashboard-init
  const canSeeStartups = profile?.type === 'investor' || (profile?.type === 'partner' && profile?.partner_type === 'Investor' && profile?.approved);

  async function signOut() {
    qc.clear();
    await logout();
    window.location.href = "/";
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

  // Dedicated investor profile: full Investor dashboard
  if (profile.type === "investor") {
    return <InvestorDashboard profile={profile} session={session} signOut={signOut} connections={connections ?? []} matches={matches ?? []} greeting={greeting} />;
  }

  if (profile.type === "individual") {
    return <IndividualDashboard profile={profile} session={session} signOut={signOut} patchMutation={patchMutation} connections={connections ?? []} greeting={greeting} />;
  }

  // Partner: always show original Partner dashboard; add investor section below only for approved partner-investors
  if (profile.type === "partner") {
    const showInvestorSection = profile.partner_type === "Investor" && !!profile.approved;
    return (
      <PartnerDashboard
        profile={profile}
        session={session}
        signOut={signOut}
        patchMutation={patchMutation}
        connections={connections ?? []}
        greeting={greeting}
        showInvestorSection={showInvestorSection}
        investorMatches={showInvestorSection ? (matches ?? []) : undefined}
        investorConnections={showInvestorSection ? (connections ?? []) : undefined}
      />
    );
  }

  return null;
}
