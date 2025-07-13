import Stripe from "stripe";
import { storage } from "../storage";
import { EmailService } from "./email";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
}) : null;

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePriceId: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 2999, // $29.99 in cents
    features: [
      "Up to 10 cases",
      "Basic document generation",
      "Email support",
      "Standard AI assistance"
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || ""
  },
  {
    id: "pro",
    name: "Professional Plan",
    price: 5999, // $59.99 in cents
    features: [
      "Unlimited cases",
      "Advanced document generation",
      "Priority support",
      "Advanced AI assistance",
      "Custom templates",
      "Analytics dashboard"
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || ""
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 9999, // $99.99 in cents
    features: [
      "Everything in Pro",
      "White-label solution",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "Advanced security features"
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || ""
  }
];

export class StripeService {
  static async createPaymentIntent(amount: number, currency: string = "usd"): Promise<Stripe.PaymentIntent> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        type: "one-time-payment"
      }
    });
  }

  static async createSubscription(
    userId: number,
    planId: string,
    paymentMethodId: string
  ): Promise<{ subscription: Stripe.Subscription; clientSecret: string | null }> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error("Invalid plan selected");
    }

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id.toString()
        }
      });
      customerId = customer.id;
      await storage.updateUserStripe(userId, customerId);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan.stripePriceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // Update user with subscription info
    await storage.updateUserStripe(userId, customerId, subscription.id);

    const clientSecret = 
      subscription.latest_invoice && 
      typeof subscription.latest_invoice !== 'string' &&
      subscription.latest_invoice.payment_intent &&
      typeof subscription.latest_invoice.payment_intent !== 'string'
        ? subscription.latest_invoice.payment_intent.client_secret
        : null;

    return { subscription, clientSecret };
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
    });
  }

  static async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw err;
    }

    switch (event.type) {
      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!stripe) return;
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer !== 'string' && customer.metadata?.userId) {
      const userId = parseInt(customer.metadata.userId);
      const user = await storage.getUser(userId);
      
      if (user) {
        await storage.updateUser(userId, { subscriptionStatus: "active" });
        
        // Send success email
        const plan = subscriptionPlans.find(p => p.stripePriceId === subscription.items.data[0].price.id);
        if (plan) {
          await EmailService.sendPaymentSuccessEmail(
            user.email,
            user.fullName,
            invoice.amount_paid,
            plan.name
          );
        }
      }
    }
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!stripe) return;
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer !== 'string' && customer.metadata?.userId) {
      const userId = parseInt(customer.metadata.userId);
      const user = await storage.getUser(userId);
      
      if (user) {
        await storage.updateUser(userId, { subscriptionStatus: "past_due" });
        // Could send payment failed email here
      }
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    if (!stripe) return;
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer !== 'string' && customer.metadata?.userId) {
      const userId = parseInt(customer.metadata.userId);
      const user = await storage.getUser(userId);
      
      if (user) {
        await storage.updateUser(userId, { 
          subscriptionStatus: "inactive",
          stripeSubscriptionId: null
        });
        
        // Send subscription expired email
        await EmailService.sendSubscriptionExpiredEmail(user.email, user.fullName);
      }
    }
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    if (!stripe) return;
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer !== 'string' && customer.metadata?.userId) {
      const userId = parseInt(customer.metadata.userId);
      const user = await storage.getUser(userId);
      
      if (user) {
        const status = subscription.status === "active" ? "active" : 
                      subscription.status === "past_due" ? "past_due" : 
                      subscription.status === "canceled" ? "inactive" : "inactive";
        
        await storage.updateUser(userId, { subscriptionStatus: status });
      }
    }
  }
}