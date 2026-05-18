import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DollarSign } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { Payslip } from '../types/payroll.types';

interface PayslipCardProps {
  payslip: Payslip;
  onPress: () => void;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function PayslipCard({ payslip, onPress }: PayslipCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <DollarSign size={22} color="#00BBA7" strokeWidth={2.5} />
        </View>
        <View style={styles.periodInfo}>
          <ThemedText style={styles.periodName}>{payslip.periodName}</ThemedText>
          <ThemedText style={styles.periodDate}>{payslip.periodDate}</ThemedText>
        </View>
        <View style={styles.salaryInfo}>
          <ThemedText style={styles.netAmount}>{formatCurrency(payslip.netSalary)}</ThemedText>
          <ThemedText style={styles.netLabel}>Net Salary</ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <ThemedText style={styles.summaryText}>Gross: {formatCurrency(payslip.grossSalary)}</ThemedText>
        <ThemedText style={styles.summaryText}>Deductions: {formatCurrency(payslip.totalDeductions)}</ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  periodInfo: {
    flex: 1,
  },
  periodName: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2939',
    marginBottom: 2,
  },
  periodDate: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
    lineHeight: 18,
  },
  salaryInfo: {
    alignItems: 'flex-end',
  },
  netAmount: {
    fontFamily: Fonts.sf.bold,
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2939',
  },
  netLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#6A7282',
    marginTop: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    color: '#6A7282',
  },
});
