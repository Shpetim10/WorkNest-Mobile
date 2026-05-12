import { Platform } from 'react-native';

function clean(value: string | undefined): string {
  return value?.trim() ?? '';
}

function firstNonEmpty(...values: (string | undefined)[]): string {
  return values.find((value) => Boolean(value && value.trim()))?.trim() ?? '';
}

const API_TUNNEL_URL = clean(process.env.EXPO_PUBLIC_API_TUNNEL_URL);
const API_BASE_URL_FROM_ENV = clean(process.env.EXPO_PUBLIC_API_BASE_URL);
const API_BASE_URL_ANDROID = clean(process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID);
const API_BASE_URL_IOS = clean(process.env.EXPO_PUBLIC_API_BASE_URL_IOS);
const API_BASE_URL_WEB = clean(process.env.EXPO_PUBLIC_API_BASE_URL_WEB);
const REALTIME_BASE_URL_FROM_ENV = clean(process.env.EXPO_PUBLIC_REALTIME_BASE_URL);
const REALTIME_BASE_URL_ANDROID = clean(process.env.EXPO_PUBLIC_REALTIME_BASE_URL_ANDROID);
const REALTIME_BASE_URL_IOS = clean(process.env.EXPO_PUBLIC_REALTIME_BASE_URL_IOS);
const REALTIME_BASE_URL_WEB = clean(process.env.EXPO_PUBLIC_REALTIME_BASE_URL_WEB);

function getPlatformValue(android: string, ios: string, web: string): string {
  if (Platform.OS === 'android') {
    return android;
  }

  if (Platform.OS === 'ios') {
    return ios;
  }

  return web;
}

const API_PLATFORM_BASE_URL = getPlatformValue(
  API_BASE_URL_ANDROID,
  API_BASE_URL_IOS,
  API_BASE_URL_WEB,
);

const REALTIME_PLATFORM_BASE_URL = getPlatformValue(
  REALTIME_BASE_URL_ANDROID,
  REALTIME_BASE_URL_IOS,
  REALTIME_BASE_URL_WEB,
);

export const API_BASE_URL = firstNonEmpty(
  API_TUNNEL_URL,
  API_PLATFORM_BASE_URL,
  API_BASE_URL_FROM_ENV,
);

export const REALTIME_BASE_URL = firstNonEmpty(
  API_TUNNEL_URL,
  REALTIME_PLATFORM_BASE_URL,
  REALTIME_BASE_URL_FROM_ENV,
  API_PLATFORM_BASE_URL,
  API_BASE_URL_FROM_ENV,
);

export const NETWORK_TIMEOUT_MS = 15000;
