import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type {
  AttendanceClockEnvelope,
  AttendanceMonthEnvelope,
  AttendanceTodayData,
  AttendanceTodayEnvelope,
  ClockAttendanceRequest,
  ClockAttendanceResponseData,
  ValidateQrRequest,
  ValidateQrResponseData,
} from '@/features/attendance/types/contracts';

interface GetMonthArgs {
  year: number;
  month: number;
}

function toTodayStateFromClockResponse(
  data: ClockAttendanceResponseData,
  previous: AttendanceTodayData | undefined
): AttendanceTodayData {
  return {
    state: data.state,
    nextAllowedAction: data.nextAllowedAction,
    blocked: data.blocked ?? previous?.blocked ?? false,
    blockReasonCode: data.blockReasonCode ?? previous?.blockReasonCode ?? null,
    blockReasonMessage: data.blockReasonMessage ?? previous?.blockReasonMessage ?? null,
    siteId: previous?.siteId ?? null,
    siteName: previous?.siteName ?? null,
    qrRequired: previous?.qrRequired ?? false,
    locationRequired: previous?.locationRequired ?? false,
    serverTime: data.serverRecordedAt,
    timezone: data.timezone,
    workDate: data.workDate,
    todayRecord: data.todayRecord,
    warnings: data.warnings ?? [],
  };
}

export const attendanceApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceToday: builder.query<AttendanceTodayData, void>({
      query: () => ({
        url: '/api/v1/mobile/attendance/today',
        method: 'GET',
      }),
      transformResponse: (response: AttendanceTodayEnvelope) => response.data,
      providesTags: ['AttendanceToday'],
    }),
    submitAttendanceClock: builder.mutation<ClockAttendanceResponseData, ClockAttendanceRequest>({
      query: (body) => ({
        url: '/api/v1/mobile/attendance/clock',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AttendanceClockEnvelope) => response.data,
      invalidatesTags: ['AttendanceToday', 'AttendanceMonth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            attendanceApi.util.updateQueryData('getAttendanceToday', undefined, (draft) => {
              Object.assign(draft, toTodayStateFromClockResponse(data, draft));
            })
          );
        } catch {
          // No optimistic update on error.
        }
      },
    }),
    getAttendanceMonth: builder.query<AttendanceMonthEnvelope['data'], GetMonthArgs>({
      query: ({ year, month }) => ({
        url: `/api/v1/mobile/attendance/month?year=${year}&month=${month}`,
        method: 'GET',
      }),
      transformResponse: (response: AttendanceMonthEnvelope) => response.data,
      providesTags: (_result, _error, arg) => [{ type: 'AttendanceMonth', id: `${arg.year}-${arg.month}` }],
    }),
    validateAttendanceQr: builder.mutation<ValidateQrResponseData, ValidateQrRequest>({
      query: (body) => ({
        url: '/api/v1/qr/validate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessEnvelope<ValidateQrResponseData>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttendanceTodayQuery,
  useGetAttendanceMonthQuery,
  useSubmitAttendanceClockMutation,
  useValidateAttendanceQrMutation,
} = attendanceApi;
