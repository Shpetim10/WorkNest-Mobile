import { Client } from '@stomp/stompjs';

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.trim().replace(/\/+$/, '');
}

function logRealtime(message: string, ...details: unknown[]) {
  if (__DEV__) {
    console.info(`[Realtime] ${message}`, ...details);
  }
}

// React Native uses native WebSocket; append /websocket to bypass SockJS handshake
function buildWsUrl(apiBaseUrl: string): string {
  const normalizedBaseUrl = normalizeApiBaseUrl(apiBaseUrl);

  if (!normalizedBaseUrl) {
    throw new Error('Realtime requires a configured API base URL.');
  }

  return `${normalizedBaseUrl.replace(/^http/i, 'ws')}/ws/websocket`;
}

export function createRealtimeClient(
  apiBaseUrl: string,
  token: string,
  onConnected: (client: Client) => void,
  onDisconnected?: () => void,
): Client {
  const wsUrl = buildWsUrl(apiBaseUrl);
  logRealtime('Connecting', wsUrl);
  const client = new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    discardWebsocketOnCommFailure: true,
    onConnect: () => {
      logRealtime('Connected', wsUrl);
      onConnected(client);
    },
    onDisconnect: () => {
      logRealtime('Disconnected');
      onDisconnected?.();
    },
    onWebSocketClose: (event) => {
      logRealtime('WebSocket closed', event.code, event.reason);
      onDisconnected?.();
    },
    onWebSocketError: (event) => {
      logRealtime('WebSocket error', event.type);
      onDisconnected?.();
    },
    onStompError: (frame) => {
      logRealtime('STOMP error', frame.headers['message'], frame.body);
      console.error('[STOMP] error:', frame.headers['message'], frame.body);
    },
  });

  return client;
}
