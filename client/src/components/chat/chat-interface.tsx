import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/lib/types";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Bookmark } from "lucide-react";

interface ChatInterfaceProps {
  caseId: number;
  onFunctionClick: (functionId: string) => void;
  onDocumentGenerate: (document: any) => void;
}

export function ChatInterface({ caseId, onFunctionClick, onDocumentGenerate }: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCaseData, setCurrentCaseData] = useState<any>(null);
  const messagesRef = useRef(messages);
  const chatInterfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const { data: currentCase, refetch: refetchCase } = useQuery({
    queryKey: [`/api/cases/${caseId}`],
    enabled: !!caseId,
    onSuccess: (data) => {
      setCurrentCaseData(data);
    }
  });

  const { data: chatMessages = [], refetch: refetchChatMessages } = useQuery({
    queryKey: [`/api/cases/${caseId}/messages`],
    enabled: !!caseId,
    onSuccess: (data) => {
      setMessages(data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
        metadata: msg.metadata,
      })));
    },
  });

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
  }, [caseId, refetchCase, refetchChatMessages]);

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

  // Use computed value instead of state to avoid initialization issues
  const displayCase = currentCaseData || currentCase;

  const handleShareCase = useCallback(async () => {
    if (!displayCase) return;

    try {
      const shareData = {
        title: `Legal Case: ${displayCase.title}`,
        text: `Case #${displayCase.caseNumber} - ${displayCase.description}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        // You can add a toast notification here
        console.log('Case details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing case:', error);
    }
  }, [displayCase]);

  const handleBookmarkCase = useCallback(async () => {
    if (!displayCase) return;

    try {
      const response = await apiRequest('POST', `/api/cases/${displayCase.id}/bookmark`, {});
      if (response.ok) {
        console.log('Case bookmarked successfully');
        // You can add a toast notification here
        // Optionally refetch case data to update bookmark status
        refetchCase();
      }
    } catch (error) {
      console.error('Error bookmarking case:', error);
    }
  }, [displayCase, refetchCase]);

  return (
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
  );
}