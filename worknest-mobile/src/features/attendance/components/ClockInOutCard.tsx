import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

export function ClockInOutCard() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleToggle = () => {
    setIsClockedIn((prev) => !prev);
  };

  const gradientColors = isClockedIn
    ? ['#FF383C', 'rgba(255, 141, 40, 0.8)']
    : ['#6DE5A9', '#4CA26C'];

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={handleToggle}>
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Clock size={40} color="#FFFFFF" strokeWidth={2} />
          </View>
          <ThemedText style={styles.title}>
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isClockedIn ? 'Tap to clock out' : 'Tap to clock in'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
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
});
