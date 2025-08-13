import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, 
  TestTube, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity,
  Mail,
  MessageSquare,
  Cloud,
  BarChart3,
  CreditCard
} from "lucide-react";

interface AppApi {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'storage' | 'analytics' | 'payment';
  provider: string;
  isActive: boolean;
  configuration: {
    apiKey?: string;
    region?: string;
    endpoint?: string;
    settings?: Record<string, string>;
  };
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  uptime: string;
  dailyUsage: Array<{
    date: string;
    requests: number;
    success: number;
    errors: number;
  }>;
}

export default function AppApisPage() {
  const [selectedApi, setSelectedApi] = useState<string>('email');
  const queryClient = useQueryClient();

  // Fetch app APIs
  const { data: apis, isLoading } = useQuery({
    queryKey: ['/api/admin/app-apis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/app-apis');
      if (!response.ok) throw new Error('Failed to fetch app APIs');
      return response.json();
    }
  });

  // Update API mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AppApi> }) => {
      const response = await fetch(`/api/admin/app-apis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update API');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/app-apis'] });
      toast({ title: "Success", description: "API configuration updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update API configuration",
        variant: "destructive" 
      });
    }
  });

  // Test API mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/app-apis/${id}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to test API');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  // API usage statistics query
  const { data: usageStats } = useQuery({
    queryKey: ['/api/admin/app-apis', selectedApi, 'usage'],
    queryFn: async () => {
      const api = apis?.find((a: AppApi) => a.type === selectedApi);
      if (!api) return null;
      
      const response = await fetch(`/api/admin/app-apis/${api.id}/usage`);
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      return response.json();
    },
    enabled: !!apis && !!selectedApi
  });

  const getApiIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'storage':
        return <Cloud className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getProviderConfig = (type: string) => {
    switch (type) {
      case 'email':
        return {
          title: 'Email Service Configuration',
          description: 'Configure email delivery service settings',
          fields: [
            { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@company.com' },
            { key: 'fromName', label: 'From Name', placeholder: 'Company Name' },
            { key: 'replyTo', label: 'Reply To', placeholder: 'support@company.com' }
          ]
        };
      case 'sms':
        return {
          title: 'SMS Service Configuration',
          description: 'Configure SMS delivery service settings',
          fields: [
            { key: 'accountSid', label: 'Account SID', placeholder: 'ACxxxxx' },
            { key: 'phoneNumber', label: 'Phone Number', placeholder: '+1234567890' },
            { key: 'messagingServiceSid', label: 'Messaging Service SID', placeholder: 'MGxxxxx' }
          ]
        };
      case 'storage':
        return {
          title: 'Cloud Storage Configuration',
          description: 'Configure cloud storage service settings',
          fields: [
            { key: 'bucket', label: 'Bucket Name', placeholder: 'my-storage-bucket' },
            { key: 'accessKeyId', label: 'Access Key ID', placeholder: 'AKIAIOSFODNN7EXAMPLE' },
            { key: 'region', label: 'Region', placeholder: 'us-east-1' }
          ]
        };
      case 'analytics':
        return {
          title: 'Analytics Configuration',
          description: 'Configure analytics tracking settings',
          fields: [
            { key: 'trackingId', label: 'Tracking ID', placeholder: 'GA_TRACKING_ID' },
            { key: 'measurementId', label: 'Measurement ID', placeholder: 'GA_MEASUREMENT_ID' },
            { key: 'viewId', label: 'View ID', placeholder: 'GA_VIEW_ID' }
          ]
        };
      default:
        return {
          title: 'API Configuration',
          description: 'Configure API settings',
          fields: []
        };
    }
  };

  const selectedApiData = apis?.find((api: AppApi) => api.type === selectedApi);
  const providerConfig = getProviderConfig(selectedApi);

  const handleUpdateApi = (id: number, updates: Partial<AppApi>) => {
    updateMutation.mutate({ id, data: updates });
  };

  const handleTestConnection = (id: number) => {
    testMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading app APIs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App APIs</h1>
          <p className="text-gray-600 mt-2">Configure external service integrations and API connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Services List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Services
              </CardTitle>
              <CardDescription>Configure external service providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['email', 'sms', 'storage', 'analytics'].map((type) => {
                const api = apis?.find((a: AppApi) => a.type === type);
                return (
                  <div
                    key={type}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedApi === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedApi(type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          {getApiIcon(type)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{type} Service</p>
                          <p className="text-sm text-gray-600">{api?.provider || 'Not configured'}</p>
                        </div>
                      </div>
                      {api?.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Usage Overview */}
          {usageStats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{usageStats.totalRequests.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {((usageStats.successfulRequests / usageStats.totalRequests) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{usageStats.averageResponseTime}ms</p>
                    <p className="text-sm text-gray-600">Avg Response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{usageStats.uptime}</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* API Configuration */}
        <div className="lg:col-span-2">
          {selectedApiData && (
            <Tabs defaultValue="config" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testing
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Monitoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getApiIcon(selectedApi)}
                      {providerConfig.title}
                    </CardTitle>
                    <CardDescription>{providerConfig.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Service Status</Label>
                        <p className="text-sm text-gray-600">Enable or disable this service</p>
                      </div>
                      <Switch
                        checked={selectedApiData.isActive}
                        onCheckedChange={(checked) => 
                          handleUpdateApi(selectedApiData.id, { isActive: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={selectedApiData.configuration?.apiKey || ''}
                        onChange={(e) => 
                          handleUpdateApi(selectedApiData.id, {
                            configuration: {
                              ...selectedApiData.configuration,
                              apiKey: e.target.value
                            }
                          })
                        }
                        placeholder="Enter your API key"
                      />
                    </div>

                    {selectedApi === 'storage' && (
                      <div>
                        <Label htmlFor="region">Region</Label>
                        <select
                          id="region"
                          value={selectedApiData.configuration?.region || 'us-east-1'}
                          onChange={(e) => 
                            handleUpdateApi(selectedApiData.id, {
                              configuration: {
                                ...selectedApiData.configuration,
                                region: e.target.value
                              }
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="us-east-1">US East (N. Virginia)</option>
                          <option value="us-west-2">US West (Oregon)</option>
                          <option value="eu-west-1">Europe (Ireland)</option>
                          <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                        </select>
                      </div>
                    )}

                    {providerConfig.fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          value={selectedApiData.configuration?.settings?.[field.key] || ''}
                          onChange={(e) => 
                            handleUpdateApi(selectedApiData.id, {
                              configuration: {
                                ...selectedApiData.configuration,
                                settings: {
                                  ...selectedApiData.configuration?.settings,
                                  [field.key]: e.target.value
                                }
                              }
                            })
                          }
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Testing</CardTitle>
                    <CardDescription>Test your API connection and functionality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Connection Test</h4>
                        <p className="text-sm text-gray-600">
                          Verify that your API credentials are working correctly
                        </p>
                      </div>
                      <Button
                        onClick={() => handleTestConnection(selectedApiData.id)}
                        disabled={testMutation.isPending}
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        {testMutation.isPending ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>

                    {selectedApi === 'email' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Test Email Delivery</h5>
                        <p className="text-sm text-blue-700 mb-3">
                          Send a test email to verify your configuration
                        </p>
                        <div className="flex gap-2">
                          <Input placeholder="test@example.com" className="flex-1" />
                          <Button size="sm">Send Test</Button>
                        </div>
                      </div>
                    )}

                    {selectedApi === 'sms' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Test SMS Delivery</h5>
                        <p className="text-sm text-green-700 mb-3">
                          Send a test SMS to verify your configuration
                        </p>
                        <div className="flex gap-2">
                          <Input placeholder="+1234567890" className="flex-1" />
                          <Button size="sm">Send Test</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Monitoring</CardTitle>
                    <CardDescription>Monitor API performance and usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {usageStats ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{usageStats.totalRequests}</p>
                            <p className="text-sm text-blue-700">Total Requests</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{usageStats.successfulRequests}</p>
                            <p className="text-sm text-green-700">Successful</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{usageStats.errorRequests}</p>
                            <p className="text-sm text-red-700">Errors</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{usageStats.averageResponseTime}ms</p>
                            <p className="text-sm text-purple-700">Avg Response</p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Recent Activity</h4>
                          <div className="text-sm text-gray-600">
                            <p>Last 24 hours: {usageStats.dailyUsage[usageStats.dailyUsage.length - 1]?.requests || 0} requests</p>
                            <p>Success rate: {((usageStats.successfulRequests / usageStats.totalRequests) * 100).toFixed(1)}%</p>
                            <p>Uptime: {usageStats.uptime}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No monitoring data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}