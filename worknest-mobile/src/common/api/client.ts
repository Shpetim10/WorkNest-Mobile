import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@/common/config/network';

/**
 * Base API client for the application.
 * Aligned with Spring Boot backend structure.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Auth Token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // const token = await getToken(); // Implement in common/storage
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Global Logout or Token Refresh
    }
    return Promise.reject(error);
  }
);
