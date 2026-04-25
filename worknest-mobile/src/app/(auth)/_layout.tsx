import { Stack } from 'expo-router';
import React from 'react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAppSelector } from '@/common/store/hooks';
import {
  selectAuthBootstrapped,
  selectIsAuthenticated,
  selectRequiresRoleSelection,
} from '@/features/auth';

/**
 * Authentication Stack
 * Holds all auth-related screens (Login, Register, Reset).
 */
export default function AuthLayout() {
  const router = useRouter();
  const bootstrapped = useAppSelector(selectAuthBootstrapped);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const requiresRoleSelection = useAppSelector(selectRequiresRoleSelection);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated) {
      return;
    }

    if (requiresRoleSelection) {
      router.replace('/role-assignment' as any);
      return;
    }

    router.replace('/(app)' as any);
  }, [bootstrapped, isAuthenticated, requiresRoleSelection, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="role-assignment" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="create-new-password" />
      <Stack.Screen name="password-success" />
      <Stack.Screen name="session-expired" />
      <Stack.Screen name="email-sent" />
      <Stack.Screen name="link-expired" />
    </Stack>
  );
}
