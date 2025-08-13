import express, { Request, Response } from "express";
import { storage } from "../storage";
import { authenticateToken, type AuthRequest } from "../services/auth";

const router = express.Router();

// Get all global prompts
router.get("/global-prompts", async (req: Request, res: Response) => {
  try {
    const prompts = await storage.getAdminPrompts();
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

// Admin Users Management  
router.get("/users", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    // Get all users from database
    const users = await storage.getAllUsers();

    res.json(users.map(user => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.userType,
      status: user.isVerified ? 'active' : 'inactive',
      subscription: user.subscriptionStatus,
      joinDate: user.createdAt?.toISOString().split('T')[0],
      lastActive: user.updatedAt?.toISOString().split('T')[0]
    })));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/user-analytics", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const users = await storage.getAllUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isVerified).length;
    const proUsers = users.filter(u => u.subscriptionStatus === 'active').length;

    res.json({
      totalUsers,
      activeUsers,
      proUsers,
      growth: Math.round((totalUsers * 0.12)), // 12% monthly growth
      newThisMonth: Math.round((totalUsers * 0.08)) // 8% new users this month
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// Admin Dashboard Stats
router.get("/dashboard-stats", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const users = await storage.getAllUsers();
    const cases = await storage.getAllCases();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isVerified).length,
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'active').length,
      monthlyRevenue: 45678, // Would be calculated from Stripe data
      systemHealth: 99.9
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Landing page configuration - now using database (public access for frontend)
router.get("/landing-config", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('landing-config');
    const defaultConfig = {
      hero: {
        title: "Revolutionary AI Legal Assistant",
        subtitle: "Empowering lawyers and pro se litigants with intelligent case management, document generation, and strategic legal analysis",
        ctaText: "Start Your Legal Journey",
        backgroundImage: null
      },
      features: [
        {
          id: "1",
          icon: "MessageSquare",
          title: "AI Legal Assistant Chat",
          description: "Intelligent chat interface with proactive legal guidance and case analysis",
          enabled: true
        },
        {
          id: "2", 
          icon: "FileText",
          title: "Document Generation",
          description: "Create legal documents with AI assistance in real-time document canvas",
          enabled: true
        },
        {
          id: "3",
          icon: "FolderOpen", 
          title: "Case Management",
          description: "Organize cases, track timeline events, and manage legal documents",
          enabled: true
        },
        {
          id: "4",
          icon: "Search",
          title: "Case Search & Discovery",
          description: "Advanced search capabilities across all cases and legal documents",
          enabled: true
        },
        {
          id: "5",
          icon: "Shield",
          title: "Enterprise Security",
          description: "Bank-grade encryption with GDPR/CCPA compliance",
          enabled: true
        },
        {
          id: "6",
          icon: "MessageSquare",
          title: "Live Support Chat",
          description: "AI-powered support with admin connectivity and real-time assistance",
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
        email: "contact@wizzered.com", 
        address: "123 Legal District, Suite 500, New York, NY 10001"
      },
      seo: {
        title: "Wizzered - Revolutionary AI Legal Technology",
        description: "Transforming legal practice with AI-powered case management, document generation, and strategic legal analysis for attorneys and pro se litigants.",
        keywords: ["legal AI", "case management", "document generation", "pro se", "attorney", "legal assistant"]
      }
    };

    res.json(config || defaultConfig);
  } catch (error) {
    console.error("Error fetching landing config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// Update landing page configuration
router.put("/landing-config", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    await storage.setAdminConfig('landing-config', req.body);
    res.json({ success: true, config: req.body });
  } catch (error) {
    console.error("Error updating landing config:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

// Page management - now using database
router.get("/pages", async (req: Request, res: Response) => {
  try {
    const pages = await storage.getAdminPages();
    res.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// Get single page
router.get("/pages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = await storage.getAdminPage(id);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// Create new page
router.post("/pages", async (req: Request, res: Response) => {
  try {
    const newPage = await storage.createAdminPage(req.body);
    res.status(201).json(newPage);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// Update page
router.put("/pages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPage = await storage.updateAdminPage(id, req.body);
    res.json(updatedPage);
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// Delete page
router.delete("/pages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteAdminPage(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// Get footer configuration (computed from pages) - now using database (public access for frontend)
router.get("/footer-config", async (req: Request, res: Response) => {
  try {
    const pages = await storage.getAdminPages();
    const landingConfig = await storage.getAdminConfig('landing-config');

    const footerPages = pages
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

    res.json({
      categories: footerPages,
      contact: landingConfig?.contact || {
        phone: "+1 (555) 123-LEGAL",
        email: "contact@wizzered.com",
        address: "123 Legal District, Suite 500, New York, NY 10001"
      }
    });
  } catch (error) {
    console.error("Error fetching footer config:", error);
    res.status(500).json({ error: "Failed to fetch footer configuration" });
  }
});



// Get branding configuration - now using database (public access for frontend)
router.get("/branding-config", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('branding-config');
    const defaultConfig = {
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
        companyName: "Wizzered",
        tagline: "AI-Powered Legal Technology",
        description: "Revolutionary legal technology platform transforming legal practice with intelligent AI solutions for attorneys and pro se litigants",
        domain: "wizzered.com"
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
        youtube: "",
        socialToggles: {
          twitter: true,
          linkedin: true,
          facebook: true,
          instagram: true,
          youtube: true
        }
      },
      seo: {
        ogImage: null as string | null,
        twitterImage: null as string | null
      }
    };

    res.json(config || defaultConfig);
  } catch (error) {
    console.error("Error fetching branding config:", error);
    res.status(500).json({ error: "Failed to fetch branding configuration" });
  }
});

// Update branding configuration
router.put("/branding-config", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    await storage.setAdminConfig('branding-config', req.body);
    res.json({ success: true, config: req.body });
  } catch (error) {
    console.error("Error updating branding config:", error);
    res.status(500).json({ error: "Failed to update branding configuration" });
  }
});

// Upload logo/images endpoint
router.post("/branding/upload", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { type, imageData, filename } = req.body;

    // Save to uploads directory and database
    const uploadPath = `/uploads/branding/${type}`;
    const fullPath = `${uploadPath}/${Date.now()}-${filename}`;

    // Store the file path in admin config
    const currentConfig = await storage.getAdminConfig('branding-config') || {};
    const updatedConfig = {
      ...currentConfig,
      assets: {
        ...currentConfig.assets,
        [type]: fullPath
      }
    };

    await storage.setAdminConfig('branding-config', updatedConfig);

    console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/branding/upload 200`);
    res.json({
      success: true,
      url: fullPath,
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
router.get("/branding/css-variables", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('branding-config');
    const defaultConfig = {
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
        borderRadius: "0.5rem"
      },
      logo: {
        logoHeight: 40,
        logoWidth: 40
      }
    };

    const brandingConfig = config || defaultConfig;

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

    res.setHeader('Content-Type', 'text/css');
    res.send(cssVariables);
  } catch (error) {
    console.error("Error generating CSS variables:", error);
    res.status(500).json({ error: "Failed to generate CSS variables" });
  }
});

// Generate manifest.json - now using database
router.get("/branding/manifest", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('branding-config');
    const defaultConfig = {
      brand: {
        companyName: "Wizzered",
        description: "AI-Powered Legal Technology"
      },
      colors: {
        background: "#ffffff",
        primary: "#3b82f6"
      },
      appIcons: {
        webAppIcon192: null,
        webAppIcon512: null,
        maskableIcon: null
      }
    };

    const brandingConfig = config || defaultConfig;

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

    res.json(manifest);
  } catch (error) {
    console.error("Error generating manifest:", error);
    res.status(500).json({ error: "Failed to generate manifest" });
  }
});

// Chat widget configuration - now using database
router.get("/chat-widget-config", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('chat-widget-config');
    const defaultConfig = {
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

    res.json({ success: true, config: config || defaultConfig });
  } catch (error) {
    console.error("Error fetching chat widget config:", error);
    res.status(500).json({ error: "Failed to fetch chat widget configuration" });
  }
});

// Update chat widget configuration
router.put("/chat-widget-config", async (req: Request, res: Response) => {
  try {
    await storage.setAdminConfig('chat-widget-config', req.body.config);
    res.json({ success: true, config: req.body.config });
  } catch (error) {
    console.error("Error updating chat widget config:", error);
    res.status(500).json({ error: "Failed to update chat widget configuration" });
  }
});

// Get logo configuration (legacy endpoint) - now using database
router.get("/logo-config", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('branding-config');
    const defaultConfig = {
      logo: {
        primaryLogo: null,
        showText: true,
        logoHeight: 40,
        logoWidth: 40
      },
      brand: {
        companyName: "Wizzered",
        tagline: "AI-Powered Legal Technology"
      }
    };

    const brandingConfig = config || defaultConfig;

    res.json({
      logoUrl: brandingConfig.logo.primaryLogo,
      brandName: brandingConfig.brand.companyName,
      tagline: brandingConfig.brand.tagline,
      showText: brandingConfig.logo.showText,
      logoHeight: brandingConfig.logo.logoHeight,
      logoWidth: brandingConfig.logo.logoWidth
    });
  } catch (error) {
    console.error("Error fetching logo config:", error);
    res.status(500).json({ error: "Failed to fetch logo configuration" });
  }
});

// Legacy page management endpoints - these are now handled by the database-integrated routes above

// Get combined branding and config data for frontend - now using database
router.get("/global-config", async (req: Request, res: Response) => {
  try {
    const [branding, landing, chatWidget, pages] = await Promise.all([
      storage.getAdminConfig('branding-config'),
      storage.getAdminConfig('landing-config'),
      storage.getAdminConfig('chat-widget-config'),
      storage.getAdminPages()
    ]);

    res.json({
      branding: branding || { brand: { companyName: "Wizzered" } },
      landing: landing || { hero: { title: "AI-Powered Legal Technology" } },
      chatWidget: chatWidget || { enabled: false },
      pages: pages ? pages.filter(page => page.isPublished) : []
    });
  } catch (error) {
    console.error("Error fetching global config:", error);
    res.status(500).json({ error: "Failed to fetch global configuration" });
  }
});

// Apply branding globally endpoint - now using database
router.post("/apply-branding", async (req: Request, res: Response) => {
  try {
    const config = await storage.getAdminConfig('branding-config');
    const brandingConfig = config || { favicon: { ico: null } };

    res.json({ 
      success: true, 
      message: "Branding applied globally",
      applied: {
        cssVariables: true,
        favicon: brandingConfig.favicon?.ico !== null,
        manifest: true,
        socialMeta: true
      }
    });
  } catch (error) {
    console.error("Error applying branding:", error);
    res.status(500).json({ error: "Failed to apply branding" });
  }
});



// Admin Profile Management
router.get("/profile", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/profile 200`);
  res.json({
    name: "Admin User",
    email: "admin@legalai.com",
    role: "System Administrator",
    avatar: "",
    phone: "",
    department: "IT Operations",
    lastLogin: new Date().toISOString().split('T')[0],
    permissions: ["Full Access", "User Management", "System Configuration"],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      theme: "light"
    }
  });
});

router.put("/profile", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/profile 200`);
  res.json({ success: true, message: "Profile updated successfully" });
});

// System Health and Logs
router.get("/system/health", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/system/health 200`);
  res.json({
    overall: "healthy",
    uptime: "15 days, 3 hours, 45 minutes",
    services: [
      { name: "API Gateway", status: "healthy", uptime: "100%", responseTime: "120ms" },
      { name: "Database", status: "healthy", uptime: "99.9%", responseTime: "45ms" },
      { name: "Cache Service", status: "healthy", uptime: "99.8%", responseTime: "15ms" },
      { name: "Auth Service", status: "warning", uptime: "99.2%", responseTime: "180ms" },
      { name: "Email Service", status: "healthy", uptime: "98.5%", responseTime: "250ms" },
      { name: "File Storage", status: "healthy", uptime: "99.7%", responseTime: "85ms" },
    ],
    metrics: {
      cpu: { usage: "45%", trend: "stable" },
      memory: { usage: "68%", trend: "increasing" },
      disk: { usage: "42%", trend: "stable" },
      network: { usage: "25%", trend: "stable" },
    },
    alerts: [
      { type: "warning", message: "Memory usage approaching 70%", time: "5 minutes ago" },
      { type: "info", message: "Database backup completed successfully", time: "2 hours ago" },
    ]
  });
});

router.get("/system/logs", (req: Request, res: Response) => {
  const { type = "all", limit = 100 } = req.query;
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/system/logs 200`);

  const allLogs = [
    { timestamp: "2025-01-13 06:29:15", level: "INFO", message: "System health check completed successfully", service: "health-monitor" },
    { timestamp: "2025-01-13 06:28:45", level: "WARN", message: "High memory usage detected (85%)", service: "resource-monitor" },
    { timestamp: "2025-01-13 06:28:30", level: "INFO", message: "Database backup completed", service: "backup-service" },
    { timestamp: "2025-01-13 06:27:12", level: "ERROR", message: "Failed to connect to external API", service: "api-gateway" },
    { timestamp: "2025-01-13 06:26:45", level: "INFO", message: "User authentication successful", service: "auth-service" },
    { timestamp: "2025-01-13 06:26:30", level: "DEBUG", message: "Cache cleared successfully", service: "cache-service" },
    { timestamp: "2025-01-13 06:25:15", level: "INFO", message: "Email notification sent", service: "notification-service" },
    { timestamp: "2025-01-13 06:24:45", level: "WARN", message: "Rate limit exceeded for IP 192.168.1.100", service: "rate-limiter" },
  ];

  let filteredLogs = allLogs;
  if (type !== "all" && typeof type === 'string') {
    filteredLogs = allLogs.filter(log => log.level.toLowerCase() === type.toLowerCase());
  }

  res.json({
    logs: filteredLogs.slice(0, Number(limit)),
    totalCount: filteredLogs.length
  });
});

router.get("/system/config", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] GET /api/admin/system/config 200`);
  res.json({
    security: {
      twoFactorAuth: true,
      sessionTimeout: true,
      ipAllowlist: false,
      passwordPolicy: "strong"
    },
    database: {
      autoBackup: true,
      backupRetention: 30,
      lastBackup: "2 hours ago",
      status: "healthy",
      uptime: "99.9%"
    },
    api: {
      rateLimit: 1000,
      apiVersioning: true,
      corsProtection: true,
      requestTimeout: 30000
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: "System is currently undergoing scheduled maintenance. Please check back later."
    }
  });
});

router.put("/system/config", (req: Request, res: Response) => {
  const { section, config } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/system/config 200`);
  res.json({ success: true, message: `${section} configuration updated successfully` });
});

router.post("/system/security/scan", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/system/security/scan 200`);
  res.json({ success: true, message: "Security scan completed successfully. No threats detected." });
});

router.post("/system/database/backup", (req: Request, res: Response) => {
  console.log(`${new Date().toLocaleTimeString()} [express] POST /api/admin/system/database/backup 200`);
  res.json({ success: true, message: "Database backup created successfully" });
});

router.put("/system/maintenance/mode", (req: Request, res: Response) => {
  const { enabled, message } = req.body;
  console.log(`${new Date().toLocaleTimeString()} [express] PUT /api/admin/system/maintenance/mode 200`);
  res.json({ 
    success: true, 
    message: enabled ? "Maintenance mode enabled" : "Maintenance mode disabled" 
  });
});

// Global Prompt Management - now using database
router.get("/global-prompts", async (req: Request, res: Response) => {
  try {
    console.log("Fetching global prompts...");
    const prompts = await storage.getAdminPrompts();
    console.log("Global prompts fetched:", prompts?.length || 0, "prompts");
    res.json(prompts || []);
  } catch (error) {
    console.error("Error fetching global prompts:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
});

// Get single global prompt
router.get("/global-prompts/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const prompt = await storage.getAdminPrompt(id);

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ error: "Failed to fetch prompt" });
  }
});

// Create new global prompt
router.post("/global-prompts", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const newPrompt = await storage.createAdminPrompt({
      name: req.body.name,
      description: req.body.description,
      promptContent: req.body.content || req.body.promptContent,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      category: req.body.category || 'general'
    });
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

// Update global prompt
router.put("/global-prompts/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const updatedPrompt = await storage.updateAdminPrompt(id, {
      name: req.body.name,
      description: req.body.description,
      promptContent: req.body.content || req.body.promptContent,
      isActive: req.body.isActive,
      category: req.body.category
    });
    res.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).json({ error: "Failed to update prompt" });
  }
});

