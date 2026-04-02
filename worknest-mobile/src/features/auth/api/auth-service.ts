import { api } from '@/common/api/client';
// import { LoginRequest, AuthResponse } from '../types'; // Mock types

/**
 * Authentication Service
 * Aligned with Spring Boot AuthController.
 */
export const AuthService = {
  login: async (data: any) => {
    return api.post('/auth/login', data);
  },
  
  logout: async () => {
    return api.post('/auth/logout');
  },
};
