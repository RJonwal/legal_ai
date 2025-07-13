import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, FileText, AlertCircle, Calendar, Scale, Upload, X, File } from "lucide-react";

const newCaseSchema = z.object({
  title: z.string().min(1, "Case title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  clientName: z.string().min(1, "Client name is required"),
  status: z.string().min(1, "Status is required"),
  caseType: z.string().min(1, "Case type is required"),
  priority: z.string().min(1, "Priority is required"),
});

type NewCaseForm = z.infer<typeof newCaseSchema>;

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (caseId: number) => void;
}

export function NewCaseModal({ isOpen, onClose, onCaseCreated }: NewCaseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<NewCaseForm>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      clientName: "",
      status: "active",
      caseType: "",
      priority: "medium",
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: NewCaseForm) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(caseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create case');
      }
      
      return response.json();
    },
    onSuccess: async (newCase) => {
      // Upload files if any
      if (uploadedFiles.length > 0) {
        await uploadFilesToCase(newCase.id);
      }
      
      toast({
        title: "Case Created",
        description: `Case "${newCase.title}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cases'] });
      onCaseCreated(newCase.id);
      form.reset();
      setUploadedFiles([]);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    },
  });

  // File upload functions
  const uploadFilesToCase = async (caseId: number) => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/cases/${caseId}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "File upload failed",
        description: "Some files could not be uploaded.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
        });
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (data: NewCaseForm) => {
    createCaseMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Case
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Case Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-4 w-4" />
                    Case Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter case title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="contract dispute">Contract Dispute</SelectItem>
                            <SelectItem value="personal injury">Personal Injury</SelectItem>
                            <SelectItem value="family law">Family Law</SelectItem>
                            <SelectItem value="criminal law">Criminal Law</SelectItem>
                            <SelectItem value="corporate law">Corporate Law</SelectItem>
                            <SelectItem value="employment law">Employment Law</SelectItem>
                            <SelectItem value="intellectual property">Intellectual Property</SelectItem>
                            <SelectItem value="real estate">Real Estate</SelectItem>
                            <SelectItem value="estate law">Estate & Probate Law</SelectItem>
                            <SelectItem value="immigration">Immigration Law</SelectItem>
                            <SelectItem value="bankruptcy">Bankruptcy Law</SelectItem>
                            <SelectItem value="tax law">Tax Law</SelectItem>
                            <SelectItem value="environmental law">Environmental Law</SelectItem>
                            <SelectItem value="healthcare law">Healthcare Law</SelectItem>
                            <SelectItem value="securities law">Securities Law</SelectItem>
                            <SelectItem value="antitrust law">Antitrust Law</SelectItem>
                            <SelectItem value="civil rights">Civil Rights</SelectItem>
                            <SelectItem value="constitutional law">Constitutional Law</SelectItem>
                            <SelectItem value="administrative law">Administrative Law</SelectItem>
                            <SelectItem value="insurance law">Insurance Law</SelectItem>
                            <SelectItem value="international law">International Law</SelectItem>
                            <SelectItem value="maritime law">Maritime Law</SelectItem>
                            <SelectItem value="entertainment law">Entertainment Law</SelectItem>
                            <SelectItem value="sports law">Sports Law</SelectItem>
                            <SelectItem value="education law">Education Law</SelectItem>
                            <SelectItem value="construction law">Construction Law</SelectItem>
                            <SelectItem value="product liability">Product Liability</SelectItem>
                            <SelectItem value="medical malpractice">Medical Malpractice</SelectItem>
                            <SelectItem value="class action">Class Action</SelectItem>
                            <SelectItem value="appellate">Appellate</SelectItem>
                            <SelectItem value="white collar crime">White Collar Crime</SelectItem>
                            <SelectItem value="compliance">Regulatory Compliance</SelectItem>
                            <SelectItem value="mergers acquisitions">Mergers & Acquisitions</SelectItem>
                            <SelectItem value="joint ventures">Joint Ventures</SelectItem>
                            <SelectItem value="data privacy">Data Privacy & Security</SelectItem>
                            <SelectItem value="cybersecurity">Cybersecurity Law</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="on hold">On Hold</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter client name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Additional Information</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Client contact details, billing information, and additional case participants 
                      can be added after case creation from the case details page.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-4 w-4" />
                  Case Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide a detailed description of the case, including background information, key issues, and objectives..."
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Document Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-4 w-4" />
                  Initial Documents (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragOver 
                      ? 'border-legal-blue bg-legal-blue/5' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB each)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createCaseMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCaseMutation.isPending || isUploading}
                className="bg-legal-blue hover:bg-legal-deep text-white"
              >
                {createCaseMutation.isPending || isUploading 
                  ? "Creating..." 
                  : `Create Case${uploadedFiles.length > 0 ? ` (${uploadedFiles.length} files)` : ''}`
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}