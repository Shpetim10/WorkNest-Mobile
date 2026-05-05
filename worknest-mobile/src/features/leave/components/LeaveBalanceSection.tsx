import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import type { LeaveBalanceDto } from '../types';
import { LeaveBalanceCard } from './LeaveBalanceCard';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VACATION: 'Vacation',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal',
};

interface LeaveBalanceSectionProps {
  balances: LeaveBalanceDto[];
}

export function LeaveBalanceSection({ balances }: LeaveBalanceSectionProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>YOUR BALANCE</ThemedText>
      <View style={styles.cardsContainer}>
        {balances.map((balance) => (
          <View key={balance.leaveType} style={styles.cardWrapper}>
            <LeaveBalanceCard
              title={LEAVE_TYPE_LABELS[balance.leaveType] ?? balance.leaveType}
              value={balance.availableDays}
              type={balance.leaveType}
            />
          </View>
        ))}
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
  cardsContainer: {
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 16,
  },
});