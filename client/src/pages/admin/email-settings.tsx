
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Send, 
  Settings, 
  Bot, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  Zap,
  Brain,
  Shield,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'signup' | 'payment' | 'balance' | 'custom';
  enabled: boolean;
  lastModified: string;
  variables: string[];
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
  };
  templates: EmailTemplate[];
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
  };
}

export default function EmailSettings() {
  const queryClient = useQueryClient();
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testEmail, setTestEmail] = useState("");

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

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { email: string; templateId?: string }) => {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  if (isLoading) {
    return <div className="p-6">Loading email settings...</div>;
  }

  const defaultConfig: EmailConfig = {
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: '',
      password: '',
      fromName: 'LegalAI Pro',
      fromEmail: 'noreply@legalai.pro'
    },
    templates: [
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to LegalAI Pro!',
        content: 'Welcome {{firstName}}, thank you for signing up for LegalAI Pro...',
        type: 'signup',
        enabled: true,
        lastModified: new Date().toISOString(),
        variables: ['firstName', 'lastName', 'email']
      },
      {
        id: '2',
        name: 'Payment Confirmation',
        subject: 'Payment Received - {{amount}}',
        content: 'Thank you for your payment of {{amount}}. Your subscription is now active...',
        type: 'payment',
        enabled: true,
        lastModified: new Date().toISOString(),
        variables: ['amount', 'transactionId', 'planName']
      },
      {
        id: '3',
        name: 'Low Balance Alert',
        subject: 'Low Token Balance Alert',
        content: 'Your token balance is running low. Current balance: {{balance}} tokens...',
        type: 'balance',
        enabled: true,
        lastModified: new Date().toISOString(),
        variables: ['balance', 'firstName']
      }
    ],
    aiAssistant: {
      enabled: true,
      provider: 'openai',
      model: 'gpt-4',
      permissions: {
        userManagement: false,
        billingInquiries: true,
        technicalSupport: true,
        accountSettings: true,
        caseManagement: false,
        documentGeneration: false,
        paymentProcessing: false,
        subscriptionChanges: false,
        dataExport: false,
        systemStatus: true,
        generalInquiries: true,
        escalateToHuman: true
      },
      responseSettings: {
        maxTokens: 500,
        temperature: 0.7,
        systemPrompt: 'You are a helpful AI assistant for LegalAI Pro. Provide accurate, professional responses to user inquiries.'
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
      }
    }
  };

  const config = emailConfig || defaultConfig;

  const handleUpdateConfig = (updates: Partial<EmailConfig>) => {
    updateConfigMutation.mutate(updates);
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

  const aiPermissionCategories = [
    {
      title: "Account Management",
      permissions: [
        { key: 'userManagement', label: 'User Account Management', icon: Users },
        { key: 'accountSettings', label: 'Account Settings', icon: Settings },
        { key: 'billingInquiries', label: 'Billing Inquiries', icon: CreditCard },
        { key: 'subscriptionChanges', label: 'Subscription Changes', icon: Calendar }
      ]
    },
    {
      title: "Case & Document Operations",
      permissions: [
        { key: 'caseManagement', label: 'Case Management', icon: FileText },
        { key: 'documentGeneration', label: 'Document Generation', icon: FileText },
        { key: 'dataExport', label: 'Data Export', icon: Activity }
      ]
    },
    {
      title: "Support & System",
      permissions: [
        { key: 'technicalSupport', label: 'Technical Support', icon: Settings },
        { key: 'systemStatus', label: 'System Status', icon: Activity },
        { key: 'generalInquiries', label: 'General Inquiries', icon: MessageSquare },
        { key: 'escalateToHuman', label: 'Escalate to Human', icon: Users }
      ]
    },
    {
      title: "Financial Operations",
      permissions: [
        { key: 'paymentProcessing', label: 'Payment Processing', icon: CreditCard }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Settings</h1>
        <p className="text-muted-foreground">
          Manage email templates, AI assistant, and live chat configuration
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Templates
                </CardTitle>
                <CardDescription>
                  Manage automated email templates for different events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        activeTemplate?.id === template.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.enabled ? "default" : "secondary"}>
                            {template.enabled ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Template Editor
                </CardTitle>
                <CardDescription>
                  Edit and test email templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input value={activeTemplate.name} readOnly />
                    </div>
                    
                    <div>
                      <Label>Subject</Label>
                      <Input value={activeTemplate.subject} />
                    </div>
                    
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={activeTemplate.content}
                        rows={8}
                        placeholder="Email content with {{variables}}"
                      />
                    </div>

                    <div>
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeTemplate.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch checked={activeTemplate.enabled} />
                      <Label>Template Enabled</Label>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Test Email</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <Button onClick={handleSendTestEmail} disabled={sendTestEmailMutation.isPending}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Send Test
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a template to edit
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure email server settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input value={config.smtp.host} placeholder="smtp.gmail.com" />
                  </div>
                  
                  <div>
                    <Label>Port</Label>
                    <Input type="number" value={config.smtp.port} placeholder="587" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch checked={config.smtp.secure} />
                    <Label>Use SSL/TLS</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={config.smtp.user} placeholder="your-email@gmail.com" />
                  </div>
                  
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={config.smtp.password} placeholder="App password" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>From Name</Label>
                    <Input value={config.smtp.fromName} placeholder="LegalAI Pro" />
                  </div>
                  
                  <div>
                    <Label>From Email</Label>
                    <Input value={config.smtp.fromEmail} placeholder="noreply@legalai.pro" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateConfig({ smtp: config.smtp })}>
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

        <TabsContent value="ai-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Email Assistant
              </CardTitle>
              <CardDescription>
                Configure AI assistant for automated email responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.aiAssistant.enabled}
                    onCheckedChange={(enabled) => 
                      handleUpdateConfig({ 
                        aiAssistant: { ...config.aiAssistant, enabled } 
                      })
                    }
                  />
                  <Label>Enable AI Email Assistant</Label>
                </div>

                {config.aiAssistant.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>AI Provider</Label>
                        <Select value={config.aiAssistant.provider}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="google">Google AI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Model</Label>
                        <Select value={config.aiAssistant.model}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="claude-3">Claude-3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Max Tokens</Label>
                        <Input 
                          type="number" 
                          value={config.aiAssistant.responseSettings.maxTokens}
                          onChange={(e) => 
                            handleUpdateConfig({
                              aiAssistant: {
                                ...config.aiAssistant,
                                responseSettings: {
                                  ...config.aiAssistant.responseSettings,
                                  maxTokens: parseInt(e.target.value)
                                }
                              }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>System Prompt</Label>
                      <Textarea
                        value={config.aiAssistant.responseSettings.systemPrompt}
                        rows={3}
                        placeholder="Define how the AI should respond to emails..."
                        onChange={(e) =>
                          handleUpdateConfig({
                            aiAssistant: {
                              ...config.aiAssistant,
                              responseSettings: {
                                ...config.aiAssistant.responseSettings,
                                systemPrompt: e.target.value
                              }
                            }
                          })
                        }
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">AI Assistant Permissions</h3>
                      <ScrollArea className="h-64 border rounded-lg p-4">
                        <div className="space-y-6">
                          {aiPermissionCategories.map((category) => (
                            <div key={category.title}>
                              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                {category.title}
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {category.permissions.map(({ key, label, icon: Icon }) => (
                                  <div key={key} className="flex items-center space-x-3">
                                    <Checkbox
                                      checked={config.aiAssistant.permissions[key as keyof typeof config.aiAssistant.permissions]}
                                      onCheckedChange={(checked) => {
                                        handleUpdateConfig({
                                          aiAssistant: {
                                            ...config.aiAssistant,
                                            permissions: {
                                              ...config.aiAssistant.permissions,
                                              [key]: checked
                                            }
                                          }
                                        });
                                      }}
                                    />
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm">{label}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Live Chat Configuration
              </CardTitle>
              <CardDescription>
                Configure AI-powered live chat support system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.liveChat.enabled}
                    onCheckedChange={(enabled) => 
                      handleUpdateConfig({ 
                        liveChat: { ...config.liveChat, enabled } 
                      })
                    }
                  />
                  <Label>Enable AI Live Chat</Label>
                </div>

                {config.liveChat.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Welcome Message</Label>
                          <Textarea
                            value={config.liveChat.autoResponses.welcomeMessage}
                            rows={2}
                            onChange={(e) =>
                              handleUpdateConfig({
                                liveChat: {
                                  ...config.liveChat,
                                  autoResponses: {
                                    ...config.liveChat.autoResponses,
                                    welcomeMessage: e.target.value
                                  }
                                }
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Offline Message</Label>
                          <Textarea
                            value={config.liveChat.autoResponses.offlineMessage}
                            rows={2}
                            onChange={(e) =>
                              handleUpdateConfig({
                                liveChat: {
                                  ...config.liveChat,
                                  autoResponses: {
                                    ...config.liveChat.autoResponses,
                                    offlineMessage: e.target.value
                                  }
                                }
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Escalation Message</Label>
                          <Textarea
                            value={config.liveChat.autoResponses.escalationMessage}
                            rows={2}
                            onChange={(e) =>
                              handleUpdateConfig({
                                liveChat: {
                                  ...config.liveChat,
                                  autoResponses: {
                                    ...config.liveChat.autoResponses,
                                    escalationMessage: e.target.value
                                  }
                                }
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch checked={config.liveChat.workingHours.enabled} />
                          <Label>Enable Working Hours</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Live Chat AI Permissions</h3>
                      <ScrollArea className="h-64 border rounded-lg p-4">
                        <div className="space-y-6">
                          {liveChatPermissionCategories.map((category) => (
                            <div key={category.title}>
                              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                {category.title}
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {category.permissions.map(({ key, label, icon: Icon }) => (
                                  <div key={key} className="flex items-center space-x-3">
                                    <Checkbox
                                      checked={config.liveChat.permissions[key as keyof typeof config.liveChat.permissions]}
                                      onCheckedChange={(checked) => {
                                        handleUpdateConfig({
                                          liveChat: {
                                            ...config.liveChat,
                                            permissions: {
                                              ...config.liveChat.permissions,
                                              [key]: checked
                                            }
                                          }
                                        });
                                      }}
                                    />
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm">{label}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {config.liveChat.workingHours.enabled && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Working Hours Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(config.liveChat.workingHours.schedule).map(([day, schedule]) => (
                              <div key={day} className="flex items-center space-x-4">
                                <div className="w-20 capitalize">{day}</div>
                                <Switch checked={schedule.active} />
                                <Input 
                                  type="time" 
                                  value={schedule.start} 
                                  className="w-32"
                                />
                                <span>to</span>
                                <Input 
                                  type="time" 
                                  value={schedule.end} 
                                  className="w-32"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        The AI live chat will use the same AI provider and model configured in the system settings. 
                        Make sure your AI provider has sufficient credits for real-time chat responses.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
