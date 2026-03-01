import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
    onSuccess?: () => void;
    initialTab?: "signup" | "signin";
}

export function AuthForm({ onSuccess, initialTab = "signup" }: AuthFormProps) {
    const { loginWithGoogle, login, register } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"signup" | "signin">(initialTab);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = activeTab === "signup"
                ? await register({ email, password })
                : await login({ email, password });

            if (result.success) {
                toast({
                    title: activeTab === "signup" ? "Account created" : "Welcome back",
                    description: activeTab === "signup" ? "Your account has been successfully created." : "You have successfully signed in.",
                });
                if (onSuccess) onSuccess();
            } else {
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: result.message || "Something went wrong. Please try again.",
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
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

            <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-8 shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </button>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0D0E0F] px-4 text-white/20 tracking-widest font-medium">
                        or {activeTab === "signup" ? "sign up" : "sign in"} with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@startup.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all outline-none text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all outline-none text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isSubmitting ? "Processing..." : activeTab === "signup" ? "Create Account" : "Sign In"}
                </button>
            </form>
        </div>
    );
}
