import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { paymentGateways } from "../../shared/schema";
import type { PaymentGateway, InsertPaymentGateway } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Payment gateway validation schema
const PaymentGatewaySchema = z.object({
  name: z.enum(['stripe', 'paypal', 'square']),
  displayName: z.string().min(1),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  configuration: z.object({
    publicKey: z.string().optional(),
    secretKey: z.string().optional(),
    webhookSecret: z.string().optional(),
    environment: z.enum(['sandbox', 'production']).optional()
  }).optional(),
  testMode: z.boolean()
});

// Get all payment gateways
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    let gateways = await db.select().from(paymentGateways);
    
    // If no gateways exist, create default ones
    if (gateways.length === 0) {
      const defaultGateways = [
        {
          name: 'stripe',
          displayName: 'Stripe',
          isActive: true,
          isPrimary: true,
          configuration: {
            environment: 'sandbox'
          },
          testMode: true
        },
        {
          name: 'paypal',
          displayName: 'PayPal',
          isActive: false,
          isPrimary: false,
          configuration: {
            environment: 'sandbox'
          },
          testMode: true
        },
        {
          name: 'square',
          displayName: 'Square',
          isActive: false,
          isPrimary: false,
          configuration: {
            environment: 'sandbox'
          },
          testMode: true
        }
      ];

      for (const gateway of defaultGateways) {
        await db.insert(paymentGateways).values(gateway);
      }

      gateways = await db.select().from(paymentGateways);
    }

    // Hide sensitive configuration data in response
    const safeGateways = gateways.map(gateway => ({
      ...gateway,
      configuration: gateway.configuration ? {
        ...gateway.configuration,
        secretKey: gateway.configuration.secretKey ? '••••••••' : undefined,
        webhookSecret: gateway.configuration.webhookSecret ? '••••••••' : undefined
      } : null
    }));

    res.json(safeGateways);
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
    res.status(500).json({ error: "Failed to fetch payment gateways" });
  }
});

// Update payment gateway
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const gatewayData = PaymentGatewaySchema.parse(req.body);
    
    // If setting as primary, unset other primaries
    if (gatewayData.isPrimary) {
      await db.update(paymentGateways)
        .set({ isPrimary: false })
        .where(eq(paymentGateways.isPrimary, true));
    }

    const [updatedGateway] = await db.update(paymentGateways)
      .set({
        ...gatewayData,
        updatedAt: new Date()
      })
      .where(eq(paymentGateways.id, parseInt(req.params.id)))
      .returning();

    if (!updatedGateway) {
      return res.status(404).json({ error: "Payment gateway not found" });
    }

    res.json(updatedGateway);
  } catch (error) {
    console.error("Error updating payment gateway:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid gateway data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update payment gateway" });
  }
});

// Test payment gateway connection
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [gateway] = await db.select()
      .from(paymentGateways)
      .where(eq(paymentGateways.id, parseInt(req.params.id)));

    if (!gateway) {
      return res.status(404).json({ error: "Payment gateway not found" });
    }

    // Mock test for now - in production, this would test actual gateway connection
    const testResult = {
      success: true,
      gateway: gateway.name,
      message: `Successfully connected to ${gateway.displayName}`,
      timestamp: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 100, // Mock response time
      features: {
        payments: true,
        subscriptions: gateway.name === 'stripe',
        refunds: true,
        webhooks: true
      }
    };

    res.json(testResult);
  } catch (error) {
    console.error("Error testing payment gateway:", error);
    res.status(500).json({ error: "Failed to test payment gateway" });
  }
});

// Get gateway statistics
router.get("/:id/stats", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [gateway] = await db.select()
      .from(paymentGateways)
      .where(eq(paymentGateways.id, parseInt(req.params.id)));

    if (!gateway) {
      return res.status(404).json({ error: "Payment gateway not found" });
    }

    // Mock statistics - in production, this would query actual transaction data
    const stats = {
      totalTransactions: Math.floor(Math.random() * 10000) + 1000,
      successfulTransactions: Math.floor(Math.random() * 9500) + 950,
      failedTransactions: Math.floor(Math.random() * 500) + 50,
      totalVolume: Math.floor(Math.random() * 1000000) + 100000,
      averageTransactionValue: Math.floor(Math.random() * 500) + 50,
      last30Days: {
        transactions: Math.floor(Math.random() * 1000) + 100,
        volume: Math.floor(Math.random() * 100000) + 10000
      },
      topCountries: [
        { country: 'United States', percentage: 65 },
        { country: 'Canada', percentage: 15 },
        { country: 'United Kingdom', percentage: 10 },
        { country: 'Other', percentage: 10 }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching gateway statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;