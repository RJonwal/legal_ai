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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <Cookie className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                We use cookies to enhance your experience. Choose your preferences:
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRejectAll}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1.5 h-auto"
            >
              Necessary Only
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1.5 h-auto"
            >
              Customize
            </Button>
            
            <Button
              onClick={handleAcceptAll}
              size="sm"
              className="text-xs px-3 py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Accept All
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Necessary</span>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
                <Switch checked={true} disabled />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Functional</span>
                </div>
                <Switch 
                  checked={preferences.functional}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, functional: checked}))}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Analytics</span>
                </div>
                <Switch 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, analytics: checked}))}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Marketing</span>
                </div>
                <Switch 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, marketing: checked}))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleAcceptSelected}
                size="sm"
                className="text-xs px-4 py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default USCookieBanner;