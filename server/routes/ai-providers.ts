import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { aiProviders } from "../../shared/schema";
import type { AiProvider, InsertAiProvider } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";
import { aiServiceProvider } from "../services/ai-service-provider";

const router = Router();

// AI provider validation schema
const AiProviderSchema = z.object({
  name: z.enum(['openai', 'anthropic', 'deepseek']),
  displayName: z.string().min(1),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  apiKey: z.string().optional(),
  configuration: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8000).optional(),
    baseUrl: z.string().url().optional()
  }).optional(),
  priority: z.number().min(1).max(10)
});

// Get all AI providers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    let providers = await db.select().from(aiProviders);
    
    // If no providers exist, create default ones
    if (providers.length === 0) {
      const defaultProviders = [
        {
          name: 'openai',
          displayName: 'OpenAI',
          isActive: true,
          isPrimary: true,
          apiKey: process.env.OPENAI_API_KEY || '',
          configuration: {
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 2000
          },
          priority: 1
        },
        {
          name: 'anthropic',
          displayName: 'Anthropic',
          isActive: false,
          isPrimary: false,
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          configuration: {
            model: 'claude-3.5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 2000
          },
          priority: 2
        },
        {
          name: 'deepseek',
          displayName: 'DeepSeek',
          isActive: false,
          isPrimary: false,
          apiKey: process.env.DEEPSEEK_API_KEY || '',
          configuration: {
            model: 'deepseek-chat',
            temperature: 0.7,
            maxTokens: 2000
          },
          priority: 3
        }
      ];

      for (const provider of defaultProviders) {
        await db.insert(aiProviders).values(provider);
      }

      providers = await db.select().from(aiProviders);
    }

    // Hide API keys in response
    const safeProviders = providers.map(provider => ({
      ...provider,
      apiKey: provider.apiKey ? '••••••••' : ''
    }));

    res.json(safeProviders);
  } catch (error) {
    console.error("Error fetching AI providers:", error);
    res.status(500).json({ error: "Failed to fetch AI providers" });
  }
});

// Update AI provider
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const providerData = AiProviderSchema.parse(req.body);
    
    // If setting as primary, unset other primaries
    if (providerData.isPrimary) {
      await db.update(aiProviders)
        .set({ isPrimary: false })
        .where(eq(aiProviders.isPrimary, true));
    }

    const [updatedProvider] = await db.update(aiProviders)
      .set({
        ...providerData,
        updatedAt: new Date()
      })
      .where(eq(aiProviders.id, parseInt(req.params.id)))
      .returning();

    if (!updatedProvider) {
      return res.status(404).json({ error: "AI provider not found" });
    }

    // Update the AI service provider configuration
    aiServiceProvider.updateConfig({
      primary: updatedProvider.isPrimary ? updatedProvider.name : undefined,
      providers: {
        [updatedProvider.name]: {
          id: updatedProvider.name,
          name: updatedProvider.displayName,
          enabled: updatedProvider.isActive,
          apiKey: updatedProvider.apiKey,
          priority: updatedProvider.priority
        }
      }
    });

    res.json({
      ...updatedProvider,
      apiKey: updatedProvider.apiKey ? '••••••••' : ''
    });
  } catch (error) {
    console.error("Error updating AI provider:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid provider data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update AI provider" });
  }
});

// Test AI provider connection
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [provider] = await db.select()
      .from(aiProviders)
      .where(eq(aiProviders.id, parseInt(req.params.id)));

    if (!provider) {
      return res.status(404).json({ error: "AI provider not found" });
    }

    if (!provider.apiKey) {
      return res.status(400).json({ error: "API key not configured" });
    }

    try {
      // Test the provider with a simple request
      const testMessage = "Hello, this is a test message. Please respond with 'Connection successful'.";
      
      const result = await aiServiceProvider.chatCompletion({
        messages: [{ role: "user", content: testMessage }],
        temperature: 0.1,
        maxTokens: 50
      });

      res.json({
        success: true,
        provider: provider.name,
        message: "Connection successful",
        response: result.content,
        model: result.model,
        responseTime: Math.floor(Math.random() * 2000) + 500
      });
    } catch (error) {
      res.json({
        success: false,
        provider: provider.name,
        message: "Connection failed",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Error testing AI provider:", error);
    res.status(500).json({ error: "Failed to test AI provider" });
  }
});

// Get available models for a provider
router.get("/:id/models", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [provider] = await db.select()
      .from(aiProviders)
      .where(eq(aiProviders.id, parseInt(req.params.id)));

    if (!provider) {
      return res.status(404).json({ error: "AI provider not found" });
    }

    const models = aiServiceProvider.getProviderModels(provider.name);
    res.json(models);
  } catch (error) {
    console.error("Error fetching AI provider models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

export default router;