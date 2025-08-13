import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Save, Eye, Layout, Palette, Type, Users, Star, MessageSquare, Zap, Shield } from "lucide-react";

interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'footer';
  enabled: boolean;
  order: number;
  config: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    items?: any[];
    layout?: string;
    [key: string]: any;
  };
}

interface LandingConfig {
  id?: number;
  configData: {
    sections: LandingSection[];
    globalSettings: {
      showNavigation: boolean;
      stickyHeader: boolean;
      enableAnimations: boolean;
      mobileOptimized: boolean;
      seoSettings: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        ogImage?: string;
      };
    };
    customCSS?: string;
  };
  isActive: boolean;
  version: string;
}

export default function LandingPageConfig() {
  const [config, setConfig] = useState<LandingConfig>({
    configData: {
      sections: [],
      globalSettings: {
        showNavigation: true,
        stickyHeader: true,
        enableAnimations: true,
        mobileOptimized: true,
        seoSettings: {
          metaTitle: "LegalAI Pro - AI-Powered Legal Technology",
          metaDescription: "Transform your legal practice with advanced AI technology. Generate documents, analyze cases, and streamline your workflow.",
          keywords: ["legal AI", "law technology", "document generation", "case analysis"]
        }
      }
    },
    isActive: true,
    version: "v1.0"
  });

  const queryClient = useQueryClient();

  // Fetch landing page configuration
  const { data: landingConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/landing-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/landing-config');
      if (!response.ok) throw new Error('Failed to fetch landing config');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.configData) {
        setConfig(data);
      }
    }
  });

  // Update landing page configuration mutation
  const updateMutation = useMutation({
    mutationFn: async (configData: LandingConfig) => {
      const response = await fetch('/api/admin/landing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (!response.ok) throw new Error('Failed to update landing config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/landing-config'] });
      toast({ title: "Success", description: "Landing page configuration updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update landing page configuration",
        variant: "destructive" 
      });
    }
  });

  // Initialize default sections if none exist
  const initializeDefaultSections = () => {
    const defaultSections: LandingSection[] = [
      {
        id: 'hero',
        type: 'hero',
        enabled: true,
        order: 1,
        config: {
          title: "Transform Your Legal Practice with AI",
          subtitle: "LegalAI Pro",
          description: "Generate documents, analyze cases, and streamline your workflow with advanced artificial intelligence.",
          buttonText: "Start Free Trial",
          buttonLink: "/signup",
          backgroundImage: "",
          backgroundColor: "#1e3a8a",
          textColor: "#ffffff",
          layout: "center"
        }
      },
      {
        id: 'features',
        type: 'features',
        enabled: true,
        order: 2,
        config: {
          title: "Powerful Features for Modern Legal Practice",
          description: "Everything you need to revolutionize your legal workflow",
          layout: "grid",
          items: [
            {
              icon: "Zap",
              title: "AI Document Generation",
              description: "Generate legal documents instantly with AI-powered templates and customization."
            },
            {
              icon: "Shield",
              title: "Case Analysis",
              description: "Analyze cases with advanced AI to identify key insights and strategies."
            },
            {
              icon: "Users",
              title: "Client Management",
              description: "Streamline client communications and case management in one platform."
            },
            {
              icon: "MessageSquare",
              title: "Smart Chat Assistant",
              description: "Get instant legal research and guidance from our AI assistant."
            }
          ]
        }
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        enabled: true,
        order: 3,
        config: {
          title: "Trusted by Legal Professionals",
          description: "See what attorneys are saying about LegalAI Pro",
          layout: "carousel",
          items: [
            {
              name: "Sarah Johnson",
              title: "Senior Partner, Johnson & Associates",
              content: "LegalAI Pro has transformed how we handle document generation. What used to take hours now takes minutes.",
              rating: 5,
              avatar: "/avatars/sarah.jpg"
            },
            {
              name: "Michael Chen",
              title: "Solo Practitioner",
              content: "The AI case analysis feature has helped me identify critical insights I might have missed.",
              rating: 5,
              avatar: "/avatars/michael.jpg"
            },
            {
              name: "Emily Rodriguez",
              title: "Legal Director, TechCorp",
              content: "Excellent platform for managing our legal workflows. Highly recommended for any legal team.",
              rating: 5,
              avatar: "/avatars/emily.jpg"
            }
          ]
        }
      },
      {
        id: 'pricing',
        type: 'pricing',
        enabled: true,
        order: 4,
        config: {
          title: "Choose Your Plan",
          description: "Flexible pricing for practices of all sizes",
          layout: "cards",
          items: [
            {
              name: "Starter",
              price: 29,
              period: "month",
              description: "Perfect for solo practitioners",
              features: [
                "10 documents per month",
                "Basic AI assistant",
                "Email support",
                "Case management"
              ],
              buttonText: "Start Free Trial",
              highlighted: false
            },
            {
              name: "Professional",
              price: 79,
              period: "month",
              description: "For growing law firms",
              features: [
                "Unlimited documents",
                "Advanced AI features",
                "Priority support",
                "Team collaboration",
                "Custom templates"
              ],
              buttonText: "Start Free Trial",
              highlighted: true
            },
            {
              name: "Enterprise",
              price: 199,
              period: "month",
              description: "For large organizations",
              features: [
                "Everything in Professional",
                "Custom integrations",
                "Dedicated support",
                "Advanced analytics",
                "API access"
              ],
              buttonText: "Contact Sales",
              highlighted: false
            }
          ]
        }
      },
      {
        id: 'cta',
        type: 'cta',
        enabled: true,
        order: 5,
        config: {
          title: "Ready to Transform Your Legal Practice?",
          description: "Join thousands of legal professionals who trust LegalAI Pro",
          buttonText: "Start Your Free Trial",
          buttonLink: "/signup",
          backgroundColor: "#f59e0b",
          textColor: "#ffffff"
        }
      }
    ];

    setConfig(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        sections: defaultSections
      }
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  const updateSection = (sectionId: string, updates: Partial<LandingSection>) => {
    setConfig(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        sections: prev.configData.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }
    }));
  };

  const updateGlobalSettings = (updates: Partial<LandingConfig['configData']['globalSettings']>) => {
    setConfig(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        globalSettings: {
          ...prev.configData.globalSettings,
          ...updates
        }
      }
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading landing page configuration...</div>;
  }

  // Initialize sections if none exist
  if (config.configData.sections.length === 0) {
    initializeDefaultSections();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Configuration</h1>
          <p className="text-gray-600 mt-2">Customize your landing page sections and settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Custom CSS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">
          <div className="grid gap-6">
            {config.configData.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="capitalize">{section.type} Section</CardTitle>
                      <CardDescription>
                        Configure the {section.type} section of your landing page
                      </CardDescription>
                    </div>
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={(enabled) => updateSection(section.id, { enabled })}
                    />
                  </div>
                </CardHeader>
                {section.enabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${section.id}-title`}>Title</Label>
                        <Input
                          id={`${section.id}-title`}
                          value={section.config.title || ''}
                          onChange={(e) => updateSection(section.id, {
                            config: { ...section.config, title: e.target.value }
                          })}
                          placeholder="Section title"
                        />
                      </div>
                      {section.type !== 'cta' && (
                        <div>
                          <Label htmlFor={`${section.id}-subtitle`}>Subtitle</Label>
                          <Input
                            id={`${section.id}-subtitle`}
                            value={section.config.subtitle || ''}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, subtitle: e.target.value }
                            })}
                            placeholder="Section subtitle"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`${section.id}-description`}>Description</Label>
                      <Textarea
                        id={`${section.id}-description`}
                        value={section.config.description || ''}
                        onChange={(e) => updateSection(section.id, {
                          config: { ...section.config, description: e.target.value }
                        })}
                        placeholder="Section description"
                        rows={3}
                      />
                    </div>
                    {(section.type === 'hero' || section.type === 'cta') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${section.id}-buttonText`}>Button Text</Label>
                          <Input
                            id={`${section.id}-buttonText`}
                            value={section.config.buttonText || ''}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, buttonText: e.target.value }
                            })}
                            placeholder="Button text"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${section.id}-buttonLink`}>Button Link</Label>
                          <Input
                            id={`${section.id}-buttonLink`}
                            value={section.config.buttonLink || ''}
                            onChange={(e) => updateSection(section.id, {
                              config: { ...section.config, buttonLink: e.target.value }
                            })}
                            placeholder="/signup"
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${section.id}-backgroundColor`}>Background Color</Label>
                        <Input
                          id={`${section.id}-backgroundColor`}
                          type="color"
                          value={section.config.backgroundColor || '#ffffff'}
                          onChange={(e) => updateSection(section.id, {
                            config: { ...section.config, backgroundColor: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${section.id}-textColor`}>Text Color</Label>
                        <Input
                          id={`${section.id}-textColor`}
                          type="color"
                          value={section.config.textColor || '#000000'}
                          onChange={(e) => updateSection(section.id, {
                            config: { ...section.config, textColor: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Landing Page Settings</CardTitle>
              <CardDescription>Configure overall page behavior and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Navigation</Label>
                    <p className="text-sm text-gray-600">Display navigation header</p>
                  </div>
                  <Switch
                    checked={config.configData.globalSettings.showNavigation}
                    onCheckedChange={(checked) => updateGlobalSettings({ showNavigation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sticky Header</Label>
                    <p className="text-sm text-gray-600">Keep header visible on scroll</p>
                  </div>
                  <Switch
                    checked={config.configData.globalSettings.stickyHeader}
                    onCheckedChange={(checked) => updateGlobalSettings({ stickyHeader: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Animations</Label>
                    <p className="text-sm text-gray-600">Animate elements on scroll</p>
                  </div>
                  <Switch
                    checked={config.configData.globalSettings.enableAnimations}
                    onCheckedChange={(checked) => updateGlobalSettings({ enableAnimations: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mobile Optimized</Label>
                    <p className="text-sm text-gray-600">Responsive mobile design</p>
                  </div>
                  <Switch
                    checked={config.configData.globalSettings.mobileOptimized}
                    onCheckedChange={(checked) => updateGlobalSettings({ mobileOptimized: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
              <CardDescription>Optimize your landing page for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={config.configData.globalSettings.seoSettings.metaTitle}
                  onChange={(e) => updateGlobalSettings({
                    seoSettings: {
                      ...config.configData.globalSettings.seoSettings,
                      metaTitle: e.target.value
                    }
                  })}
                  placeholder="Page title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={config.configData.globalSettings.seoSettings.metaDescription}
                  onChange={(e) => updateGlobalSettings({
                    seoSettings: {
                      ...config.configData.globalSettings.seoSettings,
                      metaDescription: e.target.value
                    }
                  })}
                  placeholder="Description for search engine results"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={config.configData.globalSettings.seoSettings.keywords.join(', ')}
                  onChange={(e) => updateGlobalSettings({
                    seoSettings: {
                      ...config.configData.globalSettings.seoSettings,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }
                  })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={config.configData.globalSettings.seoSettings.ogImage || ''}
                  onChange={(e) => updateGlobalSettings({
                    seoSettings: {
                      ...config.configData.globalSettings.seoSettings,
                      ogImage: e.target.value
                    }
                  })}
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom styles to enhance your landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.configData.customCSS || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  configData: {
                    ...prev.configData,
                    customCSS: e.target.value
                  }
                }))}
                placeholder="/* Add your custom CSS here */&#10;.custom-button {&#10;  background: linear-gradient(45deg, #1e3a8a, #3730a3);&#10;  border-radius: 8px;&#10;}"
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}