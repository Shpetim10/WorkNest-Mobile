import {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

import {
  clearPersistedSessionArtifacts,
  persistSessionArtifacts,
} from '@/common/storage/secure-session-storage';
import { API_BASE_URL, NETWORK_TIMEOUT_MS } from '@/common/config/network';
import {
  logoutCompleted,
  loginSucceeded,
  forgotPasswordFailed,
  forgotPasswordSubmitted,
  forgotPasswordSubmitting,
  invitationActivationFailed,
  invitationActivationStarted,
  invitationActivationSucceeded,
  invitationValidationFailed,
  invitationValidationStarted,
  invitationValidationSucceeded,
  refreshSucceeded,
  resetPasswordFailed,
  resetPasswordSubmitting,
  resetPasswordSucceeded,
  roleSelectionSucceeded,
} from '@/features/auth/store/auth-slice';
import type {
  ActivateInvitationRequest,
  ActivateInvitationResponseData,
  ApiErrorEnvelope,
  ApiSuccessEnvelope,
  ForgotPasswordRequest,
  ForgotPasswordResponseData,
  InvitationPreflightData,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
  ResetPasswordRequest,
  ResetPasswordResponseData,
  RefreshRequest,
  RefreshResponseData,
  SelectRoleRequest,
  SelectRoleResponseData,
  ValidateInvitationTokenRequest,
} from '@/features/auth/types/contracts';
import type { RootState } from '@/common/store';

interface AuthError {
  status?: number;
  code?: string;
  message?: string;
  fieldErrors?: ApiErrorEnvelope['fieldErrors'];
}

type RefreshResult = 'success' | 'no_token' | 'failed';

let refreshPromise: Promise<RefreshResult> | null = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: NETWORK_TIMEOUT_MS,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    if (state.auth.accessToken) {
      headers.set('Authorization', `Bearer ${state.auth.accessToken}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

function toAuthError(error?: FetchBaseQueryError): AuthError {
  if (!error) {
    return {};
  }

  if (typeof error.status === 'number') {
    const errorData = error.data as ApiErrorEnvelope | undefined;
    return {
      status: error.status,
      code: errorData?.code,
      message: errorData?.message,
      fieldErrors: errorData?.fieldErrors,
    };
  }

  if (error.status === 'TIMEOUT_ERROR') {
    return {
      message: 'The server took too long to respond. Please verify the API host and try again.',
    };
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      message: 'Unable to reach the server. Please verify the API host and network connection.',
    };
  }

  return {
    message: 'Network error. Please check your connection and try again.',
  };
}

function shouldAttemptRefresh(
  endpoint: string,
  error?: FetchBaseQueryError,
  code?: string
): boolean {
  if (!error) {
    return false;
  }
  if (
    endpoint === 'login' ||
    endpoint === 'refresh' ||
    endpoint === 'logout' ||
    endpoint === 'forgotPassword' ||
    endpoint === 'resetPassword' ||
    endpoint === 'validateInvitationToken' ||
    endpoint === 'activateInvitation'
  ) {
    return false;
  }

  if (typeof error.status === 'number' && error.status === 401) {
    return true;
  }

  return code === 'UNAUTHORIZED';
}

async function performRefresh(api: BaseQueryApi): Promise<RefreshResult> {
  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;
  // No token means Redux hasn't been hydrated yet — don't treat this as a real failure.
  if (!refreshToken) {
    return 'no_token';
  }

  const result = await rawBaseQuery(
    {
      url: '/api/v1/auth/refresh',
      method: 'POST',
      body: { refreshToken } satisfies RefreshRequest,
    },
    api,
    {}
  );

  if (result.error) {
    return 'failed';
  }

  const envelope = result.data as ApiSuccessEnvelope<RefreshResponseData>;
  const payload = envelope.data;
  api.dispatch(refreshSucceeded(payload));
  await persistSessionArtifacts({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
    activeRoleAssignmentId: payload.activeRoleAssignmentId,
    activePlatformRole: state.auth.activePlatformRole ?? 'EMPLOYEE',
    tenantContext: payload.tenantContext,
  });
  return 'success';
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, AuthError> = async (
  args,
  api,
  extraOptions
) => {
  const firstResult = await rawBaseQuery(args, api, extraOptions);
  if (!firstResult.error) {
    return { data: firstResult.data };
  }

  const envelope = firstResult.error.data as ApiErrorEnvelope | undefined;
  const code = envelope?.code;
  const endpoint = api.endpoint ?? '';
  if (!shouldAttemptRefresh(endpoint, firstResult.error, code)) {
    return { error: toAuthError(firstResult.error) };
  }

  if (!refreshPromise) {
    refreshPromise = performRefresh(api).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshResult = await refreshPromise;
  if (refreshResult !== 'success') {
    // Only wipe storage when a real refresh attempt failed — not when tokens simply
    // aren't in Redux yet because hydration is still in progress.
    if (refreshResult === 'failed') {
      await clearPersistedSessionArtifacts();
      api.dispatch(logoutCompleted());
    }
    return { error: toAuthError(firstResult.error) };
  }

  const retryResult = await rawBaseQuery(args, api, extraOptions);
  if (retryResult.error) {
    return { error: toAuthError(retryResult.error) };
  }

  return { data: retryResult.data };
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AttendanceToday', 'AttendanceMonth', 'LeaveBalance', 'LeaveRequests', 'Announcements', 'AnnouncementUnreadCount'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: {
          email,
          password,
          platformAccess: 'MOBILE',
        } satisfies LoginRequest,
      }),
      transformResponse: (response: ApiSuccessEnvelope<LoginResponseData>) => response.data,
      async onQueryStarted({ email }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(loginSucceeded({ userEmail: email, payload: data }));
          await persistSessionArtifacts({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
            activeRoleAssignmentId: data.activeRoleAssignmentId,
            activePlatformRole: data.role,
            tenantContext: data.tenantContext,
          });
        } catch {
          // Let the caller handle the rejected mutation result without surfacing an unhandled promise.
        }
      },
    }),
    selectRole: builder.mutation<SelectRoleResponseData, { roleAssignmentId: string }>({
      query: ({ roleAssignmentId }) => ({
        url: '/api/v1/auth/select-role',
        method: 'POST',
        body: {
          roleAssignmentId,
          platformAccess: 'MOBILE',
        } satisfies SelectRoleRequest,
      }),
      transformResponse: (response: ApiSuccessEnvelope<SelectRoleResponseData>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(roleSelectionSucceeded(data));
          await persistSessionArtifacts({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
            activeRoleAssignmentId: data.activeRoleAssignmentId,
            activePlatformRole: data.platformRole,
            tenantContext: data.tenantContext,
          });
        } catch {
          // Let the caller handle the rejected mutation result without surfacing an unhandled promise.
        }
      },
    }),
    refresh: builder.mutation<RefreshResponseData, RefreshRequest>({
      query: (body) => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessEnvelope<RefreshResponseData>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(refreshSucceeded(data));
          const state = getState() as RootState;
          await persistSessionArtifacts({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: data.accessTokenExpiresAt,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
            activeRoleAssignmentId: data.activeRoleAssignmentId,
            activePlatformRole: state.auth.activePlatformRole ?? 'EMPLOYEE',
            tenantContext: data.tenantContext,
          });
        } catch {
          // Refresh failures are handled by the base query retry/logout path.
        }
      },
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
        body,
      }),
      transformResponse: () => undefined,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          await clearPersistedSessionArtifacts();
          dispatch(logoutCompleted());
        }
      },
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponseData, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/api/v1/auth/forgot-password',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessEnvelope<ForgotPasswordResponseData>) => response.data,
      async onQueryStarted({ email }, { dispatch, queryFulfilled }) {
        dispatch(forgotPasswordSubmitting({ email }));
        try {
          await queryFulfilled;
          dispatch(forgotPasswordSubmitted());
        } catch {
          dispatch(forgotPasswordFailed());
        }
      },
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponseData,
      ResetPasswordRequest & { tokenSource: 'deep-link' | 'manual' | null }
    >({
      query: ({ token, newPassword }) => ({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        body: {
          token,
          newPassword,
        } satisfies ResetPasswordRequest,
      }),
      transformResponse: (response: ApiSuccessEnvelope<ResetPasswordResponseData>) => response.data,
      async onQueryStarted({ tokenSource }, { dispatch, queryFulfilled }) {
        dispatch(resetPasswordSubmitting({ tokenSource }));
        try {
          await queryFulfilled;
          await clearPersistedSessionArtifacts();
          dispatch(logoutCompleted());
          dispatch(resetPasswordSucceeded());
        } catch {
          dispatch(resetPasswordFailed());
        }
      },
    }),
    validateInvitationToken: builder.mutation<InvitationPreflightData, ValidateInvitationTokenRequest>({
      query: (body) => ({
        url: '/api/v1/auth/invitations/validate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessEnvelope<InvitationPreflightData>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(invitationValidationStarted());
        try {
          const { data } = await queryFulfilled;
          dispatch(invitationValidationSucceeded(data));
        } catch {
          dispatch(invitationValidationFailed());
        }
      },
    }),
    activateInvitation: builder.mutation<
      ActivateInvitationResponseData,
      ActivateInvitationRequest
    >({
      query: (body) => ({
        url: '/api/v1/auth/invitations/activate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessEnvelope<ActivateInvitationResponseData>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(invitationActivationStarted());
        try {
          const { data } = await queryFulfilled;
          dispatch(invitationActivationSucceeded(data));
        } catch {
          dispatch(invitationActivationFailed());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSelectRoleMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useValidateInvitationTokenMutation,
  useActivateInvitationMutation,
} = authApi;

export type { AuthError };
