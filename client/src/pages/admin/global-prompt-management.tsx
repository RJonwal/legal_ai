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
  
  // Load prompts from API
  const { data: prompts = [], refetch } = useQuery({
    queryKey: ['global-prompts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/global-prompts');
      return response.json();
    }
  });

  const [localPrompts, setLocalPrompts] = useState<GlobalPrompt[]>([
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
    },
    {
      id: "4",
      name: "Legal Research & Precedent Prompt",
      content: `When conducting legal research, provide comprehensive and accurate analysis:

RESEARCH METHODOLOGY:
1. Identify relevant legal precedents and case law
2. Analyze statutory requirements and regulations
3. Consider jurisdictional variations and differences
4. Evaluate strength and applicability of precedents
5. Provide citation formats and legal references

ANALYSIS COMPONENTS:
- Case summaries with key holdings
- Statutory analysis and interpretation
- Regulatory compliance requirements
- Conflicting authority identification
- Trend analysis in legal decisions

DELIVERABLES:
- Comprehensive research memorandum
- Case law citations and summaries
- Statutory analysis with references
- Risk assessment based on precedents
- Strategic recommendations based on research

Always verify current law status and cite primary sources whenever possible.`,
      category: 'legal',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Comprehensive legal research and precedent analysis guidance"
    },
    {
      id: "5",
      name: "Motion and Brief Writing Prompt",
      content: `When drafting motions and legal briefs, follow professional standards:

STRUCTURE REQUIREMENTS:
1. Clear statement of relief sought
2. Factual background with proper citations
3. Legal argument with supporting authority
4. Conclusion with specific requested relief
5. Proper formatting and procedural compliance

ARGUMENTATION STANDARDS:
- Lead with strongest arguments
- Use persuasive but professional tone
- Support all claims with legal authority
- Address potential counterarguments
- Maintain logical flow and organization

TECHNICAL REQUIREMENTS:
- Proper court formatting and rules
- Accurate legal citations (Bluebook format)
- Appropriate procedural deadlines
- Service requirements and compliance
- Filing fee and administrative requirements

Focus on persuasive legal writing that advances client interests while maintaining professional credibility.`,
      category: 'document',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Professional motion and brief writing standards and guidelines"
    },
    {
      id: "6",
      name: "Contract Drafting and Review Prompt",
      content: `When drafting or reviewing contracts, ensure comprehensive protection:

DRAFTING PRINCIPLES:
1. Clear and unambiguous language
2. Comprehensive scope and definitions
3. Balanced risk allocation
4. Enforceable terms and conditions
5. Appropriate remedies and dispute resolution

KEY CLAUSES TO REVIEW:
- Payment terms and conditions
- Performance obligations and standards
- Termination and cancellation rights
- Liability limitations and indemnification
- Dispute resolution and governing law

RISK ASSESSMENT:
- Identify potential legal vulnerabilities
- Assess enforceability issues
- Review compliance with applicable law
- Evaluate business risk allocation
- Recommend protective modifications

Always consider both legal enforceability and business practicality in contract terms.`,
      category: 'document',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Contract drafting and review standards for comprehensive legal protection"
    },
    {
      id: "7",
      name: "Discovery and Evidence Management Prompt",
      content: `When managing discovery and evidence, maintain organization and compliance:

DISCOVERY PLANNING:
1. Develop comprehensive discovery strategy
2. Identify key documents and witnesses
3. Plan deposition schedules and priorities
4. Manage discovery deadlines and responses
5. Coordinate with opposing counsel professionally

EVIDENCE ORGANIZATION:
- Categorize documents by relevance and privilege
- Maintain chronological case timelines
- Track witness statements and depositions
- Organize exhibits for trial presentation
- Ensure chain of custody documentation

COMPLIANCE REQUIREMENTS:
- Meet all discovery deadlines
- Provide complete and accurate responses
- Assert appropriate privileges and objections
- Maintain confidentiality protections
- Follow local court rules and procedures

Focus on strategic discovery that builds case strength while managing costs and timelines effectively.`,
      category: 'analysis',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Discovery and evidence management for effective case preparation"
    },
    {
      id: "8",
      name: "Client Communication and Updates Prompt",
      content: `When communicating with clients, maintain professionalism and clarity:

COMMUNICATION STANDARDS:
1. Use clear, non-legal language when possible
2. Provide regular case status updates
3. Explain legal concepts and procedures
4. Set realistic expectations and timelines
5. Document all significant communications

UPDATE COMPONENTS:
- Current case status and recent developments
- Upcoming deadlines and required actions
- Strategic decisions and recommendations
- Cost estimates and billing information
- Next steps and client responsibilities

PROFESSIONAL REQUIREMENTS:
- Maintain client confidentiality
- Respond promptly to client inquiries
- Provide honest assessments of case prospects
- Explain fee arrangements clearly
- Document advice and recommendations

Always prioritize client understanding and informed decision-making in all communications.`,
      category: 'legal',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Professional client communication standards and best practices"
    },
    {
      id: "9",
      name: "Settlement Negotiation Prompt",
      content: `When conducting settlement negotiations, balance advocacy with practicality:

NEGOTIATION STRATEGY:
1. Assess case strengths and weaknesses objectively
2. Research comparable settlements and verdicts
3. Understand opposing party's motivations
4. Develop multiple negotiation scenarios
5. Maintain flexibility while protecting core interests

NEGOTIATION TACTICS:
- Present compelling factual and legal arguments
- Use persuasive but respectful communication
- Make strategic concessions to advance discussions
- Document all offers and counteroffers
- Maintain professional relationships

SETTLEMENT ANALYSIS:
- Compare settlement offers to trial prospects
- Consider litigation costs and risks
- Evaluate tax implications of settlement
- Review enforceability of settlement terms
- Assess client satisfaction with proposed resolution

Focus on achieving client objectives while minimizing risks and costs associated with continued litigation.`,
      category: 'legal',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Strategic settlement negotiation approach for optimal client outcomes"
    },
    {
      id: "10",
      name: "Trial Preparation and Strategy Prompt",
      content: `When preparing for trial, develop comprehensive strategy and preparation:

TRIAL PREPARATION:
1. Organize all evidence and exhibits systematically
2. Prepare witness examinations and cross-examinations
3. Develop opening and closing argument themes
4. Research jury selection strategies and voir dire
5. Prepare for anticipated objections and rulings

STRATEGIC PLANNING:
- Identify key themes and case narrative
- Prioritize strongest evidence and arguments
- Anticipate opposing counsel's strategy
- Prepare backup arguments and alternatives
- Plan courtroom logistics and presentation

PRESENTATION SKILLS:
- Use clear, persuasive communication
- Maintain professional demeanor at all times
- Adapt strategy based on judge and jury reactions
- Handle unexpected developments calmly
- Focus on facts and law rather than emotion

Always maintain ethical standards while zealously advocating for client interests.`,
      category: 'legal',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Comprehensive trial preparation and courtroom strategy"
    },
    {
      id: "11",
      name: "Notification Generation Prompt",
      content: `When generating notifications for case actions, provide clear and actionable information:

NOTIFICATION STANDARDS:
1. Clear subject line indicating urgency and topic
2. Concise summary of action required or information
3. Specific deadlines and timeframes
4. Contact information for questions or clarification
5. Professional tone appropriate for legal matters

NOTIFICATION TYPES:
- Case milestone updates and status changes
- Deadline reminders and calendar alerts
- Document requests and submissions
- Court date notifications and preparations
- Settlement discussions and opportunities

ACTION ITEMS:
- Clearly state what action is required
- Provide deadline dates and time requirements
- Include relevant case information and references
- Offer assistance or clarification if needed
- Track notification delivery and responses

Focus on timely, accurate communication that helps users stay informed and take appropriate action.`,
      category: 'system',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "Standards for generating clear and actionable case notifications"
    },
    {
      id: "12",
      name: "Case Action Button Prompts",
      content: `When users click case action buttons, provide contextual AI assistance:

FILE MOTION ACTION:
- Analyze case facts to suggest appropriate motion types
- Provide motion templates with case-specific language
- Include relevant legal standards and requirements
- Suggest supporting evidence and authorities
- Generate filing deadlines and procedural requirements

REQUEST DISCOVERY ACTION:
- Suggest relevant discovery requests based on case type
- Provide templates for interrogatories, document requests
- Recommend deposition priorities and strategies
- Include discovery deadlines and compliance requirements
- Generate case-specific discovery plans

SCHEDULE DEPOSITION ACTION:
- Identify key witnesses for deposition priority
- Suggest deposition topics and question areas
- Provide scheduling coordination assistance
- Include preparation checklists and requirements
- Generate deposition notice templates

DRAFT SETTLEMENT ACTION:
- Analyze case value and settlement ranges
- Provide settlement agreement templates
- Suggest negotiation strategies and talking points
- Include tax and enforceability considerations
- Generate settlement demand letters

Each action should provide immediate, practical assistance tailored to the specific case context.`,
      category: 'system',
      isActive: true,
      lastModified: "2024-01-15T10:00:00Z",
      version: 1,
      description: "AI assistance prompts for all case action buttons and user interactions"
    }
  ]);

  const [activePrompt, setActivePrompt] = useState<GlobalPrompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptDescription, setNewPromptDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSavePrompt = async () => {
    if (activePrompt) {
      try {
        const response = await fetch(`/api/admin/global-prompts/${activePrompt.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...activePrompt,
            content: editingPrompt
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update prompt');
        }

        await refetch();
        setActivePrompt(null);
        setEditingPrompt('');
        
        toast({
          title: "Prompt Updated",
          description: "The global prompt has been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update prompt. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreatePrompt = async () => {
    if (newPromptName && editingPrompt) {
      try {
        const newPrompt = {
          name: newPromptName,
          content: editingPrompt,
          category: 'system',
          isActive: true,
          description: newPromptDescription || "New custom prompt"
        };

        const response = await fetch('/api/admin/global-prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPrompt),
        });

        if (!response.ok) {
          throw new Error('Failed to create prompt');
        }

        await refetch();
        setIsCreating(false);
        setNewPromptName('');
        setNewPromptDescription('');
        setEditingPrompt('');
        
        toast({
          title: "Prompt Created",
          description: "New global prompt has been successfully created.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create prompt. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleTogglePrompt = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/global-prompts/${promptId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle prompt');
      }

      await refetch();
      
      toast({
        title: "Prompt Status Updated",
        description: "Prompt activation status has been changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt status. Please try again.",
        variant: "destructive"
      });
    }
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
