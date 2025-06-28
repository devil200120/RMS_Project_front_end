import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 

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

export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/content', { params });
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch content'
      );
    }
  }
);

export const uploadContent = createAsyncThunk(
  'content/uploadContent',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload content'
      );
    }
  }
);

export const updateContentStatus = createAsyncThunk(
  'content/updateContentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/content/${id}/status`, { status });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update content status'
      );
    }
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/content/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete content'
      );
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
    uploadProgress: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch content
      .addCase(fetchContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload content
      .addCase(uploadContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.uploadProgress = 0;
      })
      .addCase(uploadContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      // Update content status
      .addCase(updateContentStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete content
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export const { clearError, setUploadProgress, resetUploadProgress } = contentSlice.actions;
export default contentSlice.reducer;
