import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogIn } from "lucide-react";

const TOTAL_STEPS = 4;

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
// ─── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const InputTag = multiline ? "textarea" : "input";
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>
      <InputTag
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 4 : undefined}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
      />
    </div>
  );
}

// ─── Single Pill ───────────────────────────────────────────────────────────────
function SinglePill({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          type="button"
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selected === o
            ? "bg-white text-black border-white"
            : "bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white"
            }`}
        >
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

// ─── Animation Variants ────────────────────────────────────────────────────────
const slideVariants = (dir: number) => ({
  initial: { x: dir > 0 ? 20 : -20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
});

// ─── Main component ────────────────────────────────────────────────────────────
export default function Onboard() {
  // Always scroll to top when opening the form
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { session, loading } = useAuth();
  const qc = useQueryClient();
  const isLoggedIn = !!session;
  // Account creation step (step 3) is removed, now we only use Google Login
  const EFFECTIVE_STEPS = 3;

  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // SECTION 1: BASIC DETAILS
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // SECTION 2: STARTUP PROFILE
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [location, setLocation2] = useState("");
  const [isRegistered, setIsRegistered] = useState("");

  // SECTION 3: PRODUCT & TRACTION
  const [productDesc, setProductDesc] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [numUsers, setNumUsers] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [tractionHighlights, setTractionHighlights] = useState("");

  // Final Step: Account
  const [password, setPassword] = useState("");

  // If already logged in with a completed profile, send to dashboard (e.g. user landed on /join-startup again)
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

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function canProceed() {
    switch (step) {
      case 0: return companyName.trim() && role.trim() && fullName.trim() && email.trim();
      case 1: return stage && industry.length > 0 && (!industry.includes("Other") || customIndustry.trim()) && teamSize && location.trim() && isRegistered;
      case 2: return productDesc.trim() && targetAudience.trim();
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

    // 2. Save profile
    const profilePayload = {
      company_name: companyName,
      role,
      full_name: fullName,
      email,
      phone,
      website,
      linkedin_url: linkedinUrl,
      stage,
      industry: industry.map(i => i === "Other" ? customIndustry : i),
      team_size: teamSize,
      location,
      is_registered: isRegistered,
      product_description: productDesc,
      target_audience: targetAudience,
      num_users: numUsers,
      monthly_revenue: monthlyRevenue,
      traction_highlights: tractionHighlights,
      type: "startup",
      onboarding_completed: true,
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      console.error("Profile save failed:", res.status, body);
      setError(`Save failed (${res.status}): ${body.message || "Unknown error"}`);
      setSubmitting(false);
      return;
    }

    const savedProfile = await res.json();
    console.log("Profile saved successfully:", savedProfile);

    // Seed the profile cache so Dashboard sees the profile immediately (avoids race/404)
    qc.setQueryData(["profile"], savedProfile);
    setLocation("/dashboard");
  }

  const allSteps = [
    // Step 0: Basic Details
    <div key="0" className="space-y-5">
      <StepHeader
        step={0}
        title="Startup Onboarding"
      />
      <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="e.g. Acme Inc." />
      <Field label="Your Role" value={role} onChange={setRole} placeholder="e.g. Founder, CEO, etc." />
      <Field label="Your Name" value={fullName} onChange={setFullName} placeholder="e.g. Alex Chen" />
      <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@startup.com" />
      <Field label="Phone Number (Optional)" value={phone} onChange={setPhone} placeholder="e.g. +91 98765 43210" />
      <Field label="LinkedIn Profile (Optional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/alexchen" />
      <Field label="Website Link (Optional)" value={website} onChange={setWebsite} placeholder="https://acme.com" />
    </div>,

    // Step 1: Startup Profile
    <div key="1" className="space-y-6">
      <StepHeader
        step={1}
        title="Startup Profile"
      />
      <Dropdown
        label="Startup Stage"
        options={["Pre-Seed (Ideation Stage)", "Seed (MVP & Early traction)", "Series A (Generating Revenue)", "Series B/C/D (Expansion & Scaling)", "MNC (Global)"]}
        value={stage}
        onChange={setStage}
      />
      <Dropdown
        label="Industry"
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
          "Other"
        ]}
        value={industry[0] || ""}
        onChange={v => setIndustry([v])}
        placeholder="Select industry"
      />
      {industry.includes("Other") && (
        <Field
          label="Custom Industry"
          value={customIndustry}
          onChange={setCustomIndustry}
          placeholder="Type your industry..."
        />
      )}
      <Dropdown
        label="Team Size"
        options={["Solo", "2–10", "11–50", "51–500", "500–1000", "1000+"]}
        value={teamSize}
        onChange={setTeamSize}
      />
      <Field label="Location" value={location} onChange={setLocation2} placeholder="e.g. Bangalore, India" />
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Is your startup registered?</p>
        <SinglePill
          options={["Yes", "No"]}
          selected={isRegistered}
          onSelect={setIsRegistered}
        />
      </div>
    </div>,

    // Step 2: Product & Traction
    <div key="2" className="space-y-5">
      <StepHeader
        step={2}
        title="Product & Traction"
      />
      <Field
        label="Describe your product"
        value={productDesc}
        onChange={setProductDesc}
        placeholder="e.g. We help SMEs manage supply chains using AI..."
        multiline
      />
      <Field label="Who is your target audience?" value={targetAudience} onChange={setTargetAudience} placeholder="e.g. Logistics companies in Southeast Asia" />
      <Field label="Number of users/customers (if any)" value={numUsers} onChange={setNumUsers} placeholder="e.g. 50 active businesses" />
      <Field label="Monthly revenue (if any)" value={monthlyRevenue} onChange={setMonthlyRevenue} placeholder="e.g. $5,000 MRR" />
      <Field
        label="Key traction highlights (growth, milestones)"
        value={tractionHighlights}
        onChange={setTractionHighlights}
        placeholder="e.g. 20% WoW growth, 1 patent filed, 2 institutional partners..."
        multiline
      />
    </div>,

  ];

  // We only show the first 3 steps
  const steps = allSteps.slice(0, 3);

  if (!isLoggedIn && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Prodizzy" className="w-12 h-12 rounded-xl mb-4" />
            <h1 className="text-2xl font-semibold text-white">Startup Onboarding</h1>
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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <motion.div
          className="h-full bg-white"
          animate={{ width: `${((step + 1) / EFFECTIVE_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex flex-col">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2">
            <img src="/logo.png" alt="Prodizzy" className="w-7 h-7 rounded-md" />
            <span className="text-white font-semibold tracking-tight">Prodizzy</span>
          </button>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium mt-1 ml-9">Startup Onboarding</span>
        </div>
        <span className="text-white/25 text-xs tabular-nums">
          {step + 1} / {EFFECTIVE_STEPS}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-32">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants(dir)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        {error && isLoggedIn && (
          <p className="max-w-lg mx-auto text-red-400 text-sm mb-3">{error}</p>
        )}
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => go(step - 1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {step < EFFECTIVE_STEPS - 1 ? (
            <button
              onClick={() => { if (canProceed()) go(step + 1); }}
              disabled={!canProceed()}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {submitting
                ? (isLoggedIn ? "Saving…" : "Creating your account…")
                : (isLoggedIn ? "Save & go to dashboard" : "Create account & go to dashboard")
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step header ───────────────────────────────────────────────────────────────
function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Step {step + 1}</p>
      <h1 className="text-3xl font-semibold text-white tracking-tight leading-8">{title}</h1>
    </div>
  );
}
