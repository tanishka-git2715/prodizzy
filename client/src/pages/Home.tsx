import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { WebGLMeshBackground } from "@/components/WebGLMeshBackground";
import { useAuth } from "@/hooks/use-auth";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";

const RED = "#E63946";

const scrollReveal = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scrollRevealViewport = { once: true, margin: "-80px", amount: 0.2 };

export default function Home() {
  const [location, setLocation] = useLocation();
  const { session, loginWithGoogle } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [pendingRole, setPendingRole] = useState<"startup" | "partner" | "individual" | "intent_join" | null>(() => {
    // Restore pendingRole from sessionStorage after Google OAuth redirect
    try {
      const saved = sessionStorage.getItem("prodizzy-pending-role");
      if (saved) {
        sessionStorage.removeItem("prodizzy-pending-role");
        return saved as "startup" | "partner" | "individual" | "intent_join";
      }
    } catch { /* ignore */ }
    return null;
  });

  // Smooth typing animation for hero subtitle
  const fullText = "Stop relying on random connections. Get matched with the right people for hiring, partnerships, growth, and fundraising.";
  const [typedCount, setTypedCount] = useState(0);

  // Always start at top
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Type out hero subtitle text once on load
  useEffect(() => {
    let i = 0;
    const speed = 18; // ms per character for smooth animation

    const interval = setInterval(() => {
      i += 1;
      setTypedCount(i);
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText]);

  // Insert the responsive break precisely into the typed text
  const breakIndex1 = fullText.indexOf(" matched");
  const breakIndex2 = fullText.indexOf("partnerships");

  const renderHeroSubtitle = () => {
    if (typedCount < breakIndex1) {
      return fullText.slice(0, typedCount);
    }
    if (typedCount < breakIndex2) {
      return (
        <>
          {fullText.slice(0, breakIndex1)}
          <br className="block sm:hidden" />
          {fullText.slice(breakIndex1, typedCount)}
        </>
      );
    }
    return (
      <>
        {fullText.slice(0, breakIndex1)}
        <br className="block sm:hidden" />
        {fullText.slice(breakIndex1, breakIndex2)}
        <br className="block sm:hidden" />
        {fullText.slice(breakIndex2, typedCount)}
      </>
    );
  };

  // Check if signed-in user already has a completed profile (backend uses single /api/profile for all types)
  const { data: profileStatus, isFetching: loadingProfile } = useQuery({
    queryKey: ["profile-status", session?.user?.id],
    queryFn: async () => {
      const profileRes = await fetch("/api/profile");
      const hasProfile = profileRes.ok;
      let hasCompletedProfile = false;
      if (hasProfile) {
        const data = await profileRes.json();
        hasCompletedProfile = !!data?.onboarding_completed;
      }
      return {
        hasProfile,
        hasCompletedProfile,
        needsOnboarding: profileRes.status === 404,
      };
    },
    enabled: !!session,
  });

  const [authSuccess, setAuthSuccess] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = sessionStorage.getItem("prodizzy-auth-success");
      if (saved === "true") {
        sessionStorage.removeItem("prodizzy-auth-success");
        return true;
      }
    } catch { /* ignore */ }
    return false;
  });

  // 1. PRIORITY: Redirect returning users to dashboard or onboarding
  useEffect(() => {
    if (session && !loadingProfile && profileStatus) {
      if (profileStatus.hasCompletedProfile) {
        if (location === "/") setLocation("/dashboard");
      }
      // REMOVED: Automatic redirect to /individual-onboard. 
      // This allows users to remain on the landing page if they choose.

      // Cleanup any pending intents for returning users
      if (profileStatus.hasCompletedProfile && pendingRole) setPendingRole(null);
    }
  }, [session, profileStatus, loadingProfile, location, setLocation, pendingRole, showAuthModal]);

  // 2. Intent Processing: Handles redirections for NEW users immediately after auth
  useEffect(() => {
    if (!session || showAuthModal || loadingProfile || !profileStatus || profileStatus.hasCompletedProfile) return;

    if (pendingRole && authSuccess) {
      // All paths now go to Individual Onboarding first for new users
      setLocation("/individual-onboard");
      setPendingRole(null);
      setAuthSuccess(false);
    }
  }, [session, profileStatus, loadingProfile, pendingRole, showAuthModal, location, setLocation, authSuccess]);

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };


  // If user clicks "Join now": 
  // - If fully onboarded, go straight to dashboard
  // - If logged in but profile status is still loading/unknown, optimistically go to dashboard
  // - If logged in but not onboarded, go straight to role selection (no extra sign-in)
  // - If not logged in, open auth modal
  const handleJoinNow = () => {
    if (session) {
      if (profileStatus?.hasCompletedProfile) {
        setLocation("/dashboard");
      } else {
        setLocation("/individual-onboard");
      }
      return;
    }

    // Not logged in: open auth modal and remember intent
    setPendingRole("intent_join");
    setShowAuthModal(true);
  };


  const scrollToHow = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRoleCardClick = (role: "startup" | "partner" | "individual") => {
    if (session) {
      // If user is fully onboarded OR we don't yet know (profile still loading),
      // treat this as a dashboard entry instead of re-onboarding.
      if (profileStatus?.hasCompletedProfile || loadingProfile || !profileStatus) {
        setLocation("/dashboard");
        return;
      }

      // Logged-in but not yet onboarded: always go to individual onboarding
      setLocation("/individual-onboard");
      return;
    }

    // Not logged in: open auth modal and remember chosen role
    setPendingRole(role);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#08090A", fontFamily: "'Inter', sans-serif" }}>
      <WebGLMeshBackground />
      <div
        className="fixed inset-x-0 top-0 h-[520px] pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% -5%, rgba(230,57,70,0.11) 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* ── NAV ── */}
        <header
          className="fixed top-0 inset-x-0 z-50"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(14px)",
            background: "rgba(8,9,10,0.8)",
          }}
        >
          <div className="w-full px-4 h-[58px] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Prodizzy" className="w-6 h-6 object-contain" />
              <span className="text-[14px] font-semibold tracking-tight">Prodizzy</span>
            </div>
            <button
              onClick={handleJoinNow}
              className="h-[38px] px-6 rounded-lg font-medium text-[13px] text-white transition-all hover:opacity-90"
              style={{ background: RED, boxShadow: `0 0 20px -6px rgba(230,57,70,0.4)` }}
            >
              Join Now
            </button>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[58px]">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
              className="font-bold leading-[1.08] tracking-[-0.035em] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.8rem, 7vw, 5.2rem)" }}
            >
              Turn Intent into
              <br />
              <span style={{ color: RED }}>Outcomes</span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
              className="text-[14.5px] sm:text-[20px] md:text-[22px] leading-relaxed mb-10 max-w-2xl mx-auto px-1 sm:px-0"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {renderHeroSubtitle()}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={handleJoinNow}
                className="h-[50px] px-9 rounded-xl font-semibold text-[15px] text-white transition-opacity hover:opacity-90"
                style={{ background: RED, boxShadow: `0 0 32px -6px rgba(230,57,70,0.5)` }}
              >
                Get started →
              </button>
              <button
                onClick={scrollToHow}
                className="h-[50px] px-8 rounded-xl text-[14px] font-medium transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                How it works
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <motion.section
          id="how-it-works"
          className="px-6 py-24"
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
          variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
        >
          <motion.h2
            variants={scrollReveal}
            className="text-3xl sm:text-4xl font-bold text-center mb-16 tracking-[-0.025em]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            How it works ?
          </motion.h2>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Define your stage",
                desc: "Define your startup stage and current needs.",
              },
              {
                step: "2",
                title: "Get matched",
                desc: "Get matched with the right people and collaborators.",
              },
              {
                step: "3",
                title: "Track & automate",
                desc: "Track conversations, get insights, and automate follow-ups.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scrollReveal}
                custom={i}
                className="px-6 py-7 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                <div
                  className="text-5xl font-bold mb-4 tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: RED, opacity: 0.3 }}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── ROLE CARDS ── */}
        <motion.section
          className="px-6 py-24"
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        >
          <motion.h2
            variants={scrollReveal}
            className="text-3xl sm:text-4xl font-bold text-center mb-4 tracking-[-0.025em]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Who is Prodizzy for ?
          </motion.h2>
          <motion.p
            variants={scrollReveal}
            custom={1}
            className="text-center text-[13.5px] sm:text-[19px] md:text-[21px] mb-16 max-w-2xl mx-auto px-1 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Whether you're building, investing, or looking for <br /> opportunities — we have a place for you.
          </motion.p>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Join as Startup",
                desc: "Build and scale your startup with the right people, partners, and capital.",
                for: "For founders from ideation to growth stage and beyond",
                action: () => handleRoleCardClick("startup" as const),
              },
              {
                title: "Join as Partner",
                desc: "Access high-intent startups actively looking for your expertise.",
                for: "For agencies, service providers, investors, and institutional firms",
                action: () => handleRoleCardClick("partner" as const),
              },
              {
                title: "Join as Individual",
                desc: "Receive curated opportunities based on your profile and preferences.",
                for: "For job seekers, freelancers, creators, and community admins",
                action: () => handleRoleCardClick("individual" as const),
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={scrollReveal}
                custom={i + 2}
                className="px-7 py-8 rounded-2xl cursor-pointer transition-all group"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.22)" }}
                onClick={card.action}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(230,57,70,0.5)";
                  e.currentTarget.style.background = "rgba(230,57,70,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                <h3 className="text-xl font-semibold mb-3 group-hover:text-[#E63946] transition-colors">{card.title}</h3>
                <p className="text-[14px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {card.desc}
                </p>
                <p className="text-[13px] italic mb-5" style={{ color: "rgba(255,255,255,0.28)" }}>
                  &ldquo;{card.for}&rdquo;
                </p>
                <span
                  className="text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Get started <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── VALUE STRIP ── */}
        <motion.section
          className="px-6 py-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <p
            className="text-center text-2xl sm:text-3xl font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(255,255,255,0.7)" }}
          >
            Built for <span style={{ color: RED }}>high-intent networking</span>,
            <br />
            not passive browsing.
          </p>
        </motion.section>

        {/* ── FINAL CTA (TEXT ONLY) ── */}
        <motion.section
          className="px-6 py-28"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="max-w-lg mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-8 tracking-[-0.025em]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Start building with the <br className="block sm:hidden" />
              right people, not just <br className="block sm:hidden" />
              more connections.
            </h2>
            <button
              onClick={handleJoinNow}
              className="h-[50px] px-10 rounded-xl font-semibold text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ background: RED, boxShadow: `0 0 32px -6px rgba(230,57,70,0.5)` }}
            >
              Join Now
            </button>
          </div>
        </motion.section>

        {/* ── FOOTER ── */}
        <motion.footer
          className="px-8 py-7"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="w-full relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            {/* Left – brand */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Prodizzy" className="w-4 h-4 object-contain opacity-35" />
              <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                Prodizzy
              </span>
            </div>

            {/* Center – social icons */}
            <div className="flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-3">
              <span className="text-[12px] uppercase tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>
                Follow us on :
              </span>
              <div className="flex items-center gap-4">
                {/* WhatsApp */}
                <a href="https://whatsapp.com/channel/0029Vb7CsZ9545uqrfyUch0a" target="_blank" rel="noreferrer"
                  className="transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.767.469 3.424 1.288 4.851L2 22l5.302-1.391c1.405.776 3.012 1.218 4.729 1.218 5.523 0 10-4.477 10-10s-4.477-10-10-10zm4.529 14.39c-.244.686-1.42 1.259-1.975 1.343-.496.075-1.004.111-1.498.111-2.975 0-5.69-2.037-6.837-4.116-.639-1.157-1.037-2.527-.905-3.924.053-.183.155-.355.293-.496.402-.416.817-.834 1.233-1.25.101-.11.232-.178.373-.178.147 0 .284.054.392.152.541.537 1.082 1.075 1.621 1.613.111.112.17.25.17.398s-.059.296-.168.406c-.211.211-.421.422-.632.632-.119.119-.17.284-.131.436.141.49.404 1.026.742 1.488.341.467.785.864 1.298 1.156.139.08.311.087.456.023.264-.127.525-.262.784-.396.14-.072.301-.064.432.03.541.343 1.082.686 1.622 1.028.134.086.216.223.216.368 0 .14-.072.28-.184.398-.242.233-.483.466-.726.7z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/prodizzy/" target="_blank" rel="noreferrer"
                  className="transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/prodizzy_official/" target="_blank" rel="noreferrer"
                  className="transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@Prodizzy2026" target="_blank" rel="noreferrer"
                  className="transition-opacity hover:opacity-80" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right – contact links */}
            <div className="flex items-center gap-4">
              <a href="mailto:contactprodizzy@gmail.com"
                className="text-[13px] transition-opacity hover:opacity-80 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                Email
              </a>
              <a href="https://calendly.com/tashukhandelwal27/prodizzy" target="_blank" rel="noreferrer"
                className="text-[13px] transition-opacity hover:opacity-80 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
                Schedule a call
              </a>
            </div>
          </div>
        </motion.footer>
      </div>


      {/* ── AUTH MODAL ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-2xl p-8"
            style={{ background: "#0D0E0F", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AuthForm
              onSuccess={() => {
                setAuthSuccess(true);
                setShowAuthModal(false);
              }}
              initialTab={authMode}
              pendingRole={pendingRole}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

