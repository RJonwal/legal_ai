import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Book, 
  Code, 
  FileText, 
  Settings, 
  Users, 
  MessageSquare, 
  Shield, 
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle,
  Zap
} from "@/lib/icons";
import { Link } from "wouter";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("getting-started");

  const documentationSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Book,
      content: {
        overview: "Welcome to Wizzered! This guide will help you get started with our AI-powered legal technology platform.",
        sections: [
          {
            title: "Quick Start Guide",
            content: "Learn how to set up your account and create your first case in under 5 minutes."
          },
          {
            title: "Dashboard Overview",
            content: "Understand the main components of your Wizzered dashboard and how to navigate effectively."
          },
          {
            title: "First Case Creation",
            content: "Step-by-step guide to creating and managing your first legal case."
          }
        ]
      }
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      icon: MessageSquare,
      content: {
        overview: "Learn how to effectively use Wizzered's AI legal assistant for research, document generation, and case analysis.",
        sections: [
          {
            title: "Effective Prompting",
            content: "Best practices for asking questions and getting accurate legal guidance from the AI."
          },
          {
            title: "Document Generation",
            content: "How to use AI to generate legal documents, contracts, and correspondence."
          },
          {
            title: "Legal Research",
            content: "Leverage AI for comprehensive legal research and case precedent analysis."
          }
        ]
      }
    },
    {
      id: "case-management",
      title: "Case Management",
      icon: FileText,
      content: {
        overview: "Comprehensive guide to managing your legal cases with Wizzered's advanced case management system.",
        sections: [
          {
            title: "Case Organization",
            content: "Structure and organize your cases for maximum efficiency and collaboration."
          },
          {
            title: "Timeline Management",
            content: "Track important dates, deadlines, and milestones in your legal cases."
          },
          {
            title: "Document Management",
            content: "Store, organize, and share legal documents securely within your cases."
          }
        ]
      }
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: Code,
      content: {
        overview: "Complete API documentation for developers integrating with Wizzered's platform.",
        sections: [
          {
            title: "Authentication",
            content: "How to authenticate and authorize API requests securely."
          },
          {
            title: "Endpoints",
            content: "Complete list of available API endpoints with request/response examples."
          },
          {
            title: "SDKs and Libraries",
            content: "Official SDKs and community libraries for popular programming languages."
          }
        ]
      }
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      content: {
        overview: "Understanding Wizzered's security measures and privacy protections for your legal data.",
        sections: [
          {
            title: "Data Encryption",
            content: "How we protect your data with enterprise-grade encryption at rest and in transit."
          },
          {
            title: "Access Controls",
            content: "Managing user permissions and access controls for your legal practice."
          },
          {
            title: "Compliance",
            content: "GDPR, CCPA, and other regulatory compliance features and settings."
          }
        ]
      }
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: Zap,
      content: {
        overview: "Connect Wizzered with your existing legal technology stack and workflow tools.",
        sections: [
          {
            title: "Legal Software",
            content: "Integrate with popular legal practice management and billing software."
          },
          {
            title: "Document Systems",
            content: "Connect with document management systems and cloud storage providers."
          },
          {
            title: "Communication Tools",
            content: "Integrate with email, messaging, and video conferencing platforms."
          }
        ]
      }
    }
  ];

  const codeExamples = [
    {
      title: "Create a New Case",
      language: "javascript",
      code: `const response = await fetch('/api/cases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: 'New Legal Case',
    type: 'civil',
    clientName: 'John Doe',
    description: 'Case description...'
  })
});

const newCase = await response.json();
console.log('Created case:', newCase);`
    },
    {
      title: "Generate Document",
      language: "javascript",
      code: `const response = await fetch('/api/documents/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    caseId: 'case-123',
    type: 'contract',
    template: 'service-agreement',
    data: {
      clientName: 'John Doe',
      serviceName: 'Legal Consultation'
    }
  })
});

const document = await response.json();
console.log('Generated document:', document);`
    }
  ];

  const quickLinks = [
    { title: "API Authentication", url: "#authentication", category: "API" },
    { title: "Case Management Guide", url: "#case-management", category: "Guides" },
    { title: "AI Assistant Best Practices", url: "#ai-assistant", category: "AI" },
    { title: "Security Overview", url: "#security", category: "Security" },
    { title: "Integration Examples", url: "#integrations", category: "Integrations" },
    { title: "Troubleshooting", url: "#troubleshooting", category: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Wizzered
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Documentation</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/help-center">
                <Button variant="outline">Help Center</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {documentationSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Documentation
              </h1>
              <p className="text-xl text-gray-600">
                Everything you need to know about using Wizzered effectively
              </p>
            </div>

            {/* Content Sections */}
            {documentationSections.map((section) => (
              <div
                key={section.id}
                className={`${activeTab === section.id ? 'block' : 'hidden'}`}
              >
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-6 w-6 text-blue-600" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.content.overview}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {section.content.sections.map((subsection, index) => (
                        <div key={index}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {subsection.title}
                          </h3>
                          <p className="text-gray-600">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Code Examples */}
            {activeTab === 'api-reference' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Code Examples</h2>
                {codeExamples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{example.title}</span>
                        <Badge variant="secondary">{example.language}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => navigator.clipboard.writeText(example.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Support Section */}
            <div className="mt-16 bg-blue-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Need More Help?
              </h2>
              <p className="text-gray-600 mb-6">
                If you can't find what you're looking for in our documentation, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/help-center">
                  <Button>
                    <Book className="h-4 w-4 mr-2" />
                    Visit Help Center
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Reference
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;