import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { useAppSelector } from '@/common/store/hooks';
import {
  useGetAnnouncementsQuery,
  useGetAnnouncementDetailQuery,
  useGetAnnouncementUnreadCountQuery,
  useMarkAnnouncementReadMutation,
} from '../api/announcements-api';
import type { MobileAnnouncementListItem } from '../types';
import { useAppSelector } from '@/common/store/hooks';
import { selectTenantContext } from '@/features/auth';
import { useCompanyTopic, RealtimeEventType } from '@/features/realtime';

const READ_STORAGE_PREFIX = 'readAnnouncements';
const SAFE_STORAGE_KEY_CHARACTER = /[^A-Za-z0-9._-]/g;

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(globalThis.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveUserIdFromToken(token: string | null): string | null {
  const payload = decodeJwtPayload(token);
  const candidates = [
    payload?.userId,
    payload?.sub,
    payload?.id,
    payload?.user_id,
  ];

  const userId = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof userId === 'string' ? userId : null;
}

export function useAnnouncementsScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tenantContext = useAppSelector(selectTenantContext);
  const companyId = tenantContext?.companyId ?? null;

  const {
    data: fetchedAnnouncements = [],
    isLoading,
    refetch: refetchList,
  } = useGetAnnouncementsQuery();

  const { data: unreadData, refetch: refetchCount } = useGetAnnouncementUnreadCountQuery();

  const { data: detail, isLoading: isDetailLoading } = useGetAnnouncementDetailQuery(
    selectedId ?? '',
    { skip: !selectedId }
  );

  const [markRead] = useMarkAnnouncementReadMutation();

  useCompanyTopic(companyId, 'announcements', (envelope) => {
    if (
      envelope.type === RealtimeEventType.ANNOUNCEMENT_CREATED ||
      envelope.type === RealtimeEventType.ANNOUNCEMENT_DELETED
    ) {
      refetchList();
      refetchCount();
    }
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refetchList();
        refetchCount();
      }
    });
    return () => sub.remove();
  }, [refetchList, refetchCount]);

  const markAnnouncementAsRead = useCallback(
    (id: string, alreadyRead: boolean) => {
      setLocallyReadIds((current) => {
        if (current.has(id)) return current;

        const next = new Set(current);
        next.add(id);
        if (userReadStorageKey) {
          SecureStore.setItemAsync(userReadStorageKey, JSON.stringify([...next])).catch(() => {});
        }
        return next;
      });

      if (!alreadyRead) {
        markRead(id);
      }
    },
    [markRead, userReadStorageKey]
  );

  const openDetail = useCallback(
    (item: MobileAnnouncementListItem) => {
      setSelectedId(item.id);
      const alreadyRead = locallyReadIds.has(item.id) || item.read;
      if (!alreadyRead) {
        markAnnouncementAsRead(item.id, false);
      }
    },
    [locallyReadIds, markAnnouncementAsRead]
  );

  const closeDetail = useCallback(() => setSelectedId(null), []);

  const markSelectedAsRead = useCallback(() => {
    if (!selectedId) return;

    markAnnouncementAsRead(selectedId, visibleDetail?.read ?? false);
    setSelectedId(null);
  }, [markAnnouncementAsRead, selectedId, visibleDetail?.read]);

  return {
    announcements: visibleAnnouncements,
    unreadCount,
    isLoading,
    selectedId,
    detail: visibleDetail,
    isDetailLoading,
    openDetail,
    closeDetail,
    markSelectedAsRead,
  };
}
