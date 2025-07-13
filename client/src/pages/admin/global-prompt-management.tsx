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
