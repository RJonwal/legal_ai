import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "@/components/layout/mobile-layout";
import AdminLayout from "@/components/layout/admin-layout";
import { lazy } from 'react';

// Import pages
import LandingPage from "@/pages/landing";
import LegalAssistant from "@/pages/legal-assistant";
import NewCase from "@/pages/new-case";
import SearchCases from "@/pages/search-cases";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Import admin pages
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminLandingConfig from "@/pages/admin/landing-config";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSystem from "@/pages/admin/system";
import AdminBilling from "@/pages/admin/billing";
import AdminAPIManagement from "@/pages/admin/api-management";

import "./index.css";

const queryClient = new QueryClient();

function App() {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Switch>
            {/* Landing page */}
            <Route path="/" component={LandingPage} />

            {/* Admin routes with layout */}
            <Route path="/admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </Route>

            <Route path="/admin/users">
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </Route>

            <Route path="/admin/billing">
              <AdminLayout>
                <AdminBilling />
              </AdminLayout>
            </Route>

            <Route path="/admin/api-management">
              <AdminLayout>
                <AdminAPIManagement />
              </AdminLayout>
            </Route>

            <Route path="/admin/analytics">
              <AdminLayout>
                <AdminAnalytics />
            <Route path="/admin/email-settings" component={lazy(() => import('./pages/admin/email-settings'))} />
          </AdminLayout>
            </Route>

            <Route path="/admin/system">
              <AdminLayout>
                <AdminSystem />
              </AdminLayout>
            </Route>

            <Route path="/admin/landing-config">
              <AdminLayout>
                <AdminLandingConfig />
              </AdminLayout>
            </Route>

            {/* Main app routes */}
            <Route path="/dashboard" component={LegalAssistant} />
            <Route path="/new-case" component={NewCase} />
            <Route path="/search-cases" component={SearchCases} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />

            {/* 404 page */}
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;