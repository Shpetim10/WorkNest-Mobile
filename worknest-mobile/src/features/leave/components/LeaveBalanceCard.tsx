import { Umbrella, Stethoscope, User, Heart, Ban, HelpCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { LeaveType } from '../types';

interface LeaveBalanceCardProps {
  title: string;
  value: number | string;
  type?: LeaveType;
}

export function LeaveBalanceCard({ title, value, type = 'VACATION' }: LeaveBalanceCardProps) {
  const getIconConfig = () => {
    switch (type) {
      case 'SICK':
        return { icon: <Stethoscope size={20} color="#B91C1C" />, bgColor: '#FEE2E2' };
      case 'PERSONAL':
        return { icon: <User size={20} color="#7E22CE" />, bgColor: '#F3E8FF' };
      case 'UNPAID':
        return { icon: <Ban size={20} color="#6B7280" />, bgColor: '#F3F4F6' };
      case 'MATERNITY':
        return { icon: <Heart size={20} color="#DB2777" />, bgColor: '#FCE7F3' };
      case 'PATERNITY':
        return { icon: <Heart size={20} color="#2563EB" />, bgColor: '#DBEAFE' };
      case 'OTHER':
        return { icon: <HelpCircle size={20} color="#6B7280" />, bgColor: '#F3F4F6' };
      case 'VACATION':
      default:
        return { icon: <Umbrella size={20} color="#0369A1" />, bgColor: '#DBEAFE' };
    }
  };

  const { icon: typeIcon, bgColor: iconBg } = getIconConfig();

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            {typeIcon}
          </View>
          <View style={styles.textBlock}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle}>Available days</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.value}>{value}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    height: 91,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 21,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
    color: '#1E2939',
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    lineHeight: 18,
    color: '#6A7282',
    marginTop: 2,
  },
  value: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 36,
    color: '#1E2939',
    textAlign: 'right',
  },
});