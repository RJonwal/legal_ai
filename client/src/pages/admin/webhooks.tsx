import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Webhook, 
  Settings, 
  TestTube, 
  Activity, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface WebhookEndpoint {
  id: number;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'healthy' | 'failing' | 'inactive';
  deliveryRate: number;
  retryCount: number;
}

export default function WebhooksPage() {
  const [selectedWebhook, setSelectedWebhook] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch webhooks
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['/api/admin/webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return response.json();
    }
  });

  // Create webhook mutation
  const createMutation = useMutation({
    mutationFn: async (webhookData: typeof newWebhook) => {
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
      if (!response.ok) throw new Error('Failed to create webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webhooks'] });
      setIsCreating(false);
      setNewWebhook({ name: '', url: '', events: [], isActive: true });
      toast({ title: "Success", description: "Webhook created successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create webhook",
        variant: "destructive" 
      });
    }
  });

  // Update webhook mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WebhookEndpoint> }) => {
      const response = await fetch(`/api/admin/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webhooks'] });
      toast({ title: "Success", description: "Webhook updated successfully" });
    }
  });

  // Delete webhook mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/webhooks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete webhook');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webhooks'] });
      setSelectedWebhook(null);
      toast({ title: "Success", description: "Webhook deleted successfully" });
    }
  });

  // Test webhook mutation
  const testMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/webhooks/${id}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to test webhook');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const availableEvents = [
    'user.created',
    'user.updated',
    'user.deleted',
    'subscription.created',
    'subscription.updated',
    'subscription.cancelled',
    'payment.succeeded',
    'payment.failed',
    'case.created',
    'case.updated',
    'document.generated',
    'ai.request.completed'
  ];

  const handleCreateWebhook = () => {
    createMutation.mutate(newWebhook);
  };

  const handleUpdateWebhook = (id: number, updates: Partial<WebhookEndpoint>) => {
    updateMutation.mutate({ id, data: updates });
  };

  const handleDeleteWebhook = (id: number) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTestWebhook = (id: number) => {
    testMutation.mutate(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'failing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600 mt-2">Configure webhook endpoints for real-time notifications</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoints
              </CardTitle>
              <CardDescription>Manage your webhook configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks?.map((webhook: WebhookEndpoint) => (
                <div
                  key={webhook.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWebhook === webhook.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWebhook(webhook.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{webhook.name}</h4>
                    {getStatusIcon(webhook.status)}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{webhook.url}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={getStatusColor(webhook.status)}>
                      {webhook.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {webhook.deliveryRate}% delivery
                    </span>
                  </div>
                </div>
              ))}

              {isCreating && (
                <Card className="p-4 border-dashed border-2 border-blue-300">
                  <div className="space-y-3">
                    <Input
                      placeholder="Webhook name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="https://your-api.com/webhooks"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleCreateWebhook}
                        disabled={!newWebhook.name || !newWebhook.url || createMutation.isPending}
                      >
                        {createMutation.isPending ? 'Creating...' : 'Create'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsCreating(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-2">
          {selectedWebhook ? (
            (() => {
              const webhook = webhooks?.find((w: WebhookEndpoint) => w.id === selectedWebhook);
              if (!webhook) return null;

              return (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {webhook.name}
                            {getStatusIcon(webhook.status)}
                          </CardTitle>
                          <CardDescription>{webhook.url}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            disabled={testMutation.isPending}
                          >
                            <TestTube className="h-4 w-4 mr-2" />
                            {testMutation.isPending ? 'Testing...' : 'Test'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Active</Label>
                          <p className="text-sm text-gray-600">Enable or disable this webhook</p>
                        </div>
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={(checked) => 
                            handleUpdateWebhook(webhook.id, { isActive: checked })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="webhookUrl">Endpoint URL</Label>
                        <Input
                          id="webhookUrl"
                          value={webhook.url}
                          onChange={(e) => 
                            handleUpdateWebhook(webhook.id, { url: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label>Webhook Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            value={webhook.secret}
                            readOnly
                            placeholder="whsec_..."
                          />
                          <Button variant="outline" size="sm">
                            Regenerate
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Use this secret to verify webhook signatures
                        </p>
                      </div>

                      <div>
                        <Label>Event Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {availableEvents.map((event) => (
                            <label key={event} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={webhook.events.includes(event)}
                                onChange={(e) => {
                                  const events = e.target.checked
                                    ? [...webhook.events, event]
                                    : webhook.events.filter(ev => ev !== event);
                                  handleUpdateWebhook(webhook.id, { events });
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Delivery Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{webhook.deliveryRate}%</p>
                          <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{webhook.retryCount}</p>
                          <p className="text-sm text-gray-600">Retry Attempts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleDateString() : 'Never'}
                          </p>
                          <p className="text-sm text-gray-600">Last Triggered</p>
                        </div>
                      </div>
                      
                      {webhook.status === 'failing' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                              Webhook Failing
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            This webhook has failed multiple delivery attempts. Please check your endpoint configuration.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Webhook className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Webhook Selected</h3>
                  <p className="text-gray-600">Select a webhook from the list to view and edit its configuration</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}