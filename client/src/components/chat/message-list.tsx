import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, AlertTriangle, AlertCircle, Info, Calendar, FileText, Clock, CheckCircle } from "@/lib/icons";
import { ChatMessage } from "@/lib/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentCase?: any;
}

const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const getInitials = (firstName?: string, lastName?: string, username?: string) => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return "U";
};

export function MessageList({ messages, isLoading, currentCase }: MessageListProps) {
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

  const [interactiveStates, setInteractiveStates] = useState<Record<string, any>>({});

  const updateInteractiveState = (messageId: string, key: string, value: any) => {
    setInteractiveStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [key]: value
      }
    }));
  };

  const getInteractiveState = (messageId: string, key: string, defaultValue: any = '') => {
    return interactiveStates[messageId]?.[key] ?? defaultValue;
  };

  const renderInteractiveCard = (messageId: string, type: string, data: any) => {
    switch (type) {
      case 'deadline_tracker':
        return (
          <Card className="border-blue-200 bg-blue-50 mt-3">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Deadline Tracker</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">Task</label>
                    <Input 
                      placeholder="Enter task"
                      value={getInteractiveState(messageId, 'task')}
                      onChange={(e) => updateInteractiveState(messageId, 'task', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 mb-1 block">Due Date</label>
                    <Input 
                      type="date"
                      value={getInteractiveState(messageId, 'dueDate')}
                      onChange={(e) => updateInteractiveState(messageId, 'dueDate', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={getInteractiveState(messageId, 'urgent', false)}
                    onCheckedChange={(checked) => updateInteractiveState(messageId, 'urgent', checked)}
                  />
                  <label className="text-xs text-blue-700">Mark as urgent</label>
                </div>
                <Button size="sm" className="w-full">Add to Calendar</Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'document_request':
        return (
          <Card className="border-green-200 bg-green-50 mt-3">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-800">Document Request</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-green-700 mb-1 block">Document Type</label>
                  <Select 
                    value={getInteractiveState(messageId, 'docType')}
                    onValueChange={(value) => updateInteractiveState(messageId, 'docType', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motion">Motion</SelectItem>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-green-700 mb-1 block">Special Instructions</label>
                  <Textarea 
                    placeholder="Any specific requirements..."
                    value={getInteractiveState(messageId, 'instructions')}
                    onChange={(e) => updateInteractiveState(messageId, 'instructions', e.target.value)}
                    className="min-h-16 text-sm"
                  />
                </div>
                <Button size="sm" className="w-full">Generate Document</Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'strategy_checklist':
        const checklistItems = data.items || ['Review case files', 'Prepare witness list', 'Draft motions', 'Schedule depositions'];
        return (
          <Card className="border-purple-200 bg-purple-50 mt-3">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-800">Case Strategy Checklist</span>
              </div>
              <div className="space-y-2">
                {checklistItems.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={getInteractiveState(messageId, `checklist_${index}`, false)}
                      onCheckedChange={(checked) => updateInteractiveState(messageId, `checklist_${index}`, checked)}
                    />
                    <label className="text-xs text-purple-700">{item}</label>
                  </div>
                ))}
                <div className="mt-3 pt-2 border-t border-purple-200">
                  <Input 
                    placeholder="Add custom task..."
                    value={getInteractiveState(messageId, 'customTask')}
                    onChange={(e) => updateInteractiveState(messageId, 'customTask', e.target.value)}
                    className="h-8 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && getInteractiveState(messageId, 'customTask')) {
                        // Add to checklist logic here
                        updateInteractiveState(messageId, 'customTask', '');
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    // Check for various legal scenarios and render interactive cards
    if (message.content.includes('contract analysis') || message.content.includes('contract dispute')) {
      return renderContractAnalysisMessage(message);
    }

    if (message.content.includes('discovery') || message.content.includes('evidence')) {
      return renderDiscoveryMessage(message);
    }

    if (message.content.includes('deposition') || message.content.includes('witness')) {
      return renderDepositionPrepMessage(message);
    }

    if (message.content.includes('settlement') || message.content.includes('negotiate')) {
      return renderSettlementMessage(message);
    }

    // Default proactive attorney response for any case-related query
    if (message.role === 'assistant' && currentCase) {
      return renderProactiveAttorneyResponse(message);
    }

    return (
      <div className="text-gray-900 whitespace-pre-wrap">
        {message.content}
      </div>
    );
  };

  const renderProactiveAttorneyResponse = (message: ChatMessage) => {
    return (
      <div className="space-y-4">
        <div className="text-gray-900 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Proactive Attorney Actions */}
        <Card className="border-legal-blue bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-4 w-4 text-legal-blue" />
              <span className="text-sm font-medium text-legal-blue">Recommended Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-legal-blue border-legal-blue hover:bg-legal-blue hover:text-white"
                onClick={() => updateInteractiveState(message.id, 'action', 'document_review')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Documents
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-legal-blue border-legal-blue hover:bg-legal-blue hover:text-white"
                onClick={() => updateInteractiveState(message.id, 'action', 'deadline_tracker')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Set Deadlines
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Case Strategy Widget */}
        {renderInteractiveCard(message.id, 'case_strategy', {})}
      </div>
    );
  };

  const renderDiscoveryMessage = (message: ChatMessage) => {
    return (
      <div className="space-y-4">
        <div className="text-gray-900 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Discovery Management */}
        {renderInteractiveCard(message.id, 'discovery_tracker', {})}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Discovery Deadlines</span>
          </div>
          <p className="text-sm text-yellow-700">
            Initial disclosures due in 14 days. Document production requests should be served within 30 days.
          </p>
        </div>
      </div>
    );
  };

  const renderDepositionPrepMessage = (message: ChatMessage) => {
    return (
      <div className="space-y-4">
        <div className="text-gray-900 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Deposition Preparation */}
        {renderInteractiveCard(message.id, 'deposition_prep', {})}

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <Badge className="text-xs bg-purple-100 text-purple-800">
                Witness Prep
              </Badge>
            </div>
            <p className="text-sm text-purple-700">
              Schedule mock deposition session. Review key documents with witness.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettlementMessage = (message: ChatMessage) => {
    return (
      <div className="space-y-4">
        <div className="text-gray-900 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Settlement Calculator */}
        {renderInteractiveCard(message.id, 'settlement_calculator', {})}

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Settlement Strategy</span>
            </div>
            <p className="text-sm text-green-700">
              Consider mediation before trial. Analyze comparable case settlements.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
          description: `I'm ready to help with contract analysis, breach documentation, and litigation strategy for ${clientName}. Use Case Actions below for specific tasks.`,
          interactive: 'strategy_checklist',
          interactiveData: {
            items: ['Review contract sections 4.2 and 7.1', 'Calculate liquidated damages', 'Draft breach notice', 'Prepare discovery requests']
          }
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
          description: `I'm ready to assist with corporate governance, merger documentation, and regulatory compliance for ${clientName}. Let me know how I can help advance this transaction.`,
          interactive: 'deadline_tracker',
          interactiveData: {}
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
          description: `I'm ready to help with will preparation, trust structures, and estate tax planning for ${clientName}. Use Case Actions for document generation.`,
          interactive: 'document_request',
          interactiveData: {}
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
  const user = getUserData();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-h-full">
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

                  {/* Render interactive elements based on case type */}
                  {caseMessage.interactive && renderInteractiveCard('initial-message', caseMessage.interactive, caseMessage.interactiveData)}
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