import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Save, Upload, Palette, Type, Image, 
  Building2, Globe, Mail, Phone, MapPin,
  Facebook, Twitter, Linkedin, Instagram,
  Youtube, Github, Sparkles, Download, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface BrandConfig {
  // Brand Identity
  companyName: string;
  tagline: string;
  description: string;
  
  // Visual Assets
  logo: {
    light: string;
    dark: string;
    favicon: string;
    appleTouchIcon: string;
  };
  
  // Brand Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Typography
  typography: {
    primaryFont: string;
    secondaryFont: string;
    bodyFont: string;
    codeFont: string;
  };
  
  // Contact Information
  contact: {
    email: string;
    phone: string;
    address: string;
    supportEmail: string;
    salesEmail: string;
  };
  
  // Social Media
  social: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  
  // Legal
  legal: {
    companyLegalName: string;
    registrationNumber?: string;
    vatNumber?: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
  
  // Meta Information
  meta: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    author: string;
    copyright: string;
  };
}

export default function BrandManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("identity");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Fetch brand configuration
  const { data: brandConfig, isLoading } = useQuery<BrandConfig>({
    queryKey: ['/api/admin/brand'],
  });

  const [formData, setFormData] = useState<BrandConfig>({
    companyName: "Wizzered",
    tagline: "AI-Powered Legal Technology",
    description: "Transform your legal practice with advanced AI assistance",
    
    logo: {
      light: "/assets/logo-light.svg",
      dark: "/assets/logo-dark.svg",
      favicon: "/favicon.ico",
      appleTouchIcon: "/apple-touch-icon.png"
    },
    
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f59e0b",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    },
    
    typography: {
      primaryFont: "'Inter', sans-serif",
      secondaryFont: "'Montserrat', sans-serif",
      bodyFont: "'Inter', sans-serif",
      codeFont: "'Fira Code', monospace"
    },
    
    contact: {
      email: "contact@wizzered.com",
      phone: "+1 (555) 123-4567",
      address: "123 Legal Tech Plaza, Suite 100, San Francisco, CA 94102",
      supportEmail: "support@wizzered.com",
      salesEmail: "sales@wizzered.com"
    },
    
    social: {
      facebook: "https://facebook.com/wizzered",
      twitter: "https://twitter.com/wizzered",
      linkedin: "https://linkedin.com/company/wizzered",
      instagram: "https://instagram.com/wizzered"
    },
    
    legal: {
      companyLegalName: "Wizzered Technologies Inc.",
      registrationNumber: "123456789",
      vatNumber: "US123456789",
      termsUrl: "/terms",
      privacyUrl: "/privacy"
    },
    
    meta: {
      defaultTitle: "Wizzered - AI-Powered Legal Technology",
      titleTemplate: "%s | Wizzered",
      defaultDescription: "Transform your legal practice with AI-powered case management, document generation, and strategic analysis.",
      keywords: ["legal AI", "case management", "legal technology", "document automation"],
      author: "Wizzered Technologies",
      copyright: "© 2024 Wizzered Technologies Inc. All rights reserved."
    }
  });

  useEffect(() => {
    if (brandConfig) {
      setFormData(brandConfig);
    }
  }, [brandConfig]);

  // Save brand configuration
  const saveBrandMutation = useMutation({
    mutationFn: async (data: BrandConfig) => {
      const response = await fetch('/api/admin/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save brand configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brand'] });
      toast({
        title: "Brand Configuration Saved",
        description: "Your brand settings have been updated successfully"
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (field: string, file: File) => {
    setUploadingField(field);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);
    
    try {
      const response = await fetch('/api/admin/brand/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      
      // Update the appropriate field based on the upload type
      setFormData(prev => {
        const newData = { ...prev };
        if (field.includes('logo')) {
          const logoType = field.split('.')[1] as keyof typeof newData.logo;
          newData.logo[logoType] = url;
        }
        return newData;
      });
      
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingField(null);
    }
  };

  const exportBrandKit = () => {
    const brandKit = {
      ...formData,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
    
    const blob = new Blob([JSON.stringify(brandKit, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-kit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Brand Kit Exported",
      description: "Your brand kit has been downloaded"
    });
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
            Brand Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your brand identity, assets, and visual appearance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportBrandKit}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Brand Kit
          </Button>
          <Button
            onClick={() => saveBrandMutation.mutate(formData)}
            disabled={saveBrandMutation.isPending}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveBrandMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="logos">Logos & Icons</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="meta">Meta & SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Define your company's core brand elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyName: e.target.value
                  }))}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tagline: e.target.value
                  }))}
                  placeholder="Your inspiring tagline"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Brief description of your company"
                  rows={4}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold">Legal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Legal Company Name</Label>
                    <Input
                      value={formData.legal.companyLegalName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        legal: { ...prev.legal, companyLegalName: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Registration Number</Label>
                    <Input
                      value={formData.legal.registrationNumber || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        legal: { ...prev.legal, registrationNumber: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>VAT/Tax Number</Label>
                    <Input
                      value={formData.legal.vatNumber || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        legal: { ...prev.legal, vatNumber: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logos & Icons</CardTitle>
              <CardDescription>
                Upload and manage your brand's visual assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Light Logo */}
                <div className="space-y-3">
                  <Label>Logo (Light Mode)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {formData.logo.light ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.logo.light} 
                          alt="Light Logo" 
                          className="max-h-24 mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload('logo.light', file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload('logo.light', file);
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Light Logo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dark Logo */}
                <div className="space-y-3">
                  <Label>Logo (Dark Mode)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors bg-slate-900">
                    {formData.logo.dark ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.logo.dark} 
                          alt="Dark Logo" 
                          className="max-h-24 mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload('logo.dark', file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload('logo.dark', file);
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Dark Logo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Favicon */}
                <div className="space-y-3">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {formData.logo.favicon ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.logo.favicon} 
                          alt="Favicon" 
                          className="h-16 w-16 mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.ico,image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload('logo.favicon', file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.ico,image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload('logo.favicon', file);
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Favicon
                      </Button>
                    )}
                  </div>
                </div>

                {/* Apple Touch Icon */}
                <div className="space-y-3">
                  <Label>Apple Touch Icon</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {formData.logo.appleTouchIcon ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.logo.appleTouchIcon} 
                          alt="Apple Touch Icon" 
                          className="h-16 w-16 mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload('logo.appleTouchIcon', file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload('logo.appleTouchIcon', file);
                          };
                          input.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Touch Icon
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Recommended sizes:</strong> Logo: SVG or 512x512px PNG, Favicon: 32x32px ICO, Apple Touch Icon: 180x180px PNG
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Define your brand's color palette
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(formData.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key} Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          colors: { ...prev.colors, [key]: e.target.value }
                        }))}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          colors: { ...prev.colors, [key]: e.target.value }
                        }))}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Color Preview</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(formData.colors).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center"
                    >
                      <div
                        className="h-20 rounded-lg shadow-md mb-2"
                        style={{ backgroundColor: value }}
                      />
                      <p className="text-xs capitalize">{key}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>
                Configure your brand's font selections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Font (Headings)</Label>
                  <Input
                    value={formData.typography.primaryFont}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      typography: { ...prev.typography, primaryFont: e.target.value }
                    }))}
                    placeholder="'Inter', sans-serif"
                  />
                </div>
                <div>
                  <Label>Secondary Font (Subheadings)</Label>
                  <Input
                    value={formData.typography.secondaryFont}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      typography: { ...prev.typography, secondaryFont: e.target.value }
                    }))}
                    placeholder="'Montserrat', sans-serif"
                  />
                </div>
                <div>
                  <Label>Body Font</Label>
                  <Input
                    value={formData.typography.bodyFont}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: e.target.value }
                    }))}
                    placeholder="'Inter', sans-serif"
                  />
                </div>
                <div>
                  <Label>Code Font</Label>
                  <Input
                    value={formData.typography.codeFont}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      typography: { ...prev.typography, codeFont: e.target.value }
                    }))}
                    placeholder="'Fira Code', monospace"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Font Preview</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Primary Font</p>
                    <h2 
                      className="text-3xl"
                      style={{ fontFamily: formData.typography.primaryFont }}
                    >
                      The Quick Brown Fox Jumps Over The Lazy Dog
                    </h2>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Secondary Font</p>
                    <h3 
                      className="text-2xl"
                      style={{ fontFamily: formData.typography.secondaryFont }}
                    >
                      The Quick Brown Fox Jumps Over The Lazy Dog
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Body Font</p>
                    <p 
                      className="text-base"
                      style={{ fontFamily: formData.typography.bodyFont }}
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Code Font</p>
                    <pre 
                      className="text-sm bg-muted p-2 rounded"
                      style={{ fontFamily: formData.typography.codeFont }}
                    >
                      {`const brandConfig = { name: "Wizzered", type: "Legal AI" };`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Manage your company's contact details and social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>General Email</Label>
                  <div className="flex gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      value={formData.contact.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      value={formData.contact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input
                    value={formData.contact.supportEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, supportEmail: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Sales Email</Label>
                  <Input
                    value={formData.contact.salesEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, salesEmail: e.target.value }
                    }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Business Address</Label>
                  <div className="flex gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                    <Textarea
                      value={formData.contact.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address: e.target.value }
                      }))}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Social Media Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Facebook</Label>
                    <div className="flex gap-2">
                      <Facebook className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.facebook || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, facebook: e.target.value }
                        }))}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Twitter</Label>
                    <div className="flex gap-2">
                      <Twitter className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.twitter || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, twitter: e.target.value }
                        }))}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <div className="flex gap-2">
                      <Linkedin className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.linkedin || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, linkedin: e.target.value }
                        }))}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <div className="flex gap-2">
                      <Instagram className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.instagram || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, instagram: e.target.value }
                        }))}
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>YouTube</Label>
                    <div className="flex gap-2">
                      <Youtube className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.youtube || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, youtube: e.target.value }
                        }))}
                        placeholder="https://youtube.com/c/yourchannel"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>GitHub</Label>
                    <div className="flex gap-2">
                      <Github className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        value={formData.social.github || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social: { ...prev.social, github: e.target.value }
                        }))}
                        placeholder="https://github.com/yourorg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Information & SEO</CardTitle>
              <CardDescription>
                Configure metadata and SEO settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Page Title</Label>
                <Input
                  value={formData.meta.defaultTitle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    meta: { ...prev.meta, defaultTitle: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Title Template</Label>
                <Input
                  value={formData.meta.titleTemplate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    meta: { ...prev.meta, titleTemplate: e.target.value }
                  }))}
                  placeholder="%s | Your Company"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use %s where the page title should appear
                </p>
              </div>
              <div>
                <Label>Default Meta Description</Label>
                <Textarea
                  value={formData.meta.defaultDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    meta: { ...prev.meta, defaultDescription: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={formData.meta.keywords.join(", ")}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    meta: { 
                      ...prev.meta, 
                      keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)
                    }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Author</Label>
                  <Input
                    value={formData.meta.author}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      meta: { ...prev.meta, author: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Copyright</Label>
                  <Input
                    value={formData.meta.copyright}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      meta: { ...prev.meta, copyright: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}