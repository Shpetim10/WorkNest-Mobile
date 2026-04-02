import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

/**
 * Protected Layout
 * This is where we'd check if the user is authenticated.
 * If not, we'd redirect to /(auth)/login.
 */
export default function AppLayout() {
  const router = useRouter();
  const isAuthenticated = true; // Placeholder for actual auth check

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated]);

  return <Slot />;
}
