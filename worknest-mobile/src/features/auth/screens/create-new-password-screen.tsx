import { BlurView } from 'expo-blur';
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
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
} from 'react-native';

import { GradientButton } from '@/common/components/gradient-button';
import { GradientIcon } from '@/common/components/gradient-icon';
import { GradientText } from '@/common/components/gradient-text';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useTheme } from '@/common/hooks/use-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CreateNewPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdate = () => {
    // Basic validation
    if (newPassword.length >= 8 && newPassword === confirmPassword) {
      console.log('Password updated successfully');
      router.replace('/(auth)/password-success' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Shadow Glows */}
      <View style={styles.backgroundContainer}>
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['#BEDBFF4D', '#96F7E44D']}
            locations={[0.3, 0.7]}
            style={styles.upperGlow}
          />
          <LinearGradient
            colors={['#E9D4FF33', '#FCCEE833']}
            locations={[0.2, 0.8]}
            style={styles.bottomGlow}
          />
        </View>
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
                Icon={Lock} 
                size={74} 
                style={styles.mainIcon} 
              />

              <View style={styles.titleContainer}>
                <GradientText 
                  text="Create New Password" 
                  style={styles.title} 
                />
                <ThemedText style={styles.subtitle}>
                  Enter your new password below
                </ThemedText>
              </View>

              {/* Input Area */}
              <View style={styles.inputArea}>
                <ThemedText style={styles.inputLabel}>New Password</ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>

                <View style={{ height: Spacing.three }} />

                <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Rules Box */}
              <View style={styles.rulesBox}>
                <ThemedText style={styles.rulesTitle}>Password must:</ThemedText>
                <View style={styles.ruleRow}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.ruleText}>Be at least 8 characters long</ThemedText>
                </View>
                <View style={styles.ruleRow}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.ruleText}>Match in both fields</ThemedText>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton 
                  title="Update Password" 
                  onPress={handleUpdate} 
                />
              </View>
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
    shadowColor: '#2B7FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
  },
  inputArea: {
    width: '100%',
    marginBottom: Spacing.four,
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
  input: {
    flex: 1,
    marginLeft: Spacing.two,
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#1E293B',
  },
  rulesBox: {
    width: '100%',
    backgroundColor: '#F1F7FF',
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  rulesTitle: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#475569',
    marginBottom: Spacing.two,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: Spacing.two,
  },
  ruleText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#64748B',
  },
  buttonContainer: {
    width: '100%',
  },
});
