import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function useAppInit() {
  const [isReady, setIsReady] = useState(false);
  const [loaded, error] = useFonts({
    'SF-Pro-Display-Regular': require('../../../../assets/fonts/SF-Pro-Display-Regular.otf'),
    'SF-Pro-Display-Bold': require('../../../../assets/fonts/SF-Pro-Display-Bold.otf'),
    'SF-Pro-Display-Semibold': require('../../../../assets/fonts/SF-Pro-Display-Semibold.otf'),
    'New-York-Medium-Regular': require('../../../../assets/fonts/New-York-Medium-Regular.otf'),
    'New-York-Medium-Bold': require('../../../../assets/fonts/New-York-Medium-Bold.otf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Any additional data initialization can go here
        if (loaded || error) {
          // Add a small delay for a smooth transition from native to JS splash
          await new Promise(resolve => setTimeout(resolve, 800));
          setIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // We do *not* hide the native splash here; we'll hide it once the JS splash page is mounted.
        // Or we can hide it here if we want index.tsx to take over immediately.
        if (loaded || error) {
          await SplashScreen.hideAsync();
        }
      }
    }
    prepare();
  }, [loaded, error]);

  return { isReady, loaded, error };
}
