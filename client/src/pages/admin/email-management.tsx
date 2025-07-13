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
  templates: [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Wizzered - Your Legal Assistant is Ready!',
      content: `Dear {{name}},

Welcome to Wizzered! We're thrilled to have you join our community of legal professionals and individuals seeking efficient legal assistance.

Your account has been successfully created and you now have access to:
- AI-powered legal document analysis
- Case management tools
- Legal research assistance
- 24/7 support from our team

Getting Started:
1. Complete your profile setup
2. Upload your first legal document
3. Explore our AI assistant features
4. Access our comprehensive help center

If you have any questions or need assistance, our support team is here to help at support@wizzered.com or through our live chat.

Best regards,
The Wizzered Team

Email: support@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com`,
      type: 'signup',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'email', 'account_type']
    },
    {
      id: '2',
      name: 'Payment Confirmation',
      subject: 'Payment Confirmed - Wizzered Subscription Active',
      content: `Dear {{name}},

Thank you for your payment! Your Wizzered subscription is now active.

Payment Details:
- Plan: {{plan_name}}
- Amount: ${{amount}}
- Invoice ID: {{invoice_id}}
- Next billing date: {{next_billing_date}}

Your subscription includes:
- Unlimited AI legal assistance
- Advanced case management
- Priority support
- Document generation tools
- Legal research database access

You can manage your subscription and billing details in your account settings.

If you have any questions about your subscription or billing, please contact our support team at billing@wizzered.com.

Best regards,
The Wizzered Billing Team

Email: billing@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com`,
      type: 'payment',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'plan_name', 'amount', 'invoice_id', 'next_billing_date']
    },
    {
      id: '3',
      name: 'Support Ticket Response',
      subject: 'Re: Your Support Request - Wizzered Support Team',
      content: `Dear {{name}},

Thank you for contacting Wizzered support. We have received your inquiry and our team is working to assist you.

Ticket Details:
- Ticket ID: {{ticket_id}}
- Subject: {{ticket_subject}}
- Priority: {{priority}}
- Status: {{status}}

Our support team will respond to your inquiry within:
- High Priority: 1-2 hours
- Medium Priority: 4-6 hours
- Low Priority: 24 hours

You can track the status of your support ticket in your account dashboard or by replying to this email.

For immediate assistance with urgent matters, please call our support line at +1 (555) 123-4567.

Best regards,
Wizzered Support Team

Email: support@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com/support`,
      type: 'support',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'ticket_id', 'ticket_subject', 'priority', 'status']
    },
    {
      id: '4',
      name: 'Password Reset',
      subject: 'Reset Your Wizzered Password',
      content: `Dear {{name}},

We received a request to reset your Wizzered account password. If you made this request, please click the link below to reset your password:

{{reset_link}}

This link will expire in 24 hours for security purposes.

If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.

Security Tips:
- Use a strong, unique password
- Enable two-factor authentication
- Never share your login credentials
- Log out from shared devices

If you need assistance, our support team is available at support@wizzered.com.

Best regards,
The Wizzered Security Team

Email: security@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com`,
      type: 'custom',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'reset_link', 'expiry_time']
    },
    {
      id: '5',
      name: 'Case Status Update',
      subject: 'Case Update: {{case_title}} - Wizzered',
      content: `Dear {{name}},

We have an update on your case: {{case_title}}

Case Details:
- Case ID: {{case_id}}
- Status: {{status}}
- Last Updated: {{last_updated}}
- Next Action: {{next_action}}

Update Summary:
{{update_summary}}

{{#if documents_added}}
New documents have been added to your case file:
{{#each documents}}
- {{this}}
{{/each}}
{{/if}}

{{#if action_required}}
Action Required:
{{action_details}}
{{/if}}

You can view the complete case details and any new documents in your Wizzered dashboard.

If you have any questions about this update or your case, please don't hesitate to contact us.

Best regards,
Your Wizzered Legal Team

Email: legal@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com/cases`,
      type: 'custom',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'case_title', 'case_id', 'status', 'last_updated', 'next_action', 'update_summary', 'documents_added', 'action_required', 'action_details']
    },
    {
      id: '6',
      name: 'Document Review Complete',
      subject: 'Document Review Complete - {{document_name}}',
      content: `Dear {{name}},

Your document review has been completed by our AI legal assistant.

Document Details:
- Document: {{document_name}}
- Review Type: {{review_type}}
- Completed: {{completion_date}}
- Analysis Score: {{analysis_score}}

Review Summary:
{{review_summary}}

Key Findings:
{{#each findings}}
- {{this}}
{{/each}}

Recommendations:
{{#each recommendations}}
- {{this}}
{{/each}}

{{#if issues_found}}
Issues Identified:
{{#each issues}}
- {{this}}
{{/each}}
{{/if}}

The complete review report is available in your dashboard. If you need clarification on any findings or recommendations, our legal team is available to assist you.

Best regards,
Wizzered AI Legal Assistant

Email: legal@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com/documents`,
      type: 'custom',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'document_name', 'review_type', 'completion_date', 'analysis_score', 'review_summary', 'findings', 'recommendations', 'issues_found', 'issues']
    },
    {
      id: '7',
      name: 'Appointment Reminder',
      subject: 'Appointment Reminder - {{appointment_date}} at {{appointment_time}}',
      content: `Dear {{name}},

This is a reminder about your upcoming appointment with Wizzered.

Appointment Details:
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Duration: {{duration}}
- Type: {{appointment_type}}
- Location: {{location}}

{{#if is_video_call}}
Video Call Details:
- Join Link: {{video_link}}
- Meeting ID: {{meeting_id}}
- Password: {{meeting_password}}
{{/if}}

What to Bring:
{{#each required_documents}}
- {{this}}
{{/each}}

Preparation Notes:
{{preparation_notes}}

If you need to reschedule or cancel this appointment, please contact us at least 24 hours in advance at support@wizzered.com or +1 (555) 123-4567.

We look forward to meeting with you.

Best regards,
The Wizzered Team

Email: appointments@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com/appointments`,
      type: 'custom',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'appointment_date', 'appointment_time', 'duration', 'appointment_type', 'location', 'is_video_call', 'video_link', 'meeting_id', 'meeting_password', 'required_documents', 'preparation_notes']
    },
    {
      id: '8',
      name: 'Trial Expiration Notice',
      subject: 'Your Wizzered Trial is Expiring Soon',
      content: `Dear {{name}},

Your Wizzered trial period is ending soon. Don't lose access to your legal assistant!

Trial Details:
- Trial ends: {{trial_end_date}}
- Days remaining: {{days_remaining}}
- Current plan: {{current_plan}}

During your trial, you've:
- Analyzed {{documents_analyzed}} documents
- Created {{cases_created}} cases
- Saved {{hours_saved}} hours of legal work

Continue Your Journey:
Choose from our flexible subscription plans to maintain uninterrupted access to Wizzered's powerful legal tools.

Recommended Plan: {{recommended_plan}}
- Monthly: ${{monthly_price}}
- Annual: ${{annual_price}} (Save {{annual_savings}}!)

Features you'll keep:
- AI-powered legal analysis
- Unlimited document reviews
- Case management tools
- 24/7 support
- Legal research database

{{upgrade_link}}

Questions? Our team is here to help you choose the right plan for your needs.

Best regards,
The Wizzered Team

Email: sales@wizzered.com
Phone: +1 (555) 123-4567
Website: https://wizzered.com/pricing`,
      type: 'custom',
      enabled: true,
      lastModified: new Date().toISOString(),
      variables: ['name', 'trial_end_date', 'days_remaining', 'current_plan', 'documents_analyzed', 'cases_created', 'hours_saved', 'recommended_plan', 'monthly_price', 'annual_price', 'annual_savings', 'upgrade_link']
    }
  ],
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/email/config', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch email config');
      return response.json();
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<EmailConfig>) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/email/config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
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
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/email/respond', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
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
                  <SelectItem value="forwarded">Forwarded</SelectItem>SelectItem>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredEmails.map((email) => (
              <Card key={email.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={email.type === 'sent' ? 'default' : email.type === 'received' ? 'secondary' : 'outline'}>
                          {email.type}
                        </Badge>
                        <Badge variant={email.status === 'success' ? 'default' : email.status === 'failed' ? 'destructive' : 'secondary'}>
                          {email.status}
                        </Badge>
                        {email.priority === 'high' && <Badge variant="destructive">High Priority</Badge>}
                        {email.aiProcessed && <Badge variant="outline"><Bot className="h-3 w-3 mr-1" />AI Processed</Badge>}
                        {email.humanCorrected && <Badge variant="outline"><User className="h-3 w-3 mr-1" />Human Corrected</Badge>}
                      </div>
                      <CardTitle className="text-base">{email.subject}</CardTitle>
                      <CardDescription>
                        {email.type === 'sent' ? `To: ${email.to}` : `From: ${email.from}`} • {email.timestamp}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {email.type === 'received' && !email.forwardedToHuman && (
                        <Button size="sm" variant="outline" onClick={() => handleRespondToEmail(email)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Respond
                        </Button>
                      )}
                      {email.aiProcessed && (
                        <Button size="sm" variant="outline" onClick={() => handleInterceptEmail(email.id)}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Intercept
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setSelectedEmail(email)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{email.content}</p>
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {email.attachments.length} attachment(s)
                      </span>
                    </div>
                  )}
                  {email.tags && email.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {email.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
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
              {selectedEmail && (
                <div className="space-y-4">
                  <div className="border rounded p-3 bg-muted">
                    <p className="text-sm font-medium">Original Message:</p>
                    <p className="text-sm">{selectedEmail.content}</p>
                  </div>
                  <div>
                    <Label>Your Response</Label>
                    <Textarea
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                      placeholder="Type your response here..."
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
                        {currentConfig.signatures?.map((sig) => (
                          <SelectItem key={sig.id} value={sig.id}>{sig.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => sendResponseMutation.mutate({
                        emailId: selectedEmail.id,
                        content: responseContent,
                        signature: selectedSignature
                      })}
                      disabled={sendResponseMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </Button>
                    <Button variant="outline" onClick={() => setIsRespondingToEmail(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant Configuration
              </CardTitle>
              <CardDescription>Configure AI assistant behavior and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-enabled"
                  checked={currentConfig.aiAssistant.enabled}
                  onCheckedChange={(checked) => updateConfig({
                    aiAssistant: { ...currentConfig.aiAssistant, enabled: checked }
                  })}
                />
                <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Provider</Label>
                  <Select 
                    value={currentConfig.aiAssistant.provider}
                    onValueChange={(value) => updateConfig({
                      aiAssistant: { ...currentConfig.aiAssistant, provider: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model</Label>
                  <Select 
                    value={currentConfig.aiAssistant.model}
                    onValueChange={(value) => updateConfig({
                      aiAssistant: { ...currentConfig.aiAssistant, model: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Response Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={currentConfig.aiAssistant.responseSettings.maxTokens}
                      onChange={(e) => updateConfig({
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
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={currentConfig.aiAssistant.responseSettings.temperature}
                      onChange={(e) => updateConfig({
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
                  <Label>System Prompt</Label>
                  <Textarea
                    value={currentConfig.aiAssistant.responseSettings.systemPrompt}
                    onChange={(e) => updateConfig({
                      aiAssistant: {
                        ...currentConfig.aiAssistant,
                        responseSettings: {
                          ...currentConfig.aiAssistant.responseSettings,
                          systemPrompt: e.target.value
                        }
                      }
                    })}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-response"
                    checked={currentConfig.aiAssistant.responseSettings.autoResponse}
                    onCheckedChange={(checked) => updateConfig({
                      aiAssistant: {
                        ...currentConfig.aiAssistant,
                        responseSettings: {
                          ...currentConfig.aiAssistant.responseSettings,
                          autoResponse: checked
                        }
                      }
                    })}
                  />
                  <Label htmlFor="auto-response">Enable Auto Response</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">AI Permissions</h4>
                <p className="text-sm text-muted-foreground">
                  Configure what actions the AI assistant can perform autonomously
                </p>
                
                {aiPermissionCategories.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <h5 className="font-medium text-sm">{category.title}</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {category.permissions.map((permission) => {
                        const IconComponent = permission.icon;
                        return (
                          <div key={permission.key} className="flex items-center space-x-2">
                            <Switch
                              id={permission.key}
                              checked={currentConfig.aiAssistant.permissions[permission.key as keyof typeof currentConfig.aiAssistant.permissions]}
                              onCheckedChange={(checked) => updateConfig({
                                aiAssistant: {
                                  ...currentConfig.aiAssistant,
                                  permissions: {
                                    ...currentConfig.aiAssistant.permissions,
                                    [permission.key]: checked
                                  }
                                }
                              })}
                            />
                            <Label htmlFor={permission.key} className="flex items-center gap-2 text-sm">
                              <IconComponent className="h-3 w-3" />
                              {permission.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin-tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Tools & Controls
              </CardTitle>
              <CardDescription>Administrative controls for email management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Admin Capabilities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-can-respond"
                      checked={currentConfig.adminTools.canRespond}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: { ...currentConfig.adminTools, canRespond: checked }
                      })}
                    />
                    <Label htmlFor="admin-can-respond">Admin can respond to emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-can-intercept"
                      checked={currentConfig.adminTools.canIntercept}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: { ...currentConfig.adminTools, canIntercept: checked }
                      })}
                    />
                    <Label htmlFor="admin-can-intercept">Admin can intercept AI responses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-can-view-all"
                      checked={currentConfig.adminTools.canViewAll}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: { ...currentConfig.adminTools, canViewAll: checked }
                      })}
                    />
                    <Label htmlFor="admin-can-view-all">Admin can view all emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-can-edit-responses"
                      checked={currentConfig.adminTools.canEditResponses}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: { ...currentConfig.adminTools, canEditResponses: checked }
                      })}
                    />
                    <Label htmlFor="admin-can-edit-responses">Admin can edit AI responses</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Settings</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-new-emails"
                      checked={currentConfig.adminTools.notificationSettings.newEmails}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            newEmails: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-new-emails">Notify admin of new emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-escalations"
                      checked={currentConfig.adminTools.notificationSettings.escalations}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            escalations: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-escalations">Notify admin of escalations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notify-failed-deliveries"
                      checked={currentConfig.adminTools.notificationSettings.failedDeliveries}
                      onCheckedChange={(checked) => updateConfig({
                        adminTools: {
                          ...currentConfig.adminTools,
                          notificationSettings: {
                            ...currentConfig.adminTools.notificationSettings,
                            failedDeliveries: checked
                          }
                        }
                      })}
                    />
                    <Label htmlFor="notify-failed-deliveries">Notify admin of failed deliveries</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}SelectItem></