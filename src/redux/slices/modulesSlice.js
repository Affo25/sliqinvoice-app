import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  modules: [],
  currentModule: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Async thunks for API calls
export const fetchModules = createAsyncThunk(
  'modules/fetchModules',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        status: filters.status || 'all',
        page: filters.page || 1,
        limit: filters.limit || 10
      });

      const response = await fetch(`/api/modules?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch modules');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createModule = createAsyncThunk(
  'modules/createModule',
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create module');
      }

      return data.module;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateModule = createAsyncThunk(
  'modules/updateModule',
  async ({ id, moduleData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/modules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update module');
      }

      return data.module;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteModule = createAsyncThunk(
  'modules/deleteModule',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete module');
      }

      return moduleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMultipleModules = createAsyncThunk(
  'modules/deleteMultipleModules',
  async (moduleIds, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/modules/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: moduleIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete modules');
      }

      return moduleIds;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportModules = createAsyncThunk(
  'modules/exportModules',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        search: filters.search || '',
        status: filters.status || 'all'
      });

      const response = await fetch(`/api/modules/export?${queryParams}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to export modules');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modules_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importModules = createAsyncThunk(
  'modules/importModules',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/modules/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import modules');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentModule: (state, action) => {
      state.currentModule = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch modules
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload.modules;
        state.totalCount = action.payload.totalCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create module
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update module
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.modules.findIndex(module => module.id === action.payload.id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete module
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(module => module.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete multiple modules
      .addCase(deleteMultipleModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMultipleModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(module => !action.payload.includes(module.id));
        state.totalCount -= action.payload.length;
      })
      .addCase(deleteMultipleModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Export modules
      .addCase(exportModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportModules.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Import modules
      .addCase(importModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importModules.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(importModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearError, setCurrentModule } = modulesSlice.actions;
export default modulesSlice.reducer;