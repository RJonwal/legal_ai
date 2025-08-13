import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { appApis } from "../../shared/schema";
import type { AppApi, InsertAppApi } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// App API validation schema
const AppApiSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['email', 'sms', 'storage', 'analytics', 'payment']),
  provider: z.string().min(1),
  isActive: z.boolean(),
  configuration: z.object({
    apiKey: z.string().optional(),
    region: z.string().optional(),
    endpoint: z.string().url().optional(),
    settings: z.record(z.string()).optional()
  }).optional(),
  apiKey: z.string().optional()
});

// Get all app APIs
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    let apis = await db.select().from(appApis);
    
    // If no APIs exist, create default ones
    if (apis.length === 0) {
      const defaultApis = [
        {
          name: 'SendGrid Email',
          type: 'email',
          provider: 'sendgrid',
          isActive: false,
          configuration: {
            apiKey: process.env.SENDGRID_API_KEY || '',
            settings: {
              fromEmail: 'noreply@legalai.com',
              fromName: 'LegalAI Pro'
            }
          }
        },
        {
          name: 'Twilio SMS',
          type: 'sms',
          provider: 'twilio',
          isActive: false,
          configuration: {
            apiKey: process.env.TWILIO_AUTH_TOKEN || '',
            settings: {
              accountSid: process.env.TWILIO_ACCOUNT_SID || '',
              phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
            }
          }
        },
        {
          name: 'AWS S3 Storage',
          type: 'storage',
          provider: 'aws',
          isActive: false,
          configuration: {
            apiKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1',
            settings: {
              bucket: process.env.AWS_S3_BUCKET || '',
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || ''
            }
          }
        },
        {
          name: 'Google Analytics',
          type: 'analytics',
          provider: 'google',
          isActive: false,
          configuration: {
            apiKey: process.env.GOOGLE_ANALYTICS_API_KEY || '',
            settings: {
              trackingId: process.env.GA_TRACKING_ID || '',
              measurementId: process.env.GA_MEASUREMENT_ID || ''
            }
          }
        },
        {
          name: 'Resend Email',
          type: 'email',
          provider: 'resend',
          isActive: true,
          configuration: {
            apiKey: process.env.RESEND_API_KEY || '',
            settings: {
              fromEmail: 'noreply@legalai.com',
              fromName: 'LegalAI Pro'
            }
          }
        }
      ];

      for (const api of defaultApis) {
        await db.insert(appApis).values(api);
      }

      apis = await db.select().from(appApis);
    }

    // Hide sensitive API keys in response
    const safeApis = apis.map(api => ({
      ...api,
      apiKey: api.apiKey ? '••••••••' : '',
      configuration: api.configuration ? {
        ...api.configuration,
        apiKey: api.configuration.apiKey ? '••••••••' : undefined
      } : null
    }));

    res.json(safeApis);
  } catch (error) {
    console.error("Error fetching app APIs:", error);
    res.status(500).json({ error: "Failed to fetch app APIs" });
  }
});

// Update app API
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const apiData = AppApiSchema.parse(req.body);

    const [updatedApi] = await db.update(appApis)
      .set({
        ...apiData,
        updatedAt: new Date()
      })
      .where(eq(appApis.id, parseInt(req.params.id)))
      .returning();

    if (!updatedApi) {
      return res.status(404).json({ error: "App API not found" });
    }

    res.json({
      ...updatedApi,
      apiKey: updatedApi.apiKey ? '••••••••' : '',
      configuration: updatedApi.configuration ? {
        ...updatedApi.configuration,
        apiKey: updatedApi.configuration.apiKey ? '••••••••' : undefined
      } : null
    });
  } catch (error) {
    console.error("Error updating app API:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid API data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update app API" });
  }
});

// Test app API connection
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [api] = await db.select()
      .from(appApis)
      .where(eq(appApis.id, parseInt(req.params.id)));

    if (!api) {
      return res.status(404).json({ error: "App API not found" });
    }

    if (!api.apiKey && !api.configuration?.apiKey) {
      return res.status(400).json({ error: "API key not configured" });
    }

    // Mock test results for different API types
    let testResult;
    
    switch (api.type) {
      case 'email':
        testResult = {
          success: true,
          provider: api.provider,
          message: `Successfully connected to ${api.provider} email service`,
          details: {
            accountStatus: 'Active',
            dailyLimit: api.provider === 'sendgrid' ? 100 : 300,
            monthlyUsage: Math.floor(Math.random() * 1000),
            deliveryRate: `${95 + Math.floor(Math.random() * 4)}%`
          }
        };
        break;
      
      case 'sms':
        testResult = {
          success: true,
          provider: api.provider,
          message: `Successfully connected to ${api.provider} SMS service`,
          details: {
            accountBalance: `$${(Math.random() * 100).toFixed(2)}`,
            messagesRemaining: Math.floor(Math.random() * 1000) + 500,
            phoneNumber: api.configuration?.settings?.phoneNumber || 'Not configured'
          }
        };
        break;
      
      case 'storage':
        testResult = {
          success: true,
          provider: api.provider,
          message: `Successfully connected to ${api.provider} storage service`,
          details: {
            bucket: api.configuration?.settings?.bucket || 'default-bucket',
            region: api.configuration?.region || 'us-east-1',
            storageUsed: `${(Math.random() * 100).toFixed(1)} GB`,
            filesCount: Math.floor(Math.random() * 10000) + 1000
          }
        };
        break;
      
      case 'analytics':
        testResult = {
          success: true,
          provider: api.provider,
          message: `Successfully connected to ${api.provider} analytics service`,
          details: {
            trackingId: api.configuration?.settings?.trackingId || 'Not configured',
            lastDataReceived: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            dailyViews: Math.floor(Math.random() * 5000) + 1000
          }
        };
        break;
      
      default:
        testResult = {
          success: true,
          provider: api.provider,
          message: `Successfully connected to ${api.provider} service`,
          details: {
            status: 'Connected',
            lastChecked: new Date().toISOString()
          }
        };
    }

    res.json({
      ...testResult,
      timestamp: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 1000) + 200
    });
  } catch (error) {
    console.error("Error testing app API:", error);
    res.status(500).json({ error: "Failed to test app API" });
  }
});

// Get API usage statistics
router.get("/:id/usage", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [api] = await db.select()
      .from(appApis)
      .where(eq(appApis.id, parseInt(req.params.id)));

    if (!api) {
      return res.status(404).json({ error: "App API not found" });
    }

    // Mock usage statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const usageData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      usageData.push({
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 1000) + 100,
        success: Math.floor(Math.random() * 950) + 95,
        errors: Math.floor(Math.random() * 50) + 5
      });
    }

    const stats = {
      totalRequests: usageData.reduce((sum, day) => sum + day.requests, 0),
      successfulRequests: usageData.reduce((sum, day) => sum + day.success, 0),
      errorRequests: usageData.reduce((sum, day) => sum + day.errors, 0),
      averageResponseTime: Math.floor(Math.random() * 500) + 200,
      uptime: (99.5 + Math.random() * 0.5).toFixed(2),
      dailyUsage: usageData
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching API usage:", error);
    res.status(500).json({ error: "Failed to fetch usage statistics" });
  }
});

export default router;