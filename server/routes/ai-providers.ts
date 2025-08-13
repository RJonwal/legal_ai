import { Router } from "express";
import { db } from "../db";
import { aiProviders } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Get all AI providers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Mock data with updated models for now
    const providers = [
      {
        id: 1,
        name: "openai",
        provider: "openai",
        isActive: true,
        isPrimary: true,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
        configuration: {
          apiKey: "***hidden***",
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 2,
        name: "anthropic",
        provider: "anthropic",
        isActive: true,
        isPrimary: false,
        models: [
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022', 
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
          'claude-2.1',
          'claude-2.0',
          'claude-instant-1.2'
        ],
        configuration: {
          apiKey: "***hidden***",
          baseUrl: "https://api.anthropic.com",
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 3,
        name: "deepseek",
        provider: "deepseek", 
        isActive: true,
        isPrimary: false,
        models: [
          'deepseek-chat',
          'deepseek-coder',
          'deepseek-math',
          'deepseek-v2.5',
          'deepseek-v2',
          'deepseek-v1.5'
        ],
        configuration: {
          apiKey: "***hidden***",
          baseUrl: "https://api.deepseek.com",
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 4,
        name: "google",
        provider: "google",
        isActive: false,
        isPrimary: false,
        models: [
          'gemini-1.5-pro',
          'gemini-1.5-flash',
          'gemini-1.0-pro',
          'gemini-pro-vision'
        ],
        configuration: {
          apiKey: null,
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 5,
        name: "cohere",
        provider: "cohere",
        isActive: false,
        isPrimary: false,
        models: [
          'command-r-plus',
          'command-r',
          'command',
          'command-nightly'
        ],
        configuration: {
          apiKey: null,
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 6,
        name: "mistral",
        provider: "mistral",
        isActive: false,
        isPrimary: false,
        models: [
          'mistral-large-latest',
          'mistral-medium-latest',
          'mistral-small-latest',
          'mixtral-8x7b-instruct'
        ],
        configuration: {
          apiKey: null,
          maxTokens: 4096,
          temperature: 0.7
        }
      },
      {
        id: 7,
        name: "perplexity",
        provider: "perplexity",
        isActive: false,
        isPrimary: false,
        models: [
          'llama-3.1-sonar-large-128k-online',
          'llama-3.1-sonar-small-128k-online',
          'llama-3.1-70b-instruct',
          'llama-3.1-8b-instruct'
        ],
        configuration: {
          apiKey: null,
          maxTokens: 4096,
          temperature: 0.7
        }
      }
    ];

    res.json(providers);
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

    const { id } = req.params;
    const updates = req.body;

    // For now, just return success
    // TODO: Implement actual database update
    console.log(`Updating AI provider ${id}:`, updates);

    res.json({ 
      id: parseInt(id),
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating AI provider:", error);
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

    const { id } = req.params;
    
    // Simulate connection test
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    res.json({
      success,
      message: success 
        ? "Connection successful! Provider is responding correctly."
        : "Connection failed. Please check your API key and configuration.",
      responseTime: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error testing AI provider:", error);
    res.status(500).json({ 
      success: false,
      message: "Test failed due to server error",
      error: "Internal server error" 
    });
  }
});

// Get AI provider usage statistics
router.get("/:id/usage", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    
    // Mock usage statistics
    const stats = {
      totalRequests: Math.floor(Math.random() * 10000) + 1000,
      totalTokens: Math.floor(Math.random() * 1000000) + 100000,
      successfulRequests: Math.floor(Math.random() * 9500) + 900,
      averageResponseTime: Math.floor(Math.random() * 300) + 150,
      lastUsed: new Date().toISOString(),
      currentMonth: {
        requests: Math.floor(Math.random() * 2000) + 500,
        tokens: Math.floor(Math.random() * 200000) + 50000,
        cost: Math.floor(Math.random() * 50) + 10
      }
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching AI provider usage:", error);
    res.status(500).json({ error: "Failed to fetch usage statistics" });
  }
});

export default router;