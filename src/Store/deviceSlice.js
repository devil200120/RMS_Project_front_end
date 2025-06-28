// src/store/deviceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL, can be configured via environment variables
const API_URL = import.meta.env.VITE_API_URL 

// Axios instance with auth token interceptor
const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Async thunks
export const fetchDevices = createAsyncThunk(
  'device/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/devices');
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch devices');
    }
  }
);

export const registerDevice = createAsyncThunk(
  'device/registerDevice',
  async (deviceData, { rejectWithValue }) => {
    try {
      const res = await api.post('/devices/register', deviceData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register device');
    }
  }
);

export const updateDevice = createAsyncThunk(
  'device/updateDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/devices/${id}`, data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update device');
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'device/deleteDevice',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/devices/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete device');
    }
  }
);

export const sendDeviceCommand = createAsyncThunk(
  'device/sendCommand',
  async ({ deviceId, command }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/devices/${deviceId}/command`, { command });
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send command');
    }
  }
);

// Slice
const deviceSlice = createSlice({
  name: 'device',
  initialState: {
    items: [],
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
      // Fetch
      .addCase(fetchDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerDevice.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(registerDevice.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update
      .addCase(updateDevice.fulfilled, (state, action) => {
        const idx = state.items.findIndex(device => device._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.items = state.items.filter(device => device._id !== action.payload);
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Send Command
      .addCase(sendDeviceCommand.fulfilled, (state, action) => {
        // Optionally handle success feedback
      })
      .addCase(sendDeviceCommand.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = deviceSlice.actions;
export default deviceSlice.reducer;
