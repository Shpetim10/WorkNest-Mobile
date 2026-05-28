import { Heart, HelpCircle, Stethoscope, Umbrella } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { LeaveBalanceDto } from '../types';

interface LeaveBalanceCardProps {
  balance: LeaveBalanceDto;
}

const CARD_CONFIG = {
  VACATION: {
    icon: (size: number) => <Umbrella size={size} color="#1D4ED8" />,
    gradient: ['#EFF6FF', '#DBEAFE'] as [string, string],
    iconBg: '#BFDBFE',
    accentColor: '#2B7FFF',
    borderColor: '#BFDBFE',
  },
  SICK: {
    icon: (size: number) => <Stethoscope size={size} color="#B91C1C" />,
    gradient: ['#FFF5F5', '#FEE2E2'] as [string, string],
    iconBg: '#FECACA',
    accentColor: '#EF4444',
    borderColor: '#FECACA',
  },
  PARENTAL: {
    icon: (size: number) => <Heart size={size} color="#9D174D" />,
    gradient: ['#FDF2F8', '#FCE7F3'] as [string, string],
    iconBg: '#F9A8D4',
    accentColor: '#DB2777',
    borderColor: '#F9A8D4',
  },
};

const DEFAULT_CARD_CONFIG = {
  icon: (size: number) => <HelpCircle size={size} color="#475569" />,
  gradient: ['#F8FAFC', '#E2E8F0'] as [string, string],
  iconBg: '#CBD5E1',
  accentColor: '#64748B',
  borderColor: '#CBD5E1',
};

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const { t } = useLocalization();
  const config = CARD_CONFIG[balance.leaveType as keyof typeof CARD_CONFIG] ?? DEFAULT_CARD_CONFIG;

  const usedDays = Number.isFinite(Number(balance.usedDays)) ? Number(balance.usedDays) : 0;
  const maxPaid = Number.isFinite(Number(balance.maxCompanyPaidDays ?? balance.totalDays))
    ? Number(balance.maxCompanyPaidDays ?? balance.totalDays)
    : 0;
  const companyUsed = Math.min(usedDays, maxPaid);
  const extraDays = balance.leaveType === 'VACATION' ? Math.max(0, usedDays - maxPaid) : 0;
  const socialSecurityDays = balance.leaveType !== 'VACATION' ? Math.max(0, usedDays - maxPaid) : 0;
  const progressPct = maxPaid > 0 ? Math.min(100, Math.round((companyUsed / maxPaid) * 100)) : 0;

  const typeLabel = {
    VACATION: t('requests.vacation'),
    SICK: t('requests.sickLeave'),
    PARENTAL: t('requests.parental'),
  }[balance.leaveType] ?? balance.leaveType;

  return (
    <View style={[styles.wrapper, { borderColor: config.borderColor }]}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
            {config.icon(20)}
          </View>

          <View style={styles.labelsBlock}>
            <ThemedText style={styles.typeLabel}>{typeLabel}</ThemedText>
            <ThemedText style={styles.subLabel}>{t('requests.companyPaidDays')}</ThemedText>
          </View>

          <View style={styles.ratioBlock}>
            <View style={styles.ratioRow}>
              <ThemedText style={[styles.usedCount, { color: config.accentColor }]}>
                {companyUsed}
              </ThemedText>
              <ThemedText style={styles.slash}>/</ThemedText>
              <ThemedText style={styles.totalCount}>{maxPaid}</ThemedText>
            </View>
            {extraDays > 0 && (
              <ThemedText style={styles.extraDays}>
                +{extraDays} {t('requests.extraDays')}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPct}%` as any, backgroundColor: config.accentColor },
            ]}
          />
        </View>

        {/* Social security note */}
        {socialSecurityDays > 0 && (
          <ThemedText style={styles.socialNote}>
            +{socialSecurityDays} {t('requests.socialSecurityNote')}
          </ThemedText>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelsBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  typeLabel: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 16,
    color: '#1E2939',
    lineHeight: 20,
  },
  subLabel: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#6A7282',
    marginTop: 2,
    lineHeight: 16,
  },
  ratioBlock: {
    alignItems: 'flex-end',
  },
  ratioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  usedCount: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
  },
  slash: {
    fontFamily: Fonts.sf.regular,
    fontSize: 18,
    color: '#9CA3AF',
    lineHeight: 28,
    marginHorizontal: 1,
  },
  totalCount: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 18,
    color: '#9CA3AF',
    lineHeight: 28,
  },
  extraDays: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  socialNote: {
    fontFamily: Fonts.sf.regular,
    fontSize: 11,
    color: '#6A7282',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
