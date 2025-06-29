import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, LinearProgress } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import { getProfile } from './Store/authSlice';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components for better performance
const LoginForm = lazy(() => import('./components/LoginForm'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ContentList = lazy(() => import('./components/ContentList'));
const ScheduleManager = lazy(() => import('./components/ScheduleManager'));
const DeviceManager = lazy(() => import('./components/DeviceManager'));
const LicenseManager = lazy(() => import('./components/LicenseManager'));
const ViewerPlayer = lazy(() => import('./components/ViewerPlayer'));

// Loading component
const PageLoader = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <CircularProgress size={60} sx={{ color: '#fff', mb: 2 }} />
    <LinearProgress 
      sx={{ 
        width: '200px', 
        '& .MuiLinearProgress-bar': { backgroundColor: '#fff' },
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
      }} 
    />
  </Box>
);

// Page transition animations
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <LoginForm />
              } 
            />
            
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
            
            <Route
              path="/licenses"
              element={
                <ProtectedRoute>
                  <LicenseManager />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/viewer" 
              element={
                <ProtectedRoute>
                  <ViewerPlayer />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={isAuthenticated ? 
                    (user?.role === 'VIEWER' ? "/viewer" : "/dashboard") : 
                    "/login"
                  } 
                  replace 
                />
              } 
            />
            
            {/* Catch-all route for client-side routing */}
            <Route 
              path="*" 
              element={
                <Navigate to="/" replace />
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
