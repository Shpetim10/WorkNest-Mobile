import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';

import { GradientText } from '@/common/components/gradient-text';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { LoginForm } from '@/features/auth/components/login-form';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoginScreen() {
  const { t } = useLocalization();
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
                text={t('auth.welcomeBack')} 
                style={styles.title} 
              />
              <ThemedText style={styles.subtitle}>{t('auth.signInToContinue')}</ThemedText>
            </View>

            <LoginForm />
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
    height: SCREEN_HEIGHT * 0.38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,    // nudges logo up from the white card edge
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  logo: {
    width: '70%',
    aspectRatio: 230 / 164,
    alignSelf: 'center',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  titlesContainer: {
    marginBottom: Spacing.four,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 32,
    lineHeight: 40,
    color: '#1E293B',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#64748B',
  },
});