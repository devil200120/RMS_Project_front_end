// src/components/ViewerPlayer.jsx - ULTRA BEAUTIFUL CINEMATIC VERSION
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
  Stack,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  Fullscreen, 
  Wifi, 
  WifiOff,
  PlayArrow,
  Schedule as ScheduleIcon,
  VolumeUp,
  Favorite,
  Share,
  MoreVert
} from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';

const MEDIA_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Stunning particle animation background
const ParticleBackground = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)
        `,
        animation: 'particleFloat 6s ease-in-out infinite alternate',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 31%, rgba(255, 255, 255, 0.05) 33%, transparent 34%),
          linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.03) 31%, rgba(255, 255, 255, 0.03) 33%, transparent 34%)
        `,
        backgroundSize: '20px 20px',
        animation: 'shimmer 3s linear infinite',
      },
      '@keyframes particleFloat': {
        '0%': { transform: 'translateX(-10px) translateY(-10px)' },
        '100%': { transform: 'translateX(10px) translateY(10px)' }
      },
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '0% 0%' },
        '100%': { backgroundPosition: '100% 100%' }
      }
    }}
  />
);

// Beautiful loading animation
const CinematicLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    gap: 3
  }}>
    <Box sx={{
      position: 'relative',
      width: 80,
      height: 80,
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: '#fff',
        borderRightColor: '#fff',
        animation: 'spin 1s linear infinite',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '70%',
        height: '70%',
        top: '15%',
        left: '15%',
        borderRadius: '50%',
        border: '2px solid transparent',
        borderBottomColor: 'rgba(255, 255, 255, 0.6)',
        borderLeftColor: 'rgba(255, 255, 255, 0.6)',
        animation: 'spin 1.5s linear infinite reverse',
      },
      '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      }
    }} />
    <Box sx={{
      background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
      backgroundSize: '300% 300%',
      animation: 'gradientShift 3s ease infinite',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
      }
    }}>
      <Typography variant="h6" fontWeight="bold">
        Loading Cinematic Experience...
      </Typography>
    </Box>
  </Box>
);

