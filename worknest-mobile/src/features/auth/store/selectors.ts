import type { RootState } from '@/common/store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRequiresRoleSelection = (state: RootState) => state.auth.requiresRoleSelection;
export const selectAvailableContexts = (state: RootState) => state.auth.availableContexts;
export const selectTenantContext = (state: RootState) => state.auth.tenantContext;
export const selectAuthBootstrapped = (state: RootState) => state.auth.bootstrapped;
export const selectForgotPasswordState = (state: RootState) => state.auth.forgotPassword;
export const selectResetPasswordState = (state: RootState) => state.auth.resetPassword;
export const selectInvitationState = (state: RootState) => state.auth.invitation;
