import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { GradientButton } from '@/common/components/gradient-button';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import { useActivateInvitationMutation, useValidateInvitationTokenMutation } from '@/features/auth/api/auth-api';
import { trackAuthEvent } from '@/features/auth/utils/auth-events';
import {
  buildFieldErrorMapFromFieldErrors,
  mapBackendErrorCodeToMessage,
} from '@/features/auth/utils/auth-error-messages';
import { validatePasswordPolicy } from '@/features/auth/utils/password-policy';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';
import { useAppDispatch } from '@/common/store/hooks';
import { clearInvitationFlowState, setInvitationToken } from '@/features/auth/store/auth-slice';

export function InvitationActivateScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ token?: string; companyName?: string; maskedEmail?: string }>();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [validateInvitationToken] = useValidateInvitationTokenMutation();
  const [activateInvitation, { isLoading }] = useActivateInvitationMutation();

  useEffect(() => {
    const sanitized = sanitizeAuthFlowToken(params.token);
    if (sanitized) {
      setToken(sanitized);
      dispatch(setInvitationToken(sanitized));
      return;
    }
    router.replace('/invitation-validate' as any);
  }, [params.token, dispatch, router]);

  useEffect(() => {
    return () => {
      dispatch(clearInvitationFlowState());
    };
  }, [dispatch]);

  const passwordValidation = useMemo(
    () =>
      validatePasswordPolicy({
        password,
        confirmPassword,
        t,
      }),
    [password, confirmPassword, t]
  );

  const onActivate = async () => {
    const sanitizedToken = sanitizeAuthFlowToken(token);
    if (!sanitizedToken) {
      setErrorText(t('auth.invitationTokenMissing'));
      return;
    }
    if (!gdprConsent) {
      setErrorText(t('auth.gdprConsentRequired'));
      return;
    }
    if (!passwordValidation.valid) {
      setErrorText(passwordValidation.errors[0] ?? t('auth.passwordInvalid'));
      return;
    }

    setErrorText(null);
    setFieldErrors({});
    try {
      // Preflight re-validation to avoid activating stale/invalid tokens.
      await validateInvitationToken({ token: sanitizedToken }).unwrap();

      const response = await activateInvitation({
        token: sanitizedToken,
        password,
        gdprConsent,
        preferredLanguage: preferredLanguage.trim() || undefined,
      }).unwrap();

      trackAuthEvent('invitation_activation_success', {
        role: response.role,
      });

      Alert.alert(t('auth.invitationActivatedTitle'), t('auth.invitationActivatedMessage'));
      dispatch(clearInvitationFlowState());
      router.replace({
        pathname: '/login' as any,
        params: {
          activationCompany: params.companyName ?? '',
          activationEmail: params.maskedEmail ?? '',
        },
      });
    } catch (error) {
      const parsed = parseAuthError(error);
      setFieldErrors(buildFieldErrorMapFromFieldErrors(parsed.fieldErrors));
      setErrorText(mapBackendErrorCodeToMessage(parsed.code, parsed.message, t));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{t('auth.activateInvitationTitle')}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('auth.activateInvitationSubtitle')}
        </ThemedText>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.password')}
          placeholderTextColor="#94A3B8"
          secureTextEntry
          editable={!isLoading}
        />
        {fieldErrors.password ? <ThemedText style={styles.error}>{fieldErrors.password}</ThemedText> : null}
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('auth.confirmPassword')}
          placeholderTextColor="#94A3B8"
          secureTextEntry
          editable={!isLoading}
        />
        {fieldErrors.confirmPassword ? (
          <ThemedText style={styles.error}>{fieldErrors.confirmPassword}</ThemedText>
        ) : null}
        <TextInput
          style={styles.input}
          value={preferredLanguage}
          onChangeText={setPreferredLanguage}
          placeholder={t('auth.preferredLanguageOptional')}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          editable={!isLoading}
        />
        {fieldErrors.preferredLanguage ? (
          <ThemedText style={styles.error}>{fieldErrors.preferredLanguage}</ThemedText>
        ) : null}

        <View style={styles.gdprRow}>
          <Switch value={gdprConsent} onValueChange={setGdprConsent} disabled={isLoading} />
          <ThemedText style={styles.gdprText}>{t('auth.gdprConsent')}</ThemedText>
        </View>
        {fieldErrors.gdprConsent ? <ThemedText style={styles.error}>{fieldErrors.gdprConsent}</ThemedText> : null}

        {errorText ? <ThemedText style={styles.error}>{errorText}</ThemedText> : null}

        <GradientButton
          title={isLoading ? t('auth.activating') : t('auth.activateInvitation')}
          onPress={onActivate}
          disabled={isLoading}
        />
        {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}
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
  gdprRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  gdprText: {
    flex: 1,
    color: '#334155',
  },
  error: {
    color: '#DC2626',
  },
  loader: {
    marginTop: -Spacing.one,
  },
});
