import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Book, 
  MessageSquare, 
  FileText, 
  Settings, 
  Users, 
  CreditCard, 
  Shield, 
  ArrowRight,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of using Wizzered",
      articles: [
        { title: "Setting up your first case", url: "#", popular: true },
        { title: "Understanding AI legal assistance", url: "#", popular: true },
        { title: "Document generation basics", url: "#", popular: false },
        { title: "Navigating the dashboard", url: "#", popular: true },
      ]
    },
    {
      id: "case-management",
      title: "Case Management",
      icon: FileText,
      description: "Manage your legal cases effectively",
      articles: [
        { title: "Creating and organizing cases", url: "#", popular: true },
        { title: "Case timeline and milestones", url: "#", popular: false },
        { title: "Collaborative case work", url: "#", popular: false },
        { title: "Case reporting and analytics", url: "#", popular: true },
      ]
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      icon: MessageSquare,
      description: "Get the most out of your AI legal assistant",
      articles: [
        { title: "How to ask effective legal questions", url: "#", popular: true },
        { title: "Understanding AI responses", url: "#", popular: true },
        { title: "Legal research with AI", url: "#", popular: false },
        { title: "AI limitations and disclaimers", url: "#", popular: true },
      ]
    },
    {
      id: "billing",
      title: "Billing & Subscriptions",
      icon: CreditCard,
      description: "Manage your account and billing",
      articles: [
        { title: "Subscription plans comparison", url: "#", popular: true },
        { title: "Updating payment information", url: "#", popular: false },
        { title: "Billing history and invoices", url: "#", popular: false },
        { title: "Cancellation and refunds", url: "#", popular: true },
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: Shield,
      description: "Understand our security measures",
      articles: [
        { title: "Data encryption and storage", url: "#", popular: false },
        { title: "Privacy policy explained", url: "#", popular: true },
        { title: "GDPR compliance", url: "#", popular: false },
        { title: "Account security best practices", url: "#", popular: true },
      ]
    },
    {
      id: "account",
      title: "Account Management",
      icon: Users,
      description: "Manage your account settings",
      articles: [
        { title: "Profile settings and preferences", url: "#", popular: false },
        { title: "Two-factor authentication", url: "#", popular: true },
        { title: "Team management", url: "#", popular: false },
        { title: "API access and integrations", url: "#", popular: false },
      ]
    }
  ];

  const popularArticles = helpCategories
    .flatMap(category => category.articles.filter(article => article.popular))
    .slice(0, 6);

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
              <span className="text-gray-600">Help Center</span>
            </div>
            <div className="flex items-center gap-4">
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search our knowledge base or browse categories below
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for articles, guides, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                    <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, index) => (
                      <li key={index}>
                        <a
                          href={article.url}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <span>{article.title}</span>
                          {article.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Support
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <ExternalLink className="h-5 w-5 mr-2" />
              API Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;