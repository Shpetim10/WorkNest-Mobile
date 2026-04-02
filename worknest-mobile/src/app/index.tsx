import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SplashScreen as SplashScreenUI, useAppInit } from '@/features/bootstrap';

export default function EntryRoute() {
  const router = useRouter();
  const { isReady } = useAppInit();

  useEffect(() => {
    if (isReady) {
      // Redirect to the login screen after initialization
      // We use 'as any' here as typed routing may not have refreshed for the newly grouped paths
      router.replace('/login' as any);
    }
  }, [isReady, router]);

  return <SplashScreenUI />;
}
