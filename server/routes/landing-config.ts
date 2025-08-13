import { Router } from "express";
import { z } from "zod";

const router = Router();

// Default landing page configuration
const defaultLandingConfig = {
  sections: [
    {
      id: "hero",
      name: "Hero Section",
      enabled: true,
      order: 1,
      content: {
        title: "AI-Powered Legal Technology",
        subtitle: "Streamline your legal practice with intelligent automation and comprehensive case management",
        ctaText: "Get Started",
        ctaLink: "/register",
        backgroundType: "gradient",
        showVideo: false,
        heroImage: "/images/legal-tech-hero.jpg"
      },
      styles: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textColor: "#ffffff",
        padding: "80px 0",
        borderRadius: "0"
      },
      responsive: {
        mobile: { padding: "60px 0", fontSize: "32px" },
        tablet: { padding: "70px 0", fontSize: "40px" },
        desktop: { padding: "80px 0", fontSize: "48px" }
      }
    },
    {
      id: "features",
      name: "Features Section", 
      enabled: true,
      order: 2,
      content: {
        title: "Everything You Need for Legal Excellence",
        subtitle: "Comprehensive tools designed for modern legal professionals",
        features: [
          {
            icon: "Scale",
            title: "Legal Analysis",
            description: "AI-powered case analysis and legal research capabilities"
          },
          {
            icon: "FileText", 
            title: "Document Generation",
            description: "Generate professional legal documents with intelligent templates"
          },
          {
            icon: "MessageSquare",
            title: "Legal Assistant", 
            description: "24/7 AI legal assistant for instant guidance and support"
          },
          {
            icon: "Shield",
            title: "Secure & Compliant",
            description: "Enterprise-grade security with full legal compliance"
          }
        ]
      },
      styles: {
        background: "#f8fafc",
        textColor: "#1e293b",
        padding: "80px 0"
      },
      responsive: {
        mobile: { padding: "60px 0" },
        tablet: { padding: "70px 0" }, 
        desktop: { padding: "80px 0" }
      }
    },
    {
      id: "pricing",
      name: "Pricing Section",
      enabled: true,
      order: 3,
      content: {
        title: "Choose Your Plan",
        subtitle: "Flexible pricing for legal professionals of all sizes",
        plans: [
          {
            name: "Starter",
            price: "$29/month",
            features: ["Basic document generation", "5 cases per month", "Email support"],
            ctaText: "Start Free Trial",
            popular: false
          },
          {
            name: "Professional", 
            price: "$99/month",
            features: ["Advanced AI analysis", "Unlimited cases", "Priority support", "Custom templates"],
            ctaText: "Get Started",
            popular: true
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: ["White-label solution", "API access", "Dedicated support", "Custom integrations"],
            ctaText: "Contact Sales",
            popular: false
          }
        ]
      },
      styles: {
        background: "#ffffff",
        textColor: "#1e293b", 
        padding: "80px 0"
      },
      responsive: {
        mobile: { padding: "60px 0" },
        tablet: { padding: "70px 0" },
        desktop: { padding: "80px 0" }
      }
    },
    {
      id: "testimonials",
      name: "Testimonials Section",
      enabled: true,
      order: 4,
      content: {
        title: "Trusted by Legal Professionals",
        subtitle: "See what our clients say about their experience", 
        testimonials: [
          {
            name: "Sarah Johnson",
            title: "Partner, Johnson & Associates",
            content: "This platform has revolutionized how we handle case preparation. The AI insights are incredibly valuable.",
            rating: 5,
            image: "/images/testimonial-1.jpg"
          },
          {
            name: "Michael Chen",
            title: "Solo Practitioner",
            content: "As a solo attorney, this tool has been a game-changer for my practice efficiency.",
            rating: 5,
            image: "/images/testimonial-2.jpg"
          }
        ]
      },
      styles: {
        background: "#f1f5f9",
        textColor: "#1e293b",
        padding: "80px 0"
      },
      responsive: {
        mobile: { padding: "60px 0" },
        tablet: { padding: "70px 0" },
        desktop: { padding: "80px 0" }
      }
    },
    {
      id: "cta",
      name: "Call to Action Section",
      enabled: true,
      order: 5,
      content: {
        title: "Ready to Transform Your Legal Practice?",
        subtitle: "Join thousands of legal professionals who trust our platform",
        ctaText: "Start Your Free Trial",
        ctaLink: "/register",
        secondaryCtaText: "Schedule Demo",
        secondaryCtaLink: "/contact"
      },
      styles: {
        background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
        textColor: "#ffffff",
        padding: "80px 0"
      },
      responsive: {
        mobile: { padding: "60px 0" },
        tablet: { padding: "70px 0" },
        desktop: { padding: "80px 0" }
      }
    }
  ],
  globalStyles: {
    primaryColor: "#1e3a8a",
    secondaryColor: "#3730a3", 
    accentColor: "#f59e0b",
    fontFamily: "'Inter', 'system-ui', 'sans-serif'",
    fontSize: "16px",
    lineHeight: "1.6",
    containerMaxWidth: "1200px",
    customGlobalCSS: ""
  },
  seo: {
    title: "AI-Powered Legal Technology | LegalAI Pro",
    description: "Transform your legal practice with intelligent automation, comprehensive case management, and AI-powered document generation.",
    keywords: ["legal technology", "AI legal assistant", "case management", "document automation", "legal practice software"],
    ogImage: "/images/og-legal-tech.jpg"
  },
  features: {
    liveChat: true,
    cookieBanner: true,
    analytics: true,
    newsletter: true
  }
};

