import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

const EMAIL_SENT_SVG = require('../../../assets/icons/email-sent.svg');

interface EmailSentIconProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Specialized Email Sent Icon using the designer-provided SVG asset.
 * Features a circular blue gradient and dual-layer shadows.
 */
export function EmailSentIcon({ size = 84, style }: EmailSentIconProps) {
  const shadowColor = '#2B7FFF';

  return (
    <View style={[styles.shadowContainer2, { shadowColor }]}>
      <View style={[styles.shadowContainer1, { shadowColor }]}>
        <LinearGradient
          colors={['#2B7FFF', '#00BBA7']}
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
            source={EMAIL_SENT_SVG}
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
