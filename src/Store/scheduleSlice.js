// src/store/scheduleSlice.js - ENHANCED & CORRECTED VERSION
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL;

// Enhanced Axios instance with better error handling
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor with auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced Async Thunks

export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filtering parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.timezone) queryParams.append('timezone', params.timezone);
      if (params.repeat) queryParams.append('repeat', params.repeat);
      if (params.search) queryParams.append('search', params.search);

      const url = queryParams.toString() ? `/schedules?${queryParams}` : '/schedules';
      const response = await api.get(url);
      
      return {
        schedules: response.data.data || response.data,
        pagination: response.data.pagination || null,
        filters: response.data.filters || {}
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch schedules';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      console.log('Creating schedule with data:', scheduleData);
      
      // Validate required fields before sending
      if (!scheduleData.name?.trim()) {
        throw new Error('Schedule name is required');
      }
      if (!scheduleData.contentIds || scheduleData.contentIds.length === 0) {
        throw new Error('At least one content item must be selected');
      }

      const response = await api.post('/schedules', scheduleData);
      
      // Show success toast
      toast.success(`Schedule "${scheduleData.name}" created successfully!`, {
        position: 'top-right',
        autoClose: 3000
      });
      
      return response.data.data || response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create schedule';
      
      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('Updating schedule:', id, 'with data:', data);
      
      const response = await api.put(`/schedules/${id}`, data);
      
      // Show success toast
      toast.success(`Schedule "${data.name}" updated successfully!`, {
        position: 'top-right',
        autoClose: 3000
      });
      
      return response.data.data || response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update schedule';
      
      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const schedule = state.schedule.items.find(s => s._id === id);
      const scheduleName = schedule?.name || 'Unknown';
      
      await api.delete(`/schedules/${id}`);
      
      // Show success toast
      toast.success(`Schedule "${scheduleName}" deleted successfully!`, {
        position: 'top-right',
        autoClose: 3000
      });
      
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete schedule';
      
      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// NEW: Get schedule statistics
export const fetchScheduleStatistics = createAsyncThunk(
  'schedule/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/schedules/statistics');
      return response.data.data || response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      return rejectWithValue(errorMessage);
    }
  }
);

