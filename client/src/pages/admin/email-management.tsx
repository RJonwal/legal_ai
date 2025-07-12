
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Settings, 
  TestTube, 
  Plus, 
  Edit,
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Activity,
  Shield,
  Brain,
  Send,
  Reply,
  Forward,
  Eye,
  Clock,
  MessageSquare,
  Phone,
  Monitor,
  Headphones,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  User,
  Bot,
  Archive,
  Flag,
  Search,
  Filter,
  Download,
  Upload,
  Palette,
  Globe,
  Smile,
  Paperclip,
  Image,
  FileSignature
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'signup' | 'payment' | 'support' | 'custom';
  enabled: boolean;
  lastModified: string;
  variables: string[];
}

interface EmailLog {
  id: string;
  timestamp: string;
  type: 'sent' | 'received' | 'forwarded';
  to: string;
  from: string;
  subject: string;
  content: string;
  status: 'success' | 'failed' | 'pending';
  aiProcessed: boolean;
  humanCorrected: boolean;
  forwardedToHuman: boolean;
  attachments?: string[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromEmail: string;
    operationalEmails: string[];
  };
  templates: EmailTemplate[];
  emailLogs: EmailLog[];
  signatures: {
    id: string;
    name: string;
    content: string;
    isDefault: boolean;
    department: string;
  }[];
  aiAssistant: {
    enabled: boolean;
    provider: string;
    model: string;
    permissions: {
      userManagement: boolean;
      billingInquiries: boolean;
      technicalSupport: boolean;
      accountSettings: boolean;
      caseManagement: boolean;
      documentGeneration: boolean;
      paymentProcessing: boolean;
      subscriptionChanges: boolean;
      dataExport: boolean;
      systemStatus: boolean;
      generalInquiries: boolean;
      escalateToHuman: boolean;
    };
    responseSettings: {
      maxTokens: number;
      temperature: number;
      systemPrompt: string;
      autoResponse: boolean;
      escalationThreshold: number;
    };
  };
  liveChat: {
    enabled: boolean;
    provider: string;
    permissions: {
      viewUserProfiles: boolean;
      accessCaseHistory: boolean;
      modifyUserAccounts: boolean;
      processPayments: boolean;
      scheduleAppointments: boolean;
      accessDocuments: boolean;
      generateReports: boolean;
      systemAdministration: boolean;
      escalationManagement: boolean;
      knowledgeBaseAccess: boolean;
    };
    workingHours: {
      enabled: boolean;
      timezone: string;
      schedule: Record<string, { start: string; end: string; active: boolean }>;
    };
    autoResponses: {
      welcomeMessage: string;
      offlineMessage: string;
      escalationMessage: string;
    };
    realTimeMonitoring: {
      enabled: boolean;
      allowIntercept: boolean;
      showTypingIndicator: boolean;
      recordConversations: boolean;
    };
    knowledgeBase: {
      enabled: boolean;
      categories: string[];
      autoSuggestions: boolean;
    };
  };
  adminTools: {
    canRespond: boolean;
    canIntercept: boolean;
    canViewAll: boolean;
    canEditResponses: boolean;
    notificationSettings: {
      newEmails: boolean;
      escalations: boolean;
      failedDeliveries: boolean;
    };
  };
}

