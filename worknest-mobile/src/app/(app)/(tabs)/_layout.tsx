import React from 'react';
import { AnimatedSplashOverlay } from '@/common/components/animated-icon';
import AppTabs from '@/common/components/app-tabs';

/**
 * Tabs Layout
 * This uses the custom AppTabs component with NativeTabs.
 */
export default function TabLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}
