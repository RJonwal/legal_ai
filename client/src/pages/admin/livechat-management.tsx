
import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Settings, 
  Users, 
  Brain, 
  Shield, 
  CreditCard, 
  FileText, 
  Calendar, 
  Activity,
  AlertCircle,
  CheckCircle,
  Phone,
  Clock,
  Zap,
  Bot,
  Globe,
  Smartphone,
  Download,
  Eye,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LiveChatConfig {
  enabled: boolean;
  dashboardEnabled: boolean;
  landingEnabled: boolean;
  provider: string;
  plugin: {
    name: string;
    type: 'crisp' | 'intercom' | 'zendesk' | 'freshchat' | 'tawk' | 'livechat' | 'drift' | 'chatbot' | 'tidio' | 'olark' | 'purechat' | 'chatra' | 'custom';
    apiKey: string;
    websiteId: string;
    appId?: string;
    widgetKey?: string;
    subdomain?: string;
    domain?: string;
    propertyId?: string;
    widgetId?: string;
    licenseId?: string;
    botId?: string;
    publicKey?: string;
    siteId?: string;
    chatId?: string;
    customEndpoint?: string;
  };
  dashboardPermissions: {
    // Core Legal Services
    legalAdvice: boolean;
    caseAnalysis: boolean;
    documentReview: boolean;
    legalResearch: boolean;
    procedureGuidance: boolean;
    courtDeadlines: boolean;
    filingRequirements: boolean;
    jurisdictionHelp: boolean;
    legalFormAssistance: boolean;
    caseStrategyDiscussion: boolean;
    
    // Client Services
    clientOnboarding: boolean;
    caseStatusUpdates: boolean;
    appointmentScheduling: boolean;
    documentRequests: boolean;
    progressTracking: boolean;
    caseFileAccess: boolean;
    clientPortalNavigation: boolean;
    
    // Business Operations
    serviceInformation: boolean;
    pricingQuotes: boolean;
    billingSupport: boolean;
    paymentProcessing: boolean;
    subscriptionChanges: boolean;
    refundInquiries: boolean;
    planUpgrades: boolean;
    
    // Platform Support
    navigationAssistance: boolean;
    featureExplanation: boolean;
    troubleshooting: boolean;
    accountSetup: boolean;
    integrationSupport: boolean;
    dataExport: boolean;
    
    // Advanced Operations
    documentGeneration: boolean;
    reportGeneration: boolean;
    auditAccess: boolean;
    userAccountManagement: boolean;
    accessPermissions: boolean;
    systemStatus: boolean;
    
    // Emergency & Escalation
    urgentMatters: boolean;
    escalationManagement: boolean;
    emergencyContact: boolean;
    afterHoursSupport: boolean;
    crisisEscalation: boolean;
  };
  landingPermissions: {
    // Core Legal Services
    legalAdvice: boolean;
    caseAnalysis: boolean;
    documentReview: boolean;
    legalResearch: boolean;
    procedureGuidance: boolean;
    courtDeadlines: boolean;
    filingRequirements: boolean;
    jurisdictionHelp: boolean;
    legalFormAssistance: boolean;
    caseStrategyDiscussion: boolean;
    
    // Client Services
    clientOnboarding: boolean;
    caseStatusUpdates: boolean;
    appointmentScheduling: boolean;
    documentRequests: boolean;
    progressTracking: boolean;
    caseFileAccess: boolean;
    clientPortalNavigation: boolean;
    
    // Business Operations
    serviceInformation: boolean;
    pricingQuotes: boolean;
    billingSupport: boolean;
    paymentProcessing: boolean;
    subscriptionChanges: boolean;
    refundInquiries: boolean;
    planUpgrades: boolean;
    
    // Platform Support
    navigationAssistance: boolean;
    featureExplanation: boolean;
    troubleshooting: boolean;
    accountSetup: boolean;
    integrationSupport: boolean;
    dataExport: boolean;
    
    // Advanced Operations
    documentGeneration: boolean;
    reportGeneration: boolean;
    auditAccess: boolean;
    userAccountManagement: boolean;
    accessPermissions: boolean;
    systemStatus: boolean;
    
    // Emergency & Escalation
    urgentMatters: boolean;
    escalationManagement: boolean;
    emergencyContact: boolean;
    afterHoursSupport: boolean;
    crisisEscalation: boolean;
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
    queueMessage: string;
  };
  humanHandoff: {
    enabled: boolean;
    triggerKeywords: string[];
    escalationThreshold: number;
    forwardToEmails: string[];
    autoEscalateTime: number; // minutes
  };
  realTimeMonitoring: {
    enabled: boolean;
    allowIntercept: boolean;
    showTypingIndicator: boolean;
    supervisorNotifications: boolean;
  };
  aiSettings: {
    confidenceThreshold: number;
    maxResponseTime: number; // seconds
    fallbackToHuman: boolean;
    learningMode: boolean;
  };
}

