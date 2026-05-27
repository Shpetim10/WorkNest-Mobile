import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type { NotificationItem, NotificationType, NotificationUnreadCountResponse } from '../types';

interface BackendNotificationItem {
  id: string;
  type: 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'ANNOUNCEMENT' | 'PAYSLIP_READY';
  title: string;
  message: string;
  targetId: string;
  targetType: 'LEAVE_REQUEST' | 'ANNOUNCEMENT' | 'PAYSLIP';
  read: boolean;
  createdAt: string;
}

const mapType = (backendType: string): NotificationType => {
  if (backendType === 'ANNOUNCEMENT') {
    return 'NEW_ANNOUNCEMENT';
  }
  return backendType as NotificationType;
};

const mapTitleKey = (backendType: string): NotificationItem['titleKey'] => {
  switch (backendType) {
    case 'LEAVE_APPROVED':
      return 'notifications.leaveApproved';
    case 'PAYSLIP_READY':
      return 'notifications.payslipReady';
    case 'ANNOUNCEMENT':
      return 'notifications.newAnnouncement';
    case 'LEAVE_REJECTED':
      return 'notifications.leaveRejected';
    default:
      return 'notifications.newAnnouncement';
  }
};

const transformNotification = (item: BackendNotificationItem): NotificationItem => {
  return {
    id: item.id,
    type: mapType(item.type),
    titleKey: mapTitleKey(item.type),
    title: item.title,
    message: item.message,
    createdAt: item.createdAt,
    read: item.read,
  };
};

export const notificationsApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationItem[], void>({
      query: () => ({ url: '/api/v1/notifications', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<BackendNotificationItem[]>) =>
        Array.isArray(response.data) ? response.data.map(transformNotification) : [],
      providesTags: ['Notifications'],
    }),

    getNotificationsUnreadCount: builder.query<NotificationUnreadCountResponse, void>({
      query: () => ({ url: '/api/v1/notifications/unread-count', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<NotificationUnreadCountResponse>) => response.data,
      providesTags: ['NotificationUnreadCount'],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/notifications/${id}/read`, method: 'PATCH' }),
      transformResponse: () => undefined,
      invalidatesTags: ['Notifications', 'NotificationUnreadCount'],
    }),

    markNotificationsReadAll: builder.mutation<void, void>({
      query: () => ({ url: '/api/v1/notifications/read-all', method: 'PATCH' }),
      transformResponse: () => undefined,
      invalidatesTags: ['Notifications', 'NotificationUnreadCount'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetNotificationsUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadAllMutation,
} = notificationsApi;
