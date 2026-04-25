import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '@/common/store/hooks';
import {
  selectAuthBootstrapped,
  selectIsAuthenticated,
  selectRequiresRoleSelection,
  useAuthBootstrap,
} from '@/features/auth';
import { SplashScreen as SplashScreenUI, useAppInit } from '@/features/bootstrap';

export default function EntryRoute() {
  const router = useRouter();
  const { isReady: appReady } = useAppInit();
  const authBootstrapped = useAppSelector(selectAuthBootstrapped);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const requiresRoleSelection = useAppSelector(selectRequiresRoleSelection);

  useAuthBootstrap();

  useEffect(() => {
    if (!appReady || !authBootstrapped) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    if (requiresRoleSelection) {
      router.replace('/role-assignment' as any);
      return;
    }

    router.replace('/(app)' as any);
  }, [appReady, authBootstrapped, isAuthenticated, requiresRoleSelection, router]);

  return <SplashScreenUI />;
}
