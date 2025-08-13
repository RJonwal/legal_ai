import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Trash2, 
  Eye,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Settings,
  FileText,
  Users,
  DollarSign
} from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  dashboardScreenshots: string[];
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
  }>;
  pricingPlans: Array<{
    name: string;
    price: string;
    period: string;
    tokenLimit: string;
    features: string[];
    popular?: boolean;
    ctaText: string;
  }>;
}

export default function AdminLandingConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");

  // Fetch current landing config
  const { data: config, isLoading } = useQuery<LandingConfig>({
    queryKey: ['/api/admin/landing-config'],
    retry: false,
  });

  // Initialize form state with default values
  const [formData, setFormData] = useState<LandingConfig>({
    heroTitle: "Transform Your Legal Practice with AI",
    heroSubtitle: "Advanced AI assistant with 20+ years of legal experience. Strategic analysis, automated document generation, and comprehensive case management in one platform.",
    ctaButtonText: "Get Started",
    dashboardScreenshots: [],
    features: [
      {
        title: "AI-Powered Legal Analysis",
        description: "Senior-level legal reasoning with 20+ years of experience. Strategic case analysis, risk assessment, and proactive recommendations.",
        icon: "brain"
      }
    ],
    testimonials: [
      {
        name: "Sarah Martinez",
        role: "Managing Partner", 
        company: "Martinez & Associates",
        content: "The AI legal analysis is phenomenal. It's like having a senior partner review every case with 20+ years of experience.",
        rating: 5
      }
    ],
    pricingPlans: [
      {
        name: "Professional",
        price: "$49",
        period: "/month",
        tokenLimit: "50,000 tokens/month",
        features: ["AI Legal Analysis", "Document Generation", "Case Management", "5 Cases / Month", "Email Support"],
        ctaText: "Get Started"
      }
    ]
  });

  // Update form data when config loads
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  // Save landing config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (data: LandingConfig) => {
      const response = await fetch('/api/admin/landing-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save config');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/landing-config'] });
      toast({
        title: "Configuration Saved",
        description: "Landing page configuration updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save landing page configuration. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(formData);
  };

  // Handle screenshot upload
  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get upload URL');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      // Update dashboard screenshot with object storage
      fetch('/api/dashboard-screenshots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshotURL: uploadURL }),
      })
      .then(response => response.json())
      .then(data => {
        const newScreenshots = [...formData.dashboardScreenshots, data.objectPath];
        setFormData({...formData, dashboardScreenshots: newScreenshots});
        toast({
          title: "Screenshot Uploaded",
          description: "Dashboard screenshot uploaded successfully.",
        });
      })
      .catch(error => {
        console.error('Error setting screenshot:', error);
        toast({
          title: "Upload Error",
          description: "Failed to save uploaded screenshot.",
          variant: "destructive",
        });
      });
    }
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = formData.dashboardScreenshots.filter((_, i) => i !== index);
    setFormData({...formData, dashboardScreenshots: newScreenshots});
    toast({
      title: "Screenshot Removed",
      description: "Dashboard screenshot removed from landing page.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Configuration</h1>
          <p className="text-gray-600 mt-2">Manage your landing page content, screenshots, and configuration</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveConfigMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Screenshots
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </TabsTrigger>
        </TabsList>

        {/* Hero Section Configuration */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <Input
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                  placeholder="Transform Your Legal Practice with AI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <Textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
                  placeholder="Advanced AI assistant with 20+ years of legal experience..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                <Input
                  value={formData.ctaButtonText}
                  onChange={(e) => setFormData({...formData, ctaButtonText: e.target.value})}
                  placeholder="Get Started"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Screenshots */}
        <TabsContent value="screenshots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Dashboard Screenshots
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload real dashboard screenshots to showcase your platform's capabilities on the landing page.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Current Screenshots</h3>
                  <p className="text-sm text-gray-600">
                    {formData.dashboardScreenshots.length} screenshot(s) uploaded
                  </p>
                </div>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Screenshot
                </ObjectUploader>
              </div>

              {/* Screenshot Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.dashboardScreenshots.map((screenshot, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={screenshot.startsWith('/') ? `/public-objects${screenshot}` : screenshot}
                          alt={`Dashboard Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDNINUM0LjQ0NzcyIDMgNCAzLjQ0NzcyIDQgNFYyMEM0IDIwLjU1MjMgNC40NDc3MiAyMSA1IDIxSDIxQzIxLjU1MjMgMjEgMjIgMjAuNTUyMyAyMiAyMFY0QzIyIDMuNDQ3NzIgMjEuNTUyMyAzIDIxIDNaIiBzdHJva2U9IiNBNUE1QTUiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNOSA5SDlWOUgxNVY5SDlWOVoiIGZpbGw9IiNBNUE1QTUiLz4KPC9zdmc+Cg==';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Screenshot {index + 1}</p>
                          <p className="text-xs text-gray-500">Uploaded to landing page</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeScreenshot(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {formData.dashboardScreenshots.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Screenshots Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Upload dashboard screenshots to showcase your platform's features on the landing page.
                  </p>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5 * 1024 * 1024}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Screenshot
                  </ObjectUploader>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Configuration */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Showcase</CardTitle>
              <p className="text-sm text-gray-600">
                Configure the features displayed on your landing page based on actual dashboard capabilities.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Feature Title</label>
                        <Input
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index].title = e.target.value;
                            setFormData({...formData, features: newFeatures});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Icon Type</label>
                        <Input
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...formData.features];
                            newFeatures[index].icon = e.target.value;
                            setFormData({...formData, features: newFeatures});
                          }}
                          placeholder="brain, file-text, shield, etc."
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...formData.features];
                          newFeatures[index].description = e.target.value;
                          setFormData({...formData, features: newFeatures});
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Configuration */}
        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.testimonials.map((testimonial, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index].name = e.target.value;
                            setFormData({...formData, testimonials: newTestimonials});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <Input
                          value={testimonial.role}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index].role = e.target.value;
                            setFormData({...formData, testimonials: newTestimonials});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company</label>
                        <Input
                          value={testimonial.company}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index].company = e.target.value;
                            setFormData({...formData, testimonials: newTestimonials});
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Testimonial Content</label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) => {
                          const newTestimonials = [...formData.testimonials];
                          newTestimonials[index].content = e.target.value;
                          setFormData({...formData, testimonials: newTestimonials});
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Configuration */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.pricingPlans.map((plan, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Plan Name</label>
                        <Input
                          value={plan.name}
                          onChange={(e) => {
                            const newPlans = [...formData.pricingPlans];
                            newPlans[index].name = e.target.value;
                            setFormData({...formData, pricingPlans: newPlans});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <Input
                          value={plan.price}
                          onChange={(e) => {
                            const newPlans = [...formData.pricingPlans];
                            newPlans[index].price = e.target.value;
                            setFormData({...formData, pricingPlans: newPlans});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Period</label>
                        <Input
                          value={plan.period || "/month"}
                          onChange={(e) => {
                            const newPlans = [...formData.pricingPlans];
                            newPlans[index].period = e.target.value;
                            setFormData({...formData, pricingPlans: newPlans});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Token Limit</label>
                        <Input
                          value={plan.tokenLimit || ""}
                          onChange={(e) => {
                            const newPlans = [...formData.pricingPlans];
                            newPlans[index].tokenLimit = e.target.value;
                            setFormData({...formData, pricingPlans: newPlans});
                          }}
                          placeholder="10,000 tokens/month"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                        <Input
                          value={plan.ctaText || "Get Started"}
                          onChange={(e) => {
                            const newPlans = [...formData.pricingPlans];
                            newPlans[index].ctaText = e.target.value;
                            setFormData({...formData, pricingPlans: newPlans});
                          }}
                        />
                      </div>
                      {plan.popular && (
                        <Badge className="bg-blue-600">Most Popular</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}