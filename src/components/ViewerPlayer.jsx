// src/components/ViewerPlayer.jsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Alert, CircularProgress, IconButton, Button, useTheme } from '@mui/material';
import { ArrowBack, Refresh, Fullscreen } from '@mui/icons-material';
import api, { MEDIA_URL } from '../services/api';

export default function ViewerPlayer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const videoRef = useRef();

  // Redirect non-viewers
  useEffect(() => {
    if (!user || user.role !== 'VIEWER') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Fetch scheduled content
  const fetchContent = useCallback(async (show = true) => {
    if (show) setLoading(true);
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
      if (show) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    const interval = setInterval(() => fetchContent(false), 30000);
    return () => clearInterval(interval);
  }, [fetchContent]);

  const handleRefresh = () => fetchContent(true);
  const handleBack    = () => navigate('/dashboard');

  const enterFullScreen = () => {
    const el = videoRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  // Loading state
  if (loading) {
    return (
      <FullScreen>
        <GlassBox>
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography sx={{ mt: 2, color: '#fff' }}>Loading schedule...</Typography>
        </GlassBox>
      </FullScreen>
    );
  }

  // Error or no content
  if (error) {
    return (
      <FullScreen>
        <GlassBox>
          <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
          <Alert severity="info" sx={{ mb: 2, width: '100%' }}>{error}</Alert>
          {lastCheck && <Typography sx={{ color: '#fff' }}>Last checked: {lastCheck.toLocaleTimeString()}</Typography>}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={handleRefresh}>Refresh</Button>
            <Button variant="outlined" onClick={handleBack}>Go Back</Button>
          </Box>
        </GlassBox>
      </FullScreen>
    );
  }

  // Main display
  return (
    <FullScreen>
      <GlassBox>
        <ActionButtons onBack={handleBack} onRefresh={handleRefresh} />
        <Typography variant="h4" sx={{ mb: 2, color: '#fff' }}>{content.title}</Typography>

        {/* Video */}
        {content.type === 'video' && (
          <Box sx={{ position: 'relative', mb: 3, textAlign: 'center' }}>
            <video
              ref={videoRef}
              src={`${MEDIA_URL}/${content.filePath}`}
              controls autoPlay loop muted
              style={{ width: '80%', maxWidth: 800, borderRadius: 8, outline: `2px solid ${theme.palette.divider}` }}
            />
            <IconButton
              onClick={enterFullScreen}
              sx={{ position: 'absolute', bottom: 16, right: '10%', bgcolor: 'rgba(0,0,0,0.5)' }}
              aria-label="Enter full screen"
            >
              <Fullscreen sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        )}

        {/* Image */}
        {content.type === 'image' && (
          <Box
            component="img"
            src={`${MEDIA_URL}/${content.filePath}`}
            alt={content.title}
            sx={{ maxWidth: '80%', borderRadius: 2, mb: 3 }}
          />
        )}

        {/* URL, HTML, and Download button omitted for brevity */}
      </GlassBox>
    </FullScreen>
  );
}

// Styled components
const FullScreen = ({ children }) => (
  <Box sx={{
    position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
    bgcolor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', p:2
  }}>{children}</Box>
);
const GlassBox = ({ children }) => (
  <Box sx={{
    position:'relative', p:4, bgcolor:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)',
    borderRadius:2, textAlign:'center', minWidth:300, maxWidth:'90vw'
  }}>{children}</Box>
);
const ActionButtons = ({ onBack, onRefresh }) => (
  <>
    <IconButton onClick={onBack} sx={{ position:'absolute',top:16,left:16,bgcolor:'rgba(255,255,255,0.3)' }}><ArrowBack sx={{ color:'#fff' }}/></IconButton>
    <IconButton onClick={onRefresh} sx={{ position:'absolute',top:16,right:16,bgcolor:'rgba(255,255,255,0.3)' }}><Refresh sx={{ color:'#fff' }}/></IconButton>
  </>
);
