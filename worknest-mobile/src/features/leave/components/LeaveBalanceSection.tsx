import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { LeaveBalanceDto } from '../types';
import { LeaveBalanceCard } from './LeaveBalanceCard';

interface LeaveBalanceSectionProps {
  balances: LeaveBalanceDto[];
}

export function LeaveBalanceSection({ balances }: LeaveBalanceSectionProps) {
  const { t } = useLocalization();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>{t('requests.yourBalance')}</ThemedText>
      <View style={styles.cardsContainer}>
        {balances.map((balance) => (
          <View key={balance.leaveType} style={styles.cardWrapper}>
            <LeaveBalanceCard balance={balance} />
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
    marginBottom: 14,
  },
});
