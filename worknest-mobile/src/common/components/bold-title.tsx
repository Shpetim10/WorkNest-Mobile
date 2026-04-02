import React from 'react';
import { StyleSheet, TextProps } from 'react-native';

import { ThemedText } from './themed-text';
import { Fonts } from '@/common/constants/theme';

interface BoldTitleProps extends TextProps {
  text: string;
}

/**
 * Specialized Bold Title component for high-fidelity states.
 * Features the brand's New York font in a deep black weight.
 */
export function BoldTitle({ text, style, ...props }: BoldTitleProps) {
  return (
    <ThemedText 
      style={[styles.title, style]} 
      {...props}
    >
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 28,
    lineHeight: 36, // Increase line height for better vertical vertical metrics
    color: '#1E293B',
    textAlign: 'center',
    fontWeight: '800',
    paddingTop: 4, // Prevent top truncation on some devices
  },
});
