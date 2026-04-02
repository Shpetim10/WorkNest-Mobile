import React from 'react';
import { StyleSheet, Image, View, useColorScheme } from 'react-native';

export function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#FFFFFF' : '#FFFFFF' }]}>
      <Image
        source={require('../../../../assets/logos/png/3.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
      width: 500,
      height: 500
  },
});
