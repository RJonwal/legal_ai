import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Printer, 
  Share2, 
  CheckCircle, 
  Edit3, 
  Save,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown
} from "lucide-react";

interface DocumentCanvasProps {
  caseId: number;
  document?: any;
  onDocumentUpdate?: (document: any) => void;
}

export function DocumentCanvas({ caseId, document, onDocumentUpdate }: DocumentCanvasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Times New Roman");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const documentRef = useRef<HTMLDivElement>(null);

  // Court-compatible fonts
  const courtFonts = [
    "Times New Roman",
    "Century Schoolbook",
    "Garamond",
    "Book Antiqua",
    "Georgia",
    "Palatino Linotype"
  ];

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  const updateDocumentMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest('PUT', `/api/documents/${document.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedDocument) => {
      setIsEditing(false);
      onDocumentUpdate?.(updatedDocument);
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest('POST', `/api/cases/${caseId}/documents/generate`, {
        type,
        specificInstructions: 'Generate a comprehensive contract analysis report',
      });
      return response.json();
    },
    onSuccess: (newDocument) => {
      setTitle(newDocument.title);
      setContent(newDocument.content);
      onDocumentUpdate?.(newDocument);
    },
  });

  const handleSave = () => {
    if (document) {
      updateDocumentMutation.mutate({ title, content, status: 'draft' });
    }
  };

  const handleSaveFinal = () => {
    if (document) {
      updateDocumentMutation.mutate({ title, content, status: 'final' });
    }
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: documentRef.current.scrollWidth,
        height: documentRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate proper scaling for professional document layout
      const margin = 25.4; // 1 inch margin
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);
      const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      let yPosition = margin;
      let remainingHeight = scaledHeight;
      
      while (remainingHeight > 0) {
        const heightToAdd = Math.min(remainingHeight, contentHeight);
        
        pdf.addImage(
          imgData, 
          'PNG', 
          margin, 
          yPosition, 
          scaledWidth, 
          heightToAdd,
          undefined,
          'FAST'
        );
        
        remainingHeight -= heightToAdd;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }

      const fileName = `${title || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: `Document saved as ${fileName}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadEditable = () => {
    // Check if we're in a browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      toast({
        title: "Error",
        description: "Download not available in this environment",
        variant: "destructive",
      });
      return;
    }

    const docContent = `${title}\n\n${content}`;
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'document'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Editable Document Downloaded",
      description: "Document saved as editable text file",
    });
  };

  const formatDocumentContent = (content: string) => {
    // Split content into sections for better formatting
    const sections = content.split('\n\n');
    
    return sections.map((section, index) => {
      if (section.includes('Critical Issue') || section.includes('CRITICAL')) {
        return (
          <Card key={index} className="border-red-200 bg-red-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive" className="text-xs">
                  Critical Issue
                </Badge>
              </div>
              <p className="text-sm text-red-700">{section}</p>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('Moderate Issue') || section.includes('MODERATE')) {
        return (
          <Card key={index} className="border-yellow-200 bg-yellow-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Moderate Issue
                </Badge>
              </div>
              <p className="text-sm text-yellow-700">{section}</p>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('Opportunity') || section.includes('FAVORABLE')) {
        return (
          <Card key={index} className="border-blue-200 bg-blue-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <Badge className="text-xs bg-blue-100 text-blue-800">
                  Opportunity
                </Badge>
              </div>
              <p className="text-sm text-blue-700">{section}</p>
            </CardContent>
          </Card>
        );
      }
      
      return (
        <div key={index} className="mb-4">
          <p className="text-gray-700 leading-relaxed">{section}</p>
        </div>
      );
    });
  };

  if (!document && !generateDocumentMutation.isPending) {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Document Canvas</h3>
          <p className="text-sm text-gray-500">Generate or select a document to view and edit</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Document Generation</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              Ask the AI about case strategy, contract analysis, or use Case Actions to generate specific documents. 
              The canvas will automatically expand when documents are created.
            </p>
            <Button
              onClick={() => generateDocumentMutation.mutate('Breach Notice Letter')}
              className="bg-legal-blue hover:bg-legal-deep text-white"
            >
              Generate Breach Notice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Canvas Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            <p className="text-sm text-gray-500">
              {document?.status === 'final' ? 'Final' : 'Draft'} • Auto-saved at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Font Selector */}
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {courtFonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-legal-blue mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadEditable}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Download Editable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white min-h-0">
        {generateDocumentMutation.isPending ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Generating document...</p>
            </div>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] resize-none border-gray-300 focus:border-legal-blue focus:ring-legal-blue"
              placeholder="Document content..."
            />
          </div>
        ) : (
          <div 
            ref={documentRef} 
            className="max-w-none prose prose-sm"
            style={{ 
              fontFamily: selectedFont,
              fontSize: '12pt',
              lineHeight: '1.6',
              color: '#000000',
              maxWidth: '8.5in',
              margin: '0 auto',
              padding: '1in',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              minHeight: '11in'
            }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: selectedFont }}>{title}</h1>
              <div className="text-sm text-gray-500 mb-4" style={{ fontFamily: selectedFont }}>
                Generated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-4" style={{ fontFamily: selectedFont }}>
              {content ? formatDocumentContent(content) : (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Executive Summary</h2>
                    <p className="text-gray-700 mb-4">
                      This analysis examines the contract between Smith Construction LLC and Johnson Development Corp, 
                      dated January 15, 2024. The review identifies several critical issues including delivery timeline 
                      breaches, unclear termination language, and favorable liquidated damages provisions.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Findings</h2>
                    
                    <Card className="border-red-200 bg-red-50 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <Badge variant="destructive" className="text-xs">
                            Critical Issue
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">Section 4.2 - Delivery Timeline Breach</h4>
                        <p className="text-sm text-red-700">
                          The contract stipulates completion by February 15, 2024. The project remains incomplete 
                          as of March 15, 2024, constituting a 30-day breach with potential damages of $50,000 
                          per the liquidated damages clause.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            Moderate Issue
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Section 7.1 - Termination Clause Ambiguity</h4>
                        <p className="text-sm text-yellow-700">
                          The termination clause contains ambiguous language regarding notice periods and cure provisions. 
                          This could lead to disputes regarding proper termination procedures.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50 mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            Opportunity
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Section 9.3 - Liquidated Damages</h4>
                        <p className="text-sm text-blue-700">
                          The liquidated damages provision is well-drafted and enforceable, providing strong recovery 
                          potential for delays ($1,667 per day after the completion deadline).
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Recommendations</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>
                        <strong>Immediate Action:</strong> Send formal notice of breach regarding the delivery timeline violation
                      </li>
                      <li>
                        <strong>Damage Calculation:</strong> Calculate and document liquidated damages for the 30-day delay period
                      </li>
                      <li>
                        <strong>Settlement Negotiation:</strong> Consider offering a cure period in exchange for guaranteed completion date
                      </li>
                      <li>
                        <strong>Contract Amendment:</strong> Propose clarifying language for the termination clause to avoid future disputes
                      </li>
                    </ol>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500">
                      This document was generated by LegalAI Assistant and should be reviewed by qualified legal counsel before taking any action.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Canvas Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Document saved automatically</span>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateDocumentMutation.isPending}
                  className="bg-legal-blue hover:bg-legal-deep text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveFinal}
                  disabled={updateDocumentMutation.isPending}
                  className="bg-legal-blue hover:bg-legal-deep text-white"
                >
                  Save Final
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
