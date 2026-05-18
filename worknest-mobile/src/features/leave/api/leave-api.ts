import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type { CreateLeaveRequestBody, LeaveBalanceDto, LeaveRequestDto } from '../types';

export const leaveApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveBalance: builder.query<LeaveBalanceDto[], void>({
      query: () => ({ url: '/api/v1/mobile/leave/balance', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<LeaveBalanceDto[]>) => response.data,
      providesTags: ['LeaveBalance'],
    }),
    getLeaveRequests: builder.query<LeaveRequestDto[], void>({
      query: () => ({ url: '/api/v1/mobile/leave/requests', method: 'GET' }),
      transformResponse: (response: ApiSuccessEnvelope<LeaveRequestDto[]>) => response.data,
      providesTags: ['LeaveRequests'],
    }),
    submitLeaveRequest: builder.mutation<void, CreateLeaveRequestBody>({
      query: (body) => ({ url: '/api/v1/mobile/leave/requests', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: ['LeaveBalance', 'LeaveRequests'],
    }),
    cancelLeaveRequest: builder.mutation<void, string>({
      query: (requestId) => ({
        url: `/api/v1/mobile/leave/requests/${requestId}/cancel`,
        method: 'POST',
      }),
      transformResponse: () => undefined,
      invalidatesTags: ['LeaveBalance', 'LeaveRequests'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeaveBalanceQuery,
  useGetLeaveRequestsQuery,
  useSubmitLeaveRequestMutation,
  useCancelLeaveRequestMutation,
} = leaveApi;