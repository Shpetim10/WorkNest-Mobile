import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LeaveBalance } from '../types';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { Spacing } from '@/common/constants/theme';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';

interface LeaveBalanceSectionProps {
  balances: LeaveBalance[];
}

export function LeaveBalanceSection({ balances }: LeaveBalanceSectionProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>YOUR BALANCE</ThemedText>
      <View style={styles.cardsContainer}>
        {balances.map((balance) => (
          <View key={balance.type} style={styles.cardWrapper}>
            <LeaveBalanceCard 
              title={balance.label} 
              value={balance.available} 
              type={balance.type as any}
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
