import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  stats: {
    totalRevenue: 0,
    activeInvoices: 0,
    pendingPayments: 0,
    totalClients: 0,
  },
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setInvoices: (state, action) => {
      state.invoices = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    addInvoice: (state, action) => {
      state.invoices.unshift(action.payload);
    },
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
      if (state.currentInvoice?.id === action.payload.id) {
        state.currentInvoice = action.payload;
      }
    },
    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      if (state.currentInvoice?.id === action.payload) {
        state.currentInvoice = null;
      }
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setInvoices,
  setCurrentInvoice,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  setStats,
  setError,
  clearError,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;