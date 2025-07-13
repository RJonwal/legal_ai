import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, Users, ArrowRight, Check, Shield, Clock, Brain, Star, Zap, Building, MessageSquare, Phone, Mail, MapPin, ChevronRight, Globe, Award, Target, Cpu, BookOpen, Gavel, Search, Lock } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BrandingProvider, useBranding } from "@/components/ui/branding-provider";
import { Logo } from "@/components/ui/logo";
import USCookieBanner from "@/components/compliance/us-cookie-banner";
import EnhancedLiveChat from "@/components/live-chat/enhanced-live-chat";

// Live Chat Widget Component
const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "support", timestamp: new Date() }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "user", timestamp: new Date() }]);
      setMessage('');
      // Simulate response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "Thank you for your message. A support agent will be with you shortly.", sender: "support", timestamp: new Date() }]);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border mb-4 w-80 h-96 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Live Chat Support</h3>
            <p className="text-sm opacity-90">We're here to help!</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg text-sm"
            />
            <Button size="sm" onClick={sendMessage} className="ml-2">Send</Button>
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};

// Testimonials Component
const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Partner, Johnson & Associates",
      image: "/api/placeholder/64/64",
      content: "Wizzered has transformed our legal practice. The AI-powered document generation saves us 15+ hours per week.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Pro Se Litigant",
      image: "/api/placeholder/64/64",
      content: "As someone representing myself, Wizzered made complex legal procedures accessible and manageable.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Corporate Counsel",
      image: "/api/placeholder/64/64",
      content: "The case management features and AI insights help us stay ahead of deadlines and strategic decisions.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Legal Professionals Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of attorneys and pro se litigants who have transformed their legal practice with Wizzered
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Grid Component
const FeaturesGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Legal Analysis",
      description: "Advanced AI that thinks like a senior attorney with 20+ years of experience",
      color: "text-blue-600"
    },
    {
      icon: FileText,
      title: "Automated Document Generation",
      description: "Create professional legal documents with court-compatible formatting",
      color: "text-green-600"
    },
    {
      icon: Scale,
      title: "Case Management",
      description: "Comprehensive case tracking with timeline management and milestone alerts",
      color: "text-purple-600"
    },
    {
      icon: Search,
      title: "Legal Research Assistant",
      description: "Instant access to case law, statutes, and legal precedents",
      color: "text-indigo-600"
    },
    {
      icon: MessageSquare,
      title: "Smart Chat Interface",
      description: "Interactive legal consultation with contextual case insights",
      color: "text-teal-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption with GDPR/CCPA compliance",
      color: "text-red-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Legal Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive legal technology platform designed for modern legal practice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Pro Se",
      price: "$49",
      period: "month",
      description: "Perfect for individuals representing themselves",
      features: [
        "AI Legal Assistant",
        "Document Generation",
        "Case Management",
        "Legal Research",
        "Email Support",
        "5 Active Cases"
      ],
      popular: false
    },
    {
      name: "Attorney",
      price: "$149",
      period: "month",
      description: "Comprehensive solution for legal professionals",
      features: [
        "Everything in Pro Se",
        "Advanced AI Analysis",
        "Unlimited Cases",
        "Team Collaboration",
        "Time Tracking",
        "Priority Support",
        "Custom Templates",
        "API Access"
      ],
      popular: true
    },
    {
      name: "Law Firm",
      price: "$299",
      period: "month",
      description: "Enterprise features for law firms",
      features: [
        "Everything in Attorney",
        "Multi-user Access",
        "Admin Dashboard",
        "Advanced Analytics",
        "White-label Options",
        "Custom Integration",
        "Dedicated Support",
        "SLA Guarantee"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2' : 'border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-2">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="text-white" />
            </div>
            <p className="text-gray-400">
              Revolutionizing legal practice with AI-powered solutions for attorneys and pro se litigants.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="text-gray-400 hover:text-white">Legal Disclaimer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help-center" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link href="/documentation" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><a href="/documentation#api-reference" className="text-gray-400 hover:text-white">API Reference</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2025 Wizzered. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              <Lock className="h-3 w-3 mr-1" />
              AES-256 Encrypted
            </Badge>
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              <Shield className="h-3 w-3 mr-1" />
              GDPR/CCPA Compliant
            </Badge>
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              <Award className="h-3 w-3 mr-1" />
              SOC 2 Certified
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingContent = () => {
  const { brandingConfig } = useBranding();
  
  // Fetch admin landing configuration
  const { data: landingConfig } = useQuery({
    queryKey: ['/api/admin/landing-config'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Logo size="md" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {(landingConfig?.navigation?.links || [
                { text: "Features", href: "#features" },
                { text: "Pricing", href: "#pricing" },
                { text: "Testimonials", href: "#testimonials" },
                { text: "Support", href: "#support" }
              ]).map((link, index) => (
                <a key={index} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                  {link.text}
                </a>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 mb-4">
                <Zap className="h-4 w-4 mr-2" />
                {landingConfig?.hero?.badge || "AI-Powered Legal Technology"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              {landingConfig?.hero?.title?.split(' ').slice(0, -1).join(' ') || "Your AI Legal"}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> {landingConfig?.hero?.title?.split(' ').slice(-1)[0] || "Assistant"}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {landingConfig?.hero?.subtitle || "Transform your legal practice with cutting-edge AI technology. From case management to document generation, Wizzered empowers attorneys and pro se litigants with intelligent legal solutions."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold">
                  {landingConfig?.hero?.ctaText || "Start Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold">
                <MessageSquare className="mr-2 h-5 w-5" />
                Live Demo
              </Button>
            </div>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500 flex-wrap">
              {(landingConfig?.hero?.features || ["No Credit Card Required", "14-Day Free Trial", "Cancel Anytime"]).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-8">Trusted by legal professionals worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Building className="h-5 w-5 mr-2" />
                  10,000+ Law Firms
                </Badge>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Users className="h-5 w-5 mr-2" />
                  50,000+ Users
                </Badge>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <FileText className="h-5 w-5 mr-2" />
                  1M+ Documents
                </Badge>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Globe className="h-5 w-5 mr-2" />
                  50 States
                </Badge>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Award className="h-5 w-5 mr-2" />
                  99.9% Uptime
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="features">
        <FeaturesGrid />
      </div>

      <div id="testimonials">
        <Testimonials />
      </div>

      <div id="pricing">
        <PricingSection />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of legal professionals who have already revolutionized their practice with Wizzered's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <EnhancedLiveChat onPageLoad={true} />
      <USCookieBanner />
    </div>
  );
};

export default function Landing() {
  return (
    <BrandingProvider>
      <LandingContent />
    </BrandingProvider>
  );
}