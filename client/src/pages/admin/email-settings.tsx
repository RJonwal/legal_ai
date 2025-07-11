
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  Settings, 
  Eye, 
  Edit, 
  Plus, 
  TestTube,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Zap,
  Users,
  CreditCard,
  FileText,
  Bell
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'auth' | 'billing' | 'system' | 'marketing';
  content: string;
  isActive: boolean;
  lastModified: string;
  variables: string[];
}

interface EmailProvider {
  id: string;
  name: 'smtp' | 'sendgrid' | 'mailgun' | 'postmark';
  isActive: boolean;
  config: Record<string, any>;
  status: 'healthy' | 'error' | 'warning';
}

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  // Fetch email configuration
  const { data: emailProviders = [] } = useQuery({
    queryKey: ['admin-email-providers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-providers');
      if (!response.ok) throw new Error('Failed to fetch email providers');
      return response.json();
    },
  });

  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-templates');
      if (!response.ok) throw new Error('Failed to fetch email templates');
      return response.json();
    },
  });

  const { data: emailSettings = {} } = useQuery({
    queryKey: ['admin-email-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-settings');
      if (!response.ok) throw new Error('Failed to fetch email settings');
      return response.json();
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      const response = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, email }),
      });
      if (!response.ok) throw new Error('Failed to send test email');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Test Email Sent", description: "Check your inbox for the test email." });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to send test email." 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'billing': return <CreditCard className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'marketing': return <Bell className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const defaultTemplates = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to LegalAI Pro',
      category: 'auth' as const,
      content: `<h1>Welcome to LegalAI Pro!</h1>
<p>Dear {{user.name}},</p>
<p>Thank you for joining LegalAI Pro. We're excited to help you streamline your legal practice with our AI-powered tools.</p>
<p>Your account has been successfully created. You can now access all our features including:</p>
<ul>
  <li>AI-powered legal analysis</li>
  <li>Document generation</li>
  <li>Case management</li>
  <li>Research tools</li>
</ul>
<p>If you have any questions, don't hesitate to reach out to our support team.</p>
<p>Best regards,<br>The LegalAI Pro Team</p>`,
      isActive: true,
      lastModified: '2024-01-15',
      variables: ['user.name', 'user.email', 'account.created_date']
    },
    {
      id: '2',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      category: 'auth' as const,
      content: `<h1>Password Reset Request</h1>
<p>Dear {{user.name}},</p>
<p>We received a request to reset your password. Click the link below to set a new password:</p>
<p><a href="{{reset.url}}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
<p>This link will expire in 24 hours. If you didn't request this reset, please ignore this email.</p>
<p>Best regards,<br>The LegalAI Pro Team</p>`,
      isActive: true,
      lastModified: '2024-01-15',
      variables: ['user.name', 'reset.url', 'reset.expires']
    },
    {
      id: '3',
      name: 'Payment Confirmation',
      subject: 'Payment Received - Invoice #{{invoice.number}}',
      category: 'billing' as const,
      content: `<h1>Payment Confirmed</h1>
<p>Dear {{user.name}},</p>
<p>Thank you for your payment. We've successfully processed your transaction.</p>
<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>Payment Details</h3>
  <p><strong>Amount:</strong> ${{payment.amount}}</p>
  <p><strong>Plan:</strong> {{subscription.plan}}</p>
  <p><strong>Invoice #:</strong> {{invoice.number}}</p>
  <p><strong>Next billing date:</strong> {{subscription.next_billing}}</p>
</div>
<p>You can view your invoice and manage your subscription in your account dashboard.</p>
<p>Best regards,<br>The LegalAI Pro Team</p>`,
      isActive: true,
      lastModified: '2024-01-15',
      variables: ['user.name', 'payment.amount', 'subscription.plan', 'invoice.number', 'subscription.next_billing']
    },
    {
      id: '4',
      name: 'Low Token Balance',
      subject: 'Token Balance Running Low',
      category: 'system' as const,
      content: `<h1>Token Balance Alert</h1>
<p>Dear {{user.name}},</p>
<p>Your token balance is running low. You currently have {{tokens.remaining}} tokens remaining.</p>
<p>To continue using our AI-powered features without interruption, consider purchasing additional tokens or upgrading your plan.</p>
<p><a href="{{billing.url}}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Purchase Tokens</a></p>
<p>Best regards,<br>The LegalAI Pro Team</p>`,
      isActive: true,
      lastModified: '2024-01-15',
      variables: ['user.name', 'tokens.remaining', 'billing.url']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-gray-600 mt-1">Configure email providers, templates, and notification settings</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Email Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMTP Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    SMTP Server
                  </CardTitle>
                  {getStatusBadge('healthy')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" defaultValue="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input id="smtp-port" type="number" defaultValue="587" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input id="smtp-username" defaultValue="noreply@legalai.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input id="smtp-password" type="password" defaultValue="••••••••" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable SSL/TLS</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Connection
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SendGrid Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    SendGrid
                  </CardTitle>
                  {getStatusBadge('warning')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sendgrid-key">API Key</Label>
                  <Input id="sendgrid-key" type="password" placeholder="SG...." />
                </div>
                <div>
                  <Label htmlFor="sendgrid-sender">Sender Email</Label>
                  <Input id="sendgrid-sender" defaultValue="noreply@legalai.com" />
                </div>
                <div>
                  <Label htmlFor="sendgrid-name">Sender Name</Label>
                  <Input id="sendgrid-name" defaultValue="LegalAI Pro" />
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Configure API key to enable SendGrid integration
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" variant="outline">
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Connection
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      {template.name}
                    </CardTitle>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="capitalize">{template.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variables:</span>
                      <span>{template.variables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified:</span>
                      <span>{template.lastModified}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="border-t pt-3">
                    <Label className="text-sm">Test Email:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="test@example.com"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => testEmailMutation.mutate({ 
                          templateId: template.id, 
                          email: testEmailAddress 
                        })}
                        disabled={!testEmailAddress || testEmailMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Notifications</CardTitle>
                <CardDescription>Configure when to send emails to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Welcome Email", description: "Send when new user signs up", checked: true },
                  { label: "Email Verification", description: "Send verification link", checked: true },
                  { label: "Password Reset", description: "Send reset instructions", checked: true },
                  { label: "Profile Updates", description: "Confirm profile changes", checked: false },
                  { label: "Login Alerts", description: "Notify of new logins", checked: false },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{notification.label}</Label>
                      <p className="text-xs text-gray-600">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={notification.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Configure system and admin notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Payment Confirmations", description: "Send payment receipts", checked: true },
                  { label: "Invoice Reminders", description: "Send before due date", checked: true },
                  { label: "Low Token Alerts", description: "Warn when tokens are low", checked: true },
                  { label: "System Maintenance", description: "Notify of scheduled maintenance", checked: true },
                  { label: "Security Alerts", description: "Send for security events", checked: true },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{notification.label}</Label>
                      <p className="text-xs text-gray-600">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={notification.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Global email settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="from-email">Default From Email</Label>
                  <Input id="from-email" defaultValue="noreply@legalai.com" />
                </div>
                <div>
                  <Label htmlFor="from-name">Default From Name</Label>
                  <Input id="from-name" defaultValue="LegalAI Pro" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reply-to">Reply-To Email</Label>
                  <Input id="reply-to" defaultValue="support@legalai.com" />
                </div>
                <div>
                  <Label htmlFor="bounce-email">Bounce Email</Label>
                  <Input id="bounce-email" defaultValue="bounce@legalai.com" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Tracking</Label>
                  <p className="text-xs text-gray-600">Track email opens and clicks</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Unsubscribe Links</Label>
                  <p className="text-xs text-gray-600">Include unsubscribe links in emails</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="email-footer">Email Footer</Label>
                <Textarea
                  id="email-footer"
                  placeholder="Add common footer text for all emails..."
                  rows={3}
                  defaultValue="© 2024 LegalAI Pro. All rights reserved."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
