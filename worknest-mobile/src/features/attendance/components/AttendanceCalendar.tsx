import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts, Spacing, Colors } from '@/common/constants/theme';

export function AttendanceCalendar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Mock calendar data
  const calendarDays = [
    { day: 1, status: 'present' }, { day: 2, status: 'present' }, { day: 3, status: 'late' }, 
    { day: 4, status: 'none' }, { day: 5, status: 'absent' }, { day: 6, status: 'none' }, { day: 7, status: 'none' },
    { day: 8, status: 'present' }, { day: 9, status: 'present' }, { day: 10, status: 'present' }, 
    { day: 11, status: 'none' }, { day: 12, status: 'present' }, { day: 13, status: 'none' }, { day: 14, status: 'none' },
    { day: 15, status: 'present' }, { day: 16, status: 'late' }, { day: 17, status: 'present' }, 
    { day: 18, status: 'none' }, { day: 19, status: 'none' }, { day: 20, status: 'none' }, { day: 21, status: 'none' },
    { day: 22, status: 'holidays' }, { day: 23, status: 'holidays' }, { day: 24, status: 'holidays' }, 
    { day: 25, status: 'holidays' }, { day: 26, status: 'none' }, { day: 27, status: 'none' }, { day: 28, status: 'none' },
    { day: 29, status: 'none' }, { day: 30, status: 'none' }, { day: 31, status: 'none' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return '#00C950';
      case 'late': return '#FFB020';
      case 'absent': return '#FF383C';
      case 'holidays': return '#2B7FFF';
      default: return 'transparent';
    }
  };

  return (
    <ThemedView style={[styles.container, isDark && styles.containerDark]}>
      <ThemedText style={styles.monthTitle}>March 2026</ThemedText>
      
      <View style={styles.daysHeader}>
        {daysOfWeek.map((day, idx) => (
          <ThemedText key={idx} style={styles.dayLabel}>{day}</ThemedText>
        ))}
      </View>

      <View style={styles.datesGrid}>
        {calendarDays.map((item, idx) => (
          <View key={idx} style={styles.dateCell}>
            <ThemedText style={styles.dateText}>{item.day}</ThemedText>
            <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
        ))}
      </View>

      <View style={styles.legendContainer}>
        <LegendItem color="#00C950" label="Present" />
        <LegendItem color="#FFB020" label="Late" />
        <LegendItem color="#FF383C" label="Absent" />
        <LegendItem color="#2B7FFF" label="Holidays" />
      </View>
    </ThemedView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <ThemedText style={styles.legendLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.eight,
    padding: Spacing.four,
    borderRadius: 24,
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#E8F0F8',
    paddingBottom: Spacing.six,
  },
  containerDark: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
  },
  monthTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 18,
    marginBottom: Spacing.four,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  dayLabel: {
    width: 30,
    textAlign: 'center',
    color: '#A0A0A0',
    fontFamily: Fonts.sf.medium,
    fontSize: 12,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dateCell: {
    width: '14.28%', // 100 / 7
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  dateText: {
    fontFamily: Fonts.sf.medium,
    fontSize: 14,
    marginBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: Spacing.four,
    paddingTop: Spacing.four,
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
    borderRadius: 4,
    marginRight: Spacing.one,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666666',
  },
});
