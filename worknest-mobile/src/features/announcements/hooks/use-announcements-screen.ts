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
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(() => new Set());
  const [readStateLoaded, setReadStateLoaded] = useState(false);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const userEmail = useAppSelector((state) => state.auth.userEmail);
  const activeRoleAssignmentId = useAppSelector((state) => state.auth.activeRoleAssignmentId);
  const userId = useMemo(
    () => resolveUserIdFromToken(accessToken) ?? userEmail ?? activeRoleAssignmentId,
    [accessToken, activeRoleAssignmentId, userEmail]
  );
  const userReadStorageKey = userId
    ? `${READ_STORAGE_PREFIX}_${userId.replace(SAFE_STORAGE_KEY_CHARACTER, '_')}`
    : null;

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

  const visibleAnnouncements = useMemo(
    () =>
      fetchedAnnouncements.map((item) => ({
        ...item,
        read: locallyReadIds.has(item.id) || item.read,
      })),
    [fetchedAnnouncements, locallyReadIds]
  );

  const visibleDetail = useMemo(
    () =>
      detail
        ? {
            ...detail,
            read: locallyReadIds.has(detail.id) || detail.read,
          }
        : detail,
    [detail, locallyReadIds]
  );

  const unreadCount = readStateLoaded
    ? visibleAnnouncements.filter((item) => !item.read).length
    : unreadData?.count ?? 0;

  useEffect(() => {
    let isActive = true;

    setSelectedId(null);
    setReadStateLoaded(false);
    setLocallyReadIds(new Set());

    if (!userReadStorageKey) {
      setReadStateLoaded(true);
      return () => {
        isActive = false;
      };
    }

    SecureStore.getItemAsync(userReadStorageKey)
      .then((raw) => {
        if (!isActive) return;

        const ids = raw ? (JSON.parse(raw) as string[]) : [];
        setLocallyReadIds((current) => new Set([...ids, ...current]));
      })
      .catch(() => {
        if (isActive) {
          setLocallyReadIds(new Set());
        }
      })
      .finally(() => {
        if (isActive) {
          setReadStateLoaded(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [userReadStorageKey]);

  useEffect(() => {
    if (!userReadStorageKey) return;

    refetchList();
    refetchCount();
  }, [refetchCount, refetchList, userReadStorageKey]);

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
