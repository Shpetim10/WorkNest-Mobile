import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarDays, ChevronRight } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { PayrollPeriodOption, PayrollStatus } from '../types/payroll.types';
import { formatPayrollStatus } from '../utils/payroll-formatters';

interface PayslipCardProps {
  period: PayrollPeriodOption;
  onPress: () => void;
}

function statusBadgeColors(status: PayrollStatus): { bg: string; text: string } {
  switch (status) {
    case 'PAID': return { bg: '#DCFCE7', text: '#166534' };
    case 'FINALIZED': return { bg: '#D1FAE5', text: '#065F46' };
    case 'APPROVED': return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'CALCULATED': return { bg: '#EDE9FE', text: '#5B21B6' };
    default: return { bg: '#F1F5F9', text: '#475569' };
  }
}

function formatNetPay(netPay: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(netPay);
  } catch {
    return `${currency} ${netPay.toFixed(2)}`;
  }
}

export function PayslipCard({ period, onPress }: PayslipCardProps) {
  const badgeColors = period.status ? statusBadgeColors(period.status) : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <CalendarDays size={22} color="#0F766E" strokeWidth={2.25} />
        </View>

        <View style={styles.periodInfo}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.periodName}>{period.label}</ThemedText>
            {period.isCurrentMonth ? (
              <View style={styles.currentBadge}>
                <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
              </View>
            ) : null}
            {period.status && badgeColors ? (
              <View style={[styles.statusBadge, { backgroundColor: badgeColors.bg }]}>
                <ThemedText style={[styles.statusBadgeText, { color: badgeColors.text }]}>
                  {formatPayrollStatus(period.status)}
                </ThemedText>
              </View>
            ) : null}
          </View>
          {period.netPay != null && period.currency ? (
            <ThemedText style={styles.netPayText}>
              Net pay: {formatNetPay(period.netPay, period.currency)}
            </ThemedText>
          ) : (
            <ThemedText style={styles.periodDate}>
              Tap to view your payroll breakdown and download the payslip PDF.
            </ThemedText>
          )}
        </View>

        <ChevronRight size={20} color="#94A3B8" strokeWidth={2.25} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  periodInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  periodName: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2939',
  },
  currentBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#1D4ED8',
  },
  periodDate: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
  },
  netPayText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
    color: '#059669',
    lineHeight: 18,
  },
});
