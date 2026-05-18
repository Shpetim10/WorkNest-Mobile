import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/common/components/themed-text';
import { useAppSelector } from '@/common/store/hooks';
import { Fonts } from '@/common/constants/theme';

export function PlanLimitBanner() {
  const subscription = useAppSelector((state) => state.subscription.subscription);

  if (subscription?.status !== 'PAST_DUE' && subscription?.status !== 'CANCELED') {
    return null;
  }

  return (
    <View style={styles.banner}>
      <ThemedText style={styles.text}>
        Your subscription is inactive. Please update your billing at worknest.com.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
    textAlign: 'center',
  },
});
