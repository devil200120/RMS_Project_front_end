// src/components/ViewerPlayer.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Button
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import api from '../services/api';

function ViewerPlayer() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCheck, setLastCheck] = useState(null);

  // Redirect non-viewers
  useEffect(() => {
    if (!user || user.role !== 'VIEWER') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Fetch current schedule
  const fetchContent = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/schedules/current');
      if (res.data.success && res.data.data) {
        setContent(res.data.data);
        setError('');
      } else {
        setContent(null);
        setError(res.data.message || 'No active schedule');
      }
      setLastCheck(new Date());
    } catch {
      setContent(null);
      setError('Failed to fetch scheduled content');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(() => fetchContent(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => fetchContent(true);
  const handleBack = () => navigate('/dashboard');

  if (loading) {
    return (
      <FullScreen>
        <GlassBox>
          <CircularProgress size={60} color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: 'common.white' }}>
            Loading schedule...
          </Typography>
        </GlassBox>
      </FullScreen>
    );
  }

  if (error) {
    return (
      <FullScreen>
        <GlassBox>
          <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
          <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
          <Typography variant="h5" align="center" sx={{ mb: 1, color: 'common.white' }}>
            No scheduled content to play
          </Typography>
          {lastCheck && (
            <Typography variant="body2" align="center" sx={{ mb: 2, color: 'common.white' }}>
              Last checked: {lastCheck.toLocaleTimeString()}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="outlined" onClick={handleBack}>
              Go Back
            </Button>
          </Box>
        </GlassBox>
      </FullScreen>
    );
  }

  return (
    <FullScreen>
      <GlassBox>
        <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
        <Typography variant="h4" align="center" sx={{ mb: 3, color: 'common.white' }}>
          {content.title}
        </Typography>

        {/* Display content based on type */}
        {content.type === 'image' && (
          <Box
            component="img"
            src={`${api.defaults.baseURL}/${content.filePath}`}
            alt={content.title}
            sx={{ maxWidth: '80%', borderRadius: 2, mb: 3 }}
          />
        )}
        {content.type === 'video' && (
          <Box
            component="video"
            src={`${api.defaults.baseURL}/${content.filePath}`}
            controls
            autoPlay
            loop
            sx={{ maxWidth: '80%', borderRadius: 2, mb: 3 }}
          />
        )}
        {content.type === 'url' && (
          <Box
            component="iframe"
            src={content.url}
            title={content.title}
            sx={{ width: '80%', height: '60vh', border: 0, mb: 3 }}
          />
        )}
        {content.type === 'html' && (
          <Box
            sx={{
              width: '80%',
              height: '60vh',
              overflow: 'auto',
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              mb: 3
            }}
            dangerouslySetInnerHTML={{ __html: content.htmlContent }}
          />
        )}

        {content.filePath && (
          <Button
            variant="contained"
            onClick={() =>
              window.open(`${api.defaults.baseURL}/${content.filePath}`, '_blank')
            }
            sx={{ mb: 2 }}
          >
            Download
          </Button>
        )}

        {lastCheck && (
          <Typography variant="caption" sx={{ color: 'common.white' }}>
            Last updated: {lastCheck.toLocaleTimeString()}
          </Typography>
        )}
      </GlassBox>
    </FullScreen>
  );
}

const FullScreen = ({ children }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}
  >
    {children}
  </Box>
);

const GlassBox = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      width: { xs: '100%', sm: '80%', md: '60%', lg: '40%' },
      p: 4,
      bgcolor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: 2,
      textAlign: 'center'
    }}
  >
    {children}
  </Box>
);

const ActionButtons = ({ onBack, onRefresh }) => (
  <>
    <IconButton
      onClick={onBack}
      sx={{ position: 'absolute', top: 16, left: 16, bgcolor: 'rgba(255,255,255,0.3)' }}
      aria-label="Go back"
    >
      <ArrowBack sx={{ color: 'common.white' }} />
    </IconButton>
    <IconButton
      onClick={onRefresh}
      sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.3)' }}
      aria-label="Refresh content"
    >
      <Refresh sx={{ color: 'common.white' }} />
    </IconButton>
  </>
);

export default ViewerPlayer;