const defaultConfig: EmailConfig = {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromName: 'LegalAI Pro',
    fromEmail: 'noreply@legalai.pro',
    operationalEmails: ['support@legalai.pro', 'admin@legalai.pro']
  },
  templates: [],
  emailLogs: [],
  signatures: [
    {
      id: '1',
      name: 'Default Support',
      content: 'Best regards,\nLegalAI Pro Support Team\n\nEmail: support@legalai.pro\nPhone: +1 (555) 123-4567\nWebsite: https://legalai.pro',
      isDefault: true,
      department: 'support'
    }
  ],
  aiAssistant: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4',
    permissions: {
      userManagement: true,
      billingInquiries: true,
      technicalSupport: true,
      accountSettings: true,
      caseManagement: true,
      documentGeneration: true,
      paymentProcessing: false,
      subscriptionChanges: true,
      dataExport: true,
      systemStatus: true,
      generalInquiries: true,
      escalateToHuman: true
    },
    responseSettings: {
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: 'You are a helpful AI assistant for LegalAI Pro.',
      autoResponse: true,
      escalationThreshold: 80
    }
  },
  liveChat: {
    enabled: true,
    provider: 'internal',
    permissions: {
      viewUserProfiles: true,
      accessCaseHistory: true,
      modifyUserAccounts: false,
      processPayments: false,
      scheduleAppointments: true,
      accessDocuments: true,
      generateReports: false,
      systemAdministration: false,
      escalationManagement: true,
      knowledgeBaseAccess: true
    },
    workingHours: {
      enabled: true,
      timezone: 'UTC',
      schedule: {
        monday: { start: '09:00', end: '17:00', active: true },
        tuesday: { start: '09:00', end: '17:00', active: true },
        wednesday: { start: '09:00', end: '17:00', active: true },
        thursday: { start: '09:00', end: '17:00', active: true },
        friday: { start: '09:00', end: '17:00', active: true },
        saturday: { start: '10:00', end: '14:00', active: false },
        sunday: { start: '10:00', end: '14:00', active: false }
      }
    },
    autoResponses: {
      welcomeMessage: 'Welcome to LegalAI Pro support! How can I help you today?',
      offlineMessage: 'Thank you for contacting us. We are currently offline but will respond soon.',
      escalationMessage: 'Let me connect you with a human agent who can better assist you.'
    },
    realTimeMonitoring: {
      enabled: true,
      allowIntercept: true,
      showTypingIndicator: true,
      recordConversations: true
    },
    knowledgeBase: {
      enabled: true,
      categories: ['billing', 'technical', 'legal', 'account'],
      autoSuggestions: true
    }
  },
  adminTools: {
    canRespond: true,
    canIntercept: true,
    canViewAll: true,
    canEditResponses: true,
    notificationSettings: {
      newEmails: true,
      escalations: true,
      failedDeliveries: true
    }
  }
};

