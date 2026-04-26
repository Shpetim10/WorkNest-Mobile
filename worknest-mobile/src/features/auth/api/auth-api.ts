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
import { API_BASE_URL } from '@/common/config/network';
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

let refreshPromise: Promise<boolean> | null = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
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

async function performRefresh(api: BaseQueryApi): Promise<boolean> {
  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;
  if (!refreshToken) {
    return false;
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
    return false;
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
  return true;
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

  const refreshOk = await refreshPromise;
  if (!refreshOk) {
    await clearPersistedSessionArtifacts();
    api.dispatch(logoutCompleted());
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