// NEW: Get schedules by timezone
export const fetchSchedulesByTimezone = createAsyncThunk(
  'schedule/fetchByTimezone',
  async (timezone, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/timezone/${timezone}`);
      return response.data.data || response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch schedules by timezone';
      return rejectWithValue(errorMessage);
    }
  }
);

// Enhanced Schedule Slice

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    items: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    successMessage: null,
    currentSchedule: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {
      isActive: undefined,
      timezone: '',
      repeat: '',
      search: ''
    },
    statistics: {
      totalSchedules: 0,
      activeSchedules: 0,
      currentlyActiveSchedules: 0,
      averagePriority: 0
    }
  },
  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Set current schedule
    setCurrentSchedule: (state, action) => {
      state.currentSchedule = action.payload;
    },
    
    // Clear current schedule
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        isActive: undefined,
        timezone: '',
        repeat: '',
        search: ''
      };
    },
    
    // Reset all state
    resetScheduleState: (state) => {
      Object.assign(state, scheduleSlice.getInitialState());
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH SCHEDULES =====
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.schedules || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
        state.filters = { ...state.filters, ...action.payload.filters };
        state.error = null;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
      })
      
      // ===== CREATE SCHEDULE =====
      .addCase(createSchedule.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload); // Add to beginning of array
        state.successMessage = 'Schedule created successfully';
        state.error = null;
        
        // Update pagination total
        if (state.pagination.total !== undefined) {
          state.pagination.total += 1;
        }
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // ===== UPDATE SCHEDULE =====
      .addCase(updateSchedule.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(schedule => schedule._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = 'Schedule updated successfully';
        state.error = null;
        
        // Update current schedule if it's the one being updated
        if (state.currentSchedule?._id === action.payload._id) {
          state.currentSchedule = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // ===== DELETE SCHEDULE =====
      .addCase(deleteSchedule.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.items = state.items.filter(schedule => schedule._id !== action.payload);
        state.successMessage = 'Schedule deleted successfully';
        state.error = null;
        
        // Update pagination total
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
        
        // Clear current schedule if it was deleted
        if (state.currentSchedule?._id === action.payload) {
          state.currentSchedule = null;
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      
      // ===== FETCH STATISTICS =====
      .addCase(fetchScheduleStatistics.fulfilled, (state, action) => {
        state.statistics = { ...state.statistics, ...action.payload };
      })
      .addCase(fetchScheduleStatistics.rejected, (state, action) => {
        console.error('Failed to fetch schedule statistics:', action.payload);
      })
      
      // ===== FETCH BY TIMEZONE =====
      .addCase(fetchSchedulesByTimezone.fulfilled, (state, action) => {
        // This could be used for timezone-specific views
        state.items = action.payload;
      })
      .addCase(fetchSchedulesByTimezone.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ===== ENHANCED SELECTORS =====

// Basic selectors
export const selectAllSchedules = (state) => state.schedule.items;
export const selectScheduleLoading = (state) => state.schedule.isLoading;
export const selectScheduleError = (state) => state.schedule.error;
export const selectCurrentSchedule = (state) => state.schedule.currentSchedule;
export const selectPagination = (state) => state.schedule.pagination;
export const selectFilters = (state) => state.schedule.filters;
export const selectStatistics = (state) => state.schedule.statistics;

// Loading state selectors
export const selectIsCreating = (state) => state.schedule.isCreating;
export const selectIsUpdating = (state) => state.schedule.isUpdating;
export const selectIsDeleting = (state) => state.schedule.isDeleting;
export const selectAnyLoading = (state) => 
  state.schedule.isLoading || state.schedule.isCreating || 
  state.schedule.isUpdating || state.schedule.isDeleting;

// Memoized selectors using createSelector
export const selectActiveSchedules = createSelector(
  [selectAllSchedules],
  (schedules) => schedules.filter(schedule => schedule.isActive)
);

export const selectInactiveSchedules = createSelector(
  [selectAllSchedules],
  (schedules) => schedules.filter(schedule => !schedule.isActive)
);

export const selectSchedulesByTimezone = createSelector(
  [selectAllSchedules, (state, timezone) => timezone],
  (schedules, timezone) => schedules.filter(schedule => schedule.timezone === timezone)
);

export const selectSchedulesByRepeat = createSelector(
  [selectAllSchedules, (state, repeat) => repeat],
  (schedules, repeat) => schedules.filter(schedule => schedule.repeat === repeat)
);

export const selectSchedulesByPriority = createSelector(
  [selectAllSchedules],
  (schedules) => [...schedules].sort((a, b) => (b.priority || 1) - (a.priority || 1))
);

export const selectCurrentlyActiveSchedules = createSelector(
  [selectAllSchedules],
  (schedules) => schedules.filter(schedule => {
    if (!schedule.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    
    // Basic date range check (more sophisticated logic should be in backend)
    return now >= startDate && now <= endDate;
  })
);

export const selectScheduleById = createSelector(
  [selectAllSchedules, (state, id) => id],
  (schedules, id) => schedules.find(schedule => schedule._id === id)
);

// Search selector
export const selectFilteredSchedules = createSelector(
  [selectAllSchedules, selectFilters],
  (schedules, filters) => {
    let filtered = schedules;
    
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(schedule => schedule.isActive === filters.isActive);
    }
    
    if (filters.timezone) {
      filtered = filtered.filter(schedule => schedule.timezone === filters.timezone);
    }
    
    if (filters.repeat) {
      filtered = filtered.filter(schedule => schedule.repeat === filters.repeat);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.name.toLowerCase().includes(searchLower) ||
        (schedule.description && schedule.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }
);

// Export actions
export const { 
  clearError, 
  clearSuccessMessage, 
  setCurrentSchedule, 
  clearCurrentSchedule,
  updateFilters,
  clearFilters,
  resetScheduleState
} = scheduleSlice.actions;

// Export reducer
export default scheduleSlice.reducer;
