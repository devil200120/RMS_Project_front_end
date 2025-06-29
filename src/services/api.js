// src/services/api.js

import axios from 'axios';

// VITE_API_URL should point to your backend API (including “/api”)
// e.g. VITE_API_URL=https://your-backend.com/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an Axios instance for JSON API calls
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

// Optional: Global response error handler (e.g., logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: if server returns 401, clear token and redirect
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// Export a separate constant for serving static media (uploads)
export const MEDIA_URL = API_URL.replace(/\/api$/, '');

// Usage:
//   import api, { MEDIA_URL } from './services/api';
//   api.get('/content')
//   <video src={`${MEDIA_URL}/${filePath}`} />

export default api;
