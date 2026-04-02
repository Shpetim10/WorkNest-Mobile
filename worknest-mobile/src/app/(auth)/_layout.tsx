import { Stack } from 'expo-router';
import React from 'react';

/**
 * Authentication Stack
 * Holds all auth-related screens (Login, Register, Reset).
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
