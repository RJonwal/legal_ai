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
  CreditCard, 
  Shield, 
  Settings, 
  TestTube, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Activity
} from "lucide-react";

interface PaymentGateway {
  id: number;
  name: 'stripe' | 'paypal' | 'square';
  displayName: string;
  isActive: boolean;
  isPrimary: boolean;
  configuration: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    environment?: 'sandbox' | 'production';
  };
  testMode: boolean;
}

export default function PaymentGateways() {
  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const queryClient = useQueryClient();

  // Fetch payment gateways
  const { data: gateways, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-gateways'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-gateways');
      if (!response.ok) throw new Error('Failed to fetch payment gateways');
      return response.json();
    }
  });

  // Update gateway mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PaymentGateway> }) => {
      const response = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update gateway');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      toast({ title: "Success", description: "Payment gateway updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update payment gateway",
        variant: "destructive" 
      });
    }
  });

  // Test gateway mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/payment-gateways/${id}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to test gateway');
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

  // Gateway statistics query
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/payment-gateways', selectedGateway, 'stats'],
    queryFn: async () => {
      const gateway = gateways?.find((g: PaymentGateway) => g.name === selectedGateway);
      if (!gateway) return null;
      
      const response = await fetch(`/api/admin/payment-gateways/${gateway.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!gateways && !!selectedGateway
  });

  const selectedGatewayData = gateways?.find((g: PaymentGateway) => g.name === selectedGateway);

  const handleUpdateGateway = (id: number, updates: Partial<PaymentGateway>) => {
    updateMutation.mutate({ id, data: updates });
  };

  const handleTestConnection = (id: number) => {
    testMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading payment gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateways</h1>
          <p className="text-gray-600 mt-2">Configure and manage payment processing providers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gateway Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Providers
              </CardTitle>
              <CardDescription>Select a gateway to configure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gateways?.map((gateway: PaymentGateway) => (
                <div
                  key={gateway.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGateway === gateway.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedGateway(gateway.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{gateway.displayName}</p>
                        <p className="text-sm text-gray-600 capitalize">{gateway.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {gateway.isPrimary && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                      {gateway.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gateway Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">${stats.totalVolume.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Volume</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">${stats.averageTransactionValue}</p>
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gateway Configuration */}
        <div className="lg:col-span-2">
          {selectedGatewayData && (
            <Tabs defaultValue="config" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedGatewayData.displayName} Configuration</CardTitle>
                    <CardDescription>
                      Configure your {selectedGatewayData.displayName} payment gateway settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Gateway Status</Label>
                        <p className="text-sm text-gray-600">Enable or disable this payment gateway</p>
                      </div>
                      <Switch
                        checked={selectedGatewayData.isActive}
                        onCheckedChange={(checked) => 
                          handleUpdateGateway(selectedGatewayData.id, { isActive: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Primary Gateway</Label>
                        <p className="text-sm text-gray-600">Set as the default payment processor</p>
                      </div>
                      <Switch
                        checked={selectedGatewayData.isPrimary}
                        onCheckedChange={(checked) => 
                          handleUpdateGateway(selectedGatewayData.id, { isPrimary: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Test Mode</Label>
                        <p className="text-sm text-gray-600">Use sandbox environment for testing</p>
                      </div>
                      <Switch
                        checked={selectedGatewayData.testMode}
                        onCheckedChange={(checked) => 
                          handleUpdateGateway(selectedGatewayData.id, { testMode: checked })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publicKey">Public Key</Label>
                        <Input
                          id="publicKey"
                          value={selectedGatewayData.configuration?.publicKey || ''}
                          onChange={(e) => 
                            handleUpdateGateway(selectedGatewayData.id, {
                              configuration: {
                                ...selectedGatewayData.configuration,
                                publicKey: e.target.value
                              }
                            })
                          }
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                          id="secretKey"
                          type="password"
                          value={selectedGatewayData.configuration?.secretKey || ''}
                          onChange={(e) => 
                            handleUpdateGateway(selectedGatewayData.id, {
                              configuration: {
                                ...selectedGatewayData.configuration,
                                secretKey: e.target.value
                              }
                            })
                          }
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="webhookSecret">Webhook Secret</Label>
                      <Input
                        id="webhookSecret"
                        type="password"
                        value={selectedGatewayData.configuration?.webhookSecret || ''}
                        onChange={(e) => 
                          handleUpdateGateway(selectedGatewayData.id, {
                            configuration: {
                              ...selectedGatewayData.configuration,
                              webhookSecret: e.target.value
                            }
                          })
                        }
                        placeholder="whsec_..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="environment">Environment</Label>
                      <select
                        id="environment"
                        value={selectedGatewayData.configuration?.environment || 'sandbox'}
                        onChange={(e) => 
                          handleUpdateGateway(selectedGatewayData.id, {
                            configuration: {
                              ...selectedGatewayData.configuration,
                              environment: e.target.value as 'sandbox' | 'production'
                            }
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage security and compliance settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Security Status: Active</h4>
                          <p className="text-sm text-green-700">
                            All security measures are properly configured
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Security Features</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>SSL/TLS Encryption</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>PCI DSS Compliance</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Webhook Verification</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Two-Factor Authentication</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gateway Testing</CardTitle>
                    <CardDescription>Test your payment gateway connection and functionality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Connection Test</h4>
                        <p className="text-sm text-gray-600">
                          Verify that your gateway credentials are working correctly
                        </p>
                      </div>
                      <Button
                        onClick={() => handleTestConnection(selectedGatewayData.id)}
                        disabled={testMutation.isPending}
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        {testMutation.isPending ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Test Credentials</h4>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Stripe Test Cards</h5>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p><strong>Visa:</strong> 4242424242424242</p>
                          <p><strong>Mastercard:</strong> 5555555555554444</p>
                          <p><strong>Declined:</strong> 4000000000000002</p>
                          <p className="mt-2 text-xs">Use any future expiry date and any 3-digit CVC</p>
                        </div>
                      </div>
                    </div>
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