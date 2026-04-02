import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

import { GradientButton } from '@/common/components/gradient-button';
import { GradientText } from '@/common/components/gradient-text';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useTheme } from '@/common/hooks/use-theme';
import { LoginForm } from '@/features/auth/components/login-form';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoginScreen() {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header Gradient Section */}
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/logos/svg/1.svg')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </LinearGradient>

          {/* White Card Section */}
          <View style={styles.cardContainer}>
            <View style={styles.titlesContainer}>
              <GradientText 
                text="Welcome Back" 
                style={styles.title} 
              />
              <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
            </View>

            <LoginForm />

            <View style={styles.buttonContainer}>
              <GradientButton 
                title="Login" 
                onPress={() => {
                  // Handle login
                }} 
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: SCREEN_HEIGHT * 0.40, // Increased header height to accommodate larger logo
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  logo: {
      width: '80%',      // Occupies 80% of the screen width
      aspectRatio: 1,    // Forces height to match width (keeps it square)
      alignSelf: 'center', // Centers the logo horizontally
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -60, // Higher card overlap
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six, // More padding to avoid text cut-off
    paddingBottom: Spacing.six,
  },
  titlesContainer: {
    marginBottom: Spacing.five,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 36, // Larger title
    lineHeight: 44,
    color: '#1E293B',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#64748B',
  },
  buttonContainer: {
    marginTop: Spacing.five,
  },
});
