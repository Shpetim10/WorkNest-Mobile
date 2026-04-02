import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import { EmailSentIcon } from '@/common/components/email-sent-icon';
import { BoldTitle } from '@/common/components/bold-title';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function EmailSentScreen() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect back to login after 5 seconds to give time to read
    const timer = setTimeout(() => {
      router.replace('/(auth)/login' as any);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Background Shadow Glows (Custom Theme) */}
      <View style={styles.backgroundContainer}>
        <View style={StyleSheet.absoluteFill}>
          {/* Upper Glow (Figma: #BEDBFF 30% and #96F7E4 30%) */}
          <LinearGradient
            colors={['#BEDBFF4D', '#96F7E44D']}
            locations={[0.3, 0.7]}
            style={styles.upperGlow}
          />
          {/* Bottom Glow (Standard brand palette) */}
          <LinearGradient
            colors={['#E9D4FF33', '#FCCEE833']}
            locations={[0.2, 0.8]}
            style={styles.bottomGlow}
          />
        </View>
        <BlurView intensity={128} style={StyleSheet.absoluteFill} tint="light" />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          <View style={styles.card}>
            {/* Themed Email Sent Icon */}
            <EmailSentIcon 
              size={84} 
              style={styles.mainIcon} 
            />

            <View style={styles.contentContainer}>
              <BoldTitle 
                text="Email Sent Successfully!" 
                style={styles.title} 
              />
              
              <ThemedText style={styles.subtitle}>
                We’ve sent you a password reset link. Please check your email and follow the instructions to continue.
              </ThemedText>

              <View style={styles.statusBox}>
                <ThemedText style={styles.statusText}>
                  Redirecting to login...
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  upperGlow: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 40,
    padding: Spacing.six,
    width: '100%',
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    alignItems: 'center',
  },
  mainIcon: {
    marginBottom: Spacing.six,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.six,
  },
  statusBox: {
    marginTop: Spacing.two,
  },
  statusText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
