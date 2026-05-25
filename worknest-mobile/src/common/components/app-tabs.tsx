import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Colors } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useLocalization();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="attendance" options={{ title: t('nav.attendance') }} />
      <Tabs.Screen name="requests" options={{ title: t('nav.requests') }} />
      <Tabs.Screen name="payroll" options={{ title: t('nav.payroll') }} />
      <Tabs.Screen name="announcements" options={{ title: t('nav.updates') }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const allowedRoutes = ['index', 'attendance', 'requests', 'payroll', 'announcements', 'profile'];

  const getIcon = (routeName: string, focused: boolean) => {
    switch (routeName) {
      case 'index':
        return focused ? 'home' : 'home-outline';
      case 'attendance':
        return focused ? 'time' : 'time-outline';
      case 'requests':
        return focused ? 'document-text' : 'document-text-outline';
      case 'payroll':
        return focused ? 'cash' : 'cash-outline';
      case 'announcements':
        return focused ? 'notifications' : 'notifications-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return t('nav.home');
      case 'attendance':
        return t('nav.attendance');
      case 'requests':
        return t('nav.requests');
      case 'payroll':
        return t('nav.payroll');
      case 'announcements':
        return t('nav.updates');
      case 'profile':
        return t('nav.profile');
      default:
        return routeName;
    }
  };

  // Filter routes to only render the allowed five tabs in the correct order
  const routesToRender = state.routes.filter((route: any) => allowedRoutes.includes(route.name));

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {routesToRender.map((route: any) => {
        const isFocused = state.routes[state.index]?.name === route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const iconName = getIcon(route.name, isFocused);
        const label = getLabel(route.name);

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {isFocused ? (
              <LinearGradient
                colors={['#2B7FFF', '#00BBA7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activePill}
              >
                <Ionicons name={iconName as any} size={22} color="#FFFFFF" />
              </LinearGradient>
            ) : (
              <View style={styles.inactiveIconWrapper}>
                <Ionicons name={iconName as any} size={22} color="#94A3B8" />
              </View>
            )}
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.4)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activePill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inactiveIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelActive: {
    color: '#2B7FFF',
  },
  labelInactive: {
    color: '#94A3B8',
  },
});
