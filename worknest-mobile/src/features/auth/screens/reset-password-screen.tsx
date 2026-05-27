import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { GradientButton } from '@/common/components/gradient-button';
import { clearPersistedSessionArtifacts } from '@/common/storage/secure-session-storage';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { useResetPasswordMutation } from '@/features/auth/api/auth-api';
import { clearResetPasswordState, logoutCompleted } from '@/features/auth/store/auth-slice';
import { selectAuthState } from '@/features/auth/store/selectors';
import { trackAuthEvent } from '@/features/auth/utils/auth-events';
import {
  buildFieldErrorMapFromFieldErrors,
  mapBackendErrorCodeToMessage,
} from '@/features/auth/utils/auth-error-messages';
import { validatePasswordPolicy } from '@/features/auth/utils/password-policy';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';

const RESET_LINK_ERROR_CODES = new Set([
  'RESET_TOKEN_INVALID',
  'RESET_TOKEN_EXPIRED',
  'RESET_TOKEN_ALREADY_USED',
]);

export function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ token?: string }>();
  const { userEmail } = useAppSelector(selectAuthState);

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        t,
      }),
    [newPassword, confirmPassword, userEmail, t]
  );

  const onSubmit = async () => {
    const sanitizedToken = sanitizeAuthFlowToken(token);
    if (!sanitizedToken) {
      setErrorText(t('auth.resetTokenRequired'));
      return;
    }
    if (!passwordValidation.valid) {
      setErrorText(passwordValidation.errors[0] ?? t('auth.passwordInvalid'));
      return;
    }

    setErrorText(null);
    setFieldErrors({});
    try {
      await resetPassword({
        token: sanitizedToken,
        newPassword,
        tokenSource: params.token ? 'deep-link' : 'manual',
      }).unwrap();

      await clearPersistedSessionArtifacts();
      dispatch(logoutCompleted());
      trackAuthEvent('reset_password_success');
      Alert.alert(t('common.success'), t('auth.resetSuccessMessage'));
      router.replace('/login' as any);
    } catch (error) {
      const parsed = parseAuthError(error);
      const code = parsed.code;
      setFieldErrors(buildFieldErrorMapFromFieldErrors(parsed.fieldErrors));
      const message = mapBackendErrorCodeToMessage(code, parsed.message, t);
      setErrorText(message);
      setIsInvalidLink(Boolean(code && RESET_LINK_ERROR_CODES.has(code)));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{t('auth.resetPasswordTitle')}</ThemedText>
        <ThemedText style={styles.subtitle}>{t('auth.resetPasswordSubtitle')}</ThemedText>

        <TextInput
          style={styles.input}
          placeholder={t('auth.resetToken')}
          placeholderTextColor="#94A3B8"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          editable={!isLoading}
        />
        {fieldErrors.token ? <ThemedText style={styles.error}>{fieldErrors.token}</ThemedText> : null}

        <TextInput
          style={styles.input}
          placeholder={t('auth.newPassword')}
          placeholderTextColor="#94A3B8"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {fieldErrors.newPassword ? (
          <ThemedText style={styles.error}>{fieldErrors.newPassword}</ThemedText>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder={t('auth.confirmPassword')}
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {fieldErrors.confirmPassword ? (
          <ThemedText style={styles.error}>{fieldErrors.confirmPassword}</ThemedText>
        ) : null}

        <View style={styles.rules}>
          <ThemedText style={styles.rule}>{t('auth.passwordMinLengthError')}</ThemedText>
          <ThemedText style={styles.rule}>{t('auth.passwordRuleUppercaseDigit')}</ThemedText>
        </View>

        {errorText ? <ThemedText style={styles.error}>{errorText}</ThemedText> : null}

        <GradientButton
          title={isLoading ? t('auth.resetting') : t('auth.resetPasswordTitle')}
          onPress={onSubmit}
          disabled={isLoading}
        />
        {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}

        {isInvalidLink ? (
          <TouchableOpacity onPress={() => router.replace('/forgot-password' as any)}>
            <ThemedText type="link">{t('auth.requestNewLink')}</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.ny.bold,
    fontSize: 32,
    lineHeight: 38,
    color: '#0F172A',
  },
  subtitle: {
    color: '#475569',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
    fontFamily: Fonts.sf.regular,
    color: '#0F172A',
  },
  rules: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  rule: {
    color: '#334155',
    fontSize: 13,
  },
  error: {
    color: '#DC2626',
  },
  loader: {
    marginTop: -Spacing.one,
  },
});
