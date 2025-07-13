import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function MinimalCookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      initializeScripts(parsed);
    }
  }, []);

  const initializeScripts = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    }
    if (prefs.functional) {
      console.log('Functional cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    setPreferences(allPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(allPreferences));
    initializeScripts(allPreferences);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    
    setPreferences(necessaryOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(necessaryOnly));
    initializeScripts(necessaryOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    initializeScripts(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        {!showPreferences ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies to improve your experience. By continuing, you accept our use of cookies.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Preferences
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptNecessary}
                className="text-xs"
              >
                Necessary Only
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs bg-purple-600 hover:bg-purple-700"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Cookie Preferences</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Necessary</p>
                  <p className="text-xs text-gray-500">Required for the website to function</p>
                </div>
                <div className="text-xs text-green-600 font-medium">Always Active</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Functional</p>
                  <p className="text-xs text-gray-500">Enhance website functionality</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-gray-500">Help us improve our website</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Marketing</p>
                  <p className="text-xs text-gray-500">Personalized ads and content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePreferences}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}