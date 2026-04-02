import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Spacing } from '@/common/constants/theme';

/**
 * Login Screen Mockup
 * Part of the Auth feature.
 */
export default function LoginScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">WorkNest</ThemedText>
      <ThemedText type="subtitle">Personalizing Productivity</ThemedText>
      
      <View style={styles.spacer} />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <ThemedText style={styles.buttonText}>Login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  spacer: {
    height: Spacing.four,
  },
  button: {
    backgroundColor: '#007AFF', // Example color
    padding: Spacing.three,
    borderRadius: Spacing.two,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
