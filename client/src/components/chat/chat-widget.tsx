
import { useEffect, useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
