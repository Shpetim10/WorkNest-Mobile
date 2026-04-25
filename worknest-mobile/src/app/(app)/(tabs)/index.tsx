import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/common/components/animated-icon';
import { HintRow } from '@/common/components/hint-row';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { WebBadge } from '@/common/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/common/constants/theme';
import { clearPersistedSessionArtifacts } from '@/common/storage/secure-session-storage';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { useLogoutMutation } from '@/features/auth';
import { logoutCompleted } from '@/features/auth';
import { useRouter } from 'expo-router';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const auth = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    const refreshToken = auth.refreshToken;
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } finally {
      await clearPersistedSessionArtifacts();
      dispatch(logoutCompleted());
      router.replace('/login' as any);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
          <HintRow
            title="Workspace"
            hint={<ThemedText type="small">{auth.tenantContext?.companyName ?? 'N/A'}</ThemedText>}
          />
          <HintRow
            title="Role Assignment"
            hint={<ThemedText type="small">{auth.activeRoleAssignmentId ?? 'N/A'}</ThemedText>}
          />
        </ThemedView>

        <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut}>
          <ThemedText type="link">{isLoggingOut ? 'Signing out...' : 'Sign out'}</ThemedText>
        </TouchableOpacity>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
