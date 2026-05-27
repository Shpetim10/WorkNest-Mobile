import React from 'react';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';

export default function EmployeesScreen() {
  const { t } = useLocalization();

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">{t('employees.title')}</ThemedText>
      <ThemedText type="default">{t('employees.subtitle')}</ThemedText>
    </ThemedView>
  );
}
