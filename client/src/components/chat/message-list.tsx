import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { ChatMessage } from "@/lib/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentCase?: any;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessageContent = (message: ChatMessage) => {
    // Check if message contains structured analysis
    if (message.role === 'assistant' && message.content.includes('Critical Issue')) {
      return (
        <div className="space-y-3">
          <p className="text-gray-900 mb-3">
            I've analyzed the contract and identified several key issues. Here's my analysis:
          </p>
          
          <div className="space-y-3">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive" className="text-xs">
                    Critical Issue
                  </Badge>
                </div>
                <p className="text-sm text-red-700">
                  Section 4.2 - Delivery timeline breach (30 days overdue)
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                    Moderate Issue
                  </Badge>
                </div>
                <p className="text-sm text-yellow-700">
                  Section 7.1 - Unclear termination clause language
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    Opportunity
                  </Badge>
                </div>
                <p className="text-sm text-blue-700">
                  Section 9.3 - Liquidated damages clause favorable to client
                </p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-gray-900 mt-3">
            I'll generate a detailed analysis document in the canvas for your review. Would you like me to also prepare a breach notification letter?
          </p>
        </div>
      );
    }

    return <p className="text-gray-900">{message.content}</p>;
  };

  const generateCaseSpecificMessage = () => {
    if (!currentCase) {
      return {
        greeting: "Good morning! I'm ready to assist with your legal matters.",
        alerts: [],
        description: "Please select a case from the sidebar to begin our legal analysis and strategy session."
      };
    }

    const caseType = currentCase.caseType?.toLowerCase() || '';
    const caseTitle = currentCase.title || 'Current Case';
    const clientName = currentCase.clientName || 'Client';
    
    switch (caseType) {
      case 'contract dispute':
        return {
          greeting: `Good morning! I've reviewed the ${caseTitle} case and have some immediate observations:`,
          alerts: [
            {
              type: 'urgent',
              title: 'URGENT: Discovery Deadline',
              message: 'Discovery deadline is March 30, 2024 - only 15 days remaining. We need to accelerate document production.',
              color: 'red'
            },
            {
              type: 'action',
              title: 'ACTION REQUIRED',
              message: '30-day delay breach creates $50,000 liquidated damages claim. I recommend sending breach notice immediately.',
              color: 'yellow'
            }
          ],
          description: `I'm ready to help with contract analysis, breach documentation, and litigation strategy for ${clientName}. Use Case Actions below for specific tasks.`
        };
      
      case 'corporate law':
        return {
          greeting: `Good morning! I've reviewed the ${caseTitle} matter and identified key strategic considerations:`,
          alerts: [
            {
              type: 'priority',
              title: 'PRIORITY: Due Diligence Review',
              message: 'Corporate structure analysis needed for merger compliance. Regulatory filings due within 30 days.',
              color: 'blue'
            },
            {
              type: 'action',
              title: 'COMPLIANCE CHECK',
              message: 'SEC filings and shareholder notifications require immediate attention to maintain transaction timeline.',
              color: 'yellow'
            }
          ],
          description: `I'm ready to assist with corporate governance, merger documentation, and regulatory compliance for ${clientName}. Let me know how I can help advance this transaction.`
        };
      
      case 'estate law':
      case 'estate planning':
        return {
          greeting: `Good morning! I've reviewed the ${caseTitle} estate planning matter and have important recommendations:`,
          alerts: [
            {
              type: 'planning',
              title: 'ESTATE PLANNING: Tax Optimization',
              message: 'Current estate structure may benefit from tax-efficient trust arrangements before year-end.',
              color: 'green'
            },
            {
              type: 'documentation',
              title: 'DOCUMENT REVIEW',
              message: 'Will and trust documents need updating to reflect recent life changes and tax law modifications.',
              color: 'blue'
            }
          ],
          description: `I'm ready to help with will preparation, trust structures, and estate tax planning for ${clientName}. Use Case Actions for document generation.`
        };
      
      default:
        return {
          greeting: `Good morning! I've reviewed the ${caseTitle} matter and I'm ready to provide comprehensive legal support:`,
          alerts: [
            {
              type: 'review',
              title: 'CASE ANALYSIS',
              message: 'Initial case review complete. Ready to develop strategic approach and identify key priorities.',
              color: 'blue'
            }
          ],
          description: `I'm ready to assist with legal analysis, document preparation, and case strategy for ${clientName}. How can I help advance this matter?`
        };
    }
  };

  const caseMessage = generateCaseSpecificMessage();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8 bg-legal-blue">
            <AvatarFallback>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 max-w-3xl">
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-gray-900 font-medium">
                    {caseMessage.greeting}
                  </p>
                  
                  {caseMessage.alerts.length > 0 && (
                    <div className="space-y-2">
                      {caseMessage.alerts.map((alert, index) => (
                        <Card key={index} className={`border-${alert.color}-200 bg-${alert.color}-50`}>
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              {alert.color === 'red' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              {alert.color === 'yellow' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                              {(alert.color === 'blue' || alert.color === 'green') && <Info className="h-4 w-4 text-blue-500" />}
                              <span className={`text-xs font-medium text-${alert.color}-800`}>{alert.title}</span>
                            </div>
                            <p className={`text-sm text-${alert.color}-700`}>
                              {alert.message}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-gray-700 text-sm">
                    {caseMessage.description}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="mt-2 text-xs text-gray-500">
              {formatTimestamp(new Date())}
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.role === 'user' ? 'justify-end' : ''
          }`}
        >
          {message.role === 'assistant' && (
            <Avatar className="w-8 h-8 bg-legal-blue flex-shrink-0">
              <AvatarFallback>
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 max-w-3xl">
            <Card className={`${
              message.role === 'user' 
                ? 'bg-legal-blue text-white ml-auto' 
                : 'bg-gray-50'
            }`}>
              <CardContent className="p-4">
                {renderMessageContent(message)}
              </CardContent>
            </Card>
            <div className={`mt-2 text-xs text-gray-500 ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>

          {message.role === 'user' && (
            <Avatar className="w-8 h-8 bg-gray-300 flex-shrink-0">
              <AvatarFallback>
                <User className="h-4 w-4 text-gray-600" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8 bg-legal-blue flex-shrink-0">
            <AvatarFallback>
              <Bot className="h-4 w-4 text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 max-w-3xl">
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                  <span className="text-sm text-gray-500">AI is analyzing...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
