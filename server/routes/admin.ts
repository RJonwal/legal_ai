
import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Landing page configuration storage
let landingConfig = {
  hero: {
    title: "Revolutionary AI Legal Assistant",
    subtitle: "Empowering lawyers and pro se litigants with intelligent case management, document generation, and strategic legal analysis",
    ctaText: "Start Your Legal Journey",
    backgroundImage: null
  },
  features: [
    {
      id: "1",
      icon: "Scale",
      title: "AI-Powered Legal Analysis",
      description: "Advanced AI that thinks like a senior attorney with 20+ years of experience",
      enabled: true
    },
    {
      id: "2", 
      icon: "FileText",
      title: "Automated Document Generation",
      description: "Generate court-ready legal documents, briefs, and motions instantly",
      enabled: true
    },
    {
      id: "3",
      icon: "Gavel", 
      title: "Case Strategy Planning",
      description: "Comprehensive case analysis with proactive strategic recommendations",
      enabled: true
    }
  ],
  testimonials: [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Partner",
      company: "Johnson & Associates", 
      content: "This AI assistant has revolutionized our practice. We're 300% more efficient.",
      rating: 5,
      enabled: true
    }
  ],
  pricing: [
    {
      id: "1",
      name: "Pro Se",
      price: "$29",
      period: "month",
      features: ["Basic AI assistance", "Document templates", "Case tracking", "Email support"],
      popular: false,
      enabled: true
    },
    {
      id: "2",
      name: "Professional", 
      price: "$99",
      period: "month",
      features: ["Full AI analysis", "Unlimited documents", "Advanced case management", "Priority support", "Court preparation tools"],
      popular: true,
      enabled: true
    }
  ],
  contact: {
    phone: "+1 (555) 123-LEGAL",
    email: "contact@legalai.com", 
    address: "123 Legal District, Suite 500, New York, NY 10001"
  },
  seo: {
    title: "LegalAI Pro - Revolutionary AI Legal Assistant",
    description: "Empowering lawyers and pro se litigants with AI-powered case management, document generation, and strategic legal analysis.",
    keywords: ["legal AI", "case management", "document generation", "pro se", "attorney", "legal assistant"]
  }
};

// Get landing page configuration
router.get("/landing-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/landing-config 200`);
  res.json(landingConfig);
});

// Update landing page configuration
router.put("/landing-config", (req: Request, res: Response) => {
  try {
    landingConfig = { ...landingConfig, ...req.body };
    console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/landing-config 200`);
    res.json({ success: true, config: landingConfig });
  } catch (error) {
    console.error("Error updating landing config:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

// Get logo configuration
router.get("/logo-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/logo-config 200`);
  res.json({
    logoUrl: null,
    brandName: "LegalAI Pro",
    tagline: "AI-Powered Legal Excellence"
  });
});

export default router;
