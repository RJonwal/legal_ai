
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, X, Minimize2, Send } from 'lucide-react';
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

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. A support representative will be with you shortly.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const position = config.customization?.position || 'bottom-right';

  return (
    <div className={`fixed ${positionClasses[position as keyof typeof positionClasses]} z-50`}>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: config.customization?.primaryColor || '#3B82F6' }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card 
          className={`w-80 h-96 shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-12' : 'h-96'
          }`}
          style={{ 
            borderRadius: config.customization?.borderRadius || '0.5rem',
            fontFamily: config.customization?.fontFamily || 'inherit'
          }}
        >
          <CardHeader 
            className="p-3 cursor-pointer"
            style={{ backgroundColor: config.customization?.primaryColor || '#3B82F6' }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">CS</AvatarFallback>
                </Avatar>
                <CardTitle className="text-sm">Customer Support</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
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

interface ChatWidgetProps {
  page?: string;
}

export function ChatWidget({ page = 'dashboard' }: ChatWidgetProps) {
  const [config, setConfig] = useState<ChatWidgetConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isBot: true, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/chat-widget-config');
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to load chat widget config:', error);
      }
    };

    loadConfig();
  }, []);

  // Don't render if config not loaded, widget disabled, or not allowed on this page
  if (!config || !config.enabled || (page === 'dashboard' && !config.showOnDashboard) || (!config.allowedPages.includes(page))) {
    return null;
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "Thank you for your message. Our team will get back to you shortly!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getPositionClasses = () => {
    switch (config.position) {
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
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all"
          style={{ 
            backgroundColor: config.customization.primaryColor,
            borderRadius: config.customization.borderRadius
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card 
          className={`w-80 h-96 shadow-xl transition-all ${isMinimized ? 'h-12' : ''}`}
          style={{ 
            fontFamily: config.customization.fontFamily,
            borderRadius: config.customization.borderRadius
          }}
        >
          <CardHeader 
            className="p-3 cursor-pointer"
            style={{ backgroundColor: config.customization.primaryColor }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center justify-between text-white">
              <CardTitle className="text-sm">Live Chat</CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-800'
                            : 'text-white'
                        }`}
                        style={{
                          backgroundColor: message.isBot ? undefined : config.customization.primaryColor
                        }}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="sm"
                    style={{ backgroundColor: config.customization.primaryColor }}
                  >
                    Send
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
