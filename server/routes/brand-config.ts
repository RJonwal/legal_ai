import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { brandConfig } from "../../shared/schema";
import type { BrandConfig, InsertBrandConfig } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = Router();

// Brand config validation schema
const BrandConfigSchema = z.object({
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  fontFamily: z.string().min(1),
  companyName: z.string().min(1),
  tagline: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional()
  }).optional()
});

// Get brand configuration
router.get("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    let config = await db.select().from(brandConfig).limit(1);
    
    // If no configuration exists, create default one
    if (config.length === 0) {
      const defaultConfig = {
        primaryColor: "#1e3a8a",
        secondaryColor: "#3730a3",
        accentColor: "#f59e0b",
        fontFamily: "Inter",
        companyName: "LegalAI Pro",
        tagline: "AI-Powered Legal Technology",
        socialMedia: {}
      };

      const [newConfig] = await db.insert(brandConfig).values(defaultConfig).returning();
      res.json(newConfig);
    } else {
      res.json(config[0]);
    }
  } catch (error) {
    console.error("Error fetching brand config:", error);
    res.status(500).json({ error: "Failed to fetch brand configuration" });
  }
});

// Update brand configuration
router.post("/", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const configData = BrandConfigSchema.parse(req.body);

    // Check if config exists
    const existing = await db.select().from(brandConfig).limit(1);

    let result;
    if (existing.length === 0) {
      [result] = await db.insert(brandConfig).values(configData).returning();
    } else {
      [result] = await db.update(brandConfig)
        .set({
          ...configData,
          updatedAt: new Date()
        })
        .where(eq(brandConfig.id, existing[0].id))
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating brand config:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update brand configuration" });
  }
});

// Reset brand configuration to defaults
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const defaultConfig = {
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#1e3a8a",
      secondaryColor: "#3730a3",
      accentColor: "#f59e0b",
      fontFamily: "Inter",
      companyName: "LegalAI Pro",
      tagline: "AI-Powered Legal Technology",
      contactEmail: null,
      contactPhone: null,
      address: null,
      socialMedia: {}
    };

    const existing = await db.select().from(brandConfig).limit(1);

    let result;
    if (existing.length === 0) {
      [result] = await db.insert(brandConfig).values(defaultConfig).returning();
    } else {
      [result] = await db.update(brandConfig)
        .set({
          ...defaultConfig,
          updatedAt: new Date()
        })
        .where(eq(brandConfig.id, existing[0].id))
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error("Error resetting brand config:", error);
    res.status(500).json({ error: "Failed to reset brand configuration" });
  }
});

export default router;