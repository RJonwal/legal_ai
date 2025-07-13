import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Cookie, Settings, Shield, BarChart, Target, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function CookiePolicy() {
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
            <Cookie className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
              <p className="text-gray-600">Last updated: January 13, 2025</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              EU Cookie Directive Compliant
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              GDPR Compliant
            </Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Cookie Consent Management
            </CardTitle>
            <CardDescription>
              Manage your cookie preferences and consent settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-4">
                You can manage your cookie preferences at any time. Essential cookies are required for the website to function properly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Essential Cookies</p>
                    <p className="text-sm text-blue-700">Required for basic website functionality</p>
                  </div>
                  <Switch checked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Analytics Cookies</p>
                    <p className="text-sm text-blue-700">Help us improve our services</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Marketing Cookies</p>
                    <p className="text-sm text-blue-700">Personalize your experience</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better user experience by remembering your preferences and enabling certain functionality.
              </p>
              <p>
                This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you can control your cookie preferences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar technologies for several purposes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">To ensure our website functions properly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">To remember your preferences and settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">To provide personalized content and features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">To analyze how our website is used</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">To improve our services and user experience</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Essential Cookies</h4>
                  </div>
                  <p className="text-sm text-green-800 mb-2">
                    Required for basic website functionality and security.
                  </p>
                  <Badge variant="outline" className="text-green-700 border-green-300">Always Active</Badge>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Analytics Cookies</h4>
                  </div>
                  <p className="text-sm text-blue-800 mb-2">
                    Help us understand how visitors interact with our website.
                  </p>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">Optional</Badge>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Marketing Cookies</h4>
                  </div>
                  <p className="text-sm text-purple-800 mb-2">
                    Used to deliver personalized advertisements and content.
                  </p>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Detailed Cookie Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">Essential Cookies</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div className="font-medium">Cookie Name</div>
                      <div className="font-medium">Purpose</div>
                      <div className="font-medium">Duration</div>
                      <div className="font-medium">Type</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>session_id</div>
                      <div>User authentication</div>
                      <div>Session</div>
                      <div>First-party</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>csrf_token</div>
                      <div>Security protection</div>
                      <div>Session</div>
                      <div>First-party</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>cookie_consent</div>
                      <div>Remember consent preferences</div>
                      <div>1 year</div>
                      <div>First-party</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Analytics Cookies</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div className="font-medium">Cookie Name</div>
                      <div className="font-medium">Purpose</div>
                      <div className="font-medium">Duration</div>
                      <div className="font-medium">Type</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>_ga</div>
                      <div>Google Analytics tracking</div>
                      <div>2 years</div>
                      <div>Third-party</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>_gid</div>
                      <div>Google Analytics tracking</div>
                      <div>24 hours</div>
                      <div>Third-party</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>usage_stats</div>
                      <div>Internal analytics</div>
                      <div>30 days</div>
                      <div>First-party</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">Marketing Cookies</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div className="font-medium">Cookie Name</div>
                      <div className="font-medium">Purpose</div>
                      <div className="font-medium">Duration</div>
                      <div className="font-medium">Type</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>user_preferences</div>
                      <div>Personalization</div>
                      <div>90 days</div>
                      <div>First-party</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>marketing_id</div>
                      <div>Marketing campaigns</div>
                      <div>6 months</div>
                      <div>Third-party</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. How to Control Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have several options to control and manage cookies:
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">1. Cookie Consent Banner</h4>
                  <p className="text-sm text-gray-700">
                    When you first visit our website, you can choose which types of cookies to accept through our consent banner.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">2. Privacy Settings</h4>
                  <p className="text-sm text-gray-700">
                    You can change your cookie preferences at any time by accessing our privacy settings page.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">3. Browser Settings</h4>
                  <p className="text-sm text-gray-700">
                    Most browsers allow you to control cookies through their settings. You can usually find these options in the 'privacy' or 'security' section.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Some cookies are set by third-party services that appear on our website. We use the following third-party services:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Google Analytics - for website analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Marketing platforms - for personalized content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Security services - for fraud prevention</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  We are not responsible for the privacy practices of third-party services. Please review their privacy policies for more information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookie Consent Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You can withdraw your consent for cookies at any time:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use the cookie preferences link in our footer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Clear your browser cookies manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Disable cookies in your browser settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Contact us directly at privacy@wizzered.com</span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Note: Disabling essential cookies may affect website functionality and your user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
              </p>
              <p>
                When we make changes, we will update the "Last updated" date at the top of this policy and notify you through our website or by email if the changes are significant.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Email: privacy@wizzered.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Subject: Cookie Policy Inquiry</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Manage Your Cookie Preferences</h3>
            <p className="text-blue-800 mb-4">
              You can update your cookie consent choices at any time.
            </p>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Cookie Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}