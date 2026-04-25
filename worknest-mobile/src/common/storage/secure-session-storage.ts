import * as SecureStore from 'expo-secure-store';

import type { TenantContext } from '@/features/auth/types/contracts';

const SESSION_KEYS = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
  accessTokenExpiresAt: 'auth_access_token_expires_at',
  refreshTokenExpiresAt: 'auth_refresh_token_expires_at',
  activeRoleAssignmentId: 'auth_active_role_assignment_id',
  tenantContext: 'auth_tenant_context',
  activePlatformRole: 'auth_active_platform_role',
} as const;

export interface PersistedSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  activeRoleAssignmentId: string;
  activePlatformRole: string;
  tenantContext: TenantContext;
}

export async function persistSessionArtifacts(session: PersistedSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(SESSION_KEYS.accessToken, session.accessToken),
    SecureStore.setItemAsync(SESSION_KEYS.refreshToken, session.refreshToken),
    SecureStore.setItemAsync(SESSION_KEYS.accessTokenExpiresAt, session.accessTokenExpiresAt),
    SecureStore.setItemAsync(SESSION_KEYS.refreshTokenExpiresAt, session.refreshTokenExpiresAt),
    SecureStore.setItemAsync(SESSION_KEYS.activeRoleAssignmentId, session.activeRoleAssignmentId),
    SecureStore.setItemAsync(SESSION_KEYS.activePlatformRole, session.activePlatformRole),
    SecureStore.setItemAsync(SESSION_KEYS.tenantContext, JSON.stringify(session.tenantContext)),
  ]);
}

export async function readPersistedSessionArtifacts(): Promise<PersistedSession | null> {
  const [
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    activeRoleAssignmentId,
    activePlatformRole,
    tenantContextRaw,
  ] = await Promise.all([
    SecureStore.getItemAsync(SESSION_KEYS.accessToken),
    SecureStore.getItemAsync(SESSION_KEYS.refreshToken),
    SecureStore.getItemAsync(SESSION_KEYS.accessTokenExpiresAt),
    SecureStore.getItemAsync(SESSION_KEYS.refreshTokenExpiresAt),
    SecureStore.getItemAsync(SESSION_KEYS.activeRoleAssignmentId),
    SecureStore.getItemAsync(SESSION_KEYS.activePlatformRole),
    SecureStore.getItemAsync(SESSION_KEYS.tenantContext),
  ]);

  if (
    !accessToken ||
    !refreshToken ||
    !accessTokenExpiresAt ||
    !refreshTokenExpiresAt ||
    !activeRoleAssignmentId ||
    !activePlatformRole ||
    !tenantContextRaw
  ) {
    return null;
  }

  try {
    const tenantContext = JSON.parse(tenantContextRaw) as TenantContext;
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      activeRoleAssignmentId,
      activePlatformRole,
      tenantContext,
    };
  } catch {
    return null;
  }
}

export async function clearPersistedSessionArtifacts(): Promise<void> {
  await Promise.all(
    Object.values(SESSION_KEYS).map((key) => SecureStore.deleteItemAsync(key))
  );
}

