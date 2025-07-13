import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Scale, Cookie, Shield } from "lucide-react";

export default function CookiePolicy() {
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
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Cookie className="h-8 w-8 text-amber-600" />
              Cookie Policy
            </CardTitle>
            <CardDescription>Last updated: January 15, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">EU Cookie Compliance</h3>
              </div>
              <p className="text-blue-800 text-sm">
                This website is fully compliant with EU Cookie Directive (ePrivacy Directive) and GDPR requirements for cookie usage and consent management.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-gray-600">
                Cookies help us understand how you use our website, remember your preferences, and provide a more 
                personalized experience. They also help us analyze website performance and improve our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Strictly Necessary Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Session Management:</strong> Maintain your login session and authentication</li>
                    <li>• <strong>Security:</strong> Protect against cross-site request forgery (CSRF) attacks</li>
                    <li>• <strong>Form Submissions:</strong> Remember form data during submission process</li>
                    <li>• <strong>Cookie Preferences:</strong> Remember your cookie consent choices</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Functional Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies enable enhanced functionality and personalization features.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>User Preferences:</strong> Remember your theme, language, and display settings</li>
                    <li>• <strong>Chat Widget:</strong> Maintain chat session state and preferences</li>
                    <li>• <strong>Document Editor:</strong> Save temporary work and editor preferences</li>
                    <li>• <strong>Dashboard Layout:</strong> Remember your customized dashboard layout</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Google Analytics:</strong> Track website usage, page views, and user journeys</li>
                    <li>• <strong>Performance Monitoring:</strong> Monitor website performance and identify issues</li>
                    <li>• <strong>Feature Usage:</strong> Understand which features are most popular</li>
                    <li>• <strong>Error Tracking:</strong> Identify and fix technical issues</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are used to deliver personalized advertisements and track campaign effectiveness.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Facebook Pixel:</strong> Track conversions and create custom audiences</li>
                    <li>• <strong>Google Ads:</strong> Measure ad performance and enable retargeting</li>
                    <li>• <strong>LinkedIn Insight:</strong> Track professional audience engagement</li>
                    <li>• <strong>Email Marketing:</strong> Track email campaign effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. Cookie Consent Management</h2>
              <p className="text-gray-600 mb-4">
                We use a comprehensive cookie consent management system that complies with EU Cookie Directive and GDPR requirements:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Granular Consent:</strong> You can choose which categories of cookies to accept</li>
                <li>• <strong>Easy Withdrawal:</strong> Change your preferences at any time via our cookie banner</li>
                <li>• <strong>Consent Records:</strong> We maintain records of your consent choices</li>
                <li>• <strong>Regular Updates:</strong> We'll ask for renewed consent when our cookie usage changes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                Some cookies are set by third-party services that appear on our website:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <strong>Google Analytics:</strong> Used for website analytics and performance monitoring
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <strong>Intercom:</strong> Powers our customer support chat widget
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <strong>Stripe:</strong> Secure payment processing and fraud prevention
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <strong>OpenAI:</strong> AI service integration for legal assistance features
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
              <p className="text-gray-600 mb-4">
                You have several options to manage cookies:
              </p>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Cookie Banner:</strong> Use our cookie consent banner to manage preferences
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Privacy Settings:</strong> Access detailed privacy controls in your account settings
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Browser Settings:</strong> Configure cookie settings directly in your browser
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Privacy Manager:</strong> Use our comprehensive privacy management tool
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Cookie Duration</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Cookie Type</th>
                      <th className="border border-gray-300 p-2 text-left">Duration</th>
                      <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Session Cookies</td>
                      <td className="border border-gray-300 p-2">Until browser closes</td>
                      <td className="border border-gray-300 p-2">Authentication and temporary data</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Persistent Cookies</td>
                      <td className="border border-gray-300 p-2">Up to 2 years</td>
                      <td className="border border-gray-300 p-2">Preferences and analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Consent Cookies</td>
                      <td className="border border-gray-300 p-2">1 year</td>
                      <td className="border border-gray-300 p-2">Remember consent choices</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement industry-standard security measures to protect cookie data:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Encryption:</strong> All cookies are encrypted using AES-256 encryption</li>
                <li>• <strong>Secure Transmission:</strong> Cookies are transmitted over HTTPS only</li>
                <li>• <strong>Domain Restrictions:</strong> Cookies are limited to our domain only</li>
                <li>• <strong>Regular Audits:</strong> We conduct regular security audits of our cookie usage</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
              <p className="text-gray-600">
                Some of our service providers may be located outside the European Economic Area (EEA). 
                When cookies are processed outside the EEA, we ensure adequate protection through:
              </p>
              <ul className="text-gray-600 space-y-2 mt-4">
                <li>• Standard Contractual Clauses (SCCs)</li>
                <li>• Privacy Shield certification (where applicable)</li>
                <li>• Adequacy decisions by the European Commission</li>
                <li>• Other appropriate safeguards as required by GDPR</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time. When we make changes, we will:
              </p>
              <ul className="text-gray-600 space-y-2 mt-4">
                <li>• Update the "Last updated" date at the top of this policy</li>
                <li>• Notify you through our website or by email</li>
                <li>• Request renewed consent if required by law</li>
                <li>• Provide clear information about the changes</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Cookie Policy or our cookie practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@legalai.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@legalai.com</p>
                <p><strong>Address:</strong> 123 Legal District, Suite 500, New York, NY 10001</p>
                <p><strong>Phone:</strong> +1 (555) 123-LEGAL</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Your Rights Under GDPR</h3>
              <p className="text-amber-800 text-sm">
                As a data subject, you have the right to object to the processing of your personal data through cookies. 
                You can exercise this right by adjusting your cookie preferences or contacting us directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}