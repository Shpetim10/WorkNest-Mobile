import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LeaveRequest } from '../types';
import { LeaveRequestCard } from './LeaveRequestCard';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

interface LeaveRequestHistoryProps {
  history: LeaveRequest[];
}

export function LeaveRequestHistory({ history }: LeaveRequestHistoryProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>REQUEST HISTORY</ThemedText>
      <View style={styles.list}>
        {history.length > 0 ? (
          history.map((request) => (
            <LeaveRequestCard key={request.id} request={request} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No request history found.</ThemedText>
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
