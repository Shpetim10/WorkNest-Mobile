import { configureStore, Middleware } from '@reduxjs/toolkit';

import { authApi } from '@/features/auth/api/auth-api';
import { payrollReducer } from '@/features/payroll/store/payroll-slice';
import { subscriptionReducer } from '@/features/subscription/store/subscriptionSlice';
import { authReducer, logoutCompleted } from '@/features/auth/store/auth-slice';

const logoutMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  if (action.type === logoutCompleted.type) {
    storeApi.dispatch(authApi.util.resetApiState());
  }
  return next(action);
};

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
