import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Upload, Palette, Type, Contact, Globe, Save } from "lucide-react";

interface BrandConfig {
  id?: number;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  companyName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function BrandManagement() {
  const [config, setConfig] = useState<BrandConfig>({
    primaryColor: "#1e3a8a",
    secondaryColor: "#3730a3", 
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    companyName: "LegalAI Pro",
    socialMedia: {}
  });

  const queryClient = useQueryClient();

  // Fetch brand configuration
  const { data: brandConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/brand-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/brand-config');
      if (!response.ok) throw new Error('Failed to fetch brand config');
      return response.json();
    },
    onSuccess: (data) => {
      if (data) setConfig(data);
    }
  });

  // Update brand configuration mutation
  const updateMutation = useMutation({
    mutationFn: async (configData: BrandConfig) => {
      const response = await fetch('/api/admin/brand-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (!response.ok) throw new Error('Failed to update brand config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brand-config'] });
      toast({ title: "Success", description: "Brand configuration updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update brand configuration",
        variant: "destructive" 
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  const handleInputChange = (field: keyof BrandConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading brand configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-2">Customize your platform's branding and appearance</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Logo & Assets
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Contact className="h-4 w-4" />
            Contact Info
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Social Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>Upload your main company logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.logoUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img src={config.logoUrl} alt="Logo" className="max-h-32 mx-auto" />
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Drag and drop your logo here, or click to select</p>
                  <Button variant="outline" className="mt-2">Choose File</Button>
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={config.logoUrl || ''}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favicon</CardTitle>
                <CardDescription>Small icon that appears in browser tabs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.faviconUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img src={config.faviconUrl} alt="Favicon" className="w-8 h-8 mx-auto" />
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Upload favicon (32x32 px recommended)</p>
                  <Button variant="outline" className="mt-2">Choose File</Button>
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={config.faviconUrl || ''}
                    onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Color</CardTitle>
                <CardDescription>Main brand color used throughout the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="primaryColor">Color Value</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  value={config.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  placeholder="#1e3a8a"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary Color</CardTitle>
                <CardDescription>Supporting brand color for accents and highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: config.secondaryColor }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="secondaryColor">Color Value</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  value={config.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  placeholder="#3730a3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accent Color</CardTitle>
                <CardDescription>Bright color for call-to-action buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: config.accentColor }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="accentColor">Color Value</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  value={config.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  placeholder="#f59e0b"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Family</CardTitle>
              <CardDescription>Choose the primary font for your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <select
                  id="fontFamily"
                  value={config.fontFamily}
                  onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>
              <div className="p-4 border rounded-lg" style={{ fontFamily: config.fontFamily }}>
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <p>This is how your text will appear with the selected font family. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details displayed across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={config.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Your company tagline or slogan"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Contact details displayed in footers and contact pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={config.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={config.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={config.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={config.socialMedia?.facebook || ''}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={config.socialMedia?.twitter || ''}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/youraccount"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={config.socialMedia?.linkedin || ''}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={config.socialMedia?.instagram || ''}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}