
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Settings, 
  Image, 
  Type, 
  Users, 
  MessageSquare, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Upload,
  Palette,
  Smartphone,
  Monitor,
  Globe,
  Link,
  Hash,
  Download
} from "lucide-react";

interface AdminConfig {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage?: string;
  };
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    enabled: boolean;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    enabled: boolean;
  }>;
  pricing: Array<{
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    popular: boolean;
    enabled: boolean;
  }>;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  htmlCustomizations: {
    headerScripts: string;
    bodyScripts: string;
    footerScripts: string;
    customCSS: string;
    chatWidget: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      position: string;
      showOnDashboard: boolean;
      allowedPages: string[];
      customization: {
        primaryColor: string;
        fontFamily: string;
        borderRadius: string;
        position: string;
      };
    };
    analytics: {
      googleAnalytics: string;
      facebookPixel: string;
      customTracking: string;
    };
  };
}

interface BrandingConfig {
  logo: {
    primaryLogo: string | null;
    secondaryLogo: string | null;
    logoHeight: number;
    logoWidth: number;
    showText: boolean;
    textPosition: string;
  };
  favicon: {
    ico: string | null;
    png16: string | null;
    png32: string | null;
    png192: string | null;
    png512: string | null;
    appleTouchIcon: string | null;
  };
  appIcons: {
    webAppIcon192: string | null;
    webAppIcon512: string | null;
    maskableIcon: string | null;
  };
  brand: {
    companyName: string;
    tagline: string;
    description: string;
    domain: string;
  };
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    backgroundDark: string;
    text: string;
    textDark: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
    fontScale: number;
  };
  theme: {
    borderRadius: string;
    shadowStyle: string;
    animationSpeed: string;
  };
  social: {
    twitter: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  seo: {
    ogImage: string | null;
    twitterImage: string | null;
  };
}

