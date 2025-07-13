import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Crown, Zap } from "@/lib/icons";

// Lazy load Stripe only when needed
const getStripePromise = () => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.warn('VITE_STRIPE_PUBLIC_KEY not found. Payment processing unavailable.');
    return null;
  }
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePriceId: string;
}

function PaymentForm({ plan }: { plan: SubscriptionPlan }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create subscription
      const subscriptionResponse = await apiRequest("POST", "/api/payment/create-subscription", {
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
      });

      if (subscriptionResponse.clientSecret) {
        // Confirm payment
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscriptionResponse.clientSecret
        );

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      toast({
        title: "Subscription Created",
        description: `Successfully subscribed to ${plan.name}!`,
      });

      // Refresh page to show updated subscription
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : `Subscribe to ${plan.name}`}
      </Button>
    </form>
  );
}

function SubscriptionPlans() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [stripePromise] = useState(() => getStripePromise());

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/payment/plans"],
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/payment/subscription"],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/payment/cancel-subscription");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      });
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <Check className="h-6 w-6 text-blue-600" />;
      case "pro":
        return <Crown className="h-6 w-6 text-purple-600" />;
      case "enterprise":
        return <Zap className="h-6 w-6 text-orange-600" />;
      default:
        return <Check className="h-6 w-6 text-blue-600" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return "border-blue-200 bg-blue-50";
      case "pro":
        return "border-purple-200 bg-purple-50";
      case "enterprise":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your legal practice needs. All plans include our AI-powered legal assistant.
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription?.subscription && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(currentSubscription.subscription.plan?.id || "")}
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{currentSubscription.subscription.plan?.name}</p>
                  <p className="text-sm text-gray-600">
                    Status: <Badge variant={currentSubscription.subscription.status === "active" ? "default" : "destructive"}>
                      {currentSubscription.subscription.status}
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-600">
                    Next billing: {new Date(currentSubscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Selection */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans?.map((plan: SubscriptionPlan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan?.id === plan.id ? "ring-2 ring-blue-500" : ""
            } ${getPlanColor(plan.id)}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                ${(plan.price / 100).toFixed(2)}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Form */}
      {selectedPlan && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Subscribe to {selectedPlan.name}</CardTitle>
            <CardDescription>
              Enter your payment details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!stripePromise ? (
              <Alert>
                <AlertDescription>
                  Payment processing is currently unavailable. Please contact support or try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <Elements stripe={stripePromise}>
                <PaymentForm plan={selectedPlan} />
              </Elements>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SubscriptionPlans />
    </div>
  );
}