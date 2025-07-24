import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import invoicesReducer from './slices/invoicesSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoicesReducer,
    ui: uiReducer,
    users: usersReducer,
    customers: customersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 