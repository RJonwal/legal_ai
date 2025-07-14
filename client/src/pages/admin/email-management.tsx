import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  AlertCircle, 
  CheckCircle, 
  Mail, 
  Settings, 
  Send, 
  Edit, 
  Plus, 
  Trash2,
  Download,
  Eye
} from '@/lib/icons';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  enabled: boolean;
  lastModified: string;
  variables: string[];
}

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

interface EmailLog {
  id: string;
  timestamp: string;
  type: string;
  to: string;
  from: string;
  subject: string;
  status: string;
  aiProcessed: boolean;
  priority: string;
}

interface EmailSignature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  department: string;
}

export default function EmailManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('config');
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({});
  const [newSignature, setNewSignature] = useState<Partial<EmailSignature>>({});
  const [testEmail, setTestEmail] = useState('');

  // Fetch email configuration
  const { data: emailConfig, isLoading: configLoading } = useQuery<EmailConfig>({
    queryKey: ['/api/admin/email/config'],
  });

  // Fetch email templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email/templates'],
  });

  // Fetch email logs
  const { data: emailLogs = [], isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ['/api/admin/email/logs'],
  });

  // Fetch email signatures
  const { data: signatures = [], isLoading: signaturesLoading } = useQuery<EmailSignature[]>({
    queryKey: ['/api/admin/email/signatures'],
  });

  // Update email configuration
  const updateConfigMutation = useMutation({
    mutationFn: (config: EmailConfig) => 
      apiRequest('/api/admin/email/config', 'PUT', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/config'] });
      toast({ title: 'Email configuration updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update email configuration', variant: 'destructive' });
    }
  });

  // Create template
  const createTemplateMutation = useMutation({
    mutationFn: (template: Partial<EmailTemplate>) => 
      apiRequest('/api/admin/email/templates', 'POST', template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/templates'] });
      toast({ title: 'Template created successfully' });
      setNewTemplate({});
    },
    onError: () => {
      toast({ title: 'Failed to create template', variant: 'destructive' });
    }
  });

  // Send test email
  const sendTestEmailMutation = useMutation({
    mutationFn: (data: { email: string; templateId: string }) => 
      apiRequest('/api/admin/email/test', 'POST', data),
    onSuccess: () => {
      toast({ title: 'Test email sent successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to send test email', variant: 'destructive' });
    }
  });

  // Create signature
  const createSignatureMutation = useMutation({
    mutationFn: (signature: Partial<EmailSignature>) => 
      apiRequest('/api/admin/email/signatures', 'POST', signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/signatures'] });
      toast({ title: 'Signature created successfully' });
      setNewSignature({});
    },
    onError: () => {
      toast({ title: 'Failed to create signature', variant: 'destructive' });
    }
  });

  const handleConfigUpdate = (updates: Partial<EmailConfig>) => {
    if (emailConfig) {
      updateConfigMutation.mutate({ ...emailConfig, ...updates });
    }
  };

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.content) {
      createTemplateMutation.mutate(newTemplate);
    }
  };

  const handleSendTest = () => {
    if (testEmail && templates.length > 0) {
      sendTestEmailMutation.mutate({ 
        email: testEmail, 
        templateId: templates[0].id 
      });
    }
  };

  const handleCreateSignature = () => {
    if (newSignature.name && newSignature.content) {
      createSignatureMutation.mutate(newSignature);
    }
  };

  if (configLoading || templatesLoading || logsLoading || signaturesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <Badge variant="outline" className="text-sm">
          {emailConfig?.enabled ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select 
                    value={emailConfig?.provider || 'brevo'}
                    onValueChange={(value) => handleConfigUpdate({ provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brevo">Brevo</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={emailConfig?.apiKey || ''}
                    onChange={(e) => handleConfigUpdate({ apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailConfig?.fromEmail || ''}
                    onChange={(e) => handleConfigUpdate({ fromEmail: e.target.value })}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailConfig?.fromName || ''}
                    onChange={(e) => handleConfigUpdate({ fromName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Email Service Enabled</Label>
                <Switch
                  id="enabled"
                  checked={emailConfig?.enabled || false}
                  onCheckedChange={(checked) => handleConfigUpdate({ enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <Button onClick={handleSendTest} disabled={!testEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={template.enabled ? 'default' : 'secondary'}>
                          {template.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{template.subject}</p>
                    <p className="text-xs text-gray-500">
                      Variables: {template.variables.join(', ')}
                    </p>
                  </div>
                ))}

                <div className="border-2 border-dashed rounded p-4 space-y-4">
                  <h3 className="font-medium">Create New Template</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name || ''}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Welcome Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateType">Type</Label>
                      <Select 
                        value={newTemplate.type || ''}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signup">Signup</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateSubject">Subject</Label>
                    <Input
                      id="templateSubject"
                      value={newTemplate.subject || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Welcome to our platform!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateContent">Content</Label>
                    <Textarea
                      id="templateContent"
                      value={newTemplate.content || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="Email content here..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreateTemplate} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Logs
                </span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailLogs.map((log) => (
                  <div key={log.id} className="border rounded p-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.type === 'sent' ? 'default' : 'secondary'}>
                          {log.type}
                        </Badge>
                        <span className="text-sm font-medium">{log.subject}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.type === 'sent' ? `To: ${log.to}` : `From: ${log.from}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Email Signatures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signatures.map((signature) => (
                  <div key={signature.id} className="border rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{signature.name}</h3>
                        <p className="text-sm text-gray-600">{signature.department}</p>
                      </div>
                      <div className="flex gap-2">
                        {signature.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {signature.content}
                    </pre>
                  </div>
                ))}

                <div className="border-2 border-dashed rounded p-4 space-y-4">
                  <h3 className="font-medium">Create New Signature</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signatureName">Signature Name</Label>
                      <Input
                        id="signatureName"
                        value={newSignature.name || ''}
                        onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                        placeholder="Support Team"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signatureDepartment">Department</Label>
                      <Input
                        id="signatureDepartment"
                        value={newSignature.department || ''}
                        onChange={(e) => setNewSignature({ ...newSignature, department: e.target.value })}
                        placeholder="support"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signatureContent">Signature Content</Label>
                    <Textarea
                      id="signatureContent"
                      value={newSignature.content || ''}
                      onChange={(e) => setNewSignature({ ...newSignature, content: e.target.value })}
                      placeholder="Best regards,\nSupport Team"
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreateSignature} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Signature
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}