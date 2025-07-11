
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Phone, 
  Settings, 
  Users, 
  Bot, 
  Shield, 
  CreditCard, 
  FileText, 
  Calendar, 
  Activity,
  AlertCircle,
  CheckCircle,
  PhoneCall,
  Clock,
  Zap,
  Globe,
  Mic,
  Volume2,
  PhoneForwarded,
  UserCheck,
  MessageSquare,
  Plus,
  Trash2,
  TestTube,
  Save
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoIPConfig {
  enabled: boolean;
  provider: 'twilio' | 'voipms' | 'localphone' | 'custom';
  credentials: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    customEndpoint?: string;
  };
  voiceSettings: {
    voice: string;
    language: string;
    speed: number;
    pitch: number;
    volume: number;
    engine: 'neural' | 'standard' | 'premium';
  };
  callFlow: {
    welcomeMessage: string;
    businessHours: {
      enabled: boolean;
      timezone: string;
      schedule: Record<string, { start: string; end: string; active: boolean }>;
    };
    afterHoursMessage: string;
    maxCallDuration: number; // minutes
    recordCalls: boolean;
    transcriptionEnabled: boolean;
  };
  humanHandoff: {
    enabled: boolean;
    triggerKeywords: string[];
    escalationThreshold: number;
    forwardNumbers: string[];
    autoEscalateTime: number; // minutes
    ringTimeout: number; // seconds
    failoverNumbers: string[];
  };
  aiAssistant: {
    enabled: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
    permissions: {
      scheduleAppointments: boolean;
      accessCaseInfo: boolean;
      processPayments: boolean;
      provideQuotes: boolean;
      transferCalls: boolean;
      takeMessages: boolean;
      accessKnowledgeBase: boolean;
    };
  };
  analytics: {
    trackCalls: boolean;
    recordMetrics: boolean;
    generateReports: boolean;
    enableRealTimeMonitoring: boolean;
  };
}

