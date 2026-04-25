import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  AvailableLoginContext,
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
    },
  },
});

export const {
  loginSucceeded,
  roleSelectionSucceeded,
  refreshSucceeded,
  hydrateFromStorage,
  markBootstrapped,
  logoutCompleted,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

