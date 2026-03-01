import { useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, LogIn } from "lucide-react";

const TOTAL_STEPS = 5;

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

function MultiPill({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onToggle(o)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${selected.includes(o) ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white/80"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function InvestorOnboard() {
  const { session, loading } = useAuth();
  const isLoggedIn = !!session;
  const EFFECTIVE_STEPS = 4;

  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [checkSize, setCheckSize] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [geography, setGeography] = useState("");
  const [thesis, setThesis] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function go(next: number) { setDir(next > step ? 1 : -1); setStep(next); }

  function canProceed() {
    switch (step) {
      case 0: return name.trim();
      case 1: return investorType;
      case 2: return checkSize && stages.length > 0;
      case 3: return sectors.length > 0;
      case 4: return true;
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
        type: "investor",
        name,
        firm_name: firmName || undefined,
        investor_type: investorType,
        check_size: checkSize,
        stages,
        sectors,
        geography,
        thesis: thesis || undefined
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Unknown error" }));
      setError(body.message || "Failed to save profile");
      setSubmitting(false);
      return;
    }

    // Verify investor profile was saved before redirecting
    const verifyRes = await fetch("/api/profile", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!verifyRes.ok) {
      setError("Profile saved but couldn't verify. Please try signing in again.");
      setSubmitting(false);
      return;
    }

    setLocation("/discover");
  }

  const steps = [
    <div key="0" className="space-y-5">
      <StepHeader step={0} title="Investor Onboarding" />
      <Field label="Your Name" value={name} onChange={setName} placeholder="Sarah Kim" />
      <Field label="Firm Name (Optional)" value={firmName} onChange={setFirmName} placeholder="Sequoia Capital" />
    </div>,

    <div key="1" className="space-y-6">
      <StepHeader step={1} title="Your investor type." />
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Type</p>
        <SinglePill options={["VC", "Angel", "Family Office", "Strategic", "Other"]} selected={investorType} onSelect={setInvestorType} />
      </div>
    </div>,

    <div key="2" className="space-y-6">
      <StepHeader step={2} title="Cheque & stage." />
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Cheque size</p>
        <SinglePill options={["<$50k", "$50k-$250k", "$250k-$1M", "$1M-$5M", "$5M+"]} selected={checkSize} onSelect={setCheckSize} />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Stages you invest in</p>
        <MultiPill options={["Pre-Seed (Idea Stage)", "Seed (MVP & Validation)", "Series A (Growth)", "Expansion (Scaling)", "MNC (Global)"]} selected={stages}
          onToggle={v => setStages(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])} />
      </div>
    </div>,

    <div key="3" className="space-y-6">
      <StepHeader step={3} title="Your focus areas." />
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Sectors</p>
        <MultiPill options={[
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
        ]} selected={sectors}
          onToggle={v => setSectors(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])} />
      </div>
      <Field label="Geography (optional)" value={geography} onChange={setGeography} placeholder="India, Southeast Asia, Global" />
      <Field label="Investment thesis (optional)" value={thesis} onChange={setThesis} placeholder="We back founders solving infrastructure problems in emerging markets." multiline />
    </div>,

  ];

  if (!isLoggedIn && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Prodizzy" className="w-12 h-12 rounded-xl mb-4" />
            <h1 className="text-2xl font-semibold text-white">Investor Onboarding</h1>
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

  const stepsToShow = steps.slice(0, 4);


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
              {submitting ? "Saving profile…" : "Save profile & browse startups"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