export default function LiveChatManagement() {
  const queryClient = useQueryClient();
  const [newForwardEmail, setNewForwardEmail] = useState("");
  const [newTriggerKeyword, setNewTriggerKeyword] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showLiveChatMonitor, setShowLiveChatMonitor] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [interceptMessage, setInterceptMessage] = useState("");
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [screenShareStatus, setScreenShareStatus] = useState<{[key: string]: {active: boolean, hasControl: boolean}}>({});
  const [imageUploadStatus, setImageUploadStatus] = useState<{[key: string]: boolean}>({});

  // Default configuration
  const defaultConfig: LiveChatConfig = useMemo(() => ({
    enabled: true,
    dashboardEnabled: true,
    landingEnabled: false,
    provider: 'internal',
    plugin: {
      name: 'Crisp Chat',
      type: 'crisp',
      apiKey: '',
      websiteId: '',
      customEndpoint: ''
    },
    dashboardPermissions: {
      // Core Legal Services - Enable most for autonomy
      legalAdvice: true,
      caseAnalysis: true,
      documentReview: true,
      legalResearch: true,
      procedureGuidance: true,
      courtDeadlines: true,
      filingRequirements: true,
      jurisdictionHelp: true,
      legalFormAssistance: true,
      caseStrategyDiscussion: false, // Requires human oversight
      
      // Client Services - Full autonomy
      clientOnboarding: true,
      caseStatusUpdates: true,
      appointmentScheduling: true,
      documentRequests: true,
      progressTracking: true,
      caseFileAccess: true,
      clientPortalNavigation: true,
      
      // Business Operations - Selective autonomy
      serviceInformation: true,
      pricingQuotes: true,
      billingSupport: true,
      paymentProcessing: true,
      subscriptionChanges: true,
      refundInquiries: false, // Requires human approval
      planUpgrades: true,
      
      // Platform Support - Full autonomy
      navigationAssistance: true,
      featureExplanation: true,
      troubleshooting: true,
      accountSetup: true,
      integrationSupport: true,
      dataExport: true,
      
      // Advanced Operations - Limited autonomy
      documentGeneration: true,
      reportGeneration: true,
      auditAccess: false, // Security sensitive
      userAccountManagement: true,
      accessPermissions: false, // Security sensitive
      systemStatus: true,
      
      // Emergency & Escalation - Human oversight
      urgentMatters: true,
      escalationManagement: true,
      emergencyContact: true,
      afterHoursSupport: true,
      crisisEscalation: true
    },
    landingPermissions: {
      // Core Legal Services - Limited for landing page
      legalAdvice: false,
      caseAnalysis: false,
      documentReview: false,
      legalResearch: true,
      procedureGuidance: true,
      courtDeadlines: false,
      filingRequirements: false,
      jurisdictionHelp: true,
      legalFormAssistance: false,
      caseStrategyDiscussion: false,
      
      // Client Services - Basic info only
      clientOnboarding: true,
      caseStatusUpdates: false,
      appointmentScheduling: true,
      documentRequests: false,
      progressTracking: false,
      caseFileAccess: false,
      clientPortalNavigation: true,
      
      // Business Operations - Sales focused
      serviceInformation: true,
      pricingQuotes: true,
      billingSupport: false,
      paymentProcessing: false,
      subscriptionChanges: false,
      refundInquiries: false,
      planUpgrades: true,
      
      // Platform Support - Basic navigation
      navigationAssistance: true,
      featureExplanation: true,
      troubleshooting: false,
      accountSetup: true,
      integrationSupport: false,
      dataExport: false,
      
      // Advanced Operations - None
      documentGeneration: false,
      reportGeneration: false,
      auditAccess: false,
      userAccountManagement: false,
      accessPermissions: false,
      systemStatus: false,
      
      // Emergency & Escalation - Basic only
      urgentMatters: false,
      escalationManagement: true,
      emergencyContact: true,
      afterHoursSupport: false,
      crisisEscalation: false
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
      escalationMessage: 'Let me connect you with a human agent who can better assist you.',
      queueMessage: 'You are currently #{{position}} in the queue. Estimated wait time: {{waitTime}} minutes.'
    },
    humanHandoff: {
      enabled: true,
      triggerKeywords: ['human', 'agent', 'speak to someone', 'urgent', 'complaint', 'refund'],
      escalationThreshold: 3, // Number of failed AI responses
      forwardToEmails: ['support@legalai.pro'],
      autoEscalateTime: 15 // Auto escalate after 15 minutes
    },
    realTimeMonitoring: {
      enabled: true,
      allowIntercept: true,
      showTypingIndicator: true,
      supervisorNotifications: true
    },
    aiSettings: {
      confidenceThreshold: 0.7,
      maxResponseTime: 30,
      fallbackToHuman: true,
      learningMode: true
    }
  }), []);

  // Fetch live chat configuration
  const { data: chatConfig, isLoading } = useQuery({
    queryKey: ['admin-livechat-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/livechat/config');
      if (!response.ok) throw new Error('Failed to fetch live chat config');
      return response.json();
    },
  });

  // Fetch live chat conversations
  const { data: conversations } = useQuery({
    queryKey: ['admin-livechat-conversations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/livechat/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: showLiveChatMonitor
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ['admin-livechat-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/admin/livechat/conversations/${selectedConversation}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 2000, // Refresh every 2 seconds
    enabled: !!selectedConversation
  });

  // Fetch live chat analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin-livechat-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/livechat/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: showLiveChatMonitor
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<LiveChatConfig>) => {
      const response = await fetch('/api/admin/livechat/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-config'] });
      toast({ title: "Configuration updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    },
  });

  // Intercept conversation mutation
  const interceptMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const response = await fetch(`/api/admin/livechat/conversations/${conversationId}/intercept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to intercept conversation');
      return response.json();
    },
    onMutate: () => {
      setIsIntercepting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-conversations'] });
      setInterceptMessage("");
      setIsIntercepting(false);
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      setIsIntercepting(false);
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // Escalate conversation mutation
  const escalateMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/admin/livechat/conversations/${conversationId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to escalate conversation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-conversations'] });
      toast({ title: "Conversation escalated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to escalate conversation", variant: "destructive" });
    },
  });

  // Screen share mutation
  const screenShareMutation = useMutation({
    mutationFn: async ({ conversationId, action }: { conversationId: string; action: 'start' | 'stop' | 'request_control' }) => {
      const response = await fetch(`/api/admin/livechat/conversations/${conversationId}/screen-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to manage screen share');
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { conversationId, action } = variables;
      
      if (action === 'start') {
        setScreenShareStatus(prev => ({
          ...prev,
          [conversationId]: { active: true, hasControl: false }
        }));
        toast({ title: "Screen share request sent to user - waiting for permission" });
      } else if (action === 'stop') {
        setScreenShareStatus(prev => ({
          ...prev,
          [conversationId]: { active: false, hasControl: false }
        }));
        toast({ title: "Screen share session ended" });
      } else if (action === 'request_control') {
        setScreenShareStatus(prev => ({
          ...prev,
          [conversationId]: { ...prev[conversationId], hasControl: true }
        }));
        toast({ title: "Control request sent to user - awaiting permission" });
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-messages', conversationId] });
    },
    onError: (error, variables) => {
      toast({ 
        title: "Screen share action failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async ({ conversationId, file }: { conversationId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/admin/livechat/conversations/${conversationId}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    },
    onMutate: ({ conversationId }) => {
      setImageUploadStatus(prev => ({ ...prev, [conversationId]: true }));
    },
    onSuccess: (data, variables) => {
      setImageUploadStatus(prev => ({ ...prev, [variables.conversationId]: false }));
      queryClient.invalidateQueries({ queryKey: ['admin-livechat-messages', variables.conversationId] });
      toast({ title: "File uploaded successfully" });
    },
    onError: (error, variables) => {
      setImageUploadStatus(prev => ({ ...prev, [variables.conversationId]: false }));
      toast({ 
        title: "File upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const currentConfig = chatConfig || defaultConfig;

  if (isLoading) {
    return <div className="p-6">Loading live chat settings...</div>;
  }

  const handleUpdateConfig = (updates: Partial<LiveChatConfig>) => {
    updateConfigMutation.mutate(updates);
  };

  const addForwardEmail = () => {
    if (!newForwardEmail.trim()) return;
    
    const updatedEmails = [...(currentConfig.humanHandoff.forwardToEmails || []), newForwardEmail.trim()];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        forwardToEmails: updatedEmails
      }
    });
    setNewForwardEmail("");
  };

  const removeForwardEmail = (email: string) => {
    const updatedEmails = currentConfig.humanHandoff.forwardToEmails?.filter(e => e !== email) || [];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        forwardToEmails: updatedEmails
      }
    });
  };

  const addTriggerKeyword = () => {
    if (!newTriggerKeyword.trim()) return;
    
    const updatedKeywords = [...(currentConfig.humanHandoff.triggerKeywords || []), newTriggerKeyword.trim().toLowerCase()];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        triggerKeywords: updatedKeywords
      }
    });
    setNewTriggerKeyword("");
  };

  const removeTriggerKeyword = (keyword: string) => {
    const updatedKeywords = currentConfig.humanHandoff.triggerKeywords?.filter(k => k !== keyword) || [];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        triggerKeywords: updatedKeywords
      }
    });
  };

  const getSetupInstructions = (providerType: string) => {
    const instructions = {
      crisp: {
        title: "Crisp Chat Setup",
        steps: [
          "1. Go to https://crisp.chat and create an account",
          "2. Navigate to Settings > Website Settings",
          "3. Copy your Website ID from the installation code",
          "4. Go to Settings > API",
          "5. Generate a new API key with 'website:conversation:write' scope",
          "6. Paste API Key and Website ID in the form above"
        ],
        docs: "https://docs.crisp.chat/guides/chatbox-sdks/"
      },
      intercom: {
        title: "Intercom Setup", 
        steps: [
          "1. Sign in to your Intercom workspace",
          "2. Go to Settings > Installation",
          "3. Copy your App ID from the installation code",
          "4. Go to Developer Hub > Your Apps",
          "5. Create a new app and get your access token (API Key)",
          "6. Paste API Key and App ID in the form above"
        ],
        docs: "https://developers.intercom.com/installing-intercom/docs"
      },
      zendesk: {
        title: "Zendesk Chat Setup",
        steps: [
          "1. Log into your Zendesk Chat dashboard",
          "2. Go to Settings > Widget",
          "3. Copy your Widget Key from the embed code",
          "4. Note your subdomain (e.g., 'yourcompany' from yourcompany.zendesk.com)",
          "5. Go to Settings > API and generate OAuth token",
          "6. Paste API Key, Widget Key, and Subdomain in the form above"
        ],
        docs: "https://developer.zendesk.com/api-reference/live-chat/introduction/"
      },
      freshchat: {
        title: "Freshchat Setup",
        steps: [
          "1. Log into your Freshchat account",
          "2. Go to Settings > Integration",
          "3. Copy your Widget ID from the installation code",
          "4. Note your domain (e.g., 'yourcompany.freshchat.com')",
          "5. Go to API section and generate API key",
          "6. Paste API Key, Widget ID, and Domain in the form above"
        ],
        docs: "https://developers.freshchat.com/"
      },
      tawk: {
        title: "Tawk.to Setup",
        steps: [
          "1. Create account at https://tawk.to",
          "2. Add your website in the dashboard",
          "3. Go to Administration > Channels",
          "4. Copy Property ID and Widget ID from the installation code",
          "5. Note: API Key not required for basic integration",
          "6. Paste Property ID and Widget ID in the form above"
        ],
        docs: "https://help.tawk.to/article/api-introduction"
      },
      livechat: {
        title: "LiveChat Setup",
        steps: [
          "1. Sign up at https://livechat.com",
          "2. Go to Settings > Installation",
          "3. Copy your License ID from the tracking code",
          "4. Go to Developer Console > Apps",
          "5. Create new app and get access token (API Key)",
          "6. Paste API Key and License ID in the form above"
        ],
        docs: "https://developers.livechat.com/docs/"
      },
      drift: {
        title: "Drift Setup",
        steps: [
          "1. Create account at https://drift.com",
          "2. Go to Settings > Widget Setup",
          "3. Copy your App ID from the installation code",
          "4. Go to Settings > API Credentials",
          "5. Generate new OAuth access token (API Key)",
          "6. Paste API Key and App ID in the form above"
        ],
        docs: "https://devdocs.drift.com/"
      },
      chatbot: {
        title: "Chatbot.com Setup",
        steps: [
          "1. Create account at https://chatbot.com",
          "2. Create a new chatbot or select existing one",
          "3. Go to Integrations > Website Widget",
          "4. Copy your Bot ID from the embed code",
          "5. Go to Settings > API and generate API key",
          "6. Paste API Key and Bot ID in the form above"
        ],
        docs: "https://www.chatbot.com/docs/"
      },
      tidio: {
        title: "Tidio Setup",
        steps: [
          "1. Create account at https://tidio.com",
          "2. Go to Settings > Developer",
          "3. Copy your Public Key from the integration section",
          "4. Generate API key in the same section",
          "5. Paste API Key and Public Key in the form above"
        ],
        docs: "https://developer.tidio.com/"
      },
      olark: {
        title: "Olark Setup",
        steps: [
          "1. Create account at https://olark.com",
          "2. Go to Settings > Site Configuration",
          "3. Copy your Site ID from the installation code",
          "4. Go to Settings > API",
          "5. Generate API key with chat permissions",
          "6. Paste API Key and Site ID in the form above"
        ],
        docs: "https://www.olark.com/api"
      },
      purechat: {
        title: "Pure Chat Setup",
        steps: [
          "1. Create account at https://purechat.com",
          "2. Go to Settings > Installation",
          "3. Copy your Widget ID from the tracking code",
          "4. Go to Settings > API Access",
          "5. Generate API key for integration",
          "6. Paste API Key and Widget ID in the form above"
        ],
        docs: "https://purechat.com/api"
      },
      chatra: {
        title: "Chatra Setup",
        steps: [
          "1. Create account at https://chatra.com",
          "2. Go to Settings > Installation",
          "3. Copy your Chat ID from the widget code",
          "4. Go to Settings > API",
          "5. Generate API key for external integrations",
          "6. Paste API Key and Chat ID in the form above"
        ],
        docs: "https://chatra.com/api/"
      }
    };
    
    return instructions[providerType as keyof typeof instructions] || {
      title: "Generic Setup",
      steps: ["Please refer to your provider's documentation for setup instructions"],
      docs: ""
    };
  };

  const chatProviders = [
    { 
      value: 'crisp', 
      label: 'Crisp Chat', 
      description: 'Modern customer messaging platform',
      params: ['apiKey', 'websiteId']
    },
    { 
      value: 'intercom', 
      label: 'Intercom', 
      description: 'Customer messaging platform',
      params: ['apiKey', 'appId']
    },
    { 
      value: 'zendesk', 
      label: 'Zendesk Chat', 
      description: 'Help desk software with live chat',
      params: ['apiKey', 'widgetKey', 'subdomain']
    },
    { 
      value: 'freshchat', 
      label: 'Freshchat', 
      description: 'Modern messaging software',
      params: ['apiKey', 'widgetId', 'domain']
    },
    { 
      value: 'tawk', 
      label: 'Tawk.to', 
      description: 'Free live chat software',
      params: ['propertyId', 'widgetId']
    },
    { 
      value: 'livechat', 
      label: 'LiveChat', 
      description: 'Customer service platform',
      params: ['apiKey', 'licenseId']
    },
    { 
      value: 'drift', 
      label: 'Drift', 
      description: 'Conversational marketing platform',
      params: ['apiKey', 'appId']
    },
    { 
      value: 'chatbot', 
      label: 'Chatbot.com', 
      description: 'Visual chatbot builder',
      params: ['apiKey', 'botId']
    },
    { 
      value: 'tidio', 
      label: 'Tidio', 
      description: 'Live chat and chatbots',
      params: ['apiKey', 'publicKey']
    },
    { 
      value: 'olark', 
      label: 'Olark', 
      description: 'Live chat for small business',
      params: ['siteId', 'apiKey']
    },
    { 
      value: 'purechat', 
      label: 'Pure Chat', 
      description: 'Website chat widget',
      params: ['apiKey', 'widgetId']
    },
    { 
      value: 'chatra', 
      label: 'Chatra', 
      description: 'Live chat messenger',
      params: ['apiKey', 'chatId']
    },
    { 
      value: 'custom', 
      label: 'Custom Integration', 
      description: 'Your own chat system',
      params: ['customEndpoint', 'apiKey']
    }
  ];

  const permissionCategories = [
    {
      title: "Core Legal Services",
      permissions: [
        { key: 'legalAdvice', label: 'Legal Advice', icon: Users },
        { key: 'caseAnalysis', label: 'Case Analysis', icon: FileText },
        { key: 'documentReview', label: 'Document Review', icon: FileText },
        { key: 'legalResearch', label: 'Legal Research', icon: Brain },
        { key: 'procedureGuidance', label: 'Procedure Guidance', icon: MessageSquare },
        { key: 'courtDeadlines', label: 'Court Deadlines', icon: Calendar },
        { key: 'filingRequirements', label: 'Filing Requirements', icon: Shield },
        { key: 'jurisdictionHelp', label: 'Jurisdiction Help', icon: Globe },
        { key: 'legalFormAssistance', label: 'Legal Form Assistance', icon: FileText },
        { key: 'caseStrategyDiscussion', label: 'Case Strategy Discussion', icon: Brain }
      ]
    },
    {
      title: "Client Services",
      permissions: [
        { key: 'clientOnboarding', label: 'Client Onboarding', icon: Users },
        { key: 'caseStatusUpdates', label: 'Case Status Updates', icon: Activity },
        { key: 'appointmentScheduling', label: 'Appointment Scheduling', icon: Calendar },
        { key: 'documentRequests', label: 'Document Requests', icon: FileText },
        { key: 'progressTracking', label: 'Progress Tracking', icon: Activity },
        { key: 'caseFileAccess', label: 'Case File Access', icon: FileText },
        { key: 'clientPortalNavigation', label: 'Client Portal Navigation', icon: Globe }
      ]
    },
    {
      title: "Business Operations",
      permissions: [
        { key: 'serviceInformation', label: 'Service Information', icon: MessageSquare },
        { key: 'pricingQuotes', label: 'Pricing Quotes', icon: CreditCard },
        { key: 'billingSupport', label: 'Billing Support', icon: CreditCard },
        { key: 'paymentProcessing', label: 'Payment Processing', icon: CreditCard },
        { key: 'subscriptionChanges', label: 'Subscription Changes', icon: Settings },
        { key: 'refundInquiries', label: 'Refund Inquiries', icon: CreditCard },
        { key: 'planUpgrades', label: 'Plan Upgrades', icon: Settings }
      ]
    },
    {
      title: "Platform Support",
      permissions: [
        { key: 'navigationAssistance', label: 'Navigation Assistance', icon: Globe },
        { key: 'featureExplanation', label: 'Feature Explanation', icon: MessageSquare },
        { key: 'troubleshooting', label: 'Troubleshooting', icon: Activity },
        { key: 'accountSetup', label: 'Account Setup', icon: Settings },
        { key: 'integrationSupport', label: 'Integration Support', icon: Zap },
        { key: 'dataExport', label: 'Data Export', icon: Download }
      ]
    },
    {
      title: "Advanced Operations",
      permissions: [
        { key: 'documentGeneration', label: 'Document Generation', icon: FileText },
        { key: 'reportGeneration', label: 'Report Generation', icon: Activity },
        { key: 'auditAccess', label: 'Audit Access', icon: Eye },
        { key: 'userAccountManagement', label: 'User Account Management', icon: Users },
        { key: 'accessPermissions', label: 'Access Permissions', icon: Shield },
        { key: 'systemStatus', label: 'System Status', icon: Activity }
      ]
    },
    {
      title: "Emergency & Escalation",
      permissions: [
        { key: 'urgentMatters', label: 'Urgent Matters', icon: AlertCircle },
        { key: 'escalationManagement', label: 'Escalation Management', icon: Users },
        { key: 'emergencyContact', label: 'Emergency Contact', icon: Phone },
        { key: 'afterHoursSupport', label: 'After Hours Support', icon: Clock },
        { key: 'crisisEscalation', label: 'Crisis Escalation', icon: AlertCircle }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Chat Management</h1>
        <p className="text-muted-foreground">
          Configure AI-powered live chat with plugin integrations and human handoff
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="plugin">Plugin Setup</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="handoff">Human Handoff</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Chat Configuration
              </CardTitle>
              <CardDescription>
                Basic settings for your AI-powered live chat system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={currentConfig.enabled}
                    onCheckedChange={(enabled) => 
                      handleUpdateConfig({ enabled })
                    }
                  />
                  <Label>Enable Live Chat System</Label>
                </div>

                {currentConfig.enabled && (
                  <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Dashboard Chat Widget</Label>
                        <p className="text-xs text-gray-600">Show chat widget on user dashboard</p>
                      </div>
                      <Switch 
                        checked={currentConfig.dashboardEnabled}
                        onCheckedChange={(dashboardEnabled) => 
                          handleUpdateConfig({ dashboardEnabled })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Landing Page Chat Widget</Label>
                        <p className="text-xs text-gray-600">Show chat widget on landing and marketing pages</p>
                      </div>
                      <Switch 
                        checked={currentConfig.landingEnabled}
                        onCheckedChange={(landingEnabled) => 
                          handleUpdateConfig({ landingEnabled })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {currentConfig.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Welcome Message</Label>
                        <Textarea
                          value={currentConfig.autoResponses.welcomeMessage}
                          rows={2}
                          onChange={(e) =>
                            handleUpdateConfig({
                              autoResponses: {
                                ...currentConfig.autoResponses,
                                welcomeMessage: e.target.value
                              }
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Offline Message</Label>
                        <Textarea
                          value={currentConfig.autoResponses.offlineMessage}
                          rows={2}
                          onChange={(e) =>
                            handleUpdateConfig({
                              autoResponses: {
                                ...currentConfig.autoResponses,
                                offlineMessage: e.target.value
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
                          value={currentConfig.autoResponses.escalationMessage}
                          rows={2}
                          onChange={(e) =>
                            handleUpdateConfig({
                              autoResponses: {
                                ...currentConfig.autoResponses,
                                escalationMessage: e.target.value
                              }
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Queue Message</Label>
                        <Textarea
                          value={currentConfig.autoResponses.queueMessage}
                          rows={2}
                          placeholder="Use {{position}} and {{waitTime}} variables"
                          onChange={(e) =>
                            handleUpdateConfig({
                              autoResponses: {
                                ...currentConfig.autoResponses,
                                queueMessage: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Response Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Confidence Threshold</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          value={currentConfig.aiSettings.confidenceThreshold}
                          onChange={(e) =>
                            handleUpdateConfig({
                              aiSettings: {
                                ...currentConfig.aiSettings,
                                confidenceThreshold: parseFloat(e.target.value)
                              }
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">0.0 - 1.0 (higher = more strict)</p>
                      </div>

                      <div>
                        <Label>Max Response Time (seconds)</Label>
                        <Input 
                          type="number" 
                          value={currentConfig.aiSettings.maxResponseTime}
                          onChange={(e) =>
                            handleUpdateConfig({
                              aiSettings: {
                                ...currentConfig.aiSettings,
                                maxResponseTime: parseInt(e.target.value)
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={currentConfig.aiSettings.fallbackToHuman}
                          onCheckedChange={(fallbackToHuman) => 
                            handleUpdateConfig({ 
                              aiSettings: { 
                                ...currentConfig.aiSettings, 
                                fallbackToHuman 
                              } 
                            })
                          }
                        />
                        <Label>Fallback to Human</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={currentConfig.aiSettings.learningMode}
                          onCheckedChange={(learningMode) => 
                            handleUpdateConfig({ 
                              aiSettings: { 
                                ...currentConfig.aiSettings, 
                                learningMode 
                              } 
                            })
                          }
                        />
                        <Label>Learning Mode</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Chat Plugin Integration
              </CardTitle>
              <CardDescription>
                Connect with popular messaging platforms and chat widgets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Chat Provider</Label>
                <Select 
                  value={currentConfig.plugin.type || 'crisp'}
                  onValueChange={(type) => {
                    const selectedProvider = chatProviders.find(p => p.value === type);
                    console.log('Changing chat provider to:', type, selectedProvider);
                    
                    const newPluginConfig = {
                      type: type as any,
                      name: selectedProvider?.label || '',
                      // Clear all fields when changing provider
                      apiKey: '',
                      websiteId: '',
                      appId: '',
                      widgetKey: '',
                      subdomain: '',
                      domain: '',
                      propertyId: '',
                      widgetId: '',
                      licenseId: '',
                      botId: '',
                      publicKey: '',
                      siteId: '',
                      chatId: '',
                      customEndpoint: ''
                    };
                    
                    handleUpdateConfig({
                      plugin: newPluginConfig
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chat provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-sm text-muted-foreground">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dynamic parameter fields based on selected provider */}
                {(() => {
                  const selectedProvider = chatProviders.find(p => p.value === currentConfig.plugin.type);
                  if (!selectedProvider) return null;
                  
                  return selectedProvider.params.map((param) => {
                    const paramLabels = {
                      apiKey: 'API Key',
                      websiteId: 'Website ID',
                      appId: 'App ID',
                      widgetKey: 'Widget Key',
                      subdomain: 'Subdomain',
                      domain: 'Domain',
                      propertyId: 'Property ID',
                      widgetId: 'Widget ID',
                      licenseId: 'License ID',
                      botId: 'Bot ID',
                      publicKey: 'Public Key',
                      siteId: 'Site ID',
                      chatId: 'Chat ID',
                      customEndpoint: 'Custom Endpoint'
                    };
                    
                    return (
                      <div key={param}>
                        <Label>{paramLabels[param as keyof typeof paramLabels] || param}</Label>
                        <Input 
                          type={param === 'apiKey' ? 'password' : 'text'}
                          value={currentConfig.plugin[param as keyof typeof currentConfig.plugin] || ''}
                          placeholder={`Enter your ${paramLabels[param as keyof typeof paramLabels] || param}`}
                          onChange={(e) =>
                            handleUpdateConfig({
                              plugin: {
                                ...currentConfig.plugin,
                                [param]: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    );
                  });
                })()}
              </div>

              {currentConfig.plugin.type === 'custom' && (
                <div>
                  <Label>Custom Endpoint</Label>
                  <Input 
                    value={currentConfig.plugin.customEndpoint || ''}
                    placeholder="https://your-chat-api.com/webhook"
                    onChange={(e) =>
                      handleUpdateConfig({
                        plugin: {
                          ...currentConfig.plugin,
                          customEndpoint: e.target.value
                        }
                      })
                    }
                  />
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Integration Status</h4>
                    <p className="text-sm text-blue-700">
                      {currentConfig.plugin.apiKey ? 
                        `Connected to ${chatProviders.find(p => p.value === currentConfig.plugin.type)?.label}` :
                        'Not connected - Please add your API credentials'
                      }
                    </p>
                    {currentConfig.plugin.apiKey && (
                      <div className="mt-2 text-xs text-blue-600">
                        <div>✓ Bidirectional sync enabled</div>
                        <div>✓ All chats appear in both systems</div>
                        <div>✓ Messages synced in real-time</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleUpdateConfig({ plugin: currentConfig.plugin })}>
                  Save Plugin Settings
                </Button>
                <Button variant="outline">
                  Test Connection
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => setShowSetupGuide(true)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  View Setup Instructions for Chat Providers
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Step-by-step guide to integrate each chat provider with your application
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Chat Permissions
              </CardTitle>
              <CardDescription>
                Control what the AI can access and respond to in chat conversations for different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dashboard">Dashboard Chat</TabsTrigger>
                  <TabsTrigger value="landing">Landing Page Chat</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <ScrollArea className="h-96">
                    <div className="space-y-6">
                      {permissionCategories.map((category) => (
                        <div key={category.title}>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">
                            {category.title}
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {category.permissions.map(({ key, label, icon: Icon }) => (
                              <div key={key} className="flex items-center space-x-3">
                                <Checkbox
                                  checked={currentConfig.dashboardPermissions[key as keyof typeof currentConfig.dashboardPermissions]}
                                  onCheckedChange={(checked) => {
                                    handleUpdateConfig({
                                      dashboardPermissions: {
                                        ...currentConfig.dashboardPermissions,
                                        [key]: checked
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
                </TabsContent>

                <TabsContent value="landing">
                  <ScrollArea className="h-96">
                    <div className="space-y-6">
                      {permissionCategories.map((category) => (
                        <div key={category.title}>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">
                            {category.title}
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {category.permissions.map(({ key, label, icon: Icon }) => (
                              <div key={key} className="flex items-center space-x-3">
                                <Checkbox
                                  checked={currentConfig.landingPermissions[key as keyof typeof currentConfig.landingPermissions]}
                                  onCheckedChange={(checked) => {
                                    handleUpdateConfig({
                                      landingPermissions: {
                                        ...currentConfig.landingPermissions,
                                        [key]: checked
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handoff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Human Handoff Configuration
              </CardTitle>
              <CardDescription>
                Set up automatic escalation to human agents when needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={currentConfig.humanHandoff.enabled}
                  onCheckedChange={(enabled) => 
                    handleUpdateConfig({ 
                      humanHandoff: { 
                        ...currentConfig.humanHandoff, 
                        enabled 
                      } 
                    })
                  }
                />
                <Label>Enable Human Handoff</Label>
              </div>

              {currentConfig.humanHandoff.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Escalation Threshold</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={currentConfig.humanHandoff.escalationThreshold}
                        onChange={(e) =>
                          handleUpdateConfig({
                            humanHandoff: {
                              ...currentConfig.humanHandoff,
                              escalationThreshold: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Number of failed AI responses before escalation</p>
                    </div>

                    <div>
                      <Label>Auto Escalation Time (minutes)</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={currentConfig.humanHandoff.autoEscalateTime}
                        onChange={(e) =>
                          handleUpdateConfig({
                            humanHandoff: {
                              ...currentConfig.humanHandoff,
                              autoEscalateTime: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Automatically escalate after this time</p>
                    </div>
                  </div>

                  <div>
                    <Label>Escalation Trigger Keywords</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Keywords that trigger immediate human handoff
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {currentConfig.humanHandoff.triggerKeywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTriggerKeyword(keyword)}>
                            {keyword} ×
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newTriggerKeyword}
                          onChange={(e) => setNewTriggerKeyword(e.target.value)}
                          placeholder="Enter trigger keyword"
                          className="flex-1"
                        />
                        <Button onClick={addTriggerKeyword} disabled={!newTriggerKeyword.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Forward to Email Addresses</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Email addresses to notify when chat is escalated to human
                    </p>
                    
                    <div className="space-y-2">
                      {currentConfig.humanHandoff.forwardToEmails?.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={email} readOnly className="flex-1" />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeForwardEmail(email)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          value={newForwardEmail}
                          onChange={(e) => setNewForwardEmail(e.target.value)}
                          placeholder="support@company.com"
                          className="flex-1"
                        />
                        <Button onClick={addForwardEmail} disabled={!newForwardEmail.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time Monitoring
              </CardTitle>
              <CardDescription>
                Monitor and control AI chat responses in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.realTimeMonitoring.enabled}
                      onCheckedChange={(enabled) => 
                        handleUpdateConfig({ 
                          realTimeMonitoring: { 
                            ...currentConfig.realTimeMonitoring, 
                            enabled 
                          } 
                        })
                      }
                    />
                    <Label>Enable Real-Time Monitoring</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.realTimeMonitoring.allowIntercept}
                      onCheckedChange={(allowIntercept) => 
                        handleUpdateConfig({ 
                          realTimeMonitoring: { 
                            ...currentConfig.realTimeMonitoring, 
                            allowIntercept 
                          } 
                        })
                      }
                    />
                    <Label>Allow Human Intercept</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.realTimeMonitoring.showTypingIndicator}
                      onCheckedChange={(showTypingIndicator) => 
                        handleUpdateConfig({ 
                          realTimeMonitoring: { 
                            ...currentConfig.realTimeMonitoring, 
                            showTypingIndicator 
                          } 
                        })
                      }
                    />
                    <Label>Show AI Typing Indicator</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.realTimeMonitoring.supervisorNotifications}
                      onCheckedChange={(supervisorNotifications) => 
                        handleUpdateConfig({ 
                          realTimeMonitoring: { 
                            ...currentConfig.realTimeMonitoring, 
                            supervisorNotifications 
                          } 
                        })
                      }
                    />
                    <Label>Supervisor Notifications</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Live Chat Dashboard</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{analytics?.activeChats || 0}</div>
                          <div className="text-sm text-muted-foreground">Active Chats</div>
                        </div>
                        <MessageSquare className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{analytics?.aiResponding || 0}</div>
                          <div className="text-sm text-muted-foreground">AI Responding</div>
                        </div>
                        <Bot className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{analytics?.pendingEscalation || 0}</div>
                          <div className="text-sm text-muted-foreground">Pending Escalation</div>
                        </div>
                        <Users className="h-8 w-8 text-orange-600" />
                      </div>
                    </Card>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => setShowLiveChatMonitor(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Live Chat Monitor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Chat Analytics
              </CardTitle>
              <CardDescription>
                Monitor chat performance and AI effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">{analytics?.aiResolutionRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">AI Resolution Rate</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">{analytics?.avgResponseTime || 0}s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">{analytics?.customerSatisfaction || 0}/5</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">{analytics?.totalToday || 0}</div>
                  <div className="text-sm text-muted-foreground">Chats Today</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Chat Provider Setup Guide
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSetupGuide(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Follow these instructions to integrate chat providers with your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  {chatProviders.filter(p => p.value !== 'custom').map((provider) => {
                    const instructions = getSetupInstructions(provider.value);
                    return (
                      <Card key={provider.value} className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{instructions.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>
                        <div className="space-y-2">
                          {instructions.steps.map((step, index) => (
                            <div key={index} className="text-sm">{step}</div>
                          ))}
                        </div>
                        {instructions.docs && (
                          <div className="mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <a href={instructions.docs} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-3 w-3 mr-1" />
                                View Documentation
                              </a>
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Chat Monitor Modal */}
      {showLiveChatMonitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat Monitor
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLiveChatMonitor(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Monitor and manage active chat conversations in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
                {/* Active Chats List */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Active Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-64">
                      <div className="space-y-2 p-3">
                        {conversations?.map((conversation: any) => (
                          <div 
                            key={conversation.id} 
                            className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => {
                              if (selectedConversation !== conversation.id) {
                                setSelectedConversation(conversation.id);
                                setInterceptMessage("");
                                setIsIntercepting(false);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                conversation.status === 'active' ? 'bg-green-500' : 
                                conversation.status === 'pending' ? 'bg-orange-500' : 'bg-gray-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-sm">{conversation.user.name}</div>
                                  <Badge 
                                    variant={conversation.source === 'dashboard' ? 'default' : 'outline'} 
                                    className="text-xs"
                                  >
                                    {conversation.source === 'dashboard' ? (
                                      <div className="flex items-center gap-1">
                                        <Settings className="h-3 w-3" />
                                        Dashboard
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        Landing
                                      </div>
                                    )}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </div>
                                {conversation.hasUploads && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Download className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-500">Has attachments</span>
                                  </div>
                                )}
                                {conversation.hasScreenShare && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Smartphone className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-500">Screen sharing</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant={conversation.assignedTo === 'ai' ? 'default' : 'secondary'} className="text-xs">
                                  {conversation.assignedTo === 'ai' ? 'AI' : conversation.assignedTo ? 'Human' : 'Queue'}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {conversation.messageCount} msgs
                                </div>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="p-4 text-center text-muted-foreground">
                            No active conversations
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Chat Conversation */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {selectedConversation ? 
                          `Conversation with ${conversations?.find((c: any) => c.id === selectedConversation)?.user.name || 'User'}` :
                          'Select a conversation'
                        }
                      </CardTitle>
                      {selectedConversation && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (interceptMessage.trim()) {
                                interceptMutation.mutate({ 
                                  conversationId: selectedConversation, 
                                  message: interceptMessage 
                                });
                              }
                            }}
                            disabled={!interceptMessage.trim() || isIntercepting}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {isIntercepting ? 'Sending...' : 'Send Message'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => escalateMutation.mutate(selectedConversation)}
                            disabled={escalateMutation.isPending}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Escalate
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 mb-4">
                      <div className="space-y-4">
                        {selectedConversation && messages?.map((message: any) => (
                          <div key={message.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`text-xs ${
                                message.sender === 'ai' ? 'bg-blue-100' : 
                                message.sender === 'human' ? 'bg-green-100' : ''
                              }`}>
                                {message.sender === 'ai' ? 'AI' : 
                                 message.sender === 'human' ? 'H' : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className={`rounded-lg p-2 text-sm ${
                                message.sender === 'ai' ? 'bg-blue-50' : 
                                message.sender === 'human' ? 'bg-green-50' : 'bg-gray-100'
                              }`}>
                                {message.content}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map((attachment: any, index: number) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                                        {attachment.type === 'image' ? (
                                          <>
                                            <img 
                                              src={attachment.url} 
                                              alt={attachment.name}
                                              className="h-16 w-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                              <div className="font-medium text-xs">{attachment.name}</div>
                                              <div className="text-xs text-muted-foreground">{attachment.size}</div>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <Download className="h-4 w-4" />
                                            <div className="flex-1">
                                              <div className="font-medium text-xs">{attachment.name}</div>
                                              <div className="text-xs text-muted-foreground">{attachment.size}</div>
                                            </div>
                                          </>
                                        )}
                                        <Button size="sm" variant="outline">
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {message.screenShare && (
                                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                    <div className="flex items-center gap-2">
                                      <Smartphone className="h-4 w-4 text-green-600" />
                                      <span className="text-sm text-green-700">Screen sharing session</span>
                                      {message.screenShare.active && (
                                        <Badge variant="outline" className="text-xs bg-green-100">
                                          Active
                                        </Badge>
                                      )}
                                    </div>
                                    {message.screenShare.active && (
                                      <div className="mt-2 flex gap-2">
                                        <Button size="sm" variant="outline">
                                          <Eye className="h-3 w-3 mr-1" />
                                          View Screen
                                        </Button>
                                        <Button size="sm" variant="outline">
                                          Request Control
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center text-muted-foreground py-8">
                            {selectedConversation ? 'Loading messages...' : 'Select a conversation to view messages'}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {selectedConversation && (
                      <div className="border-t pt-4">
                        <div className="space-y-3">
                          {/* File upload and screen share controls */}
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx"
                              className="hidden"
                              id={`image-upload-${selectedConversation}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && selectedConversation) {
                                  fileUploadMutation.mutate({ conversationId: selectedConversation, file });
                                }
                                e.target.value = '';
                              }}
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => document.getElementById(`image-upload-${selectedConversation}`)?.click()}
                              disabled={!currentConfig.realTimeMonitoring.allowIntercept || imageUploadStatus[selectedConversation || '']}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {imageUploadStatus[selectedConversation || ''] ? 'Uploading...' : 'Upload File'}
                            </Button>
                            
                            {!screenShareStatus[selectedConversation || '']?.active ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => selectedConversation && screenShareMutation.mutate({ 
                                  conversationId: selectedConversation, 
                                  action: 'start' 
                                })}
                                disabled={!currentConfig.realTimeMonitoring.allowIntercept || screenShareMutation.isPending}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {screenShareMutation.isPending ? 'Requesting...' : 'Request User Screen Share'}
                              </Button>
                            ) : (
                              <div className="flex gap-1">
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                                  <Eye className="h-3 w-3" />
                                  Viewing User Screen
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => selectedConversation && screenShareMutation.mutate({ 
                                    conversationId: selectedConversation, 
                                    action: 'stop' 
                                  })}
                                  disabled={screenShareMutation.isPending}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Stop Viewing
                                </Button>
                                {!screenShareStatus[selectedConversation || '']?.hasControl && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => selectedConversation && screenShareMutation.mutate({ 
                                      conversationId: selectedConversation, 
                                      action: 'request_control' 
                                    })}
                                    disabled={screenShareMutation.isPending}
                                  >
                                    <Settings className="h-3 w-3 mr-1" />
                                    {screenShareMutation.isPending ? 'Requesting...' : 'Request Control'}
                                  </Button>
                                )}
                                {screenShareStatus[selectedConversation || '']?.hasControl && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700">
                                    <CheckCircle className="h-3 w-3" />
                                    Controlling User Screen
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Message input */}
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Type to intercept this conversation..." 
                              className="flex-1"
                              value={interceptMessage}
                              onChange={(e) => setInterceptMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && interceptMessage.trim()) {
                                  interceptMutation.mutate({ 
                                    conversationId: selectedConversation, 
                                    message: interceptMessage 
                                  });
                                }
                              }}
                            />
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (interceptMessage.trim()) {
                                  interceptMutation.mutate({ 
                                    conversationId: selectedConversation, 
                                    message: interceptMessage 
                                  });
                                }
                              }}
                              disabled={!interceptMessage.trim() || isIntercepting}
                            >
                              {isIntercepting ? 'Sending...' : 'Send'}
                            </Button>
                          </div>

                          {/* Permission notice */}
                          {!currentConfig.realTimeMonitoring.allowIntercept && (
                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                              Note: Some features are disabled. Enable "Allow Human Intercept" in monitoring settings to access file upload and screen sharing.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
