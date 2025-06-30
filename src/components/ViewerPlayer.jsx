// src/components/ViewerPlayer.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Box,
  Paper,
  Stack,
  Chip,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';

import {
  ArrowBack,
  Refresh,
  Fullscreen,
  Wifi,
  WifiOff,
  PlayArrow
} from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';

import { toast } from 'react-toastify';
import socketService from '../services/socketService';

const MEDIA_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ViewerPlayer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const videoRef = useRef(null);

  /* ───────────────────────── SOCKET SETUP ───────────────────────── */
  useEffect(() => {
    if (!user || user.role !== 'VIEWER') {
      navigate('/dashboard', { replace: true });
      return;
    }

    socketService.connect(user);

    const cleanConnection = socketService.on('connect-status', (flag) =>
      setIsConnected(flag)
    );

    return () => {
      cleanConnection();
      socketService.cleanup();
    };
  }, [user, navigate]);

  /* ───────────────────────── API FALLBACK ───────────────────────── */
  const fetchContentFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${MEDIA_URL}/api/schedules/current`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
        setError('');
      } else {
        setContent(null);
        setError(data.message || 'No active schedule');
      }
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
      setError('Failed to fetch scheduled content');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ───────────────────── SOCKET EVENT HANDLERS ──────────────────── */
  useEffect(() => {
    const cleanRefresh = socketService.on('content-refresh', () =>
      socketService.requestCurrentContent()
    );

    const cleanResponse = socketService.on('current-content-response', (d) => {
      if (d.success && d.data) {
        setContent(d.data);
        setError('');
      } else {
        setContent(null);
        setError(d.message || 'No active content');
      }
      setLastCheck(new Date());
      setLoading(false);
    });

    fetchContentFromAPI();

    return () => {
      cleanRefresh();
      cleanResponse();
    };
  }, [fetchContentFromAPI]);

  /* ───────────────────────── HANDLERS ───────────────────────── */
  const enterFullScreen = () => {
    const el = videoRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  const handleRefresh = () => {
    if (socketService.isConnected) socketService.requestCurrentContent();
    else fetchContentFromAPI();
  };

  const handleBack = () => navigate('/dashboard');

  /* ───────────────────────── RENDER ───────────────────────── */
  if (loading)
    return (
      <FullScreen>
        <GlassBox>
          <Connection isConnected={isConnected} />
          <CircularProgress sx={{ color: '#fff', mb: 2 }} />
          <Typography color="#fff">Loading scheduled content…</Typography>
        </GlassBox>
      </FullScreen>
    );

  if (error || !content)
    return (
      <FullScreen>
        <GlassBox>
          <HeaderButtons back={handleBack} refresh={handleRefresh} />
          <Connection isConnected={isConnected} />
          <Alert
            severity="info"
            sx={{ width: '100%', mb: 2, bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            {error || 'No content scheduled at this time'}
          </Alert>
          {lastCheck && (
            <Typography color="#fff" sx={{ opacity: 0.8, mb: 1 }}>
              Last checked: {lastCheck.toLocaleTimeString()}
            </Typography>
          )}
        </GlassBox>
      </FullScreen>
    );

  return (
    <FullScreen>
      <GlassBox>
        <HeaderButtons back={handleBack} refresh={handleRefresh} />
        <Connection isConnected={isConnected} />

        <Paper
          elevation={3}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 3,
            bgcolor: 'rgba(255,255,255,0.95)'
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
          >
            <PlayArrow color="primary" />
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{ maxWidth: '65vw' }}
              noWrap
            >
              {content.title}
            </Typography>
            {content.schedule?.name && (
              <Chip
                label={content.schedule.name}
                color="secondary"
                size="small"
              />
            )}
          </Stack>
        </Paper>

        {/* ───────────── VIDEO BLOCK ───────────── */}
        {content.type === 'video' && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 900,
              mx: 'auto',
              mb: 3
            }}
          >
            <video
              ref={videoRef}
              controls
              autoPlay
              loop
              muted
              preload="metadata"
              style={{
                width: '100%',
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`
              }}
              onError={() => toast.error('Error playing video')}
            >
              <source
                src={`${MEDIA_URL}/${content.filePath}`}
                type="video/mp4"
              />
              {/* Optional secondary format */}
              <source
                src={`${MEDIA_URL}/${content.filePath.replace('.mp4', '.webm')}`}
                type="video/webm"
              />
            </video>

            {/* Overlay controls (bottom-left) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex',
                gap: 1
              }}
            >
              <IconButton
                component="a"
                href={`${MEDIA_URL}/${content.filePath}`}
                download={
                  content.title ? `${content.title}.mp4` : 'downloaded-video.mp4'
                }
                sx={iconButtonStyle}
                aria-label="Download"
              >
                <DownloadIcon />
              </IconButton>

              <IconButton
                onClick={enterFullScreen}
                sx={iconButtonStyle}
                aria-label="Fullscreen"
              >
                <Fullscreen />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* ───────────── IMAGE BLOCK ───────────── */}
        {content.type === 'image' && (
          <Box textAlign="center" mb={3}>
            <img
              src={`${MEDIA_URL}/${content.filePath}`}
              alt={content.title}
              style={{
                width: '100%',
                maxWidth: 900,
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`
              }}
            />
          </Box>
        )}

        {/* ───────────── IFRAME / HTML BLOCKS ───────────── */}
        {content.type === 'url' && (
          <Box textAlign="center" mb={3}>
            <iframe
              src={content.url}
              title={content.title}
              style={{
                width: '100%',
                height: '65vh',
                border: 'none',
                borderRadius: 8,
                outline: `3px solid ${theme.palette.primary.main}`
              }}
            />
          </Box>
        )}

        {content.type === 'html' && (
          <Box mb={3} sx={{ textAlign: 'center' }}>
            <Box
              dangerouslySetInnerHTML={{ __html: content.htmlContent }}
              sx={{
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.95)',
                borderRadius: 2,
                outline: `3px solid ${theme.palette.primary.main}`
              }}
            />
          </Box>
        )}

        {/* ───────────── FOOTER INFO ───────────── */}
        <Paper elevation={2} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.9)' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
          >
            <Info label="Type" value={content.type.toUpperCase()} />
            <Info label="Duration" value={`${content.duration}s`} />
            {lastCheck && (
              <Info label="Last update" value={lastCheck.toLocaleTimeString()} />
            )}
          </Stack>
        </Paper>
      </GlassBox>
    </FullScreen>
  );
}

/* ───────────────────────── SMALL UTIL COMPONENTS ───────────────────────── */
const FullScreen = ({ children }) => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      bgcolor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      overflowY: 'auto'
    }}
  >
    {children}
  </Box>
);

const GlassBox = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      maxWidth: 960,
      bgcolor: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      p: { xs: 2, sm: 3 },
      borderRadius: 3,
      border: '1px solid rgba(255,255,255,0.25)'
    }}
  >
    {children}
  </Box>
);

const HeaderButtons = ({ back, refresh }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      display: 'flex',
      justifyContent: 'space-between'
    }}
  >
    <IconButton onClick={back} sx={iconButtonLight}>
      <ArrowBack />
    </IconButton>
    <IconButton onClick={refresh} sx={iconButtonLight}>
      <Refresh />
    </IconButton>
  </Box>
);

const Connection = ({ isConnected }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)'
    }}
  >
    <Chip
      icon={isConnected ? <Wifi /> : <WifiOff />}
      label={isConnected ? 'Live' : 'Offline'}
      color={isConnected ? 'success' : 'error'}
      size="small"
      sx={{
        bgcolor: isConnected ? 'rgba(76,175,80,0.95)' : 'rgba(244,67,54,0.9)',
        color: '#fff'
      }}
    />
  </Box>
);

const Info = ({ label, value }) => (
  <Typography variant="body2" color="text.secondary">
    <strong>{label}: </strong>
    {value}
  </Typography>
);

/* ───────────────────────── STYLES ───────────────────────── */
const iconButtonLight = {
  bgcolor: 'rgba(255,255,255,0.25)',
  color: '#fff',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }
};

const iconButtonStyle = {
  bgcolor: 'rgba(0,0,0,0.7)',
  color: '#fff',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
};
