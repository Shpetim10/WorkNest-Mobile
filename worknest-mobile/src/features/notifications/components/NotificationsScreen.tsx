import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, BellOff, RefreshCw, CheckCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts, Spacing } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import {
  useGetNotificationsQuery,
  useGetNotificationsUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadAllMutation,
} from '../api/notifications-api';
import { NotificationCard } from './NotificationCard';
import type { NotificationItem } from '../types';

export function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();

  const [refreshing, setRefreshing] = useState(false);

  // RTK Query hooks
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery();

  const {
    data: unreadData,
    refetch: refetchUnreadCount,
  } = useGetNotificationsUnreadCountQuery();

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkNotificationsReadAllMutation();

  const unreadCount = unreadData?.count ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
    } catch (e) {
      // Ignore errors in refresh
    } finally {
      setRefreshing(false);
    }
  };

  const handleCardPress = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await markRead(item.id).unwrap();
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount > 0) {
      try {
        await markAllRead().unwrap();
      } catch (err) {
        console.error('Failed to mark all notifications as read', err);
      }
    }
  };

  // Safe area dimensions
  const headerPaddingTop = insets.top + 20;
  const headerHeight = insets.top + 130;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2B7FFF"
            colors={['#2B7FFF']}
          />
        }
      >
        {/* Gradient Header */}
        <View style={[styles.headerWrapper, { height: headerHeight }]}>
          <LinearGradient
            colors={['#2B7FFF', '#00BBA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: headerPaddingTop }]}
          >
            <View style={styles.headerRow}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Title & Badge */}
              <View style={styles.titleGroup}>
                <ThemedText style={styles.title}>{t('notifications.title')}</ThemedText>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>
                      {unreadCount} {t('notifications.newBadge')}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Content Overlay */}
        <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2B7FFF" />
              <ThemedText style={styles.loadingText}>
                {t('notifications.loading')}
              </ThemedText>
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <RefreshCw size={48} color="#EF4444" style={styles.stateIcon} />
              <ThemedText style={styles.errorText}>
                {t('notifications.error')}
              </ThemedText>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={onRefresh}
              >
                <ThemedText style={styles.retryButtonText}>
                  {t('common.tryAgain')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BellOff size={48} color="#94A3B8" style={styles.stateIcon} />
              <ThemedText style={styles.emptyText}>
                {t('notifications.empty')}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.listContent}>
              {/* Mark All Read Bar */}
              {unreadCount > 0 && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.markAllReadButton}
                    onPress={handleMarkAllRead}
                    activeOpacity={0.7}
                  >
                    <CheckCheck size={16} color="#3B82F6" strokeWidth={2.5} />
                    <ThemedText style={styles.markAllReadText}>
                      {t('updates.markAsRead')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Cards List */}
              <View style={[styles.cardList, unreadCount === 0 && { marginTop: 12 }]}>
                {notifications.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onPress={handleCardPress}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerWrapper: {
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent badge
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    color: '#1E2939', // Dark text on light translucent badge
    fontFamily: Fonts.sf.semibold,
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    backgroundColor: '#FFFFFF',
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    minHeight: 550,
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
    gap: 12,
  },
  errorText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2B7FFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sf.semibold,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 15,
    color: '#94A3B8',
  },
  stateIcon: {
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  markAllReadText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 12,
    color: '#3B82F6',
  },
  cardList: {
    gap: 12,
    width: '100%',
  },
});
