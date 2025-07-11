import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Key, 
  Brain, 
  Webhook, 
  CreditCard, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Shield,
  Activity,
  RefreshCw
} from "lucide-react";

interface APIProvider {
  id: string;
  name: string;
  type: 'openai' | 'deepseek' | 'anthropic';
  apiKey: string;
  baseUrl?: string;
  model: string;
  isActive: boolean;
  lastTested: string;
  status: 'healthy' | 'error' | 'warning';
}

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
}

interface AppAPI {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  authentication: 'none' | 'bearer' | 'apikey' | 'basic';
  isActive: boolean;
  lastUsed: string;
  successRate: number;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  retryAttempts: number;
  lastTriggered: string;
  deliveryRate: number;
}

interface PaymentGateway {
  id: string;
  name: 'stripe' | 'helcim' | 'braintree';
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  lastTransaction: string;
  status: 'healthy' | 'error' | 'warning';
}

export default function APIManagement() {
  const [activeTab, setActiveTab] = useState("ai-providers");
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newWebhookDialogOpen, setNewWebhookDialogOpen] = useState(false);
  const [newAppAPIDialogOpen, setNewAppAPIDialogOpen] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({});
  const [availableModels, setAvailableModels] = useState<Record<string, ModelInfo[]>>({});

  const queryClient = useQueryClient();

  // Fetch API configurations
  const { data: aiProviders = [] } = useQuery({
    queryKey: ['admin-ai-providers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai-providers');
      if (!response.ok) throw new Error('Failed to fetch AI providers');
      return response.json();
    },
  });

  const { data: appAPIs = [] } = useQuery({
    queryKey: ['admin-app-apis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/app-apis');
      if (!response.ok) throw new Error('Failed to fetch app APIs');
      return response.json();
    },
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['admin-webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return response.json();
    },
  });

  const { data: paymentGateways = [] } = useQuery({
    queryKey: ['admin-payment-gateways'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-gateways');
      if (!response.ok) throw new Error('Failed to fetch payment gateways');
      return response.json();
    },
  });

  // Test AI Provider connection
  const testProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-providers'] });
      setTestingProvider(null);
    },
    onError: () => {
      setTestingProvider(null);
    },
  });

  const testAppAPIMutation = useMutation({
    mutationFn: async (apiId: string) => {
      const response = await fetch(`/api/admin/app-apis/${apiId}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-apis'] });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await fetch(`/api/admin/webhooks/${webhookId}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-webhooks'] });
    },
  });

  const testPaymentGatewayMutation = useMutation({
    mutationFn: async (gatewayId: string) => {
      const response = await fetch(`/api/admin/payment-gateways/${gatewayId}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-gateways'] });
    },
  });

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 8));
  };

  const fetchModelsForProvider = async (providerId: string, apiKey?: string, refresh = false) => {
    setFetchingModels(prev => ({ ...prev, [providerId]: true }));

    try {
      const queryParams = new URLSearchParams();
      if (apiKey) queryParams.append('apiKey', apiKey);
      if (refresh) queryParams.append('refresh', 'true');

      const response = await fetch(`/api/admin/ai-providers/${providerId}/models?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      setAvailableModels(prev => ({ ...prev, [providerId]: data.models }));
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setFetchingModels(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const availableWebhookEvents = [
    // User Events
    'user.created', 'user.updated', 'user.deleted', 'user.login', 'user.logout', 'user.password_reset',
    'user.email_verified', 'user.profile_completed', 'user.subscription_changed',

    // Case Events
    'case.created', 'case.updated', 'case.completed', 'case.deleted', 'case.assigned', 'case.status_changed',
    'case.deadline_approaching', 'case.overdue', 'case.archived', 'case.shared',

    // Document Events
    'document.generated', 'document.updated', 'document.deleted', 'document.shared', 'document.signed',
    'document.reviewed', 'document.approved', 'document.rejected', 'document.exported',

    // Payment Events
    'payment.completed', 'payment.failed', 'payment.refunded', 'payment.dispute_created',
    'payment.method_added', 'payment.method_updated', 'payment.method_deleted',

    // Subscription Events
    'subscription.created', 'subscription.cancelled', 'subscription.renewed', 'subscription.expired',
    'subscription.upgraded', 'subscription.downgraded', 'subscription.paused', 'subscription.resumed',

    // Billing Events
    'invoice.created', 'invoice.paid', 'invoice.failed', 'invoice.refunded',
    'token.purchased', 'token.overage', 'token.low_balance',

    // System Events
    'system.maintenance', 'system.update', 'system.error', 'system.backup_completed',
    'api.rate_limit_exceeded', 'api.error', 'security.login_attempt', 'security.breach_detected'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600 mt-2">Configure external integrations and API connections</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                View API Logs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>API Logs & Monitoring</DialogTitle>
                <DialogDescription>Real-time API activity and performance monitoring</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="deepseek">Deepseek</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Logs
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-sm text-gray-600">Total Requests</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">1,198</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">49</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">1.2s</div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Tokens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { time: '2024-01-15 10:30:45', provider: 'OpenAI', method: 'POST /chat/completions', status: '200', responseTime: '1.2s', tokens: '150' },
                      { time: '2024-01-15 10:30:32', provider: 'Anthropic', method: 'POST /messages', status: '200', responseTime: '0.8s', tokens: '200' },
                      { time: '2024-01-15 10:30:15', provider: 'OpenAI', method: 'POST /chat/completions', status: '429', responseTime: '0.1s', tokens: '0' },
                      { time: '2024-01-15 10:29:58', provider: 'Deepseek', method: 'POST /chat/completions', status: '200', responseTime: '2.1s', tokens: '300' },
                    ].map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{log.time}</TableCell>
                        <TableCell>{log.provider}</TableCell>
                        <TableCell className="font-mono text-sm">{log.method}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === '200' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.responseTime}</TableCell>
                        <TableCell>{log.tokens}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Global Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Global API Settings</DialogTitle>
                <DialogDescription>Configure system-wide API behavior and security settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rate Limiting</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Requests per minute (per user)</Label>
                        <Input type="number" defaultValue="60" />
                      </div>
                      <div>
                        <Label>Requests per hour (per user)</Label>
                        <Input type="number" defaultValue="1000" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Rate Limiting</Label>
                        <p className="text-sm text-gray-600">Limit API requests per user</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require API Key Authentication</Label>
                        <p className="text-sm text-gray-600">All API requests must include valid API key</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable CORS</Label>
                        <p className="text-sm text-gray-600">Allow cross-origin requests</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label>Allowed Origins</Label>
                      <Textarea placeholder="https://example.com&#10;https://app.example.com" rows={3} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logging & Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Log API Requests</Label>
                        <p className="text-sm text-gray-600">Store detailed request/response logs</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Log Request Bodies</Label>
                        <p className="text-sm text-gray-600">Include request payloads in logs</p>
                      </div>
                      <Switch />
                    </div>
                    <div>
                      <Label>Log Retention Period (days)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-providers" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="app-apis" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            App APIs
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="payment-gateways" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Gateways
          </TabsTrigger>
        </TabsList>

        {/* AI Providers Tab */}
        <TabsContent value="ai-providers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Provider Configuration</CardTitle>
                    <CardDescription>Manage OpenAI, Deepseek, and Anthropic API connections</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Provider
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* OpenAI Configuration */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-green-600" />
                          OpenAI
                        </CardTitle>
                        {getStatusBadge('healthy')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="openai-key">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="openai-key"
                            type={showApiKey['openai'] ? 'text' : 'password'}
                            defaultValue="sk-proj-xyz123..."
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('openai')}
                          >
                            {showApiKey['openai'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="openai-model">Model</Label>
                        <div className="flex gap-2">
                          <Select defaultValue="gpt-4o" onOpenChange={() => {
                            if (!availableModels['openai']) {
                              fetchModelsForProvider('openai');
                            }
                          }}>
                            <SelectTrigger id="openai-model" className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels['openai']?.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex flex-col">
                                    <span>{model.name}</span>
                                    {model.description && (
                                      <span className="text-xs text-gray-500">{model.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              )) || [
                                <SelectItem key="gpt-4o" value="gpt-4o">GPT-4o</SelectItem>,
                                <SelectItem key="gpt-4" value="gpt-4">GPT-4</SelectItem>,
                                <SelectItem key="gpt-3.5-turbo" value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              ]}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchModelsForProvider('openai', undefined, true)}
                            disabled={fetchingModels['openai']}
                            title="Refresh models list"
                          >
                            {fetchingModels['openai'] ? (
                              <Activity className="h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Active</Label>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setTestingProvider('openai');
                            testProviderMutation.mutate('openai');
                          }}
                          disabled={testingProvider === 'openai'}
                        >
                          <TestTube className="mr-2 h-4 w-4" />
                          {testingProvider === 'openai' ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Last tested: 2 hours ago
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deepseek Configuration */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          Deepseek
                        </CardTitle>
                        {getStatusBadge('warning')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="deepseek-key">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="deepseek-key"
                            type={showApiKey['deepseek'] ? 'text' : 'password'}
                            placeholder="Enter Deepseek API key"
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('deepseek')}
                          >
                            {showApiKey['deepseek'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="deepseek-model">Model</Label>
                        <Select defaultValue="deepseek-chat">
                          <SelectTrigger id="deepseek-model" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepseek-chat">Deepseek Chat</SelectItem>
                            <SelectItem value="deepseek-coder">Deepseek Coder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="deepseek-url">Base URL</Label>
                        <Input
                          id="deepseek-url"
                          defaultValue="https://api.deepseek.com"
                          className="bg-white"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Active</Label>
                        <Switch />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" variant="outline">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Never tested
                      </div>
                    </CardContent>
                  </Card>

                  {/* Anthropic Configuration */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          Anthropic
                        </CardTitle>
                        {getStatusBadge('healthy')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="anthropic-key">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="anthropic-key"
                            type={showApiKey['anthropic'] ? 'text' : 'password'}
                            defaultValue="sk-ant-api03-xyz..."
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('anthropic')}
                          >
                            {showApiKey['anthropic'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="anthropic-model">Model</Label>
                        <Select defaultValue="claude-3-sonnet">
                          <SelectTrigger id="anthropic-model" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Active</Label>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Last tested: 1 day ago
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rate Limiting Settings */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Rate Limiting & Fallback</CardTitle>
                    <CardDescription>Configure request limits and provider fallback order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="requests-per-minute">Requests per minute</Label>
                        <Input id="requests-per-minute" type="number" defaultValue="100" />
                      </div>
                      <div>
                        <Label htmlFor="requests-per-hour">Requests per hour</Label>
                        <Input id="requests-per-hour" type="number" defaultValue="2000" />
                      </div>
                      <div>
                        <Label htmlFor="fallback-order">Primary Provider</Label>
                        <Select defaultValue="openai">
                          <SelectTrigger id="fallback-order">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="deepseek">Deepseek</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <Label className="text-sm font-medium">Auto-failover</Label>
                        <p className="text-xs text-gray-600">Automatically switch to backup provider on failure</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* App APIs Tab */}
        <TabsContent value="app-apis">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>External App APIs</CardTitle>
                  <CardDescription>Configure outbound API calls to external applications</CardDescription>
                </div>
                <Dialog open={newAppAPIDialogOpen} onOpenChange={setNewAppAPIDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add API
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New App API</DialogTitle>
                      <DialogDescription>Configure a new external API connection</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="api-name">API Name</Label>
                        <Input id="api-name" placeholder="e.g., Document Service" />
                      </div>
                      <div>
                        <Label htmlFor="api-endpoint">Endpoint URL</Label>
                        <Input id="api-endpoint" placeholder="https://api.example.com/v1/endpoint" />
                      </div>
                      <div>
                        <Label htmlFor="api-method">HTTP Method</Label>
                        <Select defaultValue="POST">
                          <SelectTrigger id="api-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="api-auth">Authentication</Label>
                        <Select defaultValue="bearer">
                          <SelectTrigger id="api-auth">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="apikey">API Key</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="api-description">Description</Label>
                        <Textarea id="api-description" placeholder="Describe what this API does..." rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewAppAPIDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setNewAppAPIDialogOpen(false)}>Create API</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API Name</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Document Service</p>
                        <p className="text-sm text-gray-600">Convert documents to PDF</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">api.docconvert.com/v1/pdf</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">POST</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon('healthy')}
                        <span className="text-sm">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                        <span className="text-sm">98%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">2 hours ago</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testAppAPIMutation.mutate('doc-service')}
                          disabled={testAppAPIMutation.isPending}
                        >
                          {testAppAPIMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Email Service</p>
                        <p className="text-sm text-gray-600">Send notification emails</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">api.mailservice.com/send</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">POST</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon('warning')}
                        <span className="text-sm">Warning</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm">85%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">1 day ago</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testAppAPIMutation.mutate('doc-service')}
                          disabled={testAppAPIMutation.isPending}
                        >
                          {testAppAPIMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>Configure outbound webhooks for real-time event notifications</CardDescription>
                </div>
                <Dialog open={newWebhookDialogOpen} onOpenChange={setNewWebhookDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Webhook</DialogTitle>
                      <DialogDescription>Configure a new webhook endpoint</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-name">Webhook Name</Label>
                        <Input id="webhook-name" placeholder="e.g., Case Status Updates" />
                      </div>
                      <div>
                        <Label htmlFor="webhook-url">Endpoint URL</Label>
                        <Input id="webhook-url" placeholder="https://example.com/webhook" />
                      </div>
                      <div>
                        <Label htmlFor="webhook-secret">Secret Key</Label>
                        <Input id="webhook-secret" placeholder="Optional webhook secret" />
                      </div>
                      <div>
                        <Label>Events to Send</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                          {availableWebhookEvents.map((event) => (
                            <div key={event} className="flex items-center space-x-2">
                              <input type="checkbox" id={event} className="rounded" />
                              <Label htmlFor={event} className="text-xs">{event}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Data Sharing Controls</Label>
                        <div className="space-y-3 mt-2 border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Include User PII</Label>
                              <p className="text-xs text-gray-600">Share personally identifiable information</p>
                            </div>
                            <Switch id="include-pii" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Include Payment Data</Label>
                              <p className="text-xs text-gray-600">Share payment and billing information</p>
                            </div>
                            <Switch id="include-payment" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Include Document Content</Label>
                              <p className="text-xs text-gray-600">Share full document content</p>
                            </div>
                            <Switch id="include-content" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Include Case Details</Label>
                              <p className="text-xs text-gray-600">Share detailed case information</p>
                            </div>
                            <Switch id="include-case-details" defaultChecked />
                          </div>

                          <div>
                            <Label htmlFor="data-retention">Data Retention (days)</Label>
                            <Input id="data-retention" type="number" defaultValue="30" placeholder="30" />
                          </div>

                          <div>
                            <Label htmlFor="webhook-filter">Event Filter (JSON)</Label>
                            <Textarea 
                              id="webhook-filter" 
                              placeholder='{"user.role": "admin", "case.priority": "high"}'
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="retry-attempts">Retry Attempts</Label>
                        <Select defaultValue="3">
                          <SelectTrigger id="retry-attempts">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No retries</SelectItem>
                            <SelectItem value="3">3 attempts</SelectItem>
                            <SelectItem value="5">5 attempts</SelectItem>
                            <SelectItem value="10">10 attempts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewWebhookDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setNewWebhookDialogOpen(false)}>Create Webhook</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Webhook List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Case Management Sync</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon('healthy')}
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <CardDescription>https://crm.example.com/webhook</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Events</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">case.created</Badge>
                          <Badge variant="outline" className="text-xs">case.updated</Badge>
                          <Badge variant="outline" className="text-xs">case.completed</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Delivery Rate</span>
                          <p className="font-medium">99.2%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Triggered</span>
                          <p className="font-medium">30 min ago</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => testWebhookMutation.mutate('crm-sync')}
                          disabled={testWebhookMutation.isPending}
                        >
                          {testWebhookMutation.isPending ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="mr-2 h-4 w-4" />
                          )}
                          {testWebhookMutation.isPending ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Analytics Tracker</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon('healthy')}
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <CardDescription>https://analytics.app.com/events</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Events</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">user.created</Badge>
                          <Badge variant="outline" className="text-xs">document.generated</Badge>
                          <Badge variant="outline" className="text-xs">payment.completed</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Delivery Rate</span>
                          <p className="font-medium">97.8%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Triggered</span>
                          <p className="font-medium">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => testWebhookMutation.mutate('crm-sync')}
                          disabled={testWebhookMutation.isPending}
                        >
                          {testWebhookMutation.isPending ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="mr-2 h-4 w-4" />
                          )}
                          {testWebhookMutation.isPending ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Global Webhook Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Global Webhook Settings</CardTitle>
                    <CardDescription>Configure global webhook behavior and security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="webhook-timeout">Request Timeout (seconds)</Label>
                        <Input id="webhook-timeout" type="number" defaultValue="30" />
                      </div>
                      <div>
                        <Label htmlFor="webhook-retry-delay">Retry Delay (seconds)</Label>
                        <Input id="webhook-retry-delay" type="number" defaultValue="60" />
                      </div>
                      <div>
                        <Label htmlFor="webhook-batch-size">Batch Size</Label>
                        <Input id="webhook-batch-size" type="number" defaultValue="10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Signature Verification</Label>
                        <p className="text-xs text-gray-600">Require webhook signature verification</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">SSL Verification</Label>
                        <p className="text-xs text-gray-600">Verify SSL certificates for webhook endpoints</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateways Tab */}
        <TabsContent value="payment-gateways">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
                <CardDescription>Configure Stripe, Helcim, and Braintree payment processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stripe Configuration */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                          Stripe
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge('healthy')}
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="stripe-publishable">Publishable Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="stripe-publishable"
                            type={showApiKey['stripe-pub'] ? 'text' : 'password'}
                            defaultValue="pk_live_xyz123..."
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('stripe-pub')}
                          >
                            {showApiKey['stripe-pub'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="stripe-secret">Secret Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="stripe-secret"
                            type={showApiKey['stripe-secret'] ? 'text' : 'password'}
                            defaultValue="sk_live_xyz123..."
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('stripe-secret')}
                          >
                            {showApiKey['stripe-secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="stripe-webhook"
                            type={showApiKey['stripe-webhook'] ? 'text' : 'password'}
                            defaultValue="whsec_xyz123..."
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('stripe-webhook')}
                          >
                            {showApiKey['stripe-webhook'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="stripe-env">Environment</Label>
                        <Select defaultValue="production">
                          <SelectTrigger id="stripe-env" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => testPaymentGatewayMutation.mutate('stripe')}
                          disabled={testPaymentGatewayMutation.isPending}
                        >
                          {testPaymentGatewayMutation.isPending ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="mr-2 h-4 w-4" />
                          )}
                          {testPaymentGatewayMutation.isPending ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Last transaction: 15 min ago
                      </div>
                    </CardContent>
                  </Card>

                  {/* Helcim Configuration */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          Helcim
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge('warning')}
                          <Switch />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="helcim-api-key">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="helcim-api-key"
                            type={showApiKey['helcim'] ? 'text' : 'password'}
                            placeholder="Enter Helcim API key"
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('helcim')}
                          >
                            {showApiKey['helcim'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="helcim-token">API Token</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="helcim-token"
                            type={showApiKey['helcim-token'] ? 'text' : 'password'}
                            placeholder="Enter API token"
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('helcim-token')}
                          >
                            {showApiKey['helcim-token'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="helcim-env">Environment</Label>
                        <Select defaultValue="sandbox">
                          <SelectTrigger id="helcim-env" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Configure API credentials to enable Helcim payments
                        </AlertDescription>
                      </Alert>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" variant="outline">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Not configured
                      </div>
                    </CardContent>
                  </Card>

                  {/* Braintree Configuration */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          Braintree
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge('healthy')}
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="braintree-merchant">Merchant ID</Label>
                        <Input
                          id="braintree-merchant"
                          defaultValue="your_merchant_id"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="braintree-public">Public Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="braintree-public"
                            type={showApiKey['braintree-public'] ? 'text' : 'password'}
                            defaultValue="your_public_key"
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('braintree-public')}
                          >
                            {showApiKey['braintree-public'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="braintree-private">Private Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="braintree-private"
                            type={showApiKey['braintree-private'] ? 'text' : 'password'}
                            defaultValue="your_private_key"
                            className="bg-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleApiKeyVisibility('braintree-private')}
                          >
                            {showApiKey['braintree-private'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="braintree-env">Environment</Label>
                        <Select defaultValue="production">
                          <SelectTrigger id="braintree-env" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => testPaymentGatewayMutation.mutate('stripe')}
                          disabled={testPaymentGatewayMutation.isPending}
                        >
                          {testPaymentGatewayMutation.isPending ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="mr-2 h-4 w-4" />
                          )}
                          {testPaymentGatewayMutation.isPending ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-600">
                        Last transaction: 1 hour ago
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Gateway Settings */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Global Payment Settings</CardTitle>
                    <CardDescription>Configure payment processing behavior and failover</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="primary-gateway">Primary Gateway</Label>
                        <Select defaultValue="stripe">
                          <SelectTrigger id="primary-gateway">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="helcim">Helcim</SelectItem>
                            <SelectItem value="braintree">Braintree</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select defaultValue="USD">
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="retry-failed">Failed Payment Retries</Label>
                        <Input id="retry-failed" type="number" defaultValue="3" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Gateway Failover</Label>
                        <p className="text-xs text-gray-600">Automatically switch to backup gateway on failure</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Webhook Notifications</Label>
                        <p className="text-xs text-gray-600">Send webhooks for payment events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}