import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { MobileAnnouncementListItem } from '../types';

function formatRelativeTime(dateStr: string, t: ReturnType<typeof useLocalization>['t']): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return t('updates.justNow');
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}${t('updates.minutesAgo')}`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}${t('updates.hoursAgo')}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t('updates.yesterday');
  if (diffDays < 30) return `${diffDays} ${t('updates.daysAgo')}`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? `1 ${t('updates.monthAgo')}` : `${diffMonths} ${t('updates.monthsAgo')}`;
}

interface AnnouncementCardProps {
  item: MobileAnnouncementListItem;
  onPress: (item: MobileAnnouncementListItem) => void;
}

function getCategoryConfig(item: MobileAnnouncementListItem, t: ReturnType<typeof useLocalization>['t']) {
  if (item.priority === 'IMPORTANT') {
    return { label: t('updates.important'), bg: '#FFE2E2', text: '#D60000' };
  }

  return { label: t('updates.general'), bg: '#DBEAFE', text: '#2563EB' };
}

export function AnnouncementCard({ item, onPress }: AnnouncementCardProps) {
  const { t } = useLocalization();
  const category = getCategoryConfig(item, t);

  return (
    <TouchableOpacity
      style={[styles.cardContainer, item.read && styles.cardContainerRead]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.card, item.read && styles.cardRead]}>
        <View style={[styles.iconContainer, item.read && styles.iconContainerRead]}>
          <Megaphone
            size={20}
            strokeWidth={2}
            color={item.read ? '#FDBA74' : '#F97316'}
          />
        </View>

        <View style={styles.content}>
          <ThemedText
            style={[styles.title, item.read && styles.titleRead]}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>

          <ThemedText style={[styles.preview, item.read && styles.previewRead]} numberOfLines={2}>
            {item.contentPreview}
          </ThemedText>

          <View style={styles.bottomRow}>
            <ThemedText style={[styles.time, item.read && styles.timeRead]} numberOfLines={1}>
              {formatRelativeTime(item.createdAt, t)}
            </ThemedText>
            <View style={[styles.categoryPill, { backgroundColor: category.bg }]}>
              <ThemedText style={[styles.categoryText, { color: category.text }]} numberOfLines={1}>
                {category.label}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  cardContainerRead: {
    shadowOpacity: 0.02,
    elevation: 1,
  },
  card: {
    width: '100%',
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    backgroundColor: '#FFFFFF',
    paddingTop: 21,
    paddingHorizontal: 21,
    paddingBottom: 6,
    gap: 16,
  },
  cardRead: {
    borderColor: 'rgba(229, 231, 235, 0.65)',
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: '#FFF7ED',
  },
  iconContainerRead: {
    backgroundColor: '#FFFBEB',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontSize: 16,
    lineHeight: 22,
    color: '#1E2939',
  },
  titleRead: {
    color: '#64748B',
  },
  preview: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  previewRead: {
    color: '#94A3B8',
  },
  bottomRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  time: {
    flex: 1,
    fontFamily: Fonts.sf.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#94A3B8',
  },
  timeRead: {
    color: '#CBD5E1',
  },
  categoryPill: {
    minWidth: 61,
    height: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryText: {
    fontFamily: Fonts.sf.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
});
