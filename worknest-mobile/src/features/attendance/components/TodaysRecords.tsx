import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react-native';

import { Fonts, Spacing } from '@/common/constants/theme';
import type { AttendanceDayRecord } from '@/features/attendance/types/contracts';

interface TodaysRecordsProps {
  record: AttendanceDayRecord | null;
  timezone?: string | null;
  clockIn?: string | null;
  clockOut?: string | null;
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

export function TodaysRecords({ record, timezone, clockIn, clockOut }: TodaysRecordsProps) {
  const effectiveClockIn = record?.firstCheckInAt ?? clockIn ?? null;
  const effectiveClockOut = record?.lastCheckOutAt ?? clockOut ?? null;
  const clockInTime = formatTime(effectiveClockIn, timezone);
  const clockOutTime = formatTime(effectiveClockOut, timezone);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color="#2B7FFF" />
        <Text style={styles.title}>Today Records</Text>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <CheckCircle2 size={18} color="#00C950" />
          <Text style={styles.recordLabel}>Clock In</Text>
        </View>
        <Text style={styles.recordTime}>{clockInTime}</Text>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <XCircle size={18} color={effectiveClockOut ? '#00C950' : '#A0A0A0'} />
          <Text style={[styles.recordLabel, !effectiveClockOut && { color: '#A0A0A0' }]}>
            Clock Out
          </Text>
        </View>
        <Text style={styles.recordTime}>{clockOutTime}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Day Status</Text>
        <Text style={styles.metaValue}>{record?.dayStatus ?? 'N/A'}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Worked Minutes</Text>
        <Text style={styles.metaValue}>{record?.workedMinutes ?? 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: 24,
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#E8F0F8',
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
    color: '#1E293B',
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
    color: '#1E293B',
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
    color: '#1E293B',
  },
});
