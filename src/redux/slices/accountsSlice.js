import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  accounts: [],
  currentAccount: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    page: 1,
    limit: 10
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0
  }
};

// Async thunks for API calls
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        type: filters.type || 'all',
        status: filters.status || 'all',
        page: filters.page || 1,
        limit: filters.limit || 10
      });

      const response = await fetch(`/api/accounts?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch accounts');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'accounts/fetchAccountById',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch account');
      }

      return data.account;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      return data.account;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, accountData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update account');
      }

      return data.account;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      return accountId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportAccounts = createAsyncThunk(
  'accounts/exportAccounts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        type: filters.type || 'all',
        status: filters.status || 'all',
        export: 'true'
      });

      const response = await fetch(`/api/accounts?${queryParams}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to export accounts');
      }

      const data = await response.json();

      // Create CSV content
      const csvContent = [
        ['Name', 'Type', 'Description', 'Status', 'Created Date'].join(','),
        ...data.accounts.map(account => [
          `"${account.name}"`,
          account.type,
          `"${account.description || ''}"`,
          account.is_active ? 'Active' : 'Inactive',
          account.createdAt
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounts_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'Accounts exported successfully' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Accounts slice
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.accounts = [];
      })

      // Fetch Account By ID
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload;
        // Update the account in the list if it exists
        const index = state.accounts.findIndex(account => account.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAccount = null;
      })

      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex(account => account.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.currentAccount && state.currentAccount.id === action.payload.id) {
          state.currentAccount = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentAccount && state.currentAccount.id === action.payload) {
          state.currentAccount = null;
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Export Accounts
      .addCase(exportAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAccounts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentAccount,
  clearCurrentAccount,
  setLoading
} = accountsSlice.actions;

export default accountsSlice.reducer;