import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  RefreshCw, 
  FileText, 
  Brain, 
  Settings, 
  Zap,
  AlertCircle,
  CheckCircle,
  History,
  Copy,
  Eye
} from "lucide-react";

interface GlobalPrompt {
  id: string;
  name: string;
  content: string;
  category: 'system' | 'legal' | 'document' | 'analysis';
  isActive: boolean;
  lastModified: string;
  version: number;
  description: string;
}

export default function GlobalPromptManagement() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<GlobalPrompt[]>([
    {
      id: "1",
      name: "Core Legal AI System Prompt",
      content: `You are a senior legal AI assistant with 20+ years of experience in legal practice. Your primary role is to provide strategic legal analysis, case management guidance, and document generation support.

CORE PRINCIPLES:
1. Always maintain professional legal standards
2. Provide strategic thinking and proactive recommendations
3. Think like an experienced attorney, not just a document generator
4. Consider all legal implications and potential outcomes
5. Offer actionable next steps for case progression

CAPABILITIES:
- Legal case analysis and strategy development
- Document generation (motions, briefs, contracts, letters)
- Legal research and precedent identification
- Risk assessment and mitigation strategies
- Client communication guidance
- Court procedure and deadline management

IMPORTANT DISCLAIMERS:
- This service does not create an attorney-client relationship
- All outputs are for informational purposes only
- Users should consult with licensed attorneys for legal advice
- Do not provide advice on illegal activities

RESPONSE FORMAT:
- Be concise but comprehensive
- Use professional legal language
- Provide specific actionable recommendations
- Include relevant legal citations when appropriate
- Always suggest next steps for case progression

Remember: You are not just answering questions - you are providing strategic legal guidance to help users achieve their legal objectives effectively.`,
      category: 'system',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 3,
      description: "Main system prompt that defines the AI's behavior and capabilities"
    },
    {
      id: "2",
      name: "Document Generation Prompt",
      content: `When generating legal documents, follow these guidelines:

DOCUMENT STRUCTURE:
1. Use proper legal formatting and language
2. Include all necessary legal elements
3. Ensure compliance with jurisdiction requirements
4. Use clear, professional language
5. Include appropriate disclaimers

CONTENT REQUIREMENTS:
- Accurate legal terminology
- Proper citation format
- Logical argument structure
- Comprehensive coverage of issues
- Professional tone throughout

QUALITY STANDARDS:
- Court-ready formatting
- Error-free content
- Legally sound arguments
- Proper legal citations
- Clear action items

Always customize documents based on specific case facts and jurisdictional requirements. Include appropriate disclaimers about legal review requirements.`,
      category: 'document',
      isActive: true,
      lastModified: "2024-01-14T15:30:00Z",
      version: 2,
      description: "Guidelines for generating legal documents and maintaining quality standards"
    },
    {
      id: "3",
      name: "Case Analysis Prompt",
      content: `When analyzing legal cases, provide comprehensive analysis including:

CASE ASSESSMENT:
1. Strengths and weaknesses analysis
2. Legal precedent research
3. Risk assessment
4. Timeline and deadline identification
5. Strategic recommendations

ANALYSIS FRAMEWORK:
- Facts summary and legal issues identification
- Applicable law and precedents
- Strengths and weaknesses of each party's position
- Potential outcomes and probability assessment
- Strategic recommendations for case progression

DELIVERABLES:
- Comprehensive case summary
- Legal research findings
- Risk assessment matrix
- Action plan with timelines
- Settlement considerations

Focus on practical, actionable insights that help users make informed decisions about case strategy and next steps.`,
      category: 'analysis',
      isActive: true,
      lastModified: "2024-01-13T09:15:00Z",
      version: 1,
      description: "Framework for comprehensive case analysis and strategic planning"
    }
  ]);

  const [activePrompt, setActivePrompt] = useState<GlobalPrompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptDescription, setNewPromptDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSavePrompt = () => {
    if (activePrompt) {
      const updatedPrompts = prompts.map(p => 
        p.id === activePrompt.id 
          ? { 
              ...p, 
              content: editingPrompt,
              lastModified: new Date().toISOString(),
              version: p.version + 1
            }
          : p
      );
      setPrompts(updatedPrompts);
      setActivePrompt(null);
      setEditingPrompt('');
      
      toast({
        title: "Prompt Updated",
        description: "The global prompt has been successfully updated.",
      });
    }
  };

  const handleCreatePrompt = () => {
    if (newPromptName && editingPrompt) {
      const newPrompt: GlobalPrompt = {
        id: Date.now().toString(),
        name: newPromptName,
        content: editingPrompt,
        category: 'system',
        isActive: true,
        lastModified: new Date().toISOString(),
        version: 1,
        description: newPromptDescription || "New custom prompt"
      };
      
      setPrompts([...prompts, newPrompt]);
      setIsCreating(false);
      setNewPromptName('');
      setNewPromptDescription('');
      setEditingPrompt('');
      
      toast({
        title: "Prompt Created",
        description: "New global prompt has been successfully created.",
      });
    }
  };

  const handleTogglePrompt = (promptId: string) => {
    const updatedPrompts = prompts.map(p => 
      p.id === promptId ? { ...p, isActive: !p.isActive } : p
    );
    setPrompts(updatedPrompts);
    
    toast({
      title: "Prompt Status Updated",
      description: "Prompt activation status has been changed.",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'legal': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Prompt Management</h1>
            <p className="text-gray-600 mt-2">Configure AI system prompts that guide the entire dashboard functionality</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Create New Prompt
          </Button>
        </div>

        <Tabs defaultValue="prompts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="prompts">Active Prompts</TabsTrigger>
            <TabsTrigger value="editor">Prompt Editor</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts">
            <div className="grid gap-6">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(prompt.category)}
                        <div>
                          <CardTitle className="text-lg">{prompt.name}</CardTitle>
                          <CardDescription>{prompt.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(prompt.category)}>
                          {prompt.category}
                        </Badge>
                        <Badge variant={prompt.isActive ? "default" : "secondary"}>
                          {prompt.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Current Prompt (Version {prompt.version})</p>
                        <p className="text-sm text-gray-800 line-clamp-3">{prompt.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Last modified: {new Date(prompt.lastModified).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(prompt.content)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActivePrompt(prompt);
                              setEditingPrompt(prompt.content);
                            }}
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePrompt(prompt.id)}
                          >
                            {prompt.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Editor</CardTitle>
                <CardDescription>
                  Edit global prompts that define how the AI behaves across the entire dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activePrompt ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getCategoryColor(activePrompt.category)}>
                        {activePrompt.category}
                      </Badge>
                      <span className="font-medium">{activePrompt.name}</span>
                      <Badge variant="outline">Version {activePrompt.version}</Badge>
                    </div>
                    
                    <div>
                      <Label htmlFor="prompt-content">Prompt Content</Label>
                      <Textarea
                        id="prompt-content"
                        value={editingPrompt}
                        onChange={(e) => setEditingPrompt(e.target.value)}
                        className="mt-2 min-h-[400px] font-mono text-sm"
                        placeholder="Enter your prompt content here..."
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSavePrompt} disabled={!editingPrompt.trim()}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActivePrompt(null);
                          setEditingPrompt('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Select a prompt from the Active Prompts tab to edit it here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track changes and manage different versions of your prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <History className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{prompt.name}</p>
                          <p className="text-sm text-gray-500">Version {prompt.version} • {new Date(prompt.lastModified).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(prompt.category)}>
                          {prompt.category}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create New Prompt Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Global Prompt</DialogTitle>
              <DialogDescription>
                Create a new prompt that will guide the AI's behavior across the dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt-name">Prompt Name</Label>
                <input
                  id="prompt-name"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <Label htmlFor="prompt-description">Description</Label>
                <input
                  id="prompt-description"
                  className="w-full p-2 border rounded-md mt-1"
                  value={newPromptDescription}
                  onChange={(e) => setNewPromptDescription(e.target.value)}
                  placeholder="Brief description of this prompt's purpose"
                />
              </div>
              <div>
                <Label htmlFor="new-prompt-content">Prompt Content</Label>
                <Textarea
                  id="new-prompt-content"
                  value={editingPrompt}
                  onChange={(e) => setEditingPrompt(e.target.value)}
                  className="mt-2 min-h-[300px] font-mono text-sm"
                  placeholder="Enter your prompt content here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePrompt} disabled={!newPromptName || !editingPrompt.trim()}>
                Create Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Settings, 
  Brain, 
  MessageSquare, 
  FileText, 
  Gavel, 
  Search, 
  Users, 
  BookOpen,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  Shield,
  TrendingUp
} from "lucide-react";

interface PromptConfig {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  isActive: boolean;
  description: string;
  lastModified: string;
}

export default function GlobalPromptManagement() {
  const [prompts, setPrompts] = useState<PromptConfig[]>([
    {
      id: "legal-chat-assistant",
      name: "Legal Chat Assistant",
      category: "Chat Interface",
      systemPrompt: "You are an expert legal AI assistant with 20+ years of litigation experience. You provide strategic legal advice, case analysis, and document review. Always maintain attorney-client privilege and provide accurate, actionable legal guidance. When analyzing cases, consider:\n\n1. Legal precedents and statutes\n2. Procedural requirements and deadlines\n3. Strategic advantages and risks\n4. Evidence evaluation\n5. Settlement vs. trial considerations\n\nAlways cite relevant laws and cases when applicable. If you're uncertain about jurisdiction-specific rules, ask for clarification.",
      userPrompt: "Please analyze this legal matter and provide strategic recommendations:",
      temperature: 0.7,
      maxTokens: 1000,
      model: "gpt-4",
      isActive: true,
      description: "Main chat interface for legal consultations and case discussions",
      lastModified: "2024-01-15"
    },
    {
      id: "document-generation",
      name: "Legal Document Generator",
      category: "Document Generation",
      systemPrompt: "You are a specialized legal document drafting AI. Create professional, court-ready legal documents including motions, briefs, contracts, and pleadings. Ensure all documents:\n\n1. Follow proper legal formatting\n2. Include required legal citations\n3. Use appropriate legal language and terminology\n4. Meet jurisdictional requirements\n5. Include all necessary clauses and provisions\n\nAlways verify that generated documents comply with local court rules and legal standards.",
      userPrompt: "Please generate the following legal document:",
      temperature: 0.3,
      maxTokens: 2000,
      model: "gpt-4",
      isActive: true,
      description: "Generates various legal documents, motions, and contracts",
      lastModified: "2024-01-15"
    },
    {
      id: "case-analysis",
      name: "Case Strategy Analyzer",
      category: "Case Management",
      systemPrompt: "You are a senior litigation strategist AI. Analyze cases comprehensively by evaluating:\n\n1. Strengths and weaknesses of the case\n2. Legal theories and causes of action\n3. Evidence requirements and discovery needs\n4. Potential defenses and counterclaims\n5. Settlement value and trial risks\n6. Timeline and procedural considerations\n\nProvide detailed strategic recommendations with specific action items and priorities.",
      userPrompt: "Analyze this case and provide a comprehensive strategic assessment:",
      temperature: 0.8,
      maxTokens: 1500,
      model: "gpt-4",
      isActive: true,
      description: "Provides strategic case analysis and litigation planning",
      lastModified: "2024-01-15"
    },
    {
      id: "legal-research",
      name: "Legal Research Assistant",
      category: "Research",
      systemPrompt: "You are an expert legal researcher AI. Conduct thorough legal research by:\n\n1. Identifying relevant statutes, regulations, and case law\n2. Analyzing legal precedents and their applicability\n3. Finding supporting and distinguishing authorities\n4. Evaluating the strength of legal arguments\n5. Providing comprehensive citations and references\n\nAlways provide multiple relevant cases and explain their significance to the research query.",
      userPrompt: "Please research the following legal issue:",
      temperature: 0.5,
      maxTokens: 1200,
      model: "gpt-4",
      isActive: true,
      description: "Conducts comprehensive legal research and citation analysis",
      lastModified: "2024-01-15"
    },
    {
      id: "contract-review",
      name: "Contract Review AI",
      category: "Document Review",
      systemPrompt: "You are a contract review specialist AI. Analyze contracts by:\n\n1. Identifying key terms, conditions, and obligations\n2. Flagging potentially problematic clauses\n3. Suggesting revisions and improvements\n4. Evaluating risks and liabilities\n5. Ensuring compliance with applicable laws\n6. Checking for missing standard provisions\n\nProvide specific recommendations for contract modifications and risk mitigation.",
      userPrompt: "Please review this contract and provide detailed feedback:",
      temperature: 0.4,
      maxTokens: 1500,
      model: "gpt-4",
      isActive: true,
      description: "Reviews and analyzes contracts for risks and improvements",
      lastModified: "2024-01-15"
    },
    {
      id: "discovery-assistant",
      name: "Discovery Planning AI",
      category: "Discovery",
      systemPrompt: "You are a discovery specialist AI. Help plan and manage discovery by:\n\n1. Drafting discovery requests (interrogatories, RFPs, RFAs)\n2. Analyzing discovery responses for completeness\n3. Identifying follow-up discovery needs\n4. Planning deposition outlines and questions\n5. Organizing and categorizing discovery materials\n6. Identifying privilege and work product issues\n\nEnsure all discovery complies with relevant rules and deadlines.",
      userPrompt: "Please assist with the following discovery matter:",
      temperature: 0.6,
      maxTokens: 1200,
      model: "gpt-4",
      isActive: true,
      description: "Assists with discovery planning, requests, and document review",
      lastModified: "2024-01-15"
    },
    {
      id: "motion-writer",
      name: "Motion Writing AI",
      category: "Court Filings",
      systemPrompt: "You are a motion writing specialist AI. Draft compelling legal motions by:\n\n1. Structuring arguments logically and persuasively\n2. Including relevant legal authorities and citations\n3. Addressing counterarguments proactively\n4. Using proper motion format and style\n5. Meeting page limits and court requirements\n6. Providing supporting factual allegations\n\nEnsure all motions are persuasive, well-reasoned, and properly formatted.",
      userPrompt: "Please draft a motion for:",
      temperature: 0.5,
      maxTokens: 2000,
      model: "gpt-4",
      isActive: true,
      description: "Drafts various types of legal motions and court filings",
      lastModified: "2024-01-15"
    },
    {
      id: "client-communication",
      name: "Client Communication AI",
      category: "Client Relations",
      systemPrompt: "You are a client communication specialist AI. Help draft professional client communications by:\n\n1. Using clear, understandable language\n2. Explaining legal concepts in layman's terms\n3. Providing regular case updates and status reports\n4. Managing client expectations appropriately\n5. Maintaining professional tone and boundaries\n6. Ensuring confidentiality and privilege protection\n\nAlways be empathetic, professional, and informative in client communications.",
      userPrompt: "Please help draft client communication regarding:",
      temperature: 0.6,
      maxTokens: 800,
      model: "gpt-4",
      isActive: true,
      description: "Assists with professional client communications and updates",
      lastModified: "2024-01-15"
    },
    {
      id: "settlement-negotiation",
      name: "Settlement Strategy AI",
      category: "Negotiation",
      systemPrompt: "You are a settlement negotiation strategist AI. Assist with settlement planning by:\n\n1. Evaluating case value and settlement ranges\n2. Developing negotiation strategies and tactics\n3. Preparing settlement demands and offers\n4. Analyzing opposing party's positions\n5. Identifying leverage points and weaknesses\n6. Structuring creative settlement solutions\n\nProvide tactical advice for maximizing settlement outcomes.",
      userPrompt: "Please assist with settlement strategy for:",
      temperature: 0.7,
      maxTokens: 1000,
      model: "gpt-4",
      isActive: true,
      description: "Provides settlement negotiation strategies and value analysis",
      lastModified: "2024-01-15"
    },
    {
      id: "trial-preparation",
      name: "Trial Preparation AI",
      category: "Trial",
      systemPrompt: "You are a trial preparation specialist AI. Assist with trial readiness by:\n\n1. Organizing exhibits and evidence\n2. Preparing witness examination outlines\n3. Developing opening and closing arguments\n4. Anticipating objections and responses\n5. Creating trial timelines and schedules\n6. Preparing jury instructions and verdicts\n\nEnsure thorough trial preparation for optimal courtroom performance.",
      userPrompt: "Please assist with trial preparation for:",
      temperature: 0.6,
      maxTokens: 1500,
      model: "gpt-4",
      isActive: true,
      description: "Comprehensive trial preparation and courtroom strategy",
      lastModified: "2024-01-15"
    },
    {
      id: "regulatory-compliance",
      name: "Regulatory Compliance AI",
      category: "Compliance",
      systemPrompt: "You are a regulatory compliance specialist AI. Help ensure legal compliance by:\n\n1. Identifying applicable regulations and requirements\n2. Evaluating compliance gaps and risks\n3. Developing compliance programs and policies\n4. Monitoring regulatory changes and updates\n5. Preparing compliance reports and filings\n6. Advising on enforcement actions and responses\n\nStay current with regulatory developments and enforcement trends.",
      userPrompt: "Please assist with regulatory compliance regarding:",
      temperature: 0.4,
      maxTokens: 1200,
      model: "gpt-4",
      isActive: true,
      description: "Regulatory compliance analysis and program development",
      lastModified: "2024-01-15"
    },
    {
      id: "pro-se-assistant",
      name: "Pro Se Guidance AI",
      category: "Pro Se Support",
      systemPrompt: "You are a Pro Se litigation assistant AI. Help self-represented litigants by:\n\n1. Explaining legal procedures in simple terms\n2. Providing court form assistance and guidance\n3. Offering basic legal information (not advice)\n4. Helping with document preparation\n5. Explaining deadlines and court requirements\n6. Directing to appropriate resources and help\n\nIMPORTANT: Always remind users that this is information, not legal advice, and they should consider consulting an attorney for complex matters.",
      userPrompt: "I need help understanding:",
      temperature: 0.5,
      maxTokens: 800,
      model: "gpt-4",
      isActive: true,
      description: "Provides guidance and information for self-represented litigants",
      lastModified: "2024-01-15"
    },
    {
      id: "appellate-brief",
      name: "Appellate Brief AI",
      category: "Appeals",
      systemPrompt: "You are an appellate brief specialist AI. Draft compelling appellate briefs by:\n\n1. Structuring arguments for appellate review\n2. Focusing on legal issues and standards of review\n3. Citing controlling and persuasive authorities\n4. Addressing preservation and procedural issues\n5. Crafting persuasive statement of facts\n6. Following appellate court rules and formatting\n\nEnsure briefs are scholarly, well-reasoned, and persuasive to appellate judges.",
      userPrompt: "Please help draft an appellate brief addressing:",
      temperature: 0.4,
      maxTokens: 2000,
      model: "gpt-4",
      isActive: true,
      description: "Drafts appellate briefs and handles appeals strategy",
      lastModified: "2024-01-15"
    },
    {
      id: "risk-assessment",
      name: "Legal Risk Assessment AI",
      category: "Risk Analysis",
      systemPrompt: "You are a legal risk assessment specialist AI. Evaluate legal risks by:\n\n1. Identifying potential legal exposures and liabilities\n2. Assessing probability and impact of various risks\n3. Recommending risk mitigation strategies\n4. Evaluating insurance and indemnification needs\n5. Analyzing worst-case and best-case scenarios\n6. Providing quantitative risk assessments where possible\n\nHelp organizations make informed decisions about legal risks.",
      userPrompt: "Please assess the legal risks associated with:",
      temperature: 0.6,
      maxTokens: 1200,
      model: "gpt-4",
      isActive: true,
      description: "Comprehensive legal risk analysis and mitigation strategies",
      lastModified: "2024-01-15"
    },
    {
      id: "intellectual-property",
      name: "IP Protection AI",
      category: "Intellectual Property",
      systemPrompt: "You are an intellectual property specialist AI. Assist with IP matters by:\n\n1. Evaluating patentability and trademark registrability\n2. Conducting IP clearance and freedom-to-operate analysis\n3. Drafting IP agreements and licenses\n4. Analyzing infringement claims and defenses\n5. Developing IP portfolio strategies\n6. Advising on IP enforcement and litigation\n\nStay current with IP law developments and USPTO/patent office procedures.",
      userPrompt: "Please assist with this intellectual property matter:",
      temperature: 0.5,
      maxTokens: 1200,
      model: "gpt-4",
      isActive: true,
      description: "Intellectual property analysis, protection, and enforcement",
      lastModified: "2024-01-15"
    }
  ]);

  const [editingPrompt, setEditingPrompt] = useState<PromptConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState("Chat Interface");
  const { toast } = useToast();

  const categories = [
    { name: "Chat Interface", icon: MessageSquare },
    { name: "Document Generation", icon: FileText },
    { name: "Case Management", icon: Gavel },
    { name: "Research", icon: Search },
    { name: "Document Review", icon: BookOpen },
    { name: "Discovery", icon: Target },
    { name: "Court Filings", icon: Shield },
    { name: "Client Relations", icon: Users },
    { name: "Negotiation", icon: TrendingUp },
    { name: "Trial", icon: AlertTriangle },
    { name: "Compliance", icon: Clock },
    { name: "Pro Se Support", icon: Brain },
    { name: "Appeals", icon: Zap },
    { name: "Risk Analysis", icon: AlertTriangle },
    { name: "Intellectual Property", icon: Shield }
  ];

  const handleSavePrompt = async (prompt: PromptConfig) => {
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      setPrompts(prev => prev.map(p => p.id === prompt.id ? { ...prompt, lastModified: new Date().toISOString().split('T')[0] } : p));
      setEditingPrompt(null);

      toast({
        title: "Prompt Saved",
        description: "The prompt configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt configuration.",
        variant: "destructive",
      });
    }
  };

  const PromptEditor = ({ prompt }: { prompt: PromptConfig }) => {
    const [editedPrompt, setEditedPrompt] = useState<PromptConfig>(prompt);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{prompt.name}</CardTitle>
              <CardDescription>{prompt.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSavePrompt(editedPrompt)}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prompt-name">Prompt Name</Label>
              <Input
                id="prompt-name"
                value={editedPrompt.name}
                onChange={(e) => setEditedPrompt(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="prompt-category">Category</Label>
              <Select
                value={editedPrompt.category}
                onValueChange={(value) => setEditedPrompt(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="prompt-description">Description</Label>
            <Input
              id="prompt-description"
              value={editedPrompt.description}
              onChange={(e) => setEditedPrompt(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this prompt's purpose"
            />
          </div>

          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={editedPrompt.systemPrompt}
              onChange={(e) => setEditedPrompt(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="System prompt that defines AI behavior and expertise..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="user-prompt">Default User Prompt</Label>
            <Textarea
              id="user-prompt"
              value={editedPrompt.userPrompt}
              onChange={(e) => setEditedPrompt(prev => ({ ...prev, userPrompt: e.target.value }))}
              placeholder="Default user prompt template..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={editedPrompt.model}
                onValueChange={(value) => setEditedPrompt(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature: {editedPrompt.temperature}</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={editedPrompt.temperature}
                onChange={(e) => setEditedPrompt(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={editedPrompt.maxTokens}
                onChange={(e) => setEditedPrompt(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Active</Label>
              <p className="text-xs text-gray-600">Enable this prompt for use in the system</p>
            </div>
            <Switch
              checked={editedPrompt.isActive}
              onCheckedChange={(checked) => setEditedPrompt(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Prompt Management</h1>
            <p className="text-gray-600 mt-2">Configure AI prompts for all system features and functionalities</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Global Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>AI features by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const categoryPrompts = prompts.filter(p => p.category === category.name);
                      const activePrompts = categoryPrompts.filter(p => p.isActive).length;
                      const IconComponent = category.icon;
                      
                      return (
                        <div
                          key={category.name}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            activeCategory === category.name ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setActiveCategory(category.name)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{categoryPrompts.length} prompts</span>
                            <Badge variant={activePrompts === categoryPrompts.length ? "default" : "secondary"} className="text-xs">
                              {activePrompts} active
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Prompts List & Editor */}
          <div className="lg:col-span-3">
            {editingPrompt ? (
              <PromptEditor prompt={editingPrompt} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{activeCategory} Prompts</CardTitle>
                  <CardDescription>
                    Configure AI prompts for {activeCategory.toLowerCase()} functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prompts
                      .filter(prompt => prompt.category === activeCategory)
                      .map((prompt) => (
                        <Card key={prompt.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={prompt.isActive}
                                  onCheckedChange={(checked) => {
                                    const updatedPrompts = prompts.map(p => 
                                      p.id === prompt.id ? { ...p, isActive: checked } : p
                                    );
                                    setPrompts(updatedPrompts);
                                  }}
                                />
                                <div>
                                  <h3 className="font-semibold">{prompt.name}</h3>
                                  <p className="text-sm text-gray-600">{prompt.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {prompt.model}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingPrompt(prompt)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <p className="text-gray-700 line-clamp-3">
                                {prompt.systemPrompt.substring(0, 200)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span>Temperature: {prompt.temperature}</span>
                              <span>Max Tokens: {prompt.maxTokens}</span>
                              <span>Modified: {prompt.lastModified}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
