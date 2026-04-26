import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { GradientButton } from '@/common/components/gradient-button';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { useValidateInvitationTokenMutation } from '@/features/auth/api/auth-api';
import { clearInvitationFlowState, setInvitationToken } from '@/features/auth/store/auth-slice';
import { selectInvitationState } from '@/features/auth/store/selectors';
import { trackAuthEvent } from '@/features/auth/utils/auth-events';
import {
  buildFieldErrorMapFromFieldErrors,
  mapBackendErrorCodeToMessage,
} from '@/features/auth/utils/auth-error-messages';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';
import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';

const INVITATION_LINK_ERROR_CODES = new Set([
  'INVITATION_TOKEN_INVALID',
  'INVITATION_TOKEN_EXPIRED',
  'INVITATION_ALREADY_USED',
]);

export function InvitationPreflightScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ token?: string }>();
  const invitation = useAppSelector(selectInvitationState);
  const [tokenInput, setTokenInput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidTokenUi, setInvalidTokenUi] = useState(false);
  const [validateInvitationToken, { isLoading }] = useValidateInvitationTokenMutation();

  useEffect(() => {
    const token = sanitizeAuthFlowToken(params.token);
    if (token) {
      setTokenInput(token);
      dispatch(setInvitationToken(token));
    }
  }, [params.token, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearInvitationFlowState());
    };
  }, [dispatch]);

  const onValidate = async () => {
    const token = sanitizeAuthFlowToken(tokenInput);
    if (!token) {
      setErrorText('Invitation token is required.');
      return;
    }

    setErrorText(null);
    setFieldErrors({});
    setInvalidTokenUi(false);
    dispatch(setInvitationToken(token));
    try {
      await validateInvitationToken({ token }).unwrap();
      trackAuthEvent('invitation_token_validated');
    } catch (error) {
      const parsed = parseAuthError(error);
      setFieldErrors(buildFieldErrorMapFromFieldErrors(parsed.fieldErrors));
      setErrorText(mapBackendErrorCodeToMessage(parsed.code, parsed.message));
      setInvalidTokenUi(Boolean(parsed.code && INVITATION_LINK_ERROR_CODES.has(parsed.code)));
    }
  };

  const onContinue = () => {
    const token = sanitizeAuthFlowToken(tokenInput);
    if (!token) {
      return;
    }
    router.push({
      pathname: '/invite/activate' as any,
      params: { token },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Invitation Token</ThemedText>
        <ThemedText style={styles.subtitle}>
          Validate your invitation before activating your account.
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Invitation token"
          placeholderTextColor="#94A3B8"
          value={tokenInput}
          onChangeText={setTokenInput}
          autoCapitalize="none"
          editable={!isLoading}
        />
        {fieldErrors.token ? <ThemedText style={styles.error}>{fieldErrors.token}</ThemedText> : null}

        <GradientButton
          title={isLoading ? 'Validating...' : 'Validate Invitation'}
          onPress={onValidate}
          disabled={isLoading}
        />
        {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}

        {errorText ? <ThemedText style={styles.error}>{errorText}</ThemedText> : null}
        {invalidTokenUi ? (
          <TouchableOpacity onPress={() => setTokenInput('')}>
            <ThemedText type="link">Try another token</ThemedText>
          </TouchableOpacity>
        ) : null}

        {invitation.preflight ? (
          <View style={styles.preflightCard}>
            <ThemedText style={styles.preflightTitle}>{invitation.preflight.companyName}</ThemedText>
            <ThemedText style={styles.preflightMeta}>Email: {invitation.preflight.maskedEmail}</ThemedText>
            <ThemedText style={styles.preflightMeta}>Role: {invitation.preflight.platformRole}</ThemedText>
            {invitation.preflight.invitedJobTitle ? (
              <ThemedText style={styles.preflightMeta}>
                Job title: {invitation.preflight.invitedJobTitle}
              </ThemedText>
            ) : null}

            <GradientButton title="Continue to Activation" onPress={onContinue} containerStyle={styles.continue} />
          </View>
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
  loader: {
    marginTop: -Spacing.one,
  },
  error: {
    color: '#DC2626',
  },
  preflightCard: {
    marginTop: Spacing.one,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  preflightTitle: {
    fontFamily: Fonts.sf.semibold,
    color: '#0F172A',
    fontSize: 18,
  },
  preflightMeta: {
    color: '#475569',
  },
  continue: {
    marginTop: Spacing.two,
  },
});
