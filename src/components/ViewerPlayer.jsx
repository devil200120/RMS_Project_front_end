// src/components/ViewerPlayer.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  IconButton, 
  Button, 
  useTheme,
  Chip,
  Paper,
  Stack
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  Fullscreen, 
  Wifi, 
  WifiOff,
  PlayArrow,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';

const MEDIA_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ViewerPlayer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const videoRef = useRef();

  useEffect(() => {
    if (!user || user.role !== 'VIEWER') {
      navigate('/dashboard', { replace: true });
      return;
    }

    console.log('🔌 Initializing Socket.IO connection for viewer...');
    socketService.connect(user);

    return () => {
      socketService.cleanup();
    };
  }, [user, navigate]);

  const fetchContentFromAPI = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');

    try {
      const response = await fetch(`${MEDIA_URL}/api/schedules/current`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setContent(data.data);
        setError('');
      } else {
        setContent(null);
        setError(data.message || 'No active schedule');
      }
      
      setLastCheck(new Date());
    } catch (fetchError) {
      console.error('❌ Error fetching content:', fetchError);
      setContent(null);
      setError('Failed to fetch scheduled content');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const contentRefreshCleanup = socketService.on('content-refresh', (data) => {
      console.log('🔄 Content refresh event received:', data);
      toast.info(data.message || 'Checking for new content...');
      socketService.requestCurrentContent();
    });

    const contentBroadcastCleanup = socketService.on('current-content-broadcast', (data) => {
      console.log('📺 Content broadcast received:', data);
      
      if (data.success && data.data) {
        setContent(data.data);
        setError('');
        setLastCheck(new Date());
        toast.success(`Now playing: ${data.data.title}`);
      } else {
        setContent(null);
        setError(data.message || 'No active content');
        setLastCheck(new Date());
      }
    });

    const contentResponseCleanup = socketService.on('current-content-response', (data) => {
      console.log('📋 Content response received:', data);
      
      if (data.success && data.data) {
        setContent(data.data);
        setError('');
      } else {
        setContent(null);
        setError(data.message || 'No active content');
      }
      
      setLastCheck(new Date());
      setLoading(false);
    });

    fetchContentFromAPI();

    return () => {
      contentRefreshCleanup();
      contentBroadcastCleanup();
      contentResponseCleanup();
    };
  }, [fetchContentFromAPI]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    
    if (isConnected) {
      socketService.requestCurrentContent();
      setTimeout(() => {
        if (loading) {
          fetchContentFromAPI();
        }
      }, 2000);
    } else {
      fetchContentFromAPI();
    }
  }, [isConnected, loading, fetchContentFromAPI]);

  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const enterFullScreen = useCallback(() => {
    const el = videoRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen();
    }
  }, []);

  if (loading) {
    return (
      <FullScreen>
        <GlassBox>
          <ConnectionStatus isConnected={isConnected} />
          <CircularProgress sx={{ color: '#fff', mb: 2 }} />
          <Typography sx={{ color: '#fff' }}>Loading scheduled content...</Typography>
        </GlassBox>
      </FullScreen>
    );
  }

  if (error || !content) {
    return (
      <FullScreen>
        <GlassBox>
          <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
          <ConnectionStatus isConnected={isConnected} />
          
          <Alert severity="info" sx={{ mb: 2, width: '100%', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
            {error || 'No content scheduled at this time'}
          </Alert>
          
          {lastCheck && (
            <Typography sx={{ color: '#fff', mb: 2, opacity: 0.8 }}>
              Last checked: {lastCheck.toLocaleTimeString()}
            </Typography>
          )}
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              startIcon={<Refresh />}
              sx={{ bgcolor: 'rgba(25, 118, 210, 0.9)' }}
            >
              Check Again
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ color: '#fff', borderColor: '#fff' }}
            >
              Go Back
            </Button>
          </Stack>
        </GlassBox>
      </FullScreen>
    );
  }

  return (
    <FullScreen>
      <GlassBox>
        <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
        <ConnectionStatus isConnected={isConnected} />
        
        <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <PlayArrow color="primary" />
            <Typography variant="h5" color="primary" fontWeight="bold">
              {content.title}
            </Typography>
            {content.schedule?.name && (
              <Chip 
                label={content.schedule.name}
                color="secondary"
                size="small"
                icon={<ScheduleIcon />}
              />
            )}
          </Stack>
        </Paper>

        {content.type === 'video' && (
          <Box sx={{ position: 'relative', mb: 3, textAlign: 'center' }}>
            <video
              ref={videoRef}
              src={`${MEDIA_URL}/${content.filePath}`}
              controls 
              autoPlay 
              loop 
              muted
              style={{ 
                width: '90%', 
                maxWidth: 900, 
                borderRadius: 8, 
                outline: `3px solid ${theme.palette.primary.main}`,
                boxShadow: theme.shadows[8]
              }}
              onError={(e) => {
                console.error('Video playback error:', e);
                toast.error('Error playing video content');
              }}
            />
            <IconButton
              onClick={enterFullScreen}
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: '5%', 
                bgcolor: 'rgba(0,0,0,0.7)',
                color: '#fff'
              }}
            >
              <Fullscreen />
            </IconButton>
          </Box>
        )}

        {content.type === 'image' && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img
              src={`${MEDIA_URL}/${content.filePath}`}
              alt={content.title}
              style={{ 
                maxWidth: '90%', 
                maxHeight: '70vh',
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`,
                boxShadow: theme.shadows[8]
              }}
            />
          </Box>
        )}

        {content.type === 'url' && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <iframe
              src={content.url}
              style={{
                width: '90%',
                height: '70vh',
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`,
                border: 'none'
              }}
              title={content.title}
            />
          </Box>
        )}

        {content.type === 'html' && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <div
              dangerouslySetInnerHTML={{ __html: content.htmlContent }}
              style={{
                width: '90%',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`
              }}
            />
          </Box>
        )}

        <Paper elevation={2} sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              <strong>Type:</strong> {content.type.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Duration:</strong> {content.duration}s
            </Typography>
            {lastCheck && (
              <Typography variant="body2" color="text.secondary">
                <strong>Last Update:</strong> {lastCheck.toLocaleTimeString()}
              </Typography>
            )}
          </Stack>
        </Paper>
      </GlassBox>
    </FullScreen>
  );
}

const FullScreen = ({ children }) => (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    bgcolor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    overflow: 'auto'
  }}>
    {children}
  </Box>
);

const GlassBox = ({ children }) => (
  <Box sx={{
    position: 'relative',
    p: 4,
    bgcolor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 3,
    textAlign: 'center',
    minWidth: 320,
    maxWidth: '95vw',
    maxHeight: '95vh',
    overflow: 'auto',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  }}>
    {children}
  </Box>
);

const ActionButtons = ({ onBack, onRefresh }) => (
  <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
    <IconButton onClick={onBack} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
      <ArrowBack sx={{ color: '#fff' }} />
    </IconButton>
    <IconButton onClick={onRefresh} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
      <Refresh sx={{ color: '#fff' }} />
    </IconButton>
  </Box>
);

const ConnectionStatus = ({ isConnected }) => (
  <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
    <Chip
      icon={isConnected ? <Wifi /> : <WifiOff />}
      label={isConnected ? 'Live' : 'Offline'}
      color={isConnected ? 'success' : 'error'}
      size="small"
      sx={{ 
        bgcolor: isConnected ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
        color: '#fff'
      }}
    />
  </Box>
);
