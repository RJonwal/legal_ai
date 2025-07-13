import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, Users, ArrowRight, Check, Shield, Clock, Brain } from "@/lib/icons";
import { Link } from "wouter";

export default function SimpleLanding() {
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Your AI Legal
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Partner</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Revolutionize your legal practice with AI-powered case management, document generation, and strategic analysis. Built for attorneys and pro se litigants alike.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold">
                Watch Demo
              </Button>
            </div>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Legal Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI tools designed to streamline your legal workflow and enhance your practice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI analyzes cases, identifies key issues, and provides strategic recommendations based on legal precedents.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Document Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate professional legal documents, pleadings, and contracts with AI assistance and customizable templates.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize cases, track deadlines, manage clients, and collaborate with your team in one secure platform.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of legal professionals who trust LegalAI Pro to enhance their practice and deliver better outcomes for their clients.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}