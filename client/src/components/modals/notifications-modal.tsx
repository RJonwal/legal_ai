
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Calendar,
  Scale,
  Users,
  X,
  ExternalLink,
  Archive
} from "@/lib/icons";

interface Notification {
  id: string;
  type: 'action_required' | 'deadline' | 'document_ready' | 'case_update' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  caseId?: number;
  caseName?: string;
  actionType?: string;
  actionData?: any;
  createdAt: string;
  read: boolean;
  archived: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeAction?: (notification: Notification) => void;
}

export function NotificationsModal({ isOpen, onClose, onTakeAction }: NotificationsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: isOpen,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const archiveNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/archive`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notification Archived",
        description: "Notification has been moved to archive.",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', '/api/notifications/mark-all-read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All Notifications Marked as Read",
        description: "All notifications have been marked as read.",
      });
    },
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 'text-blue-500';

    switch (type) {
      case 'action_required':
        return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
      case 'deadline':
        return <Clock className={`h-4 w-4 ${iconClass}`} />;
      case 'document_ready':
        return <FileText className={`h-4 w-4 ${iconClass}`} />;
      case 'case_update':
        return <Scale className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Bell className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getActionButton = (notification: Notification) => {
    if (!notification.actionType) return null;

    const buttonText = {
      'generate_document': 'Generate Document',
      'review_deadline': 'Review Deadline',
      'schedule_meeting': 'Schedule Meeting',
      'send_communication': 'Send Communication',
      'file_motion': 'File Motion',
      'update_case': 'Update Case',
      'view_document': 'View Document',
      'analyze_contract': 'Analyze Contract',
      'prepare_discovery': 'Prepare Discovery'
    }[notification.actionType] || 'Take Action';

    return (
      <Button
        size="sm"
        onClick={() => {
          markAsReadMutation.mutate(notification.id);
          onTakeAction?.(notification);
        }}
        className="bg-legal-blue hover:bg-legal-deep text-white"
      >
        {buttonText}
        <ExternalLink className="h-3 w-3 ml-1" />
      </Button>
    );
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === "all") return !notification.archived;
    if (activeTab === "unread") return !notification.read && !notification.archived;
    if (activeTab === "urgent") return notification.priority === 'urgent' && !notification.archived;
    if (activeTab === "archived") return notification.archived;
    return true;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read && !n.archived).length;
  const urgentCount = notifications.filter((n: Notification) => n.priority === 'urgent' && !n.archived).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {filteredNotifications.length} notifications
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending || unreadCount === 0}
            >
              Mark All Read
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {notifications.filter((n: Notification) => !n.archived).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="urgent">
              Urgent
              {urgentCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {urgentCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-legal-blue"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification: Notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all hover:shadow-md ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority.toUpperCase()}
                                </Badge>
                                {notification.caseName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {notification.caseName}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(notification.createdAt).toLocaleString()}
                                </span>
                                {notification.type && (
                                  <span className="capitalize">
                                    {notification.type.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getActionButton(notification)}
                            {!notification.archived && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => archiveNotificationMutation.mutate(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
