
import { apiRequest } from "./queryClient";

export interface CreateNotificationParams {
  type: 'action_required' | 'deadline' | 'document_ready' | 'case_update' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  caseId?: number;
  caseName?: string;
  actionType?: string;
  actionData?: any;
}

export class NotificationService {
  static async createNotification(params: CreateNotificationParams) {
    try {
      const response = await apiRequest('POST', '/api/notifications', params);
      return response.json();
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  static async createActionNotification(
    caseId: number,
    caseName: string,
    actionType: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    actionData?: any
  ) {
    return this.createNotification({
      type: 'action_required',
      priority,
      title,
      message,
      caseId,
      caseName,
      actionType,
      actionData
    });
  }

  static async createDeadlineNotification(
    caseId: number,
    caseName: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'high'
  ) {
    return this.createNotification({
      type: 'deadline',
      priority,
      title,
      message,
      caseId,
      caseName,
      actionType: 'review_deadline'
    });
  }

  static async createDocumentNotification(
    caseId: number,
    caseName: string,
    documentName: string,
    actionType: string = 'view_document',
    actionData?: any
  ) {
    return this.createNotification({
      type: 'document_ready',
      priority: 'medium',
      title: `Document Ready: ${documentName}`,
      message: `A new document "${documentName}" has been generated and is ready for review.`,
      caseId,
      caseName,
      actionType,
      actionData
    });
  }

  static async createCaseUpdateNotification(
    caseId: number,
    caseName: string,
    updateType: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'low'
  ) {
    return this.createNotification({
      type: 'case_update',
      priority,
      title: `Case Update: ${updateType}`,
      message,
      caseId,
      caseName,
      actionType: 'update_case'
    });
  }

  // Predefined notification templates for common legal actions
  static templates = {
    contractAnalysis: (caseId: number, caseName: string) => 
      NotificationService.createActionNotification(
        caseId,
        caseName,
        'analyze_contract',
        'Contract Analysis Required',
        'A contract in this case requires legal analysis for potential issues and opportunities.',
        'high'
      ),

    discoveryDeadline: (caseId: number, caseName: string, days: number) =>
      NotificationService.createDeadlineNotification(
        caseId,
        caseName,
        `Discovery Deadline Approaching`,
        `Discovery deadline is in ${days} days. Immediate action required to prepare and file discovery requests.`,
        days <= 7 ? 'urgent' : 'high'
      ),

    breachNotice: (caseId: number, caseName: string) =>
      NotificationService.createActionNotification(
        caseId,
        caseName,
        'send_communication',
        'Breach Notice Required',
        'Contract breach detected. Send formal breach notice to opposing party immediately.',
        'urgent'
      ),

    motionFiling: (caseId: number, caseName: string, motionType: string) =>
      NotificationService.createActionNotification(
        caseId,
        caseName,
        'file_motion',
        `File ${motionType}`,
        `Prepare and file ${motionType} based on current case analysis and strategy.`,
        'high'
      ),

    documentGeneration: (caseId: number, caseName: string, documentType: string) =>
      NotificationService.createActionNotification(
        caseId,
        caseName,
        'generate_document',
        `Generate ${documentType}`,
        `Create ${documentType} using AI legal assistant based on case facts and strategy.`,
        'medium'
      ),

    clientMeeting: (caseId: number, caseName: string, reason: string) =>
      NotificationService.createActionNotification(
        caseId,
        caseName,
        'schedule_meeting',
        'Client Meeting Needed',
        `Schedule client meeting to discuss: ${reason}`,
        'medium'
      )
  };
}

// Export a default instance
export const notificationService = NotificationService;
