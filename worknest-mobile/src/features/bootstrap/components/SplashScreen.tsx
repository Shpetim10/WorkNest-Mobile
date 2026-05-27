import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Dimensions, PixelRatio, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_VISUAL_CENTER_OFFSET_RATIO = 9.5 / 230;
const LOGO_WIDTH = PixelRatio.roundToNearestPixel(Math.min(SCREEN_WIDTH * 0.68, 280));
const LOGO_TRANSLATE_X = PixelRatio.roundToNearestPixel(
  -LOGO_WIDTH * LOGO_VISUAL_CENTER_OFFSET_RATIO
);

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#ECFDF5']}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.logoGlow}>
        <View style={styles.logoFrame}>
          <Image
            source={require('@/assets/logos/svg/1.svg')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  logoGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  logoFrame: {
    width: LOGO_WIDTH,
    aspectRatio: 230 / 164,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: LOGO_TRANSLATE_X }],
  },
  logo: {
    width: LOGO_WIDTH,
    aspectRatio: 230 / 164,
  },
});
