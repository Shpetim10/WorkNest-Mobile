import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type {
  MobileAnnouncementDetail,
  MobileAnnouncementListItem,
  UnreadCountResponse,
} from '../types';

export const announcementsApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<MobileAnnouncementListItem[], void>({
      query: () => ({ url: '/api/v1/mobile/announcements', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<{ items: MobileAnnouncementListItem[] }>) =>
        Array.isArray(response.data?.items) ? response.data.items : [],
      providesTags: ['Announcements'],
    }),
    getAnnouncementUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({ url: '/api/v1/mobile/announcements/unread-count', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<UnreadCountResponse>) => response.data,
      providesTags: ['AnnouncementUnreadCount'],
    }),
    getAnnouncementDetail: builder.query<MobileAnnouncementDetail, string>({
      query: (id) => ({ url: `/api/v1/mobile/announcements/${id}`, method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<MobileAnnouncementDetail>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Announcements' as const, id }],
    }),
    markAnnouncementRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/mobile/announcements/${id}/read`, method: 'POST' }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, id) => [
        'AnnouncementUnreadCount',
        'Announcements',
        { type: 'Announcements' as const, id },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementUnreadCountQuery,
  useGetAnnouncementDetailQuery,
  useMarkAnnouncementReadMutation,
} = announcementsApi;
