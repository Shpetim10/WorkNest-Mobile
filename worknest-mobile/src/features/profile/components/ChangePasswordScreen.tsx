import { BlurView } from 'expo-blur';
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/common/components/gradient-button';
import { GradientIcon } from '@/common/components/gradient-icon';
import { BoldTitle } from '@/common/components/bold-title';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useChangePasswordMutation } from '@/features/auth/api/auth-api';
import { useAppSelector } from '@/common/store/hooks';
import { selectAuthState } from '@/features/auth/store/selectors';
import { validatePasswordPolicy } from '@/features/auth/utils/password-policy';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import { mapBackendErrorCodeToMessage } from '@/features/auth/utils/auth-error-messages';
import { useLocalization } from '@/common/localization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { userEmail } = useAppSelector(selectAuthState);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [errorText, setErrorText] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const passwordValidation = useMemo(
    () =>
      validatePasswordPolicy({
        password: newPassword,
        confirmPassword,
        email: userEmail,
        t,
      }),
    [newPassword, confirmPassword, userEmail, t]
  );

  const handlePasswordChange = async () => {
    Keyboard.dismiss();

    // 1. Validation for empty fields
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorText(t('profile.allFieldsRequired'));
      return;
    }

    // 2. Validation that new password is not the same as current password
    if (currentPassword === newPassword) {
      setErrorText(t('profile.differentPasswordError'));
      return;
    }

    // 3. Password policy validation (reusing the exact forgot/reset logic)
    if (!passwordValidation.valid) {
      setErrorText(passwordValidation.errors[0] ?? t('auth.passwordInvalid'));
      return;
    }

    setErrorText(null);
    setFieldErrors({});

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      Alert.alert(
        t('profile.changePasswordSuccess'),
        t('profile.changePasswordSuccessSubtitle'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      const parsed = parseAuthError(err);
      const code = parsed.code;
      const message = mapBackendErrorCodeToMessage(code, parsed.message, t);
      
      setErrorText(message);
      if (parsed.fieldErrors) {
        const errors: Record<string, string> = {};
        parsed.fieldErrors.forEach((fieldErr) => {
          errors[fieldErr.field] = fieldErr.message;
        });
        setFieldErrors(errors);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Background decorations use pointerEvents="none" so they never steal touches. */}
      <View style={styles.backgroundContainer} pointerEvents="none">
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

      {/* KeyboardAvoidingView wraps the entire scrollable area from the outside. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Pressable wrapper dismisses keyboard on tap outside inputs. */}
          <Pressable onPress={Keyboard.dismiss} style={styles.pressableContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#1E293B" />
              <ThemedText style={styles.backText}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>

            <View style={styles.card}>
              <GradientIcon Icon={Lock} size={74} style={styles.mainIcon} />

              <View style={styles.titleContainer}>
                <BoldTitle text={t('profile.changePassword')} style={styles.title} />
                <ThemedText style={styles.subtitle}>
                  {t('profile.changePasswordSubtitle')}
                </ThemedText>
              </View>

              <View style={styles.inputArea}>
                <ThemedText style={styles.inputLabel}>{t('profile.currentPassword')}</ThemedText>
                <View style={[styles.inputWrapper, fieldErrors.currentPassword ? styles.inputWrapperError : null]}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureCurrent}
                    value={currentPassword}
                    editable={!isLoading}
                    onChangeText={setCurrentPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => newPasswordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)} style={styles.eyeIcon}>
                    {secureCurrent ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
                {fieldErrors.currentPassword ? (
                  <ThemedText style={styles.errorText}>{fieldErrors.currentPassword}</ThemedText>
                ) : null}

                <ThemedText style={styles.inputLabel}>{t('profile.newPassword')}</ThemedText>
                <View style={[styles.inputWrapper, fieldErrors.newPassword ? styles.inputWrapperError : null]}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    ref={newPasswordRef}
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureNew}
                    value={newPassword}
                    editable={!isLoading}
                    onChangeText={setNewPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity onPress={() => setSecureNew(!secureNew)} style={styles.eyeIcon}>
                    {secureNew ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
                {fieldErrors.newPassword ? (
                  <ThemedText style={styles.errorText}>{fieldErrors.newPassword}</ThemedText>
                ) : null}

                <ThemedText style={styles.inputLabel}>{t('profile.confirmNewPassword')}</ThemedText>
                <View style={[styles.inputWrapper, fieldErrors.confirmPassword ? styles.inputWrapperError : null]}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureConfirm}
                    value={confirmPassword}
                    editable={!isLoading}
                    onChangeText={setConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eyeIcon}>
                    {secureConfirm ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
                {fieldErrors.confirmPassword ? (
                  <ThemedText style={styles.errorText}>{fieldErrors.confirmPassword}</ThemedText>
                ) : null}
              </View>

              <View style={styles.rules}>
                <ThemedText style={styles.rulesTitle}>{t('profile.passwordRules')}</ThemedText>
                <ThemedText style={styles.rule}>- Password must be at least 8 characters.</ThemedText>
                <ThemedText style={styles.rule}>- Password must include 1 uppercase and 1 digit.</ThemedText>
                <ThemedText style={styles.rule}>- Password cannot be the same as your email.</ThemedText>
              </View>

              {errorText ? <ThemedText style={styles.globalErrorText}>{errorText}</ThemedText> : null}

              <View style={styles.buttonContainer}>
                <GradientButton
                  title={isLoading ? t('profile.updatingPassword') : t('profile.changePassword')}
                  onPress={handlePasswordChange}
                  disabled={isLoading}
                />
                {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.three,
  },
  pressableContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  backText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: Spacing.one,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 40,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
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
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  inputLabel: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
    color: '#1E293B',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
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
  eyeIcon: {
    padding: Spacing.one,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: Fonts.sf.regular,
    marginTop: Spacing.one,
  },
  globalErrorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.sf.semibold,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  rules: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: Spacing.four,
    width: '100%',
    gap: Spacing.one,
    marginBottom: Spacing.five,
    borderWidth: 1,
    borderColor: '#Dbeafe',
  },
  rulesTitle: {
    fontFamily: Fonts.sf.bold,
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: Spacing.one,
  },
  rule: {
    color: '#1E3A8A',
    fontSize: 13,
    fontFamily: Fonts.sf.regular,
  },
  buttonContainer: {
    width: '100%',
  },
  loader: {
    marginTop: Spacing.two,
  },
});
