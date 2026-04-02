import { BlurView } from 'expo-blur';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { GradientButton } from '@/common/components/gradient-button';
import { GradientIcon } from '@/common/components/gradient-icon';
import { BoldTitle } from '@/common/components/bold-title';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useTheme } from '@/common/hooks/use-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ResetPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);

  const handleReset = () => {
    if (email.trim()) {
      console.log('Sending reset link to:', email);
      router.replace('/(auth)/email-sent' as any);
    } else {
      setError(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Shadow Glows */}
      <View style={styles.backgroundContainer}>
        <View style={StyleSheet.absoluteFill}>
          {/* Upper Glow */}
          <LinearGradient
            colors={['#BEDBFF4D', '#96F7E44D']}
            locations={[0.3, 0.7]}
            style={styles.upperGlow}
          />
          {/* Bottom Glow */}
          <LinearGradient
            colors={['#E9D4FF33', '#FCCEE833']}
            locations={[0.2, 0.8]}
            style={styles.bottomGlow}
          />
        </View>
        {/* Blur overlay to achieve the "Blur 128" effect */}
        <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="light" />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          {/* Back Navigation */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#1E293B" />
            <ThemedText style={styles.backText}>Back to Login</ThemedText>
          </TouchableOpacity>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Card Content */}
            <View style={styles.card}>
              <GradientIcon 
                Icon={Mail} 
                size={74} 
                style={styles.mainIcon} 
              />

              <View style={styles.titleContainer}>
                <BoldTitle 
                  text="Reset your password" 
                  style={styles.title} 
                />
                <ThemedText style={styles.subtitle}>
                  We will send a reset link to your email
                </ThemedText>
              </View>

              {/* Input Area */}
              <View style={styles.inputArea}>
                <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
                <View style={[
                  styles.inputWrapper,
                  error && styles.inputWrapperError
                ]}>
                  <Mail size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@company.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError(false);
                    }}
                  />
                </View>
                {error && (
                  <ThemedText style={styles.errorText}>
                    * Please enter your email address
                  </ThemedText>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton 
                  title="Send Reset Link" 
                  onPress={handleReset} 
                />
              </View>

              <ThemedText style={styles.footerText}>
                The reset link will be valid for 24 hours
              </ThemedText>
            </View>
          </KeyboardAvoidingView>
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: Spacing.one,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 40,
    padding: Spacing.five,
    width: '100%',
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    alignItems: 'center',
  },
  mainIcon: {
    marginBottom: Spacing.four,
    // Shadow / Elevation for the icon card
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputArea: {
    width: '100%',
    marginBottom: Spacing.five,
  },
  inputLabel: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.two,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    height: 58,
    backgroundColor: '#FBFDFF',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    marginLeft: Spacing.two,
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.sf.regular,
    marginTop: Spacing.one,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.four,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.sf.regular,
  },
});
