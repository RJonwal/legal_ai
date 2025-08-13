import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  MessageSquare, Plus, Edit, Trash2, Save, TestTube, Copy, 
  Brain, FileText, Scale, Gavel, Users, Clock, Target
} from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  description: string;
  promptContent: string;
  category: 'chat' | 'document' | 'analysis' | 'strategy' | 'contract-analysis' | 'case-insights' | 'next-best-action' | 'general';
  isActive: boolean;
  lastModified: string;
  usageCount: number;
  version: string;
}

export default function PromptManagement() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState("");
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/prompts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      return response.json();
    }
  });

  // Create/Update prompt mutation
  const promptMutation = useMutation({
    mutationFn: async (promptData: Partial<Prompt>) => {
      const method = promptData.id ? 'PUT' : 'POST';
      const url = promptData.id ? `/api/admin/prompts/${promptData.id}` : '/api/admin/prompts';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
      
      if (!response.ok) throw new Error('Failed to save prompt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prompts'] });
      toast({ title: "Success", description: "Prompt saved successfully" });
      setIsEditing(false);
      setSelectedPrompt(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to save prompt",
        variant: "destructive" 
      });
    }
  });

  // Delete prompt mutation
  const deleteMutation = useMutation({
    mutationFn: async (promptId: string) => {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete prompt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prompts'] });
      toast({ title: "Success", description: "Prompt deleted successfully" });
      setSelectedPrompt(null);
    }
  });

  // Test prompt mutation
  const testMutation = useMutation({
    mutationFn: async ({ promptId, input }: { promptId: string; input: string }) => {
      const response = await fetch(`/api/admin/prompts/${promptId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      if (!response.ok) throw new Error('Failed to test prompt');
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data.result);
    }
  });

  const handleTestPrompt = () => {
    if (selectedPrompt && testInput) {
      testMutation.mutate({ promptId: selectedPrompt.id, input: testInput });
    }
  };

  const defaultPrompts = [
    {
      id: "1",
      name: "Senior Legal AI Attorney",
      description: "Main chat assistant prompt for legal consultation",
      promptContent: `You are a senior legal AI attorney with 20+ years of experience. You think strategically, proactively identify legal issues, and provide comprehensive legal analysis. Always consider:
- Procedural requirements and deadlines
- Evidentiary standards and burdens of proof
- Applicable statutes and case law
- Strategic advantages and risks
- Alternative legal theories and defenses
Provide actionable recommendations with clear reasoning.`,
      category: 'chat' as const,
      isActive: true,
      lastModified: "2024-01-15",
      usageCount: 1247,
      version: "v2.1"
    },
    {
      id: "2", 
      name: "Document Generation Assistant",
      description: "Specialized prompt for generating legal documents",
      promptContent: `You are a legal document drafting expert. Generate professional legal documents that are:
- Properly formatted with court-compliant styling
- Legally sound and comprehensive
- Clear and persuasive
- Tailored to the specific case and jurisdiction
- Include all necessary legal citations and references
Follow standard legal document formatting conventions.`,
      category: 'document' as const,
      isActive: true,
      lastModified: "2024-01-12",
      usageCount: 892,
      version: "v1.8"
    },
    {
      id: "3",
      name: "Contract Analysis Specialist", 
      description: "Expert contract review and analysis prompt",
      promptContent: `You are an expert contract attorney specializing in contract analysis. Analyze contracts for:
- Key terms and conditions
- Potential risks and liabilities
- Missing or ambiguous clauses
- Unfavorable terms
- Negotiation points
- Compliance with applicable laws
Provide a structured analysis with specific recommendations.`,
      category: 'analysis' as const,
      isActive: true,
      lastModified: "2024-01-10",
      usageCount: 634,
      version: "v1.5"
    },
    {
      id: "4",
      name: "Case Strategy Advisor",
      description: "Strategic case planning and analysis prompt",
      promptContent: `You are a litigation strategist with expertise in case planning. Provide:
- Strategic case assessment
- Strengths and weaknesses analysis
- Recommended next steps with priorities
- Timeline and milestone planning
- Risk assessment and mitigation strategies
- Alternative dispute resolution options
Be specific and actionable in your recommendations.`,
      category: 'strategy' as const,
      isActive: true,
      lastModified: "2024-01-08",
      usageCount: 456,
      version: "v1.3"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat': return MessageSquare;
      case 'document': return FileText;
      case 'analysis': return Scale;
      case 'strategy': return Target;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chat': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      case 'strategy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading prompts...</div>;
  }

  const promptsData = prompts.length > 0 ? prompts : defaultPrompts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <p className="text-gray-600 mt-2">Manage AI prompts for different legal services</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedPrompt(null);
            setIsEditing(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>All Prompts</CardTitle>
              <CardDescription>Select a prompt to view or edit</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {promptsData.map((prompt) => {
                    const IconComponent = getCategoryIcon(prompt.category);
                    return (
                      <div
                        key={prompt.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPrompt?.id === prompt.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                            <div>
                              <h4 className="font-medium text-sm">{prompt.name}</h4>
                              <p className="text-xs text-gray-600">{prompt.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getCategoryColor(prompt.category)}>
                              {prompt.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${prompt.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-xs text-gray-500">{prompt.version}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Prompt Editor */}
        <div className="lg:col-span-2">
          {selectedPrompt || isEditing ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {isEditing ? (selectedPrompt ? 'Edit Prompt' : 'Create Prompt') : 'Prompt Details'}
                    </CardTitle>
                    <CardDescription>
                      {isEditing ? 'Configure prompt settings and content' : 'View prompt information'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing && selectedPrompt && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsTestDialogOpen(true)}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(selectedPrompt.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    promptMutation.mutate({
                      id: selectedPrompt?.id,
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      promptContent: formData.get('promptContent') as string,
                      category: formData.get('category') as any,
                      isActive: formData.get('isActive') === 'on'
                    });
                  }}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Prompt Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={selectedPrompt?.name || ''}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          defaultValue={selectedPrompt?.description || ''}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue={selectedPrompt?.category || 'general'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chat">Chat Assistant</SelectItem>
                            <SelectItem value="document">Document Generation</SelectItem>
                            <SelectItem value="analysis">Analysis & Review</SelectItem>
                            <SelectItem value="strategy">Strategy & Planning</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="promptContent">Prompt Content</Label>
                        <Textarea
                          id="promptContent"
                          name="promptContent"
                          defaultValue={selectedPrompt?.promptContent || ''}
                          className="h-64"
                          placeholder="Enter the AI prompt content..."
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          defaultChecked={selectedPrompt?.isActive ?? true}
                          className="rounded"
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={promptMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {promptMutation.isPending ? 'Saving...' : 'Save Prompt'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            if (!selectedPrompt) setSelectedPrompt(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : selectedPrompt && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="font-medium">{selectedPrompt.name}</p>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Badge className={getCategoryColor(selectedPrompt.category)}>
                          {selectedPrompt.category}
                        </Badge>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedPrompt.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span>{selectedPrompt.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Usage Count</Label>
                        <p className="font-medium">{selectedPrompt.usageCount?.toLocaleString() || 0}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <p className="text-gray-700">{selectedPrompt.description}</p>
                    </div>

                    <div>
                      <Label>Prompt Content</Label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{selectedPrompt.promptContent}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Prompt Selected</h3>
                  <p>Select a prompt from the list to view details or create a new one</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Test Prompt Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Prompt</DialogTitle>
            <DialogDescription>
              Test the prompt with sample input to see how it performs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="testInput">Test Input</Label>
              <Textarea
                id="testInput"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test input for the AI prompt..."
                className="h-32"
              />
            </div>
            
            {testResult && (
              <div>
                <Label>AI Response</Label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleTestPrompt}
              disabled={!testInput || testMutation.isPending}
            >
              {testMutation.isPending ? 'Testing...' : 'Test Prompt'}
            </Button>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}