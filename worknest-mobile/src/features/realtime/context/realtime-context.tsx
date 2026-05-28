import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAppDispatch, useAppSelector } from '@/common/store/hooks';
import { selectIsAuthenticated, selectAuthState, selectTenantContext } from '@/features/auth';
import { REALTIME_BASE_URL } from '@/common/config/network';
import { authApi } from '@/features/auth/api/auth-api';
import { RealtimeEventType, type RealtimeEventEnvelope } from '../types';
import { createRealtimeClient } from '../lib/realtime-client';

function logRealtime(message: string, ...details: unknown[]) {
  if (__DEV__) {
    console.info(`[Realtime] ${message}`, ...details);
  }
}

interface RealtimeContextValue {
  client: Client | null;
  connected: boolean;
  subscribe: (
    destination: string,
    listener: (envelope: RealtimeEventEnvelope) => void,
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  client: null,
  connected: false,
  subscribe: () => () => undefined,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authState = useAppSelector(selectAuthState);
  const tenantContext = useAppSelector(selectTenantContext);
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const token = authState.accessToken;
  const companyId = tenantContext?.companyId ?? null;
  const clientRef = useRef<Client | null>(null);
  const connectedRef = useRef(false);
  const subscriptionsRef = useRef(new Map<string, StompSubscription>());
  const listenersRef = useRef(new Map<string, Set<(envelope: RealtimeEventEnvelope) => void>>());
  const seenEventKeysRef = useRef<string[]>([]);
  const seenEventKeySetRef = useRef(new Set<string>());

  const markEventSeen = useCallback((destination: string, eventId: string | null | undefined): boolean => {
    if (!eventId) {
      return false;
    }

    const eventKey = `${destination}:${eventId}`;

    if (seenEventKeySetRef.current.has(eventKey)) {
      return true;
    }

    seenEventKeySetRef.current.add(eventKey);
    seenEventKeysRef.current.push(eventKey);

    if (seenEventKeysRef.current.length > 200) {
      const oldestKey = seenEventKeysRef.current.shift();
      if (oldestKey) {
        seenEventKeySetRef.current.delete(oldestKey);
      }
    }

    return false;
  }, []);

  const routeRealtimeEvent = useCallback((envelope: RealtimeEventEnvelope) => {
    switch (envelope.type) {
      case RealtimeEventType.ANNOUNCEMENT_CREATED:
      case RealtimeEventType.ANNOUNCEMENT_DELETED:
        dispatch(authApi.util.invalidateTags(['Announcements', 'AnnouncementUnreadCount']));
        break;
      case RealtimeEventType.ATTENDANCE_CHECK_IN:
      case RealtimeEventType.ATTENDANCE_CHECK_OUT:
      case RealtimeEventType.ATTENDANCE_MANUAL_CHECK_IN:
      case RealtimeEventType.ATTENDANCE_MANUAL_CHECK_OUT:
      case RealtimeEventType.ATTENDANCE_EVENT_REVIEWED:
      case RealtimeEventType.ATTENDANCE_DAY_ADJUSTED:
        dispatch(authApi.util.invalidateTags(['AttendanceToday', 'AttendanceMonth']));
        break;
      case RealtimeEventType.LEAVE_REQUEST_SUBMITTED:
      case RealtimeEventType.LEAVE_REQUEST_APPROVED:
      case RealtimeEventType.LEAVE_REQUEST_REJECTED:
      case RealtimeEventType.LEAVE_REQUEST_CANCELLED:
        dispatch(authApi.util.invalidateTags(['LeaveBalance', 'LeaveRequests']));
        break;
      default:
        break;
    }
  }, [dispatch]);

  const clearTransportSubscriptions = useCallback(() => {
    for (const sub of subscriptionsRef.current.values()) {
      try {
        sub.unsubscribe();
      } catch {
        // The underlying connection may already be closed.
      }
    }
    subscriptionsRef.current.clear();
  }, []);

  const dispatchEnvelope = useCallback((destination: string, rawBody: string) => {
    try {
      const envelope = JSON.parse(rawBody) as RealtimeEventEnvelope;
      if (markEventSeen(destination, envelope.eventId)) {
        return;
      }

      routeRealtimeEvent(envelope);

      const listeners = listenersRef.current.get(destination);
      if (!listeners?.size) {
        return;
      }

      for (const listener of listeners) {
        listener(envelope);
      }
    } catch {
      console.warn('[STOMP] Unparseable message', rawBody);
    }
  }, [markEventSeen, routeRealtimeEvent]);

  const ensureSubscription = useCallback((destination: string) => {
    const activeClient = clientRef.current;
    const hasListeners = listenersRef.current.get(destination)?.size;

    if (!activeClient || !connectedRef.current || !hasListeners || subscriptionsRef.current.has(destination)) {
      return;
    }

    try {
      const subscription = activeClient.subscribe(destination, (message) => {
        dispatchEnvelope(destination, message.body);
      });
      subscriptionsRef.current.set(destination, subscription);
      logRealtime('Subscribed', destination);
    } catch (error) {
      console.warn('[STOMP] Subscribe failed', destination, error);
    }
  }, [dispatchEnvelope]);

  const subscribe = useCallback((destination: string, listener: (envelope: RealtimeEventEnvelope) => void) => {
    let destinationListeners = listenersRef.current.get(destination);

    if (!destinationListeners) {
      destinationListeners = new Set();
      listenersRef.current.set(destination, destinationListeners);
    }

    destinationListeners.add(listener);
    ensureSubscription(destination);

    return () => {
      const currentListeners = listenersRef.current.get(destination);
      if (!currentListeners) {
        return;
      }

      currentListeners.delete(listener);
      if (currentListeners.size > 0) {
        return;
      }

      listenersRef.current.delete(destination);

      const subscription = subscriptionsRef.current.get(destination);
      try {
        subscription?.unsubscribe();
      } catch {
        // Safe to ignore if the socket closed first.
      }
      subscriptionsRef.current.delete(destination);
    };
  }, [ensureSubscription]);

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token || !REALTIME_BASE_URL || appState !== 'active') {
      clearTransportSubscriptions();
      setClient((prev) => {
        prev?.deactivate();
        return null;
      });
      setConnected(false);
      return;
    }

