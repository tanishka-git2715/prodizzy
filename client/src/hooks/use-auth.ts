import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CustomSession {
  user: {
    id: string;
    googleId?: string;
    email: string | null;
    displayName?: string;
    avatarUrl?: string;
  };
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading, error: queryError } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const session = user ? { user } : null;

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }
      return res.json();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to verify OTP");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  return {
    session,
    user,
    loading,
    error: sendOtpMutation.error?.message || verifyOtpMutation.error?.message || null,
    refreshSession: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
    loginWithGoogle,
    logout: logoutMutation.mutateAsync,
    sendOtp: async (data: { email: string }) => {
      try {
        await sendOtpMutation.mutateAsync(data);
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    },
    verifyOtp: async (data: { email: string; otp: string }) => {
      try {
        await verifyOtpMutation.mutateAsync(data);
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    },
  };
}

