import { Router } from "express";
import { StripeService, subscriptionPlans } from "../services/stripe";
import { authenticateToken, type AuthRequest } from "../services/auth";
import { z } from "zod";

const router = Router();

// Get subscription plans
router.get("/plans", async (req, res) => {
  try {
    res.json(subscriptionPlans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create payment intent for one-time payments
router.post("/create-payment-intent", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const paymentIntent = await StripeService.createPaymentIntent(amount);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create subscription
router.post("/create-subscription", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      planId: z.string().min(1, "Plan ID is required"),
      paymentMethodId: z.string().min(1, "Payment method ID is required")
    });

    const validation = schema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { planId, paymentMethodId } = validation.data;
    const userId = req.user!.id;

    const result = await StripeService.createSubscription(userId, planId, paymentMethodId);
    
    res.json({
      subscriptionId: result.subscription.id,
      clientSecret: result.clientSecret,
      status: result.subscription.status
    });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    if (error.message === "User not found" || error.message === "Invalid plan selected") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current subscription
router.get("/subscription", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.stripeSubscriptionId) {
      return res.json({ subscription: null });
    }

    const subscription = await StripeService.getSubscription(user.stripeSubscriptionId);
    const plan = subscriptionPlans.find(p => p.stripePriceId === subscription.items.data[0].price.id);
    
    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        plan: plan || null
      }
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel subscription
router.post("/cancel-subscription", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: "No active subscription found" });
    }

    const canceledSubscription = await StripeService.cancelSubscription(user.stripeSubscriptionId);
    
    res.json({
      message: "Subscription canceled successfully",
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        canceledAt: canceledSubscription.canceled_at
      }
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update subscription
router.post("/update-subscription", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      planId: z.string().min(1, "Plan ID is required")
    });

    const validation = schema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    const { planId } = validation.data;
    const user = req.user!;
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: "No active subscription found" });
    }

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const updatedSubscription = await StripeService.updateSubscription(
      user.stripeSubscriptionId,
      plan.stripePriceId
    );
    
    res.json({
      message: "Subscription updated successfully",
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        plan: plan
      }
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Stripe webhooks
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    
    if (!signature) {
      return res.status(400).json({ message: "No signature provided" });
    }

    await StripeService.handleWebhook(req.body, signature as string);
    
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: "Webhook error" });
  }
});

export default router;