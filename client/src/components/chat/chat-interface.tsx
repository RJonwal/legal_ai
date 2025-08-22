import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { FunctionButtons } from "./function-buttons";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notification-service";
import { Bot, User, Sparkles, AlertCircle, FileText, Brain, AlertTriangle, Clock, CheckCircle, Share2, Bookmark } from "@/lib/icons";
import { ChatMessage } from "@/lib/types";
import { QueryErrorBoundary } from "@/components/query-error-boundary";

interface ChatInterfaceProps {
  caseId: number;
  onFunctionClick: (functionId: string) => void;
  onDocumentGenerate: (document: any) => void;
}

export default function ChatInterface({
  caseId,
  onFunctionClick,
  onDocumentGenerate
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCaseData, setCurrentCaseData] = useState<any>(null);
  const messagesRef = useRef(messages);
  const chatInterfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const { data: currentCase, refetch: refetchCase } = useQuery<any>({
    queryKey: [`/api/cases/${caseId}`],
    enabled: !!caseId,
  });

  useEffect(() => {
    if (currentCase) {
      setCurrentCaseData(currentCase);
    }
  }, [currentCase]);

  const { data: chatMessages = [], refetch: refetchChatMessages } = useQuery<any[]>({
    queryKey: [`/api/cases/${caseId}/messages`],
    enabled: !!caseId,
  });

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
        metadata: msg.metadata,
      })));
    }
  }, []);

  // Handle case selection events and refetch data
  useEffect(() => {
    if (caseId) {
      // Clear messages when switching cases
      setMessages([]);
      setCurrentCaseData(null);

      // Refetch case and message data
      refetchCase();
      refetchChatMessages();
    }
  }, [caseId]); // Remove function dependencies to prevent infinite loop

  // Listen for case selection events
  useEffect(() => {
    const handleCaseSelected = (event: CustomEvent) => {
      const { caseId: newCaseId, caseData } = event.detail;
      if (newCaseId === caseId) {
        setCurrentCaseData(caseData);
        console.log('Chat context updated with case data:', caseData);
      }
    };

    const element = chatInterfaceRef.current;
    if (element) {
      element.addEventListener('caseSelected', handleCaseSelected as EventListener);
      // Add data attribute for identification
      element.setAttribute('data-chat-interface', 'true');
    }

    return () => {
      if (element) {
        element.removeEventListener('caseSelected', handleCaseSelected as EventListener);
      }
    };
  }, [caseId]);

  // Get user data for avatar
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = getUserData();

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };


  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const caseContext = currentCaseData || currentCase;
      const response = await apiRequest('POST', `/api/cases/${caseId}/messages`, {
        content,
        caseContext // Pass comprehensive case context to the API
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newUserMessage: ChatMessage = {
        id: data.userMessage.id,
        content: data.userMessage.content,
        role: 'user',
        timestamp: new Date(data.userMessage.createdAt),
        metadata: data.userMessage.metadata,
      };

      const newAssistantMessage: ChatMessage = {
        id: data.assistantMessage.id,
        content: data.assistantMessage.content,
        role: 'assistant',
        timestamp: new Date(data.assistantMessage.createdAt),
        metadata: data.assistantMessage.metadata,
      };

      setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);

      // Check if document was generated
      if (data.aiResponse?.documentGenerated) {
        onDocumentGenerate(data.document);
      }
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });

  const handleSendMessage = useCallback((content: string) => {
    if (!caseId) {
      console.error('No case selected');
      return;
    }
    sendMessageMutation.mutate(content);
  }, [caseId, sendMessageMutation]);

  const handleFunctionClick = useCallback((functionId: string) => {
    onFunctionClick(functionId);
  }, [onFunctionClick]);

  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);

  // Case display state - ensure proper initialization
  const displayCase = currentCaseData || currentCase;

  const handleShareCase = useCallback(async () => {
    try {
      const caseToShare = currentCaseData || currentCase;
      if (!caseToShare) {
        toast({
          title: "No Case Selected",
          description: "Please select a case to share",
          variant: "destructive",
        });
        return;
      }

      // Mock sharing functionality
      toast({
        title: "Case Shared",
        description: `${caseToShare.title} has been shared successfully`,
      });
    } catch (error) {
      console.error('Error sharing case:', error);
    }
  }, [currentCaseData, currentCase]);

  const handleBookmarkCase = useCallback(async () => {
    try {
      const caseToBookmark = currentCaseData || currentCase;
      if (!caseToBookmark) {
        toast({
          title: "No Case Selected",
          description: "Please select a case to bookmark",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/cases/${caseToBookmark.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark case');
      }

      const result = await response.json();

      toast({
        title: result.bookmarked ? "Case Bookmarked" : "Bookmark Removed",
        description: result.message,
      });

      // Refresh case data
      if (currentCase?.id) {
        refetchCase();
      }
    } catch (error) {
      console.error('Error bookmarking case:', error);
      toast({
        title: "Bookmark Failed",
        description: "Unable to bookmark case. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentCaseData, currentCase]);

  // Initialize with welcome message only once
  useEffect(() => {
    if (messages.length === 0 && chatMessages.length === 0 && caseId) {
      setMessages([{
        id: 1,
        content: 'Hello! I\'m your AI legal assistant. How can I help you today?',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {}
      }]);
    }
  }, [caseId]); // Only depend on caseId to prevent excessive re-renders

  return (
    <QueryErrorBoundary>
      <div ref={chatInterfaceRef} className="flex-1 flex flex-col bg-white h-full" data-chat-interface="true">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {displayCase?.title || 'Legal Assistant'}
            </h2>
            <p className="text-sm text-gray-500">
              {displayCase?.caseNumber ? `Case #${displayCase.caseNumber} • ` : ''}
              {displayCase?.clientName ? `${displayCase.clientName} • ` : ''}
              {displayCase?.status ? `${displayCase.status}` : 'Ready to assist'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleShareCase()}
              title="Share case"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleBookmarkCase()}
              title="Bookmark case"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages - Takes all available space */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={sendMessageMutation.isPending}
          currentCase={displayCase}
        />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onFunctionClick={handleFunctionClick}
          disabled={sendMessageMutation.isPending}
        />
      </div>
    </div>
    </QueryErrorBoundary>
  );
}