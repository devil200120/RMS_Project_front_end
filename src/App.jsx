import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import ViewerPlayer from './components/ViewerPlayer';

import { getProfile } from './Store/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ContentList from './components/ContentList';
import ScheduleManager from './components/ScheduleManager';
import DeviceManager from './components/DeviceManager';
import LicenseManager from './components/LicenseManager'; // Add this

function App() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { token, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (<>
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <ContentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute>
            <ScheduleManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <DeviceManager />
          </ProtectedRoute>
        }
      />
      {/* Add the new License Manager route */}
      <Route
        path="/licenses"
        element={
          <ProtectedRoute>
            <LicenseManager />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
      <Route path="/viewer" element={<ViewerPlayer />} />
    </Routes>
  </>);
}

export default App;
