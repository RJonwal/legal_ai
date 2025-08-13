import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, FileText, Users, ArrowRight, Check, Shield, Clock, Brain, Star, 
  Zap, Building, MessageSquare, Phone, Mail, MapPin, ChevronRight, Globe, 
  Award, Target, Cpu, BookOpen, Gavel, Search, Lock, TrendingUp, BarChart3,
  Sparkles, Shield as ShieldCheck, Layers, Rocket, Play, X, Menu, ChevronDown,
  UserCheck, FileCheck, Timer, DollarSign, Users as HeartHandshake, BookOpen as BookMarked
} from "@/lib/icons";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/logo";
import { ContactSalesModal } from "@/components/modals/contact-sales-modal";
import { DemoRequestModal } from "@/components/modals/demo-request-modal";
import { motion } from "framer-motion";

// Animated Stats Counter
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Video Demo Modal
const VideoDemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-xl max-w-4xl w-full aspect-video" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <div className="text-center text-white">
            <Play className="h-20 w-20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Product Demo Video</h3>
            <p className="text-lg opacity-90">See Wizzered in action</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Navigation with Mobile Menu
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#solutions" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Solutions</a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Testimonials</a>
            <a href="#resources" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Resources</a>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="lg" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg">
                Start Free Trial
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Features</a>
            <a href="#solutions" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Solutions</a>
            <a href="#pricing" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Pricing</a>
            <a href="#testimonials" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Testimonials</a>
            <div className="pt-4 space-y-3">
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section with Animation
const HeroSection = ({ onDemoClick }: { onDemoClick: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 10,000+ Legal Professionals</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              AI-Powered Legal
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Excellence
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform your legal practice with intelligent document automation, 
            comprehensive case management, and advanced AI analytics that deliver 
            results in minutes, not hours.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onDemoClick}
              className="px-8 py-6 text-lg border-2 hover:bg-gray-50"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch 3-Min Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-500" />
              <span>Setup in 60 Seconds</span>
            </div>
          </div>
        </motion.div>
        
        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-6xl">
            <div className="relative rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10"></div>
              <div className="bg-white p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <FileText className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle>Smart Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Generate court-ready documents in seconds with AI assistance</p>
                    </CardContent>
                  </Card>
                  <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardHeader>
                      <Brain className="h-8 w-8 text-indigo-600 mb-2" />
                      <CardTitle>AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Get strategic insights and recommendations for your cases</p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader>
                      <Shield className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle>Secure Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Bank-grade encryption and compliance with legal standards</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const stats = [
    { value: 10000, suffix: "+", label: "Legal Professionals", icon: Users },
    { value: 500000, suffix: "+", label: "Documents Generated", icon: FileText },
    { value: 98, suffix: "%", label: "Client Satisfaction", icon: Star },
    { value: 15, suffix: "hrs", label: "Saved Weekly", icon: Clock }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <stat.icon className="h-8 w-8 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Grid with Icons
const FeaturesGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "Leverage cutting-edge AI to analyze cases, identify patterns, and predict outcomes with unprecedented accuracy.",
      benefits: ["Strategic recommendations", "Risk assessment", "Case outcome prediction"]
    },
    {
      icon: FileText,
      title: "Intelligent Document Generation",
      description: "Create professional legal documents in minutes with AI-powered templates and automated formatting.",
      benefits: ["Court-compliant formatting", "Custom templates", "Multi-jurisdiction support"]
    },
    {
      icon: Scale,
      title: "Comprehensive Case Management",
      description: "Track every aspect of your cases from intake to resolution with our intuitive management system.",
      benefits: ["Timeline tracking", "Client communication", "Deadline management"]
    },
    {
      icon: Search,
      title: "Legal Research Assistant",
      description: "Access millions of legal precedents and statutes with AI-powered research capabilities.",
      benefits: ["Case law analysis", "Statute interpretation", "Citation checking"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with the highest legal industry standards.",
      benefits: ["AES-256 encryption", "GDPR/CCPA compliant", "SOC 2 certified"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with colleagues and clients through secure collaboration tools.",
      benefits: ["Real-time updates", "Role-based access", "Client portals"]
    }
  ];
  
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-blue-100 text-blue-800">
            <Layers className="h-4 w-4 mr-2" />
            Comprehensive Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines powerful AI technology with intuitive design to deliver 
            a complete legal practice management solution.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Solutions Section
const SolutionsSection = () => {
  const solutions = [
    {
      title: "For Solo Practitioners",
      icon: UserCheck,
      description: "Streamline your practice with AI-powered tools designed for efficiency",
      features: ["Client intake automation", "Document templates", "Time tracking", "Invoice generation"],
      color: "blue"
    },
    {
      title: "For Law Firms",
      icon: Building,
      description: "Scale your firm with enterprise features and team collaboration",
      features: ["Multi-user access", "Case assignment", "Performance analytics", "Custom workflows"],
      color: "indigo"
    },
    {
      title: "For Corporate Legal",
      icon: Gavel,
      description: "Manage corporate legal matters with precision and compliance",
      features: ["Contract management", "Compliance tracking", "Risk assessment", "Board reporting"],
      color: "purple"
    },
    {
      title: "For Pro Se Litigants",
      icon: HeartHandshake,
      description: "Navigate legal proceedings with confidence and expert guidance",
      features: ["Step-by-step guidance", "Form assistance", "Legal terminology help", "Court preparation"],
      color: "green"
    }
  ];
  
  return (
    <section id="solutions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-800">
            <Target className="h-4 w-4 mr-2" />
            Tailored Solutions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for Every Legal Professional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a solo practitioner or managing a large firm, our platform adapts to your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full hover:shadow-xl transition-all duration-300 border-2 border-${solution.color}-100`}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${solution.color}-100 flex items-center justify-center`}>
                      <solution.icon className={`h-6 w-6 text-${solution.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold">{solution.title}</h3>
                  </div>
                  <p className="text-gray-600">{solution.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-${solution.color}-500`}></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
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
      name: "Starter",
      price: 49,
      description: "Perfect for individuals and small practices",
      features: [
        "Up to 10 active cases",
        "Basic document templates",
        "AI legal assistant",
        "Email support",
        "Mobile app access",
        "256-bit encryption"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: 149,
      description: "Comprehensive tools for growing practices",
      features: [
        "Unlimited active cases",
        "Advanced document automation",
        "Priority AI processing",
        "Phone & chat support",
        "Team collaboration (5 users)",
        "API access",
        "Custom templates",
        "Advanced analytics"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Custom AI training",
        "Dedicated account manager",
        "On-premise deployment option",
        "Custom integrations",
        "SLA guarantee",
        "White-label options"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];
  
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-green-100 text-green-800">
            <DollarSign className="h-4 w-4 mr-2" />
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={plan.popular ? 'relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2">
                    <Star className="h-4 w-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`h-full ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border-gray-200'}`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="text-5xl font-bold">${plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">{plan.price}</span>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6">
                    {plan.cta === "Contact Sales" ? (
                      <Button className="w-full" size="lg" variant="outline">
                        {plan.cta}
                      </Button>
                    ) : (
                      <Link href="/register">
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}
                          size="lg"
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials with Real Content
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Jennifer Martinez",
      role: "Managing Partner, Martinez & Associates",
      content: "Wizzered transformed our document workflow. What used to take hours now takes minutes. The AI suggestions are remarkably accurate and have improved our brief quality significantly.",
      rating: 5,
      image: "JM"
    },
    {
      name: "David Thompson",
      role: "Solo Practitioner",
      content: "As a solo attorney, Wizzered is like having a full support team. The case management features keep me organized, and the document automation has doubled my capacity to take on new clients.",
      rating: 5,
      image: "DT"
    },
    {
      name: "Sarah Chen",
      role: "Corporate Legal Counsel",
      content: "The contract analysis features have been game-changing for our legal department. We've reduced contract review time by 70% while improving accuracy. Highly recommended for in-house teams.",
      rating: 5,
      image: "SC"
    },
    {
      name: "Robert Williams",
      role: "Pro Se Litigant",
      content: "I was overwhelmed representing myself until I found Wizzered. The step-by-step guidance and document templates gave me confidence in court. It's like having a lawyer in your pocket.",
      rating: 5,
      image: "RW"
    },
    {
      name: "Lisa Anderson",
      role: "Family Law Attorney",
      content: "The client communication features have improved my practice immensely. Clients love the portal access, and I love the automated updates. It's reduced client calls by 60%.",
      rating: 5,
      image: "LA"
    },
    {
      name: "Michael Foster",
      role: "Criminal Defense Attorney",
      content: "The case timeline and evidence management features are exceptional. I can build stronger defenses with the AI-powered case analysis. It's become an essential tool in my practice.",
      rating: 5,
      image: "MF"
    }
  ];
  
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-yellow-100 text-yellow-800">
            <Star className="h-4 w-4 mr-2" />
            Client Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by Legal Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands who have transformed their legal practice with Wizzered
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Resources Section
const ResourcesSection = () => {
  const resources = [
    {
      title: "Legal AI Guide",
      description: "Learn how AI is transforming legal practice",
      icon: BookOpen,
      link: "/documentation"
    },
    {
      title: "Best Practices",
      description: "Tips for maximizing your Wizzered experience",
      icon: BookMarked,
      link: "/documentation"
    },
    {
      title: "API Documentation",
      description: "Integrate Wizzered with your existing tools",
      icon: Cpu,
      link: "/documentation"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step guides for all features",
      icon: Play,
      link: "/documentation"
    }
  ];
  
  return (
    <section id="resources" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-purple-100 text-purple-800">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Center
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Resources to Help You Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access guides, tutorials, and best practices to get the most out of Wizzered
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <Link key={index} href={resource.link}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <resource.icon className="h-10 w-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{resource.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of legal professionals already using Wizzered to work smarter, not harder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Start Your Free Trial
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
            >
              Schedule a Demo
              <Phone className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-8">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Logo size="md" className="mb-4" />
            <p className="text-gray-400">
              AI-powered legal technology for modern legal professionals.
            </p>
            <div className="flex gap-4 mt-6">
              <Badge variant="outline" className="text-gray-400 border-gray-700">
                <ShieldCheck className="h-3 w-3 mr-1" />
                SOC 2
              </Badge>
              <Badge variant="outline" className="text-gray-400 border-gray-700">
                <Lock className="h-3 w-3 mr-1" />
                GDPR
              </Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © 2025 Wizzered. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="mailto:support@wizzered.com" className="hover:text-white transition-colors">
              <Mail className="h-5 w-5" />
            </a>
            <a href="tel:1-800-WIZZERED" className="hover:text-white transition-colors">
              <Phone className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Component
export default function LandingNew() {
  const [isContactSalesOpen, setIsContactSalesOpen] = useState(false);
  const [isDemoRequestOpen, setIsDemoRequestOpen] = useState(false);
  const [isVideoDemoOpen, setIsVideoDemoOpen] = useState(false);
  
  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      
      <Navigation />
      <HeroSection onDemoClick={() => setIsVideoDemoOpen(true)} />
      <StatsSection />
      <FeaturesGrid />
      <SolutionsSection />
      <PricingSection />
      <TestimonialsSection />
      <ResourcesSection />
      <CTASection />
      <Footer />
      
      {/* Modals */}
      <ContactSalesModal 
        open={isContactSalesOpen} 
        onOpenChange={setIsContactSalesOpen} 
      />
      <DemoRequestModal 
        open={isDemoRequestOpen}
        onOpenChange={setIsDemoRequestOpen}
      />
      <VideoDemoModal
        isOpen={isVideoDemoOpen}
        onClose={() => setIsVideoDemoOpen(false)}
      />
    </div>
  );
}