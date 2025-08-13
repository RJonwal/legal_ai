import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Save, Plus, Trash2, Eye, EyeOff, Settings, 
  Palette, Type, Layout, Image, Code, ChevronUp, 
  ChevronDown, Copy, Monitor, Smartphone, Tablet,
  Sparkles, Globe, Lock, Shield, Zap, Users, X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content: any;
  styles: {
    background?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    boxShadow?: string;
    customCSS?: string;
  };
  responsive: {
    mobile?: any;
    tablet?: any;
    desktop?: any;
  };
}

interface LandingPageConfig {
  sections: SectionConfig[];
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    containerMaxWidth: string;
    customGlobalCSS?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  features: {
    liveChat: boolean;
    cookieBanner: boolean;
    analytics: boolean;
    newsletter: boolean;
  };
}

export default function EnhancedLandingConfig() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);

  // Fetch current config
  const { data: config, isLoading } = useQuery<LandingPageConfig>({
    queryKey: ['/api/admin/landing-config-enhanced'],
  });

  const [formData, setFormData] = useState<LandingPageConfig>({
    sections: [
      {
        id: "hero",
        name: "Hero Section",
        enabled: true,
        order: 1,
        content: {
          title: "Transform Your Legal Practice with AI",
          subtitle: "Advanced AI assistant with 20+ years of legal experience",
          ctaText: "Get Started",
          ctaLink: "/signup",
          secondaryCtaText: "Learn More",
          secondaryCtaLink: "#features",
          badge: "AI-Powered Legal Technology",
          backgroundImage: "",
          features: ["No Credit Card Required", "14-Day Free Trial", "Cancel Anytime"]
        },
        styles: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "#ffffff",
          padding: "120px 0",
          customCSS: ""
        },
        responsive: {
          mobile: { padding: "60px 20px" },
          tablet: { padding: "80px 40px" },
          desktop: { padding: "120px 0" }
        }
      },
      {
        id: "features",
        name: "Features Section",
        enabled: true,
        order: 2,
        content: {
          title: "Powerful Features for Legal Professionals",
          subtitle: "Everything you need to manage your legal practice",
          features: [
            {
              icon: "brain",
              title: "AI Legal Analysis",
              description: "Senior-level legal reasoning and strategic case analysis"
            },
            {
              icon: "document",
              title: "Document Generation",
              description: "Automated creation of legal documents and briefs"
            },
            {
              icon: "shield",
              title: "Case Management",
              description: "Comprehensive case tracking and organization"
            }
          ]
        },
        styles: {
          background: "#ffffff",
          textColor: "#333333",
          padding: "80px 0"
        },
        responsive: {}
      },
      {
        id: "pricing",
        name: "Pricing Section",
        enabled: true,
        order: 3,
        content: {
          title: "Simple, Transparent Pricing",
          subtitle: "Choose the plan that fits your needs",
          plans: [
            {
              name: "Starter",
              price: "$29",
              period: "/month",
              features: ["5 Cases", "Basic AI Analysis", "Email Support"],
              highlighted: false
            },
            {
              name: "Professional",
              price: "$99",
              period: "/month",
              features: ["Unlimited Cases", "Advanced AI", "Priority Support", "Custom Templates"],
              highlighted: true
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              features: ["Custom AI Training", "Dedicated Support", "API Access", "White Label"],
              highlighted: false
            }
          ]
        },
        styles: {
          background: "#f7f9fc",
          textColor: "#333333",
          padding: "80px 0"
        },
        responsive: {}
      },
      {
        id: "testimonials",
        name: "Testimonials Section",
        enabled: true,
        order: 4,
        content: {
          title: "Trusted by Legal Professionals",
          subtitle: "See what our users are saying",
          testimonials: [
            {
              name: "Sarah Johnson",
              role: "Managing Partner",
              company: "Johnson Law Firm",
              content: "This AI assistant has transformed our practice. It's like having a senior attorney available 24/7.",
              rating: 5,
              image: ""
            }
          ]
        },
        styles: {
          background: "#ffffff",
          textColor: "#333333",
          padding: "80px 0"
        },
        responsive: {}
      },
      {
        id: "cta",
        name: "Call to Action",
        enabled: true,
        order: 5,
        content: {
          title: "Ready to Transform Your Legal Practice?",
          subtitle: "Join thousands of legal professionals using AI",
          ctaText: "Start Your Free Trial",
          ctaLink: "/signup"
        },
        styles: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "#ffffff",
          padding: "60px 0"
        },
        responsive: {}
      }
    ],
    globalStyles: {
      primaryColor: "#667eea",
      secondaryColor: "#764ba2",
      accentColor: "#f59e0b",
      fontFamily: "'Inter', sans-serif",
      fontSize: "16px",
      lineHeight: "1.6",
      containerMaxWidth: "1280px",
      customGlobalCSS: ""
    },
    seo: {
      title: "Wizzered - AI-Powered Legal Technology",
      description: "Transform your legal practice with AI-powered case management, document generation, and strategic analysis.",
      keywords: ["legal AI", "case management", "legal technology", "document automation"]
    },
    features: {
      liveChat: true,
      cookieBanner: true,
      analytics: true,
      newsletter: true
    }
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  // Save configuration
  const saveMutation = useMutation({
    mutationFn: async (data: LandingPageConfig) => {
      const response = await fetch('/api/admin/landing-config-enhanced', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/landing-config-enhanced'] });
      toast({
        title: "Configuration Saved",
        description: "Landing page configuration updated successfully"
      });
    }
  });

  const handleSectionUpdate = (sectionId: string, updates: Partial<SectionConfig>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const handleSectionReorder = (sectionId: string, direction: "up" | "down") => {
    setFormData(prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === sectionId);
      if (direction === "up" && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === "down" && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      return { ...prev, sections: sections.map((s, i) => ({ ...s, order: i + 1 })) };
    });
  };

  const addNewSection = () => {
    const newSection: SectionConfig = {
      id: `custom-${Date.now()}`,
      name: "New Section",
      enabled: true,
      order: formData.sections.length + 1,
      content: {},
      styles: {
        background: "#ffffff",
        textColor: "#333333",
        padding: "60px 0"
      },
      responsive: {}
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const deleteSection = (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const duplicateSection = (sectionId: string) => {
    const section = formData.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newSection: SectionConfig = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      name: `${section.name} (Copy)`,
      order: formData.sections.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const generatePreviewCSS = () => {
    let css = `:root {
  --primary-color: ${formData.globalStyles.primaryColor};
  --secondary-color: ${formData.globalStyles.secondaryColor};
  --accent-color: ${formData.globalStyles.accentColor};
  --font-family: ${formData.globalStyles.fontFamily};
  --font-size: ${formData.globalStyles.fontSize};
  --line-height: ${formData.globalStyles.lineHeight};
  --container-max-width: ${formData.globalStyles.containerMaxWidth};
}\n\n`;

    formData.sections.forEach(section => {
      if (section.enabled && section.styles.customCSS) {
        css += `/* ${section.name} */\n${section.styles.customCSS}\n\n`;
      }
    });

    if (formData.globalStyles.customGlobalCSS) {
      css += `/* Global Custom CSS */\n${formData.globalStyles.customGlobalCSS}`;
    }

    return css;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Landing Page Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize every aspect of your landing page with advanced controls
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Global Styles
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="css" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Custom CSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Page Sections</h2>
            <Button onClick={addNewSection} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {formData.sections.sort((a, b) => a.order - b.order).map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`${selectedSection === section.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSectionReorder(section.id, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSectionReorder(section.id, "down")}
                              disabled={index === formData.sections.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Input
                                value={section.name}
                                onChange={(e) => handleSectionUpdate(section.id, { name: e.target.value })}
                                className="font-semibold text-lg border-none p-0 h-auto"
                              />
                              <Badge variant={section.enabled ? "default" : "secondary"}>
                                {section.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </CardTitle>
                            <CardDescription>Order: {section.order}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={section.enabled}
                            onCheckedChange={(checked) => 
                              handleSectionUpdate(section.id, { enabled: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedSection(
                              selectedSection === section.id ? null : section.id
                            )}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateSection(section.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSection(section.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {selectedSection === section.id && (
                      <CardContent className="space-y-4">
                        <Separator />
                        
                        {/* Section Styles */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Section Styles</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Background</Label>
                              <Input
                                value={section.styles.background || ""}
                                onChange={(e) => handleSectionUpdate(section.id, {
                                  styles: { ...section.styles, background: e.target.value }
                                })}
                                placeholder="e.g., #ffffff or linear-gradient(...)"
                              />
                            </div>
                            <div>
                              <Label>Text Color</Label>
                              <Input
                                value={section.styles.textColor || ""}
                                onChange={(e) => handleSectionUpdate(section.id, {
                                  styles: { ...section.styles, textColor: e.target.value }
                                })}
                                placeholder="#333333"
                              />
                            </div>
                            <div>
                              <Label>Padding</Label>
                              <Input
                                value={section.styles.padding || ""}
                                onChange={(e) => handleSectionUpdate(section.id, {
                                  styles: { ...section.styles, padding: e.target.value }
                                })}
                                placeholder="e.g., 60px 0"
                              />
                            </div>
                            <div>
                              <Label>Margin</Label>
                              <Input
                                value={section.styles.margin || ""}
                                onChange={(e) => handleSectionUpdate(section.id, {
                                  styles: { ...section.styles, margin: e.target.value }
                                })}
                                placeholder="e.g., 20px 0"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Custom CSS for this Section</Label>
                            <Textarea
                              value={section.styles.customCSS || ""}
                              onChange={(e) => handleSectionUpdate(section.id, {
                                styles: { ...section.styles, customCSS: e.target.value }
                              })}
                              placeholder={`.section-${section.id} {\n  /* Your custom styles */\n}`}
                              className="font-mono text-sm"
                              rows={6}
                            />
                          </div>
                        </div>

                        {/* Section Content (varies by section type) */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Section Content</h3>
                          <div>
                            <Label>Content (JSON)</Label>
                            <Textarea
                              value={JSON.stringify(section.content, null, 2)}
                              onChange={(e) => {
                                try {
                                  const content = JSON.parse(e.target.value);
                                  handleSectionUpdate(section.id, { content });
                                } catch (err) {
                                  // Invalid JSON, don't update
                                }
                              }}
                              className="font-mono text-sm"
                              rows={10}
                            />
                          </div>
                        </div>

                        {/* Responsive Settings */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Responsive Settings</h3>
                          <Tabs defaultValue="desktop">
                            <TabsList>
                              <TabsTrigger value="mobile" className="gap-2">
                                <Smartphone className="h-4 w-4" />
                                Mobile
                              </TabsTrigger>
                              <TabsTrigger value="tablet" className="gap-2">
                                <Tablet className="h-4 w-4" />
                                Tablet
                              </TabsTrigger>
                              <TabsTrigger value="desktop" className="gap-2">
                                <Monitor className="h-4 w-4" />
                                Desktop
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="mobile" className="space-y-2">
                              <Textarea
                                value={JSON.stringify(section.responsive.mobile || {}, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const mobile = JSON.parse(e.target.value);
                                    handleSectionUpdate(section.id, {
                                      responsive: { ...section.responsive, mobile }
                                    });
                                  } catch (err) {}
                                }}
                                className="font-mono text-sm"
                                rows={6}
                                placeholder='{\n  "padding": "40px 20px",\n  "fontSize": "14px"\n}'
                              />
                            </TabsContent>
                            <TabsContent value="tablet" className="space-y-2">
                              <Textarea
                                value={JSON.stringify(section.responsive.tablet || {}, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const tablet = JSON.parse(e.target.value);
                                    handleSectionUpdate(section.id, {
                                      responsive: { ...section.responsive, tablet }
                                    });
                                  } catch (err) {}
                                }}
                                className="font-mono text-sm"
                                rows={6}
                                placeholder='{\n  "padding": "60px 40px",\n  "fontSize": "15px"\n}'
                              />
                            </TabsContent>
                            <TabsContent value="desktop" className="space-y-2">
                              <Textarea
                                value={JSON.stringify(section.responsive.desktop || {}, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const desktop = JSON.parse(e.target.value);
                                    handleSectionUpdate(section.id, {
                                      responsive: { ...section.responsive, desktop }
                                    });
                                  } catch (err) {}
                                }}
                                className="font-mono text-sm"
                                rows={6}
                                placeholder='{\n  "padding": "80px 0",\n  "fontSize": "16px"\n}'
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Styles</CardTitle>
              <CardDescription>
                Define the overall look and feel of your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.globalStyles.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, primaryColor: e.target.value }
                      }))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={formData.globalStyles.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, primaryColor: e.target.value }
                      }))}
                      placeholder="#667eea"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.globalStyles.secondaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, secondaryColor: e.target.value }
                      }))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={formData.globalStyles.secondaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, secondaryColor: e.target.value }
                      }))}
                      placeholder="#764ba2"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.globalStyles.accentColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, accentColor: e.target.value }
                      }))}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={formData.globalStyles.accentColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, accentColor: e.target.value }
                      }))}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
                <div>
                  <Label>Font Family</Label>
                  <Select
                    value={formData.globalStyles.fontFamily}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, fontFamily: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                      <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                      <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                      <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                      <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                      <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                      <SelectItem value="'Merriweather', serif">Merriweather</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Font Size</Label>
                  <Input
                    value={formData.globalStyles.fontSize}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, fontSize: e.target.value }
                    }))}
                    placeholder="16px"
                  />
                </div>
                <div>
                  <Label>Line Height</Label>
                  <Input
                    value={formData.globalStyles.lineHeight}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, lineHeight: e.target.value }
                    }))}
                    placeholder="1.6"
                  />
                </div>
                <div>
                  <Label>Container Max Width</Label>
                  <Input
                    value={formData.globalStyles.containerMaxWidth}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, containerMaxWidth: e.target.value }
                    }))}
                    placeholder="1280px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your landing page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={formData.seo.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value }
                  }))}
                  placeholder="Wizzered - AI-Powered Legal Technology"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value }
                  }))}
                  placeholder="Transform your legal practice with AI..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={formData.seo.keywords.join(", ")}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, keywords: e.target.value.split(",").map(k => k.trim()) }
                  }))}
                  placeholder="legal AI, case management, legal technology"
                />
              </div>
              <div>
                <Label>Open Graph Image URL</Label>
                <Input
                  value={formData.seo.ogImage || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, ogImage: e.target.value }
                  }))}
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Features</CardTitle>
              <CardDescription>
                Enable or disable various features on your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Live Chat Widget</Label>
                    <p className="text-sm text-muted-foreground">
                      Show AI-powered chat support on the landing page
                    </p>
                  </div>
                  <Switch
                    checked={formData.features.liveChat}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, liveChat: checked }
                    }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Cookie Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Display GDPR-compliant cookie consent banner
                    </p>
                  </div>
                  <Switch
                    checked={formData.features.cookieBanner}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, cookieBanner: checked }
                    }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Google Analytics or other tracking
                    </p>
                  </div>
                  <Switch
                    checked={formData.features.analytics}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, analytics: checked }
                    }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Newsletter Signup</Label>
                    <p className="text-sm text-muted-foreground">
                      Show newsletter subscription form
                    </p>
                  </div>
                  <Switch
                    checked={formData.features.newsletter}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, newsletter: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="css" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>
                Add global custom CSS or view generated styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Global Custom CSS</Label>
                <Textarea
                  value={formData.globalStyles.customGlobalCSS || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    globalStyles: { ...prev.globalStyles, customGlobalCSS: e.target.value }
                  }))}
                  placeholder="/* Add your custom global CSS here */"
                  className="font-mono text-sm"
                  rows={10}
                />
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Generated CSS Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatePreviewCSS());
                      toast({
                        title: "Copied to clipboard",
                        description: "CSS has been copied to your clipboard"
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy CSS
                  </Button>
                </div>
                <Textarea
                  value={generatePreviewCSS()}
                  readOnly
                  className="font-mono text-sm bg-muted"
                  rows={15}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Preview</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                <div 
                  className={`mx-auto transition-all ${
                    previewMode === "mobile" ? "max-w-sm" : 
                    previewMode === "tablet" ? "max-w-2xl" : 
                    "max-w-full"
                  }`}
                >
                  <iframe
                    src="/"
                    className="w-full h-[70vh] border-0"
                    title="Landing Page Preview"
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}