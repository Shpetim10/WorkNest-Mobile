import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

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

export function useAnnouncementsScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tenantContext = useAppSelector(selectTenantContext);
  const companyId = tenantContext?.companyId ?? null;

  const {
    data: announcements = [],
    isLoading,
    refetch: refetchList,
  } = useGetAnnouncementsQuery();

  const { data: unreadData, refetch: refetchCount } = useGetAnnouncementUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

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

  const openDetail = useCallback(
    (item: MobileAnnouncementListItem) => {
      setSelectedId(item.id);
      if (!item.read) {
        markRead(item.id);
      }
    },
    [markRead]
  );

  const closeDetail = useCallback(() => setSelectedId(null), []);

  return {
    announcements,
    unreadCount,
    isLoading,
    selectedId,
    detail,
    isDetailLoading,
    openDetail,
    closeDetail,
  };
}