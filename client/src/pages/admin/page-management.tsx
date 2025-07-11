
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  FileText, 
  Shield, 
  Users, 
  Globe,
  ExternalLink
} from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  isPublished: boolean;
  showInFooter: boolean;
  footerCategory: string;
  lastModified: string;
  type: 'terms' | 'privacy' | 'about' | 'support' | 'custom';
}

export default function PageManagement() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      title: "Terms and Conditions",
      slug: "terms-and-conditions",
      content: "# Terms and Conditions\n\nLast updated: [DATE]\n\n## 1. Acceptance of Terms\n\nBy accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.\n\n## 2. Use License\n\na) Permission is granted to temporarily download one copy of the materials on LegalAI Pro's website for personal, non-commercial transitory viewing only.\n\n## 3. Disclaimer\n\nThe materials on LegalAI Pro's website are provided on an 'as is' basis. LegalAI Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.\n\n## 4. Limitations\n\nIn no event shall LegalAI Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LegalAI Pro's website.\n\n## 5. Privacy Policy\n\nYour privacy is important to us. Please review our Privacy Policy, which also governs your use of the Site.\n\n## 6. Contact Information\n\nIf you have any questions about these Terms and Conditions, please contact us at legal@legalai.com.",
      metaDescription: "Terms and conditions for using LegalAI Pro platform and services.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "terms"
    },
    {
      id: "2",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "# Privacy Policy\n\nLast updated: [DATE]\n\n## Information We Collect\n\nWe collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.\n\n### Personal Information\n- Name and contact information\n- Account credentials\n- Payment information\n- Communication preferences\n\n### Usage Information\n- How you interact with our services\n- Device and browser information\n- IP address and location data\n- Cookies and similar technologies\n\n## How We Use Your Information\n\nWe use the information we collect to:\n- Provide, maintain, and improve our services\n- Process transactions and send related information\n- Send technical notices and support messages\n- Respond to comments and questions\n- Protect against fraud and abuse\n\n## Information Sharing\n\nWe do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.\n\n## Data Security\n\nWe implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.\n\n## Your Rights\n\nYou have the right to:\n- Access your personal information\n- Correct inaccurate information\n- Delete your information\n- Object to processing\n- Data portability\n\n## Contact Us\n\nIf you have questions about this Privacy Policy, please contact us at privacy@legalai.com.",
      metaDescription: "Privacy policy explaining how LegalAI Pro collects, uses, and protects your personal information.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Legal",
      lastModified: "2024-01-15",
      type: "privacy"
    },
    {
      id: "3",
      title: "About Us",
      slug: "about",
      content: "# About LegalAI Pro\n\n## Our Mission\n\nLegalAI Pro is dedicated to democratizing access to legal assistance through cutting-edge artificial intelligence technology. We believe that everyone deserves access to quality legal guidance, regardless of their budget or location.\n\n## Our Story\n\nFounded in 2024 by a team of legal professionals and AI experts, LegalAI Pro emerged from the recognition that traditional legal services often leave many people without affordable options. Our platform combines the expertise of seasoned attorneys with the power of advanced AI to provide comprehensive legal assistance.\n\n## What We Do\n\n### AI-Powered Legal Analysis\nOur advanced AI system thinks like a senior attorney with 20+ years of experience, providing strategic legal analysis and recommendations.\n\n### Document Generation\nCreate court-ready legal documents, briefs, and motions instantly with our intelligent document generation system.\n\n### Case Management\nOrganize and track your legal matters with our comprehensive case management tools.\n\n## Our Team\n\nOur team consists of experienced attorneys, AI researchers, and technology professionals who are passionate about making legal services more accessible and efficient.\n\n## Contact Us\n\nReady to revolutionize your legal practice? Get in touch with us:\n- Email: info@legalai.com\n- Phone: +1 (555) 123-LEGAL\n- Address: 123 Legal District, Suite 500, New York, NY 10001",
      metaDescription: "Learn about LegalAI Pro's mission to democratize legal assistance through AI technology.",
      isPublished: true,
      showInFooter: true,
      footerCategory: "Company",
      lastModified: "2024-01-10",
      type: "about"
    }
  ]);

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [newPageDialogOpen, setNewPageDialogOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);

  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "New Page",
      slug: "new-page",
      content: "# New Page\n\nStart writing your content here...",
      metaDescription: "",
      isPublished: false,
      showInFooter: false,
      footerCategory: "Company",
      lastModified: new Date().toISOString().split('T')[0],
      type: "custom"
    };
    setPages(prev => [...prev, newPage]);
    setEditingPage(newPage);
    setNewPageDialogOpen(false);
  };

  const updatePage = (updatedPage: Page) => {
    setPages(prev => prev.map(page => 
      page.id === updatedPage.id 
        ? { ...updatedPage, lastModified: new Date().toISOString().split('T')[0] }
        : page
    ));
    setEditingPage(null);
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
  };

  const getPageIcon = (type: string) => {
    switch (type) {
      case 'terms': return <Shield className="h-4 w-4" />;
      case 'privacy': return <Shield className="h-4 w-4" />;
      case 'about': return <Users className="h-4 w-4" />;
      case 'support': return <FileText className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
            <p className="text-gray-600 mt-2">Manage footer pages, terms, privacy policy, and custom content</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
            <Dialog open={newPageDialogOpen} onOpenChange={setNewPageDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Page</DialogTitle>
                  <DialogDescription>
                    Create a new page for your website. You can configure its content and footer placement.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewPageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewPage}>
                    Create Page
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>All Pages</CardTitle>
                <CardDescription>Click a page to edit its content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        editingPage?.id === page.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setEditingPage(page)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPageIcon(page.type)}
                          <span className="font-medium text-sm">{page.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {page.isPublished ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Published</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Draft</Badge>
                          )}
                          {page.showInFooter && (
                            <Badge variant="outline" className="text-xs">Footer</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">/{page.slug}</p>
                      <p className="text-xs text-gray-500">Modified: {page.lastModified}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Page Editor */}
          <div className="lg:col-span-2">
            {editingPage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Edit Page</CardTitle>
                      <CardDescription>Configure page content and settings</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPage(editingPage)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePage(editingPage.id)}
                        disabled={editingPage.type === 'terms' || editingPage.type === 'privacy'}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updatePage(editingPage)}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="page-title">Page Title</Label>
                      <Input
                        id="page-title"
                        value={editingPage.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setEditingPage(prev => prev ? {
                            ...prev,
                            title: newTitle,
                            slug: generateSlug(newTitle)
                          } : null);
                        }}
                        placeholder="Page title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-slug">URL Slug</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          /
                        </span>
                        <Input
                          id="page-slug"
                          value={editingPage.slug}
                          onChange={(e) => setEditingPage(prev => prev ? { ...prev, slug: e.target.value } : null)}
                          className="rounded-l-none"
                          placeholder="page-url"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      value={editingPage.metaDescription}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                      placeholder="SEO meta description for this page"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Published</Label>
                        <p className="text-xs text-gray-600">Make this page publicly accessible</p>
                      </div>
                      <Switch
                        checked={editingPage.isPublished}
                        onCheckedChange={(checked) => setEditingPage(prev => prev ? { ...prev, isPublished: checked } : null)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Show in Footer</Label>
                        <p className="text-xs text-gray-600">Display link in website footer</p>
                      </div>
                      <Switch
                        checked={editingPage.showInFooter}
                        onCheckedChange={(checked) => setEditingPage(prev => prev ? { ...prev, showInFooter: checked } : null)}
                      />
                    </div>
                  </div>

                  {editingPage.showInFooter && (
                    <div>
                      <Label htmlFor="footer-category">Footer Category</Label>
                      <Select
                        value={editingPage.footerCategory}
                        onValueChange={(value) => setEditingPage(prev => prev ? { ...prev, footerCategory: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Resources">Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="page-content">Page Content (Markdown)</Label>
                    <Textarea
                      id="page-content"
                      value={editingPage.content}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, content: e.target.value } : null)}
                      placeholder="Write your page content in Markdown..."
                      rows={20}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Use Markdown syntax for formatting. Supports headings, lists, links, and more.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Page to Edit</h3>
                  <p className="text-gray-600 mb-4">Choose a page from the list to start editing its content and settings.</p>
                  <Button onClick={() => setNewPageDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Page
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewPage && (
          <Dialog open={!!previewPage} onOpenChange={() => setPreviewPage(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview: {previewPage.title}
                </DialogTitle>
                <DialogDescription>
                  This is how your page will appear to visitors
                </DialogDescription>
              </DialogHeader>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{previewPage.content}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewPage(null)}>
                  Close Preview
                </Button>
                <Button onClick={() => window.open(`/${previewPage.slug}`, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
