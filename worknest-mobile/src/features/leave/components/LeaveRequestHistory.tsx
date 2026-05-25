import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { LeaveRequestDto } from '../types';
import { LeaveRequestCard } from './LeaveRequestCard';

interface LeaveRequestHistoryProps {
  history: LeaveRequestDto[];
  onCancel?: (id: string) => void;
}

export function LeaveRequestHistory({ history, onCancel }: LeaveRequestHistoryProps) {
  const { t } = useLocalization();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>{t('requests.requestHistory')}</ThemedText>
      <View style={styles.list}>
        {history.length > 0 ? (
          history.map((request) => (
            <LeaveRequestCard key={request.id} request={request} onCancel={onCancel} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>{t('requests.noHistory')}</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    color: '#6A7282',
    marginBottom: Spacing.three,
  },
  list: {
    paddingBottom: Spacing.four,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  emptyText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#94A3B8',
  },
});
