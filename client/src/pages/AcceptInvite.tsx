import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AcceptInvite() {
  const { token } = useParams();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  // Check if user is authenticated
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      }
      return null;
    },
  });

  // Fetch invite details
  const { data: invite, isLoading, error } = useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const response = await fetch(`/api/invite/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid invite");
      }
      return response.json();
    },
    enabled: !!token,
  });

  // Accept invite mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/invite/${token}/accept`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invite");
      }

      return response.json();
    },
    onSuccess: () => {
      // Redirect to business dashboard after accepting
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
  });

  const handleAccept = () => {
    if (!user) {
      // If not authenticated, redirect to login with return URL
      window.location.href = `/login?redirect=/invite/${token}`;
      return;
    }

    acceptMutation.mutate();
  };

  const handleDecline = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E63946] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-[#E63946] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-white/60 mb-6">
            {(error as Error)?.message || "This invitation link is invalid or has expired."}
          </p>
          <Button onClick={() => setLocation("/dashboard")} variant="outline" className="bg-white/5 border-white/10">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Accepted!</h1>
          <p className="text-white/60 mb-4">
            You're now a member of <strong>{invite.business?.business_name}</strong>.
          </p>
          <p className="text-white/50 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#E63946] p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Team Invitation</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-lg text-white mb-2">
              You've been invited to join
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">
              {invite.business?.business_name}
            </h2>
            <p className="text-white/60 text-sm">
              {invite.business?.business_type}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/60">Role:</span>
              <span className="text-white font-medium capitalize">{invite.role}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Email:</span>
              <span className="text-white font-medium">{invite.email}</span>
            </div>
          </div>

          {!user && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                You need to sign in to accept this invitation. You'll be redirected to login.
              </p>
            </div>
          )}

          {acceptMutation.isError && (
            <div className="bg-[#E63946]/10 border border-[#E63946]/30 rounded-lg p-4 mb-6">
              <p className="text-[#E63946] text-sm">
                {(acceptMutation.error as Error)?.message || "Failed to accept invitation"}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="bg-white/5 border-white/10"
              disabled={acceptMutation.isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
