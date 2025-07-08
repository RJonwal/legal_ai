import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Database, Palette } from "lucide-react";

interface AppSettings {
  notifications: {
    email: boolean;
    desktop: boolean;
    deadlineAlerts: boolean;
    caseUpdates: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  legal: {
    autoSave: boolean;
    versionControl: boolean;
    backupFrequency: string;
  };
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      desktop: true,
      deadlineAlerts: true,
      caseUpdates: true,
    },
    appearance: {
      theme: "system",
      language: "en",
      timezone: "America/New_York",
    },
    privacy: {
      dataCollection: false,
      analytics: true,
      marketing: false,
    },
    legal: {
      autoSave: true,
      versionControl: true,
      backupFrequency: "daily",
    },
  });

  const handleSettingChange = (
    section: keyof AppSettings,
    key: string,
    value: boolean | string
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      notifications: {
        email: true,
        desktop: true,
        deadlineAlerts: true,
        caseUpdates: true,
      },
      appearance: {
        theme: "system",
        language: "en",
        timezone: "America/New_York",
      },
      privacy: {
        dataCollection: false,
        analytics: true,
        marketing: false,
      },
      legal: {
        autoSave: true,
        versionControl: true,
        backupFrequency: "daily",
      },
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/legal-assistant")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Show desktop notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.desktop}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "desktop", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deadline Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alert for upcoming deadlines
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.deadlineAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "deadlineAlerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Case Updates</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications for case activity
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.caseUpdates}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "caseUpdates", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => 
                      handleSettingChange("appearance", "theme", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value) => 
                      handleSettingChange("appearance", "language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.appearance.timezone}
                    onValueChange={(value) => 
                      handleSettingChange("appearance", "timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow collection of usage data
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => 
                    handleSettingChange("privacy", "dataCollection", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help improve the app with anonymous analytics
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => 
                    handleSettingChange("privacy", "analytics", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive marketing emails and updates
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.marketing}
                  onCheckedChange={(checked) => 
                    handleSettingChange("privacy", "marketing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Legal Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save Documents</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically save document changes
                  </p>
                </div>
                <Switch
                  checked={settings.legal.autoSave}
                  onCheckedChange={(checked) => 
                    handleSettingChange("legal", "autoSave", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Version Control</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track document version history
                  </p>
                </div>
                <Switch
                  checked={settings.legal.versionControl}
                  onCheckedChange={(checked) => 
                    handleSettingChange("legal", "versionControl", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select
                  value={settings.legal.backupFrequency}
                  onValueChange={(value) => 
                    handleSettingChange("legal", "backupFrequency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset to Defaults
                </Button>
                <Button onClick={handleSave}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}