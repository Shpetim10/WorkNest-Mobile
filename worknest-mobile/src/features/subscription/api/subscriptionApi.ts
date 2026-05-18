import { api } from '@/common/api/client';
import type { ApiSuccessEnvelope } from '@/features/auth/types/contracts';
import type { Subscription } from '../types/subscription.types';

export async function fetchCurrentSubscription(accessToken: string): Promise<Subscription> {
  const response = await api.get<ApiSuccessEnvelope<Subscription>>('/api/subscriptions/current', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.data;
}
