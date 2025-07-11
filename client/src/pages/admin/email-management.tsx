
import { useState, useEffect, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Send, 
  Settings, 
  Bot, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  TestTube,
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
    operationalEmails: string[];
  };
  templates: EmailTemplate[];
  emailLogs: EmailLog[];
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
}

export default function EmailManagement() {
  const queryClient = useQueryClient();
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [newOperationalEmail, setNewOperationalEmail] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "custom" as const,
    variables: [] as string[]
  });

  // Default configuration
  const defaultConfig: EmailConfig = useMemo(() => ({
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
    emailLogs: [],
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
    }
  }), []);

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

  const currentConfig = emailConfig || defaultConfig;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">
          Manage email templates, SMTP configuration, and AI email assistant
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="email-logs">Email Logs</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
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
                  {currentConfig.templates.map((template) => (
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
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsCreatingTemplate(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Template
                  </Button>
                  
                  {isCreatingTemplate && (
                    <Card className="mt-4 border-dashed">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <Label>Template Name</Label>
                          <Input
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter template name"
                          />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={newTemplate.subject}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Email subject"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={newTemplate.content}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Email content with {{variables}}"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => createTemplateMutation.mutate({
                              ...newTemplate,
                              enabled: true
                            })}
                            disabled={!newTemplate.name || !newTemplate.subject || createTemplateMutation.isPending}
                          >
                            Create Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setIsCreatingTemplate(false);
                              setNewTemplate({ name: "", subject: "", content: "", type: "custom", variables: [] });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                    <Input value={currentConfig.smtp.host} placeholder="smtp.gmail.com" />
                  </div>
                  
                  <div>
                    <Label>Port</Label>
                    <Input type="number" value={currentConfig.smtp.port} placeholder="587" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch checked={currentConfig.smtp.secure} />
                    <Label>Use SSL/TLS</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={currentConfig.smtp.user} placeholder="your-email@gmail.com" />
                  </div>
                  
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={currentConfig.smtp.password} placeholder="App password" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>From Name</Label>
                    <Input 
                      value={currentConfig.smtp.fromName} 
                      onChange={(e) => handleUpdateConfig({
                        smtp: { ...currentConfig.smtp, fromName: e.target.value }
                      })}
                      placeholder="LegalAI Pro" 
                    />
                  </div>
                  
                  <div>
                    <Label>From Email</Label>
                    <Input 
                      value={currentConfig.smtp.fromEmail} 
                      onChange={(e) => handleUpdateConfig({
                        smtp: { ...currentConfig.smtp, fromEmail: e.target.value }
                      })}
                      placeholder="noreply@legalai.pro" 
                    />
                  </div>
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
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateConfig({ smtp: currentConfig.smtp })}>
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

        <TabsContent value="email-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Email Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor all email activity, AI responses, and human interventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="sent">Sent Emails</SelectItem>
                      <SelectItem value="received">Received Emails</SelectItem>
                      <SelectItem value="forwarded">Forwarded to Human</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>

                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {currentConfig.emailLogs?.length > 0 ? (
                      currentConfig.emailLogs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={log.type === 'sent' ? 'default' : log.type === 'received' ? 'secondary' : 'outline'}>
                                {log.type}
                              </Badge>
                              <span className="text-sm font-medium">{log.subject}</span>
                              {log.aiProcessed && <Badge variant="outline">AI Processed</Badge>}
                              {log.humanCorrected && <Badge variant="destructive">Human Corrected</Badge>}
                              {log.forwardedToHuman && <Badge variant="secondary">Escalated</Badge>}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span><strong>From:</strong> {log.from}</span>
                            <span><strong>To:</strong> {log.to}</span>
                            <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="text-sm bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                            {log.content.substring(0, 200)}...
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No email activity yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
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
                    checked={currentConfig.aiAssistant.enabled}
                    onCheckedChange={(enabled) => 
                      handleUpdateConfig({ 
                        aiAssistant: { ...currentConfig.aiAssistant, enabled } 
                      })
                    }
                  />
                  <Label>Enable AI Email Assistant</Label>
                </div>

                {currentConfig.aiAssistant.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>AI Provider</Label>
                        <Select value={currentConfig.aiAssistant.provider}>
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
                        <Select value={currentConfig.aiAssistant.model}>
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
                          value={currentConfig.aiAssistant.responseSettings.maxTokens}
                          onChange={(e) => 
                            handleUpdateConfig({
                              aiAssistant: {
                                ...currentConfig.aiAssistant,
                                responseSettings: {
                                  ...currentConfig.aiAssistant.responseSettings,
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
                        value={currentConfig.aiAssistant.responseSettings.systemPrompt}
                        rows={3}
                        placeholder="Define how the AI should respond to emails..."
                        onChange={(e) =>
                          handleUpdateConfig({
                            aiAssistant: {
                              ...currentConfig.aiAssistant,
                              responseSettings: {
                                ...currentConfig.aiAssistant.responseSettings,
                                systemPrompt: e.target.value
                              }
                            }
                          })
                        }
                      />
                    </div>
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