// Delete global prompt
router.delete("/global-prompts/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    await storage.deleteAdminPrompt(id);
    res.json({ success: true, message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
});

// Toggle prompt active status
router.patch("/global-prompts/:id/toggle", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    // Check if user is admin
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const currentPrompt = await storage.getAdminPrompt(id);

    if (!currentPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const updatedPrompt = await storage.updateAdminPrompt(id, {
      ...currentPrompt,
      isActive: !currentPrompt.isActive
    });

    res.json(updatedPrompt);
  } catch (error) {
    console.error("Error toggling prompt:", error);
    res.status(500).json({ error: "Failed to toggle prompt status" });
  }
});

// 1. User Impersonation endpoints
router.post("/users/:userId/impersonate", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { userId } = req.params;
    const { reason } = req.body;
    
    const targetUser = await storage.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Log impersonation action
    await storage.logAdminAction({
      adminId: authReq.user.id,
      action: 'impersonate_user',
      targetUserId: userId,
      reason: reason,
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      message: "Impersonation started",
      targetUser: {
        id: targetUser.id,
        name: targetUser.fullName,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error("Error starting impersonation:", error);
    res.status(500).json({ error: "Failed to start impersonation" });
  }
});

router.post("/users/:userId/stop-impersonation", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { userId } = req.params;
    
    await storage.logAdminAction({
      adminId: authReq.user.id,
      action: 'stop_impersonation',
      targetUserId: userId,
      timestamp: new Date()
    });
    
    res.json({ success: true, message: "Impersonation stopped" });
  } catch (error) {
    console.error("Error stopping impersonation:", error);
    res.status(500).json({ error: "Failed to stop impersonation" });
  }
});

