import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  transactions: [],
  recentTransactions: [],
  currentTransaction: null,
  loading: false,
  recentLoading: false,
  error: null,
  totalCount: 0,
  filters: {
    type: 'all',
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    accountId: null,
    categoryId: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0
  },
  // Report-specific state
  reportTransactions: [],
  reportLoading: false,
  reportFilters: {
    search: '',
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    page: 1
  },
  reportPagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0
  }
};

// Async thunks for API calls
export const fetchRecentTransactions = createAsyncThunk(
  'transactions/fetchRecentTransactions',
  async ({ limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions/recent?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent transactions');
      }

      return data.transactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ accountId, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        type: filters.type || 'all',
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`/api/accounts/${accountId}/transactions?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction');
      }

      return data.transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async ({ accountId, transactionData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transaction');
      }

      return data.transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update transaction');
      }

      return data.transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete transaction');
      }

      return transactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMultipleTransactions = createAsyncThunk(
  'transactions/deleteMultipleTransactions',
  async (transactionIds, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/transactions/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete transactions');
      }

      return transactionIds;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportTransactions = createAsyncThunk(
  'transactions/exportTransactions',
  async ({ accountId, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        type: filters.type || 'all',
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        export: 'true'
      });

      const response = await fetch(`/api/accounts/${accountId}/transactions?${queryParams}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to export transactions');
      }

      const data = await response.json();

      // Create CSV content
      const csvContent = [
        ['Date', 'Account Name', 'Account Type', 'Debit', 'Credit', 'Balance', 'Note', 'Created By'].join(','),
        ...data.transactions.map(transaction => [
          transaction.date,
          `"${transaction.account?.name || ''}"`,
          transaction.account?.type || '',
          transaction.debit || 0,
          transaction.credit || 0,
          transaction.balance || 0,
          `"${transaction.note || ''}"`,
          `"${transaction.createdBy?.name || ''}"`,
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_export_${accountId}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'Transactions exported successfully' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Accounts Report Async Thunks
export const fetchAccountsReport = createAsyncThunk(
  'transactions/fetchAccountsReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        type: filters.type || 'all',
        status: filters.status || 'all',
        category: filters.category || 'all',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        page: filters.page || 1,
        limit: 10
      });

      const response = await fetch(`/api/accounts/accounts-report?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch accounts report');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportAccountsReport = createAsyncThunk(
  'transactions/exportAccountsReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        type: filters.type || 'all',
        status: filters.status || 'all',
        category: filters.category || 'all',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        export: 'true'
      });

      const response = await fetch(`/api/accounts/accounts-report?${queryParams}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to export accounts report');
      }

      const data = await response.json();

      // Create CSV content
      const csvContent = [
        ['Date', 'Account Name', 'Account Type', 'Category', 'Status', 'Debit', 'Credit', 'Balance', 'Note'].join(','),
        ...data.transactions.map(transaction => [
          transaction.date,
          `"${transaction.account?.name || ''}"`,
          transaction.account?.type || '',
          `"${transaction.account?.category || ''}"`,
          transaction.account?.status || '',
          transaction.debit || 0,
          transaction.credit || 0,
          transaction.balance || 0,
          `"${transaction.note || ''}"`,
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounts_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'Accounts report exported successfully' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Transactions slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setReportFilters: (state, action) => {
      state.reportFilters = { ...state.reportFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.totalCount = 0;
      state.pagination = initialState.pagination;
    },
    clearRecentTransactions: (state) => {
      state.recentTransactions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recent Transactions
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.recentLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentTransactions = action.payload || [];
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.recentLoading = false;
        state.error = action.payload;
        state.recentTransactions = [];
      })

      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.transactions = [];
      })

      // Fetch Transaction By ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        // Update the transaction in the list if it exists
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentTransaction = null;
      })

      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction && state.currentTransaction.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentTransaction && state.currentTransaction.id === action.payload) {
          state.currentTransaction = null;
        }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Multiple Transactions
      .addCase(deleteMultipleTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMultipleTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(transaction => !action.payload.includes(transaction.id));
        state.totalCount -= action.payload.length;
      })
      .addCase(deleteMultipleTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export Transactions
      .addCase(exportTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportTransactions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Accounts Report
      .addCase(fetchAccountsReport.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountsReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.reportTransactions = action.payload.transactions || [];
        state.reportPagination = action.payload.pagination || state.reportPagination;
      })
      .addCase(fetchAccountsReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
        state.reportTransactions = [];
      })

      // Export Accounts Report
      .addCase(exportAccountsReport.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(exportAccountsReport.fulfilled, (state) => {
        state.reportLoading = false;
      })
      .addCase(exportAccountsReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  setReportFilters,
  clearFilters,
  setCurrentTransaction,
  clearCurrentTransaction,
  setLoading,
  clearTransactions,
  clearRecentTransactions
} = transactionsSlice.actions;

export default transactionsSlice.reducer;