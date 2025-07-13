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
  TrendingUp
} from "lucide-react";
import { SiFacebook, SiX, SiLinkedin } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import ChatWidget from "@/components/chat/chat-widget";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  const handleGetStarted = () => {
    setLocation("/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LegalAI Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Get Started
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
              Your AI Legal
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Partner</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Revolutionize your legal practice with AI-powered case management, document generation, 
              and strategic analysis. Built for attorneys and pro se litigants alike.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
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
                description: "Advanced AI that thinks like a senior attorney with 20+ years of experience",
                features: ["Case strategy recommendations", "Legal precedent analysis", "Risk assessment"]
              },
              {
                icon: MessageSquare,
                title: "Intelligent Chat Assistant",
                description: "ChatGPT-like interface specifically trained for legal work",
                features: ["Natural language queries", "Case-specific responses", "Proactive suggestions"]
              },
              {
                icon: FileText,
                title: "Document Generation",
                description: "Generate court-ready legal documents in seconds",
                features: ["Motion templates", "Contract drafting", "Legal briefs"]
              },
              {
                icon: Shield,
                title: "Case Management",
                description: "Comprehensive case tracking and timeline management",
                features: ["Client information", "Deadline tracking", "Progress monitoring"]
              },
              {
                icon: Zap,
                title: "Workflow Automation",
                description: "Automate repetitive tasks and focus on high-value work",
                features: ["Document automation", "Client communications", "Calendar integration"]
              },
              {
                icon: TrendingUp,
                title: "Analytics & Insights",
                description: "Data-driven insights to improve your practice",
                features: ["Case success rates", "Time tracking", "Performance metrics"]
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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

      {/* Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Legal Professionals Worldwide
            </h2>
            <div className="flex justify-center items-center gap-12 text-gray-400">
              <div className="text-4xl font-bold">10,000+</div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-4xl font-bold">24/7</div>
            </div>
            <div className="flex justify-center items-center gap-12 text-sm text-gray-600 mt-2">
              <div>Active Users</div>
              <div>Law Firms</div>
              <div>Uptime</div>
              <div>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from legal professionals who use LegalAI Pro daily
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Partner, Mitchell & Associates",
                content: "LegalAI Pro has transformed how we handle case preparation. The AI analysis is incredibly accurate and saves us hours of research time.",
                rating: 5
              },
              {
                name: "Marcus Rodriguez",
                role: "Solo Practitioner",
                content: "As a solo attorney, this platform gives me the capabilities of a large firm. The document generation alone pays for itself.",
                rating: 5
              },
              {
                name: "Jennifer Chen",
                role: "Corporate Legal Counsel",
                content: "The case management features and AI insights have improved our legal department's efficiency by 300%. Absolutely game-changing.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing for Every Practice
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your practice size and needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                description: "Perfect for solo practitioners and small firms",
                features: [
                  "5 Active Cases",
                  "Basic AI Analysis",
                  "Document Generation",
                  "Email Support",
                  "Mobile App Access"
                ],
                popular: false
              },
              {
                name: "Professional",
                price: "$79",
                description: "Ideal for growing practices and medium firms",
                features: [
                  "25 Active Cases",
                  "Advanced AI Analysis",
                  "Unlimited Documents",
                  "Priority Support",
                  "API Access",
                  "Team Collaboration"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "$199",
                description: "For large firms and corporate legal departments",
                features: [
                  "Unlimited Cases",
                  "Premium AI Features",
                  "Custom Integrations",
                  "24/7 Phone Support",
                  "Dedicated Account Manager",
                  "Advanced Analytics"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`border-2 relative ${plan.popular ? 'border-blue-500' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/month</span>
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
                    onClick={handleGetStarted}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of legal professionals who are already using AI to win more cases and serve clients better.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">LegalAI Pro</span>
              </div>
              <p className="text-gray-400 mb-4">
                The future of legal practice is here. Empower your firm with AI-driven insights and automation.
              </p>
              <div className="flex space-x-4">
                <SiX className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <SiLinkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <SiFacebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-LEGAL-AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@legalai.pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-700" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 LegalAI Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Lock className="h-4 w-4" />
              <span>SOC 2 Compliant</span>
              <Globe className="h-4 w-4" />
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}