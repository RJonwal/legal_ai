
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  Scale, 
  FileText, 
  Users, 
  Star, 
  ArrowRight, 
  Check,
  Gavel,
  Shield,
  Clock,
  Award,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Play,
  CheckCircle,
  Globe,
  Lock,
  Brain,
  MessageSquare,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  Search,
  FileSearch,
  Calendar,
  Briefcase,
  DollarSign,
  ThumbsUp,
  BookOpen,
  Lightbulb,
  Rocket,
  Users2,
  Shield as ShieldCheck,
  Clock as ClockIcon,
  Star as StarIcon,
  Quote
} from "lucide-react";
import { SiFacebook, SiX, SiLinkedin } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import ChatWidget from "@/components/chat/chat-widget";
import Footer from "@/components/layout/footer";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Load landing page configuration with error handling
  const { data: landingConfig } = useQuery({
    queryKey: ['landing-config'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/landing-config');
        if (!response.ok) throw new Error('Failed to fetch config');
        return response.json();
      } catch (error) {
        console.warn('Landing config not available, using defaults');
        return {};
      }
    },
    retry: false,
    staleTime: Infinity
  });

  const { data: brandingConfig } = useQuery({
    queryKey: ['branding-config'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/branding-config');
        if (!response.ok) throw new Error('Failed to fetch branding');
        return response.json();
      } catch (error) {
        console.warn('Branding config not available, using defaults');
        return {};
      }
    },
    retry: false,
    staleTime: Infinity
  });

  const handleGetStarted = () => {
    setLocation("/register");
  };

  const handleWatchDemo = () => {
    // Demo functionality can be added later
    console.log("Demo requested");
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Partner",
      company: "Mitchell & Associates",
      content: "LegalAI Pro has transformed how we handle case preparation. The AI analysis is incredibly accurate and saves us hours of research time. Our firm's efficiency has increased by 300%.",
      rating: 5,
      image: "/api/placeholder/64/64"
    },
    {
      name: "Marcus Rodriguez",
      role: "Solo Practitioner",
      content: "As a solo attorney, this platform gives me the capabilities of a large firm. The document generation alone pays for itself within the first month.",
      rating: 5,
      image: "/api/placeholder/64/64"
    },
    {
      name: "Jennifer Chen",
      role: "Corporate Legal Counsel",
      company: "TechCorp Inc.",
      content: "The case management features and AI insights have revolutionized our legal department. We can now handle twice the caseload with the same team.",
      rating: 5,
      image: "/api/placeholder/64/64"
    },
    {
      name: "David Thompson",
      role: "Public Defender",
      content: "Even with limited resources, LegalAI Pro helps me provide better representation for my clients. The legal research capabilities are phenomenal.",
      rating: 5,
      image: "/api/placeholder/64/64"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{brandingConfig?.brand?.companyName || "LegalAI Pro"}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <Button variant="outline" onClick={() => setLocation("/login")}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="outline" size="sm" onClick={() => setLocation("/login")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Legal Assistant
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              {landingConfig?.hero?.title || "Your AI Legal"}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Partner</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {landingConfig?.hero?.subtitle || "Revolutionize your legal practice with AI-powered case management, document generation, and strategic analysis. Built for attorneys and pro se litigants alike."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold"
              >
                {landingConfig?.hero?.ctaText || "Start Free Trial"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleWatchDemo}
                className="px-8 py-4 text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Legal Professionals Worldwide
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
                <div className="text-sm text-gray-600">Law Firms</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Win Cases
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive AI platform provides all the tools modern legal professionals need 
              to deliver exceptional results for their clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Legal Analysis",
                description: "Advanced AI that analyzes cases like a senior attorney with 20+ years of experience",
                features: ["Case strategy recommendations", "Legal precedent analysis", "Risk assessment", "Outcome predictions"]
              },
              {
                icon: MessageSquare,
                title: "Intelligent Chat Assistant",
                description: "ChatGPT-like interface specifically trained for legal work and case management",
                features: ["Natural language queries", "Case-specific responses", "Proactive suggestions", "24/7 availability"]
              },
              {
                icon: FileText,
                title: "Document Generation",
                description: "Generate court-ready legal documents, pleadings, and contracts in seconds",
                features: ["Motion templates", "Contract drafting", "Legal briefs", "Custom documents"]
              },
              {
                icon: Shield,
                title: "Case Management",
                description: "Comprehensive case tracking and timeline management with AI insights",
                features: ["Client information", "Deadline tracking", "Progress monitoring", "Team collaboration"]
              },
              {
                icon: Zap,
                title: "Workflow Automation",
                description: "Automate repetitive tasks and focus on high-value legal work",
                features: ["Document automation", "Client communications", "Calendar integration", "Task scheduling"]
              },
              {
                icon: TrendingUp,
                title: "Analytics & Insights",
                description: "Data-driven insights to improve your practice and win more cases",
                features: ["Case success rates", "Time tracking", "Performance metrics", "Financial analytics"]
              },
              {
                icon: Search,
                title: "Legal Research",
                description: "AI-powered research that finds relevant cases and precedents instantly",
                features: ["Case law search", "Statute analysis", "Citation checking", "Legal updates"]
              },
              {
                icon: Users2,
                title: "Client Portal",
                description: "Secure client communication and document sharing platform",
                features: ["Secure messaging", "Document sharing", "Case updates", "Payment processing"]
              },
              {
                icon: Target,
                title: "Strategic Planning",
                description: "AI-driven strategic recommendations for case planning and execution",
                features: ["Case timeline", "Resource allocation", "Risk mitigation", "Success probability"]
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How LegalAI Pro Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our intuitive platform designed for legal professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Case",
                description: "Upload case documents, notes, and relevant information to our secure platform",
                icon: FileText
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our AI analyzes your case, identifies key issues, and provides strategic recommendations",
                icon: Brain
              },
              {
                step: "03",
                title: "Take Action",
                description: "Generate documents, manage deadlines, and collaborate with your team using AI insights",
                icon: Rocket
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-8 left-16 w-full h-0.5 bg-blue-200 hidden md:block" 
                     style={{ display: index === 2 ? 'none' : 'block' }}></div>
                <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from legal professionals who use LegalAI Pro daily
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="mb-16">
            <Card className="max-w-4xl mx-auto border-2 border-blue-200">
              <CardContent className="pt-8">
                <div className="text-center">
                  <Quote className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                  <p className="text-2xl text-gray-700 mb-8 italic">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <img 
                      src={testimonials[activeTestimonial].image} 
                      alt={testimonials[activeTestimonial].name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</p>
                      <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                      {testimonials[activeTestimonial].company && (
                        <p className="text-sm text-gray-500">{testimonials[activeTestimonial].company}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-300 ${
                  index === activeTestimonial ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setActiveTestimonial(index)}
              >
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing for Every Practice
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your practice size and needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "month",
                description: "Perfect for solo practitioners and small firms",
                features: [
                  "5 Active Cases",
                  "Basic AI Analysis", 
                  "Document Generation",
                  "Email Support",
                  "Mobile App Access",
                  "10GB Storage",
                  "Basic Templates"
                ],
                popular: false,
                cta: "Start Free Trial"
              },
              {
                name: "Professional",
                price: "$79",
                period: "month",
                description: "Ideal for growing practices and medium firms",
                features: [
                  "25 Active Cases",
                  "Advanced AI Analysis",
                  "Unlimited Documents",
                  "Priority Support",
                  "API Access",
                  "Team Collaboration",
                  "100GB Storage",
                  "Custom Templates",
                  "Analytics Dashboard"
                ],
                popular: true,
                cta: "Start Free Trial"
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "month",
                description: "For large firms and corporate legal departments",
                features: [
                  "Unlimited Cases",
                  "Premium AI Features",
                  "Custom Integrations",
                  "24/7 Phone Support",
                  "Dedicated Account Manager",
                  "Advanced Analytics",
                  "Unlimited Storage",
                  "White-label Options",
                  "SSO Integration",
                  "Custom Workflows"
                ],
                popular: false,
                cta: "Contact Sales"
              }
            ].map((plan, index) => (
              <Card key={index} className={`border-2 relative ${plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={plan.name === 'Enterprise' ? () => setLocation('/contact') : handleGetStarted}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Enterprise-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-green-500" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-green-500" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built by Legal Professionals, for Legal Professionals
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                LegalAI Pro was founded by a team of attorneys and technologists who understood the challenges 
                facing modern legal practice. We've combined decades of legal experience with cutting-edge AI 
                technology to create the most comprehensive legal platform available.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">2018</div>
                  <div className="text-gray-600">Founded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.5K+</div>
                  <div className="text-gray-600">Law Firms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">15M+</div>
                  <div className="text-gray-600">Documents Generated</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-blue-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 mb-6">
                  To democratize access to sophisticated legal tools and make AI-powered legal assistance 
                  available to every attorney and pro se litigant, regardless of practice size or budget.
                </p>
                <div className="flex items-center gap-4">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <div className="font-semibold">Award-Winning Platform</div>
                    <div className="text-blue-200">Legal Tech Innovation 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about LegalAI Pro
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is my data secure and confidential?",
                answer: "Yes, absolutely. We use enterprise-grade AES-256 encryption and are fully compliant with attorney-client privilege requirements. All data is stored securely and never shared with third parties."
              },
              {
                question: "Can I integrate LegalAI Pro with my existing practice management software?",
                answer: "Yes, we offer integrations with popular practice management platforms and provide API access for custom integrations. Our team can help you set up seamless workflows."
              },
              {
                question: "How accurate is the AI legal analysis?",
                answer: "Our AI has been trained on millions of legal documents and cases, achieving over 95% accuracy in legal analysis. However, it's designed to assist, not replace, professional legal judgment."
              },
              {
                question: "What happens to my data if I cancel my subscription?",
                answer: "You can export all your data at any time. After cancellation, we provide a 30-day grace period to download your files before permanent deletion."
              },
              {
                question: "Do you offer training and support?",
                answer: "Yes, we provide comprehensive onboarding, training materials, and ongoing support. Enterprise customers receive dedicated account management and training sessions."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stay Updated with Legal Tech Insights
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest news, legal tech insights, and platform updates delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900"
              required
            />
            <Button type="submit" variant="secondary" className="px-6 py-3">
              Subscribe
            </Button>
          </form>
          <p className="text-blue-200 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of legal professionals who are already using AI to win more cases, 
            serve clients better, and grow their practice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
          <div className="flex justify-center items-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <ChatWidget />
    </div>
  );
}
