import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useTheme } from '@/common/hooks/use-theme';

export function LoginForm() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const iconColor = '#94A3B8'; // Subtle gray for icons

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
        />
      </View>

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
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {showPassword ? (
            <EyeOff size={20} color={iconColor} strokeWidth={2} />
          ) : (
            <Eye size={20} color={iconColor} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => router.push('/(auth)/reset-password' as any)}
      >
        <ThemedText style={styles.forgotText}>Forgot password?</ThemedText>
      </TouchableOpacity>
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
});
