
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from "@/lib/icons";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  tokenLimit: number;
  userLimit: number;
  isActive: boolean;
  isPopular?: boolean;
  
  // Token overage settings
  overageRate?: number;
  overageLimit?: number;
  allowOverage?: boolean;
  
  // Billing variables
  gracePeriod?: number;
  prorationPolicy?: 'immediate' | 'next_cycle' | 'none';
  cancellationPolicy?: 'immediate' | 'end_of_cycle' | 'with_notice';
  trialPeriod?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'paused' | 'cancelled' | 'trial';
  nextBilling: string;
  totalSpent: number;
  joinDate: string;
  subscription?: {
    plan: string;
    tokenLimit: number;
    tokensUsed: number;
    billingCycle: string;
  };
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  totalCustomers: number;
}

export default function AdminBilling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [gatewaySettings, setGatewaySettings] = useState({
    gateways: {
      stripe: { enabled: true, primary: true, status: "active" },
      helcim: { enabled: false, primary: false, status: "inactive" },
      braintree: { enabled: true, primary: false, status: "active" }
    },
    primaryGateway: "stripe",
    fallbackGateway: "braintree",
    autoRetry: true,
    gatewayFailover: true,
    proration: true
  });

  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-billing-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/billing/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/admin/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
  });

  const { data: paymentGatewaySettings } = useQuery({
    queryKey: ['admin-gateway-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/billing/gateway-settings');
      if (!response.ok) throw new Error('Failed to fetch gateway settings');
      return response.json();
    },
    onSuccess: (data) => {
      setGatewaySettings(data);
    },
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (planData: Partial<SubscriptionPlan>) => {
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!response.ok) throw new Error('Failed to create plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast({ title: "Plan Created", description: "Subscription plan created successfully." });
      setIsEditingPlan(false);
      setSelectedPlan(null);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<SubscriptionPlan> & { id: string }) => {
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!response.ok) throw new Error('Failed to update plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast({ title: "Plan Updated", description: "Subscription plan updated successfully." });
      setIsEditingPlan(false);
      setSelectedPlan(null);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast({ title: "Plan Deleted", description: "Subscription plan deleted successfully." });
    },
  });

  const updateGatewaySettingsMutation = useMutation({
    mutationFn: async (settings: typeof gatewaySettings) => {
      const response = await fetch('/api/admin/billing/gateway-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update gateway settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gateway-settings'] });
      toast({ title: "Settings Updated", description: "Payment gateway settings updated successfully." });
    },
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesPlan = planFilter === "all" || customer.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      paused: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      trial: { color: "bg-blue-100 text-blue-800", icon: Activity },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleGatewayToggle = (gateway: string, enabled: boolean) => {
    const updatedSettings = {
      ...gatewaySettings,
      gateways: {
        ...gatewaySettings.gateways,
        [gateway]: {
          ...gatewaySettings.gateways[gateway as keyof typeof gatewaySettings.gateways],
          enabled
        }
      }
    };
    setGatewaySettings(updatedSettings);
    updateGatewaySettingsMutation.mutate(updatedSettings);
  };

  const handleGatewayPriorityChange = (setting: string, value: string) => {
    const updatedSettings = {
      ...gatewaySettings,
      [setting]: value
    };
    setGatewaySettings(updatedSettings);
    updateGatewaySettingsMutation.mutate(updatedSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600 mt-1">Manage subscriptions, plans, and billing operations</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +15 new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.churnRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    -2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Revenue Per User</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.averageRevenuePerUser || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    +5.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +23 new this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New subscription", user: "Sarah Johnson", plan: "Professional", time: "2 hours ago" },
                  { action: "Payment received", user: "Mike Chen", amount: "$99", time: "4 hours ago" },
                  { action: "Subscription cancelled", user: "Alex Smith", plan: "Basic", time: "1 day ago" },
                  { action: "Plan upgraded", user: "Emma Davis", plan: "Enterprise", time: "2 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-600">
                        {activity.user} {activity.plan && `- ${activity.plan}`} {activity.amount && `- ${activity.amount}`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <Button onClick={() => {
              setSelectedPlan(null);
              setIsEditingPlan(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              plans.map((plan: SubscriptionPlan) => (
                <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.isPopular && (
                    <Badge className="absolute top-2 right-2 bg-blue-500">Popular</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsEditingPlan(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardTitle>
                    <div className="text-2xl font-bold">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-gray-600">/{plan.billingPeriod}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        {plan.tokenLimit.toLocaleString()} tokens/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Up to {plan.userLimit} users
                      </div>
                      {plan.allowOverage && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          Overage: ${plan.overageRate}/1k tokens (max {plan.overageLimit?.toLocaleString()})
                        </div>
                      )}
                      <Separator />
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 flex gap-2">
                        {getStatusBadge(plan.isActive ? 'active' : 'paused')}
                        {plan.trialPeriod && plan.trialPeriod > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {plan.trialPeriod}-day trial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Plan Editor Modal */}
          {isEditingPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>
                    {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    
                    // Extract all form data including billing variables
                    const planData = {
                      name: formData.get('name') as string,
                      price: Number(formData.get('price')),
                      billingPeriod: formData.get('billingPeriod') as 'monthly' | 'yearly',
                      tokenLimit: Number(formData.get('tokenLimit')),
                      userLimit: Number(formData.get('userLimit')),
                      features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
                      isActive: formData.get('isActive') === 'on',
                      isPopular: formData.get('isPopular') === 'on',
                      
                      // Token overage settings
                      overageRate: Number(formData.get('overageRate')) || 0.02,
                      overageLimit: Number(formData.get('overageLimit')) || 10000,
                      allowOverage: formData.get('allowOverage') === 'on',
                      
                      // Billing variables
                      gracePeriod: Number(formData.get('gracePeriod')) || 3,
                      prorationPolicy: formData.get('prorationPolicy') as string || 'immediate',
                      cancellationPolicy: formData.get('cancellationPolicy') as string || 'immediate',
                      trialPeriod: Number(formData.get('trialPeriod')) || 0,
                    };
                    
                    if (selectedPlan) {
                      updatePlanMutation.mutate({ ...planData, id: selectedPlan.id });
                    } else {
                      createPlanMutation.mutate(planData);
                    }
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={selectedPlan?.name || ''}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={selectedPlan?.price || 0}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingPeriod">Billing Period</Label>
                        <Select name="billingPeriod" defaultValue={selectedPlan?.billingPeriod || 'monthly'}>
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
                        <Label htmlFor="tokenLimit">Token Limit</Label>
                        <Input
                          id="tokenLimit"
                          name="tokenLimit"
                          type="number"
                          defaultValue={selectedPlan?.tokenLimit || 0}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="userLimit">User Limit</Label>
                      <Input
                        id="userLimit"
                        name="userLimit"
                        type="number"
                        defaultValue={selectedPlan?.userLimit || 1}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        name="features"
                        rows={5}
                        defaultValue={selectedPlan?.features.join('\n') || ''}
                        placeholder="Enter features, one per line"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <Label className="text-sm font-medium">Token Overage Settings</Label>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label htmlFor="overageRate">Overage Rate ($/1000 tokens)</Label>
                            <Input
                              id="overageRate"
                              name="overageRate"
                              type="number"
                              step="0.01"
                              defaultValue={selectedPlan?.overageRate || 0.02}
                              placeholder="0.02"
                            />
                          </div>
                          <div>
                            <Label htmlFor="overageLimit">Max Overage Tokens</Label>
                            <Input
                              id="overageLimit"
                              name="overageLimit"
                              type="number"
                              defaultValue={selectedPlan?.overageLimit || 10000}
                              placeholder="10000"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <Label className="text-sm">Allow Token Overage</Label>
                            <p className="text-xs text-gray-600">Charge for usage beyond token limit</p>
                          </div>
                          <Switch
                            id="allowOverage"
                            name="allowOverage"
                            defaultChecked={selectedPlan?.allowOverage ?? true}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <Label className="text-sm font-medium">Billing Variables</Label>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                            <Input
                              id="gracePeriod"
                              name="gracePeriod"
                              type="number"
                              defaultValue={selectedPlan?.gracePeriod || 3}
                              placeholder="3"
                            />
                          </div>
                          <div>
                            <Label htmlFor="prorationPolicy">Proration Policy</Label>
                            <Select name="prorationPolicy" defaultValue={selectedPlan?.prorationPolicy || 'immediate'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="next_cycle">Next Billing Cycle</SelectItem>
                                <SelectItem value="none">No Proration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                            <Select name="cancellationPolicy" defaultValue={selectedPlan?.cancellationPolicy || 'immediate'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="end_of_cycle">End of Cycle</SelectItem>
                                <SelectItem value="with_notice">30-day Notice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="trialPeriod">Trial Period (days)</Label>
                            <Input
                              id="trialPeriod"
                              name="trialPeriod"
                              type="number"
                              defaultValue={selectedPlan?.trialPeriod || 0}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          name="isActive"
                          defaultChecked={selectedPlan?.isActive ?? true}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPopular"
                          name="isPopular"
                          defaultChecked={selectedPlan?.isPopular ?? false}
                        />
                        <Label htmlFor="isPopular">Popular</Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingPlan(false);
                          setSelectedPlan(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedPlan ? 'Update Plan' : 'Create Plan'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.filter(plan => plan.name && plan.name.trim() !== '').map((plan: SubscriptionPlan) => (
                  <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    filteredCustomers.map((customer: Customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                            {customer.subscription && (
                              <div className="text-xs text-blue-600 mt-1">
                                {customer.subscription.tokensUsed?.toLocaleString()}/{customer.subscription.tokenLimit?.toLocaleString()} tokens
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.plan}</div>
                            {customer.subscription && (
                              <div className="text-xs text-gray-500">{customer.subscription.billingCycle}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>{customer.nextBilling}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>{customer.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" title="Edit Customer">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" title="Billing Details">
                              <CreditCard className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>{transaction.customerName}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Plan distribution chart would go here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-gray-600">Customer Satisfaction</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3.2%</div>
                  <div className="text-sm text-gray-600">Monthly Churn Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$156</div>
                  <div className="text-sm text-gray-600">Average Revenue Per User</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">18</div>
                  <div className="text-sm text-gray-600">Avg Days to Convert</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Payment Gateway Configuration</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <h4 className="font-medium col-span-full mb-2">Active Payment Gateways</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          Stripe
                        </Label>
                        <p className="text-xs text-gray-600">Primary payment processor</p>
                      </div>
                      <Switch 
                        checked={gatewaySettings.gateways.stripe.enabled}
                        onCheckedChange={(enabled) => handleGatewayToggle('stripe', enabled)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          Helcim
                        </Label>
                        <p className="text-xs text-gray-600">Canadian payment processing</p>
                      </div>
                      <Switch 
                        checked={gatewaySettings.gateways.helcim.enabled}
                        onCheckedChange={(enabled) => handleGatewayToggle('helcim', enabled)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          Braintree
                        </Label>
                        <p className="text-xs text-gray-600">PayPal-owned processor</p>
                      </div>
                      <Switch 
                        checked={gatewaySettings.gateways.braintree.enabled}
                        onCheckedChange={(enabled) => handleGatewayToggle('braintree', enabled)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-retry Failed Payments</Label>
                      <p className="text-sm text-gray-600">Automatically retry failed subscription payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Gateway Failover</Label>
                      <p className="text-sm text-gray-600">Automatically switch to backup gateway on failure</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Proration on Plan Changes</Label>
                      <p className="text-sm text-gray-600">Prorate charges when customers change plans</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Success Notifications</Label>
                      <p className="text-sm text-gray-600">Send emails when payments succeed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Failure Notifications</Label>
                      <p className="text-sm text-gray-600">Send emails when payments fail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Subscription Renewal Reminders</Label>
                      <p className="text-sm text-gray-600">Remind customers before renewals</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Payment Gateway Priority</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryGateway">Primary Gateway</Label>
                    <Select 
                      value={gatewaySettings.primaryGateway}
                      onValueChange={(value) => handleGatewayPriorityChange('primaryGateway', value)}
                    >
                      <SelectTrigger id="primaryGateway">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="braintree">Braintree</SelectItem>
                        <SelectItem value="helcim">Helcim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fallbackGateway">Fallback Gateway</Label>
                    <Select 
                      value={gatewaySettings.fallbackGateway}
                      onValueChange={(value) => handleGatewayPriorityChange('fallbackGateway', value)}
                    >
                      <SelectTrigger id="fallbackGateway">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="braintree">Braintree</SelectItem>
                        <SelectItem value="helcim">Helcim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Trial Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trialDays">Trial Period (Days)</Label>
                    <Input id="trialDays" type="number" defaultValue="14" />
                  </div>
                  <div>
                    <Label htmlFor="trialTokens">Trial Token Limit</Label>
                    <Input id="trialTokens" type="number" defaultValue="1000" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
