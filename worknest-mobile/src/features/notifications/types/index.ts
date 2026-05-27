export type NotificationType =
  | 'LEAVE_APPROVED'
  | 'PAYSLIP_READY'
  | 'NEW_ANNOUNCEMENT'
  | 'LEAVE_REJECTED';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  titleKey: 'notifications.leaveApproved' | 'notifications.payslipReady' | 'notifications.newAnnouncement' | 'notifications.leaveRejected';
  title: string; // Fallback English title
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationUnreadCountResponse {
  count: number;
}
