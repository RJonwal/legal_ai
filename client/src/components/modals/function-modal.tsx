import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, FolderPlus, Calendar, Scale, Brain, FileCheck, BarChart3, Users, Gavel, History, Search, Lightbulb, FolderOpen, UserCheck, CloudUpload, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface FunctionModalProps {
  isOpen: boolean;
  functionId: string;
  caseId: number;
  onClose: () => void;
  onDocumentGenerate?: (document: any) => void;
}

export function FunctionModal({ isOpen, functionId, caseId, onClose, onDocumentGenerate }: FunctionModalProps) {
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
    enabled: isOpen && !!caseId,
  });

  const { data: caseDocuments } = useQuery({
    queryKey: ['/api/cases', caseId, 'documents'],
    enabled: isOpen && functionId === 'case-documents',
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'timeline'],
    enabled: isOpen && functionId === 'timeline',
  });

  const analyzeContractMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', `/api/cases/${caseId}/analyze-contract`, {
        contractText: text,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
  });

  const nextActionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cases/${caseId}/next-action`);
      return response.json();
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest('POST', `/api/cases/${caseId}/documents/generate`, {
        type,
      });
      return response.json();
    },
    onSuccess: (document) => {
      onDocumentGenerate?.(document);
      onClose();
    },
  });

  const getModalInfo = (functionId: string) => {
    const modalInfo = {
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
        description: 'Analyze contracts, documents, and evidence for legal issues and opportunities'
      },
      'next-best-action': {
        title: 'Strategic Recommendations',
        description: 'Get AI-powered recommendations for next steps and case strategy'
      },
      'case-documents': {
        title: 'Case Documents',
        description: 'View, generate, and manage all documents associated with this case'
      },
      'case-analytics': {
        title: 'Case Analytics',
        description: 'View case progress, financial impact, and key performance metrics'
      },
      'deposition-prep': {
        title: 'Deposition Preparation',
        description: 'Prepare for depositions with witness lists, key questions, and strategy notes'
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
      case 'upload-document':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
              <Input type="file" multiple accept=".pdf,.doc,.docx,.txt" className="hidden" />
              <Button className="bg-legal-blue hover:bg-legal-deep text-white">
                Select Files
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-3">
                  <div className="text-sm font-medium text-red-800">Discovery Deadline</div>
                  <div className="text-sm text-red-600">March 30, 2024</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-3">
                  <div className="text-sm font-medium text-yellow-800">Mediation Scheduled</div>
                  <div className="text-sm text-yellow-600">April 15, 2024</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            {timelineEvents?.map((event: any) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`w-4 h-4 rounded-full mt-1 ${
                  event.eventType === 'deadline' 
                    ? 'bg-red-500' 
                    : event.eventType === 'issue' 
                    ? 'bg-yellow-500' 
                    : 'bg-legal-blue'
                }`} />
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  {event.description && (
                    <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'evidence-analysis':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Contract Text</label>
              <Textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="Paste contract text here for analysis..."
                className="min-h-[100px]"
              />
              <Button
                onClick={() => analyzeContractMutation.mutate(contractText)}
                disabled={!contractText.trim() || analyzeContractMutation.isPending}
                className="mt-2 bg-legal-blue hover:bg-legal-deep text-white"
              >
                Analyze Contract
              </Button>
            </div>

            {analysisResult && (
              <div className="space-y-3">
                <h4 className="font-medium">Analysis Results</h4>
                {analysisResult.criticalIssues?.map((issue: any, index: number) => (
                  <Card key={index} className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      </div>
                      <p className="text-sm text-red-700">{issue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!analysisResult && (
              <div className="space-y-4">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="font-medium mb-2">Contract Documents</div>
                    <div className="text-sm text-gray-600">Primary evidence showing original terms and conditions</div>
                    <div className="mt-2 text-sm text-green-600">Strong evidence for breach claim</div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="font-medium mb-2">Email Communications</div>
                    <div className="text-sm text-gray-600">15 emails documenting delays and excuses</div>
                    <div className="mt-2 text-sm text-yellow-600">Moderate support for damages</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'next-best-action':
        return (
          <div className="space-y-4">
            <Button
              onClick={() => nextActionMutation.mutate()}
              disabled={nextActionMutation.isPending}
              className="bg-legal-blue hover:bg-legal-deep text-white"
            >
              Generate Recommendations
            </Button>

            {nextActionMutation.data && (
              <div className="space-y-3">
                <Card className="border-legal-blue bg-legal-blue/10">
                  <CardContent className="p-4">
                    <div className="font-medium text-legal-blue mb-2">Immediate Priority</div>
                    <div className="text-sm text-gray-700">
                      Send formal breach notice to Johnson Development Corp within 7 days
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="font-medium text-gray-700 mb-2">Within 2 Weeks</div>
                    <div className="text-sm text-gray-600">
                      Calculate total damages and prepare settlement demand
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!nextActionMutation.data && !nextActionMutation.isPending && (
              <div className="space-y-3">
                <Card className="border-legal-blue bg-legal-blue/10">
                  <CardContent className="p-4">
                    <div className="font-medium text-legal-blue mb-2">Immediate Priority</div>
                    <div className="text-sm text-gray-700">
                      Send formal breach notice to Johnson Development Corp within 7 days
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="font-medium text-gray-700 mb-2">Within 2 Weeks</div>
                    <div className="text-sm text-gray-600">
                      Calculate total damages and prepare settlement demand
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="font-medium text-gray-700 mb-2">Within 1 Month</div>
                    <div className="text-sm text-gray-600">
                      Initiate mediation process if no response to demand
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'case-documents':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Case Documents</h4>
              <Button
                onClick={() => generateDocumentMutation.mutate('Legal Brief')}
                disabled={generateDocumentMutation.isPending}
                size="sm"
                className="bg-legal-blue hover:bg-legal-deep text-white"
              >
                Generate Document
              </Button>
            </div>
            
            {caseDocuments?.map((doc: any) => (
              <Card key={doc.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-gray-500">
                        {doc.documentType} • {doc.status}
                      </div>
                    </div>
                    <Badge variant={doc.status === 'final' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!caseDocuments || caseDocuments.length === 0) && (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No documents found for this case</p>
              </div>
            )}
          </div>
        );

      case 'case-analytics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-legal-blue">30</div>
                  <div className="text-sm text-gray-600">Days Overdue</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">$50,000</div>
                  <div className="text-sm text-gray-600">Potential Damages</div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="font-medium mb-2">Case Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-legal-blue h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="text-sm text-gray-600 mt-1">65% Complete</div>
              </CardContent>
            </Card>
          </div>
        );

      case 'deposition-prep':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Deposition Preparation</h4>
            <div className="space-y-3">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Key Witnesses</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Project Manager - John Smith</li>
                    <li>• Site Supervisor - Mary Johnson</li>
                    <li>• Contract Negotiator - David Wilson</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Question Areas</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• History and delay causation</li>
                    <li>• Communication regarding delays</li>
                    <li>• Mitigation efforts attempted</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'court-prep':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Court Preparation</h4>
            <div className="space-y-3">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Legal Arguments</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Breach of contract - timeline violation</li>
                    <li>• Liquidated damages are enforceable</li>
                    <li>• Defendant failed to mitigate</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="font-medium mb-2">Evidence to Present</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Original contract with timeline</li>
                    <li>• Email communications</li>
                    <li>• Damage calculations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Feature coming soon...</div>;
    }
  };

  const modalInfo = getModalInfo(functionId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
