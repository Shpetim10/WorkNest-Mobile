import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { useAppSelector } from '@/common/store/hooks';
import { selectTenantContext } from '@/features/auth';
import { RealtimeEventType, useCompanyTopic } from '@/features/realtime';
import {
  useGetAnnouncementsQuery,
  useGetAnnouncementDetailQuery,
  useGetAnnouncementUnreadCountQuery,
  useMarkAnnouncementReadMutation,
} from '../api/announcements-api';
import type { MobileAnnouncementDetail, MobileAnnouncementListItem } from '../types';

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
  const candidates = [payload?.userId, payload?.sub, payload?.id, payload?.user_id];
  const userId = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof userId === 'string' ? userId : null;
}

function sanitizeStoragePart(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const sanitized = value.replace(SAFE_STORAGE_KEY_CHARACTER, '_');
  return sanitized.length > 0 ? sanitized : null;
}

function mergeReadState<T extends { id: string; read: boolean }>(
  items: readonly T[] | undefined,
  locallyReadIds: Set<string>
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    read: item.read || locallyReadIds.has(item.id),
  }));
}

export function useAnnouncementsScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(new Set());

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const tenantContext = useAppSelector(selectTenantContext);
  const companyId = tenantContext?.companyId ?? null;
  const userId = useMemo(() => resolveUserIdFromToken(accessToken), [accessToken]);

  const userReadStorageKey = useMemo(() => {
    const safeCompanyId = sanitizeStoragePart(companyId);
    const safeUserId = sanitizeStoragePart(userId);

    if (!safeCompanyId || !safeUserId) {
      return null;
    }

    return `${READ_STORAGE_PREFIX}.${safeCompanyId}.${safeUserId}`;
  }, [companyId, userId]);

  const {
    data: fetchedAnnouncements = [],
    isLoading,
    refetch: refetchList,
  } = useGetAnnouncementsQuery();
  const { data: unreadData, refetch: refetchCount } = useGetAnnouncementUnreadCountQuery();
  const { data: fetchedDetail, isLoading: isDetailLoading } = useGetAnnouncementDetailQuery(
    selectedId ?? '',
    { skip: !selectedId }
  );
  const [markRead] = useMarkAnnouncementReadMutation();

  useEffect(() => {
    let cancelled = false;

    async function loadStoredReadIds() {
      if (!userReadStorageKey) {
        setLocallyReadIds(new Set());
        return;
      }

      try {
        const rawValue = await SecureStore.getItemAsync(userReadStorageKey);
        if (cancelled || !rawValue) {
          if (!cancelled) {
            setLocallyReadIds(new Set());
          }
          return;
        }

        const parsed = JSON.parse(rawValue) as unknown;
        const ids = Array.isArray(parsed)
          ? parsed.filter((value): value is string => typeof value === 'string')
          : [];

        if (!cancelled) {
          setLocallyReadIds(new Set(ids));
        }
      } catch {
        if (!cancelled) {
          setLocallyReadIds(new Set());
        }
      }
    }

    loadStoredReadIds();

    return () => {
      cancelled = true;
    };
  }, [userReadStorageKey]);

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

  const visibleAnnouncements = useMemo(
    () => mergeReadState(fetchedAnnouncements, locallyReadIds),
    [fetchedAnnouncements, locallyReadIds]
  );

  const visibleDetail = useMemo<MobileAnnouncementDetail | undefined>(() => {
    if (!fetchedDetail) {
      return undefined;
    }

    return {
      ...fetchedDetail,
      read: fetchedDetail.read || locallyReadIds.has(fetchedDetail.id),
    };
  }, [fetchedDetail, locallyReadIds]);

  const unreadCount = useMemo(() => {
    const serverCount = unreadData?.count ?? 0;
    const locallyReadOnUnreadServerItems = fetchedAnnouncements.filter(
      (item) => !item.read && locallyReadIds.has(item.id)
    ).length;

    return Math.max(0, serverCount - locallyReadOnUnreadServerItems);
  }, [fetchedAnnouncements, locallyReadIds, unreadData?.count]);

  const persistReadIds = useCallback(
    (next: Set<string>) => {
      if (!userReadStorageKey) {
        return;
      }

      SecureStore.setItemAsync(userReadStorageKey, JSON.stringify([...next])).catch(() => {});
    },
    [userReadStorageKey]
  );

  const markAnnouncementAsRead = useCallback(
    (id: string, alreadyRead: boolean) => {
      setLocallyReadIds((current) => {
        if (current.has(id)) {
          return current;
        }

        const next = new Set(current);
        next.add(id);
        persistReadIds(next);
        return next;
      });

      if (!alreadyRead) {
        markRead(id).catch(() => {});
      }
    },
    [markRead, persistReadIds]
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
