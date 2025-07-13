import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Cookie, Shield, Settings, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(cookieConsent);
      setPreferences(savedPreferences);
      initializeCookies(savedPreferences);
    }
  }, []);

  const initializeCookies = (prefs: CookiePreferences) => {
    // Initialize analytics cookies
    if (prefs.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics cookies enabled');
    }
    
    // Initialize marketing cookies
    if (prefs.marketing) {
      // Initialize marketing pixels/tracking
      console.log('Marketing cookies enabled');
    }
    
    // Initialize functional cookies
    if (prefs.functional) {
      // Initialize functional cookies
      console.log('Functional cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    const allEnabled = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allEnabled);
    localStorage.setItem('cookieConsent', JSON.stringify(allEnabled));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    initializeCookies(allEnabled);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(necessaryOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    initializeCookies(necessaryOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    initializeCookies(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">This website uses cookies</p>
              <p className="text-xs text-gray-600">
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Cookie className="h-5 w-5" />
                    Cookie Preferences
                  </DialogTitle>
                  <DialogDescription>
                    Choose which cookies you want to allow. Necessary cookies are required for the website to function properly.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Necessary Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="necessary" className="text-sm font-medium">
                          Necessary Cookies
                        </Label>
                        <p className="text-xs text-gray-600">
                          Essential for website functionality, security, and user authentication.
                        </p>
                      </div>
                      <Switch
                        id="necessary"
                        checked={preferences.necessary}
                        disabled={true}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Examples: Session management, security tokens, form submissions
                    </p>
                  </div>

                  <Separator />

                  {/* Analytics Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics" className="text-sm font-medium">
                          Analytics Cookies
                        </Label>
                        <p className="text-xs text-gray-600">
                          Help us understand how visitors interact with our website.
                        </p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Examples: Google Analytics, usage statistics, performance monitoring
                    </p>
                  </div>

                  <Separator />

                  {/* Marketing Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing" className="text-sm font-medium">
                          Marketing Cookies
                        </Label>
                        <p className="text-xs text-gray-600">
                          Used to deliver personalized advertisements and track campaign effectiveness.
                        </p>
                      </div>
                      <Switch
                        id="marketing"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Examples: Facebook Pixel, Google Ads, retargeting pixels
                    </p>
                  </div>

                  <Separator />

                  {/* Functional Cookies */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="functional" className="text-sm font-medium">
                          Functional Cookies
                        </Label>
                        <p className="text-xs text-gray-600">
                          Enable enhanced features and personalization.
                        </p>
                      </div>
                      <Switch
                        id="functional"
                        checked={preferences.functional}
                        onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Examples: Language preferences, theme settings, chat widgets
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Link href="/cookie-policy" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Cookie Policy
                  </Link>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleAcceptNecessary}>
              Accept Necessary
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}