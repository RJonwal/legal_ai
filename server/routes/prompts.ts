import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { prompts } from "../../shared/schema";
import type { Prompt, InsertPrompt } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";
import { aiServiceProvider } from "../services/ai-service-provider";

const router = Router();

// Prompt validation schema
const PromptSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(500),
  promptContent: z.string().min(10),
  category: z.enum(['chat', 'document', 'analysis', 'strategy', 'general']),
  isActive: z.boolean(),
  version: z.string().optional().default("v1.0")
});

// Get all prompts
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const allPrompts = await db.select().from(prompts);
    res.json(allPrompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

// Get specific prompt by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, parseInt(req.params.id)));
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ error: "Failed to fetch prompt" });
  }
});

// Create new prompt
router.post("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const promptData = PromptSchema.parse(req.body);
    
    const [newPrompt] = await db.insert(prompts).values({
      ...promptData,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid prompt data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

// Update prompt
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const promptData = PromptSchema.parse(req.body);
    
    const [updatedPrompt] = await db.update(prompts)
      .set({
        ...promptData,
        updatedAt: new Date()
      })
      .where(eq(prompts.id, parseInt(req.params.id)))
      .returning();

    if (!updatedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid prompt data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update prompt" });
  }
});

// Delete prompt
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [deletedPrompt] = await db.delete(prompts)
      .where(eq(prompts.id, parseInt(req.params.id)))
      .returning();

    if (!deletedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.json({ success: true, message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
});

// Test prompt with AI service
router.post("/:id/test", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: "Input is required for testing" });
    }

    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, parseInt(req.params.id)));
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    // Test the prompt with AI service
    const result = await aiServiceProvider.chatCompletion({
      messages: [{ role: "user", content: input }],
      systemPrompt: prompt.promptContent,
      temperature: 0.7,
      maxTokens: 1000
    });

    // Increment usage count
    await db.update(prompts)
      .set({ 
        usageCount: (prompt.usageCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(prompts.id, parseInt(req.params.id)));

    res.json({ 
      result: result.content,
      provider: result.provider,
      model: result.model
    });
  } catch (error) {
    console.error("Error testing prompt:", error);
    res.status(500).json({ error: "Failed to test prompt" });
  }
});

// Get prompt categories
router.get("/categories/list", authenticateToken, async (req, res) => {
  try {
    const categories = [
      { 
        id: 'chat', 
        name: 'Chat Assistant', 
        description: 'Main chat interface prompts for legal consultation',
        icon: 'MessageSquare',
        services: ['chat', 'legal-assistant', 'case-consultation']
      },
      { 
        id: 'document', 
        name: 'Document Generation', 
        description: 'Prompts for generating legal documents',
        icon: 'FileText',
        services: ['document-generation', 'pleadings', 'contracts', 'letters']
      },
      { 
        id: 'analysis', 
        name: 'Analysis & Review', 
        description: 'Contract analysis and document review prompts',
        icon: 'Scale',
        services: ['contract-analysis', 'document-review', 'case-analysis']
      },
      { 
        id: 'strategy', 
        name: 'Strategy & Planning', 
        description: 'Case strategy and litigation planning prompts',
        icon: 'Target',
        services: ['case-strategy', 'litigation-planning', 'risk-assessment']
      },
      { 
        id: 'general', 
        name: 'General Purpose', 
        description: 'Multi-purpose and utility prompts',
        icon: 'Brain',
        services: ['general-assistance', 'research', 'utilities']
      }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;