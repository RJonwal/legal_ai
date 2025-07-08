import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Gavel, 
  Plus, 
  Search, 
  Settings, 
  User 
} from "lucide-react";

interface CaseSidebarProps {
  currentCaseId?: number;
  onCaseSelect: (caseId: number) => void;
}

export function CaseSidebar({ currentCaseId, onCaseSelect }: CaseSidebarProps) {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['/api/cases'],
  });

  const getCaseTypeColor = (caseType: string) => {
    switch (caseType.toLowerCase()) {
      case 'contract dispute':
        return 'bg-red-100 text-red-800';
      case 'corporate law':
        return 'bg-blue-100 text-blue-800';
      case 'estate law':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-legal-blue rounded-lg flex items-center justify-center">
            <Gavel className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">LegalAI</h1>
            <p className="text-xs text-gray-500">Assistant</p>
          </div>
        </div>
      </div>

      {/* Cases */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Recent Cases
        </div>
        
        <div className="space-y-2">
          {cases.map((case_: any) => (
            <Card 
              key={case_.id}
              className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                currentCaseId === case_.id ? 'ring-2 ring-legal-blue bg-legal-blue/5' : ''
              }`}
              onClick={() => onCaseSelect(case_.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-legal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-4 w-4 text-legal-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {case_.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {case_.clientName}
                    </p>
                    <div className="mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCaseTypeColor(case_.caseType)}`}
                      >
                        {case_.caseType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Tools */}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Tools
        </div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setLocation('/new-case')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setLocation('/search-cases')}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Cases
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setLocation('/profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setLocation('/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role || 'Attorney'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
