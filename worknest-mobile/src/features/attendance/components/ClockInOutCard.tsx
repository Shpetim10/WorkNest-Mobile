import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, QrCode } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
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
  const isClockOut = actionLabel.toUpperCase().includes('OUT');
  const gradientColors = isClockOut
    ? ['#FF383C', 'rgba(255, 141, 40, 0.8)']
    : ['#6DE5A9', '#4CA26C'];

  return (
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
          <ThemedText style={styles.title}>
            {actionLabel}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {busy ? 'Submitting attendance...' : actionHint}
          </ThemedText>
          {busy ? <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} /> : null}
          <View style={styles.metaRow}>
            {siteName ? <MetaPill icon="site" text={siteName} /> : null}
            {workDate ? <MetaPill icon="date" text={workDate} /> : null}
          </View>
          <View style={styles.metaRow}>
            {qrRequired ? <MetaPill icon="qr" text="QR required" /> : null}
            {locationRequired ? <MetaPill icon="gps" text="GPS required" /> : null}
          </View>
          {blockReasonMessage ? <ThemedText style={styles.blockedText}>{blockReasonMessage}</ThemedText> : null}
          {warnings.length > 0 ? <ThemedText style={styles.warningText}>{warnings[0].message}</ThemedText> : null}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function MetaPill({ icon, text }: { icon: 'site' | 'date' | 'qr' | 'gps'; text: string }) {
  return (
    <View style={styles.metaPill}>
      {icon === 'qr' ? <QrCode size={12} color="#FFFFFF" /> : null}
      {icon === 'gps' ? <MapPin size={12} color="#FFFFFF" /> : null}
      {icon === 'site' ? <MapPin size={12} color="#FFFFFF" /> : null}
      {icon === 'date' ? <Clock size={12} color="#FFFFFF" /> : null}
      <ThemedText style={styles.metaText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
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
    fontWeight: '700', // Explicitly set weight
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  metaText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
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
});
