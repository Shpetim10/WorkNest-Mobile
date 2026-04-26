import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  ActivateInvitationResponseData,
  AvailableLoginContext,
  InvitationPreflightData,
  LoginResponseData,
  RefreshResponseData,
  SelectRoleResponseData,
  TenantContext,
} from '@/features/auth/types/contracts';

export interface AuthState {
  isAuthenticated: boolean;
  requiresRoleSelection: boolean;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  activeRoleAssignmentId: string | null;
  activePlatformRole: string | null;
  tenantContext: TenantContext | null;
  availableContexts: AvailableLoginContext[];
  userEmail: string | null;
  bootstrapped: boolean;
  forgotPassword: {
    submitting: boolean;
    submitted: boolean;
    lastSubmittedEmail: string | null;
  };
  resetPassword: {
    submitting: boolean;
    succeeded: boolean;
    tokenSource: 'deep-link' | 'manual' | null;
  };
  invitation: {
    validateStatus: 'idle' | 'loading' | 'valid' | 'invalid';
    token: string | null;
    preflight: InvitationPreflightData | null;
    activateSubmitting: boolean;
    activateSucceeded: boolean;
  };
}

export interface AuthHydrationPayload {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  activeRoleAssignmentId: string;
  activePlatformRole: string;
  tenantContext: TenantContext;
}

