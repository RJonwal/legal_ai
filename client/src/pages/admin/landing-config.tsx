
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
  MapPin
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
}

export default function LandingConfig() {
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
    }
  });

  const [activeTab, setActiveTab] = useState("hero");
  const [isSaving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would typically send to your API
    console.log("Saving config:", config);
    
    setSaving(false);
    alert("Configuration saved successfully!");
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Hero
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
