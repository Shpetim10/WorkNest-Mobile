import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/common/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabTriggerLabel>Home</NativeTabTriggerLabel>
        <NativeTabTriggerIcon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="employees">
        <NativeTabTriggerLabel>Employees</NativeTabTriggerLabel>
        <NativeTabTriggerIcon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="attendance">
        <NativeTabTriggerLabel>Attendance</NativeTabTriggerLabel>
        <NativeTabTriggerIcon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// These are likely exported or should be accessed this way in some versions
const NativeTabTriggerLabel = (NativeTabs.Trigger as any).Label;
const NativeTabTriggerIcon = (NativeTabs.Trigger as any).Icon;
