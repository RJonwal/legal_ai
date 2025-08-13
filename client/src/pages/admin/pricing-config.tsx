import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { DollarSign, Zap, Settings, Check, X, Star } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  tokenAllowance: number;
  overageRate: number;  // per 1K tokens
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  stripePriceId?: string;
}

interface TokenBillingConfig {
  enabled: boolean;
  baseRatePerToken: number;
  bulkDiscounts: {
    threshold: number;
    discountPercent: number;
  }[];
  freeTrialTokens: number;
}

export default function PricingConfig() {
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const queryClient = useQueryClient();

  // Fetch pricing plans
  const { data: pricingPlans = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pricing-plans'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pricing-plans');
      if (!response.ok) throw new Error('Failed to fetch pricing plans');
      return response.json();
    }
  });

  // Fetch token billing configuration
  const { data: tokenConfig } = useQuery({
    queryKey: ['/api/admin/token-billing'],
    queryFn: async () => {
      const response = await fetch('/api/admin/token-billing');
      if (!response.ok) throw new Error('Failed to fetch token billing config');
      return response.json();
    }
  });

  // Update pricing plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PricingPlan> }) => {
      const response = await fetch(`/api/admin/pricing-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update pricing plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-plans'] });
      toast({ title: "Success", description: "Pricing plan updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update pricing plan",
        variant: "destructive" 
      });
    }
  });

  // Update token billing mutation
  const updateTokenBillingMutation = useMutation({
    mutationFn: async (config: Partial<TokenBillingConfig>) => {
      const response = await fetch('/api/admin/token-billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update token billing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-billing'] });
      toast({ title: "Success", description: "Token billing configuration updated" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update token billing configuration",
        variant: "destructive" 
      });
    }
  });

  const selectedPlanData = pricingPlans.find((plan: PricingPlan) => plan.id === selectedPlan);

  const handleUpdatePlan = (id: string, updates: Partial<PricingPlan>) => {
    updatePlanMutation.mutate({ id, data: updates });
  };

  const handleUpdateTokenBilling = (updates: Partial<TokenBillingConfig>) => {
    updateTokenBillingMutation.mutate(updates);
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading pricing configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Configuration</h1>
          <p className="text-gray-600 mt-2">Configure subscription plans and token billing</p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
          <TabsTrigger value="tokens">Token Billing</TabsTrigger>
          <TabsTrigger value="analytics">Billing Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Plans
                  </CardTitle>
                  <CardDescription>Select a plan to configure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pricingPlans.map((plan: PricingPlan) => (
                    <div
                      key={plan.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{plan.name}</p>
                            {plan.isPopular && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            ${plan.price}/{plan.billingPeriod === 'monthly' ? 'mo' : 'yr'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTokens(plan.tokenAllowance)} tokens
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {plan.isActive ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Plan Configuration */}
            <div className="lg:col-span-2">
              {selectedPlanData && (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPlanData.name} Configuration</CardTitle>
                    <CardDescription>
                      Configure {selectedPlanData.name} plan settings and features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="planName">Plan Name</Label>
                        <Input
                          id="planName"
                          value={selectedPlanData.name}
                          onChange={(e) => 
                            handleUpdatePlan(selectedPlanData.id, { name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={selectedPlanData.price}
                          onChange={(e) => 
                            handleUpdatePlan(selectedPlanData.id, { price: parseFloat(e.target.value) })
                          }
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingPeriod">Billing Period</Label>
                        <Select
                          value={selectedPlanData.billingPeriod}
                          onValueChange={(value: 'monthly' | 'yearly') => 
                            handleUpdatePlan(selectedPlanData.id, { billingPeriod: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tokenAllowance">Token Allowance</Label>
                        <Input
                          id="tokenAllowance"
                          type="number"
                          value={selectedPlanData.tokenAllowance}
                          onChange={(e) => 
                            handleUpdatePlan(selectedPlanData.id, { tokenAllowance: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="overageRate">Overage Rate (per 1K tokens)</Label>
                        <Input
                          id="overageRate"
                          type="number"
                          value={selectedPlanData.overageRate}
                          onChange={(e) => 
                            handleUpdatePlan(selectedPlanData.id, { overageRate: parseFloat(e.target.value) })
                          }
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                        <Input
                          id="stripePriceId"
                          value={selectedPlanData.stripePriceId || ''}
                          onChange={(e) => 
                            handleUpdatePlan(selectedPlanData.id, { stripePriceId: e.target.value })
                          }
                          placeholder="price_..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Plan Description</Label>
                      <Input
                        id="description"
                        value={selectedPlanData.description}
                        onChange={(e) => 
                          handleUpdatePlan(selectedPlanData.id, { description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Popular Plan</Label>
                        <p className="text-sm text-gray-600">Mark as the recommended plan</p>
                      </div>
                      <Switch
                        checked={selectedPlanData.isPopular}
                        onCheckedChange={(checked) => 
                          handleUpdatePlan(selectedPlanData.id, { isPopular: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Active Plan</Label>
                        <p className="text-sm text-gray-600">Enable or disable this plan</p>
                      </div>
                      <Switch
                        checked={selectedPlanData.isActive}
                        onCheckedChange={(checked) => 
                          handleUpdatePlan(selectedPlanData.id, { isActive: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Token Billing Configuration
              </CardTitle>
              <CardDescription>
                Configure token-based billing and overage rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tokenConfig && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Token Billing</Label>
                      <p className="text-sm text-gray-600">Use token-based pricing model</p>
                    </div>
                    <Switch
                      checked={tokenConfig.enabled}
                      onCheckedChange={(checked) => 
                        handleUpdateTokenBilling({ enabled: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="baseRate">Base Rate (per token)</Label>
                      <Input
                        id="baseRate"
                        type="number"
                        value={tokenConfig.baseRatePerToken}
                        onChange={(e) => 
                          handleUpdateTokenBilling({ baseRatePerToken: parseFloat(e.target.value) })
                        }
                        step="0.0001"
                        placeholder="0.0001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeTrialTokens">Free Trial Tokens</Label>
                      <Input
                        id="freeTrialTokens"
                        type="number"
                        value={tokenConfig.freeTrialTokens}
                        onChange={(e) => 
                          handleUpdateTokenBilling({ freeTrialTokens: parseInt(e.target.value) })
                        }
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Bulk Discounts</Label>
                    <p className="text-sm text-gray-600 mb-4">Configure volume-based discounts</p>
                    
                    <div className="space-y-3">
                      {tokenConfig.bulkDiscounts?.map((discount: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label className="text-sm">Threshold (tokens)</Label>
                            <Input
                              type="number"
                              value={discount.threshold}
                              onChange={(e) => {
                                const newDiscounts = [...tokenConfig.bulkDiscounts];
                                newDiscounts[index].threshold = parseInt(e.target.value);
                                handleUpdateTokenBilling({ bulkDiscounts: newDiscounts });
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">Discount (%)</Label>
                            <Input
                              type="number"
                              value={discount.discountPercent}
                              onChange={(e) => {
                                const newDiscounts = [...tokenConfig.bulkDiscounts];
                                newDiscounts[index].discountPercent = parseFloat(e.target.value);
                                handleUpdateTokenBilling({ bulkDiscounts: newDiscounts });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Token Billing Integration</h5>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Real-time Tracking:</strong> Token usage tracked per API call</p>
                      <p><strong>Billing Integration:</strong> Connected to Stripe for automatic billing</p>
                      <p><strong>Usage Monitoring:</strong> Real-time dashboards and alerts</p>
                      <p><strong>Overage Protection:</strong> Automatic limits and notifications</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,583</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3M</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Overage Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,421</div>
                <p className="text-xs text-muted-foreground">+25% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Current subscription distribution across plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Starter</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Professional</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enterprise</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">20%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}