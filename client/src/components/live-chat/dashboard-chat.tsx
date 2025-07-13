import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Image, Monitor, StopCircle, Camera, Paperclip } from "@/lib/icons";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'support' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  imageUrl?: string;
  isScreenShare?: boolean;
}

interface DashboardChatProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function DashboardChat({ isOpen, onToggle, className }: DashboardChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Wizzered Support! I can help you with technical issues, billing questions, and platform guidance. You can also share images or start screen sharing for better assistance.',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        const imageMessage: Message = {
          id: Date.now().toString(),
          text: `Shared an image: ${file.name}`,
          sender: 'user',
          timestamp: new Date(),
          imageUrl: imageUrl
        };
        
        setMessages(prev => [...prev, imageMessage]);
        
        // Auto-respond to image upload
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "I can see your image. A support agent will review it and get back to you shortly. Please describe the issue you're experiencing with the image.",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      const screenMessage: Message = {
        id: Date.now().toString(),
        text: "Started screen sharing session",
        sender: 'user',
        timestamp: new Date(),
        isScreenShare: true
      };
      
      setMessages(prev => [...prev, screenMessage]);
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setScreenStream(null);
        
        const endMessage: Message = {
          id: Date.now().toString(),
          text: "Screen sharing session ended",
          sender: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, endMessage]);
      };
      
      // Auto-respond to screen share
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Screen sharing is now active. A support agent can see your screen and will assist you shortly.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
      
    } catch (error) {
      console.error('Screen share error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Screen sharing failed. Please ensure you grant permission and try again.",
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);

      // Generate AI response
      setTimeout(() => {
        const aiResponse = generateSupportResponse(input);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        }]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const generateSupportResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('case') || msg.includes('document') || msg.includes('create')) {
      return "I can help you with case management issues. Are you having trouble creating a new case, accessing existing cases, or working with documents? Please provide more details about the specific issue.";
    }
    
    if (msg.includes('billing') || msg.includes('payment') || msg.includes('subscription')) {
      return "For billing and subscription questions, I can help you understand your current plan, upgrade options, or payment issues. What specific billing question do you have?";
    }
    
    if (msg.includes('login') || msg.includes('access') || msg.includes('password')) {
      return "If you're having trouble accessing your account, please try resetting your password using the 'Forgot Password' link. If that doesn't work, I can escalate this to our technical team.";
    }
    
    if (msg.includes('error') || msg.includes('bug') || msg.includes('problem')) {
      return "I see you're experiencing an error. Can you please describe exactly what you were doing when the error occurred? If you have a screenshot or can share your screen, that would be very helpful.";
    }
    
    if (msg.includes('slow') || msg.includes('performance') || msg.includes('loading')) {
      return "Performance issues can be frustrating. Are you experiencing slow loading times with specific features, or is the entire platform running slowly? Your browser and internet connection can also affect performance.";
    }
    
    return "Thank you for contacting Wizzered support! I'm here to help with any technical issues, billing questions, or platform guidance. Could you please provide more details about what you need assistance with?";
  };

  if (!isOpen) return null;

  return (
    <Card className={`fixed bottom-4 right-4 w-80 h-96 shadow-xl z-50 ${className}`}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Support Chat</h3>
          <Badge variant="secondary" className="text-xs">Online</Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.sender === 'ai' 
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-2 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Shared image" 
                        className="mt-2 max-w-full h-auto rounded border"
                      />
                    )}
                    {message.isScreenShare && (
                      <div className="mt-2 p-2 bg-gray-200 rounded text-gray-700 text-xs">
                        🖥️ Screen sharing active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="h-8 px-2"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className="h-8 px-2"
              >
                {isScreenSharing ? <StopCircle className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={sendMessage} size="sm" className="h-10 px-3">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </CardContent>
      )}
    </Card>
  );
}