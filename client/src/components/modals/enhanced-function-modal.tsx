import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Upload, FolderPlus, Calendar, Scale, Brain, FileCheck, BarChart3, Users, Gavel, 
  History, Search, Lightbulb, FolderOpen, UserCheck, CloudUpload, AlertTriangle, AlertCircle, Info,
  Clock, TrendingUp, DollarSign, CheckCircle, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface FunctionModalProps {
  isOpen: boolean;
  functionId: string;
  caseId: number;
  onClose: () => void;
  onDocumentGenerate?: (document: any) => void;
  onSendMessage?: (message: string) => void;
}

export function EnhancedFunctionModal({ 
  isOpen, 
  functionId, 
  caseId, 
  onClose, 
  onDocumentGenerate,
  onSendMessage,
}: FunctionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contractText, setContractText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [depositionInputs, setDepositionInputs] = useState({
    witnessName: "",
    keyTopics: "",
    specialInstructions: "",
    depositionType: "fact-witness",
    witnessRole: "",
    witnessBackground: "",
    objectives: "",
    problemAreas: "",
    customQuestions: "",
    depositionDate: "",
    location: "",
    courtReporter: "",
    opposingCounsel: "",
    estimatedDuration: ""
  });
  const [courtPrepInputs, setCourtPrepInputs] = useState({
    hearingType: "",
    keyArguments: "",
    anticipatedQuestions: "",
    evidenceList: "",
    opposingCounsel: ""
  });

  // Document management states
  const [sortBy, setSortBy] = useState('date');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDocumentsForManagement, setSelectedDocumentsForManagement] = useState<string[]>([]);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<string | null>(null);
  const [documentFolders, setDocumentFolders] = useState([
    { id: 'evidence', name: 'Evidence', documentCount: 5 },
    { id: 'drafts', name: 'Generated Drafts', documentCount: 8 },
    { id: 'final', name: 'Final Documents', documentCount: 3 },
    { id: 'correspondence', name: 'Correspondence', documentCount: 12 },
  ]);

  // Court preparation analysis state
  const [courtPrepAnalysis, setCourtPrepAnalysis] = useState<any>(null);
  const [loadingCourtPrep, setLoadingCourtPrep] = useState(false);

  const { data: currentCase } = useQuery({
    queryKey: [`/api/cases/${caseId}`],
    enabled: !!caseId,
  });

  const { data: caseAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: [`/api/cases/${caseId}/analytics`],
    enabled: !!caseId && functionId === 'case-analytics',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: caseDocuments = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'documents'],
    queryFn: () => apiRequest('GET', `/api/cases/${caseId}/documents`).then(res => res.json()),
    enabled: isOpen && (functionId === 'case-documents' || functionId === 'evidence-analysis'),
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'timeline'],
    enabled: isOpen && functionId === 'timeline',
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/cases/${caseId}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => [...prev, ...(data.files || [])]);
      setIsUploading(false);
      toast({
        title: "Files uploaded successfully!",
        description: `${data.files?.length || 0} file(s) uploaded and processed.`,
      });

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload files.",
      });
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (documentType: string) => {
      try {
        console.log('Generating document with type:', documentType);

        const requestBody = {
          documentType: documentType,
          caseContext: currentCase?.description || currentCase?.title || 'Legal case document',
          specificInstructions: '',
        };

        console.log('Request body:', requestBody);

        const response = await apiRequest('POST', `/api/cases/${caseId}/documents/generate`, requestBody);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate document');
        }

        const data = await response.json();
        console.log('Generated document:', data);
        return data;
      } catch (error: any) {
        console.error("Document generation error:", error);
        toast({
          variant: "destructive",
          title: "Error generating document.",
          description: error.message,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      if (onDocumentGenerate) {
        onDocumentGenerate(data);
        toast({
          title: "Document generated successfully!",
          description: "The document has been added to the document canvas.",
        });
      }
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to generate document.",
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  const handleGenerateDocument = (documentType: string) => {
    generateDocumentMutation.mutate(documentType);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    // Validate file types and sizes
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
        });
        return;
      }
    }

    setIsUploading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    formData.append('caseId', caseId.toString());

    uploadFileMutation.mutate(formData);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  // Document management handlers
  const getSortedDocuments = () => {
    if (!caseDocuments) return [];

    let filtered = caseDocuments;
    if (selectedFolder) {
      // Filter by folder if selected
      filtered = caseDocuments.filter((doc: any) => doc.folderId === selectedFolder);
    }

    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.documentType.localeCompare(b.documentType);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocumentsForManagement(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await apiRequest('POST', `/api/cases/${caseId}/folders`, {
        name: newFolderName.trim()
      });

      if (response.ok) {
        const newFolder = await response.json();
        setDocumentFolders(prev => [...prev, { 
          id: newFolder.id, 
          name: newFolder.name, 
          documentCount: 0 
        }]);
        setIsCreatingFolder(false);
        setNewFolderName('');
        toast({
          title: "Folder created",
          description: `Folder "${newFolderName}" has been created.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create folder",
        description: "Please try again.",
      });
    }
  };

  const handleRenameDocument = async (docId: string) => {
    if (!editingTitle.trim()) {
      setEditingDocument(null);
      setEditingTitle('');
      return;
    }

    try {
      const response = await apiRequest('PUT', `/api/documents/${docId}`, {
        title: editingTitle.trim()
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        toast({
          title: "Document renamed",
          description: "Document has been successfully renamed.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to rename document",
        description: "Please try again.",
      });
    }

    setEditingDocument(null);
    setEditingTitle('');
  };

  const handleMoveDocument = (docId: string) => {
    setDocumentToMove(docId);
    setShowFolderSelector(true);
  };

  const handleMoveToFolder = async (folderId: string) => {
    if (!documentToMove) return;

    const targetFolder = documentFolders.find(f => f.id === folderId);

    try {
      const response = await apiRequest('PUT', `/api/documents/${documentToMove}`, {
        folderId: folderId
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        toast({
          title: "Document moved",
          description: `Document moved to ${targetFolder?.name || 'selected folder'}.`,
        });
        setShowFolderSelector(false);
        setDocumentToMove(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to move document",
        description: "Please try again.",
      });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/documents/${docId}`);

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        toast({
          title: "Document deleted",
          description: "Document has been successfully deleted.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete document",
        description: "Please try again.",
      });
    }
  };

  const handleDuplicateDocument = async (docId: string) => {
    const originalDoc = caseDocuments?.find((doc: any) => doc.id === docId);
    if (!originalDoc) return;

    try {
      const response = await apiRequest('POST', `/api/cases/${caseId}/documents/duplicate`, {
        originalDocumentId: docId,
        title: `${originalDoc.title} (Copy)`
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        toast({
          title: "Document duplicated",
          description: "A copy of the document has been created.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to duplicate document",
        description: "Please try again.",
      });
    }
  };

  const handleBulkMove = () => {
    if (selectedDocumentsForManagement.length === 0) return;
    setDocumentToMove('bulk');
    setShowFolderSelector(true);
  };

  const handleBulkMoveToFolder = async (folderId: string) => {
    const targetFolder = documentFolders.find(f => f.id === folderId);

    try {
      const response = await apiRequest('PUT', `/api/documents/bulk-move`, {
        documentIds: selectedDocumentsForManagement,
        folderId: folderId
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        setSelectedDocumentsForManagement([]);
        toast({
          title: "Documents moved",
          description: `${selectedDocumentsForManagement.length} documents moved to ${targetFolder?.name || 'selected folder'}.`,
        });
        setShowFolderSelector(false);
        setDocumentToMove(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to move documents",
        description: "Please try again.",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await apiRequest('DELETE', `/api/documents/bulk-delete`, {
        documentIds: selectedDocumentsForManagement
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
        setSelectedDocumentsForManagement([]);
        toast({
          title: "Documents deleted",
          description: `${selectedDocumentsForManagement.length} documents have been deleted.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete documents",
        description: "Please try again.",
      });
    }
  };

  // Court preparation analysis
  const analyzeCourtPreparation = async () => {
    if (!courtPrepInputs.hearingType || !courtPrepInputs.keyArguments) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in hearing type and key arguments to analyze court preparation.",
      });
      return;
    }

    setLoadingCourtPrep(true);
    try {
      const response = await apiRequest('POST', `/api/cases/${caseId}/court-prep`, {
        hearingType: courtPrepInputs.hearingType,
        keyArguments: courtPrepInputs.keyArguments,
        anticipatedQuestions: courtPrepInputs.anticipatedQuestions,
        evidenceList: courtPrepInputs.evidenceList,
        opposingCounsel: courtPrepInputs.opposingCounsel
      });

      if (response.ok) {
        const analysis = await response.json();
        setCourtPrepAnalysis(analysis);
        toast({
          title: "Court Preparation Analysis Complete",
          description: "Comprehensive analysis generated with recommendations and checklist.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to generate court preparation analysis. Please try again.",
      });
    } finally {
      setLoadingCourtPrep(false);
    }
  };

  const getModalInfo = (functionId: string) => {
    const modalInfo = {
      'case-strategy': {
        title: 'AI Case Strategy Analysis',
        description: 'Comprehensive strategic analysis with AI-powered recommendations for motions, filings, and next steps'
      },
      'upload-document': {
        title: 'Upload Case Documents',
        description: 'Upload and analyze documents for this case. Supported formats: PDF, DOC, DOCX, TXT'
      },
      'calendar': {
        title: 'Case Calendar & Deadlines',
        description: 'View upcoming deadlines, court dates, and important case milestones'
      },
      'timeline': {
        title: 'Case Timeline',
        description: 'Review chronological events and milestones for this case'
      },
      'evidence-analysis': {
        title: 'Evidence Analysis',
        description: 'Upload new evidence, select existing files, or analyze contracts for legal issues'
      },
      'next-best-action': {
        title: 'Strategic Recommendations',
        description: 'Get AI-powered recommendations with document generation for next steps'
      },
      'case-documents': {
        title: 'Case Documents',
        description: 'View, generate, and manage all documents with drag-drop and folder organization'
      },
      'case-analytics': {
        title: 'Case Analytics',
        description: 'View case progress, financial impact, and key performance metrics'
      },
      'deposition-prep': {
        title: 'Interactive Deposition Preparation',
        description: 'Prepare for depositions with customizable witness preparation and question development'
      },
      'court-prep': {
        title: 'Court Preparation',
        description: 'Prepare for court appearances with arguments, evidence, and procedural guidance'
      }
    };
    return modalInfo[functionId as keyof typeof modalInfo] || { title: 'Case Action', description: 'Perform case-related actions' };
  };

  const getModalContent = () => {
    switch (functionId) {
      case 'case-strategy':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">AI Case Strategy Analysis for {currentCase?.title}</h3>
              <p className="text-sm text-purple-700">
                Comprehensive strategic analysis of your case with AI-powered recommendations for motions, filings, and next steps.
              </p>
            </div>

            <div className="space-y-3">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Strategic Assessment</span>
                  </div>
                  <div className="text-sm text-purple-800 space-y-2">
                    <p>• <strong>Case Strength:</strong> Strong position based on clear contract breach</p>
                    <p>• <strong>Key Vulnerabilities:</strong> Potential mitigation defense by defendant</p>
                    <p>• <strong>Settlement Likelihood:</strong> High (75%) - defendant likely to settle</p>
                    <p>• <strong>Estimated Timeline:</strong> 6-8 months to resolution</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Immediate Actions Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Breach Notice Letter')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={generateDocumentMutation.isPending}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Breach Notice
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Discovery Request')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Discovery Request
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Settlement Demand Letter')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={generateDocumentMutation.isPending}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Settlement Demand
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Protective Order Motion')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Protective Order
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Document Preparation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Motion for Summary Judgment')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      Summary Judgment
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Motion to Compel')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      Motion to Compel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Preliminary Injunction Motion')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      Injunction Motion
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Answer to Counterclaim')}
                      variant="outline"
                      disabled={generateDocumentMutation.isPending}
                    >
                      Answer Counterclaim
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  onClose();
                  onSendMessage?.('Analyze the entire case and provide a comprehensive strategic roadmap with all necessary motions, filings, and deadlines. Include specific recommendations for settlement negotiations and trial preparation.');
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                disabled={generateDocumentMutation.isPending}
              >
                <Brain className="h-4 w-4 mr-2" />
                Full Strategy Analysis
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Complete Case Strategy Report')}
                variant="outline"
                className="flex-1"
                disabled={generateDocumentMutation.isPending}
              >
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        );

      case 'evidence-analysis':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Evidence Analysis for {currentCase?.title}</h3>
              <p className="text-sm text-yellow-700">
                Upload new evidence, select existing files, or analyze contracts for legal issues and opportunities.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload New</TabsTrigger>
                <TabsTrigger value="existing">Select Existing</TabsTrigger>
                <TabsTrigger value="analyze">Text Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-blue-600">Uploading evidence files...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        {isDragging ? 'Drop evidence files here' : 'Drop evidence files here or click to browse'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Choose Evidence Files
                      </Button>
                    </>
                  )}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          {file.isDuplicate && (
                            <Badge variant="destructive" className="text-xs">Duplicate Found</Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleGenerateDocument(`Evidence Analysis: ${file.name}`)}>
                            Analyze
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleGenerateDocument(`Evidence Summary: ${file.name}`)}>
                            Summarize
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Existing Documents:</h4>
                  {caseDocuments && caseDocuments.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {caseDocuments.map((doc: any, index: number) => (
                        <div key={doc.id || index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, doc.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                              }
                            }}
                          />
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{doc.title}</div>
                            <div className="text-xs text-gray-500">
                              {doc.documentType} • {doc.status} • {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={doc.status === 'final' ? 'default' : 'secondary'}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No documents found for this case</p>
                      <p className="text-gray-400 text-xs mt-1">Upload documents or generate new ones to see them here</p>
                    </div>
                  )}
                </div>

                {selectedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        const selectedDocs = caseDocuments.filter((doc: any) => selectedDocuments.includes(doc.id));
                        const docTitles = selectedDocs.map((doc: any) => doc.title).join(', ');
                        handleGenerateDocument(`Multi-Document Evidence Analysis - ${docTitles}`);
                      }}
                      className="w-full"
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : `Analyze Selected Documents (${selectedDocuments.length})`}
                    </Button>
                    <Button 
                      onClick={() => {
                        const selectedDocs = caseDocuments.filter((doc: any) => selectedDocuments.includes(doc.id));
                        const docTitles = selectedDocs.map((doc: any) => doc.title).join(', ');
                        handleGenerateDocument(`Evidence Summary Report - ${docTitles}`);
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : `Generate Evidence Summary (${selectedDocuments.length})`}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analyze" className="space-y-4">
                <div>
                  <Label htmlFor="contract-text">Contract or Document Text:</Label>
                  <Textarea
                    id="contract-text"
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder="Paste the contract or document text here for analysis..."
                    rows={8}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => handleGenerateDocument(`Contract Analysis Report - ${contractText.substring(0, 50)}...`)}
                    disabled={!contractText.trim() || generateDocumentMutation.isPending}
                    className="w-full"
                  >
                    {generateDocumentMutation.isPending ? 'Generating...' : 'Analyze Contract Text'}
                  </Button>
                  <Button 
                    onClick={() => handleGenerateDocument(`Contract Risk Assessment - ${contractText.substring(0, 50)}...`)}
                    disabled={!contractText.trim() || generateDocumentMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Risk Assessment'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'next-best-action':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Strategic Recommendations for {currentCase?.title}</h3>
              <p className="text-sm text-green-700">
                AI-powered next steps and document generation for optimal case strategy.
              </p>
            </div>

            <div className="space-y-3">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <Badge variant="destructive" className="text-xs">URGENT</Badge>
                  </div>
                  <div className="font-medium text-red-900 mb-2">Immediate Priority</div>
                  <div className="text-sm text-red-700 mb-3">
                    Send formal breach notice within 7 days to preserve legal rights
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleGenerateDocument('Breach Notice Letter')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={generateDocumentMutation.isPending}
                  >
                    {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Breach Notice'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <Badge variant="outline" className="text-xs">Within 2 Weeks</Badge>
                  </div>
                  <div className="font-medium text-yellow-900 mb-2">Settlement Preparation</div>
                  <div className="text-sm text-yellow-700 mb-3">
                    Calculate total damages and prepare settlement demand
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateDocument('Damages Calculation Worksheet')}
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Damages Calculator'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateDocument('Settlement Demand Letter')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Settlement Demand'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <Badge variant="outline" className="text-xs">Strategic</Badge>
                  </div>
                  <div className="font-medium text-blue-900 mb-2">Additional Legal Actions</div>
                  <div className="text-sm text-blue-700 mb-3">
                    Consider filing motion for preliminary injunction and discovery requests
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateDocument('Motion for Preliminary Injunction')}
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Injunction Motion'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateDocument('Discovery Request Document')}
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Discovery Request'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateDocument('Legal Brief Template')}
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Legal Brief'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateDocument('Motion to Compel')}
                      disabled={generateDocumentMutation.isPending}
                    >
                      {generateDocumentMutation.isPending ? 'Generating...' : 'Motion to Compel'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => handleGenerateDocument('Comprehensive Strategy Report')}
              className="w-full bg-legal-blue hover:bg-legal-deep text-white"
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Full Strategy Report'}
            </Button>
          </div>
        );

      case 'case-documents':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-2">Case Documents for {currentCase?.title}</h3>
              <p className="text-sm text-indigo-700">
                Manage all case documents with drag-drop, folders, and auto-organization.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Document Management</h4>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Files
                </Button>
              </div>
            </div>

            {/* Folder Creation Input */}
            {isCreatingFolder && (
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="flex-1 h-8"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    } else if (e.key === 'Escape') {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }
                  }}
                />
                <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Folder Grid */}
            <div className="grid grid-cols-3 gap-3">
              {documentFolders.map((folder) => (
                <Card 
                  key={folder.id} 
                  className="border-dashed border-2 border-gray-300 p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <FolderOpen className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="font-medium text-xs">{folder.name}</div>
                  <div className="text-xs text-gray-500">{folder.documentCount} files</div>
                </Card>
              ))}
            </div>

            {/* File Upload Area */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Documents List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {selectedFolder ? documentFolders.find(f => f.id === selectedFolder)?.name : 'All Documents'}:
                </h4>
                {selectedDocumentsForManagement.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {selectedDocumentsForManagement.length} selected
                    </span>
                    <Button size="sm" variant="outline" onClick={handleBulkMove}>
                      Move
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                      Delete
                    </Button>
                  </div>
                )}
                {selectedFolder && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedFolder(null)}
                    className="text-xs"
                  >
                    ← Back to All
                  </Button>
                )}
              </div>

              {caseDocuments && caseDocuments.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {getSortedDocuments().map((doc: any, index: number) => (
                    <div 
                      key={doc.id || index} 
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedDocumentsForManagement.includes(doc.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={(e) => {
                        if (e.shiftKey || e.ctrlKey) {
                          handleDocumentSelect(doc.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedDocumentsForManagement.includes(doc.id)}
                          onChange={() => handleDocumentSelect(doc.id)}
                          className="w-4 h-4"
                        />
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          {editingDocument === doc.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="text-sm h-6"
                              onBlur={() => handleRenameDocument(doc.id)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameDocument(doc.id);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="font-medium text-sm truncate cursor-pointer"
                              onDoubleClick={() => {
                                setEditingDocument(doc.id);
                                setEditingTitle(doc.title);
                              }}
                            >
                              {doc.title}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {doc.documentType} • {doc.status} • {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.status === 'final' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => {
                                if (onDocumentGenerate) {
                                  onDocumentGenerate(doc);
                                  onClose();
                                }
                              }}
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingDocument(doc.id);
                                setEditingTitle(doc.title);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveDocument(doc.id)}>
                              Move to Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateDocument(doc.id)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No documents found for this case</p>
                  <p className="text-gray-400 text-xs mt-1">Upload or generate documents to see them here</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleGenerateDocument('Document Management Report')}
                variant="outline"
                className="flex-1"
                disabled={generateDocumentMutation.isPending}
              >
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Summary'}
              </Button>
              <Button
                onClick={() => handleGenerateDocument('Document Index Report')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={generateDocumentMutation.isPending}
              >
                {generateDocumentMutation.isPending ? 'Generating...' : 'Create Index'}
              </Button>
            </div>
          </div>
        );

      
case 'case-analytics':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-2">Case Analytics for {currentCase?.title}</h3>
              <p className="text-sm text-indigo-700">
                Comprehensive case metrics, financial tracking, and performance analysis.
              </p>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-indigo-600">Loading analytics...</p>
              </div>
            ) : caseAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Metrics */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Days Active</span>
                      <Badge variant="outline">{caseAnalytics.basicMetrics.daysActive}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <Badge variant={caseAnalytics.basicMetrics.completionRate > 70 ? 'default' : 'secondary'}>
                        {caseAnalytics.basicMetrics.completionRate}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Critical Tasks</span>
                      <Badge variant={caseAnalytics.basicMetrics.criticalTasks > 0 ? 'destructive' : 'default'}>
                        {caseAnalytics.basicMetrics.criticalTasks}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Overview */}
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Costs</span>
                      <span className="font-medium">${caseAnalytics.financial.totalCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Potential Recovery</span>
                      <span className="font-medium text-green-600">${caseAnalytics.financial.potentialRecovery.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expected ROI</span>
                      <Badge variant={caseAnalytics.financial.roi > 100 ? 'default' : 'secondary'}>
                        {caseAnalytics.financial.roi}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Case Timeline */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Timeline Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseAnalytics.timeline.phases.map((phase, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{phase.name}</span>
                          <Badge variant={phase.status === 'complete' ? 'default' : phase.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {phase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                        {phase.estimatedDays && (
                          <div className="text-xs text-gray-500">
                            {phase.estimatedDays} days remaining
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseAnalytics.risks.map((risk, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{risk.type.replace('_', ' ')}</span>
                          <Badge variant={risk.level === 'high' ? 'destructive' : risk.level === 'medium' ? 'secondary' : 'outline'}>
                            {risk.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{risk.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analytics data available</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={() => handleGenerateDocument('Analytics Report')}
                variant="outline"
                className="flex-1"
                disabled={generateDocumentMutation.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button
                onClick={() => handleGenerateDocument('Performance Dashboard')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={generateDocumentMutation.isPending}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Export Dashboard'}
              </Button>
            </div>
          </div>
        );

      case 'deposition-prep':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Interactive Deposition Preparation for {currentCase?.title}</h3>
              <p className="text-sm text-purple-700">
                Comprehensive deposition strategy with witness-specific preparation, question development, and document organization.
              </p>
            </div>

            <Tabs defaultValue="witness-info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="witness-info">Witness Info</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="logistics">Logistics</TabsTrigger>
              </TabsList>

              <TabsContent value="witness-info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="witness-name">Witness Name *</Label>
                    <Input
                      id="witness-name"
                      value={depositionInputs.witnessName}
                      onChange={(e) => setDepositionInputs(prev => ({...prev, witnessName: e.target.value}))}
                      placeholder="e.g., John Smith"
                      className="border-purple-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposition-type">Deposition Type</Label>
                    <Select value={depositionInputs.depositionType} onValueChange={(value) => setDepositionInputs(prev => ({...prev, depositionType: value}))}>
                      <SelectTrigger className="border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fact-witness">Fact Witness</SelectItem>
                        <SelectItem value="expert-witness">Expert Witness</SelectItem>
                        <SelectItem value="party-deposition">Party Deposition</SelectItem>
                        <SelectItem value="corporate-representative">Corporate Representative (30b6)</SelectItem>
                        <SelectItem value="treating-physician">Treating Physician</SelectItem>
                        <SelectItem value="character-witness">Character Witness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="witness-role">Witness Role in Case</Label>
                  <Input
                    id="witness-role"
                    value={depositionInputs.witnessRole || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, witnessRole: e.target.value}))}
                    placeholder="e.g., Project Manager, Contract Negotiator, Eyewitness"
                    className="border-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="witness-background">Background & Credibility Factors</Label>
                  <Textarea
                    id="witness-background"
                    value={depositionInputs.witnessBackground || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, witnessBackground: e.target.value}))}
                    placeholder="Education, experience, relationship to parties, potential biases..."
                    rows={3}
                    className="border-purple-200"
                  />
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                <div>
                  <Label htmlFor="key-topics">Key Topics & Areas of Inquiry</Label>
                  <Textarea
                    id="key-topics"
                    value={depositionInputs.keyTopics}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, keyTopics: e.target.value}))}
                    placeholder="e.g., Timeline of events, decision-making process, communications with opposing party..."
                    rows={4}
                    className="border-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="objectives">Deposition Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={depositionInputs.objectives || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, objectives: e.target.value}))}
                    placeholder="What do you hope to accomplish? Lock in testimony, gather information, impeach witness..."
                    rows={3}
                    className="border-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="problem-areas">Potential Problem Areas</Label>
                  <Textarea
                    id="problem-areas"
                    value={depositionInputs.problemAreas || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, problemAreas: e.target.value}))}
                    placeholder="Memory gaps, hostile witness, privilege issues, technical complexity..."
                    rows={3}
                    className="border-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="special-instructions">Special Instructions & Strategy Notes</Label>
                  <Textarea
                    id="special-instructions"
                    value={depositionInputs.specialInstructions}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, specialInstructions: e.target.value}))}
                    placeholder="e.g., Witness is hostile, focus on document authentication, avoid leading questions on..."
                    rows={3}
                    className="border-purple-200"
                  />
                </div>
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Search className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Question Categories</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Background Questions</span>
                          <Badge variant="outline">15-20</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Substantive Questions</span>
                          <Badge variant="outline">30-50</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Document Questions</span>
                          <Badge variant="outline">10-15</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Impeachment Questions</span>
                          <Badge variant="outline">5-10</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Time Estimates</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Opening/Background</span>
                          <span className="text-purple-700">30 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Main Testimony</span>
                          <span className="text-purple-700">2-3 hrs</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Document Review</span>
                          <span className="text-purple-700">45 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Total</span>
                          <Badge className="bg-purple-600">3-4 hrs</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label htmlFor="specific-questions">Custom Questions for this Witness</Label>
                  <Textarea
                    id="specific-questions"
                    value={depositionInputs.customQuestions || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, customQuestions: e.target.value}))}
                    placeholder="Add specific questions you want to ask this witness..."
                    rows={4}
                    className="border-purple-200"
                  />
                </div>
              </TabsContent>

              <TabsContent value="logistics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deposition-date">Scheduled Date</Label>
                    <Input
                      id="deposition-date"
                      type="date"
                      value={depositionInputs.depositionDate || ''}
                      onChange={(e) => setDepositionInputs(prev => ({...prev, depositionDate: e.target.value}))}
                      className="border-purple-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={depositionInputs.location || ''}
                      onChange={(e) => setDepositionInputs(prev => ({...prev, location: e.target.value}))}
                      placeholder="e.g., Law office, courthouse, video conference"
                      className="border-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="court-reporter">Court Reporter & Recording</Label>
                  <Input
                    id="court-reporter"
                    value={depositionInputs.courtReporter || ''}
                    onChange={(e) => setDepositionInputs(prev => ({...prev, courtReporter: e.target.value}))}
                    placeholder="Court reporter name/agency, video recording requirements"
                    className="border-purple-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opposing-counsel">Opposing Counsel</Label>
                    <Input
                      id="opposing-counsel"
                      value={depositionInputs.opposingCounsel || ''}
                      onChange={(e) => setDepositionInputs(prev => ({...prev, opposingCounsel: e.target.value}))}
                      placeholder="Attorney name and firm"
                      className="border-purple-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimated-duration">Estimated Duration</Label>
                    <Select value={depositionInputs.estimatedDuration || ''} onValueChange={(value) => setDepositionInputs(prev => ({...prev, estimatedDuration: value}))}>
                      <SelectTrigger className="border-purple-200">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-hours">2 hours</SelectItem>
                        <SelectItem value="4-hours">4 hours</SelectItem>
                        <SelectItem value="full-day">Full day (7 hours)</SelectItem>
                        <SelectItem value="multi-day">Multiple days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleGenerateDocument(`Deposition Outline for ${depositionInputs.witnessName || 'Witness'}`)}
                variant="outline"
                disabled={!depositionInputs.witnessName || generateDocumentMutation.isPending}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Users className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Outline'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Question Bank - ${depositionInputs.depositionType} Deposition`)}
                variant="outline"
                disabled={generateDocumentMutation.isPending}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Search className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Question Bank'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Witness Preparation Strategy - ${depositionInputs.witnessName || 'Case'}`)}
                variant="outline"
                disabled={!depositionInputs.keyTopics || generateDocumentMutation.isPending}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Prep Strategy'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Deposition Document Checklist`)}
                variant="outline"
                disabled={generateDocumentMutation.isPending}
                className="border-purple-200 hover:bg-purple-50"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Document Checklist'}
              </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Deposition Readiness Score</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (
                        (depositionInputs.witnessName ? 20 : 0) +
                        (depositionInputs.keyTopics ? 20 : 0) +
                        (depositionInputs.objectives ? 15 : 0) +
                        (depositionInputs.depositionDate ? 15 : 0) +
                        (depositionInputs.location ? 10 : 0) +
                        (depositionInputs.courtReporter ? 10 : 0) +
                        (depositionInputs.customQuestions ? 10 : 0)
                      ))}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-purple-700">
                  {Math.min(100, (
                    (depositionInputs.witnessName ? 20 : 0) +
                    (depositionInputs.keyTopics ? 20 : 0) +
                    (depositionInputs.objectives ? 15 : 0) +
                    (depositionInputs.depositionDate ? 15 : 0) +
                    (depositionInputs.location ? 10 : 0) +
                    (depositionInputs.courtReporter ? 10 : 0) +
                    (depositionInputs.customQuestions ? 10 : 0)
                  ))}%
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Complete all fields for comprehensive deposition preparation
              </p>
            </div>

            <Button 
              onClick={() => handleGenerateDocument(`Comprehensive Deposition Preparation Package - ${depositionInputs.witnessName || currentCase?.title}`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!depositionInputs.witnessName || !depositionInputs.keyTopics || generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Complete Deposition Package'}
            </Button>
          </div>
        );

      case 'court-prep':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Court Preparation for {currentCase?.title}</h3>
              <p className="text-sm text-red-700">
                Comprehensive court preparation with customizable arguments, evidence lists, and procedural guidance.
              </p>
            </div>

            <Tabs defaultValue="preparation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>

              <TabsContent value="preparation" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hearing-type">Hearing Type *</Label>
                    <Select value={courtPrepInputs.hearingType} onValueChange={(value) => setCourtPrepInputs(prev => ({...prev, hearingType: value}))}>
                      <SelectTrigger className="border-red-200">
                        <SelectValue placeholder="Select hearing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motion-hearing">Motion Hearing</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="preliminary-injunction">Preliminary Injunction</SelectItem>
                        <SelectItem value="summary-judgment">Summary Judgment</SelectItem>
                        <SelectItem value="settlement-conference">Settlement Conference</SelectItem>
                        <SelectItem value="status-conference">Status Conference</SelectItem>
                        <SelectItem value="case-management">Case Management Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opposing-counsel">Opposing Counsel</Label>
                    <Input
                      id="opposing-counsel"
                      value={courtPrepInputs.opposingCounsel}
                      onChange={(e) => setCourtPrepInputs(prev => ({...prev, opposingCounsel: e.target.value}))}
                      placeholder="e.g., Smith & Associates"
                      className="border-red-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="key-arguments">Key Legal Arguments *</Label>
                  <Textarea
                    id="key-arguments"
                    value={courtPrepInputs.keyArguments}
                    onChange={(e) => setCourtPrepInputs(prev => ({...prev, keyArguments: e.target.value}))}
                    placeholder="e.g., Breach of contract, liquidated damages enforceable, defendant failed to mitigate..."
                    rows={4}
                    className="border-red-200"
                  />
                </div>

                <div>
                  <Label htmlFor="anticipated-questions">Anticipated Questions from Court</Label>
                  <Textarea
                    id="anticipated-questions"
                    value={courtPrepInputs.anticipatedQuestions}
                    onChange={(e) => setCourtPrepInputs(prev => ({...prev, anticipatedQuestions: e.target.value}))}
                    placeholder="e.g., What evidence supports damages calculation? Why wasn't mediation attempted earlier?"
                    rows={3}
                    className="border-red-200"
                  />
                </div>

                <div>
                  <Label htmlFor="evidence-list">Evidence to Present</Label>
                  <Textarea
                    id="evidence-list"
                    value={courtPrepInputs.evidenceList}
                    onChange={(e) => setCourtPrepInputs(prev => ({...prev, evidenceList: e.target.value}))}
                    placeholder="e.g., Original contract, email communications, expert testimony, damage calculations..."
                    rows={3}
                    className="border-red-200"
                  />
                </div>

                <Button 
                  onClick={analyzeCourtPreparation}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={!courtPrepInputs.hearingType || !courtPrepInputs.keyArguments || loadingCourtPrep}
                >
                  {loadingCourtPrep ? 'Analyzing...' : 'Analyze Court Preparation'}
                </Button>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {courtPrepAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Gavel className="h-5 w-5 mr-2 text-red-600" />
                            Hearing Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type</span>
                            <Badge variant="outline">{courtPrepAnalysis.hearing.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duration</span>
                            <span className="text-sm">{courtPrepAnalysis.hearing.estimatedDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Judge</span>
                            <span className="text-sm">{courtPrepAnalysis.hearing.judge}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Preparation Score</span>
                            <Badge variant={courtPrepAnalysis.hearing.preparationScore > 80 ? 'default' : 'secondary'}>
                              {courtPrepAnalysis.hearing.preparationScore}%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Scale className="h-5 w-5 mr-2 text-blue-600" />
                            Legal Strategy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Win Probability</span>
                            <Badge variant="default">{courtPrepAnalysis.legalStrategy.winProbability}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Evidence Strength</span>
                            <Badge variant={courtPrepAnalysis.legalStrategy.evidenceStrength === 'Strong' ? 'default' : 'secondary'}>
                              {courtPrepAnalysis.legalStrategy.evidenceStrength}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Settlement Likelihood</span>
                            <span className="text-sm">{courtPrepAnalysis.legalStrategy.settlementLikelihood}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                          Risk Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {courtPrepAnalysis.risks.map((risk: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-sm">{risk.type.replace('_', ' ')}</span>
                              <p className="text-xs text-gray-600">{risk.description}</p>
                            </div>
                            <Badge variant={risk.level === 'high' ? 'destructive' : risk.level === 'medium' ? 'secondary' : 'outline'}>
                              {risk.level}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-purple-600" />
                          Evidence & Exhibits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <span className="text-sm font-medium">Available Documents: {courtPrepAnalysis.evidence.availableDocuments}</span>
                        </div>
                        {courtPrepAnalysis.evidence.exhibitList.map((exhibit: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-sm">{exhibit.exhibit}: {exhibit.title}</span>
                            <Badge variant="outline" className="text-xs">{exhibit.relevance}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Complete the preparation form and click "Analyze Court Preparation" to see detailed analysis</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4">
                {courtPrepAnalysis?.checklist ? (
                  <div className="space-y-4">
                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                          Documentation Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {courtPrepAnalysis.checklist.documentation.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Brain className="h-5 w-5 mr-2 text-blue-600" />
                          Preparation Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {courtPrepAnalysis.checklist.preparation.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-orange-600" />
                          Logistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {courtPrepAnalysis.checklist.logistics.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Analysis required to generate preparation checklist</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleGenerateDocument(`Court Brief - ${courtPrepInputs.hearingType || 'Hearing'}`)}
                variant="outline"
                disabled={!courtPrepInputs.hearingType || generateDocumentMutation.isPending}
                className="border-red-200 hover:bg-red-50"
              >
                <Gavel className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Brief'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Evidence List and Exhibits')}
                variant="outline"
                disabled={!courtPrepInputs.evidenceList || generateDocumentMutation.isPending}
                className="border-red-200 hover:bg-red-50"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Evidence List'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Argument Outline and Talking Points')}
                variant="outline"
                disabled={!courtPrepInputs.keyArguments || generateDocumentMutation.isPending}
                className="border-red-200 hover:bg-red-50"
              >
                <Scale className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Argument Outline'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Q&A Preparation Document')}
                variant="outline"
                disabled={!courtPrepInputs.anticipatedQuestions || generateDocumentMutation.isPending}
                className="border-red-200 hover:bg-red-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Q&A Prep'}
              </Button>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Court Readiness Score</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (
                        (courtPrepInputs.hearingType ? 25 : 0) +
                        (courtPrepInputs.keyArguments ? 25 : 0) +
                        (courtPrepInputs.evidenceList ? 20 : 0) +
                        (courtPrepInputs.anticipatedQuestions ? 15 : 0) +
                        (courtPrepInputs.opposingCounsel ? 10 : 0) +
                        (courtPrepAnalysis ? 5 : 0)
                      ))}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-red-700">
                  {Math.min(100, (
                    (courtPrepInputs.hearingType ? 25 : 0) +
                    (courtPrepInputs.keyArguments ? 25 : 0) +
                    (courtPrepInputs.evidenceList ? 20 : 0) +
                    (courtPrepInputs.anticipatedQuestions ? 15 : 0) +
                    (courtPrepInputs.opposingCounsel ? 10 : 0) +
                    (courtPrepAnalysis ? 5 : 0)
                  ))}%
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Complete all fields and run analysis for optimal court preparation
              </p>
            </div>

            <Button 
              onClick={() => handleGenerateDocument(`Complete Court Preparation Package - ${courtPrepInputs.hearingType || currentCase?.title}`)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={!courtPrepInputs.hearingType || !courtPrepInputs.keyArguments || generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Complete Court Package'}
            </Button>
          </div>
        );

      case 'upload-document':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Upload Documents for {currentCase?.title}</h3>
              <p className="text-sm text-blue-700">
                Upload case documents, evidence, and other files. Supports PDF, DOC, DOCX, TXT, JPG, PNG.
              </p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-blue-300 hover:border-blue-400'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-blue-900 mb-2">Uploading files...</p>
                  <p className="text-sm text-blue-600">Please wait while we process your files</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                  <p className="text-lg font-medium text-blue-900 mb-2">
                    {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                  </p>
                  <p className="text-sm text-blue-600 mb-4">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isUploading}
                  >
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Choose Files to Upload
                  </Button>
                </>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recently Uploaded Files:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <div className="text-xs text-gray-500">
                            {file.size && `${(file.size / 1024).toFixed(1)} KB`} • {file.type || 'Unknown type'}
                          </div>
                        </div>
                        {file.isDuplicate && (
                          <Badge variant="destructive" className="text-xs">Duplicate Found</Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleGenerateDocument(`Evidence Analysis: ${file.name}`)}
                          disabled={generateDocumentMutation.isPending}
                        >
                          Analyze
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleGenerateDocument(`Document Summary: ${file.name}`)}
                          disabled={generateDocumentMutation.isPending}
                        >
                          Summarize
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Quick Actions</span>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleGenerateDocument('Duplicate File Analysis')}
                      disabled={uploadedFiles.length === 0 || generateDocumentMutation.isPending}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Scan for Duplicates
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleGenerateDocument('Auto-Categorization Report')}
                      disabled={uploadedFiles.length === 0 || generateDocumentMutation.isPending}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Auto-Categorize
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Upload Statistics</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Total files: {uploadedFiles.length}</p>
                    <p>Session uploads: {uploadedFiles.length}</p>
                    {uploadedFiles.length > 0 && (
                      <p>Last upload: {new Date().toLocaleTimeString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {uploadedFiles.length > 0 && (
              <Button 
                onClick={() => handleGenerateDocument('Complete Upload Summary Report')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={generateDocumentMutation.isPending}
              >
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Upload Summary Report'}
              </Button>
            )}
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Calendar & Deadlines for {currentCase?.title}</h3>
              <p className="text-sm text-red-700">
                Track important dates, court deadlines, and filing requirements for this case.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <Badge variant="destructive">URGENT</Badge>
                  </div>
                  <div className="font-medium text-red-900">Discovery Deadline</div>
                  <div className="text-sm text-red-700">March 30, 2024- All discovery must be completed</div>
                  <div className="text-xs text-red-600 mt-1">7 days remaining</div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <Badge variant="outline">SCHEDULED</Badge>
                  </div>
                  <div className="font-medium text-yellow-900">Settlement Conference</div>
                  <div className="text-sm text-yellow-700">April 15, 2024 - Court-ordered settlement conference</div>
                  <div className="text-xs text-yellow-600 mt-1">23 days remaining</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gavel className="h-5 w-5 text-blue-500" />
                    <Badge variant="outline">UPCOMING</Badge>
                  </div>
                  <div className="font-medium text-blue-900">Trial Date</div>
                  <div className="text-sm text-blue-700">June 1, 2024 - Jury trial scheduled</div>
                  <div className="text-xs text-blue-600 mt-1">70 days remaining</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => handleGenerateDocument('Case Calendar Summary')}
                variant="outline"
                className="flex-1"
                disabled={generateDocumentMutation.isPending}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Calendar Summary'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Deadline Tracking Checklist')}
                variant="outline"
                className="flex-1"
                disabled={generateDocumentMutation.isPending}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Deadline Checklist'}
              </Button>
            </div>

            <Button 
              onClick={() => handleGenerateDocument('Comprehensive Case Schedule')}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Complete Case Schedule'}
            </Button>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Case Timeline for {currentCase?.title}</h3>
              <p className="text-sm text-blue-700">
                Chronological events and milestones for this specific case.
              </p>
            </div>

            <div className="space-y-3">
              {timelineEvents.length > 0 ? timelineEvents.map((event: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={event.eventType === 'deadline' ? 'destructive' : 'outline'}>
                    {event.eventType}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No timeline events found for this case</p>
                </div>
              )}
            </div>

            <Button 
              onClick={() => handleGenerateDocument('Timeline Report')} 
              className="w-full"
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Timeline Report'}
            </Button>
          </div>
        );

      default:
        return <div>Feature coming soon...</div>;
    }
  };

  const modalInfo = getModalInfo(functionId);

  return (
    <>
      {/* Folder Selection Dialog */}
      <Dialog open={showFolderSelector} onOpenChange={setShowFolderSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Folder</DialogTitle>
            <DialogDescription>
              Choose which folder to move the document to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {documentFolders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (documentToMove === 'bulk') {
                    handleBulkMoveToFolder(folder.id);
                  } else {
                    handleMoveToFolder(folder.id);
                  }
                }}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {folder.name}
                <Badge variant="secondary" className="ml-auto">
                  {folder.documentCount}
                </Badge>
              </Button>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowFolderSelector(false);
                setDocumentToMove(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Function Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalInfo.title}</DialogTitle>
            <DialogDescription>{modalInfo.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {getModalContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}