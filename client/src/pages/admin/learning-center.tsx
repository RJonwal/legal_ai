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
import { toast } from "@/hooks/use-toast";
import { 
  BookOpen, Plus, Edit, Trash2, Save, Eye, 
  FileText, Video, ExternalLink, Tag, Calendar,
  Search, Filter, MoreVertical
} from "lucide-react";

interface LearningResource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'tutorial' | 'guide' | 'faq';
  category: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  videoUrl?: string;
  externalUrl?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  order: number;
}

interface LearningCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

export default function LearningCenter() {
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewResourceDialogOpen, setIsNewResourceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const queryClient = useQueryClient();

  // Fetch learning resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['/api/admin/learning-resources'],
    queryFn: async () => {
      const response = await fetch('/api/admin/learning-resources');
      if (!response.ok) throw new Error('Failed to fetch learning resources');
      return response.json();
    }
  });

  // Fetch learning categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/learning-categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/learning-categories');
      if (!response.ok) throw new Error('Failed to fetch learning categories');
      return response.json();
    }
  });

  // Create/Update resource mutation
  const resourceMutation = useMutation({
    mutationFn: async (resourceData: Partial<LearningResource>) => {
      const method = resourceData.id ? 'PUT' : 'POST';
      const url = resourceData.id ? `/api/admin/learning-resources/${resourceData.id}` : '/api/admin/learning-resources';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });
      
      if (!response.ok) throw new Error('Failed to save learning resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learning-resources'] });
      toast({ title: "Success", description: "Learning resource saved successfully" });
      setIsEditDialogOpen(false);
      setIsNewResourceDialogOpen(false);
      setSelectedResource(null);
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save learning resource",
        variant: "destructive" 
      });
    }
  });

  // Delete resource mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/learning-resources/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete learning resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learning-resources'] });
      toast({ title: "Success", description: "Learning resource deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete learning resource",
        variant: "destructive" 
      });
    }
  });

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (categoryData: Partial<LearningCategory>) => {
      const method = categoryData.id ? 'PUT' : 'POST';
      const url = categoryData.id ? `/api/admin/learning-categories/${categoryData.id}` : '/api/admin/learning-categories';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) throw new Error('Failed to save learning category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learning-categories'] });
      toast({ title: "Success", description: "Learning category saved successfully" });
    }
  });

  const filteredResources = resources.filter((resource: LearningResource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'tutorial': return <BookOpen className="h-4 w-4" />;
      case 'guide': return <FileText className="h-4 w-4" />;
      case 'faq': return <Tag className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveResource = (resourceData: Partial<LearningResource>) => {
    resourceMutation.mutate(resourceData);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('Are you sure you want to delete this learning resource?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading learning center...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Center Management</h1>
          <p className="text-gray-600 mt-2">Manage educational content and resources</p>
        </div>
        <Button onClick={() => setIsNewResourceDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search Resources</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title or description..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Filter by Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: LearningCategory) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource: LearningResource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(resource.type)}
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      {resource.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(resource.difficulty)}
                      >
                        {resource.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {resource.estimatedReadTime} min read
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{resource.viewCount} views</span>
                      <span>{new Date(resource.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={resource.isPublished}
                          onCheckedChange={(checked) => 
                            handleSaveResource({ 
                              ...resource, 
                              isPublished: checked 
                            })
                          }
                          size="sm"
                        />
                        <span className="text-sm">Published</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Categories</CardTitle>
              <CardDescription>Organize your learning content into categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category: LearningCategory) => (
                  <Card key={category.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{category.name}</h4>
                        <Switch 
                          checked={category.isActive}
                          onCheckedChange={(checked) => 
                            categoryMutation.mutate({ 
                              ...category, 
                              isActive: checked 
                            })
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge style={{ backgroundColor: category.color }}>
                          {category.icon}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">+3 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resources.reduce((sum: number, r: LearningResource) => sum + r.viewCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resources.filter((r: LearningResource) => r.isPublished).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((resources.filter((r: LearningResource) => r.isPublished).length / resources.length) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">+1 this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Popular Resources</CardTitle>
              <CardDescription>Most viewed learning resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources
                  .sort((a: LearningResource, b: LearningResource) => b.viewCount - a.viewCount)
                  .slice(0, 5)
                  .map((resource: LearningResource, index: number) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-gray-600">{resource.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{resource.viewCount} views</p>
                        <p className="text-sm text-gray-600">{resource.difficulty}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen || isNewResourceDialogOpen} onOpenChange={() => {
        setIsEditDialogOpen(false);
        setIsNewResourceDialogOpen(false);
        setSelectedResource(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResource ? 'Edit Resource' : 'Create New Resource'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  defaultValue={selectedResource?.title || ''}
                  placeholder="Resource title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={selectedResource?.type || 'article'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={selectedResource?.description || ''}
                placeholder="Brief description of the resource"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                defaultValue={selectedResource?.content || ''}
                placeholder="Full content of the resource (supports Markdown)"
                rows={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={selectedResource?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: LearningCategory) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select defaultValue={selectedResource?.difficulty || 'beginner'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="readTime">Estimated Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  defaultValue={selectedResource?.estimatedReadTime || 5}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="published"
                  defaultChecked={selectedResource?.isPublished || false}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured"
                  defaultChecked={selectedResource?.isFeatured || false}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setIsNewResourceDialogOpen(false);
              setSelectedResource(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Collect form data and save
              const formData = new FormData();
              // Implementation for saving would go here
              handleSaveResource({
                id: selectedResource?.id,
                title: (document.getElementById('title') as HTMLInputElement)?.value,
                description: (document.getElementById('description') as HTMLTextAreaElement)?.value,
                content: (document.getElementById('content') as HTMLTextAreaElement)?.value,
                type: 'article', // Get from select
                difficulty: 'beginner', // Get from select
                estimatedReadTime: parseInt((document.getElementById('readTime') as HTMLInputElement)?.value || '5'),
                isPublished: (document.getElementById('published') as HTMLInputElement)?.checked || false,
                isFeatured: (document.getElementById('featured') as HTMLInputElement)?.checked || false,
                category: 'general',
                tags: [],
                author: 'Admin',
                viewCount: selectedResource?.viewCount || 0,
                order: selectedResource?.order || 0
              });
            }}>
              <Save className="h-4 w-4 mr-2" />
              Save Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}