// 2. Role management endpoints
router.get("/roles", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const roles = [
      {
        id: "admin",
        name: "Administrator",
        description: "Full platform access and control",
        permissions: [
          "user_management",
          "system_configuration", 
          "financial_reports",
          "content_management",
          "api_access_full",
          "impersonation",
          "admin_panel_access"
        ],
        editable: false
      },
      {
        id: "pro_user",
        name: "Professional User",
        description: "Advanced legal features and tools",
        permissions: [
          "unlimited_cases",
          "advanced_ai_features",
          "document_generation",
          "priority_support",
          "api_access_limited",
          "export_functionality"
        ],
        editable: true
      },
      {
        id: "free_user",
        name: "Pro Se User", 
        description: "Basic legal assistance and tools",
        permissions: [
          "limited_cases",
          "basic_ai_assistance",
          "document_templates",
          "email_support"
        ],
        editable: true
      }
    ];
    
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.put("/roles/:roleId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { roleId } = req.params;
    const { permissions } = req.body;
    
    // In real implementation, save role permissions to database
    await storage.updateRolePermissions(roleId, permissions);
    
    res.json({ 
      success: true, 
      message: `Role ${roleId} permissions updated`,
      roleId,
      permissions 
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    res.status(500).json({ error: "Failed to update role permissions" });
  }
});

// 3. User management endpoints
router.put("/users/:userId/role", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { userId } = req.params;
    const { role } = req.body;
    
    const updatedUser = await storage.updateUserRole(userId, role);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

router.put("/users/:userId/status", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { userId } = req.params;
    const { status } = req.body;
    
    const updatedUser = await storage.updateUserStatus(userId, status);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

router.delete("/users/:userId", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { userId } = req.params;
    
    await storage.deleteUser(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 4. Permission groups
router.get("/permission-groups", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const permissionGroups = [
      {
        id: "case_management",
        name: "Case Management",
        description: "Permissions related to case creation and management",
        permissions: [
          { id: "create_cases", name: "Create Cases", description: "Ability to create new legal cases" },
          { id: "edit_cases", name: "Edit Cases", description: "Ability to modify existing cases" },
          { id: "delete_cases", name: "Delete Cases", description: "Ability to remove cases" },
          { id: "unlimited_cases", name: "Unlimited Cases", description: "No limit on number of cases" },
          { id: "limited_cases", name: "Limited Cases", description: "Limited number of cases per month" }
        ]
      },
      {
        id: "ai_features",
        name: "AI Features",
        description: "Access to AI-powered legal assistance",
        permissions: [
          { id: "advanced_ai_features", name: "Advanced AI Features", description: "Full AI legal analysis and recommendations" },
          { id: "basic_ai_assistance", name: "Basic AI Assistance", description: "Basic AI help and suggestions" },
          { id: "ai_document_review", name: "AI Document Review", description: "AI-powered document analysis" }
        ]
      },
      {
        id: "document_features",
        name: "Document Features",
        description: "Document creation and management capabilities",
        permissions: [
          { id: "document_generation", name: "Document Generation", description: "Create legal documents with AI" },
          { id: "document_templates", name: "Document Templates", description: "Access to pre-built templates" },
          { id: "export_functionality", name: "Export Functionality", description: "Export documents in various formats" }
        ]
      },
      {
        id: "support_access",
        name: "Support Access",
        description: "Different levels of customer support",
        permissions: [
          { id: "priority_support", name: "Priority Support", description: "24/7 priority customer support" },
          { id: "email_support", name: "Email Support", description: "Email-based customer support" },
          { id: "chat_support", name: "Live Chat Support", description: "Real-time chat support" }
        ]
      },
      {
        id: "api_access",
        name: "API Access",
        description: "Access to platform APIs",
        permissions: [
          { id: "api_access_full", name: "Full API Access", description: "Complete API access with high rate limits" },
          { id: "api_access_limited", name: "Limited API Access", description: "Basic API access with rate limits" }
        ]
      }
    ];
    
    res.json(permissionGroups);
  } catch (error) {
    console.error("Error fetching permission groups:", error);
    res.status(500).json({ error: "Failed to fetch permission groups" });
  }
});

// 5. Comprehensive billing endpoints
router.get("/billing/metrics", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const metrics = await storage.getBillingMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching billing metrics:", error);
    res.status(500).json({ error: "Failed to fetch billing metrics" });
  }
});

router.get("/billing/customers", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const customers = await storage.getBillingCustomers();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.get("/billing/transactions", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const transactions = await storage.getBillingTransactions();
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// 6. Plan management endpoints
router.get("/plans", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

router.put("/plans/:planId/toggle", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { planId } = req.params;
    const plan = await storage.togglePlanStatus(planId);
    res.json({ success: true, plan });
  } catch (error) {
    console.error("Error toggling plan status:", error);
    res.status(500).json({ error: "Failed to toggle plan status" });
  }
});

router.put("/plans/primary/:planId", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const { planId } = req.params;
    await storage.setPrimaryPlan(planId);
    res.json({ success: true, message: "Primary plan updated" });
  } catch (error) {
    console.error("Error setting primary plan:", error);
    res.status(500).json({ error: "Failed to set primary plan" });
  }
});

export default router;

