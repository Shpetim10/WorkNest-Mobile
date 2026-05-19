import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, RefreshControl } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts } from '@/common/constants/theme';
import { useAnnouncementsScreen } from '../hooks/use-announcements-screen';
import type { MobileAnnouncementListItem } from '../types';
import { AnnouncementsHeader } from './AnnouncementsHeader';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailSheet } from './AnnouncementDetailSheet';

export function AnnouncementsScreen() {
  const {
    announcements,
    unreadCount,
    isLoading,
    selectedId,
    detail,
    isDetailLoading,
    openDetail,
    closeDetail,
    markSelectedAsRead,
    refetchList,
  } = useAnnouncementsScreen();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchList();
    setRefreshing(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2B7FFF"
            colors={['#2B7FFF']}
          />
        }
      >
        <AnnouncementsHeader unreadCount={unreadCount} />

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2B7FFF" />
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No announcements yet</ThemedText>
            </View>
          ) : (
            <View style={styles.listContent}>
              {announcements.map((item: MobileAnnouncementListItem) => (
                <AnnouncementCard key={item.id} item={item} onPress={openDetail} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AnnouncementDetailSheet
        visible={!!selectedId}
        detail={detail}
        isLoading={isDetailLoading}
        onClose={closeDetail}
        onMarkRead={markSelectedAsRead}
      />
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
  content: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginTop: -58,
    paddingTop: 24,
    flex: 1,
    minHeight: 600,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: Fonts.sf.regular,
    fontSize: 16,
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 28,
    paddingBottom: 100,
    gap: 12,
  },
});
