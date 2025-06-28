// src/store/scheduleSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Set your API URL (adjust if needed)
const API_URL = import.meta.env.VITE_API_URL

// Axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Thunks

export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/schedules');
      return res.data.data || res.data; // adjust depending on your backend response
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const res = await api.post('/schedules', scheduleData);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create schedule');
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/schedules/${id}`, data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update schedule');
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/schedules/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete schedule');
    }
  }
);

// Slice

const scheduleSlice = createSlice({
  name: 'schedule',
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
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update
      .addCase(updateSchedule.fulfilled, (state, action) => {
        const idx = state.items.findIndex(sch => sch._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.items = state.items.filter(sch => sch._id !== action.payload);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
