
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

// Page management state
let pageManagement = {
  pages: [
    {
      id: "1",
      title: "Terms and Conditions",
      slug: "terms-and-conditions",
      content: "# Terms and Conditions\n\nLast updated: [DATE]\n\n## 1. Acceptance of Terms\n\nBy accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
      metaDescription: "Terms and conditions for using LegalAI Pro platform and services.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "terms"
    },
    {
      id: "2",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "# Privacy Policy\n\nLast updated: [DATE]\n\n## Information We Collect\n\nWe collect information you provide directly to us...",
      metaDescription: "Privacy policy explaining how LegalAI Pro collects, uses, and protects your personal information.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "privacy"
    },
    {
      id: "3",
      title: "About Us",
      slug: "about",
      content: "# About LegalAI Pro\n\n## Our Mission\n\nLegalAI Pro is dedicated to democratizing access to legal assistance...",
      metaDescription: "Learn about LegalAI Pro's mission to democratize legal assistance through AI technology.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Company",
      lastModified: "2024-01-10",
      type: "about"
    }
  ]
};

// Get all pages
router.get("/pages", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/pages 200`);
  res.json(pageManagement.pages);
});

// Get single page
router.get("/pages/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const page = pageManagement.pages.find(p => p.id === id);
  
  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }
  
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/pages/${id} 200`);
  res.json(page);
});

// Create new page
router.post("/pages", (req: Request, res: Response) => {
  try {
    const newPage = {
      id: Date.now().toString(),
      ...req.body,
      lastModified: new Date().toISOString().split('T')[0],
      type: req.body.type || "custom"
    };
    
    pageManagement.pages.push(newPage);
    console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/pages 201`);
    res.status(201).json(newPage);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// Update page
router.put("/pages/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pageIndex = pageManagement.pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) {
      return res.status(404).json({ error: "Page not found" });
    }
    
    pageManagement.pages[pageIndex] = {
      ...pageManagement.pages[pageIndex],
      ...req.body,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/pages/${id} 200`);
    res.json(pageManagement.pages[pageIndex]);
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// Delete page
router.delete("/pages/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pageIndex = pageManagement.pages.findIndex(p => p.id === id);
    
    if (pageIndex === -1) {
      return res.status(404).json({ error: "Page not found" });
    }
    
    // Prevent deletion of core pages
    const page = pageManagement.pages[pageIndex];
    if (page.type === 'terms' || page.type === 'privacy') {
      return res.status(400).json({ error: "Cannot delete core pages" });
    }
    
    pageManagement.pages.splice(pageIndex, 1);
    console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/pages/${id} 200`);
    res.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// Get footer configuration (computed from pages)
router.get("/footer-config", (req: Request, res: Response) => {
  const footerPages = pageManagement.pages
    .filter(page => page.showInFooter && page.isPublished)
    .reduce((acc, page) => {
      if (!acc[page.footerCategory]) {
        acc[page.footerCategory] = [];
      }
      acc[page.footerCategory].push({
        title: page.title,
        slug: page.slug,
        url: `/${page.slug}`
      });
      return acc;
    }, {} as Record<string, Array<{title: string, slug: string, url: string}>>);

  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/footer-config 200`);
  res.json({
    categories: footerPages,
    contact: landingConfig.contact
  });
});

// Branding configuration state
let brandingConfig = {
  logo: {
    primaryLogo: null as string | null,
    secondaryLogo: null as string | null,
    logoHeight: 40,
    logoWidth: 40,
    showText: true,
    textPosition: "right" // "right", "bottom", "none"
  },
  favicon: {
    ico: null as string | null,
    png16: null as string | null,
    png32: null as string | null,
    png192: null as string | null,
    png512: null as string | null,
    appleTouchIcon: null as string | null
  },
  appIcons: {
    webAppIcon192: null as string | null,
    webAppIcon512: null as string | null,
    maskableIcon: null as string | null
  },
  brand: {
    companyName: "LegalAI Pro",
    tagline: "AI-Powered Legal Excellence",
    description: "Empowering lawyers and pro se litigants with intelligent case management, document generation, and strategic legal analysis",
    domain: "legalai.pro"
  },
  colors: {
    primary: "#3b82f6",
    primaryDark: "#1d4ed8",
    primaryLight: "#60a5fa",
    secondary: "#64748b",
    accent: "#f59e0b",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    background: "#ffffff",
    backgroundDark: "#0f172a",
    text: "#1e293b",
    textDark: "#f8fafc",
    muted: "#64748b",
    border: "#e2e8f0"
  },
  typography: {
    fontFamily: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    fontScale: 1.0
  },
  theme: {
    borderRadius: "0.5rem",
    shadowStyle: "modern", // "modern", "classic", "minimal"
    animationSpeed: "normal" // "slow", "normal", "fast"
  },
  social: {
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    youtube: ""
  },
  seo: {
    ogImage: null as string | null,
    twitterImage: null as string | null
  }
};

// Get branding configuration
router.get("/branding-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/branding-config 200`);
  res.json(brandingConfig);
});

