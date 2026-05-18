import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { ThemedText } from '@/common/components/themed-text';
import { useAppSelector } from '@/common/store/hooks';
import { Fonts } from '@/common/constants/theme';

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const subscription = useAppSelector((state) => state.subscription.subscription);

  if (dismissed || subscription?.status !== 'TRIALING' || !subscription.trialEndsAt) {
    return null;
  }

  const daysLeft = Math.ceil(
    (new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <ThemedText style={styles.text}>
        Trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — manage your plan at worknest.com
      </ThemedText>
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={8} accessibilityLabel="Dismiss">
        <X size={16} color="#92400E" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
});
