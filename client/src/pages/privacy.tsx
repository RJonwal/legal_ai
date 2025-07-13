import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowLeft, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PrivacyPolicy() {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', 'privacy'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pages');
      const pages = await response.json();
      return pages.find((page: any) => page.type === 'privacy' || page.slug === 'privacy-policy');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">LegalAI Pro</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{pageData?.title || "Privacy Policy"}</CardTitle>
            <CardDescription>Last updated: {pageData?.lastModified ? new Date(pageData.lastModified).toLocaleDateString() : "January 15, 2024"}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: pageData?.content?.replace(/\n/g, '<br/>') || "Loading content..." }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}