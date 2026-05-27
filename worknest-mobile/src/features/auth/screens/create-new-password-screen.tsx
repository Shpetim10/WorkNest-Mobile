import { BlurView } from 'expo-blur';
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalization } from '@/common/localization';
import { clearPersistedSessionArtifacts } from '@/common/storage/secure-session-storage';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { useResetPasswordMutation } from '@/features/auth/api/auth-api';
import { clearResetPasswordState, logoutCompleted } from '@/features/auth/store/auth-slice';
import { selectAuthState } from '@/features/auth/store/selectors';
import { trackAuthEvent } from '@/features/auth/utils/auth-events';
import {
  mapBackendErrorCodeToMessage,
} from '@/features/auth/utils/auth-error-messages';
import { validatePasswordPolicy } from '@/features/auth/utils/password-policy';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RESET_LINK_ERROR_CODES = new Set([
  'RESET_TOKEN_INVALID',
  'RESET_TOKEN_EXPIRED',
  'RESET_TOKEN_ALREADY_USED',
]);

export function CreateNewPasswordScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ token?: string }>();
  const { userEmail } = useAppSelector(selectAuthState);

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const sanitizedToken = sanitizeAuthFlowToken(params.token);
    if (sanitizedToken) {
      setToken(sanitizedToken);
    }
  }, [params.token]);

  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch]);

  const passwordValidation = useMemo(
    () =>
      validatePasswordPolicy({
        password: newPassword,
        confirmPassword,
        email: userEmail,
      }),
    [newPassword, confirmPassword, userEmail]
  );

  const handleUpdate = async () => {
    const sanitizedToken = sanitizeAuthFlowToken(token);
    if (!sanitizedToken) {
      setErrorText('Reset link is invalid. Please request a new password reset.');
      return;
    }
    if (!passwordValidation.valid) {
      setErrorText(passwordValidation.errors[0] ?? 'Password is invalid.');
      return;
    }

    setErrorText(null);
    try {
      await resetPassword({
        token: sanitizedToken,
        newPassword,
        tokenSource: params.token ? 'deep-link' : 'manual',
      }).unwrap();

      await clearPersistedSessionArtifacts();
      dispatch(logoutCompleted());
      trackAuthEvent('reset_password_success');
      router.replace('/(auth)/password-success' as any);
    } catch (error) {
      const parsed = parseAuthError(error);
      const code = parsed.code;
      const message = mapBackendErrorCodeToMessage(code, parsed.message);
      setErrorText(message);
      setIsInvalidLink(Boolean(code && RESET_LINK_ERROR_CODES.has(code)));
    }
  };

  return (
    <View style={styles.container}>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#1E293B" />
            <ThemedText style={styles.backText}>{t('auth.backToLogin')}</ThemedText>
          </TouchableOpacity>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.card}>
              <GradientIcon
                Icon={Lock}
                size={74}
                style={styles.mainIcon}
              />

              <View style={styles.titleContainer}>
                <GradientText
                  text={t('auth.createNewPasswordTitle')}
                  style={styles.title}
                />
                <ThemedText style={styles.subtitle}>
                  {t('auth.createNewPasswordSubtitle')}
                </ThemedText>
              </View>

              <View style={styles.inputArea}>
                <ThemedText style={styles.inputLabel}>{t('auth.newPassword')}</ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.enterNewPassword')}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>

                <View style={{ height: Spacing.three }} />

                <ThemedText style={styles.inputLabel}>{t('auth.confirmPassword')}</ThemedText>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.confirmNewPassword')}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rulesBox}>
                <ThemedText style={styles.rulesTitle}>{t('auth.passwordRuleTitle')}</ThemedText>
                <View style={styles.ruleRow}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.ruleText}>{t('auth.passwordRuleMinLength')}</ThemedText>
                </View>
                <View style={styles.ruleRow}>
                  <View style={styles.bullet} />
                  <ThemedText style={styles.ruleText}>{t('auth.passwordRuleMatch')}</ThemedText>
                </View>
              </View>

              {errorText ? (
                <ThemedText style={styles.errorText}>{errorText}</ThemedText>
              ) : null}

              <View style={styles.buttonContainer}>
                <GradientButton
                  title={t('auth.updatePassword')}
                  onPress={handleUpdate}
                  disabled={isLoading}
                />
                {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}
              </View>

              {isInvalidLink ? (
                <TouchableOpacity onPress={() => router.replace('/(auth)/forgot-password' as any)}>
                  <ThemedText type="link" style={styles.requestNewLink}>
                    Request a new reset link
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
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
    marginBottom: Spacing.four,
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
  errorText: {
    color: '#DC2626',
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.two,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.three,
  },
  loader: {
    marginTop: Spacing.two,
  },
  requestNewLink: {
    marginTop: Spacing.two,
    textAlign: 'center',
  },
});
