import React from 'react';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';

export default function EmployeesScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Employees</ThemedText>
      <ThemedText type="default">Manage your workforce here.</ThemedText>
    </ThemedView>
  );
}
