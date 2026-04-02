import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'SF-Pro-Display-Regular': require('../../assets/fonts/SF-Pro-Display-Regular.otf'),
    'SF-Pro-Display-Bold': require('../../assets/fonts/SF-Pro-Display-Bold.otf'),
    'SF-Pro-Display-Semibold': require('../../assets/fonts/SF-Pro-Display-Semibold.otf'),
    'New-York-Medium-Regular': require('../../assets/fonts/New-York-Medium-Regular.otf'),
    'New-York-Medium-Bold': require('../../assets/fonts/New-York-Medium-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}