export default function ViewerPlayer() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCheck, setLastCheck] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef();
  const containerRef = useRef();

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    let timer;
    if (showControls && !isHovered) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls, isHovered]);

  useEffect(() => {
    if (!user || user.role !== 'VIEWER') {
      navigate('/dashboard', { replace: true });
      return;
    }

    socketService.connect(user);
    return () => socketService.cleanup();
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
      toast.info(data.message || 'Checking for new content...', {
        style: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#fff'
        }
      });
      socketService.requestCurrentContent();
    });

    const contentResponseCleanup = socketService.on('current-content-response', (data) => {
      if (data.success && data.data) {
        setContent(data.data);
        setError('');
        toast.success(`✨ Now playing: ${data.data.title}`, {
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: '#fff'
          }
        });
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
      contentResponseCleanup();
    };
  }, [fetchContentFromAPI]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    if (socketService.isConnected) {
      socketService.requestCurrentContent();
    } else {
      fetchContentFromAPI();
    }
  }, [fetchContentFromAPI]);

  const handleBack = useCallback(() => navigate('/dashboard'), [navigate]);

  const enterFullScreen = useCallback(() => {
    const el = videoRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
  }, []);

  // Loading state with beautiful animation
  if (loading) {
    return (
      <CinematicContainer>
        <ParticleBackground />
        <UltraGlassBox>
          <ConnectionStatus isConnected={isConnected} />
          <CinematicLoader />
        </UltraGlassBox>
      </CinematicContainer>
    );
  }

  // Error state with stunning design
  if (error || !content) {
    return (
      <CinematicContainer>
        <ParticleBackground />
        <UltraGlassBox>
          <FloatingActionButtons onBack={handleBack} onRefresh={handleRefresh} />
          <ConnectionStatus isConnected={isConnected} />
          
          <Fade in timeout={800}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                width: '100%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                color: '#fff',
                '& .MuiAlert-icon': { color: '#fff' }
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                {error || 'No content scheduled at this time'}
              </Typography>
            </Alert>
          </Fade>
          
          {lastCheck && (
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              mb: 3,
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }}>
              Last checked: {lastCheck.toLocaleTimeString()}
            </Typography>
          )}
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <GlowButton 
              variant="contained" 
              onClick={handleRefresh}
              startIcon={<Refresh />}
            >
              Check Again
            </GlowButton>
            <GlowButton 
              variant="outlined" 
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Go Back
            </GlowButton>
          </Stack>
        </UltraGlassBox>
      </CinematicContainer>
    );
  }

  // Main content display with cinematic design
  return (
    <CinematicContainer 
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ParticleBackground />
      
      <UltraGlassBox>
        <Slide in={showControls} direction="down" timeout={300}>
          <Box>
            <FloatingActionButtons onBack={handleBack} onRefresh={handleRefresh} />
            <ConnectionStatus isConnected={isConnected} />
          </Box>
        </Slide>
        
        {/* Cinematic Content Header */}
        <Zoom in timeout={600}>
          <CinematicHeader elevation={0}>
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center" 
              justifyContent="center"
              flexWrap="wrap"
            >
              <PlayArrow sx={{ 
                fontSize: 32,
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 3s ease infinite',
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% center' },
                    '50%': { backgroundPosition: '200% center' }
                  }
                }}
              >
                {content.title}
              </Typography>
              {content.schedule?.name && (
                <Chip 
                  label={content.schedule.name}
                  icon={<ScheduleIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    '& .MuiChip-icon': { color: '#fff' }
                  }}
                />
              )}
            </Stack>
          </CinematicHeader>
        </Zoom>

        {/* Ultra Cinematic Video Player */}
        {content.type === 'video' && (
          <Fade in timeout={800}>
            <VideoContainer
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <video
                ref={videoRef}
                src={`${MEDIA_URL}/${content.filePath}`}
                controls 
                autoPlay 
                loop 
                muted
                style={{ 
                  width: '100%',
                  height: 'auto',
                  borderRadius: 16,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}
                onError={() => toast.error('Error playing video')}
              />
              
              {/* Floating Video Controls */}
              <Fade in={showControls || isHovered} timeout={300}>
                <VideoControls>
                  <Stack direction="row" spacing={1}>
                    <ControlButton
                      component="a"
                      href={`${MEDIA_URL}/${content.filePath}`}
                      download={content.title ? `${content.title}.mp4` : "video.mp4"}
                      aria-label="Download"
                    >
                      <DownloadIcon />
                    </ControlButton>
                    
                    <ControlButton onClick={() => {}} aria-label="Volume">
                      <VolumeUp />
                    </ControlButton>
                    
                    <ControlButton onClick={() => {}} aria-label="Favorite">
                      <Favorite />
                    </ControlButton>
                    
                    <ControlButton onClick={() => {}} aria-label="Share">
                      <Share />
                    </ControlButton>
                    
                    <ControlButton onClick={enterFullScreen} aria-label="Fullscreen">
                      <Fullscreen />
                    </ControlButton>
                    
                    <ControlButton onClick={() => {}} aria-label="More">
                      <MoreVert />
                    </ControlButton>
                  </Stack>
                </VideoControls>
              </Fade>
            </VideoContainer>
          </Fade>
        )}

        {/* Other content types with beautiful styling */}
        {content.type === 'image' && (
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img
                src={`${MEDIA_URL}/${content.filePath}`}
                alt={content.title}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  borderRadius: 16,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </Box>
          </Fade>
        )}

        {content.type === 'url' && (
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <iframe
                src={content.url}
                style={{
                  width: '100%',
                  height: '70vh',
                  borderRadius: 16,
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
                title={content.title}
              />
            </Box>
          </Fade>
        )}

        {content.type === 'html' && (
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                dangerouslySetInnerHTML={{ __html: content.htmlContent }}
                sx={{
                  width: '100%',
                  maxWidth: 900,
                  mx: 'auto',
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>
          </Fade>
        )}

        {/* Stunning Info Footer */}
        <Slide in direction="up" timeout={600}>
          <InfoFooter elevation={0}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center" 
              alignItems="center"
              flexWrap="wrap"
            >
              <InfoChip>
                <Typography variant="body2" fontWeight="bold">
                  Type: {content.type.toUpperCase()}
                </Typography>
              </InfoChip>
              <InfoChip>
                <Typography variant="body2" fontWeight="bold">
                  Duration: {content.duration}s
                </Typography>
              </InfoChip>
              {lastCheck && (
                <InfoChip>
                  <Typography variant="body2" fontWeight="bold">
                    Updated: {lastCheck.toLocaleTimeString()}
                  </Typography>
                </InfoChip>
              )}
            </Stack>
          </InfoFooter>
        </Slide>
      </UltraGlassBox>
    </CinematicContainer>
  );
}

// ===== STUNNING STYLED COMPONENTS =====

const CinematicContainer = ({ children, ...props }) => (
  <Box 
    {...props}
    sx={{
      position: 'fixed',
      inset: 0,
      background: `
        linear-gradient(135deg, 
          rgba(30, 30, 30, 0.95) 0%, 
          rgba(20, 20, 40, 0.98) 25%,
          rgba(10, 10, 30, 0.99) 50%,
          rgba(20, 20, 40, 0.98) 75%,
          rgba(30, 30, 30, 0.95) 100%
        ),
        radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 1, sm: 2 },
      overflow: 'auto',
      cursor: 'none'
    }}
  >
    {children}
  </Box>
);

const UltraGlassBox = ({ children }) => (
  <Box sx={{
    position: 'relative',
    width: '100%',
    maxWidth: 1200,
    background: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 100%
      )
    `,
    backdropFilter: 'blur(40px) saturate(150%)',
    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
    `,
    p: { xs: 2, sm: 4 },
    minHeight: '80vh',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
    }
  }}>
    {children}
  </Box>
);

const FloatingActionButtons = ({ onBack, onRefresh }) => (
  <Box sx={{ 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    right: 20, 
    display: 'flex', 
    justifyContent: 'space-between',
    zIndex: 10
  }}>
    <ControlButton onClick={onBack} sx={{ transform: 'scale(1.1)' }}>
      <ArrowBack />
    </ControlButton>
    <ControlButton onClick={onRefresh} sx={{ transform: 'scale(1.1)' }}>
      <Refresh />
    </ControlButton>
  </Box>
);

const ConnectionStatus = ({ isConnected }) => (
  <Box sx={{ 
    position: 'absolute', 
    top: 20, 
    left: '50%', 
    transform: 'translateX(-50%)',
    zIndex: 10
  }}>
    <Chip
      icon={isConnected ? <Wifi /> : <WifiOff />}
      label={isConnected ? 'Live' : 'Offline'}
      sx={{
        background: isConnected 
          ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
          : 'linear-gradient(135deg, #f44336, #d32f2f)',
        color: '#fff',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        '& .MuiChip-icon': { color: '#fff' },
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      }}
    />
  </Box>
);

const CinematicHeader = ({ children, ...props }) => (
  <Paper 
    {...props}
    sx={{ 
      p: 3, 
      mb: 4,
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
      textAlign: 'center'
    }}
  >
    {children}
  </Paper>
);

const VideoContainer = ({ children, ...props }) => (
  <Box 
    {...props}
    sx={{ 
      position: 'relative', 
      mb: 4, 
      textAlign: 'center',
      borderRadius: 3,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1))',
      p: 2
    }}
  >
    {children}
  </Box>
);

const VideoControls = ({ children }) => (
  <Box sx={{
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))',
    backdropFilter: 'blur(20px)',
    borderRadius: 3,
    p: 1,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
  }}>
    {children}
  </Box>
);

const ControlButton = ({ children, ...props }) => (
  <IconButton
    {...props}
    sx={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: '#fff',
      m: 0.5,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))',
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      },
      ...props.sx
    }}
  >
    {children}
  </IconButton>
);

const GlowButton = ({ children, ...props }) => (
  <Button
    {...props}
    sx={{
      background: props.variant === 'contained' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'transparent',
      border: props.variant === 'outlined' 
        ? '2px solid rgba(255, 255, 255, 0.3)' 
        : 'none',
      color: '#fff',
      backdropFilter: 'blur(20px)',
      borderRadius: 2,
      px: 3,
      py: 1.5,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: props.variant === 'contained' 
          ? '0 12px 35px rgba(102, 126, 234, 0.4)'
          : '0 12px 35px rgba(255, 255, 255, 0.2)',
        background: props.variant === 'contained'
          ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
          : 'rgba(255, 255, 255, 0.1)'
      }
    }}
  >
    {children}
  </Button>
);

const InfoFooter = ({ children, ...props }) => (
  <Paper 
    {...props}
    sx={{ 
      p: 2,
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      textAlign: 'center'
    }}
  >
    {children}
  </Paper>
);

const InfoChip = ({ children }) => (
  <Box sx={{
    px: 2,
    py: 1,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(20px)',
    borderRadius: 2,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff'
  }}>
    {children}
  </Box>
);
