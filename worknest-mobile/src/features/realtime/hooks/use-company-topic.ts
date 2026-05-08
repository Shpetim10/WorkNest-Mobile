import { useEffect, useRef } from 'react';
import { useRealtimeContext } from '../context/realtime-context';
import type { RealtimeEventEnvelope } from '../types';

export function useCompanyTopic(
  companyId: string | null | undefined,
  resource: string,
  onMessage: (envelope: RealtimeEventEnvelope) => void,
  enabled = true,
): void {
  const { subscribe } = useRealtimeContext();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!companyId || !enabled) {
      return;
    }

    return subscribe(`/topic/companies/${companyId}/${resource}`, (envelope: RealtimeEventEnvelope) => {
      onMessageRef.current(envelope);
    });
  }, [companyId, enabled, resource, subscribe]);
}
