import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { webhooks } from "../../shared/schema";
import type { Webhook, InsertWebhook } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";
import crypto from "crypto";

const router = Router();

// Webhook validation schema
const WebhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  isActive: z.boolean(),
  secret: z.string().optional()
});

// Available webhook events
const AVAILABLE_EVENTS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'case.created',
  'case.updated',
  'case.completed',
  'document.generated',
  'document.signed',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.updated',
  'subscription.cancelled',
  'ai.request.completed',
  'system.error'
];

// Get all webhooks
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const allWebhooks = await db.select().from(webhooks);
    
    // Hide secrets in response
    const safeWebhooks = allWebhooks.map(webhook => ({
      ...webhook,
      secret: webhook.secret ? '••••••••' : null
    }));

    res.json(safeWebhooks);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

// Create new webhook
router.post("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const webhookData = WebhookSchema.parse(req.body);
    
    // Generate secret if not provided
    if (!webhookData.secret) {
      webhookData.secret = crypto.randomBytes(32).toString('hex');
    }

    const [newWebhook] = await db.insert(webhooks).values({
      ...webhookData,
      failureCount: 0
    }).returning();

    res.status(201).json({
      ...newWebhook,
      secret: newWebhook.secret ? '••••••••' : null
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid webhook data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create webhook" });
  }
});

// Update webhook
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const webhookData = WebhookSchema.parse(req.body);

    const [updatedWebhook] = await db.update(webhooks)
      .set({
        ...webhookData,
        updatedAt: new Date()
      })
      .where(eq(webhooks.id, parseInt(req.params.id)))
      .returning();

    if (!updatedWebhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    res.json({
      ...updatedWebhook,
      secret: updatedWebhook.secret ? '••••••••' : null
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid webhook data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update webhook" });
  }
});

// Delete webhook
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [deletedWebhook] = await db.delete(webhooks)
      .where(eq(webhooks.id, parseInt(req.params.id)))
      .returning();

    if (!deletedWebhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    res.json({ success: true, message: "Webhook deleted successfully" });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});

// Test webhook
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [webhook] = await db.select()
      .from(webhooks)
      .where(eq(webhooks.id, parseInt(req.params.id)));

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    // Test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        webhook_id: webhook.id,
        message: 'This is a test webhook delivery'
      }
    };

    try {
      // Generate signature if secret exists
      let signature = null;
      if (webhook.secret) {
        const hmac = crypto.createHmac('sha256', webhook.secret);
        hmac.update(JSON.stringify(testPayload));
        signature = hmac.digest('hex');
      }

      // Send test webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LegalAI-Webhooks/1.0',
          ...(signature && { 'X-Webhook-Signature': `sha256=${signature}` })
        },
        body: JSON.stringify(testPayload)
      });

      const responseText = await response.text();

      // Update last triggered time
      await db.update(webhooks)
        .set({ lastTriggered: new Date() })
        .where(eq(webhooks.id, parseInt(req.params.id)));

      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Increment failure count
      await db.update(webhooks)
        .set({ failureCount: webhook.failureCount + 1 })
        .where(eq(webhooks.id, parseInt(req.params.id)));

      res.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    res.status(500).json({ error: "Failed to test webhook" });
  }
});

// Get available events
router.get("/events", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const eventCategories = {
      user: AVAILABLE_EVENTS.filter(e => e.startsWith('user.')),
      case: AVAILABLE_EVENTS.filter(e => e.startsWith('case.')),
      document: AVAILABLE_EVENTS.filter(e => e.startsWith('document.')),
      payment: AVAILABLE_EVENTS.filter(e => e.startsWith('payment.')),
      subscription: AVAILABLE_EVENTS.filter(e => e.startsWith('subscription.')),
      ai: AVAILABLE_EVENTS.filter(e => e.startsWith('ai.')),
      system: AVAILABLE_EVENTS.filter(e => e.startsWith('system.'))
    };

    res.json(eventCategories);
  } catch (error) {
    console.error("Error fetching webhook events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Webhook delivery logs
router.get("/:id/logs", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Mock webhook delivery logs - in production, this would come from a logs table
    const logs = [
      {
        id: 1,
        event: 'user.created',
        status: 'success',
        responseCode: 200,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        responseTime: 245
      },
      {
        id: 2,
        event: 'payment.succeeded',
        status: 'success',
        responseCode: 200,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        responseTime: 189
      },
      {
        id: 3,
        event: 'case.created',
        status: 'failed',
        responseCode: 500,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        responseTime: 5000,
        error: 'Internal server error'
      }
    ];

    res.json(logs);
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;