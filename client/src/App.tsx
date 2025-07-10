import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import LegalAssistant from "@/pages/legal-assistant";
import NewCase from "@/pages/new-case";
import SearchCases from "@/pages/search-cases";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminSystem from "@/pages/admin/system";
import LandingConfig from "@/pages/admin/landing-config";

function Router() {
  return (
    <Switch>
      <Route path="/legal-assistant" component={LegalAssistant} />
      <Route path="/new-case" component={NewCase} />
      <Route path="/search-cases" component={SearchCases} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/landing" component={Landing} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/system" component={AdminSystem} />
      <Route path="/admin/landing-config" component={LandingConfig} />
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