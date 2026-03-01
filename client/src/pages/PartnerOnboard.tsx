import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft } from "lucide-react";

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

  const { session } = useAuth();
  const qc = useQueryClient();
  const isLoggedIn = !!session;
  // When already logged in, skip the account-creation step (step 5)
  const EFFECTIVE_STEPS = isLoggedIn ? TOTAL_STEPS - 1 : TOTAL_STEPS;

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
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Step 2: Partner Type
  const [partnerType, setPartnerType] = useState("");

  // Step 3: Offerings
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [industriesServed, setIndustriesServed] = useState<string[]>([]);
  const [stagesServed, setStagesServed] = useState<string[]>([]);
  const [pricingModel, setPricingModel] = useState("");
  const [averageDealSize, setAverageDealSize] = useState("");

  // Step 4: Capability
  const [teamSize, setTeamSize] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [toolsTechStack, setToolsTechStack] = useState("");
  const [workMode, setWorkMode] = useState("");

  // Step 5: Proof
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [caseStudies, setCaseStudies] = useState("");
  const [pastClients, setPastClients] = useState("");
  const [certifications, setCertifications] = useState("");

  // Step 6: Intent + Account
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [monthlyCapacity, setMonthlyCapacity] = useState("");
  const [preferredBudgetRange, setPreferredBudgetRange] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in with a completed profile, send to dashboard
  const { data: existingProfile } = useQuery({
    queryKey: ["partner-profile"],
    queryFn: async () => {
      if (!session?.access_token) return null;
      const r = await fetch("/api/partner", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
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
      case 1: return partnerType && servicesOffered.length > 0 && industriesServed.length > 0 && stagesServed.length > 0;
      case 2: return teamSize && yearsExperience && workMode;
      case 3: return lookingFor.length > 0 && password.length >= 6;
      default: return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    let token: string;

    if (isLoggedIn) {
      // Already authenticated — skip signUp, just save the profile
      token = session!.access_token;
    } else {
      // Sign up with Firebase
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const t = await userCredential.user.getIdToken();
        token = t;
      } catch (error: any) {
        setError(error.message);
        setSubmitting(false);
        return;
      }
    }

    const res = await fetch("/api/partner", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        company_name: companyName,
        role,
        full_name: fullName,
        email,
        phone,
        website: website || undefined,
        linkedin_url: linkedinUrl || undefined,
        partner_type: partnerType,
        services_offered: servicesOffered,
        industries_served: industriesServed,
        stages_served: stagesServed,
        pricing_model: pricingModel || undefined,
        average_deal_size: averageDealSize || undefined,
        team_size: teamSize,
        years_experience: yearsExperience,
        tools_tech_stack: toolsTechStack || undefined,
        work_mode: workMode,
        portfolio_links: portfolioLinks || undefined,
        case_studies: caseStudies || undefined,
        past_clients: pastClients || undefined,
        certifications: certifications || undefined,
        looking_for: lookingFor,
        monthly_capacity: monthlyCapacity || undefined,
        preferred_budget_range: preferredBudgetRange || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      setError(body.message || "Failed to save profile");
      setSubmitting(false);
      return;
    }

    const savedProfile = await res.json();
    console.log("Partner profile saved successfully:", savedProfile);

    // Verify profile was saved successfully before redirecting
    const verifyRes = await fetch("/api/partner", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!verifyRes.ok) {
      const verifyBody = await verifyRes.json().catch(() => ({ message: "Unknown" }));
      console.error("Profile verification failed:", verifyRes.status, verifyBody);
      setError(`Verification failed (${verifyRes.status}): ${verifyBody.message}. Try signing in again.`);
      setSubmitting(false);
      return;
    }

    const verifiedProfile = await verifyRes.json();
    console.log("Partner profile verified:", verifiedProfile);
    // Seed the profile cache so Dashboard sees the profile immediately
    qc.setQueryData(["partner-profile"], verifiedProfile);
    setLocation("/dashboard");
  }

  const allSteps = [
    <div key="0" className="space-y-5">
      <StepHeader step={0} title="Partner Onboarding" />
      <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Agency" />
      <Field label="Your Role" value={role} onChange={setRole} placeholder="Founder, Partner, etc." />
      <Field label="Your Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
      <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@company.com" />
      <Field label="Phone Number (Optional)" value={phone} onChange={setPhone} placeholder="+1 234 567 8900" />
      <Field label="LinkedIn Profile (Optional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
      <Field label="Website Link (Optional)" value={website} onChange={setWebsite} placeholder="https://acme.com" />
    </div>,

    <div key="1" className="space-y-6">
      <StepHeader step={1} title="Partner Profile & Offerings" />
      <div className="space-y-4">
        <Dropdown
          label="Partner Type"
          options={["Agency", "Investor", "Service Provider", "Institutional Firm"]}
          value={partnerType}
          onChange={setPartnerType}
        />

        <MultiSelectDropdown
          label="Services offered"
          options={["Development", "Design", "Marketing", "Sales", "Operations", "Funding", "Consulting", "Other"]}
          selected={servicesOffered}
          onToggle={v => setServicesOffered(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])}
        />

        <MultiSelectDropdown
          label="Industries you serve"
          options={[
            "Software & AI",
            "E-commerce & Retail",
            "Finance & Payments",
            "Healthcare & Wellness",
            "Education & Training",
            "Food & Beverage",
            "Transportation & Delivery",
            "Real Estate & Construction",
            "Marketing & Advertising",
            "Energy & Sustainability",
            "Any"
          ]}
          selected={industriesServed}
          onToggle={v => setIndustriesServed(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])}
        />

        <MultiSelectDropdown
          label="Stages you work with"
          options={["Pre-Seed (Idea Stage)", "Seed (MVP & Validation)", "Series A (Growth)", "Expansion (Scaling)", "MNC (Global)"]}
          selected={stagesServed}
          onToggle={v => setStagesServed(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Pricing model (optional)" value={pricingModel} onChange={setPricingModel} placeholder="Fixed, Hourly, etc." />
          <Field label="Avg deal size (optional)" value={averageDealSize} onChange={setAverageDealSize} placeholder="$5K-$50K" />
        </div>
      </div>
    </div>,

    <div key="2" className="space-y-6">
      <StepHeader step={2} title="Capability & Proof" />
      <div className="space-y-4">
        <Dropdown
          label="Team size"
          options={["Solo", "2-10", "11-50", "100+"]}
          value={teamSize}
          onChange={setTeamSize}
        />
        <Dropdown
          label="Experience"
          options={["<1y", "1-3y", "3-5y", "5y+"]}
          value={yearsExperience}
          onChange={setYearsExperience}
        />
        <Dropdown
          label="Work mode"
          options={["Remote", "Hybrid", "Onsite"]}
          value={workMode}
          onChange={setWorkMode}
        />
        <Field label="Portfolio / Case Studies (optional)" value={portfolioLinks} onChange={setPortfolioLinks} placeholder="Describe your best work or link to it..." multiline />
        <Field label="Past Clients & Tools (optional)" value={pastClients} onChange={setPastClients} placeholder="Notable clients or technology used..." multiline />
      </div>
    </div>,

    <div key="3" className="space-y-6">
      <StepHeader step={3} title="Final steps" />
      <MultiSelectDropdown
        label="Looking for"
        options={["Clients", "Deal flow", "Partnerships"]}
        selected={lookingFor}
        onToggle={v => setLookingFor(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Monthly capacity (optional)" value={monthlyCapacity} onChange={setMonthlyCapacity} placeholder="e.g. 2 new slots" />
        <Field label="Preferred budget (optional)" value={preferredBudgetRange} onChange={setPreferredBudgetRange} placeholder="e.g. $5K+" />
      </div>
      <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="Min 6 characters" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>,
  ];

  // When logged in, skip the account-creation step (last step)
  const steps = isLoggedIn ? allSteps.slice(0, 3) : allSteps;

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
              {steps[step]}
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
                ? (isLoggedIn ? "Saving…" : "Creating account…")
                : (isLoggedIn ? "Save & go to dashboard" : "Create account")
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
