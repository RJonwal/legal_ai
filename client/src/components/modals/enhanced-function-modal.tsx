` tags.

```
Applying toast imports and mutation updates to the case strategy modal for enhanced document generation and error handling.
```

```
<replit_final_file>
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  History, Search, Lightbulb, FolderOpen, UserCheck, CloudUpload, AlertTriangle, AlertCircle, Info 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  const [contractText, setContractText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [depositionInputs, setDepositionInputs] = useState({
    witnessName: "",
    keyTopics: "",
    specialInstructions: "",
    depositionType: "fact-witness"
  });
  const [courtPrepInputs, setCourtPrepInputs] = useState({
    hearingType: "",
    keyArguments: "",
    anticipatedQuestions: "",
    evidenceList: "",
    opposingCounsel: ""
  });

  const { data: currentCase } = useQuery({
    queryKey: ['/api/cases', caseId],
    queryFn: () => apiRequest('GET', `/api/cases/${caseId}`).then(res => res.json()),
    enabled: isOpen && !!caseId,
  });

  const { data: caseDocuments = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'documents'],
    enabled: isOpen && functionId === 'case-documents',
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'timeline'],
    enabled: isOpen && functionId === 'timeline',
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (documentType: string) => {
      try {
        const response = await apiRequest('POST', `/api/cases/${caseId}/documents/generate`, {
          documentType: documentType,
          caseContext: currentCase?.description || '',
          specificInstructions: '',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate document');
        }

        const data = await response.json();
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Drop evidence files here or click to browse</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</p>
                  <Button variant="outline" className="mt-4">
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Choose Evidence Files
                  </Button>
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
                  {caseDocuments.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
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
                      <span className="text-sm">{doc.title}</span>
                    </div>
                  ))}
                </div>

                {selectedDocuments.length > 0 && (
                  <Button 
                    onClick={() => handleGenerateDocument('Multi-Document Evidence Analysis')}
                    className="w-full"
                    disabled={generateDocumentMutation.isPending}
                  >
                    {generateDocumentMutation.isPending ? 'Generating...' : `Analyze Selected Documents (${selectedDocuments.length})`}
                  </Button>
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

                <Button 
                  onClick={() => handleGenerateDocument('Contract Analysis Report')}
                  disabled={!contractText.trim() || generateDocumentMutation.isPending}
                  className="w-full"
                >
                  {generateDocumentMutation.isPending ? 'Generating...' : 'Analyze Contract Text'}
                </Button>
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
              <h4 className="font-medium">Document Folders</h4>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Files
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-dashed border-2 border-gray-300 p-4 text-center">
                <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-sm">Evidence</div>
                <div className="text-xs text-gray-500">12 files</div>
              </Card>
              <Card className="border-dashed border-2 border-gray-300 p-4 text-center">
                <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-sm">Generated Drafts</div>
                <div className="text-xs text-gray-500">8 files</div>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Documents:</h4>
              {caseDocuments.slice(0, 5).map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{doc.title}</div>
                      <div className="text-xs text-gray-500">{doc.documentType} • {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'final' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleGenerateDocument('Document Management Report')}
              className="w-full"
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Document Summary'}
            </Button>
          </div>
        );

      case 'case-analytics':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">Case Analytics for {currentCase?.title}</h3>
              <p className="text-sm text-orange-700">
                Comprehensive metrics, progress tracking, and financial analysis.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-legal-blue">67%</div>
                  <div className="text-sm text-gray-600">Case Progress</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">$125K</div>
                  <div className="text-sm text-gray-600">Potential Recovery</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">45</div>
                  <div className="text-sm text-gray-600">Days Active</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="font-medium mb-3">Case Timeline Progress</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Discovery Phase</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-sm">
                    <span>Settlement Negotiations</span>
                    <span className="text-blue-600">In Progress</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => handleGenerateDocument('Comprehensive Case Analytics Report')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={generateDocumentMutation.isPending}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Detailed Analytics Report'}
            </Button>
          </div>
        );

      case 'deposition-prep':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Interactive Deposition Preparation</h3>
              <p className="text-sm text-purple-700">
                Customize your deposition strategy with witness-specific preparation and question development.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="witness-name">Witness Name</Label>
                <Input
                  id="witness-name"
                  value={depositionInputs.witnessName}
                  onChange={(e) => setDepositionInputs(prev => ({...prev, witnessName: e.target.value}))}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <Label htmlFor="deposition-type">Deposition Type</Label>
                <Select value={depositionInputs.depositionType} onValueChange={(value) => setDepositionInputs(prev => ({...prev, depositionType: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fact-witness">Fact Witness</SelectItem>
                    <SelectItem value="expert-witness">Expert Witness</SelectItem>
                    <SelectItem value="party-deposition">Party Deposition</SelectItem>
                    <SelectItem value="corporate-representative">Corporate Representative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="key-topics">Key Topics & Areas of Inquiry</Label>
              <Textarea
                id="key-topics"
                value={depositionInputs.keyTopics}
                onChange={(e) => setDepositionInputs(prev => ({...prev, keyTopics: e.target.value}))}
                placeholder="e.g., Timeline of events, decision-making process, communications with opposing party..."
                rows={3}
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
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleGenerateDocument(`Deposition Outline for ${depositionInputs.witnessName || 'Witness'}`)}
                variant="outline"
                disabled={!depositionInputs.witnessName || generateDocumentMutation.isPending}
              >
                <Users className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Outline'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Question Bank - ${depositionInputs.depositionType} Deposition`)}
                variant="outline"
                disabled={generateDocumentMutation.isPending}
              >
                <Search className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Question Bank'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Deposition Strategy Memo - ${depositionInputs.witnessName || 'Case'}`)}
                variant="outline"
                disabled={!depositionInputs.keyTopics || generateDocumentMutation.isPending}
              >
                <Brain className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Strategy Memo'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument(`Document Review Checklist for Deposition`)}
                variant="outline"
                disabled={generateDocumentMutation.isPending}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Document Checklist'}
              </Button>
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
              ```
              <p className="text-sm text-red-700">
                Comprehensive court preparation with customizable arguments, evidence lists, and procedural guidance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hearing-type">Hearing Type</Label>
                <Select value={courtPrepInputs.hearingType} onValueChange={(value) => setCourtPrepInputs(prev => ({...prev, hearingType: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hearing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motion-hearing">Motion Hearing</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="preliminary-injunction">Preliminary Injunction</SelectItem>
                    <SelectItem value="summary-judgment">Summary Judgment</SelectItem>
                    <SelectItem value="settlement-conference">Settlement Conference</SelectItem>
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
                />
              </div>
            </div>

            <div>
              <Label htmlFor="key-arguments">Key Legal Arguments</Label>
              <Textarea
                id="key-arguments"
                value={courtPrepInputs.keyArguments}
                onChange={(e) => setCourtPrepInputs(prev => ({...prev, keyArguments: e.target.value}))}
                placeholder="e.g., Breach of contract, liquidated damages enforceable, defendant failed to mitigate..."
                rows={3}
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
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleGenerateDocument(`Court Brief - ${courtPrepInputs.hearingType || 'Hearing'}`)}
                variant="outline"
                disabled={!courtPrepInputs.hearingType || generateDocumentMutation.isPending}
              >
                <Gavel className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Brief'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Evidence List and Exhibits')}
                variant="outline"
                disabled={!courtPrepInputs.evidenceList || generateDocumentMutation.isPending}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Evidence List'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Argument Outline and Talking Points')}
                variant="outline"
                disabled={!courtPrepInputs.keyArguments || generateDocumentMutation.isPending}
              >
                <Scale className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Argument Outline'}
              </Button>
              <Button 
                onClick={() => handleGenerateDocument('Q&A Preparation Document')}
                variant="outline"
                disabled={!courtPrepInputs.anticipatedQuestions || generateDocumentMutation.isPending}
              >
                <Brain className="h-4 w-4 mr-2" />
                {generateDocumentMutation.isPending ? 'Generating...' : 'Q&A Prep'}
              </Button>
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

            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
              <p className="text-lg font-medium text-blue-900 mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-blue-600 mb-4">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <CloudUpload className="h-4 w-4 mr-2" />
                Choose Files to Upload
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Quick Actions</span>
                  </div>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Scan for Duplicates
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
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
                    <span className="font-medium">Recent Uploads</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Contract_Amendment.pdf</p>
                    <p>Evidence_Photos.zip</p>
                    <p>Correspondence.docx</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={() => handleGenerateDocument('Document Upload Summary')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={generateDocumentMutation.isPending}
            >
              {generateDocumentMutation.isPending ? 'Generating...' : 'Generate Upload Summary Report'}
            </Button>
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
                  <div className="text-sm text-red-700">March 30, 2024 - All discovery must be completed</div>
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
  );
}