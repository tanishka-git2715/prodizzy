import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogIn, Check, ChevronDown, X, Search, Upload } from "lucide-react";

const TOTAL_STEPS = 3;

// --- Components ---

function slideVariants(dir: number) {
  return {
    initial: { x: dir > 0 ? "60px" : "-60px", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { x: dir > 0 ? "-60px" : "60px", opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  };
}

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Step {step + 1} of {total}</p>
      <h1 className="text-3xl font-semibold text-white tracking-tight leading-8">{title}</h1>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", multiline, optional }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean; optional?: boolean;
}) {
  const base = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none";
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
        {label} {optional && <span className="lowercase opacity-50 font-normal">(optional)</span>}
      </label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
    </div>
  );
}

function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
        {label} {optional && <span className="lowercase opacity-50 font-normal">(optional)</span>}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[46px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
      >
        <span className={value ? "text-sm text-white" : "text-sm text-white/20"}>
          {value || placeholder || `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
            >
              {options.map(o => (
                <div
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                >
                  {o}
                  {value === o && <Check className="w-4 h-4 text-white" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  placeholder = "Select options",
  optional,
  enableSearch = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  enableSearch?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2 relative">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
        {label} {optional && <span className="lowercase opacity-50 font-normal">(optional)</span>}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[46px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-wrap gap-2 items-center cursor-pointer hover:border-white/20 transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-white/20 text-sm">{placeholder}</span>
        ) : (
          selected.map(s => (
            <span
              key={s}
              className="bg-white/10 text-white text-[11px] px-2 py-1 rounded-md flex items-center gap-1 border border-white/5"
              onClick={(e) => { e.stopPropagation(); onToggle(s); }}
            >
              {s} <X className="w-3 h-3 text-white/40 hover:text-white" />
            </span>
          ))
        )}
        <ChevronDown className={`ml-auto w-4 h-4 text-white/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 flex flex-col"
            >
              {enableSearch && (
                <div className="p-2 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>
              )}
              <div className="overflow-y-auto flex-1">
                {filtered.map(o => (
                  <div
                    key={o}
                    onClick={() => onToggle(o)}
                    className="px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                  >
                    {o}
                    {selected.includes(o) && <Check className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Page ---

export default function IndividualOnboard() {
  const { session, loading } = useAuth();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- State: Step 1 (Basic Profile) ---
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [roles, setRoles] = useState<string[]>([]); // We enforce single select in UI now

  // --- State: Step 2 (Conditional) ---
  // Investor Focus
  const [investorType, setInvestorType] = useState("");
  const [investmentStages, setInvestmentStages] = useState<string[]>([]);
  const [ticketSize, setTicketSize] = useState("");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [geoFocus, setGeoFocus] = useState("");
  const [specificRegions, setSpecificRegions] = useState("");

  // Student details
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [studentCommunities, setStudentCommunities] = useState(""); // Yes/No
  const [communityLinks, setCommunityLinks] = useState("");
  const [adminContact, setAdminContact] = useState("");

  // Professional details
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [totalExp, setTotalExp] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  // Freelancer details
  const [freelanceExp, setFreelanceExp] = useState("");
  const [notableClients, setNotableClients] = useState("");
  const [engagementModel, setEngagementModel] = useState("");
  const [budgetRange, setBudgetRange] = useState("");

  // Consultant details
  const [consultantExp, setConsultantExp] = useState("");
  const [supportTypes, setSupportTypes] = useState<string[]>([]);

  // Content Creator details
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState("");
  const [niche, setNiche] = useState<string[]>([]);
  const [profileLinks, setProfileLinks] = useState("");

  // Other Role (Specify)
  const [otherRoleSpec, setOtherRoleSpec] = useState("");

  // Founder details
  const [founderStatus, setFounderStatus] = useState("");

  // --- State: Step 3 (Skills & Availability) ---
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  // --- Options ---
  const ROLE_OPTIONS = ["Founder", "Investor", "Student", "Working Professional", "Freelancer / Service Provider", "Consultant / Mentor / Advisor", "Content Creator / Community Admin", "Other (Specify)"];

  const FOUNDER_STATUS_OPTIONS = ["Exploring an idea", "Currently working on an MVP", "Already building a product", "Generating early revenue / Growing", "Scaling an established business"];
  const INVESTOR_TYPE_OPTIONS = ["Angel Investor", "Venture Capital Professional", "Investment Scout", "Syndicate Lead / Member", "Family Office Representative", "Corporate Investor", "Other"];
  const INVESTOR_STAGE_OPTIONS = ["Pre-Seed (Ideation Stage)", "Seed (MVP & Early Traction)", "Series A (Generating Revenue)", "Series B/C/D (Expansion & Scaling)", "MNC (Global)"];
  const TICKET_SIZE_OPTIONS = ["Below ₹10 Lakhs", "₹10–50 Lakhs", "₹50 Lakhs – ₹1 Crore", "₹1 Crore+", "Depends on startup"];
  const INDUSTRY_OPTIONS = ["Software & AI", "E-commerce & Retail", "Finance & Payments", "Healthcare & Wellness", "Education & Training", "Food & Beverage", "Transportation & Delivery", "Real Estate & Construction", "Marketing & Advertising", "Energy & Sustainability", "Open to All"];
  const GEO_OPTIONS = ["India", "Global", "Specific Regions (Specify)"];

  const STUDY_YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "Postgraduate", "Recent Graduate"];
  const EXP_OPTIONS = ["0–2 years", "2–4 years", "4–8 years", "8+ years"];
  const FREELANCE_EXP_OPTIONS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];
  const ENGAGEMENT_OPTIONS = ["Hourly", "Project-based", "Monthly Retainer", "Equity-based (for startups)"];
  const BUDGET_RANGE_OPTIONS = ["Below ₹10K", "₹10K–50K", "₹50K–2L", "₹2L+", "Depends on scope"];

  const CONSULTANT_EXP_OPTIONS = ["5–10 years", "10–15 years", "15–20 years", "20+ years"];
  const EXPERTISE_OPTIONS = ["Business Strategy", "Product Strategy & Management", "Growth & Marketing", "Fundraising & Investor Readiness", "Sales & Go-to-Market", "Operations & Scaling", "Finance & Startup Metrics", "Career Guidance / Leadership Coaching", "Technology / AI Advisory", "Community & Ecosystem Building", "Other"];
  const SUPPORT_TYPE_OPTIONS = ["Paid consulting sessions", "Mentorship / coaching", "Project-based advisory", "Long-term strategic advisory", "Equity-based startup advisory", "Board / investor advisory", "Other"];

  const PLATFORM_OPTIONS = ["Instagram", "YouTube", "LinkedIn", "X (Twitter)", "WhatsApp Community", "Telegram", "Discord", "Newsletter / Blog", "Podcast", "Other"];
  const AUDIENCE_SIZE_OPTIONS = ["Below 1K", "1K – 10K", "10K – 50K", "50K – 1L", "1L+"];
  const NICHE_OPTIONS = ["Technology / Web3 / AI", "Startups & Business", "Finance & Investing", "Education & Careers", "Productivity", "Marketing & Growth", "Design & Creativity", "Lifestyle", "Gaming", "Entertainment", "Student Community", "Founder Community", "Other"];

  const SKILL_OPTIONS = ["Software development", "AI & Automation", "Branding & Marketing", "UI/UX & Graphic Designing", "Content Creation & Copywriting", "Video editing", "Research & Data Analytics", "Finance & Trading", "Product & Operations", "Community & Event Management", "Other"];
  const LOOKING_FOR_OPTIONS = ["Internships", "Freelance Projects", "Full-time Roles", "Part-time Roles", "Collaborations", "Co-founders", "Mentorship (Giving/Seeking)", "Investment (Giving/Seeking)", "Hiring talent"];
  const AVAILABILITY_OPTIONS = ["Full-time", "Part-time", "Nights & Weekends", "Project-based"];
  const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "On-site", "Flexible"];
  const NOTICE_OPTIONS = ["Immediate", "< 1 month", "1–3 months", "3+ months"];
  const isShortPath = roles.includes("Founder") || roles.includes("Other (Specify)");

  // --- Logic ---
  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  useEffect(() => {
    if (session?.user?.email && !email) setEmail(session.user.email);
  }, [session, email]);

  const toggle = (set: any, val: string) => set((curr: string[]) => curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val]);

  function go(next: number) { setDir(next > step ? 1 : -1); setStep(next); }

  function canProceed() {
    if (step === 0) {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      return fullName.trim() && roles.length > 0 && userLocation.trim() && isEmailValid;
    }
    if (step === 1) {
      if (roles.includes("Founder") && !founderStatus) return false;
      if (roles.includes("Investor") && (!investorType || !ticketSize || preferredIndustries.length === 0)) return false;
      if (roles.includes("Student") && (!institution || !course || !studyYear)) return false;
      if (roles.includes("Working Professional") && (!currentCompany || !jobTitle || !totalExp || !noticePeriod)) return false;
      if (roles.includes("Freelancer / Service Provider") && (!freelanceExp || !engagementModel || !budgetRange)) return false;
      if (roles.includes("Consultant / Mentor / Advisor") && (!consultantExp || supportTypes.length === 0 || niche.length === 0)) return false;
      if (roles.includes("Content Creator / Community Admin") && (platforms.length === 0 || !audienceSize || niche.length === 0)) return false;
      return true;
    }
    if (step === 2) return skills.length > 0 && lookingFor.length > 0 && availability && workMode;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const payload = {
      full_name: fullName,
      dob,
      location: userLocation,
      email,
      linkedin_url: linkedinUrl || undefined,
      portfolio_url: portfolioUrl || undefined,
      roles,
      founder_status: roles.includes("Founder") ? founderStatus : undefined,
      investor_data: roles.includes("Investor") ? {
        investor_types: [investorType],
        investment_stages: investmentStages,
        ticket_size: ticketSize,
        industries: preferredIndustries,
        geography: geoFocus,
        specific_regions: geoFocus === "Specific Regions (Specify)" ? specificRegions : undefined,
      } : undefined,
      student_data: roles.includes("Student") ? {
        institution,
        course,
        year: studyYear,
        communities: {
          is_member: studentCommunities === "Yes",
          links: studentCommunities === "Yes" ? communityLinks.split(",").map(s => s.trim()) : [],
          admin_contact: adminContact,
        }
      } : undefined,
      professional_data: roles.includes("Working Professional") ? {
        company: currentCompany,
        title: jobTitle,
        experience_years: totalExp,
        notice_period: noticePeriod,
      } : undefined,
      freelancer_data: roles.includes("Freelancer / Service Provider") ? {
        service_areas: preferredIndustries, // Reuse industries or skills? List says Service Area
        experience_years: freelanceExp,
        notable_clients: notableClients,
        engagement_model: engagementModel,
        budget_range: budgetRange,
      } : undefined,
      consultant_data: roles.includes("Consultant / Mentor / Advisor") ? {
        expertise_areas: niche,
        experience_level: consultantExp,
        support_types: supportTypes,
      } : undefined,
      creator_data: roles.includes("Content Creator / Community Admin") ? {
        platforms,
        audience_size: audienceSize,
        niches: niche,
        profile_links: profileLinks.split(",").map(s => s.trim()),
      } : undefined,
      skills,
      availability,
      work_mode: workMode,
      looking_for: lookingFor,
      onboarding_completed: true,
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      setError(body.message || "Failed to save profile");
      setSubmitting(false);
      return;
    }

    const savedProfile = await res.json();
    qc.setQueryData(["profile"], savedProfile);
    setLocation("/dashboard");
  }

  const steps = [
    <div key="0" className="space-y-6">
      <StepHeader step={0} total={isShortPath ? 1 : 3} title="Create Your Professional Profile" />
      <div className="space-y-6">
        {/* Role Selection Moved to Top & Single Select Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
            What describes you best?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "Founder" },
              { id: "Investor" },
              { id: "Student" },
              { id: "Working Professional" },
              { id: "Freelancer / Service Provider" },
              { id: "Consultant / Mentor / Advisor" },
              { id: "Content Creator / Community Admin" },
              { id: "Other (Specify)" }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setRoles([role.id])}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 min-h-[64px] rounded-xl border transition-all ${roles.includes(role.id)
                  ? "bg-red-500/10 border-red-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
                  }`}
              >
                <span className="text-[13px] font-semibold leading-tight text-center tracking-tight">
                  {role.id}
                </span>
                {roles.includes(role.id) && (
                  <motion.div layoutId="active-role" className="absolute top-3 right-3">
                    <Check className="w-3.5 h-3.5 text-red-500" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {roles.includes("Other (Specify)") && (
          <Field label="Specify Role" value={otherRoleSpec} onChange={setOtherRoleSpec} placeholder="E.g. Artist, Researcher..." />
        )}

        <div className="space-y-4 pt-4 border-t border-white/5">
          <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Jane Smith" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />
            <Field label="Location" value={userLocation} onChange={setUserLocation} placeholder="Mumbai, India" />
          </div>
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <Field label="LinkedIn Profile" value={linkedinUrl} onChange={setLinkedinUrl} optional placeholder="https://linkedin.com/in/..." />
          <Field label="Portfolio / Resume Link" value={portfolioUrl} onChange={setPortfolioUrl} optional placeholder="https://yoursite.com" />
        </div>
      </div>
    </div>,

    <div key="1" className="space-y-6">
      <StepHeader step={1} total={3} title="Role-specific Details" />
      <div className="space-y-8">

        {roles.includes("Founder") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Founder Info</h3>
            <Dropdown label="Current Status" options={FOUNDER_STATUS_OPTIONS} value={founderStatus} onChange={setFounderStatus} />
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-white/40 text-xs italic">Note: You will be asked to create your Business Dashboard after landing on the main dashboard.</p>
            </div>
          </div>
        )}

        {roles.includes("Investor") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Investor Info</h3>
            <Dropdown label="Investor Type" options={INVESTOR_TYPE_OPTIONS} value={investorType} onChange={setInvestorType} />
            <MultiSelectDropdown label="Investment Stage Focus" options={INVESTOR_STAGE_OPTIONS} selected={investmentStages} onToggle={(v) => toggle(setInvestmentStages, v)} />
            <Dropdown label="Typical Investment Ticket Size" options={TICKET_SIZE_OPTIONS} value={ticketSize} onChange={setTicketSize} />
            <MultiSelectDropdown label="Preferred Industries" options={INDUSTRY_OPTIONS} selected={preferredIndustries} onToggle={(v) => toggle(setPreferredIndustries, v)} />
            <Dropdown label="Geographic Focus" options={GEO_OPTIONS} value={geoFocus} onChange={setGeoFocus} />
            {geoFocus === "Specific Regions (Specify)" && (
              <Field label="Specify Regions" value={specificRegions} onChange={setSpecificRegions} placeholder="E.g. SE Asia, USA..." />
            )}
          </div>
        )}

        {roles.includes("Student") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Student Info</h3>
            <Field label="School / College / University Name" value={institution} onChange={setInstitution} />
            <Field label="Course / Degree" value={course} onChange={setCourse} placeholder="E.g. B.Tech CSE, BBA" />
            <Dropdown label="Year of Study" options={STUDY_YEAR_OPTIONS} value={studyYear} onChange={setStudyYear} />
            <Dropdown label="Are you part of any student communities?" options={["Yes", "No"]} value={studentCommunities} onChange={setStudentCommunities} />
            {studentCommunities === "Yes" && (
              <>
                <Field label="Community Links" value={communityLinks} onChange={setCommunityLinks} placeholder="Comma separated URLs" />
                <Field label="Admin Contact" value={adminContact} onChange={setAdminContact} placeholder="Email or Phone" />
              </>
            )}
          </div>
        )}

        {roles.includes("Working Professional") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Professional Info</h3>
            <Field label="Company / Organization Name" value={currentCompany} onChange={setCurrentCompany} />
            <Field label="Job Title / Role" value={jobTitle} onChange={setJobTitle} />
            <Dropdown label="Total Years of Experience" options={EXP_OPTIONS} value={totalExp} onChange={setTotalExp} />
            <Dropdown label="Notice Period" options={NOTICE_OPTIONS} value={noticePeriod} onChange={setNoticePeriod} />
          </div>
        )}

        {roles.includes("Freelancer / Service Provider") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Freelancer Info</h3>
            <Dropdown label="Freelance Experience" options={FREELANCE_EXP_OPTIONS} value={freelanceExp} onChange={setFreelanceExp} />
            <Field label="Notable Clients / Projects" value={notableClients} onChange={setNotableClients} optional multiline />
            <Dropdown label="Preferred Engagement Model" options={ENGAGEMENT_OPTIONS} value={engagementModel} onChange={setEngagementModel} />
            <Dropdown label="Typical Project Budget Range" options={BUDGET_RANGE_OPTIONS} value={budgetRange} onChange={setBudgetRange} />
          </div>
        )}

        {roles.includes("Consultant / Mentor / Advisor") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Consultant Info</h3>
            <MultiSelectDropdown label="Primary Expertise Area" options={EXPERTISE_OPTIONS} selected={niche} onToggle={(v) => toggle(setNiche, v)} />
            <Dropdown label="Experience Level" options={CONSULTANT_EXP_OPTIONS} value={consultantExp} onChange={setConsultantExp} />
            <MultiSelectDropdown label="Type of Support You Offer" options={SUPPORT_TYPE_OPTIONS} selected={supportTypes} onToggle={(v) => toggle(setSupportTypes, v)} />
          </div>
        )}

        {roles.includes("Content Creator / Community Admin") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-1 inline-block rounded">Creator Info</h3>
            <MultiSelectDropdown label="Primary Platform(s)" options={PLATFORM_OPTIONS} selected={platforms} onToggle={(v) => toggle(setPlatforms, v)} />
            <Dropdown label="Audience / Community Size" options={AUDIENCE_SIZE_OPTIONS} value={audienceSize} onChange={setAudienceSize} />
            <MultiSelectDropdown label="Content / Community Niche" options={NICHE_OPTIONS} selected={niche} onToggle={(v) => toggle(setNiche, v)} />
            <Field label="Profile / Community Links" value={profileLinks} onChange={setProfileLinks} multiline placeholder="One link per line or comma separated..." />
          </div>
        )}
      </div>
    </div>,

    <div key="2" className="space-y-6">
      <StepHeader step={2} total={3} title="Final Details" />
      <div className="space-y-5">
        <MultiSelectDropdown label="Primary Skills" options={SKILL_OPTIONS} selected={skills} onToggle={(v) => toggle(setSkills, v)} enableSearch />
        <MultiSelectDropdown label="What are you looking for?" options={LOOKING_FOR_OPTIONS} selected={lookingFor} onToggle={(v) => toggle(setLookingFor, v)} />
        <Dropdown label="Availability" options={AVAILABILITY_OPTIONS} value={availability} onChange={setAvailability} />
        <Dropdown label="Preferred Work Mode" options={WORK_MODE_OPTIONS} value={workMode} onChange={setWorkMode} />
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <p className="text-[11px] text-white/30 leading-relaxed italic">By completing this profile, you'll be matched with founders, collaborators, and opportunities tailored to your expertise.</p>
        </div>
      </div>
    </div>,
  ];

  if (!session && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <img src="/logo.png" alt="Prodizzy" className="w-12 h-12 rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white">Professional Onboarding</h1>
          <p className="text-white/40 text-sm mt-2">Please sign in with Google to begin your onboarding.</p>
          <button onClick={() => window.location.href = "/api/auth/google"}
            className="w-full bg-white text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
            <LogIn className="w-4 h-4" /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <motion.div className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" animate={{ width: `${((step + 1) / 3) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2">
          <img src="/logo.png" alt="Prodizzy" className="w-7 h-7" />
          <span className="text-white font-semibold">Prodizzy</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-32">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={step} custom={dir} variants={slideVariants(dir)} initial="initial" animate="animate" exit="exit">
              {steps[step]}
            </motion.div>
          </AnimatePresence>
          {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => go(step - 1)} className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {step < 2 && !isShortPath ? (
            <button onClick={() => { if (canProceed()) go(step + 1); }} disabled={!canProceed()}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-20">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || submitting}
              className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-20">
              {submitting ? "Creating Profile..." : "Complete Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
