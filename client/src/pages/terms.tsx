import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, Shield, AlertTriangle, FileText, Clock, Users, Mail } from "@/lib/icons";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600">Last updated: January 13, 2025</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Important Legal Notice
            </CardTitle>
            <CardDescription>
              Please read these terms carefully before using Wizzered services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>NOT LEGAL ADVICE:</strong> Wizzered is a legal technology platform that provides AI-powered tools and resources. 
                The information, documents, and services provided are for informational purposes only and do not constitute legal advice. 
                Always consult with a qualified attorney for legal matters.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Wizzered ("the Service"), you accept and agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, you may not use the Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and Wizzered, LLC ("Company", "we", "us", or "our") 
                regarding your use of the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Wizzered is an AI-powered legal technology platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>AI-powered legal document generation and analysis</li>
                <li>Case management and organization tools</li>
                <li>Legal research assistance and insights</li>
                <li>Interactive chat interface for legal consultation</li>
                <li>Document storage and collaboration features</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>DISCLAIMER:</strong> The Service is NOT a substitute for professional legal advice. 
                  AI-generated content may contain errors or inaccuracies. Users are responsible for reviewing 
                  and validating all content before use in legal proceedings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To use the Service, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into agreements</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p>
                You are responsible for all activities that occur under your account. 
                You must immediately notify us of any unauthorized use of your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You may not use the Service for any illegal, harmful, or fraudulent purposes, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Violating any local, state, national, or international laws</li>
                <li>Engaging in unauthorized practice of law</li>
                <li>Generating false, misleading, or fraudulent legal documents</li>
                <li>Attempting to circumvent security measures</li>
                <li>Interfering with or disrupting the Service</li>
                <li>Violating the rights of others</li>
                <li>Sharing your account with unauthorized users</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service and all content, features, and functionality are owned by Wizzered, LLC and are protected by 
                United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of the content you create using the Service, but you grant us a non-exclusive, 
                royalty-free license to use, modify, and display such content as necessary to provide the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service is provided on a subscription basis. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Pay all fees associated with your subscription plan</li>
                <li>Provide accurate billing information</li>
                <li>Authorize automatic renewal unless cancelled</li>
                <li>Pay any applicable taxes</li>
              </ul>
              <p>
                Subscription fees are non-refundable except as required by law or as otherwise stated in these Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  <strong>IMPORTANT LIABILITY LIMITATION:</strong>
                </p>
                <p className="text-sm text-red-800 mt-2">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WIZZERED, LLC, ITS OFFICERS, DIRECTORS, 
                  EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                  INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
                  RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
              </div>
              <p>
                Our total liability to you for all claims related to the Service shall not exceed the amount you paid 
                for the Service during the twelve (12) months preceding the claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless Wizzered, LLC and its officers, directors, employees, 
                and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses 
                (including attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your use of AI-generated content in legal proceedings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                if you breach these Terms or engage in conduct that we determine to be harmful to the Service or other users.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately, and any data associated with 
                your account may be deleted.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising out of or relating to these Terms or the Service shall be resolved through 
                binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any material changes 
                by posting the updated Terms on our website and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4" />
                <span>legal@wizzered.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="h-4 w-4" />
                <span>Wizzered, LLC</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FileText className="h-4 w-4" />
                <span>Legal Department</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Questions about these Terms?</h3>
            <p className="text-blue-800 mb-4">
              Our legal team is available to clarify any questions about these Terms of Service.
            </p>
            <Button asChild>
              <Link href="/contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact Legal Team
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}