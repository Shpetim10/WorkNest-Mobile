import { Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '@/common/store/hooks';
import {
  selectAuthBootstrapped,
  selectIsAuthenticated,
  selectRequiresRoleSelection,
} from '@/features/auth';
import { RealtimeProvider, GlobalNotificationHandler } from '@/features/realtime';
import { TrialBanner, PlanLimitBanner } from '@/features/subscription';

export default function AppLayout() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const requiresRoleSelection = useAppSelector(selectRequiresRoleSelection);
  const bootstrapped = useAppSelector(selectAuthBootstrapped);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    if (requiresRoleSelection) {
      router.replace('/role-assignment' as any);
    }
  }, [bootstrapped, isAuthenticated, requiresRoleSelection, router]);

  return (
    <RealtimeProvider>
      <GlobalNotificationHandler />
      <View style={{ flex: 1 }}>
        <PlanLimitBanner />
        <TrialBanner />
        <Slot />
      </View>
    </RealtimeProvider>
  );
}
