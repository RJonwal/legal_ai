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
      // Core Legal Services
      legalConsultation: boolean;
      caseAnalysis: boolean;
      documentReview: boolean;
      legalResearch: boolean;
      procedureGuidance: boolean;
      filingDeadlines: boolean;
      courtRequirements: boolean;
      jurisdictionAdvice: boolean;
      legalFormCompletion: boolean;
      caseStrategyAdvice: boolean;

      // Client Management
      clientOnboarding: boolean;
      caseStatusUpdates: boolean;
      appointmentScheduling: boolean;
      documentRequests: boolean;
      caseFileAccess: boolean;
      clientCommunication: boolean;
      progressReporting: boolean;

      // Business Operations
      billingInquiries: boolean;
      paymentProcessing: boolean;
      subscriptionManagement: boolean;
      servicePlanChanges: boolean;
      refundProcessing: boolean;
      invoiceGeneration: boolean;

      // Technical Support
      platformNavigation: boolean;
      featureExplanation: boolean;
      troubleshooting: boolean;
      accountSetup: boolean;
      dataExport: boolean;
      systemIntegration: boolean;

      // Administrative
      userAccountManagement: boolean;
      accessPermissions: boolean;
      dataBackup: boolean;
      reportGeneration: boolean;
      auditTrails: boolean;

      // Emergency & Escalation
      urgentLegalMatters: boolean;
      escalateToAttorney: boolean;
      escalateToHuman: boolean;
      emergencyContact: boolean;
    };
    responseSettings: {
      maxTokens: number;
      temperature: number;
      systemPrompt: string;
      autoResponse: boolean;
      escalationThreshold: number;
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
    fromName: 'Wizzered',
    fromEmail: 'noreply@wizzered.com',
    operationalEmails: ['support@wizzered.com', 'admin@wizzered.com']
  },
  templates: [],
  emailLogs: [],
  signatures: [
    {
      id: '1',
      name: 'Default Support',
      content: 'Best regards,\nWizzered Support Team\n\nEmail: support@wizzered.com\nPhone: +1 (555) 123-4567\nWebsite: https://wizzered.com',
      isDefault: true,
      department: 'support'
    }
  ],
  aiAssistant: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4',
    permissions: {
      // Core Legal Services - Enable most for autonomy
      legalConsultation: true,
      caseAnalysis: true,
      documentReview: true,
      legalResearch: true,
      procedureGuidance: true,
      filingDeadlines: true,
      courtRequirements: true,
      jurisdictionAdvice: true,
      legalFormCompletion: true,
      caseStrategyAdvice: false, // Requires human oversight

      // Client Management - Full autonomy
      clientOnboarding: true,
      caseStatusUpdates: true,
      appointmentScheduling: true,
      documentRequests: true,
      caseFileAccess: true,
      clientCommunication: true,
      progressReporting: true,

      // Business Operations - Selective autonomy
      billingInquiries: true,
      paymentProcessing: true,
      subscriptionManagement: true,
      servicePlanChanges: true,
      refundProcessing: false, // Requires human approval
      invoiceGeneration: true,

      // Technical Support - Full autonomy
      platformNavigation: true,
      featureExplanation: true,
      troubleshooting: true,
      accountSetup: true,
      dataExport: true,
      systemIntegration: true,

      // Administrative - Limited autonomy
      userAccountManagement: true,
      accessPermissions: false, // Security sensitive
      dataBackup: true,
      reportGeneration: true,
      auditTrails: true,

      // Emergency & Escalation - Human oversight required
      urgentLegalMatters: true,
      escalateToAttorney: true,
      escalateToHuman: true,
      emergencyContact: true
    },
    responseSettings: {
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: 'You are a helpful AI assistant for Wizzered.',
      autoResponse: true,
      escalationThreshold: 80
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

  const updateConfig = (updates: Partial<EmailConfig>) => {
    updateConfigMutation.mutate(updates);
  };

  const addOperationalEmail = () => {
    if (!newOperationalEmail.trim()) return;

    const updatedEmails = [...(currentConfig.smtp.operationalEmails || []), newOperationalEmail.trim()];
    updateConfig({
      smtp: {
        ...currentConfig.smtp,
        operationalEmails: updatedEmails
      }
    });
    setNewOperationalEmail("");
  };

  const removeOperationalEmail = (email: string) => {
    const updatedEmails = currentConfig.smtp.operationalEmails?.filter(e => e !== email) || [];
    updateConfig({
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

    updateConfig({
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
      title: "Core Legal Services",
      permissions: [
        { key: 'legalConsultation', label: 'Legal Consultation', icon: Users },
        { key: 'caseAnalysis', label: 'Case Analysis', icon: FileText },
        { key: 'documentReview', label: 'Document Review', icon: FileText },
        { key: 'legalResearch', label: 'Legal Research', icon: Brain },
        { key: 'procedureGuidance', label: 'Procedure Guidance', icon: MessageSquare },
        { key: 'filingDeadlines', label: 'Filing Deadlines', icon: Calendar },
        { key: 'courtRequirements', label: 'Court Requirements', icon: Shield },
        { key: 'jurisdictionAdvice', label: 'Jurisdiction Advice', icon: Globe },
        { key: 'legalFormCompletion', label: 'Legal FormCompletion', icon: FileText },
        { key: 'caseStrategyAdvice', label: 'Case Strategy Advice', icon: Brain }
      ]
    },
    {
      title: "Client Management",
      permissions: [
        { key: 'clientOnboarding', label: 'Client Onboarding', icon: Users },
        { key: 'caseStatusUpdates', label: 'Case Status Updates', icon: Activity },
        { key: 'appointmentScheduling', label: 'Appointment Scheduling', icon: Calendar },
        { key: 'documentRequests', label: 'Document Requests', icon: FileText },
        { key: 'caseFileAccess', label: 'Case File Access', icon: FileText },
        { key: 'clientCommunication', label: 'Client Communication', icon: MessageSquare },
        { key: 'progressReporting', label: 'Progress Reporting', icon: Activity }
      ]
    },
    {
      title: "Business Operations",
      permissions: [
        { key: 'billingInquiries', label: 'Billing Inquiries', icon: CreditCard },
        { key: 'paymentProcessing', label: 'Payment Processing', icon: CreditCard },
        { key: 'subscriptionManagement', label: 'Subscription Management', icon: Settings },
        { key: 'servicePlanChanges', label: 'Service Plan Changes', icon: Settings },
        { key: 'refundProcessing', label: 'Refund Processing', icon: CreditCard },
        { key: 'invoiceGeneration', label: 'Invoice Generation', icon: FileText }
      ]
    },
    {
      title: "Technical Support",
      permissions: [
        { key: 'platformNavigation', label: 'Platform Navigation', icon: Globe },
        { key: 'featureExplanation', label: 'Feature Explanation', icon: MessageSquare },
        { key: 'troubleshooting', label: 'Troubleshooting', icon: Activity },
        { key: 'accountSetup', label: 'Account Setup', icon: Settings },
        { key: 'dataExport', label: 'Data Export', icon: Download },
        { key: 'systemIntegration', label: 'System Integration', icon: Zap }
      ]
    },
    {
      title: "Administrative",
      permissions: [
        { key: 'userAccountManagement', label: 'User Account Management', icon: Users },
        { key: 'accessPermissions', label: 'Access Permissions', icon: Shield },
        { key: 'dataBackup', label: 'Data Backup', icon: Archive },
        { key: 'reportGeneration', label: 'Report Generation', icon: Activity },
        { key: 'auditTrails', label: 'Audit Trails', icon: Eye }
      ]
    },
    {
      title: "Emergency & Escalation",
      permissions: [
        { key: 'urgentLegalMatters', label: 'Urgent Legal Matters', icon: AlertCircle },
        { key: 'escalateToAttorney', label: 'Escalate to Attorney', icon: Users },
        { key: 'escalateToHuman', label: 'Escalate to Human', icon: Users },
        { key: 'emergencyContact', label: 'Emergency Contact', icon: Phone }
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="configuration">SMTP Config</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
                      smtp: { ...currentConfig.smtp, fromName: e.target.value }
                    })}
                    placeholder="Wizzered"
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    value={currentConfig.smtp.fromEmail}
                    onChange={(e) => updateConfig({
                      smtp: { ...currentConfig.smtp, fromEmail: e.target.value }
                    })}
                    placeholder="noreply@wizzered.com"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="secure-connection"
                  checked={currentConfig.smtp.secure}
                  onCheckedChange={(checked) => updateConfig({
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
                  <Button onClick={() => updateConfig(currentConfig)}>
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
                    placeholder="Welcome to Wizzered!"
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
                  <SelectItem value="forwarded">Forwarded</SelectItem></