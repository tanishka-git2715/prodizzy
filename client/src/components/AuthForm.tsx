import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthFormProps {
    onSuccess?: () => void;
    initialTab?: "signup" | "signin";
    pendingRole?: string | null;
    redirectUrl?: string;
}

export function AuthForm({ onSuccess, initialTab = "signup", pendingRole, redirectUrl }: AuthFormProps) {
    const { loginWithGoogle, sendOtp, verifyOtp, error } = useAuth();
    const [activeTab, setActiveTab] = useState<"signup" | "signin">(initialTab);

    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!email) {
            setLocalError("Please enter your email");
            return;
        }

        setIsLoading(true);
        const res = await sendOtp({ email });
        setIsLoading(false);

        if (res.success) {
            setStep("otp");
        } else {
            setLocalError(res.message || "Failed to send code");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!otp || otp.length !== 6) {
            setLocalError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        const res = await verifyOtp({ email, otp });

        if (res.success) {
            // Let the parent/callback handle redirection logic
            if (onSuccess) onSuccess();
        } else {
            setIsLoading(false);
            setLocalError(res.message || "Invalid code");
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    {activeTab === "signup" ? "Join Prodizzy" : "Welcome Back"}
                </h2>
                <p className="text-white/40 text-sm">
                    {activeTab === "signup" ? "Create your account to get started" : "Sign in to your account"}
                </p>
            </div>

            <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5">
                <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "signup"
                        ? "bg-[#1A1A1A] text-white shadow-lg border border-white/5"
                        : "text-white/40 hover:text-white/60"
                        }`}
                >
                    Sign up
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "signin"
                        ? "bg-[#1A1A1A] text-white shadow-lg border border-white/5"
                        : "text-white/40 hover:text-white/60"
                        }`}
                >
                    Sign in
                </button>
            </div>

            {(error || localError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {localError || error}
                </div>
            )}

            {step === "email" ? (
                <form onSubmit={handleSendOtp} className="mb-6 space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Sending code..." : "Continue with Email"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="mb-6 space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-white/60">We sent a 6-digit code to</p>
                        <p className="text-sm font-medium text-white">{email}</p>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-widest text-lg placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Verifying..." : "Verify & Continue"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setStep("email");
                            setOtp("");
                            setLocalError(null);
                        }}
                        className="w-full text-white/40 text-sm font-medium py-2 hover:text-white/60 transition-colors"
                    >
                        Use a different email
                    </button>
                </form>
            )}

            <div className="relative mb-6 mt-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0A0A0A] px-2 text-white/40">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    // Persist pendingRole, redirectUrl, and authSuccess across the Google OAuth full-page redirect
                    sessionStorage.setItem("prodizzy-auth-success", "true");
                    if (pendingRole) {
                        sessionStorage.setItem("prodizzy-pending-role", pendingRole);
                    } else {
                        sessionStorage.removeItem("prodizzy-pending-role");
                    }
                    if (redirectUrl) {
                        sessionStorage.setItem("prodizzy-redirect-url", redirectUrl);
                    } else {
                        sessionStorage.removeItem("prodizzy-redirect-url");
                    }
                    loginWithGoogle();
                }}
                className="w-full bg-[#1A1A1A] text-white hover:text-white font-medium py-3 rounded-xl text-sm border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
            </button>
        </div>
    );
}
