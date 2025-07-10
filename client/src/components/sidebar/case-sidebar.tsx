import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NewCaseModal } from "@/components/modals/new-case-modal";
import { SearchCasesModal } from "@/components/modals/search-cases-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import { UserProfileModal } from "@/components/modals/user-profile-modal";
import { BillingModal } from "@/components/modals/billing-modal";
import { 
  FolderOpen, 
  Gavel, 
  Plus, 
  Search, 
  Settings, 
  User,
  CreditCard
} from "lucide-react";

interface CaseSidebarProps {
  currentCaseId?: number;
  onCaseSelect: (caseId: number) => void;
}

// Function to get relative time from a given date
const getRelativeTime = (date: any) => {
  if (!date) return 'N/A';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export function CaseSidebar({ currentCaseId, onCaseSelect }: CaseSidebarProps) {
  const [, setLocation] = useLocation();
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [searchCasesOpen, setSearchCasesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['/api/cases'],
    refetchOnWindowFocus: false,
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
          {cases && cases.length > 0 ? cases.map((case_: any, index: number) => (
            <Card 
              key={case_.id}
              className={`cursor-pointer hover:bg-gray-50 transition-colors relative ${
                currentCaseId === case_.id ? 'ring-2 ring-legal-blue bg-legal-blue/5' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                console.log('Case selected in sidebar:', case_);
                onCaseSelect(case_.id);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-legal-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-4 w-4 text-legal-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {case_.title || 'Untitled Case'}
                      </p>
                      {currentCaseId === case_.id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full ml-2 mt-1 flex-shrink-0" title="Currently active case" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {case_.clientName || 'No client specified'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCaseTypeColor(case_.caseType || 'general')}`}
                      >
                        {case_.caseType || 'General'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(case_.lastAccessedAt || case_.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent cases</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setNewCaseOpen(true)}
              >
                Create First Case
              </Button>
            </div>
          )}
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
            onClick={() => setNewCaseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setSearchCasesOpen(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Search Cases
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setBillingOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => setUserProfileOpen(true)}
        >
          <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Sarah Johnson
            </p>
            <p className="text-xs text-gray-500 truncate">
              Senior Attorney
            </p>
          </div>
        </div>
      </div>

      <NewCaseModal
        isOpen={newCaseOpen}
        onClose={() => setNewCaseOpen(false)}
        onCaseCreated={(caseId) => {
          onCaseSelect(caseId);
          setNewCaseOpen(false);
        }}
      />

      <SearchCasesModal
        isOpen={searchCasesOpen}
        onClose={() => setSearchCasesOpen(false)}
        onCaseSelect={(caseId) => {
          onCaseSelect(caseId);
          setSearchCasesOpen(false);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <UserProfileModal
        isOpen={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />

      <BillingModal
        isOpen={billingOpen}
        onClose={() => setBillingOpen(false)}
      />
    </div>
  );
}