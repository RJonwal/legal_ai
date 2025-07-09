
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Pause, 
  Play, 
  X, 
  Download,
  Coins,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [selectedTokenPlan, setSelectedTokenPlan] = useState('');

  // Fetch billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['/api/billing'],
    queryFn: () => apiRequest('GET', '/api/billing').then(res => res.json()),
    enabled: isOpen,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/billing/invoices'],
    queryFn: () => apiRequest('GET', '/api/billing/invoices').then(res => res.json()),
    enabled: isOpen,
  });

  // Mutations
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await apiRequest('POST', '/api/billing/subscription', { action });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing'] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subscription.",
      });
    },
  });

  const updatePaymentMethodMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const response = await apiRequest('POST', '/api/billing/payment-method', cardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing'] });
      setIsUpdatingCard(false);
      setNewCardData({ number: '', expiry: '', cvv: '', name: '' });
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method.",
      });
    },
  });

  const purchaseTokensMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest('POST', '/api/billing/tokens', { plan });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing'] });
      toast({
        title: "Tokens Purchased",
        description: "Your tokens have been added to your account.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to purchase tokens.",
      });
    },
  });

  const handleSubscriptionAction = (action: string) => {
    updateSubscriptionMutation.mutate(action);
  };

  const handleUpdatePaymentMethod = () => {
    if (!newCardData.number || !newCardData.expiry || !newCardData.cvv || !newCardData.name) {
      toast({
        variant: "destructive",
        title: "Invalid Card Data",
        description: "Please fill in all card details.",
      });
      return;
    }
    updatePaymentMethodMutation.mutate(newCardData);
  };

  const handlePurchaseTokens = () => {
    if (!selectedTokenPlan) {
      toast({
        variant: "destructive",
        title: "No Plan Selected",
        description: "Please select a token plan.",
      });
      return;
    }
    purchaseTokensMutation.mutate(selectedTokenPlan);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
              <p>Loading billing information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Subscription Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-4 w-4" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{billingData?.subscription?.plan || 'Professional'}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(billingData?.subscription?.amount || 99)}/month
                    </div>
                    {getStatusBadge(billingData?.subscription?.status || 'active')}
                  </div>
                </CardContent>
              </Card>

              {/* Token Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Coins className="h-4 w-4" />
                    Token Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{billingData?.tokens?.balance || 2500}</div>
                    <div className="text-sm text-gray-600">
                      {billingData?.tokens?.used || 750} used this month
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-legal-blue h-2 rounded-full" 
                        style={{ width: `${((billingData?.tokens?.used || 750) / (billingData?.tokens?.balance || 2500)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    Next Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {billingData?.subscription?.nextBilling || 'Feb 15, 2024'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(billingData?.subscription?.amount || 99)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Auto-renewal
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        **** **** **** {billingData?.paymentMethod?.last4 || '4242'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {billingData?.paymentMethod?.brand || 'Visa'} • Expires {billingData?.paymentMethod?.expiry || '12/25'}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUpdatingCard(true)}
                    disabled={updatePaymentMethodMutation.isPending}
                  >
                    Update Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Current Subscription</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">{billingData?.subscription?.plan || 'Professional'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">{formatCurrency(billingData?.subscription?.amount || 99)}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(billingData?.subscription?.status || 'active')}
                      </div>
                      <div className="flex justify-between">
                        <span>Next billing:</span>
                        <span className="font-medium">{billingData?.subscription?.nextBilling || 'Feb 15, 2024'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Actions</h3>
                    <div className="space-y-2">
                      {billingData?.subscription?.status === 'active' && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleSubscriptionAction('pause')}
                          disabled={updateSubscriptionMutation.isPending}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Subscription
                        </Button>
                      )}
                      
                      {billingData?.subscription?.status === 'paused' && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleSubscriptionAction('resume')}
                          disabled={updateSubscriptionMutation.isPending}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume Subscription
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleSubscriptionAction('cancel')}
                        disabled={updateSubscriptionMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Update Payment Method */}
                {isUpdatingCard && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Update Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={newCardData.name}
                          onChange={(e) => setNewCardData({...newCardData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={newCardData.number}
                          onChange={(e) => setNewCardData({...newCardData, number: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={newCardData.expiry}
                          onChange={(e) => setNewCardData({...newCardData, expiry: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={newCardData.cvv}
                          onChange={(e) => setNewCardData({...newCardData, cvv: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUpdatePaymentMethod}
                        disabled={updatePaymentMethodMutation.isPending}
                      >
                        Update Payment Method
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsUpdatingCard(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Token Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Available Tokens:</span>
                      <span className="font-bold text-lg">{billingData?.tokens?.balance || 2500}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Used This Month:</span>
                      <span className="font-medium">{billingData?.tokens?.used || 750}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-legal-blue h-3 rounded-full" 
                        style={{ width: `${((billingData?.tokens?.used || 750) / (billingData?.tokens?.balance || 2500)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Usage resets on {billingData?.subscription?.nextBilling || 'Feb 15, 2024'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Additional Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTokenPlan} onValueChange={setSelectedTokenPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1,000 Tokens - $19</SelectItem>
                      <SelectItem value="5000">5,000 Tokens - $79 (Save 17%)</SelectItem>
                      <SelectItem value="10000">10,000 Tokens - $149 (Save 21%)</SelectItem>
                      <SelectItem value="25000">25,000 Tokens - $349 (Save 26%)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    className="w-full"
                    onClick={handlePurchaseTokens}
                    disabled={!selectedTokenPlan || purchaseTokensMutation.isPending}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {purchaseTokensMutation.isPending ? 'Processing...' : 'Purchase Tokens'}
                  </Button>

                  <div className="text-xs text-gray-600">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Tokens never expire and roll over each month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Token Usage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Token Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Document Generation</span>
                    <span className="font-medium">350 tokens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Case Analysis</span>
                    <span className="font-medium">200 tokens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Evidence Processing</span>
                    <span className="font-medium">150 tokens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Legal Research</span>
                    <span className="font-medium">50 tokens</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total This Month</span>
                    <span>{billingData?.tokens?.used || 750} tokens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-legal-blue/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-legal-blue" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.description || 'Professional Plan'}</div>
                          <div className="text-sm text-gray-600">{invoice.date || 'Jan 15, 2024'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(invoice.amount || 99)}</div>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                            {invoice.status || 'Paid'}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {invoices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No invoices found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
