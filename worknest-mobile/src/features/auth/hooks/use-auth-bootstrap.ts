import { useEffect } from 'react';

import {
  clearPersistedSessionArtifacts,
  readPersistedSessionArtifacts,
} from '@/common/storage/secure-session-storage';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { useRefreshMutation } from '@/features/auth/api/auth-api';
import {
  hydrateFromStorage,
  logoutCompleted,
  markBootstrapped,
} from '@/features/auth/store/auth-slice';
import { selectAuthBootstrapped } from '@/features/auth/store/selectors';

const EXPIRY_BUFFER_MS = 30 * 1000;

function isExpiredOrNearExpiry(isoDate: string): boolean {
  const expiryMs = new Date(isoDate).getTime();
  return Number.isNaN(expiryMs) || expiryMs - Date.now() <= EXPIRY_BUFFER_MS;
}

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const bootstrapped = useAppSelector(selectAuthBootstrapped);

  useEffect(() => {
    if (bootstrapped) {
      return;
    }

    let isMounted = true;
    const bootstrap = async () => {
      try {
        const session = await readPersistedSessionArtifacts();
        if (!session) {
          dispatch(logoutCompleted());
          return;
        }

        dispatch(
          hydrateFromStorage({
            accessToken: session.accessToken,
            accessTokenExpiresAt: session.accessTokenExpiresAt,
            refreshToken: session.refreshToken,
            refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            activeRoleAssignmentId: session.activeRoleAssignmentId,
            activePlatformRole: session.activePlatformRole,
            tenantContext: session.tenantContext,
          })
        );

        if (isExpiredOrNearExpiry(session.accessTokenExpiresAt)) {
          await refresh({ refreshToken: session.refreshToken }).unwrap();
        }
      } catch {
        await clearPersistedSessionArtifacts();
        dispatch(logoutCompleted());
      } finally {
        if (isMounted) {
          dispatch(markBootstrapped());
        }
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [bootstrapped, dispatch, refresh]);
}

