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
  Brain, 
  Settings, 
  TestTube, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity,
  Zap
} from "lucide-react";

interface AIProvider {
  id: number;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'mistral' | 'perplexity' | 'deepseek';
  isActive: boolean;
  isPrimary: boolean;
  models: string[];
  configuration: {
    apiKey?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
  };
}

// Updated model lists with latest models as of August 2025
const providerModels = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini', 
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini'
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022', 
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ],
  google: [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-pro-vision',
    'text-bison-001',
    'chat-bison-001'
  ],
  cohere: [
    'command-r-plus',
    'command-r',
    'command',
    'command-nightly',
    'command-light',
    'command-light-nightly'
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'mistral-tiny',
    'mixtral-8x7b-instruct',
    'mistral-7b-instruct'
  ],
  perplexity: [
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-huge-128k-online',
    'llama-3.1-70b-instruct',
    'llama-3.1-8b-instruct',
    'mixtral-8x7b-instruct'
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-math',
    'deepseek-v2.5',
    'deepseek-v2',
    'deepseek-v1.5'
  ]
};

export default function AIProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const queryClient = useQueryClient();

  // Fetch AI providers
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/admin/ai-providers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ai-providers');
      if (!response.ok) throw new Error('Failed to fetch AI providers');
      return response.json();
    }
  });

  // Update provider mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AIProvider> }) => {
      const response = await fetch(`/api/admin/ai-providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-providers'] });
      toast({ title: "Success", description: "AI provider updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update AI provider",
        variant: "destructive" 
      });
    }
  });

  // Test provider mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/ai-providers/${id}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to test provider');
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

  // Usage statistics query
  const { data: usageStats } = useQuery({
    queryKey: ['/api/admin/ai-providers', selectedProvider, 'usage'],
    queryFn: async () => {
      const provider = providers?.find((p: AIProvider) => p.provider === selectedProvider);
      if (!provider) return null;
      
      const response = await fetch(`/api/admin/ai-providers/${provider.id}/usage`);
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      return response.json();
    },
    enabled: !!providers && !!selectedProvider
  });

  const getProviderIcon = (provider: string) => {
    return <Brain className="h-5 w-5" />;
  };

  const getProviderDisplayName = (provider: string) => {
    const names = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      cohere: 'Cohere',
      mistral: 'Mistral AI',
      perplexity: 'Perplexity',
      deepseek: 'DeepSeek'
    };
    return names[provider as keyof typeof names] || provider;
  };

  const selectedProviderData = providers?.find((p: AIProvider) => p.provider === selectedProvider);

  const handleUpdateProvider = (id: number, updates: Partial<AIProvider>) => {
    updateMutation.mutate({ id, data: updates });
  };

  const handleTestConnection = (id: number) => {
    testMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading AI providers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Providers</h1>
          <p className="text-gray-600 mt-2">Configure and manage AI model providers and their latest models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Providers
              </CardTitle>
              <CardDescription>Select a provider to configure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(providerModels).map((providerKey) => {
                const provider = providers?.find((p: AIProvider) => p.provider === providerKey);
                return (
                  <div
                    key={providerKey}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProvider === providerKey
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProvider(providerKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          {getProviderIcon(providerKey)}
                        </div>
                        <div>
                          <p className="font-medium">{getProviderDisplayName(providerKey)}</p>
                          <p className="text-sm text-gray-600">
                            {providerModels[providerKey as keyof typeof providerModels].length} models
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider?.isPrimary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                        {provider?.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          {usageStats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{usageStats.totalRequests.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{usageStats.totalTokens.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {((usageStats.successfulRequests / usageStats.totalRequests) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{usageStats.averageResponseTime}ms</p>
                    <p className="text-sm text-gray-600">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Provider Configuration */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Testing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getProviderDisplayName(selectedProvider)} Configuration</CardTitle>
                  <CardDescription>
                    Configure your {getProviderDisplayName(selectedProvider)} provider settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedProviderData && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Provider Status</Label>
                          <p className="text-sm text-gray-600">Enable or disable this provider</p>
                        </div>
                        <Switch
                          checked={selectedProviderData.isActive}
                          onCheckedChange={(checked) => 
                            handleUpdateProvider(selectedProviderData.id, { isActive: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Primary Provider</Label>
                          <p className="text-sm text-gray-600">Set as the default AI provider</p>
                        </div>
                        <Switch
                          checked={selectedProviderData.isPrimary}
                          onCheckedChange={(checked) => 
                            handleUpdateProvider(selectedProviderData.id, { isPrimary: checked })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={selectedProviderData.configuration?.apiKey || ''}
                          onChange={(e) => 
                            handleUpdateProvider(selectedProviderData.id, {
                              configuration: {
                                ...selectedProviderData.configuration,
                                apiKey: e.target.value
                              }
                            })
                          }
                          placeholder="Enter your API key"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxTokens">Max Tokens</Label>
                          <Input
                            id="maxTokens"
                            type="number"
                            value={selectedProviderData.configuration?.maxTokens || 4096}
                            onChange={(e) => 
                              handleUpdateProvider(selectedProviderData.id, {
                                configuration: {
                                  ...selectedProviderData.configuration,
                                  maxTokens: parseInt(e.target.value)
                                }
                              })
                            }
                            placeholder="4096"
                          />
                        </div>
                        <div>
                          <Label htmlFor="temperature">Temperature</Label>
                          <Input
                            id="temperature"
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={selectedProviderData.configuration?.temperature || 0.7}
                            onChange={(e) => 
                              handleUpdateProvider(selectedProviderData.id, {
                                configuration: {
                                  ...selectedProviderData.configuration,
                                  temperature: parseFloat(e.target.value)
                                }
                              })
                            }
                            placeholder="0.7"
                          />
                        </div>
                      </div>

                      {(selectedProvider === 'anthropic' || selectedProvider === 'deepseek') && (
                        <div>
                          <Label htmlFor="baseUrl">Base URL</Label>
                          <Input
                            id="baseUrl"
                            value={selectedProviderData.configuration?.baseUrl || ''}
                            onChange={(e) => 
                              handleUpdateProvider(selectedProviderData.id, {
                                configuration: {
                                  ...selectedProviderData.configuration,
                                  baseUrl: e.target.value
                                }
                              })
                            }
                            placeholder={selectedProvider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.deepseek.com'}
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Models</CardTitle>
                  <CardDescription>
                    Latest models available for {getProviderDisplayName(selectedProvider)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {providerModels[selectedProvider as keyof typeof providerModels].map((model) => (
                      <div key={model} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-mono text-sm">{model}</span>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Testing</CardTitle>
                  <CardDescription>Test your AI provider connection and functionality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedProviderData && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Connection Test</h4>
                        <p className="text-sm text-gray-600">
                          Verify that your provider credentials are working correctly
                        </p>
                      </div>
                      <Button
                        onClick={() => handleTestConnection(selectedProviderData.id)}
                        disabled={testMutation.isPending}
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        {testMutation.isPending ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Model Updates</h5>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>DeepSeek:</strong> Updated with latest v2.5, v2, and specialized models</p>
                      <p><strong>Anthropic:</strong> Added Claude 3.5 Sonnet and Haiku (October 2024)</p>
                      <p><strong>OpenAI:</strong> Includes latest GPT-4o, o1-preview, and o1-mini models</p>
                      <p><strong>Others:</strong> All providers updated with their latest model releases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}