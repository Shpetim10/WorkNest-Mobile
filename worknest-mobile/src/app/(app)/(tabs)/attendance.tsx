import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { 
  AttendanceHeader, 
  ClockInOutCard, 
  TodaysRecords, 
  AttendanceCalendar 
} from '@/features/attendance';
import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';

export default function AttendanceScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <AttendanceHeader />
        <View style={styles.content}>
          <ClockInOutCard />
          <TodaysRecords />
          <AttendanceCalendar />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light grey background
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 45,
    marginHorizontal: Spacing.four,
    marginTop: -60, // Strong overlap with the rounded header
    paddingBottom: Spacing.six,
    paddingTop: Spacing.two,
    // Fancy shadow/glow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
});
