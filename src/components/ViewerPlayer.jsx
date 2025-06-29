import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import api from '../services/api';

const glassBg = {
  background: 'rgba(255,255,255,0.09)',
  borderRadius: '32px',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  border: '1.5px solid rgba(255,255,255,0.18)',
  padding: '32px',
  maxWidth: '90vw',
  minWidth: '340px',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  animation: 'fadein 1.2s cubic-bezier(.4,0,.2,1)',
  position: 'relative'
};

const fadeKeyframes = `
@keyframes fadein {
  from { opacity: 0; transform: translateY(40px) scale(0.98);}
  to   { opacity: 1; transform: translateY(0) scale(1);}
}
`;

function ViewerPlayer() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  // Redirect non-viewers
  useEffect(() => {
    if (!user || user.role !== "VIEWER") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchContent = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/schedules/current');
      console.log('Schedule API response:', res.data);
      
      if (res.data.success && res.data.data) {
        setContent(res.data.data);
        setError(null);
      } else {
        setContent(null);
        setError(res.data.message || 'No active schedule');
      }
      setLastCheck(new Date());
    } catch (err) {
      console.error('Error fetching current schedule:', err);
      setContent(null);
      setError('Failed to fetch scheduled content');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // Refresh every 30 seconds to check for new schedules
    const interval = setInterval(() => fetchContent(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    if (content?.filePath) {
      const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');
      window.open(`${API_BASE}/${content.filePath}`, "_blank");
    } else if (content?.url) {
      window.open(content.url, "_blank");
    }
  };

  const handleRefresh = () => {
    fetchContent(true);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  // Add fade-in keyframes to document head once
  useEffect(() => {
    if (!document.getElementById('viewer-fadein-keyframes')) {
      const style = document.createElement('style');
      style.id = 'viewer-fadein-keyframes';
      style.innerHTML = fadeKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  const containerStyle = {
    position: "fixed", 
    left: 0, 
    top: 0, 
    width: "100vw", 
    height: "100vh",
    background: "linear-gradient(120deg, #2b5876 0%, #4e4376 100%)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center"
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={glassBg}>
          <CircularProgress sx={{ color: '#fff', mb: 2 }} size={60} />
          <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center' }}>
            Loading schedule...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={glassBg}>
          {/* Back Button */}
          <IconButton
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Refresh Button */}
          <IconButton
            onClick={handleRefresh}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <Refresh />
          </IconButton>

          <Alert 
            severity="info" 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              '& .MuiAlert-icon': { color: '#fff' },
              mb: 2
            }}
          >
            {error}
          </Alert>
          
          <Typography sx={{
            fontSize: 28, 
            fontWeight: 600, 
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.33)",
            textAlign: 'center'
          }}>
            No scheduled content to play
          </Typography>
          
          {lastCheck && (
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              mt: 2, 
              textAlign: 'center' 
            }}>
              Last checked: {lastCheck.toLocaleTimeString()}
            </Typography>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <button
              onClick={handleRefresh}
              style={{
                padding: "12px 32px",
                fontSize: "1rem",
                borderRadius: 24,
                background: "rgba(255,255,255,0.20)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.25s"
              }}
            >
              Refresh
            </button>

            <button
              onClick={handleGoBack}
              style={{
                padding: "12px 32px",
                fontSize: "1rem",
                borderRadius: 24,
                background: "rgba(255,255,255,0.20)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.25s"
              }}
            >
              Go Back
            </button>
          </Box>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={containerStyle}>
        <div style={glassBg}>
          {/* Back Button */}
          <IconButton
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>

          <Typography sx={{
            fontSize: 28, 
            fontWeight: 600, 
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.33)",
            textAlign: 'center'
          }}>
            No scheduled content to play
          </Typography>
        </div>
      </div>
    );
  }

  // Main display
  return (
    <div style={containerStyle}>
      <div style={glassBg}>
        {/* Back Button */}
        <IconButton
          onClick={handleGoBack}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Refresh Button */}
        <IconButton
          onClick={handleRefresh}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <Refresh />
        </IconButton>

        <h2 style={{
          color: "#fff", 
          letterSpacing: 1, 
          marginBottom: 24,
          textShadow: "0 2px 8px rgba(0,0,0,0.22)",
          marginTop: 40
        }}>
          {content.title}
        </h2>
        
        {content.type === "image" && (
          <img
            src={`${API_BASE}/${content.filePath}`}
            alt={content.title}
            style={{
              maxWidth: "64vw", 
              maxHeight: "50vh",
              borderRadius: "18px", 
              boxShadow: "0 2px 32px rgba(0,0,0,0.12)",
              marginBottom: 24, 
              transition: "box-shadow .3s"
            }}
          />
        )}
        
        {content.type === "video" && (
          <video
            src={`${API_BASE}/${content.filePath}`}
            controls
            autoPlay
            loop
            style={{
              maxWidth: "64vw", 
              maxHeight: "50vh",
              borderRadius: "18px", 
              boxShadow: "0 2px 32px rgba(0,0,0,0.12)",
              marginBottom: 24, 
              transition: "box-shadow .3s"
            }}
          />
        )}
        
        {content.type === "url" && (
          <iframe
            src={content.url}
            title={content.title}
            style={{
              width: "62vw", 
              height: "48vh",
              border: "none", 
              borderRadius: "16px",
              background: "#fff", 
              marginBottom: 24
            }}
          />
        )}
        
        {content.type === "html" && (
          <div
            dangerouslySetInnerHTML={{ __html: content.htmlContent }}
            style={{
              background: "rgba(255,255,255,0.7)", 
              color: "#222",
              padding: 32, 
              borderRadius: 16,
              maxWidth: "60vw", 
              maxHeight: "44vh", 
              overflow: "auto",
              marginBottom: 24, 
              boxShadow: "0 2px 24px rgba(0,0,0,0.10)"
            }}
          />
        )}
        
        <button
          onClick={handleDownload}
          style={{
            marginTop: 8,
            padding: "14px 44px",
            fontSize: "1.15rem",
            borderRadius: 32,
            background: "rgba(255,255,255,0.20)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.55)",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 1,
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            transition: "background .25s, color .25s, border .25s, box-shadow .25s"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.35)";
            e.currentTarget.style.color = "#222";
            e.currentTarget.style.border = "2px solid #fff";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.22)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.20)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.border = "2px solid rgba(255,255,255,0.55)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.18)";
          }}
        >
          Download
        </button>
        
        {lastCheck && (
          <Typography variant="caption" sx={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            mt: 2, 
            textAlign: 'center' 
          }}>
            Last updated: {lastCheck.toLocaleTimeString()}
          </Typography>
        )}
      </div>
    </div>
  );
}

export default ViewerPlayer;
