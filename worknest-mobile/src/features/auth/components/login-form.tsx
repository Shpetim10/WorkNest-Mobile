import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GradientButton } from '@/common/components/gradient-button';
import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useTheme } from '@/common/hooks/use-theme';
import { useLoginMutation } from '@/features/auth/api/auth-api';
import {
  buildFieldErrorMapFromFieldErrors,
  mapBackendErrorCodeToMessage,
} from '@/features/auth/utils/auth-error-messages';
import { parseAuthError } from '@/features/auth/utils/parse-auth-error';

export function LoginForm() {
  const router = useRouter();
  const theme = useTheme();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const iconColor = '#94A3B8'; // Subtle gray for icons
  const isSubmitDisabled = !email.trim() || !password || isLoading;

  const onSubmit = async () => {
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const data = await login({
        email: email.trim(),
        password,
      }).unwrap();

      if (data.roleSelectionRequired) {
        router.replace('/role-assignment' as any);
        return;
      }
      router.replace('/(app)' as any);
    } catch (error) {
      const parsedError = parseAuthError(error);
      setFieldErrors(buildFieldErrorMapFromFieldErrors(parsedError.fieldErrors));
      setErrorMessage(mapBackendErrorCodeToMessage(parsedError.code, parsedError.message));
    }
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={[styles.inputWrapper, { borderColor: '#E2E8F0' }]}>
        <Mail size={20} color={iconColor} strokeWidth={2} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
      </View>
      {fieldErrors.email ? <ThemedText style={styles.fieldError}>{fieldErrors.email}</ThemedText> : null}

      {/* Password Input */}
      <View style={[styles.inputWrapper, { borderColor: '#E2E8F0' }]}>
        <Lock size={20} color={iconColor} strokeWidth={2} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isLoading}
        >
          {showPassword ? (
            <EyeOff size={20} color={iconColor} strokeWidth={2} />
          ) : (
            <Eye size={20} color={iconColor} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
      {fieldErrors.password ? (
        <ThemedText style={styles.fieldError}>{fieldErrors.password}</ThemedText>
      ) : null}

      {/* Forgot Password */}
      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => router.push('/forgot-password' as any)}
        disabled={isLoading}
      >
        <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
      </TouchableOpacity>

      {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

      <View style={styles.buttonContainer}>
        <GradientButton
          title={isLoading ? 'Logging in...' : 'Login'}
          onPress={onSubmit}
          disabled={isSubmitDisabled}
        />
        {isLoading ? <ActivityIndicator color="#2B7FFF" style={styles.loader} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.three,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    height: 58,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    marginLeft: Spacing.two,
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.one,
  },
  forgotText: {
    color: '#3B82F6',
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: Spacing.two,
  },
  loader: {
    marginTop: Spacing.two,
  },
  errorText: {
    color: '#DC2626',
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
  },
  fieldError: {
    marginTop: -Spacing.two,
    color: '#DC2626',
    fontSize: 12,
  },
});
