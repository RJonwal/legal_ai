
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

// Chat widget configuration state
let chatWidgetConfig = {
  enabled: false,
  provider: "crisp",
  apiKey: "",
  position: "bottom-right",
  showOnDashboard: false,
  allowedPages: ["landing", "pricing", "contact"],
  customization: {
    primaryColor: "#3B82F6",
    fontFamily: "Inter",
    borderRadius: "8px",
    position: "bottom-right"
  }
};

// Get chat widget configuration
router.get("/chat-widget-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/chat-widget-config 200`);
  res.json({ success: true, config: chatWidgetConfig });
});

// Update chat widget configuration
router.put("/chat-widget-config", (req: Request, res: Response) => {
  try {
    chatWidgetConfig = { ...chatWidgetConfig, ...req.body.config };
    console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/chat-widget-config 200`);
    res.json({ success: true, config: chatWidgetConfig });
  } catch (error) {
    console.error("Error updating chat widget config:", error);
    res.status(500).json({ error: "Failed to update chat widget configuration" });
  }
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

// Get combined branding and config data for frontend
router.get("/global-config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/global-config 200`);
  res.json({
    branding: brandingConfig,
    landing: landingConfig,
    chatWidget: chatWidgetConfig,
    pages: pageManagement.pages.filter(page => page.isPublished)
  });
});

// Apply branding globally endpoint
router.post("/apply-branding", (req: Request, res: Response) => {
  try {
    // This endpoint would typically update global stylesheets, favicon links, etc.
    // For now, we'll just return success
    console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/apply-branding 200`);
    res.json({ 
      success: true, 
      message: "Branding applied globally",
      applied: {
        cssVariables: true,
        favicon: brandingConfig.favicon.ico !== null,
        manifest: true,
        socialMeta: true
      }
    });
  } catch (error) {
    console.error("Error applying branding:", error);
    res.status(500).json({ error: "Failed to apply branding globally" });
  }
});

// Attorney Directory Management
let attorneyDirectory = {
  attorneys: [
    {
      id: "1",
      userId: 1,
      fullName: "Sarah Johnson",
      email: "sarah@johnsonlaw.com",
      barNumber: "BAR123456",
      firmName: "Johnson & Associates",
      practiceAreas: ["Family Law", "Divorce", "Child Custody"],
      yearsOfExperience: 8,
      address: "123 Legal St, Suite 200",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "(555) 123-4567",
      website: "www.johnsonlaw.com",
      bio: "Experienced family law attorney dedicated to protecting clients' rights and interests.",
      hourlyRate: 35000, // $350.00
      availableForProSe: true,
      maxProSeClients: 5,
      currentProSeClients: 2,
      isVerified: true,
      subscription: "premium",
      rating: 475, // 4.75 stars
      reviewCount: 23,
      isActive: true,
      joinedAt: "2024-01-15",
      connections: ["3", "7"]
    },
    {
      id: "2",
      userId: 2,
      fullName: "Michael Chen",
      email: "mchen@chenlegal.com",
      barNumber: "BAR789012",
      firmName: "Chen Legal Services",
      practiceAreas: ["Immigration", "Business Law"],
      yearsOfExperience: 12,
      address: "456 Business Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      phone: "(555) 987-6543",
      website: "www.chenlegal.com",
      bio: "Immigration and business law specialist with extensive experience in complex cases.",
      hourlyRate: 42500, // $425.00
      availableForProSe: true,
      maxProSeClients: 3,
      currentProSeClients: 1,
      isVerified: true,
      subscription: "basic",
      rating: 495, // 4.95 stars
      reviewCount: 47,
      isActive: true,
      joinedAt: "2024-02-01",
      connections: ["5"]
    }
  ],
  proSeUsers: [
    {
      id: "3",
      userId: 3,
      fullName: "Robert Smith",
      email: "robert.smith@email.com",
      caseType: "Divorce",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      connectedAttorneyId: "1",
      connectionStatus: "active",
      connectedAt: "2024-10-15",
      needsAttorney: false,
      preferredPracticeAreas: ["Family Law", "Divorce"]
    },
    {
      id: "4",
      userId: 4,
      fullName: "Maria Garcia",
      email: "maria.garcia@email.com",
      caseType: "Immigration",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      connectedAttorneyId: null,
      connectionStatus: "seeking",
      needsAttorney: true,
      preferredPracticeAreas: ["Immigration", "Citizenship"]
    }
  ]
};

// Get all attorneys
router.get("/attorneys", (req: Request, res: Response) => {
  const { search, state, zipCode, practiceArea, availability } = req.query;
  
  let filteredAttorneys = attorneyDirectory.attorneys;
  
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredAttorneys = filteredAttorneys.filter(attorney => 
      attorney.fullName.toLowerCase().includes(searchTerm) ||
      attorney.firmName.toLowerCase().includes(searchTerm) ||
      attorney.practiceAreas.some(area => area.toLowerCase().includes(searchTerm))
    );
  }
  
  if (state) {
    filteredAttorneys = filteredAttorneys.filter(attorney => attorney.state === state);
  }
  
  if (zipCode) {
    filteredAttorneys = filteredAttorneys.filter(attorney => attorney.zipCode === zipCode);
  }
  
  if (practiceArea) {
    filteredAttorneys = filteredAttorneys.filter(attorney => 
      attorney.practiceAreas.includes(practiceArea.toString())
    );
  }
  
  if (availability === 'available') {
    filteredAttorneys = filteredAttorneys.filter(attorney => 
      attorney.availableForProSe && attorney.currentProSeClients < attorney.maxProSeClients
    );
  }
  
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/attorneys 200`);
  res.json(filteredAttorneys);
});

