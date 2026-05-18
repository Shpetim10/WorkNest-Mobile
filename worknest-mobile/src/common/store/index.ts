import { configureStore } from '@reduxjs/toolkit';

import { authApi } from '@/features/auth/api/auth-api';
import { authReducer } from '@/features/auth/store/auth-slice';
import { payrollReducer } from '@/features/payroll/store/payroll-slice';
import { subscriptionReducer } from '@/features/subscription/store/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payroll: payrollReducer,
    subscription: subscriptionReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

