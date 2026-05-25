import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, QrCode } from 'lucide-react-native';

import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { AttendanceWarning } from '@/features/attendance/types/contracts';

interface ClockInOutCardProps {
  actionLabel: string;
  actionHint: string;
  disabled: boolean;
  busy: boolean;
  onPress: () => void;
  siteName: string | null;
  workDate: string | null;
  blockReasonMessage: string | null;
  warnings: AttendanceWarning[];
  qrRequired: boolean;
  locationRequired: boolean;
}

export function ClockInOutCard({
  actionLabel,
  actionHint,
  disabled,
  busy,
  onPress,
  siteName,
  workDate,
  blockReasonMessage,
  warnings,
  qrRequired,
  locationRequired,
}: ClockInOutCardProps) {
  const { t } = useLocalization();
  const isClockOut = actionLabel.toUpperCase().includes('OUT');
  const gradientColors = isClockOut
    ? ['#FF383C', 'rgba(255, 141, 40, 0.8)']
    : ['#6DE5A9', '#4CA26C'];

  const hasInfoPills = siteName || workDate || qrRequired || locationRequired;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled || busy}>
          <LinearGradient
            colors={gradientColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, (disabled || busy) && styles.cardDisabled]}
          >
            <View style={styles.iconContainer}>
              <Clock size={40} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.title}>{actionLabel}</Text>
            <Text style={styles.subtitle}>
              {busy ? t('attendance.submitting') : actionHint}
            </Text>
            {busy ? <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} /> : null}
            {blockReasonMessage ? <Text style={styles.blockedText}>{blockReasonMessage}</Text> : null}
            {warnings.length > 0 ? <Text style={styles.warningText}>{warnings[0].message}</Text> : null}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {hasInfoPills ? (
        <View style={styles.pillsRow}>
          {siteName ? <InfoPill icon="site" text={siteName} /> : null}
          {workDate ? <InfoPill icon="date" text={workDate} /> : null}
          {qrRequired ? <InfoPill icon="qr" text={t('attendance.qrRequired')} /> : null}
          {locationRequired ? <InfoPill icon="gps" text={t('attendance.gpsRequired')} /> : null}
        </View>
      ) : null}

      <Text style={styles.hintText}>
        {t('attendance.clockHint')}
      </Text>
    </View>
  );
}

function InfoPill({ icon, text }: { icon: 'site' | 'date' | 'qr' | 'gps'; text: string }) {
  return (
    <View style={styles.pill}>
      {icon === 'site' || icon === 'gps' ? <MapPin size={12} color="#475569" /> : null}
      {icon === 'qr' ? <QrCode size={12} color="#475569" /> : null}
      {icon === 'date' ? <Clock size={12} color="#475569" /> : null}
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
  },
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  cardDisabled: {
    opacity: 0.65,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
  },
  loader: {
    marginTop: Spacing.two,
  },
  blockedText: {
    color: '#FEF3C7',
    textAlign: 'center',
    marginTop: Spacing.two,
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
  },
  warningText: {
    color: '#FFF7ED',
    textAlign: 'center',
    marginTop: Spacing.two,
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    color: '#475569',
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
  },
  hintText: {
    marginTop: Spacing.two,
    textAlign: 'center',
    color: '#94A3B8',
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
  },
});
