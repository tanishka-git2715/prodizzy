import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/AuthForm";

export default function Login() {
  const { session, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);

  // If already logged in OR just authenticated, redirect straight to the right place
  useEffect(() => {
    if (!authLoading && session && session.user?.profileStatus) {
      if (session.user.profileStatus.hasCompletedProfile) {
        setLocation("/dashboard");
      } else {
        setLocation("/individual-onboard");
      }
    }
  }, [session, authLoading, setLocation, authSuccess]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <AuthForm 
            initialTab="signin" 
            onSuccess={() => setAuthSuccess(true)}
          />
        </div>

        <p className="text-center mt-10 text-white/20 text-xs tracking-wide">
          By continuing, you agree to our <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Terms of Service</span> and <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
