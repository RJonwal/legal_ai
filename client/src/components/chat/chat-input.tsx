import { useState } from "react";
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
  Gavel 
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFunctionClick?: (functionId: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onFunctionClick, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

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

  const caseActions = [
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={disabled}
                className="text-legal-blue border-legal-blue hover:bg-legal-blue hover:text-white"
              >
                Case Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {caseActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => onFunctionClick?.(action.id)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </form>
    </div>
  );
}
