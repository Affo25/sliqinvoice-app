import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import invoicesReducer from './slices/invoicesSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';
import customersReducer from './slices/customersSlice';
import modulesReducer from './slices/modulesSlice';
import accountsReducer from './slices/accountsSlice';
import categoriesReducer from './slices/categoriesSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoicesReducer,
    ui: uiReducer,
    users: usersReducer,
    customers: customersReducer,
    modules: modulesReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 