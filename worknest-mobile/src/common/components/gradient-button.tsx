import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  containerStyle?: ViewStyle;
}

export function GradientButton({
  title,
  containerStyle,
  style,
  ...rest
}: GradientButtonProps) {
  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <TouchableOpacity activeOpacity={0.8} {...rest}>
        <LinearGradient
          colors={['#2B7FFF', '#00BBA7']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.gradient, style as ViewStyle]}
        >
          <ThemedText style={styles.text}>{title}</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    // Shadow / Glow effect
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8, // For Android
  },
  gradient: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