export default function VoipManagement() {
  const queryClient = useQueryClient();
  const [newForwardNumber, setNewForwardNumber] = useState("");
  const [newTriggerKeyword, setNewTriggerKeyword] = useState("");
  const [testNumber, setTestNumber] = useState("");

  // Default configuration
  const defaultConfig: VoIPConfig = useMemo(() => ({
    enabled: false,
    provider: 'twilio',
    credentials: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
      apiKey: '',
      username: '',
      password: '',
      customEndpoint: ''
    },
    voiceSettings: {
      voice: 'Polly.Joanna',
      language: 'en-US',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      engine: 'neural'
    },
    callFlow: {
      welcomeMessage: 'Thank you for calling LegalAI Pro. How can I assist you today?',
      businessHours: {
        enabled: true,
        timezone: 'UTC',
        schedule: {
          monday: { start: '09:00', end: '17:00', active: true },
          tuesday: { start: '09:00', end: '17:00', active: true },
          wednesday: { start: '09:00', end: '17:00', active: true },
          thursday: { start: '09:00', end: '17:00', active: true },
          friday: { start: '09:00', end: '17:00', active: true },
          saturday: { start: '10:00', end: '14:00', active: false },
          sunday: { start: '10:00', end: '14:00', active: false }
        }
      },
      afterHoursMessage: 'Thank you for calling. We are currently closed. Please leave a message or call back during business hours.',
      maxCallDuration: 30,
      recordCalls: true,
      transcriptionEnabled: true
    },
    humanHandoff: {
      enabled: true,
      triggerKeywords: ['human', 'agent', 'lawyer', 'attorney', 'speak to someone', 'urgent', 'emergency'],
      escalationThreshold: 3,
      forwardNumbers: ['+1234567890'],
      autoEscalateTime: 10,
      ringTimeout: 30,
      failoverNumbers: []
    },
    aiAssistant: {
      enabled: true,
      model: 'gpt-4',
      maxTokens: 300,
      temperature: 0.7,
      systemPrompt: 'You are a professional AI assistant for LegalAI Pro. Provide helpful, accurate information about legal services while maintaining confidentiality.',
      permissions: {
        scheduleAppointments: true,
        accessCaseInfo: false,
        processPayments: false,
        provideQuotes: true,
        transferCalls: true,
        takeMessages: true,
        accessKnowledgeBase: true
      }
    },
    analytics: {
      trackCalls: true,
      recordMetrics: true,
      generateReports: true,
      enableRealTimeMonitoring: true
    }
  }), []);

  // Fetch VoIP configuration
  const { data: voipConfig, isLoading } = useQuery({
    queryKey: ['admin-voip-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/voip/config');
      if (!response.ok) throw new Error('Failed to fetch VoIP config');
      return response.json();
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<VoIPConfig>) => {
      const response = await fetch('/api/admin/voip/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-voip-config'] });
      toast({ title: "Configuration updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    },
  });

  // Test call mutation
  const testCallMutation = useMutation({
    mutationFn: async (data: { number: string }) => {
      const response = await fetch('/api/admin/voip/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to initiate test call');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Test call initiated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to initiate test call", variant: "destructive" });
    },
  });

  const currentConfig = voipConfig || defaultConfig;

  if (isLoading) {
    return <div className="p-6">Loading VoIP settings...</div>;
  }

  const handleUpdateConfig = (updates: Partial<VoIPConfig>) => {
    updateConfigMutation.mutate(updates);
  };

  const addForwardNumber = () => {
    if (!newForwardNumber.trim()) return;
    
    const updatedNumbers = [...(currentConfig.humanHandoff.forwardNumbers || []), newForwardNumber.trim()];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        forwardNumbers: updatedNumbers
      }
    });
    setNewForwardNumber("");
  };

  const removeForwardNumber = (number: string) => {
    const updatedNumbers = currentConfig.humanHandoff.forwardNumbers?.filter(n => n !== number) || [];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        forwardNumbers: updatedNumbers
      }
    });
  };

  const addTriggerKeyword = () => {
    if (!newTriggerKeyword.trim()) return;
    
    const updatedKeywords = [...(currentConfig.humanHandoff.triggerKeywords || []), newTriggerKeyword.trim().toLowerCase()];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        triggerKeywords: updatedKeywords
      }
    });
    setNewTriggerKeyword("");
  };

  const removeTriggerKeyword = (keyword: string) => {
    const updatedKeywords = currentConfig.humanHandoff.triggerKeywords?.filter(k => k !== keyword) || [];
    handleUpdateConfig({
      humanHandoff: {
        ...currentConfig.humanHandoff,
        triggerKeywords: updatedKeywords
      }
    });
  };

  const voipProviders = [
    { 
      value: 'twilio', 
      label: 'Twilio', 
      description: 'Enterprise-grade voice platform with global reach',
      features: ['High quality voice', 'Global coverage', 'Advanced features', 'Excellent reliability']
    },
    { 
      value: 'voipms', 
      label: 'VoIP.ms', 
      description: 'Affordable business VoIP services',
      features: ['Cost effective', 'Business features', 'North American focus', 'SIP trunking']
    },
    { 
      value: 'localphone', 
      label: 'Localphone.com', 
      description: 'International VoIP provider with local numbers',
      features: ['Local numbers worldwide', 'International calling', 'Flexible pricing', 'Mobile apps']
    },
    { 
      value: 'custom', 
      label: 'Custom Provider', 
      description: 'Connect your own VoIP service',
      features: ['Full control', 'Custom integration', 'Existing infrastructure', 'Flexible setup']
    }
  ];

  const voices = [
    { value: 'Polly.Joanna', label: 'Joanna (US Female)' },
    { value: 'Polly.Matthew', label: 'Matthew (US Male)' },
    { value: 'Polly.Amy', label: 'Amy (UK Female)' },
    { value: 'Polly.Brian', label: 'Brian (UK Male)' },
    { value: 'Azure.Aria', label: 'Aria (Neural)' },
    { value: 'Azure.Davis', label: 'Davis (Neural)' },
    { value: 'Google.WaveNet', label: 'WaveNet (Premium)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">VoIP Management</h1>
        <p className="text-muted-foreground">
          Configure AI-powered voice assistant with human handoff and call forwarding
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="voice">Voice Settings</TabsTrigger>
          <TabsTrigger value="handoff">Human Handoff</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                VoIP Configuration
              </CardTitle>
              <CardDescription>
                Basic settings for your AI-powered voice assistant system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={currentConfig.enabled}
                  onCheckedChange={(enabled) => 
                    handleUpdateConfig({ enabled })
                  }
                />
                <Label>Enable VoIP System</Label>
              </div>

              {currentConfig.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Welcome Message</Label>
                        <Textarea
                          value={currentConfig.callFlow.welcomeMessage}
                          rows={3}
                          onChange={(e) =>
                            handleUpdateConfig({
                              callFlow: {
                                ...currentConfig.callFlow,
                                welcomeMessage: e.target.value
                              }
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>After Hours Message</Label>
                        <Textarea
                          value={currentConfig.callFlow.afterHoursMessage}
                          rows={3}
                          onChange={(e) =>
                            handleUpdateConfig({
                              callFlow: {
                                ...currentConfig.callFlow,
                                afterHoursMessage: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Max Call Duration (minutes)</Label>
                        <Input 
                          type="number" 
                          value={currentConfig.callFlow.maxCallDuration}
                          onChange={(e) =>
                            handleUpdateConfig({
                              callFlow: {
                                ...currentConfig.callFlow,
                                maxCallDuration: parseInt(e.target.value)
                              }
                            })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={currentConfig.callFlow.recordCalls}
                            onCheckedChange={(recordCalls) => 
                              handleUpdateConfig({ 
                                callFlow: { 
                                  ...currentConfig.callFlow, 
                                  recordCalls 
                                } 
                              })
                            }
                          />
                          <Label>Record Calls</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={currentConfig.callFlow.transcriptionEnabled}
                            onCheckedChange={(transcriptionEnabled) => 
                              handleUpdateConfig({ 
                                callFlow: { 
                                  ...currentConfig.callFlow, 
                                  transcriptionEnabled 
                                } 
                              })
                            }
                          />
                          <Label>Enable Transcription</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={currentConfig.callFlow.businessHours.enabled}
                            onCheckedChange={(enabled) => 
                              handleUpdateConfig({ 
                                callFlow: { 
                                  ...currentConfig.callFlow, 
                                  businessHours: {
                                    ...currentConfig.callFlow.businessHours,
                                    enabled
                                  }
                                } 
                              })
                            }
                          />
                          <Label>Business Hours</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">System Status</h4>
                        <p className="text-sm text-blue-700">
                          {currentConfig.enabled ? 
                            `VoIP system is active using ${voipProviders.find(p => p.value === currentConfig.provider)?.label}` :
                            'VoIP system is disabled'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateConfig(currentConfig)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                    <div className="flex gap-2">
                      <Input
                        placeholder="+1234567890"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                        className="w-48"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => testNumber && testCallMutation.mutate({ number: testNumber })}
                        disabled={!testNumber || testCallMutation.isPending}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Call
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                VoIP Provider Configuration
              </CardTitle>
              <CardDescription>
                Configure your VoIP service provider credentials and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>VoIP Provider</Label>
                <Select 
                  value={currentConfig.provider}
                  onValueChange={(provider) =>
                    handleUpdateConfig({ provider: provider as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voipProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="py-2">
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-sm text-muted-foreground">{provider.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentConfig.provider === 'twilio' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account SID</Label>
                    <Input 
                      type="password"
                      value={currentConfig.credentials.accountSid || ''}
                      placeholder="ACxxxxxxxxxxxxxxxxx"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            accountSid: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Auth Token</Label>
                    <Input 
                      type="password"
                      value={currentConfig.credentials.authToken || ''}
                      placeholder="Your auth token"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            authToken: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      value={currentConfig.credentials.phoneNumber || ''}
                      placeholder="+1234567890"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            phoneNumber: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {(currentConfig.provider === 'voipms' || currentConfig.provider === 'localphone') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input 
                      value={currentConfig.credentials.username || ''}
                      placeholder="Your username"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            username: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password"
                      value={currentConfig.credentials.password || ''}
                      placeholder="Your password"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            password: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input 
                      type="password"
                      value={currentConfig.credentials.apiKey || ''}
                      placeholder="Your API key"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            apiKey: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      value={currentConfig.credentials.phoneNumber || ''}
                      placeholder="+1234567890"
                      onChange={(e) =>
                        handleUpdateConfig({
                          credentials: {
                            ...currentConfig.credentials,
                            phoneNumber: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {currentConfig.provider === 'custom' && (
                <div>
                  <Label>Custom Endpoint</Label>
                  <Input 
                    value={currentConfig.credentials.customEndpoint || ''}
                    placeholder="https://your-voip-api.com/webhook"
                    onChange={(e) =>
                      handleUpdateConfig({
                        credentials: {
                          ...currentConfig.credentials,
                          customEndpoint: e.target.value
                        }
                      })
                    }
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => handleUpdateConfig({ credentials: currentConfig.credentials })}>
                  Save Provider Settings
                </Button>
                <Button variant="outline">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice & Audio Settings
              </CardTitle>
              <CardDescription>
                Configure voice quality, language, and audio parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Voice</Label>
                    <Select 
                      value={currentConfig.voiceSettings.voice}
                      onValueChange={(voice) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            voice
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.value} value={voice.value}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={currentConfig.voiceSettings.language}
                      onValueChange={(language) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            language
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="it-IT">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Voice Engine</Label>
                    <Select 
                      value={currentConfig.voiceSettings.engine}
                      onValueChange={(engine) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            engine: engine as any
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neural">Neural (Best Quality)</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Speaking Speed: {currentConfig.voiceSettings.speed}x</Label>
                    <Input 
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={currentConfig.voiceSettings.speed}
                      onChange={(e) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            speed: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label>Pitch: {currentConfig.voiceSettings.pitch}x</Label>
                    <Input 
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={currentConfig.voiceSettings.pitch}
                      onChange={(e) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            pitch: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label>Volume: {Math.round(currentConfig.voiceSettings.volume * 100)}%</Label>
                    <Input 
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={currentConfig.voiceSettings.volume}
                      onChange={(e) =>
                        handleUpdateConfig({
                          voiceSettings: {
                            ...currentConfig.voiceSettings,
                            volume: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <Button className="w-full">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Voice Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handoff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneForwarded className="h-5 w-5" />
                Human Handoff & Call Forwarding
              </CardTitle>
              <CardDescription>
                Configure automatic escalation to human agents and call forwarding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={currentConfig.humanHandoff.enabled}
                  onCheckedChange={(enabled) => 
                    handleUpdateConfig({ 
                      humanHandoff: { 
                        ...currentConfig.humanHandoff, 
                        enabled 
                      } 
                    })
                  }
                />
                <Label>Enable Human Handoff</Label>
              </div>

              {currentConfig.humanHandoff.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Escalation Threshold</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={currentConfig.humanHandoff.escalationThreshold}
                        onChange={(e) =>
                          handleUpdateConfig({
                            humanHandoff: {
                              ...currentConfig.humanHandoff,
                              escalationThreshold: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Failed AI responses before escalation</p>
                    </div>

                    <div>
                      <Label>Auto Escalation Time (minutes)</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={currentConfig.humanHandoff.autoEscalateTime}
                        onChange={(e) =>
                          handleUpdateConfig({
                            humanHandoff: {
                              ...currentConfig.humanHandoff,
                              autoEscalateTime: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Ring Timeout (seconds)</Label>
                      <Input 
                        type="number" 
                        min="10"
                        value={currentConfig.humanHandoff.ringTimeout}
                        onChange={(e) =>
                          handleUpdateConfig({
                            humanHandoff: {
                              ...currentConfig.humanHandoff,
                              ringTimeout: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Escalation Trigger Keywords</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Keywords that trigger immediate human handoff
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {currentConfig.humanHandoff.triggerKeywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTriggerKeyword(keyword)}>
                            {keyword} ×
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newTriggerKeyword}
                          onChange={(e) => setNewTriggerKeyword(e.target.value)}
                          placeholder="Enter trigger keyword"
                          className="flex-1"
                        />
                        <Button onClick={addTriggerKeyword} disabled={!newTriggerKeyword.trim()}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Forward to Phone Numbers</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Phone numbers to forward calls when escalated to human
                    </p>
                    
                    <div className="space-y-2">
                      {currentConfig.humanHandoff.forwardNumbers?.map((number, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={number} readOnly className="flex-1" />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeForwardNumber(number)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          value={newForwardNumber}
                          onChange={(e) => setNewForwardNumber(e.target.value)}
                          placeholder="+1234567890"
                          className="flex-1"
                        />
                        <Button onClick={addForwardNumber} disabled={!newForwardNumber.trim()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Voice Assistant
              </CardTitle>
              <CardDescription>
                Configure AI assistant behavior and permissions for voice calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={currentConfig.aiAssistant.enabled}
                  onCheckedChange={(enabled) => 
                    handleUpdateConfig({ 
                      aiAssistant: { 
                        ...currentConfig.aiAssistant, 
                        enabled 
                      } 
                    })
                  }
                />
                <Label>Enable AI Voice Assistant</Label>
              </div>

              {currentConfig.aiAssistant.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>AI Model</Label>
                      <Select value={currentConfig.aiAssistant.model}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude-3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Max Tokens</Label>
                      <Input 
                        type="number" 
                        value={currentConfig.aiAssistant.maxTokens}
                        onChange={(e) =>
                          handleUpdateConfig({
                            aiAssistant: {
                              ...currentConfig.aiAssistant,
                              maxTokens: parseInt(e.target.value)
                            }
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Temperature</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={currentConfig.aiAssistant.temperature}
                        onChange={(e) =>
                          handleUpdateConfig({
                            aiAssistant: {
                              ...currentConfig.aiAssistant,
                              temperature: parseFloat(e.target.value)
                            }
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>System Prompt</Label>
                    <Textarea
                      value={currentConfig.aiAssistant.systemPrompt}
                      rows={4}
                      placeholder="Define how the AI should behave during voice calls..."
                      onChange={(e) =>
                        handleUpdateConfig({
                          aiAssistant: {
                            ...currentConfig.aiAssistant,
                            systemPrompt: e.target.value
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">AI Assistant Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(currentConfig.aiAssistant.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <Checkbox
                            checked={value}
                            onCheckedChange={(checked) => {
                              handleUpdateConfig({
                                aiAssistant: {
                                  ...currentConfig.aiAssistant,
                                  permissions: {
                                    ...currentConfig.aiAssistant.permissions,
                                    [key]: checked
                                  }
                                }
                              });
                            }}
                          />
                          <Label className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Call Analytics & Monitoring
              </CardTitle>
              <CardDescription>
                Monitor call performance, AI effectiveness, and system metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.analytics.trackCalls}
                      onCheckedChange={(trackCalls) => 
                        handleUpdateConfig({ 
                          analytics: { 
                            ...currentConfig.analytics, 
                            trackCalls 
                          } 
                        })
                      }
                    />
                    <Label>Track Call Metrics</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.analytics.recordMetrics}
                      onCheckedChange={(recordMetrics) => 
                        handleUpdateConfig({ 
                          analytics: { 
                            ...currentConfig.analytics, 
                            recordMetrics 
                          } 
                        })
                      }
                    />
                    <Label>Record Performance Metrics</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.analytics.generateReports}
                      onCheckedChange={(generateReports) => 
                        handleUpdateConfig({ 
                          analytics: { 
                            ...currentConfig.analytics, 
                            generateReports 
                          } 
                        })
                      }
                    />
                    <Label>Generate Analytics Reports</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={currentConfig.analytics.enableRealTimeMonitoring}
                      onCheckedChange={(enableRealTimeMonitoring) => 
                        handleUpdateConfig({ 
                          analytics: { 
                            ...currentConfig.analytics, 
                            enableRealTimeMonitoring 
                          } 
                        })
                      }
                    />
                    <Label>Real-Time Call Monitoring</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Live Call Dashboard</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">5</div>
                          <div className="text-sm text-muted-foreground">Active Calls</div>
                        </div>
                        <PhoneCall className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">12</div>
                          <div className="text-sm text-muted-foreground">Calls Today</div>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">2</div>
                          <div className="text-sm text-muted-foreground">Forwarded to Human</div>
                        </div>
                        <Users className="h-8 w-8 text-orange-600" />
                      </div>
                    </Card>
                  </div>
                  <Button className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Open Call Monitor
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-sm text-muted-foreground">AI Resolution Rate</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">3.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">4.7/5</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">8.5min</div>
                  <div className="text-sm text-muted-foreground">Avg Call Duration</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
