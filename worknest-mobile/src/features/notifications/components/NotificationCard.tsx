import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, DollarSign, Megaphone, XCircle } from 'lucide-react-native';

import { ThemedText } from '@/common/components/themed-text';
import { Fonts } from '@/common/constants/theme';
import { useLocalization } from '@/common/localization';
import type { NotificationItem } from '../types';

interface NotificationCardProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}

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

export function NotificationCard({ item, onPress }: NotificationCardProps) {
  const { t } = useLocalization();

  // Get icon and colors based on notification type
  const getIconConfig = () => {
    switch (item.type) {
      case 'LEAVE_APPROVED':
        return {
          icon: <CheckCircle2 size={22} color="#10B981" strokeWidth={2} />,
          bg: '#ECFDF5',
        };
      case 'PAYSLIP_READY':
        return {
          icon: <DollarSign size={22} color="#3B82F6" strokeWidth={2.5} />,
          bg: '#EFF6FF',
        };
      case 'NEW_ANNOUNCEMENT':
        return {
          icon: <Megaphone size={20} color="#F97316" strokeWidth={2} />,
          bg: '#FFF7ED',
        };
      case 'LEAVE_REJECTED':
        return {
          icon: <XCircle size={22} color="#EF4444" strokeWidth={2} />,
          bg: '#FEF2F2',
        };
      default:
        return {
          icon: <CheckCircle2 size={22} color="#64748B" strokeWidth={2} />,
          bg: '#F1F5F9',
        };
    }
  };

  const { icon, bg } = getIconConfig();

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        !item.read && styles.cardContainerUnread,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        {/* Left Icon */}
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          {icon}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {t(item.titleKey)}
          </ThemedText>
          <ThemedText style={styles.message} numberOfLines={2}>
            {item.message}
          </ThemedText>
          <ThemedText style={styles.time}>
            {formatRelativeTime(item.createdAt, t)}
          </ThemedText>
        </View>

        {/* Unread dot / Status indicator */}
        <View style={styles.statusContainer}>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.26,
    borderColor: 'rgba(229, 231, 235, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContainerUnread: {
    // Unread cards have a slightly more defined light blue border
    borderColor: '#Dbeafe',
    shadowColor: '#2B7FFF',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: Fonts.sf.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: '#1E2939',
  },
  message: {
    fontFamily: Fonts.sf.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  time: {
    fontFamily: Fonts.sf.regular,
    fontSize: 11,
    lineHeight: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusContainer: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6', // Blue dot in Figma mockup
  },
});
