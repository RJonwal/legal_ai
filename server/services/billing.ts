
import { storage } from "../storage";
import { StripeService } from "./stripe";
import { EmailService } from "./email";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface BillingHistory {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  createdAt: Date;
  description: string;
  subscriptionId?: string;
}

export interface SubscriptionDetails {
  id: string;
  userId: number;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}

export class BillingService {
  static async getUserBillingHistory(userId: number): Promise<BillingHistory[]> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return [];
      }

      // Get invoices from Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 50,
      });

      return invoices.data.map((invoice: any) => ({
        id: invoice.id,
        userId,
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        status: invoice.status,
        invoiceNumber: invoice.number || invoice.id,
        invoiceUrl: invoice.hosted_invoice_url,
        createdAt: new Date(invoice.created * 1000),
        description: invoice.description || "Subscription payment",
        subscriptionId: invoice.subscription,
      }));
    } catch (error) {
      console.error("Error fetching billing history:", error);
      return [];
    }
  }

  static async createInvoice(userId: number, amount: number, description: string): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const invoiceNumber = `INV-${Date.now()}-${userId}`;
      const invoiceDir = path.join(process.cwd(), "uploads", "invoices");
      
      // Ensure directory exists
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const invoicePath = path.join(invoiceDir, `${invoiceNumber}.pdf`);
      
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(invoicePath);
        
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text("INVOICE", 50, 50);
        doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`, 50, 80);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 100);
        doc.text(`Due Date: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 50, 120);

        // Bill To
        doc.text("Bill To:", 50, 160);
        doc.text(user.fullName, 50, 180);
        doc.text(user.email, 50, 200);

        // Invoice Details
        doc.text("Description", 50, 250);
        doc.text("Amount", 400, 250);
        doc.text(description, 50, 270);
        doc.text(`$${(amount / 100).toFixed(2)}`, 400, 270);

        // Total
        doc.fontSize(14).text(`Total: $${(amount / 100).toFixed(2)}`, 400, 320);

        // Footer
        doc.fontSize(10).text("Thank you for your business!", 50, 400);

        doc.end();

        stream.on('finish', () => {
          resolve(invoicePath);
        });

        stream.on('error', reject);
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  static async processRecurringBilling(): Promise<void> {
    try {
      console.log("Processing recurring billing...");
      
      // This would typically be called by a cron job
      // Get all active subscriptions that need billing
      const users = await storage.getAllUsers();
      
      for (const user of users) {
        if (user.stripeSubscriptionId && user.subscriptionStatus === "active") {
          try {
            const subscription = await StripeService.getSubscription(user.stripeSubscriptionId);
            
            // Check if subscription needs renewal reminder
            const periodEnd = new Date(subscription.current_period_end * 1000);
            const daysUntilRenewal = Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilRenewal === 3) {
              await EmailService.sendRenewalReminderEmail(
                user.email,
                user.fullName,
                periodEnd
              );
            }
          } catch (error) {
            console.error(`Error processing billing for user ${user.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error in recurring billing process:", error);
    }
  }

  static async cancelSubscription(userId: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      await StripeService.cancelSubscription(user.stripeSubscriptionId);
      
      await storage.updateUser(userId, {
        subscriptionStatus: "canceled"
      });

      // Send cancellation confirmation email
      await EmailService.sendSubscriptionCanceledEmail(user.email, user.fullName);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  static async updatePaymentMethod(userId: number, paymentMethodId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        throw new Error("No customer found");
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Attach new payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Set as default
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Send confirmation email
      await EmailService.sendPaymentMethodUpdatedEmail(user.email, user.fullName);
    } catch (error) {
      console.error("Error updating payment method:", error);
      throw error;
    }
  }
}
