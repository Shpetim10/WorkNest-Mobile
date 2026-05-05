import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bell } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import type { MobileAnnouncementListItem } from '../types';

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
}

interface AnnouncementCardProps {
  item: MobileAnnouncementListItem;
  onPress: (item: MobileAnnouncementListItem) => void;
}

export function AnnouncementCard({ item, onPress }: AnnouncementCardProps) {
  const isImportant = item.priority === 'IMPORTANT';

  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isImportant ? styles.iconImportant : styles.iconNormal]}>
        <Bell size={20} color={isImportant ? '#B91C1C' : '#6A7282'} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <ThemedText
            style={[styles.title, !item.read && styles.titleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          {isImportant && (
            <View style={styles.importantBadge}>
              <ThemedText style={styles.importantBadgeText}>Important</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.preview} numberOfLines={2}>
          {item.contentPreview}
        </ThemedText>

        <ThemedText style={styles.time}>{formatRelativeTime(item.createdAt)}</ThemedText>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: '#EEF4FF',
    borderColor: '#BFDBFE',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconImportant: {
    backgroundColor: '#FEE2E2',
  },
  iconNormal: {
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 15,
    color: '#1E2939',
    flex: 1,
  },
  titleUnread: {
    fontFamily: Fonts.sf.bold,
  },
  importantBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  importantBadgeText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    color: '#B91C1C',
  },
  preview: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#6A7282',
  },
  time: {
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2B7FFF',
    marginTop: 6,
    flexShrink: 0,
  },
});