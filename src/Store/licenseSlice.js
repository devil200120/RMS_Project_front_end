import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchLicenses = createAsyncThunk(
  'license/fetchLicenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/licenses', { params });
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch licenses'
      );
    }
  }
);

export const generateLicense = createAsyncThunk(
  'license/generateLicense',
  async (licenseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/licenses/generate', licenseData);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate license'
      );
    }
  }
);

export const validateLicense = createAsyncThunk(
  'license/validateLicense',
  async ({ key }, { rejectWithValue }) => {
    try {
      const response = await api.post('/licenses/validate', { key });
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to validate license'
      );
    }
  }
);

export const revokeLicense = createAsyncThunk(
  'license/revokeLicense',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/licenses/${id}/revoke`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to revoke license'
      );
    }
  }
);

export const getLicenseAnalytics = createAsyncThunk(
  'license/getLicenseAnalytics',
  async (timeframe = '30d', { rejectWithValue }) => {
    try {
      const response = await api.get(`/licenses/analytics?timeframe=${timeframe}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

const licenseSlice = createSlice({
  name: 'license',
  initialState: {
    items: [],
    stats: null,
    analytics: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch licenses
      .addCase(fetchLicenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLicenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchLicenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Generate license
      .addCase(generateLicense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateLicense.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.items = [...action.payload, ...state.items];
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(generateLicense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Validate license
      .addCase(validateLicense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateLicense.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(validateLicense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Revoke license
      .addCase(revokeLicense.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload);
        if (index !== -1) {
          state.items[index].isActive = false;
        }
      })
      // Analytics
      .addCase(getLicenseAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError } = licenseSlice.actions;
export default licenseSlice.reducer;
