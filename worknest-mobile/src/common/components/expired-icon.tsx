import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

const CROSS_ICON_SVG = require('../../../assets/icons/cross-icon.svg');

interface ExpiredIconProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Specialized Expired Icon using the designer-provided SVG asset.
 * Features a circular red-orange gradient and dual-layer shadows.
 */
export function ExpiredIcon({ size = 84, style }: ExpiredIconProps) {
  const shadowColor = '#FF4B2B'; // Reddish shadow to match the theme

  return (
    <View style={[styles.shadowContainer2, { shadowColor }]}>
      <View style={[styles.shadowContainer1, { shadowColor }]}>
        <LinearGradient
          colors={['#FF4B2B', '#FF7F50']} // Red to Coral/Orange
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
            source={CROSS_ICON_SVG}
            style={{ width: size * 0.5, height: size * 0.5 }}
            contentFit="contain"
          />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer1: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowContainer2: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 7.5,
    elevation: 4,
  },
});
