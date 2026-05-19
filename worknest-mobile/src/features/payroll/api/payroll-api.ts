import { authApi } from '@/features/auth/api/auth-api';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type {
  PayrollCalculationResponse,
  PayrollMonthSummary,
  PayrollPeriodKey,
} from '../types/payroll.types';

export const payrollApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollDetails: builder.query<PayrollCalculationResponse, PayrollPeriodKey>({
      query: ({ year, month }) => ({
        url: `/api/v1/mobile/payroll/details?year=${year}&month=${month}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccessEnvelope<PayrollCalculationResponse>) =>
        response.data,
    }),
    getPayrollHistory: builder.query<PayrollMonthSummary[], void>({
      query: () => ({
        url: '/api/v1/mobile/payroll/history',
        method: 'GET',
      }),
      transformResponse: (response: ApiSuccessEnvelope<PayrollMonthSummary[]>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetPayrollDetailsQuery, useGetPayrollHistoryQuery } = payrollApi;
