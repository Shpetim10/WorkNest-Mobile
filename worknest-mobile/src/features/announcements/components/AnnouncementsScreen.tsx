import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/components/themed-text';
import { ThemedView } from '@/common/components/themed-view';
import { Fonts } from '@/common/constants/theme';
import { useAnnouncementsScreen } from '../hooks/use-announcements-screen';
import type { MobileAnnouncementListItem } from '../types';
import { AnnouncementsHeader } from './AnnouncementsHeader';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetailSheet } from './AnnouncementDetailSheet';
import { useMarkAnnouncementReadMutation } from '../api/announcements-api';

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
  } = useAnnouncementsScreen();

  const [markRead] = useMarkAnnouncementReadMutation();

  const handleMarkRead = () => {
    if (selectedId) markRead(selectedId);
  };

  return (
    <ThemedView style={styles.container}>
      <AnnouncementsHeader unreadCount={unreadCount} />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No announcements yet</ThemedText>
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: MobileAnnouncementListItem }) => (
              <AnnouncementCard item={item} onPress={openDetail} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AnnouncementDetailSheet
        visible={!!selectedId}
        detail={detail}
        isLoading={isDetailLoading}
        onClose={closeDetail}
        onMarkRead={handleMarkRead}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});