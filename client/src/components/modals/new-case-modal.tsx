import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, User, FileText, AlertCircle, Calendar, Scale } from "lucide-react";

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
      const response = await apiRequest('POST', '/api/cases', caseData);
      return response.json();
    },
    onSuccess: (newCase) => {
      toast({
        title: "Case Created",
        description: `Case "${newCase.title}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cases'] });
      onCaseCreated(newCase.id);
      form.reset();
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
                            <SelectItem value="corporate law">Corporate Law</SelectItem>
                            <SelectItem value="employment law">Employment Law</SelectItem>
                            <SelectItem value="intellectual property">Intellectual Property</SelectItem>
                            <SelectItem value="real estate">Real Estate</SelectItem>
                            <SelectItem value="personal injury">Personal Injury</SelectItem>
                            <SelectItem value="family law">Family Law</SelectItem>
                            <SelectItem value="criminal law">Criminal Law</SelectItem>
                            <SelectItem value="estate law">Estate Law</SelectItem>
                            <SelectItem value="immigration">Immigration</SelectItem>
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
                disabled={createCaseMutation.isPending}
                className="bg-legal-blue hover:bg-legal-deep text-white"
              >
                {createCaseMutation.isPending ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}