export default function EmailManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [newOperationalEmail, setNewOperationalEmail] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingSignature, setIsCreatingSignature] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [isRespondingToEmail, setIsRespondingToEmail] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [selectedSignature, setSelectedSignature] = useState("");
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "custom" as const,
    variables: [] as string[]
  });
  const [newSignature, setNewSignature] = useState({
    name: "",
    content: "",
    department: "support"
  });
  const [emailFilters, setEmailFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: '7d'
  });

  // Fetch email configuration
  const { data: emailConfig, isLoading } = useQuery({
    queryKey: ['admin-email-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email/config');
      if (!response.ok) throw new Error('Failed to fetch email config');
      return response.json();
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<EmailConfig>) => {
      const response = await fetch('/api/admin/email/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-config'] });
      toast({ title: "Configuration updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'lastModified'>) => {
      const response = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-config'] });
      toast({ title: "Template created successfully" });
      setIsCreatingTemplate(false);
      setNewTemplate({ name: "", subject: "", content: "", type: "custom", variables: [] });
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ email, templateId }: { email: string; templateId?: string }) => {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, templateId }),
      });
      if (!response.ok) throw new Error('Failed to send test email');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send test email", variant: "destructive" });
    },
  });

  // Send response email mutation
  const sendResponseMutation = useMutation({
    mutationFn: async ({ emailId, content, signature }: { emailId: string; content: string; signature: string }) => {
      const response = await fetch('/api/admin/email/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, content, signature }),
      });
      if (!response.ok) throw new Error('Failed to send response');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Response sent successfully" });
      setIsRespondingToEmail(false);
      setResponseContent("");
      queryClient.invalidateQueries({ queryKey: ['admin-email-config'] });
    },
    onError: () => {
      toast({ title: "Failed to send response", variant: "destructive" });
    },
  });

  // Use the fetched config or default config
  const currentConfig = emailConfig || defaultConfig;

  // Early return after all hooks are declared
  if (isLoading) {
    return <div className="p-6">Loading email settings...</div>;
  }

  const handleUpdateConfig = (updates: Partial<EmailConfig>) => {
    updateConfigMutation.mutate(updates);
  };

  const addOperationalEmail = () => {
    if (!newOperationalEmail.trim()) return;
    
    const updatedEmails = [...(currentConfig.smtp.operationalEmails || []), newOperationalEmail.trim()];
    handleUpdateConfig({
      smtp: {
        ...currentConfig.smtp,
        operationalEmails: updatedEmails
      }
    });
    setNewOperationalEmail("");
  };

  const removeOperationalEmail = (email: string) => {
    const updatedEmails = currentConfig.smtp.operationalEmails?.filter(e => e !== email) || [];
    handleUpdateConfig({
      smtp: {
        ...currentConfig.smtp,
        operationalEmails: updatedEmails
      }
    });
  };

  const handleSendTestEmail = () => {
    if (!testEmail) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }
    sendTestEmailMutation.mutate({ 
      email: testEmail, 
      templateId: activeTemplate?.id 
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createTemplateMutation.mutate({
      ...newTemplate,
      enabled: true
    });
  };

  const handleCreateSignature = () => {
    if (!newSignature.name || !newSignature.content) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const updatedSignatures = [...(currentConfig.signatures || []), {
      id: Date.now().toString(),
      ...newSignature,
      isDefault: false
    }];
    
    handleUpdateConfig({
      signatures: updatedSignatures
    });
    
    setIsCreatingSignature(false);
    setNewSignature({ name: "", content: "", department: "support" });
  };

  const handleRespondToEmail = (email: EmailLog) => {
    setSelectedEmail(email);
    setIsRespondingToEmail(true);
    setResponseContent(`Re: ${email.subject}\n\n`);
  };

  const handleInterceptEmail = (emailId: string) => {
    // Implement AI interception logic
    toast({ title: "AI response intercepted - switching to manual mode" });
  };

  const aiPermissionCategories = [
    {
      title: "User Management",
      permissions: [
        { key: 'userManagement', label: 'User Management', icon: Users },
        { key: 'accountSettings', label: 'Account Settings', icon: Settings },
        { key: 'dataExport', label: 'Data Export', icon: Download }
      ]
    },
    {
      title: "Business Operations",
      permissions: [
        { key: 'billingInquiries', label: 'Billing Inquiries', icon: CreditCard },
        { key: 'paymentProcessing', label: 'Payment Processing', icon: CreditCard },
        { key: 'subscriptionChanges', label: 'Subscription Changes', icon: Settings }
      ]
    },
    {
      title: "Legal Services",
      permissions: [
        { key: 'caseManagement', label: 'Case Management', icon: FileText },
        { key: 'documentGeneration', label: 'Document Generation', icon: FileText },
        { key: 'technicalSupport', label: 'Technical Support', icon: Activity }
      ]
    },
    {
      title: "System Operations",
      permissions: [
        { key: 'systemStatus', label: 'System Status', icon: Activity },
        { key: 'generalInquiries', label: 'General Inquiries', icon: MessageSquare },
        { key: 'escalateToHuman', label: 'Escalate to Human', icon: Users }
      ]
    }
  ];

  const liveChatPermissionCategories = [
    {
      title: "User Access",
      permissions: [
        { key: 'viewUserProfiles', label: 'View User Profiles', icon: Users },
        { key: 'accessCaseHistory', label: 'Access Case History', icon: FileText },
        { key: 'modifyUserAccounts', label: 'Modify User Accounts', icon: Settings }
      ]
    },
    {
      title: "Operations",
      permissions: [
        { key: 'processPayments', label: 'Process Payments', icon: CreditCard },
        { key: 'scheduleAppointments', label: 'Schedule Appointments', icon: Calendar },
        { key: 'accessDocuments', label: 'Access Documents', icon: FileText }
      ]
    },
    {
      title: "Administration",
      permissions: [
        { key: 'generateReports', label: 'Generate Reports', icon: Activity },
        { key: 'systemAdministration', label: 'System Administration', icon: Shield },
        { key: 'escalationManagement', label: 'Escalation Management', icon: Users },
        { key: 'knowledgeBaseAccess', label: 'Knowledge Base Access', icon: Brain }
      ]
    }
  ];

  const filteredEmails = currentConfig.emailLogs?.filter(email => {
    if (emailFilters.type !== 'all' && email.type !== emailFilters.type) return false;
    if (emailFilters.status !== 'all' && email.status !== emailFilters.status) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">
          Comprehensive email management with AI assistance, live chat, and admin response tools
        </p>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="configuration">SMTP Config</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="admin-tools">Admin Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={currentConfig.smtp.host}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, host: e.target.value }
                    })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={currentConfig.smtp.port}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, port: parseInt(e.target.value) }
                    })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-user">Username</Label>
                  <Input
                    id="smtp-user"
                    value={currentConfig.smtp.user}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, user: e.target.value }
                    })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-password">Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={currentConfig.smtp.password}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, password: e.target.value }
                    })}
                    placeholder="your-app-password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={currentConfig.smtp.fromName}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, fromName: e.target.value }
                    })}
                    placeholder="LegalAI Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    value={currentConfig.smtp.fromEmail}
                    onChange={(e) => handleUpdateConfig({
                      smtp: { ...currentConfig.smtp, fromEmail: e.target.value }
                    })}
                    placeholder="noreply@legalai.pro"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="secure-connection"
                  checked={currentConfig.smtp.secure}
                  onCheckedChange={(checked) => handleUpdateConfig({
                    smtp: { ...currentConfig.smtp, secure: checked }
                  })}
                />
                <Label htmlFor="secure-connection">Use secure connection (TLS)</Label>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>Operational Email Addresses</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Email addresses that will receive operational notifications and AI escalations
                  </p>
                  
                  <div className="space-y-2">
                    {currentConfig.smtp.operationalEmails?.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={email} readOnly className="flex-1" />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeOperationalEmail(email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Input
                        value={newOperationalEmail}
                        onChange={(e) => setNewOperationalEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className="flex-1"
                      />
                      <Button onClick={addOperationalEmail} disabled={!newOperationalEmail.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateConfig(currentConfig)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save SMTP Settings
                  </Button>
                  <Button variant="outline">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <Button onClick={() => setIsCreatingTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4">
            {currentConfig.templates?.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.enabled ? "default" : "secondary"}>
                        {template.enabled ? "Active" : "Disabled"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setActiveTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Type: {template.type} | Variables: {template.variables.join(', ')}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="flex-1"
                    />
                    <Button onClick={handleSendTestEmail} disabled={sendTestEmailMutation.isPending}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Template Dialog */}
          <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Welcome Email"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signup">Signup</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Welcome to LegalAI Pro!"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Email content with {{variables}}"
                    rows={8}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Signatures</h3>
            <Button onClick={() => setIsCreatingSignature(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Signature
            </Button>
          </div>

          <div className="grid gap-4">
            {currentConfig.signatures?.map((signature) => (
              <Card key={signature.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{signature.name}</CardTitle>
                      <CardDescription>Department: {signature.department}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {signature.isDefault && <Badge>Default</Badge>}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap border rounded p-2 bg-muted">
                    {signature.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Signature Dialog */}
          <Dialog open={isCreatingSignature} onOpenChange={setIsCreatingSignature}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Email Signature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Signature Name</Label>
                    <Input
                      value={newSignature.name}
                      onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                      placeholder="Support Team"
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select value={newSignature.department} onValueChange={(value) => setNewSignature({ ...newSignature, department: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Signature Content</Label>
                  <Textarea
                    value={newSignature.content}
                    onChange={(e) => setNewSignature({ ...newSignature, content: e.target.value })}
                    placeholder="Best regards,&#10;Your Name&#10;Department&#10;Email: email@company.com"
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSignature}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Signature
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingSignature(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Logs & Activity</h3>
            <div className="flex gap-2">
              <Select value={emailFilters.type} onValueChange={(value) => setEmailFilters({ ...emailFilters, type: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="forwarded">Forwarded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={emailFilters.status} onValueChange={(value) => setEmailFilters({ ...emailFilters, status: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEmails.map((email) => (
              <Card key={email.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {email.type === 'sent' && <Send className="h-4 w-4 text-blue-500" />}
                        {email.type === 'received' && <Mail className="h-4 w-4 text-green-500" />}
                        {email.type === 'forwarded' && <Forward className="h-4 w-4 text-orange-500" />}
                        <div>
                          <p className="font-medium">{email.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {email.type === 'sent' ? `To: ${email.to}` : `From: ${email.from}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={email.status === 'success' ? 'default' : email.status === 'failed' ? 'destructive' : 'secondary'}>
                        {email.status}
                      </Badge>
                      <Badge variant={email.priority === 'high' ? 'destructive' : email.priority === 'medium' ? 'secondary' : 'outline'}>
                        {email.priority}
                      </Badge>
                      {email.aiProcessed && <Badge variant="outline"><Bot className="h-3 w-3 mr-1" />AI</Badge>}
                      {email.humanCorrected && <Badge variant="outline"><User className="h-3 w-3 mr-1" />Human</Badge>}
                      <Button size="sm" variant="outline" onClick={() => setSelectedEmail(email)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {email.type === 'received' && (
                        <Button size="sm" onClick={() => handleRespondToEmail(email)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(email.timestamp).toLocaleString()}
                    </span>
                    {email.tags.length > 0 && (
                      <div className="flex gap-1">
                        {email.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm line-clamp-2">{email.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Email Response Dialog */}
          <Dialog open={isRespondingToEmail} onOpenChange={setIsRespondingToEmail}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Respond to Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedEmail && (
                  <div className="p-4 border rounded bg-muted">
                    <p className="font-medium">{selectedEmail.subject}</p>
                    <p className="text-sm text-muted-foreground">From: {selectedEmail.from}</p>
                    <p className="text-sm mt-2">{selectedEmail.content}</p>
                  </div>
                )}
                <div>
                  <Label>Response</Label>
                  <Textarea
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    placeholder="Type your response..."
                    rows={8}
                  />
                </div>
                <div>
                  <Label>Signature</Label>
                  <Select value={selectedSignature} onValueChange={setSelectedSignature}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select signature" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentConfig.signatures?.map((signature) => (
                        <SelectItem key={signature.id} value={signature.id}>
                          {signature.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => selectedEmail && sendResponseMutation.mutate({
                    emailId: selectedEmail.id,
                    content: responseContent,
                    signature: selectedSignature
                  })}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                  <Button variant="outline" onClick={() => setIsRespondingToEmail(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Email Assistant
              </CardTitle>
              <CardDescription>Configure AI-powered email responses and automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically process and respond to incoming emails
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={currentConfig.aiAssistant.enabled}
                  onCheckedChange={(checked) => handleUpdateConfig({
                    aiAssistant: { ...currentConfig.aiAssistant, enabled: checked }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Provider</Label>
                  <Select 
                    value={currentConfig.aiAssistant.provider}
                    onValueChange={(value) => handleUpdateConfig({
                      aiAssistant: { ...currentConfig.aiAssistant, provider: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="deepseek">Deepseek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Select 
                    value={currentConfig.aiAssistant.model}
                    onValueChange={(value) => handleUpdateConfig({
                      aiAssistant: { ...currentConfig.aiAssistant, model: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="deepseek-chat">Deepseek Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>AI Response Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Max Tokens</Label>
                    <Input
                      type="number"
                      value={currentConfig.aiAssistant.responseSettings.maxTokens}
                      onChange={(e) => handleUpdateConfig({
                        aiAssistant: {
                          ...currentConfig.aiAssistant,
                          responseSettings: {
                            ...currentConfig.aiAssistant.responseSettings,
                            maxTokens: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Temperature</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={currentConfig.aiAssistant.responseSettings.temperature}
                      onChange={(e) => handleUpdateConfig({
                        aiAssistant: {
                          ...currentConfig.aiAssistant,
                          responseSettings: {
                            ...currentConfig.aiAssistant.responseSettings,
                            temperature: parseFloat(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">System Prompt</Label>
                  <Textarea
                    value={currentConfig.aiAssistant.responseSettings.systemPrompt}
                    onChange={(e) => handleUpdateConfig({
                      aiAssistant: {
                        ...currentConfig.aiAssistant,
                        responseSettings: {
                          ...currentConfig.aiAssistant.responseSettings,
                          systemPrompt: e.target.value
                        }
                      }
                    })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>AI Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Configure what actions the AI can perform based on your business model
                </p>
                {aiPermissionCategories.map((category) => (
                  <div key={category.title} className="space-y-2">
                    <h4 className="font-medium text-sm">{category.title}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.permissions.map((permission) => (
                        <div key={permission.key} className="flex items-center space-x-2">
                          <Switch
                            id={permission.key}
                            checked={currentConfig.aiAssistant.permissions[permission.key as keyof typeof currentConfig.aiAssistant.permissions]}
                            onCheckedChange={(checked) => handleUpdateConfig({
                              aiAssistant: {
                                ...currentConfig.aiAssistant,
                                permissions: {
                                  ...currentConfig.aiAssistant.permissions,
                                  [permission.key]: checked
                                }
                              }
                            })}
                          />
                          <Label htmlFor={permission.key} className="text-sm flex items-center gap-1">
                            <permission.icon className="h-3 w-3" />
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Chat Configuration
              </CardTitle>
              <CardDescription>Configure live chat with AI assistance and real-time monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chat-enabled">Enable Live Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow real-time chat support with AI and human agents
                  </p>
                </div>
                <Switch
                  id="chat-enabled"
                  checked={currentConfig.liveChat.enabled}
                  onCheckedChange={(checked) => handleUpdateConfig({
                    liveChat: { ...currentConfig.liveChat, enabled: checked }
                  })}
                />
              </div>

              <div className="space-y-4">
                <Label>Real-time Monitoring</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monitoring-enabled"
                      checked={currentConfig.liveChat.realTimeMonitoring.enabled}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        liveChat: {
                          ...currentConfig.liveChat,
                          realTimeMonitoring: {
                            ...currentConfig.liveChat.realTimeMonitoring,
                            enabled: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="monitoring-enabled">Enable Real-time Monitoring</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-intercept"
                      checked={currentConfig.liveChat.realTimeMonitoring.allowIntercept}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        liveChat: {
                          ...currentConfig.liveChat,
                          realTimeMonitoring: {
                            ...currentConfig.liveChat.realTimeMonitoring,
                            allowIntercept: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="allow-intercept">Allow Admin Intercept</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Auto Responses</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm">Welcome Message</Label>
                    <Input
                      value={currentConfig.liveChat.autoResponses.welcomeMessage}
                      onChange={(e) => handleUpdateConfig({
                        liveChat: {
                          ...currentConfig.liveChat,
                          autoResponses: {
                            ...currentConfig.liveChat.autoResponses,
                            welcomeMessage: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Offline Message</Label>
                    <Input
                      value={currentConfig.liveChat.autoResponses.offlineMessage}
                      onChange={(e) => handleUpdateConfig({
                        liveChat: {
                          ...currentConfig.liveChat,
                          autoResponses: {
                            ...currentConfig.liveChat.autoResponses,
                            offlineMessage: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Escalation Message</Label>
                    <Input
                      value={currentConfig.liveChat.autoResponses.escalationMessage}
                      onChange={(e) => handleUpdateConfig({
                        liveChat: {
                          ...currentConfig.liveChat,
                          autoResponses: {
                            ...currentConfig.liveChat.autoResponses,
                            escalationMessage: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>AI Chat Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Enhanced AI chat permissions based on your business model
                </p>
                {liveChatPermissionCategories.map((category) => (
                  <div key={category.title} className="space-y-2">
                    <h4 className="font-medium text-sm">{category.title}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.permissions.map((permission) => (
                        <div key={permission.key} className="flex items-center space-x-2">
                          <Switch
                            id={`chat-${permission.key}`}
                            checked={currentConfig.liveChat.permissions[permission.key as keyof typeof currentConfig.liveChat.permissions]}
                            onCheckedChange={(checked) => handleUpdateConfig({
                              liveChat: {
                                ...currentConfig.liveChat,
                                permissions: {
                                  ...currentConfig.liveChat.permissions,
                                  [permission.key]: checked
                                }
                              }
                            })}
                          />
                          <Label htmlFor={`chat-${permission.key}`} className="text-sm flex items-center gap-1">
                            <permission.icon className="h-3 w-3" />
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Label>Knowledge Base Integration</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="kb-enabled"
                    checked={currentConfig.liveChat.knowledgeBase.enabled}
                    onCheckedChange={(checked) => handleUpdateConfig({
                      liveChat: {
                        ...currentConfig.liveChat,
                        knowledgeBase: {
                          ...currentConfig.liveChat.knowledgeBase,
                          enabled: checked
                        }
                      }
                    })}
                  />
                  <Label htmlFor="kb-enabled">Enable Knowledge Base Integration</Label>
                </div>
                <div>
                  <Label className="text-sm">Knowledge Base Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Configure categories for AI to provide contextual help
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentConfig.liveChat.knowledgeBase.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin-tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Response Tools
              </CardTitle>
              <CardDescription>Configure admin capabilities for email management and intervention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Admin Capabilities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-respond"
                      checked={currentConfig.adminTools.canRespond}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: { ...currentConfig.adminTools, canRespond: checked }
                      })}
                    />
                    <Label htmlFor="admin-respond">Admin Can Respond to Emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-intercept"
                      checked={currentConfig.adminTools.canIntercept}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: { ...currentConfig.adminTools, canIntercept: checked }
                      })}
                    />
                    <Label htmlFor="admin-intercept">Admin Can Intercept AI Responses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-view-all"
                      checked={currentConfig.adminTools.canViewAll}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: { ...currentConfig.adminTools, canViewAll: checked }
                      })}
                    />
                    <Label htmlFor="admin-view-all">Admin Can View All Conversations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-edit"
                      checked={currentConfig.adminTools.canEditResponses}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: { ...currentConfig.adminTools, canEditResponses: checked }
                      })}
                    />
                    <Label htmlFor="admin-edit">Admin Can Edit AI Responses</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-new-emails"
                      checked={currentConfig.adminTools.notificationSettings.newEmails}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            newEmails: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-new-emails">Notify on New Emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-escalations"
                      checked={currentConfig.adminTools.notificationSettings.escalations}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            escalations: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-escalations">Notify on Escalations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-failures"
                      checked={currentConfig.adminTools.notificationSettings.failedDeliveries}
                      onCheckedChange={(checked) => handleUpdateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            failedDeliveries: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-failures">Notify on Failed Deliveries</Label>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin tools are fully integrated with all email endpoints. Real-time monitoring and intervention capabilities are active when enabled.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
