import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';

interface AnnouncementsHeaderProps {
  unreadCount: number;
}

export function AnnouncementsHeader({ unreadCount }: AnnouncementsHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLocalization();

  return (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={['#2B7FFF', '#00BBA7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <ThemedText style={styles.title}>{t('updates.title')}</ThemedText>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {unreadCount} {t('common.new')}
                </ThemedText>
              </View>
            )}
          </View>
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
    backgroundColor: 'transparent',
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 24,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: '#1E2939',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.semibold,
    fontSize: 13,
  },
});
