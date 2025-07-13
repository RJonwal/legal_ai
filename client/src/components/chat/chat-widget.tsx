import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, X, Minimize2, Send } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatWidgetConfig {
  enabled: boolean;
  provider: string;
  apiKey: string;
  position: string;
  showOnDashboard: boolean;
  allowedPages: string[];
  customization: {
    primaryColor: string;
    fontFamily: string;
    borderRadius: string;
    position: string;
  };
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWidgetProps {
  showOnPage?: boolean;
}

export default function ChatWidget({ showOnPage = true }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  // Fetch chat widget configuration
  const { data: config } = useQuery({
    queryKey: ['/api/admin/chat-widget-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/chat-widget-config');
      if (!response.ok) throw new Error('Failed to fetch chat config');
      const data = await response.json();
      return data.config;
    },
    retry: false
  });

  // Don't render if disabled or config not loaded
  if (!config?.enabled || !showOnPage) {
    return null;
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll help you with that.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getPositionClasses = () => {
    switch (config.customization?.position || 'bottom-right') {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="shadow-lg rounded-full"
        style={{
          backgroundColor: config.customization?.primaryColor || '#3B82F6',
          borderRadius: config.customization?.borderRadius === 'rounded' ? '0.375rem' : '50%'
        }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <Card className="w-80 mt-2 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chat Support</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-3 border-b">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                        msg.sender === 'bot' 
                          ? 'bg-gray-100 text-gray-900 rounded-bl-none' 
                          : 'bg-blue-500 text-white rounded-br-none'
                      }`}
                        style={{
                          backgroundColor: msg.sender === 'bot' ? undefined : config.customization?.primaryColor || '#3B82F6'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    style={{ backgroundColor: config.customization?.primaryColor || '#3B82F6' }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}