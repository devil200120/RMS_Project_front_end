import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import contentSlice from './contentSlice';
import scheduleSlice from './scheduleSlice';
import deviceSlice from './deviceSlice'; // Add this import

export const store = configureStore({
  reducer: {
    auth: authSlice,
    content: contentSlice,
    schedule: scheduleSlice,
    device: deviceSlice, // Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