// Landing page configuration schema
const LandingConfigSchema = z.object({
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    order: z.number(),
    content: z.any(),
    styles: z.object({
      background: z.string().optional(),
      textColor: z.string().optional(),
      padding: z.string().optional(),
      margin: z.string().optional(),
      borderRadius: z.string().optional(),
      boxShadow: z.string().optional(),
      customCSS: z.string().optional()
    }),
    responsive: z.object({
      mobile: z.any().optional(),
      tablet: z.any().optional(), 
      desktop: z.any().optional()
    })
  })),
  globalStyles: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    fontFamily: z.string(),
    fontSize: z.string(),
    lineHeight: z.string(),
    containerMaxWidth: z.string(),
    customGlobalCSS: z.string().optional()
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImage: z.string().optional()
  }),
  features: z.object({
    liveChat: z.boolean(),
    cookieBanner: z.boolean(),
    analytics: z.boolean(),
    newsletter: z.boolean()
  })
});

// Get landing page configuration
router.get("/", async (req, res) => {
  try {
    // For now, return default config - in production this would come from database
    res.json(defaultLandingConfig);
  } catch (error) {
    console.error("Error fetching landing config:", error);
    res.status(500).json({ error: "Failed to fetch landing configuration" });
  }
});

// Update landing page configuration  
router.put("/", async (req, res) => {
  try {
    const config = LandingConfigSchema.parse(req.body);
    
    // In production, save to database
    console.log("Landing config updated:", config);
    
    res.json({ 
      success: true, 
      message: "Landing page configuration updated successfully",
      config 
    });
  } catch (error) {
    console.error("Error updating landing config:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid configuration data",
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to update landing configuration" });
  }
});

// Get specific section configuration
router.get("/sections/:sectionId", async (req, res) => {
  try {
    const { sectionId } = req.params;
    const section = defaultLandingConfig.sections.find(s => s.id === sectionId);
    
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }
    
    res.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ error: "Failed to fetch section" });
  }
});

// Update specific section
router.put("/sections/:sectionId", async (req, res) => {
  try {
    const { sectionId } = req.params;
    const sectionData = req.body;
    
    // In production, update section in database
    console.log(`Section ${sectionId} updated:`, sectionData);
    
    res.json({ 
      success: true, 
      message: "Section updated successfully",
      section: sectionData 
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ error: "Failed to update section" });
  }
});

// Preview landing page configuration
router.post("/preview", async (req, res) => {
  try {
    const config = LandingConfigSchema.parse(req.body);
    
    // Generate preview URL or return preview data
    res.json({ 
      success: true,
      previewUrl: `/preview?config=${encodeURIComponent(JSON.stringify(config))}`,
      config
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid configuration data",
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to generate preview" });
  }
});

export default router;