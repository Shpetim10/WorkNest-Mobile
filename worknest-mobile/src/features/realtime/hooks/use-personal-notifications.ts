import { useEffect, useRef } from 'react';
import { useRealtimeContext } from '../context/realtime-context';
import type { RealtimeEventEnvelope } from '../types';

export function usePersonalNotifications(
  onNotification: (envelope: RealtimeEventEnvelope) => void,
): void {
  const { subscribe } = useRealtimeContext();
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    return subscribe('/user/queue/notifications', (envelope: RealtimeEventEnvelope) => {
      callbackRef.current(envelope);
    });
  }, [subscribe]);
}
