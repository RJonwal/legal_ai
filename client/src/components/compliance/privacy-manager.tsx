import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  UserX, 
  Mail, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Lock
} from "lucide-react";

interface PrivacyRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'denied';
  submittedAt: string;
  completedAt?: string;
  description: string;
}

interface DataProcessingActivity {
  id: string;
  purpose: string;
  dataTypes: string[];
  legalBasis: string;
  retentionPeriod: string;
  isActive: boolean;
}

interface UserPrivacySettings {
  marketing: boolean;
  analytics: boolean;
  dataProcessing: boolean;
  dataRetention: boolean;
  thirdPartySharing: boolean;
  profileVisibility: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
}

export default function PrivacyManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>({
    marketing: false,
    analytics: false,
    dataProcessing: true,
    dataRetention: true,
    thirdPartySharing: false,
    profileVisibility: true,
    communicationPreferences: {
      email: true,
      sms: false,
      push: false,
      marketing: false
    }
  });
  
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [newRequestType, setNewRequestType] = useState<PrivacyRequest['type']>('access');
  const [requestDescription, setRequestDescription] = useState('');
  const { toast } = useToast();

  const dataProcessingActivities: DataProcessingActivity[] = [
    {
      id: "1",
      purpose: "Service Provision",
      dataTypes: ["Account Information", "Usage Data", "Communication Records"],
      legalBasis: "Contract Performance",
      retentionPeriod: "Account lifetime + 7 years",
      isActive: true
    },
    {
      id: "2", 
      purpose: "Legal Compliance",
      dataTypes: ["Transaction Records", "Audit Logs", "Compliance Documentation"],
      legalBasis: "Legal Obligation",
      retentionPeriod: "As required by law",
      isActive: true
    },
    {
      id: "3",
      purpose: "Analytics & Improvement",
      dataTypes: ["Usage Analytics", "Performance Metrics", "User Feedback"],
      legalBasis: "Legitimate Interest",
      retentionPeriod: "2 years",
      isActive: privacySettings.analytics
    },
    {
      id: "4",
      purpose: "Marketing Communications",
      dataTypes: ["Contact Information", "Preferences", "Interaction History"],
      legalBasis: "Consent",
      retentionPeriod: "Until consent withdrawal",
      isActive: privacySettings.marketing
    }
  ];

  useEffect(() => {
    // Load privacy settings from localStorage
    const savedSettings = localStorage.getItem('privacySettings');
    if (savedSettings) {
      setPrivacySettings(JSON.parse(savedSettings));
    }

    // Load privacy requests from localStorage
    const savedRequests = localStorage.getItem('privacyRequests');
    if (savedRequests) {
      setPrivacyRequests(JSON.parse(savedRequests));
    }
  }, []);

  const handleSettingChange = (key: keyof UserPrivacySettings, value: boolean) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
    
    toast({
      title: "Privacy Setting Updated",
      description: `Your ${key} preference has been updated.`,
    });
  };

  const handleCommunicationPreferenceChange = (key: keyof UserPrivacySettings['communicationPreferences'], value: boolean) => {
    const newSettings = {
      ...privacySettings,
      communicationPreferences: {
        ...privacySettings.communicationPreferences,
        [key]: value
      }
    };
    setPrivacySettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
    
    toast({
      title: "Communication Preference Updated",
      description: `Your ${key} communication preference has been updated.`,
    });
  };

  const submitPrivacyRequest = () => {
    const newRequest: PrivacyRequest = {
      id: Date.now().toString(),
      type: newRequestType,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      description: requestDescription
    };

    const updatedRequests = [...privacyRequests, newRequest];
    setPrivacyRequests(updatedRequests);
    localStorage.setItem('privacyRequests', JSON.stringify(updatedRequests));
    
    setRequestDescription('');
    setNewRequestType('access');
    
    toast({
      title: "Privacy Request Submitted",
      description: "Your request has been submitted and will be processed within 30 days.",
    });
  };

  const exportPersonalData = () => {
    const userData = {
      privacySettings,
      privacyRequests,
      exportedAt: new Date().toISOString(),
      dataProcessingActivities: dataProcessingActivities.filter(activity => activity.isActive)
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personal-data-export.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Export Complete",
      description: "Your personal data has been downloaded as a JSON file.",
    });
  };

  const deleteAllData = () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      localStorage.removeItem('privacySettings');
      localStorage.removeItem('privacyRequests');
      localStorage.removeItem('cookieConsent');
      
      // Reset to defaults
      setPrivacySettings({
        marketing: false,
        analytics: false,
        dataProcessing: true,
        dataRetention: true,
        thirdPartySharing: false,
        profileVisibility: true,
        communicationPreferences: {
          email: true,
          sms: false,
          push: false,
          marketing: false
        }
      });
      setPrivacyRequests([]);
      
      toast({
        title: "Data Deletion Initiated",
        description: "Your data deletion request has been submitted for processing.",
      });
    }
  };

  const getStatusIcon = (status: PrivacyRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRequestTypeLabel = (type: PrivacyRequest['type']) => {
    switch (type) {
      case 'access': return 'Data Access';
      case 'deletion': return 'Data Deletion';
      case 'portability': return 'Data Portability';
      case 'rectification': return 'Data Rectification';
      case 'objection': return 'Processing Objection';
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Privacy Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Management
          </DialogTitle>
          <DialogDescription>
            Manage your privacy settings, data processing preferences, and exercise your rights under GDPR/CCPA.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Right to Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Right to Portability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Right to Deletion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Right to Object</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Data Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Processing Activities</span>
                      <Badge variant="outline">{dataProcessingActivities.filter(a => a.isActive).length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Requests</span>
                      <Badge variant="outline">{privacyRequests.filter(r => r.status === 'pending').length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Requests</span>
                      <Badge variant="outline">{privacyRequests.filter(r => r.status === 'completed').length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>Control how your data is processed and used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Communications</Label>
                      <p className="text-sm text-gray-600">Allow marketing emails and personalized offers</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={privacySettings.marketing}
                      onCheckedChange={(checked) => handleSettingChange('marketing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Analytics & Improvement</Label>
                      <p className="text-sm text-gray-600">Help us improve our services through usage analytics</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={privacySettings.analytics}
                      onCheckedChange={(checked) => handleSettingChange('analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="thirdParty">Third-Party Sharing</Label>
                      <p className="text-sm text-gray-600">Allow sharing with trusted partners for enhanced services</p>
                    </div>
                    <Switch
                      id="thirdParty"
                      checked={privacySettings.thirdPartySharing}
                      onCheckedChange={(checked) => handleSettingChange('thirdPartySharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile">Profile Visibility</Label>
                      <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      id="profile"
                      checked={privacySettings.profileVisibility}
                      onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Choose how you want to receive communications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Service updates and important notices</p>
                    </div>
                    <Switch
                      id="email"
                      checked={privacySettings.communicationPreferences.email}
                      onCheckedChange={(checked) => handleCommunicationPreferenceChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Urgent alerts and security notifications</p>
                    </div>
                    <Switch
                      id="sms"
                      checked={privacySettings.communicationPreferences.sms}
                      onCheckedChange={(checked) => handleCommunicationPreferenceChange('sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Browser and app notifications</p>
                    </div>
                    <Switch
                      id="push"
                      checked={privacySettings.communicationPreferences.push}
                      onCheckedChange={(checked) => handleCommunicationPreferenceChange('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingComm">Marketing Communications</Label>
                      <p className="text-sm text-gray-600">Promotional content and special offers</p>
                    </div>
                    <Switch
                      id="marketingComm"
                      checked={privacySettings.communicationPreferences.marketing}
                      onCheckedChange={(checked) => handleCommunicationPreferenceChange('marketing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit Privacy Request</CardTitle>
                <CardDescription>Exercise your rights under GDPR/CCPA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type</Label>
                  <select
                    id="requestType"
                    value={newRequestType}
                    onChange={(e) => setNewRequestType(e.target.value as PrivacyRequest['type'])}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="access">Data Access Request</option>
                    <option value="deletion">Data Deletion Request</option>
                    <option value="portability">Data Portability Request</option>
                    <option value="rectification">Data Rectification Request</option>
                    <option value="objection">Object to Processing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="Please describe your request in detail..."
                    rows={3}
                  />
                </div>

                <Button onClick={submitPrivacyRequest} disabled={!requestDescription.trim()}>
                  Submit Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Privacy Requests</CardTitle>
                <CardDescription>Track the status of your submitted requests</CardDescription>
              </CardHeader>
              <CardContent>
                {privacyRequests.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No privacy requests submitted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {privacyRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <p className="font-medium">{getRequestTypeLabel(request.type)}</p>
                            <p className="text-sm text-gray-600">{request.description}</p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={request.status === 'completed' ? 'default' : 'outline'}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Processing Activities</CardTitle>
                <CardDescription>How your data is being processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataProcessingActivities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{activity.purpose}</h4>
                        <Badge variant={activity.isActive ? 'default' : 'outline'}>
                          {activity.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Data Types: </span>
                          <span className="text-gray-600">{activity.dataTypes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium">Legal Basis: </span>
                          <span className="text-gray-600">{activity.legalBasis}</span>
                        </div>
                        <div>
                          <span className="font-medium">Retention Period: </span>
                          <span className="text-gray-600">{activity.retentionPeriod}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or delete your personal data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={exportPersonalData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button onClick={deleteAllData} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Data export includes all personal information we have stored. 
                  Data deletion will permanently remove all your information and cannot be undone.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}