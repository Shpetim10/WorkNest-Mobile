import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

const CIRCLE_CHECK_SVG = require('../../../assets/icons/circle-check.svg');

interface SuccessIconProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Specialized Success Icon using the designer-provided SVG asset.
 * Features a circular green gradient and dual-layer shadows.
 */
export function SuccessIcon({ size = 84, style }: SuccessIconProps) {
  const shadowColor = '#00C950';

  return (
    <View style={[styles.shadowContainer2, { shadowColor }]}>
      <View style={[styles.shadowContainer1, { shadowColor }]}>
        <LinearGradient
          colors={['#05DF72', '#00BC7D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }, 
            style
          ]}
        >
          <Image 
            source={CIRCLE_CHECK_SVG}
            style={{ width: size * 0.6, height: size * 0.6 }}
            contentFit="contain"
          />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer1: {
    // Figma Drop shadow 1: X: 0, Y: 4, Blur: 6, Spread: -4
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowContainer2: {
    // Figma Drop shadow 2: X: 0, Y: 10, Blur: 15, Spread: -3
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 7.5,
    elevation: 4,
  },
});
