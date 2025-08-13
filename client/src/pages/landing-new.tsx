import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Play,
  Check,
  Star,
  Shield,
  Zap,
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  Calendar,
  BookOpen,
  Lock,
  Award,
  Globe,
  Download,
  Eye,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface LandingConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  ctaButtonText?: string;
  dashboardScreenshots?: string[];
  features?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
  }>;
  pricingPlans?: Array<{
    name: string;
    price: string;
    period: string;
    tokenLimit: string;
    features: string[];
    popular?: boolean;
    ctaText: string;
  }>;
}

export default function NewLanding() {
  const [email, setEmail] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    teamSize: "",
    useCase: ""
  });

  // Fetch landing page configuration from admin
  const { data: config } = useQuery<LandingConfig>({
    queryKey: ['/api/admin/landing-config'],
    retry: false,
  });

  // Default comprehensive features based on dashboard analysis
  const defaultFeatures = [
    {
      title: "AI-Powered Legal Analysis",
      description: "Senior-level legal reasoning with 20+ years of experience. Strategic case analysis, risk assessment, and proactive recommendations.",
      icon: "brain",
      details: "Our AI attorney thinks strategically about legal outcomes, identifies potential issues before they become problems, and provides specific actionable advice with clear timelines."
    },
    {
      title: "Interactive Document Canvas",
      description: "Dynamic document editor with court-compatible fonts, dual download formats, and real-time AI assistance.",
      icon: "file-text",
      details: "Professional document creation with Times New Roman, Century Schoolbook, and Garamond fonts. 1-inch margins, multi-page support, and instant PDF/Word downloads."
    },
    {
      title: "Comprehensive Case Management",
      description: "Organize cases, track deadlines, manage client information, and collaborate within a secure platform.",
      icon: "folder",
      details: "Case sidebar with recent cases, client tracking, case types, timeline management, and integrated chat history for complete case context."
    },
    {
      title: "Automated Document Generation",
      description: "AI-powered drafting for contracts, briefs, motions, pleadings, and discovery documents with customizable templates.",
      icon: "wand",
      details: "Generate contracts, legal briefs, strategy memos, discovery requests, and deposition outlines with AI assistance and professional formatting."
    },
    {
      title: "Legal Research Assistant",
      description: "Quick access to legal precedents, case law research, and jurisdiction-specific analysis.",
      icon: "search",
      details: "Evidence analysis, case analytics, precedent research, and jurisdiction-aware legal standards with real-time updates."
    },
    {
      title: "Enterprise-Grade Security",
      description: "AES-256-GCM encryption, GDPR/CCPA compliance, audit logging, and comprehensive data protection.",
      icon: "shield",
      details: "JWT authentication, bcrypt hashing, TLS 1.3, CSP headers, rate limiting, PII protection, and full audit trails for enterprise compliance."
    },
    {
      title: "Case Action Buttons",
      description: "Streamlined workflow with upload documents, calendar integration, timeline tracking, and court preparation tools.",
      icon: "zap",
      details: "Upload documents, manage calendar, track case history, evidence analysis, next best action recommendations, deposition prep, and court preparation."
    },
    {
      title: "Real-time Chat Interface",
      description: "ChatGPT-like interaction with your AI legal assistant, integrated with case context and document generation.",
      icon: "message-square",
      details: "Natural language interaction with AI attorney, case-aware responses, function calling, and seamless document generation from chat."
    }
  ];

  const features = config?.features?.length ? config.features : defaultFeatures;
  const dashboardScreenshots = config?.dashboardScreenshots || [];

  // Default testimonials showcasing real legal use cases
  const defaultTestimonials = [
    {
      name: "Sarah Martinez",
      role: "Managing Partner",
      company: "Martinez & Associates",
      content: "The AI legal analysis is phenomenal. It's like having a senior partner review every case with 20+ years of experience. The document generation saves us 15+ hours per week.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Solo Practitioner",
      company: "Chen Law Firm",
      content: "As a solo practitioner, this platform levels the playing field. The case management and AI assistance help me compete with larger firms while maintaining quality.",
      rating: 5
    },
    {
      name: "Jennifer Lopez",
      role: "Corporate Counsel",
      company: "TechCorp Industries",
      content: "The enterprise security features and compliance tools are exactly what we needed. GDPR compliance built-in, audit trails, and professional document generation.",
      rating: 5
    }
  ];

  const testimonials = config?.testimonials?.length ? config.testimonials : defaultTestimonials;

  // Pricing plans with enterprise features
  const pricingPlans = config?.pricingPlans?.length ? config.pricingPlans : [
    {
      name: "Professional",
      price: "$49",
      features: [
        "AI Legal Analysis",
        "Document Generation",
        "Case Management",
        "5 Cases / Month",
        "Email Support"
      ]
    },
    {
      name: "Business",
      price: "$149",
      features: [
        "Everything in Professional",
        "Unlimited Cases",
        "Team Collaboration",
        "Advanced Analytics",
        "Priority Support",
        "Custom Templates"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Business",
        "GDPR/CCPA Compliance",
        "SSO Integration",
        "Audit Logging",
        "Dedicated Account Manager",
        "Custom Integrations",
        "SLA Agreement"
      ]
    }
  ];

  const handleSignupNext = () => {
    if (signupStep < 3) {
      setSignupStep(signupStep + 1);
    }
  };

  const handleSignupSubmit = () => {
    // Handle final signup submission
    console.log("Signup data:", signupData);
    // Redirect to dashboard or show success message
  };

  // Auto-rotate featured screenshots
  useEffect(() => {
    if (dashboardScreenshots.length > 1) {
      const interval = setInterval(() => {
        setSelectedFeature((prev) => (prev + 1) % dashboardScreenshots.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dashboardScreenshots.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Wizzered</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Button>Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Dashboard Screenshots */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                <Award className="w-4 h-4 mr-2" />
                AI-Powered Legal Technology
              </Badge>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {config?.heroTitle || "Transform Your Legal Practice with AI"}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {config?.heroSubtitle || "Advanced AI assistant with 20+ years of legal experience. Strategic analysis, automated document generation, and comprehensive case management in one platform."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Platform Demo</DialogTitle>
                      <DialogDescription>
                        See how Wizzered transforms legal workflows
                      </DialogDescription>
                    </DialogHeader>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-500">Demo video coming soon</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="lg" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Free Trial
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  No credit card required
                </div>
              </div>
            </div>
            
            {/* Dashboard Screenshots Carousel */}
            <div className="relative">
              {dashboardScreenshots.length > 0 ? (
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-sm text-gray-600">Wizzered Dashboard</span>
                  </div>
                  <img 
                    src={dashboardScreenshots[selectedFeature]} 
                    alt="Dashboard Screenshot"
                    className="w-full h-auto"
                  />
                  {dashboardScreenshots.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {dashboardScreenshots.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedFeature(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === selectedFeature ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-sm text-gray-600">Wizzered Dashboard</span>
                  </div>
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Dashboard screenshots will appear here when uploaded by admin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Legal AI Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to transform your legal practice with advanced AI assistance, 
              professional document generation, and enterprise-grade security.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    {feature.icon === 'brain' && <Zap className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'file-text' && <FileText className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'folder' && <Users className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'wand' && <BookOpen className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'search' && <BarChart3 className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'shield' && <Shield className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'scale' && <Award className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'zap' && <Calendar className="w-6 h-6 text-blue-600" />}
                    {feature.icon === 'message-square' && <MessageSquare className="w-6 h-6 text-blue-600" />}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Legal Professionals
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Pricing</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Professional legal AI for every practice size
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-0 shadow-lg ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  {plan.tokenLimit && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-sm">
                        {plan.tokenLimit}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.ctaText || "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Step Signup CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of legal professionals using AI to streamline their workflows
          </p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Get Started - Step {signupStep} of 3</DialogTitle>
                <DialogDescription>
                  Create your account to begin your free trial
                </DialogDescription>
              </DialogHeader>
              
              <Tabs value={signupStep.toString()} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="1">Basic</TabsTrigger>
                  <TabsTrigger value="2">Details</TabsTrigger>
                  <TabsTrigger value="3">Complete</TabsTrigger>
                </TabsList>
                
                <TabsContent value="1" className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      placeholder="First Name"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                    />
                    <Input
                      placeholder="Last Name"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSignupNext} className="w-full">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>
                
                <TabsContent value="2" className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      placeholder="Law Firm / Company"
                      value={signupData.company}
                      onChange={(e) => setSignupData({...signupData, company: e.target.value})}
                    />
                    <Input
                      placeholder="Your Role"
                      value={signupData.role}
                      onChange={(e) => setSignupData({...signupData, role: e.target.value})}
                    />
                    <Input
                      placeholder="Team Size"
                      value={signupData.teamSize}
                      onChange={(e) => setSignupData({...signupData, teamSize: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSignupNext} className="w-full">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>
                
                <TabsContent value="3" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Almost Done!</h3>
                    <p className="text-sm text-gray-600">Click below to complete your registration and start your free trial.</p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={handleSignupSubmit} className="w-full">
                      Complete Registration
                    </Button>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">or sign up with</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Globe className="w-4 h-4 mr-2" />
                          Google
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="w-4 h-4 mr-2" />
                          Microsoft
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-2xl font-bold">Wizzered</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-Powered Legal Technology for modern law practices.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/documentation" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/help-center" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Wizzered. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}