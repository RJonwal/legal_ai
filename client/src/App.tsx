import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "@/components/layout/mobile-layout";
import AdminLayout from "@/components/layout/admin-layout";
import { lazy, useEffect, Suspense } from 'react';

// Import pages
import LandingPage from "@/pages/landing";
import LegalAssistant from "@/pages/legal-assistant";
import NewCase from "@/pages/new-case";
import SearchCases from "@/pages/search-cases";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import CookiePolicyPage from "@/pages/cookie-policy";
import AboutPage from "@/pages/about";

// Import auth pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
// Lazy load payment pages to avoid Stripe loading issues
const Subscription = lazy(() => import("@/pages/subscription"));
const Billing = lazy(() => import("@/pages/billing"));
// Import admin pages
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminLandingConfig from "@/pages/admin/landing-config";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSystem from "@/pages/admin/system";
import AdminBillingPage from "@/pages/admin/billing";
import AdminAPIManagement from "@/pages/admin/api-management";
import EmailManagement from "@/pages/admin/email-management";
import LiveChatManagement from "@/pages/admin/livechat-management";
import VoipManagement from "@/pages/admin/voip-management";
import PageManagement from "@/pages/admin/page-management";
import GlobalPromptManagement from "@/pages/admin/global-prompt-management";

import "./index.css";
import ErrorBoundary from "./components/error-boundary";
import CookieBanner from "@/components/compliance/cookie-banner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const isMobile = useIsMobile();

  // Error handling and cleanup
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

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

      return () => {
        clearInterval(memoryMonitor);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
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

              {/* Auth routes */}
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/signup" component={Register} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/subscription">
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                  <Subscription />
                </Suspense>
              </Route>
              <Route path="/subscribe">
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                  <Subscription />
                </Suspense>
              </Route>
              <Route path="/billing">
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>}>
                  <Billing />
                </Suspense>
              </Route>

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
                  <AdminBillingPage />
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

              <Route path="/admin/global-prompt-management">
                <AdminLayout>
                  <GlobalPromptManagement />
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
              <Route path="/terms" component={TermsPage} />
              <Route path="/terms-and-conditions" component={TermsPage} />
              <Route path="/privacy" component={PrivacyPage} />
              <Route path="/privacy-policy" component={PrivacyPage} />
              <Route path="/cookie-policy" component={CookiePolicyPage} />
              <Route path="/about" component={AboutPage} />

              {/* 404 page */}
              <Route component={NotFound} />
            </Switch>
          </Router>
          <CookieBanner />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;