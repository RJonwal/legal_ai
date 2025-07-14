import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Eye,
  Plus,
  Edit
} from "@/lib/icons";

interface GlobalPrompt {
  id: string;
  name: string;
  promptContent: string;
  category: 'system' | 'legal' | 'document' | 'analysis';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description: string;
}

export default function GlobalPromptManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPrompt, setEditingPrompt] = useState<GlobalPrompt | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Fetch global prompts from API
  const { data: prompts, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/global-prompts'],
    queryFn: async () => {
      console.log("Fetching global prompts from API...");
      const response = await fetch('/api/admin/global-prompts');
      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }
      const data = await response.json();
      console.log("API returned prompts:", data);
      return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async (data: { id: string; content: string }) => {
      const response = await fetch(`/api/admin/global-prompts/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Global prompt updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-prompts'] });
      setEditingPrompt(null);
      setEditingContent('');
    },
    onError: (error) => {
      console.error('Update prompt error:', error);
      toast({
        title: "Error",
        description: "Failed to update global prompt",
        variant: "destructive",
      });
    },
  });

  // Handle save prompt
  const handleSavePrompt = () => {
    if (editingPrompt) {
      updatePromptMutation.mutate({
        id: editingPrompt.id,
        content: editingContent
      });
    }
  };

  // Handle edit prompt
  const handleEditPrompt = (prompt: GlobalPrompt) => {
    setEditingPrompt(prompt);
    setEditingContent(prompt.promptContent);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setEditingContent('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'legal': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading global prompts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load global prompts</p>
          <Button onClick={() => refetch()} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  console.log('Global prompts data:', prompts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Prompt Management</h1>
          <p className="text-gray-600 mt-1">Configure AI behavior and response patterns across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {prompts && Array.isArray(prompts) && prompts.length > 0 ? (
          prompts.map((prompt: GlobalPrompt) => (
            <Card key={prompt.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
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
                      {prompt.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="max-h-32 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {prompt.promptContent.substring(0, 200)}...
                    </pre>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span>Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                  <span>Last modified: {new Date(prompt.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Global Prompts Found</h3>
            <p className="text-gray-500 mb-4">Global prompts help configure AI behavior across the platform.</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Edit Prompt Dialog */}
      <Dialog open={editingPrompt !== null} onOpenChange={handleCancelEdit}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Global Prompt</DialogTitle>
            <DialogDescription>
              Modify the AI behavior prompt. Changes will affect all AI responses across the platform.
            </DialogDescription>
          </DialogHeader>
          
          {editingPrompt && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(editingPrompt.category)}>
                  {editingPrompt.category}
                </Badge>
                <span className="font-medium">{editingPrompt.name}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-content">Prompt Content</Label>
                <Textarea
                  id="prompt-content"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter prompt content..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePrompt}
              disabled={updatePromptMutation.isPending}
            >
              {updatePromptMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}