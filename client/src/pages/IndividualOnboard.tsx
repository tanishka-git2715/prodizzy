import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogIn } from "lucide-react";

const TOTAL_STEPS = 6;

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

export default function IndividualOnboard() {
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Step 2-3: Profile & Requirements
  const [profileType, setProfileType] = useState("");
  const [preferredRoles, setPreferredRoles] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [availability, setAvailability] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [expectedPay, setExpectedPay] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  // Step 6: Proof + Account
  const [password, setPassword] = useState("");

  // --- Persistence Logic ---
  const STORAGE_KEY = "prodizzy_onboard_individual_v1";

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl);
        if (data.portfolioUrl) setPortfolioUrl(data.portfolioUrl);
        if (data.profileType) setProfileType(data.profileType);
        if (data.preferredRoles) setPreferredRoles(data.preferredRoles);
        if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
        if (data.lookingFor) setLookingFor(data.lookingFor);
        if (data.availability) setAvailability(data.availability);
        if (data.workMode) setWorkMode(data.workMode);
        if (data.userLocation) setUserLocation(data.userLocation);
        if (data.expectedPay) setExpectedPay(data.expectedPay);
        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
        if (typeof data.step === "number") setStep(data.step);
      } catch (e) {
        console.error("Failed to parse saved onboarding data", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const data = {
      fullName, email, phone, linkedinUrl, portfolioUrl,
      profileType, preferredRoles, experienceLevel, lookingFor,
      availability, workMode, userLocation, expectedPay, resumeUrl,
      step
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [
    fullName, email, phone, linkedinUrl, portfolioUrl,
    profileType, preferredRoles, experienceLevel, lookingFor,
    availability, workMode, userLocation, expectedPay, resumeUrl,
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
      case 0: return fullName.trim() && email.trim();
      case 1: return profileType && preferredRoles.trim() && experienceLevel;
      case 2: return lookingFor && availability && workMode && userLocation;
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
        full_name: fullName,
        email,
        phone,
        linkedin_url: linkedinUrl || undefined,
        portfolio_url: portfolioUrl || undefined,
        profile_type: profileType,
        preferred_roles: preferredRoles,
        experience_level: experienceLevel,
        looking_for: lookingFor,
        availability,
        work_mode: workMode,
        location: userLocation,
        expected_pay: expectedPay || undefined,
        resume_url: resumeUrl || undefined,
        type: "individual",
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      setError(body.message || "Failed to save profile");
      setSubmitting(false);
      return;
    }

    const savedProfile = await res.json();
    // Seed the profile cache so Dashboard sees the profile immediately
    qc.setQueryData(["profile"], savedProfile);
    localStorage.removeItem(STORAGE_KEY);
    setLocation("/dashboard");
  }

  const steps = [
    <div key="0" className="space-y-5">
      <StepHeader step={0} title="Individual Onboarding" />
      <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Jane Smith" />
      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@email.com" />
      <Field label="Phone (Optional)" value={phone} onChange={setPhone} placeholder="+1 234 567 8900" />
      <Field label="LinkedIn (Optional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/..." />
      <Field label="Portfolio (Optional)" value={portfolioUrl} onChange={setPortfolioUrl} placeholder="https://yoursite.com" />
      <Field label="Resume Link (Optional)" value={resumeUrl} onChange={setResumeUrl} placeholder="Google Drive, Dropbox, etc." />
    </div>,

    <div key="1" className="space-y-6">
      <StepHeader step={1} title="Individual Profile" />
      <div className="space-y-4">
        <Dropdown
          label="You are"
          options={["Student", "Freelancer", "Professional", "Content Creator", "Community Admin"]}
          value={profileType}
          onChange={setProfileType}
        />
        <Field
          label="Preferred role / Services you provide"
          value={preferredRoles}
          onChange={setPreferredRoles}
          multiline
          placeholder="Describe your core expertise and what you offer..."
        />
        <Dropdown
          label="Experience level"
          options={["Fresher", "0-2 years", "2-4 years", "4+ years"]}
          value={experienceLevel}
          onChange={setExperienceLevel}
        />
      </div>
    </div>,

    <div key="2" className="space-y-6">
      <StepHeader step={2} title="Requirements" />
      <div className="space-y-4">
        <Dropdown
          label="Looking for"
          options={["Job", "Internship", "Freelance", "Collaboration"]}
          value={lookingFor}
          onChange={setLookingFor}
        />
        <Dropdown
          label="Availability"
          options={["Full-time", "Part-time", "Project-based"]}
          value={availability}
          onChange={setAvailability}
        />
        <Dropdown
          label="Work mode"
          options={["Remote", "Hybrid", "Onsite"]}
          value={workMode}
          onChange={setWorkMode}
        />
        <Field label="Location" value={userLocation} onChange={setUserLocation} placeholder="City, Country" />
        <Field label="Expected pay (optional)" value={expectedPay} onChange={setExpectedPay} placeholder="e.g. $50k/year or $40/hr" />
      </div>
    </div>,
  ];

  if (!isLoggedIn && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Prodizzy" className="w-12 h-12 rounded-xl mb-4" />
            <h1 className="text-2xl font-semibold text-white">Individual Onboarding</h1>
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
              {submitting ? "Saving profile…" : "Save profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