const initialState: AuthState = {
  isAuthenticated: false,
  requiresRoleSelection: false,
  accessToken: null,
  accessTokenExpiresAt: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  activeRoleAssignmentId: null,
  activePlatformRole: null,
  tenantContext: null,
  availableContexts: [],
  userEmail: null,
  bootstrapped: false,
  forgotPassword: {
    submitting: false,
    submitted: false,
    lastSubmittedEmail: null,
  },
  resetPassword: {
    submitting: false,
    succeeded: false,
    tokenSource: null,
  },
  invitation: {
    validateStatus: 'idle',
    token: null,
    preflight: null,
    activateSubmitting: false,
    activateSucceeded: false,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSucceeded(state, action: PayloadAction<{ userEmail: string; payload: LoginResponseData }>) {
      const { userEmail, payload } = action.payload;
      state.isAuthenticated = true;
      state.requiresRoleSelection = payload.roleSelectionRequired;
      state.accessToken = payload.accessToken;
      state.accessTokenExpiresAt = payload.accessTokenExpiresAt;
      state.refreshToken = payload.refreshToken;
      state.refreshTokenExpiresAt = payload.refreshTokenExpiresAt;
      state.activeRoleAssignmentId = payload.activeRoleAssignmentId;
      state.activePlatformRole = payload.role;
      state.tenantContext = payload.tenantContext;
      state.availableContexts = payload.availableContexts ?? [];
      state.userEmail = userEmail;
    },
    roleSelectionSucceeded(state, action: PayloadAction<SelectRoleResponseData>) {
      const payload = action.payload;
      state.isAuthenticated = true;
      state.requiresRoleSelection = false;
      state.accessToken = payload.accessToken;
      state.accessTokenExpiresAt = payload.accessTokenExpiresAt;
      state.refreshToken = payload.refreshToken;
      state.refreshTokenExpiresAt = payload.refreshTokenExpiresAt;
      state.activeRoleAssignmentId = payload.activeRoleAssignmentId;
      state.activePlatformRole = payload.platformRole;
      state.tenantContext = payload.tenantContext;
      state.availableContexts = [];
    },
    refreshSucceeded(state, action: PayloadAction<RefreshResponseData>) {
      const payload = action.payload;
      state.isAuthenticated = true;
      state.accessToken = payload.accessToken;
      state.accessTokenExpiresAt = payload.accessTokenExpiresAt;
      state.refreshToken = payload.refreshToken;
      state.refreshTokenExpiresAt = payload.refreshTokenExpiresAt;
      state.activeRoleAssignmentId = payload.activeRoleAssignmentId;
      state.tenantContext = payload.tenantContext;
    },
    hydrateFromStorage(state, action: PayloadAction<AuthHydrationPayload>) {
      const payload = action.payload;
      state.isAuthenticated = true;
      state.requiresRoleSelection = false;
      state.accessToken = payload.accessToken;
      state.accessTokenExpiresAt = payload.accessTokenExpiresAt;
      state.refreshToken = payload.refreshToken;
      state.refreshTokenExpiresAt = payload.refreshTokenExpiresAt;
      state.activeRoleAssignmentId = payload.activeRoleAssignmentId;
      state.activePlatformRole = payload.activePlatformRole;
      state.tenantContext = payload.tenantContext;
    },
    markBootstrapped(state) {
      state.bootstrapped = true;
    },
    forgotPasswordSubmitting(state, action: PayloadAction<{ email: string }>) {
      state.forgotPassword.submitting = true;
      state.forgotPassword.submitted = false;
      state.forgotPassword.lastSubmittedEmail = action.payload.email;
    },
    forgotPasswordSubmitted(state) {
      state.forgotPassword.submitting = false;
      state.forgotPassword.submitted = true;
    },
    forgotPasswordFailed(state) {
      state.forgotPassword.submitting = false;
      state.forgotPassword.submitted = false;
    },
    resetPasswordSubmitting(state, action: PayloadAction<{ tokenSource: 'deep-link' | 'manual' | null }>) {
      state.resetPassword.submitting = true;
      state.resetPassword.succeeded = false;
      state.resetPassword.tokenSource = action.payload.tokenSource;
    },
    resetPasswordSucceeded(state) {
      state.resetPassword.submitting = false;
      state.resetPassword.succeeded = true;
    },
    resetPasswordFailed(state) {
      state.resetPassword.submitting = false;
      state.resetPassword.succeeded = false;
    },
    clearResetPasswordState(state) {
      state.resetPassword.submitting = false;
      state.resetPassword.succeeded = false;
      state.resetPassword.tokenSource = null;
    },
    setInvitationToken(state, action: PayloadAction<string | null>) {
      state.invitation.token = action.payload;
    },
    invitationValidationStarted(state) {
      state.invitation.validateStatus = 'loading';
      state.invitation.preflight = null;
    },
    invitationValidationSucceeded(state, action: PayloadAction<InvitationPreflightData>) {
      state.invitation.validateStatus = 'valid';
      state.invitation.preflight = action.payload;
    },
    invitationValidationFailed(state) {
      state.invitation.validateStatus = 'invalid';
      state.invitation.preflight = null;
    },
    invitationActivationStarted(state) {
      state.invitation.activateSubmitting = true;
      state.invitation.activateSucceeded = false;
    },
    invitationActivationSucceeded(state, _action: PayloadAction<ActivateInvitationResponseData>) {
      state.invitation.activateSubmitting = false;
      state.invitation.activateSucceeded = true;
    },
    invitationActivationFailed(state) {
      state.invitation.activateSubmitting = false;
      state.invitation.activateSucceeded = false;
    },
    clearInvitationFlowState(state) {
      state.invitation.validateStatus = 'idle';
      state.invitation.token = null;
      state.invitation.preflight = null;
      state.invitation.activateSubmitting = false;
      state.invitation.activateSucceeded = false;
    },
    logoutCompleted(state) {
      state.isAuthenticated = false;
      state.requiresRoleSelection = false;
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshToken = null;
      state.refreshTokenExpiresAt = null;
      state.activeRoleAssignmentId = null;
      state.activePlatformRole = null;
      state.tenantContext = null;
      state.availableContexts = [];
      state.userEmail = null;
      state.resetPassword.submitting = false;
      state.resetPassword.succeeded = false;
      state.resetPassword.tokenSource = null;
      state.invitation.token = null;
      state.invitation.preflight = null;
      state.invitation.validateStatus = 'idle';
      state.invitation.activateSubmitting = false;
      state.invitation.activateSucceeded = false;
    },
  },
});

export const {
  loginSucceeded,
  roleSelectionSucceeded,
  refreshSucceeded,
  hydrateFromStorage,
  markBootstrapped,
  forgotPasswordSubmitting,
  forgotPasswordSubmitted,
  forgotPasswordFailed,
  resetPasswordSubmitting,
  resetPasswordSucceeded,
  resetPasswordFailed,
  clearResetPasswordState,
  setInvitationToken,
  invitationValidationStarted,
  invitationValidationSucceeded,
  invitationValidationFailed,
  invitationActivationStarted,
  invitationActivationSucceeded,
  invitationActivationFailed,
  clearInvitationFlowState,
  logoutCompleted,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
