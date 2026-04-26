import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts, Spacing, Colors } from '@/common/constants/theme';
import { useColorScheme } from 'react-native';

export function TodaysRecords() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Calendar size={20} color="#2B7FFF" />
        <ThemedText style={styles.title}>Today's Records</ThemedText>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <CheckCircle2 size={18} color="#00C950" />
          <ThemedText style={styles.recordLabel}>Clock In</ThemedText>
        </View>
        <ThemedText style={styles.recordTime}>09:15 AM</ThemedText>
      </View>
      
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <XCircle size={18} color="#A0A0A0" />
          <ThemedText style={[styles.recordLabel, { color: '#A0A0A0' }]}>Clock Out</ThemedText>
        </View>
        <ThemedText style={styles.recordTime}>--:--</ThemedText>
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
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
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
    fontFamily: Fonts.sf.medium,
    fontSize: 14,
    marginLeft: Spacing.two,
    color: '#666666',
  },
  recordTime: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
  },
});
