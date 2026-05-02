import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts, Spacing } from '@/common/constants/theme';

interface LeaveRequestsHeaderProps {
  onAddPress: () => void;
}

export function LeaveRequestsHeader({ onAddPress }: LeaveRequestsHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={['#2B7FFF', '#00BBA7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Leave Requests</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.addButtonContainer}
          onPress={() => {
            console.log('plus pressed');
            onAddPress();
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Plus size={28} strokeWidth={2} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    backgroundColor: 'transparent', // sometimes needed for shadow to cast
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
  },
  container: {
    height: 185,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  addButtonContainer: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.65,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
  },
});
