import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Cookie, Shield, Settings, ExternalLink } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const USCookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('wizzered_cookie_consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    localStorage.setItem('wizzered_cookie_consent', JSON.stringify({
      preferences: allAccepted,
      timestamp: Date.now(),
      version: '1.0'
    }));
    
    setIsVisible(false);
    
    // Initialize analytics and marketing scripts
    initializeScripts(allAccepted);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('wizzered_cookie_consent', JSON.stringify({
      preferences,
      timestamp: Date.now(),
      version: '1.0'
    }));
    
    setIsVisible(false);
    
    // Initialize only selected scripts
    initializeScripts(preferences);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    
    localStorage.setItem('wizzered_cookie_consent', JSON.stringify({
      preferences: onlyNecessary,
      timestamp: Date.now(),
      version: '1.0'
    }));
    
    setIsVisible(false);
  };

  const initializeScripts = (prefs: CookiePreferences) => {
    // Initialize analytics if allowed
    if (prefs.analytics) {
      // Add Google Analytics or other analytics scripts
      console.log('Analytics cookies enabled');
    }
    
    // Initialize marketing scripts if allowed
    if (prefs.marketing) {
      // Add marketing/advertising scripts
      console.log('Marketing cookies enabled');
    }
    
    // Initialize functional scripts if allowed
    if (prefs.functional) {
      // Add functional scripts (chat widgets, etc.)
      console.log('Functional cookies enabled');
    }
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Necessary',
      description: 'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      required: true,
      examples: ['Session cookies', 'Authentication tokens', 'Security cookies']
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'Functional',
      description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
      required: false,
      examples: ['Language preferences', 'Theme settings', 'User interface customizations']
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false,
      examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis']
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing',
      description: 'These cookies are used to track visitors across websites to display relevant advertisements and marketing content.',
      required: false,
      examples: ['Advertising cookies', 'Social media tracking', 'Remarketing pixels']
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 relative">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Cookie Preferences</h2>
                <p className="text-blue-100">We respect your privacy and data protection rights</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Wizzered uses cookies to enhance your experience, provide personalized content, and analyze our traffic. 
                You can customize your cookie preferences below or accept all cookies to continue.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>CCPA Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>

            {/* Cookie Types */}
            <div className="space-y-4 mb-6">
              {cookieTypes.map((type) => (
                <div key={type.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                      {type.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <Switch
                      checked={preferences[type.key]}
                      onCheckedChange={(checked) => {
                        if (!type.required) {
                          setPreferences(prev => ({
                            ...prev,
                            [type.key]: checked
                          }));
                        }
                      }}
                      disabled={type.required}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {type.examples.map((example, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legal Links */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Your Rights</h4>
              <p className="text-sm text-gray-600 mb-3">
                Under US privacy laws (CCPA) and international regulations (GDPR), you have the right to:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate data</li>
                <li>• Delete your data</li>
                <li>• Opt-out of sale of personal information</li>
                <li>• Withdraw consent at any time</li>
              </ul>
              <div className="flex gap-4 text-sm">
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </a>
                <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Cookie Policy <ExternalLink className="h-3 w-3" />
                </a>
                <a href="/privacy-manager" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Privacy Manager <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAcceptAll}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Accept All Cookies
              </Button>
              <Button 
                onClick={handleAcceptSelected}
                variant="outline"
                className="flex-1"
              >
                Accept Selected
              </Button>
              <Button 
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                Reject All
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              You can change your preferences at any time by accessing the Privacy Manager in the footer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default USCookieBanner;