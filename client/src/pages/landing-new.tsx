import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Play, 
  Check, 
  ChevronRight, 
  Star, 
  Users, 
  Shield, 
  Zap, 
  ArrowRight,
  Scale,
  FileText,
  Brain,
  Clock,
  Award,
  Globe,
  MessageSquare,
  BookOpen,
  Briefcase,
  Gavel,
  Building
} from "lucide-react";

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;
  plans: Array<{
    id: string;
    name: string;
    price: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
  }>;
}

export default function NewLanding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [userType, setUserType] = useState<'attorney' | 'pro_se' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    barNumber: '',
    state: '',
    practiceAreas: [] as string[],
    caseType: '',
    experience: ''
  });

  // Fetch landing page configuration
  const { data: config, isLoading } = useQuery<LandingConfig>({
    queryKey: ['landing-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/landing-config');
      if (!response.ok) {
        // Return default config if API fails
        return {
          heroTitle: "AI-Powered Legal Technology for Modern Legal Practice",
          heroSubtitle: "Transform your legal practice with intelligent automation, comprehensive document generation, and strategic case management.",
          heroVideoUrl: "https://player.vimeo.com/video/example",
          features: [
            {
              id: "ai-analysis",
              title: "Advanced AI Legal Analysis",
              description: "Get strategic insights and recommendations from our AI attorney with 20+ years of experience.",
              icon: "Brain"
            },
            {
              id: "document-generation", 
              title: "Intelligent Document Generation",
              description: "Create professional legal documents with AI-powered templates and automation.",
              icon: "FileText"
            },
            {
              id: "case-management",
              title: "Comprehensive Case Management", 
              description: "Organize, track, and manage all your cases with intuitive workflow tools.",
              icon: "Briefcase"
            },
            {
              id: "court-preparation",
              title: "Court Preparation Tools",
              description: "Prepare for court with confidence using our specialized legal research and preparation features.",
              icon: "Gavel"
            }
          ],
          testimonials: [
            {
              id: "1",
              name: "Sarah Mitchell",
              role: "Senior Partner, Mitchell & Associates",
              content: "This platform has revolutionized our practice. The AI insights are incredibly accurate and save us hours of research time.",
              rating: 5
            },
            {
              id: "2", 
              name: "Robert Chen",
              role: "Solo Practitioner",
              content: "As a solo attorney, this tool levels the playing field. I can now handle complex cases with confidence.",
              rating: 5
            }
          ],
          plans: [
            {
              id: "pro_se_plan",
              name: "Pro Se",
              price: 29,
              features: ["Basic AI assistance", "Document templates", "Case tracking", "Email support"],
              isPopular: false,
              isActive: true
            },
            {
              id: "professional_plan", 
              name: "Professional",
              price: 99,
              features: ["Full AI analysis", "Unlimited documents", "Advanced case management", "Priority support", "Court preparation tools"],
              isPopular: true,
              isActive: true
            }
          ]
        };
      }
      return response.json();
    },
  });

  const getIcon = (iconName: string) => {
    const icons = {
      Brain: <Brain className="h-8 w-8" />,
      FileText: <FileText className="h-8 w-8" />,
      Briefcase: <Briefcase className="h-8 w-8" />,
      Gavel: <Gavel className="h-8 w-8" />,
      Scale: <Scale className="h-8 w-8" />,
      Shield: <Shield className="h-8 w-8" />,
      Zap: <Zap className="h-8 w-8" />,
      Globe: <Globe className="h-8 w-8" />
    };
    return icons[iconName as keyof typeof icons] || <Brain className="h-8 w-8" />;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowSignup(true);
    setSignupStep(1);
  };

  const handleNextStep = () => {
    if (signupStep === 1 && userType) {
      setSignupStep(2);
    } else if (signupStep === 2) {
      setSignupStep(3);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userType,
          selectedPlan
        }),
      });

      if (response.ok) {
        // Redirect to dashboard or show success message
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleSSOLogin = (provider: 'google' | 'microsoft') => {
    window.location.href = `/api/auth/${provider}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Wizzered</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
              <Button onClick={() => setShowSignup(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Powered Legal Technology
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {config?.heroTitle || "AI-Powered Legal Technology for Modern Legal Practice"}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {config?.heroSubtitle || "Transform your legal practice with intelligent automation, comprehensive document generation, and strategic case management."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowSignup(true)}
                >
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      <Play className="h-5 w-5 mr-2" />
                      Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>See Wizzered in Action</DialogTitle>
                      <DialogDescription>
                        Watch how Wizzered transforms legal practice with AI-powered tools
                      </DialogDescription>
                    </DialogHeader>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      {config?.heroVideoUrl ? (
                        <iframe
                          src={config.heroVideoUrl}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-center space-y-4">
                          <Play className="h-16 w-16 text-gray-400 mx-auto" />
                          <p className="text-gray-500">Demo video coming soon</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-6 w-6 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">AI Legal Analysis</p>
                          <p className="text-sm text-gray-600">Analyzing case strength and recommending strategy...</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Document Generated</p>
                          <p className="text-sm text-gray-600">Motion to Dismiss completed successfully</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Clock className="h-6 w-6 text-orange-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Deadline Alert</p>
                          <p className="text-sm text-gray-600">Discovery due in 3 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Powerful Features for Legal Professionals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to practice law more efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {config?.features.map((feature) => (
              <Card key={feature.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                    {getIcon(feature.icon)}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">
              Flexible pricing for attorneys and pro se litigants
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {config?.plans.filter(plan => plan.isActive).map((plan) => (
              <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-blue-500 shadow-xl' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.isPopular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.isPopular ? "Start Free Trial" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Trusted by Legal Professionals</h2>
            <p className="text-xl text-gray-600">
              See what attorneys are saying about Wizzered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {config?.testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Legal Practice?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust Wizzered for their practice management needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => setShowSignup(true)}
            >
              Start Your Free Trial Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Multi-step Signup Modal */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {signupStep === 1 && "Choose Your User Type"}
              {signupStep === 2 && "Create Your Account"}
              {signupStep === 3 && "Professional Information"}
            </DialogTitle>
          </DialogHeader>

          {signupStep === 1 && (
            <div className="space-y-4">
              <Card 
                className={`cursor-pointer border-2 ${userType === 'attorney' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setUserType('attorney')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Briefcase className="h-6 w-6" />
                    <span>Attorney/Legal Professional</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced legal tools, unlimited cases, priority support
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${userType === 'pro_se' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setUserType('pro_se')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Users className="h-6 w-6" />
                    <span>Pro Se Litigant</span>
                  </CardTitle>
                  <CardDescription>
                    Essential legal assistance for self-representation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Button 
                className="w-full" 
                onClick={handleNextStep}
                disabled={!userType}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {signupStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSSOLogin('google')}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSSOLogin('microsoft')}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                  </svg>
                  Continue with Microsoft
                </Button>
              </div>

              <Button 
                className="w-full" 
                onClick={userType === 'attorney' ? handleNextStep : handleSignup}
              >
                {userType === 'attorney' ? 'Continue' : 'Create Account'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {signupStep === 3 && userType === 'attorney' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="barNumber">Bar Number</Label>
                <Input
                  id="barNumber"
                  value={formData.barNumber}
                  onChange={(e) => setFormData({...formData, barNumber: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="state">State of Practice</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSignup}
              >
                Create Account
                <Check className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}