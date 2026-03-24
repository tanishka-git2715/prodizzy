import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogIn } from "lucide-react";

const TOTAL_STEPS = 4;

function slideVariants(dir: number) {
  return {
    initial: { x: dir > 0 ? "60px" : "-60px", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { x: dir > 0 ? "-60px" : "60px", opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  };
}

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Step {step + 1}</p>
      <h1 className="text-3xl font-semibold text-white tracking-tight leading-8">{title}</h1>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean;
}) {
  const base = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none";
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      }
    </div>
  );
}

// ─── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>

      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[46px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
      >
        <span className={value ? "text-sm text-white" : "text-sm text-white/20"}>
          {value || placeholder || `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown Menu */}
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

function SinglePill({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onSelect(o)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${selected === o ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white/80"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Multi Select Dropdown ───────────────────────────────────────────────────
import { Check, ChevronDown, X } from "lucide-react";

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  placeholder = "Select options",
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>

      {/* Trigger */}
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

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
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
                  onClick={() => onToggle(o)}
                  className="px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                >
                  {o}
                  {selected.includes(o) && <Check className="w-4 h-4 text-white" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PartnerOnboard() {
  // Always scroll to top when opening the form
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { session, loading } = useAuth();
  const qc = useQueryClient();
  const isLoggedIn = !!session;
  const EFFECTIVE_STEPS = 3;

  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic Details
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Step 2-3: Profile & Requirements
  const [partnerType, setPartnerType] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [stagesServed, setStagesServed] = useState<string[]>([]);
  const [pricingModel, setPricingModel] = useState("");
  const [averageDealSize, setAverageDealSize] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [certifications, setCertifications] = useState("");

  // Step 6: Intent + Account
  const [monthlyCapacity, setMonthlyCapacity] = useState("");
  const [preferredBudgetRange, setPreferredBudgetRange] = useState("");
  const [password, setPassword] = useState("");

  const [partnerTypeOther, setPartnerTypeOther] = useState("");
  const [pricingModelOther, setPricingModelOther] = useState("");

  // --- Persistence Logic ---
  const STORAGE_KEY = "prodizzy_onboard_partner_v1";

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.role) setRole(data.role);
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.website) setWebsite(data.website);
        if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl);
        if (data.partnerType) setPartnerType(data.partnerType);
        if (data.servicesOffered) setServicesOffered(data.servicesOffered);
        if (data.stagesServed) setStagesServed(data.stagesServed);
        if (data.pricingModel) setPricingModel(data.pricingModel);
        if (data.averageDealSize) setAverageDealSize(data.averageDealSize);
        if (data.teamSize) setTeamSize(data.teamSize);
        if (data.yearsExperience) setYearsExperience(data.yearsExperience);
        if (data.workMode) setWorkMode(data.workMode);
        if (data.portfolioLinks) setPortfolioLinks(data.portfolioLinks);
        if (data.certifications) setCertifications(data.certifications);
        if (data.monthlyCapacity) setMonthlyCapacity(data.monthlyCapacity);
        if (data.preferredBudgetRange) setPreferredBudgetRange(data.preferredBudgetRange);
        if (data.partnerTypeOther) setPartnerTypeOther(data.partnerTypeOther);
        if (data.pricingModelOther) setPricingModelOther(data.pricingModelOther);
        if (typeof data.step === "number") setStep(data.step);
      } catch (e) {
        console.error("Failed to parse saved onboarding data", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const data = {
      companyName, role, fullName, email, website, linkedinUrl,
      partnerType, servicesOffered, stagesServed, pricingModel, averageDealSize,
      teamSize, yearsExperience, workMode, portfolioLinks, certifications,
      monthlyCapacity, preferredBudgetRange,
      partnerTypeOther, pricingModelOther,
      step
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    companyName, role, fullName, email, website, linkedinUrl,
    partnerType, servicesOffered, stagesServed, pricingModel, averageDealSize,
    teamSize, yearsExperience, workMode, portfolioLinks, certifications,
     monthlyCapacity, preferredBudgetRange,
     partnerTypeOther, pricingModelOther,
    step
  ]);

  // If already logged in with a completed profile, send to dashboard
  const { data: existingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile", {
        headers: { "Content-Type": "application/json" },
      });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("Failed to fetch profile");
      return r.json();
    },
    enabled: !!session,
  });
  useEffect(() => {
    if (existingProfile?.onboarding_completed) {
      setLocation("/dashboard");
    }
  }, [existingProfile, setLocation]);

  // Auto-fill email from session for authenticated users
  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session, email]);

  function go(next: number) { setDir(next > step ? 1 : -1); setStep(next); }

  function canProceed() {
    switch (step) {
      case 0: return companyName.trim() && role.trim() && fullName.trim() && email.trim();
      case 1: return partnerType && (partnerType !== "Other (Specify)" || partnerTypeOther.trim()) && servicesOffered.trim() && teamSize && yearsExperience.trim() && workMode;
      case 2: return pricingModel && (pricingModel !== "Other (Specify)" || pricingModelOther.trim());
      default: return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    if (!isLoggedIn) {
      setError("Please sign in with Google to submit your profile.");
      setSubmitting(false);
      return;
    }


    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "partner",
        company_name: companyName,
        role,
        full_name: fullName,
        email,
        website: website || undefined,
        linkedin_url: linkedinUrl || undefined,
        partner_type: partnerType === "Other (Specify)" ? partnerTypeOther : partnerType,
        services_offered: servicesOffered,
        stages_served: stagesServed,
        pricing_model: pricingModel === "Other (Specify)" ? pricingModelOther : pricingModel,
        average_deal_size: averageDealSize || undefined,
        team_size: teamSize,
        years_experience: yearsExperience,
        work_mode: workMode,
        portfolio_links: portfolioLinks || undefined,
        certifications: certifications || undefined,
        monthly_capacity: monthlyCapacity || undefined,
        preferred_budget_range: preferredBudgetRange || undefined,
        onboarding_completed: true,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      setError(body.message || "Failed to save profile");
      setSubmitting(false);
      return;
    }

    const savedProfile = await res.json();
    await qc.invalidateQueries({ queryKey: ["dashboard-init"] });
    await qc.invalidateQueries({ queryKey: ["profile"] });
    setLocation("/dashboard");
  }

  const allSteps = [
    <div key="0" className="space-y-5">
      <StepHeader step={0} title="Partner Onboarding" />
      <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Agency" />
      <Field label="Your Role" value={role} onChange={setRole} placeholder="Founder, Partner, etc." />
      <Field label="Your Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
      <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@company.com" />
      <Field label="LinkedIn Profile (Optional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
      <Field label="Website Link (Optional)" value={website} onChange={setWebsite} placeholder="https://acme.com" />
    </div>,

    <div key="1" className="space-y-6">
      <StepHeader step={1} title="Partner Profile" />
      <div className="space-y-4">
        <Dropdown
          label="What type of partner are you?"
          options={["Agency", "Investor", "Service Provider", "Institutional Firm", "Other (Specify)"]}
          value={partnerType}
          onChange={setPartnerType}
        />

        {partnerType === "Other (Specify)" && (
          <Field
            label="Specify Partner Type"
            value={partnerTypeOther}
            onChange={setPartnerTypeOther}
            placeholder="e.g. Legal Firm, Marketing Agency"
          />
        )}

        <Field
          label="What services do you offer?"
          value={servicesOffered}
          onChange={setServicesOffered}
          multiline
          placeholder="Describe the specific services and value you provide..."
        />

        <Dropdown
          label="Team size"
          options={["Solo", "2-10", "11-50", "51-200", "200+"]}
          value={teamSize}
          onChange={setTeamSize}
        />

        <Field label="Years of experience" value={yearsExperience} onChange={setYearsExperience} placeholder="e.g. 5+ years" />

        <Dropdown
          label="Work mode"
          options={["Remote", "Hybrid", "Onsite"]}
          value={workMode}
          onChange={setWorkMode}
        />

        <Field label="Portfolio links (optional)" value={portfolioLinks} onChange={setPortfolioLinks} placeholder="https://..." />
      </div>
    </div>,

    <div key="2" className="space-y-6">
      <StepHeader step={2} title="Requirements" />
      <div className="space-y-4">
        <Dropdown
          label="Pricing model"
          options={["Fixed", "Hourly", "Commission", "Retainer", "Other (Specify)"]}
          value={pricingModel}
          onChange={setPricingModel}
        />

        {pricingModel === "Other (Specify)" && (
          <Field
            label="Specify Pricing Model"
            value={pricingModelOther}
            onChange={setPricingModelOther}
            placeholder="e.g. Performance-based, Hybrid"
          />
        )}

        <Field label="Average deal size (optional)" value={averageDealSize} onChange={setAverageDealSize} placeholder="e.g. $5k" />
        <Field label="Monthly capacity (optional)" value={monthlyCapacity} onChange={setMonthlyCapacity} placeholder="e.g. 2 new slots" />
        <Field label="Preferred budget range (optional)" value={preferredBudgetRange} onChange={setPreferredBudgetRange} placeholder="e.g. $10k+" />
      </div>
    </div>,
  ];

  if (!isLoggedIn && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Prodizzy" className="w-12 h-12 rounded-xl mb-4" />
            <h1 className="text-2xl font-semibold text-white">Partner Onboarding</h1>
            <p className="text-white/40 text-sm mt-2">Please sign in with Google to begin your onboarding.</p>
          </div>
          <button
            onClick={() => window.location.href = "/api/auth/google"}
            className="w-full bg-white text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
          <button onClick={() => setLocation("/")} className="text-white/25 text-xs hover:text-white/50 transition-colors">
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  const stepsToShow = allSteps.slice(0, 3);


  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <motion.div className="h-full bg-white" animate={{ width: `${((step + 1) / EFFECTIVE_STEPS) * 100}%` }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
      </div>

      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2">
          <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
          <span className="text-white font-semibold tracking-tight">Prodizzy</span>
        </button>
        <span className="text-white/25 text-xs tabular-nums">{step + 1} / {EFFECTIVE_STEPS}</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-32">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={step} custom={dir} variants={slideVariants(dir)} initial="initial" animate="animate" exit="exit">
              {stepsToShow[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        {error && isLoggedIn && (
          <p className="max-w-lg mx-auto text-red-400 text-sm mb-3">{error}</p>
        )}
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => go(step - 1)} className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {step < EFFECTIVE_STEPS - 1 ? (
            <button onClick={() => { if (canProceed()) go(step + 1); }} disabled={!canProceed()}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || submitting}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              {submitting
                ? (isLoggedIn ? "Saving…" : "Submitting…")
                : (isLoggedIn ? "Save & go to dashboard" : "Submit profile")
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
