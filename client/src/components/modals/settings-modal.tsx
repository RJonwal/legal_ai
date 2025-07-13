import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Scale, 
  Globe,
  Clock,
  Database,
  RefreshCw,
  Save
} from "@/lib/icons";

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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      desktop: true,
      deadlineAlerts: true,
      caseUpdates: true,
    },
    appearance: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
    },
    privacy: {
      dataCollection: true,
      analytics: false,
      marketing: false,
    },
    legal: {
      autoSave: true,
      versionControl: true,
      backupFrequency: "daily",
    },
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
    onClose();
  };

  const updateNotificationSetting = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateAppearanceSetting = (key: keyof AppSettings['appearance'], value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value }
    }));
  };

  const updatePrivacySetting = (key: keyof AppSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  const updateLegalSetting = (key: keyof AppSettings['legal'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      legal: { ...prev.legal, [key]: value }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your application preferences and account settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-gray-500">
                    Receive case updates and reminders via email
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => updateNotificationSetting('email', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Desktop Notifications</Label>
                  <div className="text-sm text-gray-500">
                    Show browser notifications for important updates
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.desktop}
                  onCheckedChange={(value) => updateNotificationSetting('desktop', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Deadline Alerts</Label>
                  <div className="text-sm text-gray-500">
                    Get notified about upcoming deadlines and court dates
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.deadlineAlerts}
                  onCheckedChange={(value) => updateNotificationSetting('deadlineAlerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Case Updates</Label>
                  <div className="text-sm text-gray-500">
                    Receive notifications when cases are updated
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.caseUpdates}
                  onCheckedChange={(value) => updateNotificationSetting('caseUpdates', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateAppearanceSetting('theme', value)}
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
                    onValueChange={(value) => updateAppearanceSetting('language', value)}
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
                    onValueChange={(value) => updateAppearanceSetting('timezone', value)}
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
                <Shield className="h-4 w-4" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Collection</Label>
                  <div className="text-sm text-gray-500">
                    Allow collection of usage data to improve the platform
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(value) => updatePrivacySetting('dataCollection', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics</Label>
                  <div className="text-sm text-gray-500">
                    Share anonymous analytics data for platform improvement
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(value) => updatePrivacySetting('analytics', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Communications</Label>
                  <div className="text-sm text-gray-500">
                    Receive updates about new features and legal resources
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.marketing}
                  onCheckedChange={(value) => updatePrivacySetting('marketing', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Legal Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-save Documents</Label>
                  <div className="text-sm text-gray-500">
                    Automatically save document changes as you work
                  </div>
                </div>
                <Switch
                  checked={settings.legal.autoSave}
                  onCheckedChange={(value) => updateLegalSetting('autoSave', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Version Control</Label>
                  <div className="text-sm text-gray-500">
                    Track changes and maintain document revision history
                  </div>
                </div>
                <Switch
                  checked={settings.legal.versionControl}
                  onCheckedChange={(value) => updateLegalSetting('versionControl', value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select
                  value={settings.legal.backupFrequency}
                  onValueChange={(value) => updateLegalSetting('backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-legal-blue hover:bg-legal-deep text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}