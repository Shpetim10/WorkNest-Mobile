import React from 'react';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';

export default function AttendanceScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Attendance</ThemedText>
      <ThemedText type="default">Track clock-in/out and shifts.</ThemedText>
    </ThemedView>
  );
}
