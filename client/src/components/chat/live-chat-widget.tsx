import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, User, Bot, Minimize2, Maximize2 } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LiveChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function LiveChatWidget({ isOpen, onToggle, className }: LiveChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to Wizzered Live Support! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pricing') || message.includes('cost') || message.includes('price')) {
      return 'Our pricing starts at $29/month for Pro Se users and $99/month for Professional users. Both plans include AI-powered legal assistance, document generation, and case management tools.';
    }
    
    if (message.includes('features') || message.includes('what can') || message.includes('capabilities')) {
      return 'Wizzered offers AI-powered legal analysis, automated document generation, case management, legal research assistance, and strategic case planning. Our AI thinks like a senior attorney with 20+ years of experience.';
    }
    
    if (message.includes('security') || message.includes('safe') || message.includes('privacy')) {
      return 'We use enterprise-grade security with AES-256 encryption, SOC 2 compliance, and GDPR/CCPA compliance. Your legal data is never shared with third parties or used to train AI models.';
    }
    
    if (message.includes('help') || message.includes('support') || message.includes('how')) {
      return 'I can help you with account questions, feature explanations, billing inquiries, and general platform guidance. For technical issues, our support team is available 24/7.';
    }
    
    if (message.includes('demo') || message.includes('trial') || message.includes('try')) {
      return 'You can start with our free trial that includes access to basic AI features and document templates. Would you like me to help you get started?';
    }
    
    return 'Thank you for your question! Our team will get back to you shortly with a detailed response. In the meantime, feel free to explore our knowledge base or ask me anything else.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      <Card className={cn(
        "w-80 shadow-xl border-0 bg-white",
        isMinimized ? "h-12" : "h-96"
      )}>
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Live Support</CardTitle>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] p-2 rounded-lg text-sm",
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-900 p-2 rounded-lg text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Chat widget button component
export function ChatWidgetButton({ onClick, hasUnread = false }: { onClick: () => void; hasUnread?: boolean }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6 text-white" />
        {hasUnread && (
          <Badge className="absolute -top-2 -right-2 w-3 h-3 p-0 bg-red-500 text-xs">
            <span className="sr-only">New messages</span>
          </Badge>
        )}
      </div>
    </Button>
  );
}