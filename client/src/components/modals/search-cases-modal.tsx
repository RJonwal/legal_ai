import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowRight, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface Case {
  id: number;
  title: string;
  description: string;
  clientName: string;
  status: string;
  caseType: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface SearchCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseSelect: (caseId: number) => void;
}

export function SearchCasesModal({ isOpen, onClose, onCaseSelect }: SearchCasesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/cases/search', searchQuery],
    enabled: searchQuery.length > 0,
  });

  const { data: allCases = [] } = useQuery({
    queryKey: ['/api/cases'],
  });

  const displayCases = searchQuery.length > 0 ? (searchResults || []) : allCases;

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <AlertCircle className="h-3 w-3" />;
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'on hold':
        return <AlertCircle className="h-3 w-3" />;
      case 'closed':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCaseClick = (caseId: number) => {
    onCaseSelect(caseId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Cases
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cases by title, client name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {searchQuery.length > 0 
                ? `Found ${displayCases.length} cases matching "${searchQuery}"`
                : `Showing all ${displayCases.length} cases`
              }
            </span>
            {searchQuery.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear search
              </Button>
            )}
          </div>

          {/* Cases List */}
          <ScrollArea className="h-[60vh]">
            <div className="space-y-3 pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-blue"></div>
                </div>
              ) : displayCases.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery.length > 0 ? "No cases found" : "No cases available"}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery.length > 0 
                      ? "Try adjusting your search terms or browse all cases."
                      : "Create your first case to get started."
                    }
                  </p>
                </div>
              ) : (
                displayCases.map((case_: Case) => (
                  <Card 
                    key={case_.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-legal-blue"
                    onClick={() => handleCaseClick(case_.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{case_.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{case_.clientName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(case_.status)}>
                            {getStatusIcon(case_.status)}
                            <span className="ml-1 capitalize">{case_.status || 'Unknown'}</span>
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 mb-3 line-clamp-2">{case_.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {case_.caseType || 'General'}
                          </Badge>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority || 'medium'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDate(case_.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}