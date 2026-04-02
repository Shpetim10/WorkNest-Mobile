import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface GradientIconProps {
  Icon: LucideIcon;
  size?: number;
  colors?: string[];
  style?: ViewStyle;
}

export function GradientIcon({
  Icon,
  size = 40,
  colors = ['#2B7FFF', '#00BBA7'],
  style,
}: GradientIconProps) {
  return (
    <View style={styles.shadowContainer2}>
      <View style={styles.shadowContainer1}>
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            { 
              width: size, 
              height: size, 
              borderRadius: 20, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }, 
            style
          ]}
        >
          <Icon size={size * 0.5} color="white" />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer1: {
    // Figma Drop shadow 1: X: 0, Y: 4, Blur: 6, Spread: -4
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowContainer2: {
    // Figma Drop shadow 2: X: 0, Y: 10, Blur: 15, Spread: -3
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 7.5,
    elevation: 4,
  },
});
