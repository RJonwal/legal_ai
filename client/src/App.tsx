import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "@/components/layout/mobile-layout";
import AdminLayout from "@/components/layout/admin-layout";
import { lazy, useEffect } from 'react';

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
import EmailManagement from "@/pages/admin/email-management";
import LiveChatManagement from "@/pages/admin/livechat-management";
import VoipManagement from "@/pages/admin/voip-management";
import PageManagement from "@/pages/admin/page-management";

import "./index.css";
import ErrorBoundary from "./components/error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const isMobile = useIsMobile();

  // Memory cleanup and performance monitoring
  useEffect(() => {
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const memoryMonitor = setInterval(() => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB threshold
            console.warn('High memory usage detected:', {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
              total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
              limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            });
          }
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(memoryMonitor);
    }
  }, []);

  // Global error handler for unhandled promises
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent default browser behavior
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
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
                </AdminLayout>
              </Route>

              <Route path="/admin/email-management">
                <AdminLayout>
                  <EmailManagement />
                </AdminLayout>
              </Route>

             <Route path="/admin/email-settings">
              <AdminLayout>
                <EmailManagement />
              </AdminLayout>
            </Route>

              <Route path="/admin/livechat-management">
                <AdminLayout>
                  <LiveChatManagement />
                </AdminLayout>
              </Route>

              <Route path="/admin/voip-management">
                <AdminLayout>
                  <VoipManagement />
                </AdminLayout>
              </Route>

              <Route path="/admin/page-management">
                <AdminLayout>
                  <PageManagement />
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
    </ErrorBoundary>
  );
}

export default App;