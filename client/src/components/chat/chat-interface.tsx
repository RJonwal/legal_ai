import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/lib/types";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { FunctionButtons } from "./function-buttons";
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

  const { data: currentCase } = useQuery({
    queryKey: ['/api/cases', caseId],
    enabled: !!caseId,
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['/api/cases', caseId, 'messages'],
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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/cases/${caseId}/messages`, {
        content,
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
        // Handle document generation
        onDocumentGenerate(data.document);
      }
    },
  });

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleFunctionClick = (functionId: string) => {
    onFunctionClick(functionId);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentCase?.title || 'Legal Assistant'}
            </h2>
            <p className="text-sm text-gray-500">
              {currentCase?.caseNumber ? `Case #${currentCase.caseNumber} • ` : ''}
              {currentCase?.status ? `${currentCase.status} since ${new Date(currentCase.createdAt).toLocaleDateString()}` : 'Ready to assist'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isLoading={sendMessageMutation.isPending}
      />

      {/* Function Buttons */}
      <FunctionButtons 
        onFunctionClick={handleFunctionClick}
        disabled={sendMessageMutation.isPending}
      />

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending}
      />
    </div>
  );
}
