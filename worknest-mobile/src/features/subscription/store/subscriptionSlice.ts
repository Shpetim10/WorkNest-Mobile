import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCurrentSubscription } from '../api/subscriptionApi';
import type { Subscription } from '../types/subscription.types';

export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken;
    if (!token) {
      return rejectWithValue('No access token');
    }
    try {
      return await fetchCurrentSubscription(token);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message ?? 'Failed to fetch subscription');
    }
  }
);

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
        state.loading = false;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const subscriptionReducer = subscriptionSlice.reducer;
