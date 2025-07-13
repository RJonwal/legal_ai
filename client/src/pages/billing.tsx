
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Download, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from "@/lib/icons";

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  createdAt: string;
  description: string;
}

export default function Billing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/payment/subscription"],
  });

  const { data: billingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/payment/billing-history"],
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string }) => {
      return await apiRequest("POST", "/api/payment/generate-invoice", data);
    },
    onSuccess: () => {
      toast({
        title: "Invoice Generated",
        description: "Your invoice has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment/billing-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadInvoice = async (invoiceUrl: string, invoiceNumber: string) => {
    try {
      if (invoiceUrl) {
        window.open(invoiceUrl, '_blank');
      } else {
        // Download from our server
        const response = await fetch(`/api/payment/invoice/${invoiceNumber}.pdf`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  if (subscriptionLoading || historyLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Current Subscription */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.subscription?.plan?.name || "Free"}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription?.subscription?.status && (
                  <Badge variant={subscription.subscription.status === "active" ? "default" : "destructive"}>
                    {subscription.subscription.status}
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.subscription?.currentPeriodEnd 
                  ? new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()
                  : "N/A"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Renewal date
              </p>
            </CardContent>
          </Card>

          {/* Monthly Spend */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${subscription?.subscription?.plan?.price 
                  ? (subscription.subscription.plan.price / 100).toFixed(2)
                  : "0.00"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Current billing amount
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  Manage your current subscription and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{subscription.subscription.plan?.name}</h3>
                        <p className="text-sm text-gray-600">
                          ${(subscription.subscription.plan?.price / 100).toFixed(2)}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          Active since {new Date(subscription.subscription.currentPeriodStart * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription.subscription.status)}
                        {subscription.subscription.cancelAtPeriodEnd && (
                          <p className="text-xs text-orange-600 mt-1">
                            Cancels on {new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <a href="/subscription">Change Plan</a>
                      </Button>
                      {!subscription.subscription.cancelAtPeriodEnd && (
                        <Button variant="destructive">
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have an active subscription. <a href="/subscription" className="underline">Choose a plan</a> to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View your past payments and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingHistory.map((item: BillingHistory) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            ${(item.amount / 100).toFixed(2)} {item.currency}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadInvoice(item.invoiceUrl || "", item.invoiceNumber)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No billing history found.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>
                  Generate and download invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => generateInvoiceMutation.mutate({
                    amount: subscription?.subscription?.plan?.price || 0,
                    description: `${subscription?.subscription?.plan?.name || "Service"} - ${new Date().toLocaleDateString()}`
                  })}
                  disabled={generateInvoiceMutation.isPending}
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {generateInvoiceMutation.isPending ? "Generating..." : "Generate New Invoice"}
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Invoices are automatically generated for subscription payments. You can also manually generate invoices for additional services.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
