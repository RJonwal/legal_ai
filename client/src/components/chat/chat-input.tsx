import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Send, 
  ChevronDown,
  Upload, 
  Calendar, 
  History, 
  Search, 
  Lightbulb, 
  FolderOpen, 
  BarChart3, 
  UserCheck, 
  Gavel,
  Brain
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFunctionClick?: (functionId: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onFunctionClick, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showCaseActions, setShowCaseActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCaseActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const caseActions = [
    { id: 'case-strategy', label: 'Case Strategy', icon: Brain },
    { id: 'upload-document', label: 'Upload Document', icon: Upload },
    { id: 'calendar', label: 'Calendar & Deadlines', icon: Calendar },
    { id: 'timeline', label: 'Case Timeline', icon: History },
    { id: 'evidence-analysis', label: 'Evidence Analysis', icon: Search },
    { id: 'next-best-action', label: 'Next Best Action', icon: Lightbulb },
    { id: 'case-documents', label: 'Case Documents', icon: FolderOpen },
    { id: 'case-analytics', label: 'Case Analytics', icon: BarChart3 },
    { id: 'deposition-prep', label: 'Deposition Prep', icon: UserCheck },
    { id: 'court-prep', label: 'Court Preparation', icon: Gavel },
  ];

  return (
    <div className="p-4 border-t border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your case, or use Case Actions below for specific tasks..."
              className="min-h-[60px] resize-none border-gray-300 focus:border-legal-blue focus:ring-legal-blue"
              disabled={disabled}
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-legal-blue hover:bg-legal-deep text-white p-3 rounded-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={disabled}
              onClick={() => setShowCaseActions(!showCaseActions)}
              className="text-legal-blue border-legal-blue hover:bg-legal-blue hover:text-white"
            >
              Case Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {showCaseActions && (
              <div className="absolute right-0 bottom-full mb-1 w-56 bg-white border rounded-md shadow-lg z-50">
                {caseActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        onFunctionClick?.(action.id);
                        setShowCaseActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
