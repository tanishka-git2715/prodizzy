import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Onboard from "@/pages/Onboard";
import PartnerOnboard from "@/pages/PartnerOnboard";
import IndividualOnboard from "@/pages/IndividualOnboard";
import Dashboard from "@/pages/Dashboard";
import Discover from "@/pages/Discover";
import Admin from "@/pages/Admin";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function IndexRoute() {
  const { session, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profileStatus, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-status", session?.user?.id],
    queryFn: async () => {
      const profileRes = await fetch("/api/profile");
      const hasAnyProfile = profileRes.ok && profileRes.status !== 404;
      let hasCompletedProfile = false;
      if (hasAnyProfile) {
        const data = await profileRes.json();
        hasCompletedProfile = !!data?.onboarding_completed;
      }
      return {
        hasProfile: hasAnyProfile,
        hasCompletedProfile,
        needsOnboarding: !hasAnyProfile,
      };
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (!loading && !profileLoading && session && profileStatus?.hasCompletedProfile) {
      setLocation("/dashboard");
    }
  }, [session, profileStatus, loading, profileLoading, setLocation]);

  if (loading || (session && profileLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in and completed profile, we are about to redirect, so show loading to prevent flash
  if (session && profileStatus?.hasCompletedProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={IndexRoute} />
      <Route path="/login" component={Login} />
      <Route path="/join-startup" component={Onboard} />
      <Route path="/partner-onboard" component={PartnerOnboard} />
      <Route path="/individual-onboard" component={IndividualOnboard} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/discover">{() => <ProtectedRoute component={Discover} />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
