const API_TUNNEL_URL = process.env.EXPO_PUBLIC_API_TUNNEL_URL?.trim();
const API_BASE_URL_FROM_ENV = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = API_TUNNEL_URL || API_BASE_URL_FROM_ENV || '';