    const newClient = createRealtimeClient(
      REALTIME_BASE_URL,
      token,
      () => {
        setConnected(true);
      },
      () => {
        clearTransportSubscriptions();
        setConnected(false);
      },
    );

    newClient.activate();
    setClient(newClient);

    return () => {
      clearTransportSubscriptions();
      newClient.deactivate();
      setClient(null);
      setConnected(false);
    };
  }, [appState, clearTransportSubscriptions, isAuthenticated, token]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    for (const destination of listenersRef.current.keys()) {
      ensureSubscription(destination);
    }
  }, [connected, ensureSubscription]);

  useEffect(() => {
    if (!companyId) {
      return;
    }

    const unsubscribeAnnouncements = subscribe(
      `/topic/companies/${companyId}/announcements`,
      () => undefined,
    );
    const unsubscribeAttendance = subscribe(
      `/topic/companies/${companyId}/attendance`,
      () => undefined,
    );
    const unsubscribeLeaveRequests = subscribe(
      `/topic/companies/${companyId}/leave-requests`,
      () => undefined,
    );

    return () => {
      unsubscribeAnnouncements();
      unsubscribeAttendance();
      unsubscribeLeaveRequests();
    };
  }, [companyId, subscribe]);

  useEffect(() => {
    return subscribe('/user/queue/notifications', () => undefined);
  }, [subscribe]);

  const value = useMemo<RealtimeContextValue>(() => ({
    client,
    connected,
    subscribe,
  }), [client, connected, subscribe]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  return useContext(RealtimeContext);
}
