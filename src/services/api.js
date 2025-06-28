// src/services/api.js

import axios from 'axios';

// Use Vite environment variable for API base URL
const API_URL = import.meta.env.VITE_API_URL 

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global response error handler (shows error messages, handles 401, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling here, e.g., logout on 401
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
