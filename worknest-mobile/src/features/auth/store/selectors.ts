import type { RootState } from '@/common/store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRequiresRoleSelection = (state: RootState) => state.auth.requiresRoleSelection;
export const selectAvailableContexts = (state: RootState) => state.auth.availableContexts;
export const selectTenantContext = (state: RootState) => state.auth.tenantContext;
export const selectAuthBootstrapped = (state: RootState) => state.auth.bootstrapped;

