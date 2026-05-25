import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { AttendanceMonthDay } from '@/features/attendance/types/contracts';

interface AttendanceCalendarProps {
  monthDate: Date;
  monthDays: AttendanceMonthDay[];
  isLoading: boolean;
  onMonthChange: (offset: number) => void;
  onDayPress: (day: AttendanceMonthDay) => void;
  selectedDay: AttendanceMonthDay | null;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function statusColor(status: string): string {
  switch (status) {
    case 'PRESENT':
      return '#00C950';
    case 'LATE':
    case 'MISSING_CHECKOUT':
      return '#F59E0B';
    case 'ABSENT':
    case 'FLAGGED':
      return '#EF4444';
    case 'HALF_DAY':
      return '#EAB308';
    case 'ON_LEAVE':
    case 'HOLIDAY':
      return '#3B82F6';
    case 'PENDING_REVIEW':
      return '#94A3B8';
    default:
      return 'transparent';
  }
}

export function AttendanceCalendar({
  monthDate,
  monthDays,
  isLoading,
  onMonthChange,
  onDayPress,
  selectedDay,
}: AttendanceCalendarProps) {
  const { t } = useLocalization();
  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
      }).format(monthDate),
    [monthDate]
  );

  const dayMap = useMemo(() => {
    const map = new Map<string, AttendanceMonthDay>();
    monthDays.forEach((day) => map.set(day.date, day));
    return map;
  }, [monthDays]);

  const cells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: { key: string; dayNumber: number | null; payload: AttendanceMonthDay | null }[] = [];

    for (let i = 0; i < firstDay; i += 1) {
      result.push({ key: `spacer-${i}`, dayNumber: null, payload: null });
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      const isoDate = new Date(Date.UTC(year, month, dayNumber)).toISOString().slice(0, 10);
      result.push({
        key: isoDate,
        dayNumber,
        payload: dayMap.get(isoDate) ?? null,
      });
    }

    return result;
  }, [dayMap, monthDate]);

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.monthButton} onPress={() => onMonthChange(-1)}>
          <ChevronLeft size={18} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthTitle}</Text>
        <TouchableOpacity style={styles.monthButton} onPress={() => onMonthChange(1)}>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysHeader}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Text key={`weekday-${index}-${day}`} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.datesGrid}>
        {cells.map((cell) =>
          cell.dayNumber ? (
            <TouchableOpacity
              key={cell.key}
              style={[
                styles.dateCell,
                selectedDay?.date === cell.payload?.date ? styles.dateCellSelected : undefined,
              ]}
              onPress={() => cell.payload && onDayPress(cell.payload)}
              disabled={!cell.payload}
            >
              <Text style={styles.dateText}>{cell.dayNumber}</Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: cell.payload ? statusColor(cell.payload.dayStatus) : 'transparent' },
                ]}
              />
            </TouchableOpacity>
          ) : (
            <View key={cell.key} style={styles.dateCell} />
          )
        )}
      </View>

      <View style={styles.legendContainer}>
        <LegendItem color="#00C950" label={t('attendance.present')} />
        <LegendItem color="#EF4444" label={t('attendance.absent')} />
        <LegendItem color="#F59E0B" label={t('attendance.late')} />
        <LegendItem color="#EAB308" label={t('attendance.halfDay')} />
        <LegendItem color="#3B82F6" label={t('attendance.leaveHoliday')} />
        <LegendItem color="#F59E0B" label={t('attendance.noCheckout')} />
        <LegendItem color="#94A3B8" label={t('attendance.pending')} />
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>{t('attendance.loadingCalendar')}</Text>
      ) : selectedDay ? (
        <View style={styles.selectedDayCard}>
          <Text style={styles.selectedDate}>{selectedDay.date}</Text>
          <Text style={styles.selectedInfo}>{t('attendance.status')}: {selectedDay.dayStatus}</Text>
          <Text style={styles.selectedInfo}>{t('attendance.workedMinutes')}: {selectedDay.workedMinutes}</Text>
        </View>
      ) : null}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.six,
    padding: Spacing.four,
    paddingBottom: Spacing.four,
    borderRadius: 24,
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#E8F0F8',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 18,
    color: '#1E293B',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    color: '#A0A0A0',
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: Spacing.one,
  },
  dateCellSelected: {
    backgroundColor: '#EFF6FF',
  },
  dateText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    marginBottom: 3,
    color: '#1E293B',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginRight: Spacing.one,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666666',
  },
  loadingText: {
    marginTop: Spacing.two,
    color: '#64748B',
    fontFamily: Fonts.sf.semibold,
  },
  selectedDayCard: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  selectedDate: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    color: '#1E293B',
  },
  selectedInfo: {
    fontFamily: Fonts.sf.semibold,
    color: '#475569',
    fontSize: 13,
  },
});
