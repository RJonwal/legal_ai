import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Save, Plus, Trash2, Copy, Brain, FileText, 
  MessageSquare, Briefcase, Scale, Shield, 
  Sparkles, Settings, RotateCcw, Edit3
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate?: string;
  description: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  examples?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PromptCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  prompts: PromptTemplate[];
}

const defaultPrompts: PromptCategory[] = [
  {
    id: "case-analysis",
    name: "Case Analysis",
    icon: Brain,
    description: "AI prompts for analyzing legal cases and providing strategic insights",
    prompts: [
      {
        id: "senior-attorney",
        name: "Senior Legal Attorney",
        category: "case-analysis",
        systemPrompt: `You are a senior legal AI attorney with 20+ years of experience. You think strategically, proactively identify legal issues, and provide comprehensive legal analysis. Always consider:
- Procedural requirements and deadlines
- Evidentiary standards and burdens of proof
- Applicable statutes and case law
- Strategic advantages and risks
- Alternative legal theories and defenses
Provide actionable recommendations with clear reasoning.`,
        description: "Main AI persona for comprehensive legal analysis",
        variables: ["caseType", "jurisdiction", "clientRole"],
        isActive: true,
        isDefault: true,
        model: "gpt-4o",
        temperature: 0.4,
        maxTokens: 2000,
        tags: ["strategic", "comprehensive", "senior-level"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "case-strategist",
        name: "Case Strategy Specialist",
        category: "case-analysis",
        systemPrompt: `You are a litigation strategist with expertise in case planning. Provide:
- Strategic case assessment
- Strengths and weaknesses analysis
- Recommended next steps with priorities
- Timeline and milestone planning
- Risk assessment and mitigation strategies
- Alternative dispute resolution options
Be specific and actionable in your recommendations.`,
        description: "Focused on strategic case planning and risk assessment",
        variables: ["caseStage", "opposingParty", "desiredOutcome"],
        isActive: true,
        isDefault: false,
        model: "gpt-4o",
        temperature: 0.4,
        maxTokens: 1500,
        tags: ["strategy", "planning", "risk-assessment"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "document-generation",
    name: "Document Generation",
    icon: FileText,
    description: "Templates for generating legal documents and briefs",
    prompts: [
      {
        id: "document-generator",
        name: "Legal Document Generator",
        category: "document-generation",
        systemPrompt: `You are a legal document drafting expert. Generate professional legal documents that are:
- Properly formatted with court-compliant styling
- Legally sound and comprehensive
- Clear and persuasive
- Tailored to the specific case and jurisdiction
- Include all necessary legal citations and references
Follow standard legal document formatting conventions.`,
        description: "Creates professional legal documents with proper formatting",
        variables: ["documentType", "jurisdiction", "parties", "claims"],
        isActive: true,
        isDefault: true,
        model: "gpt-4o",
        temperature: 0.3,
        maxTokens: 3000,
        tags: ["documents", "drafting", "formatting"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "contract-analysis",
    name: "Contract Analysis",
    icon: Briefcase,
    description: "Specialized prompts for contract review and analysis",
    prompts: [
      {
        id: "contract-analyzer",
        name: "Contract Analysis Expert",
        category: "contract-analysis",
        systemPrompt: `You are an expert contract attorney specializing in contract analysis. Analyze contracts for:
- Key terms and conditions
- Potential risks and liabilities
- Missing or ambiguous clauses
- Unfavorable terms
- Negotiation points
- Compliance with applicable laws
Provide a structured analysis with specific recommendations.`,
        description: "Comprehensive contract review and risk assessment",
        variables: ["contractType", "parties", "jurisdiction"],
        isActive: true,
        isDefault: true,
        model: "gpt-4o",
        temperature: 0.3,
        maxTokens: 2000,
        tags: ["contracts", "risk-analysis", "negotiation"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: "chat-assistant",
    name: "Chat Assistant",
    icon: MessageSquare,
    description: "AI chat personalities for user interactions",
    prompts: [
      {
        id: "legal-chat",
        name: "Legal Chat Assistant",
        category: "chat-assistant",
        systemPrompt: `You are a helpful legal assistant AI. Provide clear, accurate legal information while being professional and supportive. 
- Answer questions about legal procedures and concepts
- Explain legal terms in plain language
- Provide general guidance while noting when specific legal advice is needed
- Be empathetic and understanding of legal challenges
Always remind users that AI assistance supplements but doesn't replace professional legal counsel when appropriate.`,
        description: "Friendly and knowledgeable chat assistant",
        variables: ["userType", "legalArea"],
        isActive: true,
        isDefault: true,
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 800,
        tags: ["chat", "support", "educational"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

export default function PromptManagement() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("case-analysis");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");

  // Fetch prompts
  const { data: prompts = defaultPrompts, isLoading } = useQuery<PromptCategory[]>({
    queryKey: ['/api/admin/prompts'],
  });

  const [formData, setFormData] = useState<PromptTemplate | null>(null);

  useEffect(() => {
    if (selectedPrompt) {
      setFormData({ ...selectedPrompt });
    }
  }, [selectedPrompt]);

  // Save prompt mutation
  const savePromptMutation = useMutation({
    mutationFn: async (prompt: PromptTemplate) => {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      if (!response.ok) throw new Error('Failed to save prompt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prompts'] });
      toast({
        title: "Prompt Saved",
        description: "AI prompt template has been updated successfully"
      });
      setEditMode(false);
    }
  });

  // Test prompt mutation
  const testPromptMutation = useMutation({
    mutationFn: async ({ prompt, input }: { prompt: PromptTemplate; input: string }) => {
      const response = await fetch('/api/admin/prompts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          systemPrompt: prompt.systemPrompt,
          userInput: input,
          model: prompt.model,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens
        })
      });
      if (!response.ok) throw new Error('Failed to test prompt');
      return response.json();
    },
    onSuccess: (data) => {
      setTestOutput(data.response);
      toast({
        title: "Test Complete",
        description: "AI response generated successfully"
      });
    }
  });

  const createNewPrompt = () => {
    const newPrompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: "New Prompt Template",
      category: selectedCategory,
      systemPrompt: "",
      description: "",
      variables: [],
      isActive: true,
      isDefault: false,
      model: "gpt-4o",
      temperature: 0.5,
      maxTokens: 1000,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedPrompt(newPrompt);
    setFormData(newPrompt);
    setEditMode(true);
  };

  const duplicatePrompt = (prompt: PromptTemplate) => {
    const duplicated: PromptTemplate = {
      ...prompt,
      id: `${prompt.id}-copy-${Date.now()}`,
      name: `${prompt.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedPrompt(duplicated);
    setFormData(duplicated);
    setEditMode(true);
  };

  const resetToDefault = (promptId: string) => {
    const category = prompts.find(cat => 
      cat.prompts.some(p => p.id === promptId)
    );
    const defaultPrompt = defaultPrompts
      .find(cat => cat.id === category?.id)?.prompts
      .find(p => p.id === promptId);
    
    if (defaultPrompt) {
      savePromptMutation.mutate(defaultPrompt);
    }
  };

  const currentCategory = prompts.find(cat => cat.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Prompt Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage AI prompts for all system features
          </p>
        </div>
        <Button
          onClick={createNewPrompt}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {prompts.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedPrompt(null);
                        }}
                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                          selectedCategory === category.id ? 'bg-muted border-l-4 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.prompts.length} prompts
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Prompts List */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentCategory?.name} Prompts</CardTitle>
              <CardDescription>{currentCategory?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[550px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {currentCategory?.prompts.map((prompt) => (
                      <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPrompt?.id === prompt.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedPrompt(prompt)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{prompt.name}</h4>
                              <div className="flex gap-2">
                                {prompt.isDefault && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                                {prompt.isActive ? (
                                  <Badge variant="default">Active</Badge>
                                ) : (
                                  <Badge variant="outline">Inactive</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {prompt.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                {prompt.model}
                              </span>
                              <span>Temp: {prompt.temperature}</span>
                              <span>Tokens: {prompt.maxTokens}</span>
                            </div>
                            {prompt.tags && prompt.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {prompt.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Editor */}
        <div className="col-span-5">
          {selectedPrompt ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editMode ? "Edit Prompt" : "Prompt Details"}
                  </CardTitle>
                  <div className="flex gap-2">
                    {!editMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestMode(!testMode)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {testMode ? "Hide Test" : "Test"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicatePrompt(selectedPrompt)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </Button>
                        {selectedPrompt.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetToDefault(selectedPrompt.id)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(true)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMode(false);
                            setFormData(selectedPrompt);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => formData && savePromptMutation.mutate(formData)}
                          disabled={savePromptMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="prompt" className="space-y-4">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={formData?.name || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          name: e.target.value
                        })}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData?.description || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          description: e.target.value
                        })}
                        disabled={!editMode}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>System Prompt</Label>
                      <Textarea
                        value={formData?.systemPrompt || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          systemPrompt: e.target.value
                        })}
                        disabled={!editMode}
                        className="font-mono text-sm"
                        rows={12}
                      />
                    </div>
                    {formData?.userPromptTemplate && (
                      <div>
                        <Label>User Prompt Template (Optional)</Label>
                        <Textarea
                          value={formData.userPromptTemplate}
                          onChange={(e) => setFormData({
                            ...formData,
                            userPromptTemplate: e.target.value
                          })}
                          disabled={!editMode}
                          className="font-mono text-sm"
                          rows={6}
                          placeholder="Template with {{variables}} for user inputs"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Model</Label>
                        <Select
                          value={formData?.model || "gpt-4o"}
                          onValueChange={(value) => formData && setFormData({
                            ...formData,
                            model: value
                          })}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Max Tokens</Label>
                        <Input
                          type="number"
                          value={formData?.maxTokens || 1000}
                          onChange={(e) => formData && setFormData({
                            ...formData,
                            maxTokens: parseInt(e.target.value)
                          })}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>Temperature (0-1)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={formData?.temperature || 0.5}
                          onChange={(e) => formData && setFormData({
                            ...formData,
                            temperature: parseFloat(e.target.value)
                          })}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Active</Label>
                        <Switch
                          checked={formData?.isActive || false}
                          onCheckedChange={(checked) => formData && setFormData({
                            ...formData,
                            isActive: checked
                          })}
                          disabled={!editMode}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={formData?.tags?.join(", ") || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                        })}
                        disabled={!editMode}
                        placeholder="e.g., strategic, comprehensive, analysis"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="variables" className="space-y-4">
                    <div>
                      <Label>Variables (one per line)</Label>
                      <Textarea
                        value={formData?.variables?.join("\n") || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          variables: e.target.value.split("\n").filter(Boolean)
                        })}
                        disabled={!editMode}
                        rows={6}
                        placeholder="caseType&#10;jurisdiction&#10;clientRole"
                      />
                    </div>
                    <div>
                      <Label>Examples (optional)</Label>
                      <Textarea
                        value={formData?.examples?.join("\n---\n") || ""}
                        onChange={(e) => formData && setFormData({
                          ...formData,
                          examples: e.target.value.split("\n---\n").filter(Boolean)
                        })}
                        disabled={!editMode}
                        rows={6}
                        placeholder="Example input/output pairs separated by ---"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Test Interface */}
                {testMode && (
                  <Card className="mt-4 border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Test Prompt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Test Input</Label>
                        <Textarea
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="Enter test input to send to the AI..."
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={() => selectedPrompt && testPromptMutation.mutate({
                          prompt: selectedPrompt,
                          input: testInput
                        })}
                        disabled={testPromptMutation.isPending || !testInput}
                        className="w-full"
                      >
                        {testPromptMutation.isPending ? "Testing..." : "Run Test"}
                      </Button>
                      {testOutput && (
                        <div>
                          <Label>AI Response</Label>
                          <Card className="mt-2">
                            <CardContent className="p-4">
                              <pre className="whitespace-pre-wrap text-sm">
                                {testOutput}
                              </pre>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a prompt to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}