export default function LandingConfig() {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    logo: {
      primaryLogo: null,
      secondaryLogo: null,
      logoHeight: 40,
      logoWidth: 40,
      showText: true,
      textPosition: "right"
    },
    favicon: {
      ico: null,
      png16: null,
      png32: null,
      png192: null,
      png512: null,
      appleTouchIcon: null
    },
    appIcons: {
      webAppIcon192: null,
      webAppIcon512: null,
      maskableIcon: null
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
      shadowStyle: "modern",
      animationSpeed: "normal"
    },
    social: {
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      youtube: ""
    },
    seo: {
      ogImage: null,
      twitterImage: null
    }
  });

  const [config, setConfig] = useState<AdminConfig>({
    hero: {
      title: "Revolutionary AI Legal Assistant",
      subtitle: "Empowering lawyers and pro se litigants with intelligent case management, document generation, and strategic legal analysis",
      ctaText: "Start Your Legal Journey"
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
    },
    htmlCustomizations: {
      headerScripts: "",
      bodyScripts: "",
      footerScripts: "",
      customCSS: "",
      chatWidget: {
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
      },
      analytics: {
        googleAnalytics: "",
        facebookPixel: "",
        customTracking: ""
      }
    }
  });

  const [activeTab, setActiveTab] = useState("hero");
  const [isSaving, setSaving] = useState(false);

  // Load chat widget config and branding config on component mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Load chat widget config
        const chatResponse = await fetch('/api/admin/chat-widget-config');
        const chatData = await chatResponse.json();
        if (chatData.success) {
          setConfig(prev => ({
            ...prev,
            htmlCustomizations: {
              ...prev.htmlCustomizations,
              chatWidget: chatData.config
            }
          }));
        }

        // Load branding config
        const brandingResponse = await fetch('/api/admin/branding-config');
        const brandingData = await brandingResponse.json();
        if (brandingData) {
          setBrandingConfig(brandingData);
        }
      } catch (error) {
        console.error('Failed to load configs:', error);
      }
    };

    loadConfigs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save chat widget config
      const chatResponse = await fetch('/api/admin/chat-widget-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: config.htmlCustomizations.chatWidget
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to save chat widget config');
      }

      // Save branding config
      const brandingResponse = await fetch('/api/admin/branding-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandingConfig),
      });

      if (!brandingResponse.ok) {
        throw new Error('Failed to save branding config');
      }

      // Save landing page config
      const landingResponse = await fetch('/api/admin/landing-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!landingResponse.ok) {
        throw new Error('Failed to save landing config');
      }
      
      console.log("Saving configs:", { config, brandingConfig });
      alert("Configuration saved successfully!");
    } catch (error) {
      console.error('Save failed:', error);
      alert("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      // Simulate file upload - in production, implement actual upload
      const mockUrl = `/uploads/branding/${type}/${Date.now()}-${file.name}`;
      
      return mockUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload image');
    }
  };

  const generateCSSVariables = () => {
    return fetch('/api/admin/branding/css-variables')
      .then(response => response.text());
  };

  const downloadManifest = () => {
    fetch('/api/admin/branding/manifest')
      .then(response => response.json())
      .then(manifest => {
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manifest.json';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: "FileText",
      title: "New Feature",
      description: "Feature description",
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const removeFeature = (id: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now().toString(),
      name: "Client Name",
      role: "Role",
      company: "Company",
      content: "Testimonial content",
      rating: 5,
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
  };

  const removeTestimonial = (id: string) => {
    setConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id)
    }));
  };

  const addPricingPlan = () => {
    const newPlan = {
      id: Date.now().toString(),
      name: "New Plan",
      price: "$0",
      period: "month",
      features: ["Feature 1"],
      popular: false,
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      pricing: [...prev.pricing, newPlan]
    }));
  };

  const removePricingPlan = (id: string) => {
    setConfig(prev => ({
      ...prev,
      pricing: prev.pricing.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Landing Page Configuration</h1>
            <p className="text-gray-600 mt-2">Manage your landing page content and appearance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              HTML/Chat
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Configure the main hero section of your landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="hero-title">Main Title</Label>
                  <Input
                    id="hero-title"
                    value={config.hero.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    placeholder="Enter main title"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={config.hero.subtitle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    placeholder="Enter subtitle"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta">Call to Action Text</Label>
                  <Input
                    id="hero-cta"
                    value={config.hero.ctaText}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      hero: { ...prev.hero, ctaText: e.target.value }
                    }))}
                    placeholder="Enter CTA text"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Section */}
          <TabsContent value="branding">
            <div className="space-y-6">
              {/* Logo Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Logo Management
                  </CardTitle>
                  <CardDescription>Upload and configure your brand logos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Primary Logo</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingConfig.logo.primaryLogo ? (
                          <div className="space-y-2">
                            <img src={brandingConfig.logo.primaryLogo} alt="Primary Logo" className="mx-auto h-16 w-auto" />
                            <Button variant="outline" size="sm" onClick={() => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, primaryLogo: null } }))}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div>
                              <Button variant="outline" className="mb-2">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                              </Button>
                              <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Secondary Logo (Optional)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingConfig.logo.secondaryLogo ? (
                          <div className="space-y-2">
                            <img src={brandingConfig.logo.secondaryLogo} alt="Secondary Logo" className="mx-auto h-16 w-auto" />
                            <Button variant="outline" size="sm" onClick={() => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, secondaryLogo: null } }))}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div>
                              <Button variant="outline" className="mb-2">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                              </Button>
                              <p className="text-xs text-gray-500">For dark backgrounds</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="logo-width">Logo Width (px)</Label>
                      <Input
                        id="logo-width"
                        type="number"
                        value={brandingConfig.logo.logoWidth}
                        onChange={(e) => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, logoWidth: parseInt(e.target.value) || 40 } }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo-height">Logo Height (px)</Label>
                      <Input
                        id="logo-height"
                        type="number"
                        value={brandingConfig.logo.logoHeight}
                        onChange={(e) => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, logoHeight: parseInt(e.target.value) || 40 } }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-position">Text Position</Label>
                      <Select
                        value={brandingConfig.logo.textPosition}
                        onValueChange={(value) => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, textPosition: value } }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Right of Logo</SelectItem>
                          <SelectItem value="bottom">Below Logo</SelectItem>
                          <SelectItem value="none">Logo Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Show Company Name</Label>
                      <p className="text-xs text-gray-600">Display company name next to logo</p>
                    </div>
                    <Switch
                      checked={brandingConfig.logo.showText}
                      onCheckedChange={(checked) => setBrandingConfig(prev => ({ ...prev, logo: { ...prev.logo, showText: checked } }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Favicon & App Icons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Favicon & App Icons
                  </CardTitle>
                  <CardDescription>Configure browser and mobile app icons</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Favicon (16x16)</Label>
                      <div className="mt-2 border rounded-lg p-4 text-center">
                        {brandingConfig.favicon.png16 ? (
                          <div className="space-y-2">
                            <img src={brandingConfig.favicon.png16} alt="Favicon 16x16" className="mx-auto h-4 w-4" />
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload 16x16
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Favicon (32x32)</Label>
                      <div className="mt-2 border rounded-lg p-4 text-center">
                        {brandingConfig.favicon.png32 ? (
                          <div className="space-y-2">
                            <img src={brandingConfig.favicon.png32} alt="Favicon 32x32" className="mx-auto h-8 w-8" />
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload 32x32
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Apple Touch Icon</Label>
                      <div className="mt-2 border rounded-lg p-4 text-center">
                        {brandingConfig.favicon.appleTouchIcon ? (
                          <div className="space-y-2">
                            <img src={brandingConfig.favicon.appleTouchIcon} alt="Apple Touch Icon" className="mx-auto h-12 w-12 rounded-lg" />
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload 180x180
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4">Progressive Web App Icons</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>App Icon (192x192)</Label>
                        <div className="mt-2 border rounded-lg p-4 text-center">
                          {brandingConfig.appIcons.webAppIcon192 ? (
                            <div className="space-y-2">
                              <img src={brandingConfig.appIcons.webAppIcon192} alt="App Icon 192" className="mx-auto h-16 w-16 rounded-lg" />
                              <Button variant="outline" size="sm">Replace</Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload 192x192
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label>App Icon (512x512)</Label>
                        <div className="mt-2 border rounded-lg p-4 text-center">
                          {brandingConfig.appIcons.webAppIcon512 ? (
                            <div className="space-y-2">
                              <img src={brandingConfig.appIcons.webAppIcon512} alt="App Icon 512" className="mx-auto h-16 w-16 rounded-lg" />
                              <Button variant="outline" size="sm">Replace</Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload 512x512
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadManifest}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Manifest.json
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Brand Information
                  </CardTitle>
                  <CardDescription>Configure your brand identity and messaging</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={brandingConfig.brand.companyName}
                        onChange={(e) => setBrandingConfig(prev => ({ ...prev, brand: { ...prev.brand, companyName: e.target.value } }))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        value={brandingConfig.brand.domain}
                        onChange={(e) => setBrandingConfig(prev => ({ ...prev, brand: { ...prev.brand, domain: e.target.value } }))}
                        placeholder="yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={brandingConfig.brand.tagline}
                      onChange={(e) => setBrandingConfig(prev => ({ ...prev, brand: { ...prev.brand, tagline: e.target.value } }))}
                      placeholder="Your brand tagline"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Brand Description</Label>
                    <Textarea
                      id="description"
                      value={brandingConfig.brand.description}
                      onChange={(e) => setBrandingConfig(prev => ({ ...prev, brand: { ...prev.brand, description: e.target.value } }))}
                      placeholder="Describe your brand and what you do"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Color Scheme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Color Scheme
                  </CardTitle>
                  <CardDescription>Configure your brand colors and theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primary-color"
                          type="color"
                          value={brandingConfig.colors.primary}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, primary: e.target.value } }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingConfig.colors.primary}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, primary: e.target.value } }))}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={brandingConfig.colors.secondary}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, secondary: e.target.value } }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingConfig.colors.secondary}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, secondary: e.target.value } }))}
                          placeholder="#64748b"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="accent-color"
                          type="color"
                          value={brandingConfig.colors.accent}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, accent: e.target.value } }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingConfig.colors.accent}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, accent: e.target.value } }))}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="success-color">Success Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="success-color"
                          type="color"
                          value={brandingConfig.colors.success}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, success: e.target.value } }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingConfig.colors.success}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, colors: { ...prev.colors, success: e.target.value } }))}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4">Typography</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="font-family">Primary Font</Label>
                        <Select
                          value={brandingConfig.typography.fontFamily}
                          onValueChange={(value) => setBrandingConfig(prev => ({ ...prev, typography: { ...prev.typography, fontFamily: value } }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Nunito">Nunito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="heading-font">Heading Font</Label>
                        <Select
                          value={brandingConfig.typography.headingFont}
                          onValueChange={(value) => setBrandingConfig(prev => ({ ...prev, typography: { ...prev.typography, headingFont: value } }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                            <SelectItem value="Merriweather">Merriweather</SelectItem>
                            <SelectItem value="Source Serif Pro">Source Serif Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="font-scale">Font Scale</Label>
                        <Input
                          id="font-scale"
                          type="number"
                          step="0.1"
                          min="0.8"
                          max="1.5"
                          value={brandingConfig.typography.fontScale}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, typography: { ...prev.typography, fontScale: parseFloat(e.target.value) || 1.0 } }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-4">Social Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twitter">Twitter/X</Label>
                        <Input
                          id="twitter"
                          value={brandingConfig.social.twitter}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, social: { ...prev.social, twitter: e.target.value } }))}
                          placeholder="https://twitter.com/yourcompany"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={brandingConfig.social.linkedin}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, social: { ...prev.social, linkedin: e.target.value } }))}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={brandingConfig.social.facebook}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, social: { ...prev.social, facebook: e.target.value } }))}
                          placeholder="https://facebook.com/yourcompany"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={brandingConfig.social.instagram}
                          onChange={(e) => setBrandingConfig(prev => ({ ...prev, social: { ...prev.social, instagram: e.target.value } }))}
                          placeholder="https://instagram.com/yourcompany"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => generateCSSVariables().then(css => {
                      const blob = new Blob([css], { type: 'text/css' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'brand-variables.css';
                      a.click();
                      URL.revokeObjectURL(url);
                    })}>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSS Variables
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Testimonials Section */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Testimonials</CardTitle>
                  <CardDescription>Manage customer testimonials and reviews</CardDescription>
                </div>
                <Button onClick={addTestimonial}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {config.testimonials.map((testimonial, index) => (
                    <Card key={testimonial.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={testimonial.enabled}
                            onCheckedChange={(checked) => {
                              const newTestimonials = [...config.testimonials];
                              newTestimonials[index].enabled = checked;
                              setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                            }}
                          />
                          <span className="font-medium">Testimonial {index + 1}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTestimonial(testimonial.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Customer Name</Label>
                          <Input
                            value={testimonial.name}
                            onChange={(e) => {
                              const newTestimonials = [...config.testimonials];
                              newTestimonials[index].name = e.target.value;
                              setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                            }}
                            placeholder="Customer name"
                          />
                        </div>
                        <div>
                          <Label>Role/Title</Label>
                          <Input
                            value={testimonial.role}
                            onChange={(e) => {
                              const newTestimonials = [...config.testimonials];
                              newTestimonials[index].role = e.target.value;
                              setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                            }}
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={testimonial.company}
                            onChange={(e) => {
                              const newTestimonials = [...config.testimonials];
                              newTestimonials[index].company = e.target.value;
                              setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                            }}
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <Select
                            value={testimonial.rating.toString()}
                            onValueChange={(value) => {
                              const newTestimonials = [...config.testimonials];
                              newTestimonials[index].rating = parseInt(value);
                              setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 Stars</SelectItem>
                              <SelectItem value="4">4 Stars</SelectItem>
                              <SelectItem value="3">3 Stars</SelectItem>
                              <SelectItem value="2">2 Stars</SelectItem>
                              <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Testimonial Content</Label>
                        <Textarea
                          value={testimonial.content}
                          onChange={(e) => {
                            const newTestimonials = [...config.testimonials];
                            newTestimonials[index].content = e.target.value;
                            setConfig(prev => ({ ...prev, testimonials: newTestimonials }));
                          }}
                          placeholder="Customer testimonial..."
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>Manage the features section</CardDescription>
                </div>
                <Button onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {config.features.map((feature, index) => (
                    <Card key={feature.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={(checked) => {
                              const newFeatures = [...config.features];
                              newFeatures[index].enabled = checked;
                              setConfig(prev => ({ ...prev, features: newFeatures }));
                            }}
                          />
                          <span className="font-medium">Feature {index + 1}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(feature.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Icon</Label>
                          <Select
                            value={feature.icon}
                            onValueChange={(value) => {
                              const newFeatures = [...config.features];
                              newFeatures[index].icon = value;
                              setConfig(prev => ({ ...prev, features: newFeatures }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scale">Scale</SelectItem>
                              <SelectItem value="FileText">FileText</SelectItem>
                              <SelectItem value="Gavel">Gavel</SelectItem>
                              <SelectItem value="Users">Users</SelectItem>
                              <SelectItem value="Shield">Shield</SelectItem>
                              <SelectItem value="Clock">Clock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...config.features];
                              newFeatures[index].title = e.target.value;
                              setConfig(prev => ({ ...prev, features: newFeatures }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...config.features];
                              newFeatures[index].description = e.target.value;
                              setConfig(prev => ({ ...prev, features: newFeatures }));
                            }}
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Configure contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    value={config.contact.phone}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={config.contact.email}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-address">Physical Address</Label>
                  <Textarea
                    id="contact-address"
                    value={config.contact.address}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value }
                    }))}
                    placeholder="Enter physical address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HTML/Chat Section */}
          <TabsContent value="html">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Widget Configuration</CardTitle>
                  <CardDescription>Configure live chat for your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable Chat Widget</Label>
                      <p className="text-xs text-gray-600">Show live chat on your website</p>
                    </div>
                    <Switch
                      checked={config.htmlCustomizations.chatWidget.enabled}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: {
                          ...prev.htmlCustomizations,
                          chatWidget: { ...prev.htmlCustomizations.chatWidget, enabled: checked }
                        }
                      }))}
                    />
                  </div>

                  {config.htmlCustomizations.chatWidget.enabled && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="chat-provider">Chat Provider</Label>
                          <Select
                            value={config.htmlCustomizations.chatWidget.provider}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              htmlCustomizations: {
                                ...prev.htmlCustomizations,
                                chatWidget: { ...prev.htmlCustomizations.chatWidget, provider: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crisp">Crisp</SelectItem>
                              <SelectItem value="intercom">Intercom</SelectItem>
                              <SelectItem value="zendesk">Zendesk Chat</SelectItem>
                              <SelectItem value="freshchat">Freshchat</SelectItem>
                              <SelectItem value="tawk">Tawk.to</SelectItem>
                              <SelectItem value="custom">Custom HTML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="chat-position">Position</Label>
                          <Select
                            value={config.htmlCustomizations.chatWidget.position}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              htmlCustomizations: {
                                ...prev.htmlCustomizations,
                                chatWidget: { ...prev.htmlCustomizations.chatWidget, position: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="chat-api-key">API Key / Website ID</Label>
                        <Input
                          id="chat-api-key"
                          value={config.htmlCustomizations.chatWidget.apiKey}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            htmlCustomizations: {
                              ...prev.htmlCustomizations,
                              chatWidget: { ...prev.htmlCustomizations.chatWidget, apiKey: e.target.value }
                            }
                          }))}
                          placeholder="Enter your chat provider API key or website ID"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Show on Dashboard</Label>
                          <p className="text-xs text-gray-600">Display chat widget on user dashboard</p>
                        </div>
                        <Switch
                          checked={config.htmlCustomizations.chatWidget.showOnDashboard}
                          onCheckedChange={(checked) => setConfig(prev => ({
                            ...prev,
                            htmlCustomizations: {
                              ...prev.htmlCustomizations,
                              chatWidget: { ...prev.htmlCustomizations.chatWidget, showOnDashboard: checked }
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="chat-pages">Allowed Pages (comma-separated)</Label>
                        <Input
                          id="chat-pages"
                          value={config.htmlCustomizations.chatWidget.allowedPages.join(", ")}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            htmlCustomizations: {
                              ...prev.htmlCustomizations,
                              chatWidget: { 
                                ...prev.htmlCustomizations.chatWidget, 
                                allowedPages: e.target.value.split(", ").filter(p => p.trim())
                              }
                            }
                          }))}
                          placeholder="landing, pricing, contact, dashboard"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom HTML & Scripts</CardTitle>
                  <CardDescription>Add custom HTML, CSS, and JavaScript to your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="header-scripts">Header Scripts</Label>
                    <p className="text-xs text-gray-600 mb-2">Scripts to include in the &lt;head&gt; section</p>
                    <Textarea
                      id="header-scripts"
                      value={config.htmlCustomizations.headerScripts}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: { ...prev.htmlCustomizations, headerScripts: e.target.value }
                      }))}
                      placeholder="<script>...</script> or <link rel='stylesheet'...>"
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-css">Custom CSS</Label>
                    <p className="text-xs text-gray-600 mb-2">Additional CSS styles for your site</p>
                    <Textarea
                      id="custom-css"
                      value={config.htmlCustomizations.customCSS}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: { ...prev.htmlCustomizations, customCSS: e.target.value }
                      }))}
                      placeholder=".custom-class { color: #333; }"
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="footer-scripts">Footer Scripts</Label>
                    <p className="text-xs text-gray-600 mb-2">Scripts to include before &lt;/body&gt;</p>
                    <Textarea
                      id="footer-scripts"
                      value={config.htmlCustomizations.footerScripts}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: { ...prev.htmlCustomizations, footerScripts: e.target.value }
                      }))}
                      placeholder="<script>...</script>"
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Tracking</CardTitle>
                  <CardDescription>Configure tracking codes and analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="google-analytics">Google Analytics Tracking ID</Label>
                    <Input
                      id="google-analytics"
                      value={config.htmlCustomizations.analytics.googleAnalytics}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: {
                          ...prev.htmlCustomizations,
                          analytics: { ...prev.htmlCustomizations.analytics, googleAnalytics: e.target.value }
                        }
                      }))}
                      placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                    <Input
                      id="facebook-pixel"
                      value={config.htmlCustomizations.analytics.facebookPixel}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: {
                          ...prev.htmlCustomizations,
                          analytics: { ...prev.htmlCustomizations.analytics, facebookPixel: e.target.value }
                        }
                      }))}
                      placeholder="1234567890123456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-tracking">Custom Tracking Code</Label>
                    <Textarea
                      id="custom-tracking"
                      value={config.htmlCustomizations.analytics.customTracking}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        htmlCustomizations: {
                          ...prev.htmlCustomizations,
                          analytics: { ...prev.htmlCustomizations.analytics, customTracking: e.target.value }
                        }
                      }))}
                      placeholder="Additional tracking scripts..."
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Section */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pricing Plans</CardTitle>
                  <CardDescription>Manage subscription pricing plans</CardDescription>
                </div>
                <Button onClick={addPricingPlan}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plan
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {config.pricing.map((plan, index) => (
                    <Card key={plan.id} className={`p-4 ${plan.popular ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={plan.enabled}
                            onCheckedChange={(checked) => {
                              const newPricing = [...config.pricing];
                              newPricing[index].enabled = checked;
                              setConfig(prev => ({ ...prev, pricing: newPricing }));
                            }}
                          />
                          <span className="font-medium">Plan {index + 1}</span>
                          {plan.popular && (
                            <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPricing = [...config.pricing];
                              newPricing[index].popular = !newPricing[index].popular;
                              setConfig(prev => ({ ...prev, pricing: newPricing }));
                            }}
                          >
                            {plan.popular ? "Remove Popular" : "Mark Popular"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePricingPlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Plan Name</Label>
                          <Input
                            value={plan.name}
                            onChange={(e) => {
                              const newPricing = [...config.pricing];
                              newPricing[index].name = e.target.value;
                              setConfig(prev => ({ ...prev, pricing: newPricing }));
                            }}
                            placeholder="Plan name"
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            value={plan.price}
                            onChange={(e) => {
                              const newPricing = [...config.pricing];
                              newPricing[index].price = e.target.value;
                              setConfig(prev => ({ ...prev, pricing: newPricing }));
                            }}
                            placeholder="$99"
                          />
                        </div>
                        <div>
                          <Label>Period</Label>
                          <Select
                            value={plan.period}
                            onValueChange={(value) => {
                              const newPricing = [...config.pricing];
                              newPricing[index].period = value;
                              setConfig(prev => ({ ...prev, pricing: newPricing }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="one-time">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Features (one per line)</Label>
                        <Textarea
                          value={plan.features.join('\n')}
                          onChange={(e) => {
                            const newPricing = [...config.pricing];
                            newPricing[index].features = e.target.value.split('\n').filter(f => f.trim());
                            setConfig(prev => ({ ...prev, pricing: newPricing }));
                          }}
                          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                          rows={4}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Section */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>Configure search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="seo-title">Page Title</Label>
                  <Input
                    id="seo-title"
                    value={config.seo.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value }
                    }))}
                    placeholder="Enter page title"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-description">Meta Description</Label>
                  <Textarea
                    id="seo-description"
                    value={config.seo.description}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value }
                    }))}
                    placeholder="Enter meta description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="seo-keywords"
                    value={config.seo.keywords.join(", ")}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value.split(", ") }
                    }))}
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
