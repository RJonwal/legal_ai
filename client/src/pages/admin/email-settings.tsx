
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Bell,
  Bot,
  MessageSquare,
  Brain,
  User,
  Database,
  UserCheck,
  Key,
  MessageCircle,
  Phone,
  ShoppingCart,
  Calendar,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  FileSearch
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'auth' | 'billing' | 'system' | 'marketing' | 'support' | 'custom';
  content: string;
  isActive: boolean;
  aiAssisted: boolean;
  lastModified: string;
  variables: string[];
}

interface AIPermission {
  id: string;
  name: string;
  description: string;
  category: 'user_data' | 'billing' | 'cases' | 'system' | 'support' | 'actions';
  enabled: boolean;
  icon: any;
}

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom' as const
  });

  // Fetch email configuration
  const { data: emailSettings = {} } = useQuery({
    queryKey: ['admin-email-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-settings');
      if (!response.ok) throw new Error('Failed to fetch email settings');
      return response.json();
    },
  });

  const { data: aiPermissions = [] } = useQuery({
    queryKey: ['admin-ai-permissions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai-permissions');
      if (!response.ok) throw new Error('Failed to fetch AI permissions');
      return response.json();
    },
  });

  const { data: aiProviders = [] } = useQuery({
    queryKey: ['admin-ai-providers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai-providers');
      if (!response.ok) throw new Error('Failed to fetch AI providers');
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

  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
      setNewTemplateDialog(false);
      setCustomTemplate({ name: '', subject: '', content: '', category: 'custom' });
      toast({ title: "Template Created", description: "Email template created successfully." });
    },
  });

  const updateAIPermissionsMutation = useMutation({
    mutationFn: async (permissions: AIPermission[]) => {
      const response = await fetch('/api/admin/ai-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (!response.ok) throw new Error('Failed to update AI permissions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-permissions'] });
      toast({ title: "AI Permissions Updated", description: "AI assistant permissions have been updated." });
    },
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update email settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-settings'] });
      toast({ title: "Settings Updated", description: "Email settings updated successfully." });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'billing': return <CreditCard className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'marketing': return <Bell className="h-4 w-4" />;
      case 'support': return <HelpCircle className="h-4 w-4" />;
      case 'custom': return <FileText className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const defaultTemplates = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to LegalAI Pro',
      category: 'auth' as const,
      content: `Welcome to LegalAI Pro! Your account is ready to use.`,
      isActive: true,
      aiAssisted: false,
      lastModified: '2024-01-15',
      variables: ['user.name', 'user.email']
    },
    {
      id: '2',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      category: 'auth' as const,
      content: `Click here to reset your password: {{reset.url}}`,
      isActive: true,
      aiAssisted: false,
      lastModified: '2024-01-15',
      variables: ['user.name', 'reset.url']
    },
    {
      id: '3',
      name: 'Payment Confirmation',
      subject: 'Payment Received',
      category: 'billing' as const,
      content: `Thank you for your payment of ${{payment.amount}}`,
      isActive: true,
      aiAssisted: true,
      lastModified: '2024-01-15',
      variables: ['payment.amount', 'invoice.number']
    },
    {
      id: '4',
      name: 'Low Balance Alert',
      subject: 'Token Balance Running Low',
      category: 'system' as const,
      content: `Your token balance is running low. Current balance: {{tokens.remaining}}`,
      isActive: true,
      aiAssisted: true,
      lastModified: '2024-01-15',
      variables: ['tokens.remaining', 'user.name']
    },
    {
      id: '5',
      name: 'Support Response',
      subject: 'Re: Your Support Request',
      category: 'support' as const,
      content: `Thank you for contacting support. Here's the response to your inquiry...`,
      isActive: true,
      aiAssisted: true,
      lastModified: '2024-01-15',
      variables: ['ticket.id', 'user.name', 'support.response']
    }
  ];

  const defaultAIPermissions: AIPermission[] = [
    // User Data Permissions
    { id: 'user_profile', name: 'User Profile Access', description: 'Access basic user profile information', category: 'user_data', enabled: true, icon: User },
    { id: 'user_preferences', name: 'User Preferences', description: 'View and modify user preferences', category: 'user_data', enabled: true, icon: Settings },
    { id: 'user_activity', name: 'User Activity History', description: 'Access user activity logs and history', category: 'user_data', enabled: false, icon: Clock },
    { id: 'user_contacts', name: 'Contact Information', description: 'Access user contact details', category: 'user_data', enabled: true, icon: Phone },

    // Billing Permissions
    { id: 'billing_info', name: 'Billing Information', description: 'View subscription and billing details', category: 'billing', enabled: true, icon: CreditCard },
    { id: 'payment_history', name: 'Payment History', description: 'Access payment and transaction history', category: 'billing', enabled: true, icon: FileSearch },
    { id: 'token_balance', name: 'Token Balance', description: 'View current token balance and usage', category: 'billing', enabled: true, icon: Database },
    { id: 'process_payments', name: 'Process Payments', description: 'Initiate payment processing', category: 'billing', enabled: false, icon: ShoppingCart },

    // Case Management Permissions
    { id: 'case_access', name: 'Case Information', description: 'Access case details and documents', category: 'cases', enabled: true, icon: FileText },
    { id: 'case_creation', name: 'Create Cases', description: 'Create new cases on behalf of users', category: 'cases', enabled: false, icon: Plus },
    { id: 'document_generation', name: 'Document Generation', description: 'Generate legal documents', category: 'cases', enabled: true, icon: FileText },
    { id: 'case_analysis', name: 'Case Analysis', description: 'Perform AI-powered case analysis', category: 'cases', enabled: true, icon: Brain },

    // System Permissions
    { id: 'system_status', name: 'System Status', description: 'Check system health and status', category: 'system', enabled: true, icon: TrendingUp },
    { id: 'user_management', name: 'User Management', description: 'View user information for support', category: 'system', enabled: false, icon: Users },
    { id: 'system_config', name: 'System Configuration', description: 'Access system configuration', category: 'system', enabled: false, icon: Settings },
    { id: 'audit_logs', name: 'Audit Logs', description: 'Access system audit logs', category: 'system', enabled: false, icon: FileSearch },

    // Support Actions
    { id: 'ticket_creation', name: 'Create Support Tickets', description: 'Create support tickets for users', category: 'support', enabled: true, icon: HelpCircle },
    { id: 'knowledge_base', name: 'Knowledge Base Access', description: 'Access knowledge base articles', category: 'support', enabled: true, icon: FileText },
    { id: 'escalate_issues', name: 'Escalate to Human', description: 'Transfer to human support agents', category: 'support', enabled: true, icon: UserCheck },
    { id: 'account_assistance', name: 'Account Assistance', description: 'Help with account-related issues', category: 'support', enabled: true, icon: User },

    // Advanced Actions
    { id: 'schedule_appointments', name: 'Schedule Appointments', description: 'Schedule meetings and appointments', category: 'actions', enabled: false, icon: Calendar },
    { id: 'send_notifications', name: 'Send Notifications', description: 'Send notifications to users', category: 'actions', enabled: true, icon: Bell },
    { id: 'data_export', name: 'Data Export', description: 'Export user data and reports', category: 'actions', enabled: false, icon: FileSearch },
    { id: 'integration_access', name: 'Third-party Integrations', description: 'Access connected integrations', category: 'actions', enabled: false, icon: Globe }
  ];

  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    const updatedPermissions = defaultAIPermissions.map(permission =>
      permission.id === permissionId ? { ...permission, enabled } : permission
    );
    updateAIPermissionsMutation.mutate(updatedPermissions);
  };

  const getPermissionsByCategory = (category: string) => {
    return defaultAIPermissions.filter(permission => permission.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email & AI Management</h1>
          <p className="text-gray-600 mt-1">Configure email templates, AI assistants, and live chat</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newTemplateDialog} onOpenChange={setNewTemplateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Email Template</DialogTitle>
                <DialogDescription>
                  Create a new email template with optional AI assistance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={customTemplate.name}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Custom Notification"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={customTemplate.category}
                      onValueChange={(value) => setCustomTemplate(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="template-subject">Subject Line</Label>
                  <Input
                    id="template-subject"
                    value={customTemplate.subject}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject with {{variables}}"
                  />
                </div>
                <div>
                  <Label htmlFor="template-content">Email Content</Label>
                  <Textarea
                    id="template-content"
                    value={customTemplate.content}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Email content with {{variables}} for dynamic data"
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createTemplateMutation.mutate(customTemplate)}
                  disabled={!customTemplate.name || !customTemplate.subject}
                >
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Email Assistant</TabsTrigger>
          <TabsTrigger value="live-chat">AI Live Chat</TabsTrigger>
          <TabsTrigger value="providers">Email Providers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
                    <div className="flex gap-1">
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {template.aiAssisted && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Bot className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
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

        {/* AI Email Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Email Assistant Configuration
                </CardTitle>
                <CardDescription>
                  Configure what information the AI can access when generating email responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable AI Email Assistant</Label>
                    <p className="text-xs text-gray-600">Allow AI to assist with email responses</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">AI Provider</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map((provider: any) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} {provider.isActive && <Badge className="ml-2">Active</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Response Tone</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Capabilities Overview</CardTitle>
                <CardDescription>Summary of enabled AI permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Data Access</span>
                    <Badge variant="outline">
                      {getPermissionsByCategory('user_data').filter(p => p.enabled).length} / {getPermissionsByCategory('user_data').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Billing Information</span>
                    <Badge variant="outline">
                      {getPermissionsByCategory('billing').filter(p => p.enabled).length} / {getPermissionsByCategory('billing').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Case Management</span>
                    <Badge variant="outline">
                      {getPermissionsByCategory('cases').filter(p => p.enabled).length} / {getPermissionsByCategory('cases').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Support Actions</span>
                    <Badge variant="outline">
                      {getPermissionsByCategory('support').filter(p => p.enabled).length} / {getPermissionsByCategory('support').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Permissions & Capabilities</CardTitle>
              <CardDescription>
                Configure what information and actions the AI assistant can access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="user_data" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="user_data">User Data</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="cases">Cases</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                {['user_data', 'billing', 'cases', 'system', 'support', 'actions'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getPermissionsByCategory(category).map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={permission.id}
                            checked={permission.enabled}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <permission.icon className="h-4 w-4 text-gray-500" />
                              <Label htmlFor={permission.id} className="text-sm font-medium">
                                {permission.name}
                              </Label>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Live Chat Tab */}
        <TabsContent value="live-chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI-powered live chat for your users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Live Chat</Label>
                    <p className="text-xs text-gray-600">Allow users to chat with AI assistant</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">24/7 Availability</Label>
                    <p className="text-xs text-gray-600">Keep chat available outside business hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Human Handoff</Label>
                    <p className="text-xs text-gray-600">Allow AI to transfer to human agents</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label className="text-sm font-medium">Chat Position</Label>
                  <Select defaultValue="bottom-right">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">AI Provider for Chat</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map((provider: any) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} {provider.isActive && <Badge className="ml-2">Active</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Uses the same API key configured in AI Providers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat Behavior Settings</CardTitle>
                <CardDescription>Configure how the AI behaves in live chat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Maximum Response Length</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (100 words)</SelectItem>
                      <SelectItem value="medium">Medium (200 words)</SelectItem>
                      <SelectItem value="long">Long (300 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Response Style</Label>
                  <Select defaultValue="helpful">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="helpful">Helpful & Informative</SelectItem>
                      <SelectItem value="concise">Concise & Direct</SelectItem>
                      <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Escalation Triggers</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="escalate-billing" defaultChecked />
                      <Label htmlFor="escalate-billing" className="text-sm">Billing disputes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="escalate-technical" defaultChecked />
                      <Label htmlFor="escalate-technical" className="text-sm">Technical issues</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="escalate-complex" defaultChecked />
                      <Label htmlFor="escalate-complex" className="text-sm">Complex legal questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="escalate-complaint" defaultChecked />
                      <Label htmlFor="escalate-complaint" className="text-sm">Complaints</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Chat AI Permissions</CardTitle>
              <CardDescription>
                Configure what the live chat AI can access and do (uses same permissions as email assistant)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Live chat AI uses the same permission settings configured in the AI Email Assistant tab. 
                  Any changes made there will apply to both email and chat interactions.
                </AlertDescription>
              </Alert>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">User Data</div>
                  <div className="text-xs text-gray-600">
                    {getPermissionsByCategory('user_data').filter(p => p.enabled).length} enabled
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">Billing</div>
                  <div className="text-xs text-gray-600">
                    {getPermissionsByCategory('billing').filter(p => p.enabled).length} enabled
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm font-medium">Cases</div>
                  <div className="text-xs text-gray-600">
                    {getPermissionsByCategory('cases').filter(p => p.enabled).length} enabled
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-sm font-medium">Support</div>
                  <div className="text-xs text-gray-600">
                    {getPermissionsByCategory('support').filter(p => p.enabled).length} enabled
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
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
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Email Configuration</CardTitle>
              <CardDescription>System-wide email settings and preferences</CardDescription>
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
                  <Label className="text-sm font-medium">AI Email Generation</Label>
                  <p className="text-xs text-gray-600">Allow AI to generate email content</p>
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
