import { Switch, Route } from "wouter";
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
import BusinessCreate from "@/pages/BusinessCreate";
import BusinessDashboard from "@/pages/BusinessDashboard";
import AcceptInvite from "@/pages/AcceptInvite";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/join-startup" component={Onboard} />
      <Route path="/partner-onboard" component={PartnerOnboard} />
      <Route path="/individual-onboard" component={IndividualOnboard} />
      <Route path="/invite/:token" component={AcceptInvite} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/discover">{() => <ProtectedRoute component={Discover} />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route>
      <Route path="/business/create">{() => <ProtectedRoute component={BusinessCreate} />}</Route>
      <Route path="/business/:id">{() => <ProtectedRoute component={BusinessDashboard} />}</Route>
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
