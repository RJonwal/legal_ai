import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'support';
  timestamp: Date;
  isTyping?: boolean;
}

interface LiveChatConfig {
  enabled: boolean;
  welcomeMessage: string;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  autoOpen: boolean;
  showUserCount: boolean;
  supportHours: string;
  aiEnabled: boolean;
  aiPersonality: string;
}

const EnhancedLiveChat = ({ 
  onPageLoad = false, 
  config = null 
}: { 
  onPageLoad?: boolean;
  config?: LiveChatConfig | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasEngaged, setHasEngaged] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch live chat configuration
  const { data: chatConfig } = useQuery({
    queryKey: ['/api/admin/chat-widget-config'],
    enabled: !config,
  });

  const activeConfig = config || chatConfig || {
    enabled: true,
    welcomeMessage: "Hello! How can I help you today?",
    position: 'bottom-right',
    primaryColor: '#2563eb',
    autoOpen: false,
    showUserCount: true,
    supportHours: '9 AM - 6 PM EST',
    aiEnabled: true,
    aiPersonality: 'professional'
  };

  useEffect(() => {
    if (onPageLoad && !hasEngaged && activeConfig.enabled) {
      // Auto-engage user upon page arrival
      setTimeout(() => {
        if (!isOpen) {
          setMessages([{
            id: '1',
            text: activeConfig.welcomeMessage,
            sender: 'ai',
            timestamp: new Date()
          }]);
          
          if (activeConfig.autoOpen) {
            setIsOpen(true);
          } else {
            // Show notification bubble
            showNotificationBubble();
          }
          setHasEngaged(true);
        }
      }, 2000);
    }
  }, [onPageLoad, hasEngaged, activeConfig]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showNotificationBubble = () => {
    // Create a notification bubble effect
    const bubble = document.createElement('div');
    bubble.className = 'fixed bottom-20 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-bounce z-50';
    bubble.textContent = 'New message!';
    document.body.appendChild(bubble);
    
    setTimeout(() => {
      document.body.removeChild(bubble);
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (!activeConfig.aiEnabled) {
      return "Thank you for your message. A support agent will be with you shortly.";
    }

    try {
      // Call AI service with legal context
      const response = await fetch('/api/ai/chat-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'live_chat_support',
          personality: activeConfig.aiPersonality
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.error('AI response error:', error);
    }

    // Fallback responses based on common legal questions
    const legalResponses = {
      pricing: "Our pricing starts at $29/month for Pro Se users and $99/month for attorneys. We offer a 14-day free trial with no credit card required.",
      features: "Wizzered provides AI-powered legal assistance, case management, document generation, and legal research tools. Would you like to know more about any specific feature?",
      help: "I'm here to help you with questions about Wizzered's legal AI platform. You can ask about features, pricing, getting started, or technical support.",
      support: "Our support team is available during business hours (9 AM - 6 PM EST). For immediate assistance, I can help answer common questions about our platform.",
      trial: "You can start your free 14-day trial right now - no credit card required! Just click 'Get Started' on our homepage and create your account.",
      security: "Wizzered uses enterprise-grade AES-256 encryption, is GDPR/CCPA compliant, and maintains SOC 2 certification. Your legal data is fully protected.",
      default: "Thanks for your question! I'm here to help with information about Wizzered's AI-powered legal platform. Could you please be more specific about what you'd like to know?"
    };

    const msg = userMessage.toLowerCase();
    if (msg.includes('price') || msg.includes('cost') || msg.includes('pricing')) return legalResponses.pricing;
    if (msg.includes('feature') || msg.includes('what') || msg.includes('how')) return legalResponses.features;
    if (msg.includes('help') || msg.includes('support')) return legalResponses.help;
    if (msg.includes('trial') || msg.includes('free')) return legalResponses.trial;
    if (msg.includes('security') || msg.includes('safe') || msg.includes('privacy')) return legalResponses.security;
    
    return legalResponses.default;
  };

  const sendMessage = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      // Generate AI response
      try {
        const aiResponse = await generateAIResponse(message);
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          }]);
        }, 1000 + Math.random() * 2000); // Variable response time
      } catch (error) {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but I'm having trouble responding right now. Please try again or contact our support team directly.",
          sender: 'support',
          timestamp: new Date()
        }]);
      }
    }
  };

  if (!activeConfig.enabled) return null;

  const positionClasses = activeConfig.position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl border mb-4 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-80 h-96'
        } flex flex-col`}>
          {/* Header */}
          <div 
            className="text-white p-4 rounded-t-lg flex items-center justify-between"
            style={{ backgroundColor: activeConfig.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Wizzered Support</h3>
                <p className="text-xs opacity-90">
                  {activeConfig.aiEnabled ? 'AI-Powered • ' : ''}{activeConfig.supportHours}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 rounded p-1"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs ${
                      msg.sender === 'user' 
                        ? 'bg-blue-100 text-blue-900' 
                        : msg.sender === 'ai'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.sender === 'ai' && <Bot className="h-3 w-3" />}
                        {msg.sender === 'user' && <User className="h-3 w-3" />}
                        <span className="text-xs font-medium">
                          {msg.sender === 'ai' ? 'AI Assistant' : msg.sender === 'user' ? 'You' : 'Support'}
                        </span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="text-left mb-3">
                    <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs">AI Assistant is typing...</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about Wizzered..."
                  className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTyping}
                />
                <Button 
                  size="sm" 
                  onClick={sendMessage} 
                  className="ml-2"
                  disabled={isTyping || !message.trim()}
                  style={{ backgroundColor: activeConfig.primaryColor }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Chat Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!hasEngaged) {
            setMessages([{
              id: '1',
              text: activeConfig.welcomeMessage,
              sender: 'ai',
              timestamp: new Date()
            }]);
            setHasEngaged(true);
          }
        }}
        className="rounded-full h-12 w-12 shadow-lg relative"
        style={{ backgroundColor: activeConfig.primaryColor }}
      >
        <MessageSquare className="h-6 w-6" />
        
        {/* Notification indicator */}
        {messages.length > 0 && !isOpen && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
            variant="destructive"
          >
            {messages.filter(m => m.sender !== 'user').length}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default EnhancedLiveChat;