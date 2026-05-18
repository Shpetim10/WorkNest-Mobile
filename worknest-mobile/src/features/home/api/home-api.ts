import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type { MobileDashboardResponse, MobileProfileResponse } from '../types/contracts';

export const homeApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<MobileDashboardResponse, void>({
      query: () => ({ url: '/api/v1/mobile/dashboard', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<MobileDashboardResponse>) => response.data,
    }),
    getProfile: builder.query<MobileProfileResponse, void>({
      query: () => ({ url: '/api/v1/mobile/profile/me', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<MobileProfileResponse>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery, useGetProfileQuery } = homeApi;
