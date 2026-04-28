import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts, Spacing, Colors } from '@/common/constants/theme';
import type { AttendanceDayRecord } from '@/features/attendance/types/contracts';

interface TodaysRecordsProps {
  record: AttendanceDayRecord | null;
  timezone?: string | null;
}

function formatTime(value: string | null, timezone?: string | null) {
  if (!value) {
    return '--:--';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone ?? undefined,
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleTimeString();
  }
}

export function TodaysRecords({ record, timezone }: TodaysRecordsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const clockInTime = formatTime(record?.clockInTime ?? null, timezone);
  const clockOutTime = formatTime(record?.clockOutTime ?? null, timezone);

  return (
    <ThemedView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Calendar size={20} color="#2B7FFF" />
        <ThemedText style={styles.title}>Today Records</ThemedText>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <CheckCircle2 size={18} color="#00C950" />
          <ThemedText style={styles.recordLabel}>Clock In</ThemedText>
        </View>
        <ThemedText style={styles.recordTime}>{clockInTime}</ThemedText>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <XCircle size={18} color={record?.clockOutTime ? '#00C950' : '#A0A0A0'} />
          <ThemedText style={[styles.recordLabel, !record?.clockOutTime && { color: '#A0A0A0' }]}>
            Clock Out
          </ThemedText>
        </View>
        <ThemedText style={styles.recordTime}>{clockOutTime}</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Day Status</ThemedText>
        <ThemedText style={styles.metaValue}>{record?.dayStatus ?? 'N/A'}</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Worked Minutes</ThemedText>
        <ThemedText style={styles.metaValue}>{record?.workedMinutes ?? 0}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: 24,
    backgroundColor: '#F9FBFF', // Very light blue-ish white
    borderWidth: 1,
    borderColor: '#E8F0F8',
  },
  containerDark: {
    backgroundColor: Colors.dark.backgroundElement,
    borderColor: Colors.dark.backgroundSelected,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    marginLeft: Spacing.two,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordLabel: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    marginLeft: Spacing.two,
    color: '#666666',
  },
  recordTime: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
  },
  metaRow: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontFamily: Fonts.sf.semibold,
    color: '#64748B',
    fontSize: 13,
  },
  metaValue: {
    fontFamily: Fonts.sf.bold,
    fontSize: 13,
  },
});