// Update branding configuration
router.put("/branding-config", (req: Request, res: Response) => {
  try {
    brandingConfig = { ...brandingConfig, ...req.body };
    console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/branding-config 200`);
    res.json({ success: true, config: brandingConfig });
  } catch (error) {
    console.error("Error updating branding config:", error);
    res.status(500).json({ error: "Failed to update branding configuration" });
  }
});

// Upload logo/images endpoint
router.post("/branding/upload", (req: Request, res: Response) => {
  try {
    const { type, imageData, filename } = req.body;
    
    // Simulate file upload - in production, you'd save to cloud storage
    const mockUrl = `/uploads/branding/${type}/${Date.now()}-${filename}`;
    
    console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/branding/upload 200`);
    res.json({
      success: true,
      url: mockUrl,
      type,
      filename,
      size: imageData ? Math.floor(imageData.length * 0.75) : 1024,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error uploading branding asset:", error);
    res.status(500).json({ error: "Failed to upload asset" });
  }
});

// Generate CSS variables endpoint
router.get("/branding/css-variables", (req: Request, res: Response) => {
  const cssVariables = `
:root {
  /* Brand Colors */
  --brand-primary: ${brandingConfig.colors.primary};
  --brand-primary-dark: ${brandingConfig.colors.primaryDark};
  --brand-primary-light: ${brandingConfig.colors.primaryLight};
  --brand-secondary: ${brandingConfig.colors.secondary};
  --brand-accent: ${brandingConfig.colors.accent};
  --brand-success: ${brandingConfig.colors.success};
  --brand-warning: ${brandingConfig.colors.warning};
  --brand-error: ${brandingConfig.colors.error};
  --brand-background: ${brandingConfig.colors.background};
  --brand-text: ${brandingConfig.colors.text};
  --brand-muted: ${brandingConfig.colors.muted};
  --brand-border: ${brandingConfig.colors.border};
  
  /* Typography */
  --brand-font-family: '${brandingConfig.typography.fontFamily}', sans-serif;
  --brand-heading-font: '${brandingConfig.typography.headingFont}', sans-serif;
  --brand-body-font: '${brandingConfig.typography.bodyFont}', sans-serif;
  --brand-font-scale: ${brandingConfig.typography.fontScale};
  
  /* Theme */
  --brand-border-radius: ${brandingConfig.theme.borderRadius};
  
  /* Logo */
  --brand-logo-height: ${brandingConfig.logo.logoHeight}px;
  --brand-logo-width: ${brandingConfig.logo.logoWidth}px;
}

/* Dark theme overrides */
.dark {
  --brand-background: ${brandingConfig.colors.backgroundDark};
  --brand-text: ${brandingConfig.colors.textDark};
}

/* Branding utilities */
.brand-primary { color: var(--brand-primary); }
.brand-bg-primary { background-color: var(--brand-primary); }
.brand-border-primary { border-color: var(--brand-primary); }
.brand-font { font-family: var(--brand-font-family); }
.brand-heading { font-family: var(--brand-heading-font); }
.brand-logo-size { 
  height: var(--brand-logo-height); 
  width: var(--brand-logo-width); 
}
`;

  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/branding/css-variables 200`);
  res.setHeader('Content-Type', 'text/css');
  res.send(cssVariables);
});

// Generate manifest.json
router.get("/branding/manifest", (req: Request, res: Response) => {
  const manifest = {
    name: brandingConfig.brand.companyName,
    short_name: brandingConfig.brand.companyName.replace(/\s+/g, ''),
    description: brandingConfig.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: brandingConfig.colors.background,
    theme_color: brandingConfig.colors.primary,
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      brandingConfig.appIcons.webAppIcon192 && {
        src: brandingConfig.appIcons.webAppIcon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      brandingConfig.appIcons.webAppIcon512 && {
        src: brandingConfig.appIcons.webAppIcon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      brandingConfig.appIcons.maskableIcon && {
        src: brandingConfig.appIcons.maskableIcon,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ].filter(Boolean),
    categories: ["business", "productivity", "utilities"]
  };

  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/branding/manifest 200`);
  res.json(manifest);
});

// Get logo configuration (legacy endpoint)
router.get("/logo-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/logo-config 200`);
  res.json({
    logoUrl: brandingConfig.logo.primaryLogo,
    brandName: brandingConfig.brand.companyName,
    tagline: brandingConfig.brand.tagline,
    showText: brandingConfig.logo.showText,
    logoHeight: brandingConfig.logo.logoHeight,
    logoWidth: brandingConfig.logo.logoWidth
  });
});

// Page management endpoints
router.get("/pages", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/pages 200`);
  
  const pages = [
    {
      id: "1",
      title: "Terms and Conditions",
      slug: "terms-and-conditions",
      content: "# Terms and Conditions\n\nLast updated: [DATE]\n\n## 1. Acceptance of Terms...",
      metaDescription: "Terms and conditions for using LegalAI Pro platform and services.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "terms"
    },
    {
      id: "2", 
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "# Privacy Policy\n\nLast updated: [DATE]\n\n## Information We Collect...",
      metaDescription: "Privacy policy explaining how LegalAI Pro collects, uses, and protects your personal information.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "privacy"
    }
  ];

  res.json(pages);
});

router.post("/pages", (req: Request, res: Response) => {
  const page = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/pages 201`);
  res.status(201).json({ ...page, id: Date.now().toString() });
});

router.put("/pages/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const page = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/pages/${id} 200`);
  res.json({ ...page, id });
});

router.delete("/pages/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`${new Date().toLocaleTimeString()} [express] DELETE /api/admin/pages/${id} 200`);
  res.json({ success: true });
});

export default router;