// Get attorney statistics
router.get("/attorneys/stats", (req: Request, res: Response) => {
  const stats = {
    total: attorneyDirectory.attorneys.length,
    verified: attorneyDirectory.attorneys.filter(a => a.isVerified).length,
    available: attorneyDirectory.attorneys.filter(a => a.availableForProSe && a.currentProSeClients < a.maxProSeClients).length,
    premium: attorneyDirectory.attorneys.filter(a => a.subscription === 'premium').length,
    averageRating: attorneyDirectory.attorneys.reduce((sum, a) => sum + a.rating, 0) / attorneyDirectory.attorneys.length / 100,
    totalConnections: attorneyDirectory.attorneys.reduce((sum, a) => sum + a.connections.length, 0),
    totalProSeUsers: attorneyDirectory.proSeUsers.length,
    activeConnections: attorneyDirectory.proSeUsers.filter(u => u.connectionStatus === 'active').length,
    seekingConnections: attorneyDirectory.proSeUsers.filter(u => u.connectionStatus === 'seeking').length
  };
  
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/attorneys/stats 200`);
  res.json(stats);
});

// Get all pro se users
router.get("/pro-se-users", (req: Request, res: Response) => {
  const { search, state, needsAttorney } = req.query;
  
  let filteredUsers = attorneyDirectory.proSeUsers;
  
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.caseType.toLowerCase().includes(searchTerm)
    );
  }
  
  if (state) {
    filteredUsers = filteredUsers.filter(user => user.state === state);
  }
  
  if (needsAttorney === 'true') {
    filteredUsers = filteredUsers.filter(user => user.needsAttorney);
  }
  
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/pro-se-users 200`);
  res.json(filteredUsers);
});

// Connect attorney to pro se user
router.post("/attorney-connections", (req: Request, res: Response) => {
  try {
    const { attorneyId, proSeUserId, connectionType = "consultation" } = req.body;
    
    // Find the attorney and pro se user
    const attorneyIndex = attorneyDirectory.attorneys.findIndex(a => a.id === attorneyId);
    const proSeIndex = attorneyDirectory.proSeUsers.findIndex(u => u.id === proSeUserId);
    
    if (attorneyIndex === -1 || proSeIndex === -1) {
      return res.status(404).json({ error: "Attorney or Pro Se user not found" });
    }
    
    const attorney = attorneyDirectory.attorneys[attorneyIndex];
    const proSeUser = attorneyDirectory.proSeUsers[proSeIndex];
    
    // Check if attorney is available
    if (attorney.currentProSeClients >= attorney.maxProSeClients) {
      return res.status(400).json({ error: "Attorney has reached maximum client capacity" });
    }
    
    // Update connections
    attorney.connections.push(proSeUserId);
    attorney.currentProSeClients += 1;
    
    proSeUser.connectedAttorneyId = attorneyId;
    proSeUser.connectionStatus = "active";
    proSeUser.connectedAt = new Date().toISOString().split('T')[0];
    proSeUser.needsAttorney = false;
    
    const connection = {
      id: Date.now().toString(),
      attorneyId,
      proSeUserId,
      connectionType,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/attorney-connections 201`);
    res.status(201).json({ success: true, connection });
  } catch (error) {
    console.error("Error creating attorney connection:", error);
    res.status(500).json({ error: "Failed to create connection" });
  }
});

// Update attorney status
router.put("/attorneys/:id/status", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, availableForProSe } = req.body;
    
    const attorneyIndex = attorneyDirectory.attorneys.findIndex(a => a.id === id);
    if (attorneyIndex === -1) {
      return res.status(404).json({ error: "Attorney not found" });
    }
    
    attorneyDirectory.attorneys[attorneyIndex] = {
      ...attorneyDirectory.attorneys[attorneyIndex],
      isActive: isActive !== undefined ? isActive : attorneyDirectory.attorneys[attorneyIndex].isActive,
      availableForProSe: availableForProSe !== undefined ? availableForProSe : attorneyDirectory.attorneys[attorneyIndex].availableForProSe
    };
    
    console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/attorneys/${id}/status 200`);
    res.json({ success: true, attorney: attorneyDirectory.attorneys[attorneyIndex] });
  } catch (error) {
    console.error("Error updating attorney status:", error);
    res.status(500).json({ error: "Failed to update attorney status" });
  }
});

export default router;
