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
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
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
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Type,
  Palette
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
  const [fontSize, setFontSize] = useState(12);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const documentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Court-compatible fonts
  const courtFonts = [
    "Times New Roman",
    "Century Schoolbook",
    "Garamond",
    "Book Antiqua",
    "Georgia",
    "Palatino Linotype",
    "Cambria",
    "Charter",
    "Minion Pro",
    "Adobe Caslon Pro",
    "Baskerville",
    "Crimson Text",
    "Source Serif Pro",
    "Libre Baskerville",
    "Playfair Display",
    "Cormorant Garamond"
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

  const applyTextFormat = (format: string) => {
    // Check if we're in a browser environment and textarea ref exists
    if (typeof document === 'undefined' || typeof window === 'undefined' || !textareaRef.current) {
      return;
    }
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText || format.startsWith('align-') || format === 'justify' || format === 'clear-formatting') {
        let formattedText = selectedText;
        
        switch (format) {
          case 'bold':
            formattedText = `**${selectedText}**`;
            break;
          case 'italic':
            formattedText = `*${selectedText}*`;
            break;
          case 'underline':
            formattedText = `_${selectedText}_`;
            break;
          case 'heading1':
            // Add heading on new line if not at start
            const prefix1 = start > 0 && content[start - 1] !== '\n' ? '\n' : '';
            formattedText = `${prefix1}# ${selectedText}`;
            break;
          case 'heading2':
            const prefix2 = start > 0 && content[start - 1] !== '\n' ? '\n' : '';
            formattedText = `${prefix2}## ${selectedText}`;
            break;
          case 'heading3':
            const prefix3 = start > 0 && content[start - 1] !== '\n' ? '\n' : '';
            formattedText = `${prefix3}### ${selectedText}`;
            break;
          case 'align-left':
            // Use markdown-style left alignment
            const lines1 = selectedText.split('\n');
            formattedText = lines1.map(line => line.trim()).join('\n');
            break;
          case 'align-center':
            // Use markdown-style center alignment
            const lines2 = selectedText.split('\n');
            formattedText = lines2.map(line => `<center>${line.trim()}</center>`).join('\n');
            break;
          case 'align-right':
            // Use markdown-style right alignment
            const lines3 = selectedText.split('\n');
            formattedText = lines3.map(line => `<div align="right">${line.trim()}</div>`).join('\n');
            break;
          case 'justify':
            // Use markdown-style justify alignment
            const lines4 = selectedText.split('\n');
            formattedText = lines4.map(line => `<div align="justify">${line.trim()}</div>`).join('\n');
            break;
          case 'bullet-list':
            const bulletItems = selectedText.split('\n').map(line => line.trim()).filter(line => line);
            formattedText = bulletItems.map(item => `• ${item}`).join('\n');
            break;
          case 'numbered-list':
            const numberedItems = selectedText.split('\n').map(line => line.trim()).filter(line => line);
            formattedText = numberedItems.map((item, index) => `${index + 1}. ${item}`).join('\n');
            break;
          case 'indent':
            const indentLines = selectedText.split('\n');
            formattedText = indentLines.map(line => `    ${line}`).join('\n');
            break;
          case 'outdent':
            const outdentLines = selectedText.split('\n');
            formattedText = outdentLines.map(line => line.replace(/^    /, '')).join('\n');
            break;
          case 'uppercase':
            formattedText = selectedText.toUpperCase();
            break;
          case 'lowercase':
            formattedText = selectedText.toLowerCase();
            break;
          case 'title-case':
            formattedText = selectedText.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
          case 'clear-formatting':
            // Remove common formatting markers
            formattedText = selectedText
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
              .replace(/\*(.*?)\*/g, '$1') // Remove italic
              .replace(/_(.*?)_/g, '$1') // Remove underline
              .replace(/#{1,6}\s/g, '') // Remove headings
              .replace(/<center>(.*?)<\/center>/g, '$1') // Remove center tags
              .replace(/<div align="right">(.*?)<\/div>/g, '$1') // Remove right align tags
              .replace(/<div align="justify">(.*?)<\/div>/g, '$1') // Remove justify tags
              .replace(/^    /gm, '') // Remove indentation
              .replace(/^• /gm, '') // Remove bullet points
              .replace(/^\d+\.\s/gm, ''); // Remove numbered lists
            break;
        }
        
        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        setContent(newContent);
        
        // Update cursor position after formatting
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }, 0);
      }
    }
  };

  const changeFontSize = (increase: boolean) => {
    const newSize = increase ? Math.min(fontSize + 2, 24) : Math.max(fontSize - 2, 8);
    setFontSize(newSize);
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
      <div className="h-full bg-gray-50 pt-3 px-1 pb-1 flex flex-col">
        {/* Material Design Floating Card */}
        <div className="flex-shrink-0 bg-white rounded-xl shadow-2xl border border-gray-200 transform transition-all duration-300 hover:shadow-3xl">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Document Canvas
            </h3>
            <p className="text-xs text-gray-600 mt-1">Generate or select a document</p>
          </div>

          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Ready for Documents</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Ask about case strategy or use Case Actions to generate documents.
            </p>
            <Button
              onClick={() => generateDocumentMutation.mutate('Breach Notice Letter')}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs px-4 py-2 rounded-lg shadow-md transition-all duration-200"
            >
              Generate Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 pt-3 px-1 pb-1 flex flex-col">
      {/* Material Design Floating Document Card */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Canvas Header */}
        <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm font-medium"
              />
            ) : (
              <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            )}
            <p className="text-xs text-gray-500 truncate">
              {document?.status === 'final' ? 'Final' : 'Draft'} • Auto-saved
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {/* Font Selector */}
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {courtFonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }} className="text-xs">{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Size Selector */}
            <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
              <SelectTrigger className="w-[60px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}pt
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2" disabled={isDownloading}>
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-legal-blue"></div>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileText className="h-3 w-3 mr-2" />
                  <span className="text-xs">PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadEditable}>
                  <Edit3 className="h-3 w-3 mr-2" />
                  <span className="text-xs">Editable</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-2 bg-white min-h-0">
        {generateDocumentMutation.isPending ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-legal-blue mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Generating...</p>
            </div>
          </div>
        ) : isEditing ? (
          <div className="flex flex-col h-full">
            <ContextMenu>
              <ContextMenuTrigger className="flex-1 h-full">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full resize-none border-gray-300 focus:border-legal-blue focus:ring-legal-blue text-xs"
                  placeholder="Document content..."
                  style={{
                    fontFamily: selectedFont,
                    fontSize: `${fontSize}pt`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    color: textColor
                  }}
                />
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                <ContextMenuItem onClick={() => applyTextFormat('bold')}>
                  <Bold className="h-4 w-4 mr-2" />
                  Bold
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('italic')}>
                  <Italic className="h-4 w-4 mr-2" />
                  Italic
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('underline')}>
                  <Underline className="h-4 w-4 mr-2" />
                  Underline
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('heading1')}>
                  <Type className="h-4 w-4 mr-2" />
                  Heading 1
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('heading2')}>
                  <Type className="h-4 w-4 mr-2" />
                  Heading 2
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('heading3')}>
                  <Type className="h-4 w-4 mr-2" />
                  Heading 3
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('align-left')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h18" />
                  </svg>
                  Align Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('align-center')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M7 12h10M3 18h18" />
                  </svg>
                  Align Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('align-right')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h18" />
                  </svg>
                  Align Right
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('justify')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  Justify
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('bullet-list')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Bullet List
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('numbered-list')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Numbered List
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('indent')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7M3 12h16" />
                  </svg>
                  Indent
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('outdent')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7M19 12H5" />
                  </svg>
                  Outdent
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('uppercase')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  UPPERCASE
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('lowercase')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  lowercase
                </ContextMenuItem>
                <ContextMenuItem onClick={() => applyTextFormat('title-case')}>
                  <Type className="h-4 w-4 mr-2" />
                  Title Case
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => changeFontSize(true)}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Increase Font Size
                </ContextMenuItem>
                <ContextMenuItem onClick={() => changeFontSize(false)}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                  Decrease Font Size
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => applyTextFormat('clear-formatting')}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Formatting
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ) : (
          <div 
            ref={documentRef} 
            className="max-w-none prose prose-xs"
            style={{ 
              fontFamily: selectedFont,
              fontSize: `${fontSize}pt`,
              lineHeight: '1.4',
              color: textColor,
              padding: '0.5rem',
              backgroundColor: '#ffffff'
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
      <div className="p-1 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Auto-saved</span>
          </div>
          <div className="flex items-center space-x-1">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-legal-blue hover:bg-legal-deep text-white"
                  onClick={handleSave}
                  disabled={updateDocumentMutation.isPending}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-legal-blue hover:bg-legal-deep text-white"
                  onClick={handleSaveFinal}
                  disabled={updateDocumentMutation.isPending}
                >
                  Final
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}