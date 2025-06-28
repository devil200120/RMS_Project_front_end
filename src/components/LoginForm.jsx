import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  VpnKey,
  CheckCircle,
  Error as ErrorIcon,
  AutoAwesome,
  Security,
  Psychology,
  Fingerprint
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { login, register, clearError } from '../Store/authSlice';
import { validateLicense } from '../Store/licenseSlice';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated, user } = useSelector(s => s.auth);

  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeElements, setActiveElements] = useState(new Set());
  const cardRef = useRef(null);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'VIEWER', licenseKey: ''
  });

  const from = location.state?.from?.pathname || '/dashboard';

  // Advanced mouse tracking for spatial design effects
  const handleMouseMove = useCallback((e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'VIEWER') navigate('/viewer', { replace: true });
      else navigate(from, { replace: true });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error]);

  // Ultimate 2025 design system animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      @keyframes spatialFloat {
        0%, 100% { 
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
        }
        25% { 
          transform: perspective(1000px) rotateX(2deg) rotateY(1deg) translateZ(10px);
        }
        50% { 
          transform: perspective(1000px) rotateX(0deg) rotateY(-1deg) translateZ(15px);
        }
        75% { 
          transform: perspective(1000px) rotateX(-1deg) rotateY(2deg) translateZ(8px);
        }
      }
      
      @keyframes modernSkeuomorphism {
        0%, 100% { 
          box-shadow: 
            20px 20px 40px rgba(174, 174, 192, 0.3),
            -20px -20px 40px rgba(255, 255, 255, 0.8),
            inset 0 0 0 rgba(174, 174, 192, 0),
            inset 0 0 0 rgba(255, 255, 255, 0);
        }
        50% { 
          box-shadow: 
            25px 25px 50px rgba(174, 174, 192, 0.4),
            -25px -25px 50px rgba(255, 255, 255, 0.9),
            inset 0 0 0 rgba(174, 174, 192, 0),
            inset 0 0 0 rgba(255, 255, 255, 0);
        }
      }
      
      @keyframes aiGlow {
        0%, 100% { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          filter: hue-rotate(0deg) saturate(100%);
        }
        33% { 
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          filter: hue-rotate(60deg) saturate(120%);
        }
        66% { 
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          filter: hue-rotate(120deg) saturate(140%);
        }
      }
      
      @keyframes metalShader {
        0% { 
          background-position: -200% 0;
          filter: brightness(1) contrast(1);
        }
        50% {
          filter: brightness(1.2) contrast(1.1);
        }
        100% { 
          background-position: 200% 0;
          filter: brightness(1) contrast(1);
        }
      }
      
      @keyframes textTransition {
        0% { 
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }
        50% { 
          transform: translateY(-2px) scale(1.02);
          filter: blur(0.5px);
        }
        100% { 
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }
      }
      
      @keyframes morphingElement {
        0%, 100% { 
          border-radius: 2rem;
          transform: scale(1);
        }
        25% { 
          border-radius: 2.5rem 1.5rem 2rem 2.3rem;
          transform: scale(1.01);
        }
        50% { 
          border-radius: 1.8rem 2.4rem 1.9rem 2.1rem;
          transform: scale(0.99);
        }
        75% { 
          border-radius: 2.2rem 1.9rem 2.5rem 1.7rem;
          transform: scale(1.02);
        }
      }
      
      @keyframes interactive3D {
        0% { 
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
        }
        100% { 
          transform: perspective(1000px) rotateX(5deg) rotateY(3deg) scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleTab = (_, v) => {
    setTab(v); setStep(0); setLicenseInfo(null); dispatch(clearError());
  };
  
  const handleChange = e => {
    const { name, value } = e.target;
    if (tab === 0) setLoginData(ld => ({ ...ld, [name]: value }));
    else setRegData(rd => ({ ...rd, [name]: value }));
  };

  const handleLogin = e => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Fill all fields'); return;
    }
    dispatch(login(loginData));
  };

  const checkLicense = async () => {
    if (regData.role !== 'VIEWER' && !regData.licenseKey) {
      toast.error('License required'); return;
    }
    if (regData.role === 'VIEWER' && !regData.licenseKey) {
      setStep(2); return;
    }
    try {
      const res = await dispatch(validateLicense({ key: regData.licenseKey })).unwrap();
      setLicenseInfo(res.data);
      if (res.data.isValid && res.data.license.type === regData.role) {
        toast.success('License valid'); setStep(2);
      } else {
        toast.error(res.data.reason || 'Invalid license for role');
      }
    } catch {
      toast.error('License validation error');
    }
  };

  const handleRegister = e => {
    e.preventDefault();
    const { confirmPassword, ...payload } = regData;
    if (!payload.name || !payload.email || !payload.password) {
      toast.error('Fill all fields'); return;
    }
    if (payload.password !== confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (payload.password.length < 6) {
      toast.error('Password must be ≥6 chars'); return;
    }
    dispatch(register(payload));
  };

  // Ultimate 2025 styling system
  const accent = '#667eea';

  const containerStyles = {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, 
        rgba(102, 126, 234, 0.15) 0%, 
        rgba(118, 75, 162, 0.1) 40%, 
        transparent 70%),
      linear-gradient(135deg, 
        #667eea 0%, 
        #764ba2 100%)`,
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    animation: 'aiGlow 12s ease-in-out infinite',
    transition: 'background 0.5s ease'
  };

  const cardStyles = {
    background: '#e0e5ec',
    borderRadius: '2rem',
    p: 5,
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    animation: 'spatialFloat 8s ease-in-out infinite, modernSkeuomorphism 6s ease-in-out infinite',
    transformStyle: 'preserve-3d',
    transform: `perspective(1000px) rotateX(${(mousePos.y - 50) * 0.02}deg) rotateY(${(mousePos.x - 50) * 0.02}deg)`,
    transition: 'transform 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(135deg, 
          transparent 30%, 
          rgba(255, 255, 255, 0.1) 50%, 
          transparent 70%)`,
      backgroundSize: '200% 200%',
      animation: 'metalShader 4s ease-in-out infinite',
      borderRadius: 'inherit',
      pointerEvents: 'none'
    }
  };

  const titleStyles = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '3.5rem',
    fontWeight: 900,
    textAlign: 'center',
    mb: 1,
    color: '#4a5568',
    textShadow: `
      2px 2px 4px rgba(174, 174, 192, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.8)`,
    letterSpacing: '-0.05em',
    animation: 'textTransition 3s ease-in-out infinite',
    transform: 'translateZ(30px)'
  };

  const subtitleStyles = {
    fontFamily: '"Inter", sans-serif',
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#6b7280',
    textAlign: 'center',
    mb: 4,
    textShadow: `
      1px 1px 2px rgba(174, 174, 192, 0.2),
      -1px -1px 2px rgba(255, 255, 255, 0.7)`,
    transform: 'translateZ(20px)'
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      background: '#e0e5ec',
      borderRadius: '1.8rem',
      border: 'none',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      color: '#2d3748',
      boxShadow: `
        inset 8px 8px 16px rgba(174, 174, 192, 0.3),
        inset -8px -8px 16px rgba(255, 255, 255, 0.8)`,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'morphingElement 8s ease-in-out infinite',
      position: 'relative',
      overflow: 'hidden',
      transform: 'translateZ(10px)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-120%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
        transition: 'left 0.8s ease'
      },
      '&:hover': {
        animation: 'interactive3D 0.3s ease-out forwards, morphingElement 8s ease-in-out infinite',
        boxShadow: `
          inset 6px 6px 12px rgba(174, 174, 192, 0.2),
          inset -6px -6px 12px rgba(255, 255, 255, 0.9),
          0 8px 24px rgba(102, 126, 234, 0.15)`,
        '&::before': {
          left: '120%'
        }
      },
      '&.Mui-focused': {
        boxShadow: `
          inset 10px 10px 20px rgba(174, 174, 192, 0.4),
          inset -10px -10px 20px rgba(255, 255, 255, 0.9),
          0 12px 35px rgba(102, 126, 234, 0.25),
          0 0 0 3px rgba(102, 126, 234, 0.2)`,
        transform: 'translateZ(20px) scale(1.02)',
        '&::before': {
          left: '120%'
        }
      },
      '& fieldset': { border: 'none' }
    },
    '& .MuiInputLabel-root': {
      color: '#6b7280',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1rem',
      '&.Mui-focused': { color: accent }
    },
    '& .MuiOutlinedInput-input': {
      color: '#2d3748',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      padding: '20px'
    }
  };

  const buttonStyles = {
    background: '#e0e5ec',
    color: accent,
    border: 'none',
    borderRadius: '2rem',
    fontFamily: '"Inter", sans-serif',
    fontSize: '1.1rem',
    fontWeight: 800,
    padding: '18px 36px',
    width: '100%',
    boxShadow: `
      15px 15px 30px rgba(174, 174, 192, 0.4),
      -15px -15px 30px rgba(255, 255, 255, 0.9)`,
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    transform: 'translateZ(15px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-120%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent)`,
      transition: 'left 0.6s ease'
    },
    '&:hover': {
      animation: 'interactive3D 0.3s ease-out forwards',
      color: '#5a67d8',
      boxShadow: `
        18px 18px 36px rgba(174, 174, 192, 0.5),
        -18px -18px 36px rgba(255, 255, 255, 0.95),
        0 12px 30px rgba(102, 126, 234, 0.2)`,
      '&::before': {
        left: '120%'
      }
    },
    '&:active': {
      transform: 'translateZ(10px) scale(0.98)'
    }
  };

  const tabStyles = {
    '& .MuiTabs-root': {
      mb: 4,
      background: '#e0e5ec',
      borderRadius: '2rem',
      p: '12px',
      boxShadow: `
        inset 10px 10px 20px rgba(174, 174, 192, 0.3),
        inset -10px -10px 20px rgba(255, 255, 255, 0.8)`,
      transform: 'translateZ(10px)'
    },
    '& .MuiTab-root': {
      color: '#6b7280',
      fontFamily: '"Inter", sans-serif',
      fontSize: '1.1rem',
      fontWeight: 700,
      textTransform: 'none',
      borderRadius: '1.5rem',
      mx: '8px',
      minHeight: 50,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.15), transparent)',
        transition: 'left 0.5s ease'
      },
      '&:hover': {
        color: accent,
        boxShadow: `
          8px 8px 16px rgba(174, 174, 192, 0.3),
          -8px -8px 16px rgba(255, 255, 255, 0.8)`,
        transform: 'translateY(-2px)',
        '&::before': {
          left: '100%'
        }
      },
      '&.Mui-selected': {
        color: '#ffffff',
        background: accent,
        boxShadow: `
          10px 10px 20px rgba(174, 174, 192, 0.4),
          -10px -10px 20px rgba(255, 255, 255, 0.9)`,
        transform: 'translateY(-3px)',
        '&::before': {
          left: '100%'
        }
      }
    },
    '& .MuiTabs-indicator': { display: 'none' }
  };

  const stepperStyles = {
    '& .MuiStepIcon-root': {
      color: '#cbd5e1',
      fontSize: '2.5rem',
      borderRadius: '50%',
      background: '#e0e5ec',
      boxShadow: `
        12px 12px 24px rgba(174, 174, 192, 0.3),
        -12px -12px 24px rgba(255, 255, 255, 0.8)`,
      p: '15px',
      transition: 'all 0.6s ease',
      transform: 'translateZ(5px)',
      '&.Mui-active': {
        color: accent,
        boxShadow: `
          inset 8px 8px 16px rgba(174, 174, 192, 0.4),
          inset -8px -8px 16px rgba(255, 255, 255, 0.8)`,
        animation: 'modernSkeuomorphism 3s ease-in-out infinite',
        transform: 'translateZ(15px) scale(1.1)'
      },
      '&.Mui-completed': {
        color: '#10b981',
        boxShadow: `
          15px 15px 30px rgba(174, 174, 192, 0.4),
          -15px -15px 30px rgba(255, 255, 255, 0.9)`,
        transform: 'translateZ(10px) scale(1.05)'
      }
    },
    '& .MuiStepLabel-label': {
      color: '#6b7280',
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      fontWeight: 700,
      '&.Mui-active': { 
        color: accent, 
        fontWeight: 800,
        textShadow: `1px 1px 2px rgba(174, 174, 192, 0.3)`
      },
      '&.Mui-completed': { 
        color: '#10b981', 
        fontWeight: 800 
      }
    }
  };

  const chipStyles = {
    background: `linear-gradient(135deg, ${accent} 0%, #5a67d8 100%)`,
    color: '#ffffff',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transform: 'translateZ(15px)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
    animation: 'spatialFloat 4s ease-in-out infinite'
  };

  const alertStyles = {
    borderRadius: '1.5rem',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    background: '#e0e5ec',
    boxShadow: `
      12px 12px 24px rgba(174, 174, 192, 0.3),
      -12px -12px 24px rgba(255, 255, 255, 0.8)`,
    border: 'none',
    transform: 'translateZ(5px)'
  };

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Chip 
                icon={<Psychology />} 
                label="AI Enhanced" 
                sx={chipStyles}
              />
              <Typography variant="h5" sx={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 800, 
                color: '#2d3748',
                fontSize: '2rem',
                textShadow: `2px 2px 4px rgba(174, 174, 192, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.8)`
              }}>
                Personal Information
              </Typography>
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Full Name"
              value={regData.name}
              onChange={handleChange}
              disabled={isLoading}
              sx={inputStyles}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person sx={{ color: accent }} /></InputAdornment>
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              value={regData.email}
              onChange={handleChange}
              disabled={isLoading}
              sx={inputStyles}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: accent }} /></InputAdornment>
              }}
            />
            <FormControl fullWidth margin="normal" required sx={inputStyles}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={regData.role}
                onChange={handleChange}
                disabled={isLoading}
                sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600 }}
              >
                <MenuItem value="VIEWER">Viewer</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              sx={{ ...buttonStyles, mt: 4 }}
              onClick={() => setStep(1)}
              disabled={!regData.name || !regData.email || !regData.role}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome />
                Continue
              </Box>
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Chip 
                icon={<Security />} 
                label="Blockchain Verified" 
                sx={chipStyles}
              />
              <Typography variant="h5" sx={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 800, 
                color: '#2d3748',
                fontSize: '2rem',
                textShadow: `2px 2px 4px rgba(174, 174, 192, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.8)`
              }}>
                License Validation
              </Typography>
            </Box>
            {regData.role === 'VIEWER' ? (
              <Alert severity="info" sx={{ ...alertStyles, mb: 3 }}>
                License key is optional for Viewer role
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ ...alertStyles, mb: 3 }}>
                A valid license key is required for {regData.role} role
              </Alert>
            )}
            <TextField
              margin="normal"
              fullWidth
              name="licenseKey"
              label="License Key"
              value={regData.licenseKey}
              onChange={handleChange}
              disabled={isLoading}
              sx={inputStyles}
              InputProps={{
                startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: accent }} /></InputAdornment>
              }}
            />
            {licenseInfo && (
              <Alert
                severity={licenseInfo.isValid ? 'success' : 'error'}
                icon={licenseInfo.isValid ? <CheckCircle /> : <ErrorIcon />}
                sx={{ ...alertStyles, mt: 3 }}
              >
                {licenseInfo.isValid ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}>
                      Valid License Key
                    </Typography>
                    {licenseInfo.license && (
                      <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
                        Type: {licenseInfo.license.type} | Usage: {licenseInfo.license.currentUses}/{licenseInfo.license.maxUses}
                      </Typography>
                    )}
                  </>
                ) : (
                  licenseInfo.reason
                )}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStep(0)}
                sx={{
                  ...buttonStyles,
                  color: '#6b7280',
                  '&:hover': { color: accent }
                }}
              >
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={checkLicense}
                disabled={isLoading}
                sx={buttonStyles}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome />
                  {regData.role === 'VIEWER' && !regData.licenseKey ? 'Skip' : 'Validate License'}
                </Box>
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Chip 
                icon={<Fingerprint />} 
                label="Biometric Security" 
                sx={chipStyles}
              />
              <Typography variant="h5" sx={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 800, 
                color: '#2d3748',
                fontSize: '2rem',
                textShadow: `2px 2px 4px rgba(174, 174, 192, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.8)`
              }}>
                Security Setup
              </Typography>
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPwd ? 'text' : 'password'}
              value={regData.password}
              onChange={handleChange}
              disabled={isLoading}
              helperText="At least 6 characters"
              sx={inputStyles}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: accent }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd(!showPwd)}
                      edge="end"
                      sx={{ 
                        color: '#6b7280', 
                        '&:hover': { color: accent },
                        borderRadius: '50%',
                        background: '#e0e5ec',
                        boxShadow: `
                          6px 6px 12px rgba(174, 174, 192, 0.3),
                          -6px -6px 12px rgba(255, 255, 255, 0.8)`,
                        '&:active': {
                          boxShadow: `
                            inset 3px 3px 6px rgba(174, 174, 192, 0.3),
                            inset -3px -3px 6px rgba(255, 255, 255, 0.8)`
                        }
                      }}
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={regData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              sx={inputStyles}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: accent }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      edge="end"
                      sx={{ 
                        color: '#6b7280', 
                        '&:hover': { color: accent },
                        borderRadius: '50%',
                        background: '#e0e5ec',
                        boxShadow: `
                          6px 6px 12px rgba(174, 174, 192, 0.3),
                          -6px -6px 12px rgba(255, 255, 255, 0.8)`,
                        '&:active': {
                          boxShadow: `
                            inset 3px 3px 6px rgba(174, 174, 192, 0.3),
                            inset -3px -3px 6px rgba(255, 255, 255, 0.8)`
                        }
                      }}
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setStep(1)}
                sx={{
                  ...buttonStyles,
                  color: '#6b7280',
                  '&:hover': { color: accent }
                }}
              >
                Back
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={isLoading || !regData.password || !regData.confirmPassword}
                sx={buttonStyles}
              >
                {isLoading ? (
                  <CircularProgress size={28} sx={{ color: accent }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome />
                    Create Account
                  </Box>
                )}
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm" 
      sx={containerStyles}
      onMouseMove={handleMouseMove}
    >
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <Card 
          elevation={0} 
          sx={cardStyles}
          ref={cardRef}
        >
          <CardContent sx={{ position: 'relative', transformStyle: 'preserve-3d' }}>
            <Typography component="h1" variant="h2" sx={titleStyles}>
              Remote CMS
            </Typography>
            <Typography variant="h6" sx={subtitleStyles}>
              Next-Generation Content Management Platform
            </Typography>
            
            <Tabs value={tab} onChange={handleTab} centered sx={tabStyles}>
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
            
            <TabPanel value={tab} index={0}>
              <Box component="form" onSubmit={handleLogin}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Chip 
                    icon={<AutoAwesome />} 
                    label="AI Powered" 
                    sx={chipStyles}
                  />
                  <Typography variant="h5" sx={{ 
                    fontFamily: '"Inter", sans-serif', 
                    fontWeight: 800, 
                    color: '#2d3748',
                    fontSize: '2rem',
                    textShadow: `2px 2px 4px rgba(174, 174, 192, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.8)`
                  }}>
                    Secure Access
                  </Typography>
                </Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  value={loginData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email sx={{ color: accent }} /></InputAdornment>
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: accent }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPwd(!showPwd)}
                          edge="end"
                          sx={{ 
                            color: '#6b7280', 
                            '&:hover': { color: accent },
                            borderRadius: '50%',
                            background: '#e0e5ec',
                            boxShadow: `
                              6px 6px 12px rgba(174, 174, 192, 0.3),
                              -6px -6px 12px rgba(255, 255, 255, 0.8)`,
                            '&:active': {
                              boxShadow: `
                                inset 3px 3px 6px rgba(174, 174, 192, 0.3),
                                inset -3px -3px 6px rgba(255, 255, 255, 0.8)`
                            }
                          }}
                        >
                          {showPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ ...buttonStyles, mt: 4 }}
                >
                  {isLoading ? (
                    <CircularProgress size={28} sx={{ color: accent }} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesome />
                      Sign In
                    </Box>
                  )}
                </Button>
              </Box>
            </TabPanel>
            
            <TabPanel value={tab} index={1}>
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={step} alternativeLabel sx={stepperStyles}>
                  <Step>
                    <StepLabel>Information</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>License</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Security</StepLabel>
                  </Step>
                </Stepper>
              </Box>
              <Divider sx={{ 
                mb: 4, 
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(174, 174, 192, 0.3) 25%, 
                  rgba(255, 255, 255, 0.8) 50%, 
                  rgba(174, 174, 192, 0.3) 75%, 
                  transparent 100%)`,
                height: '2px',
                border: 'none',
                borderRadius: '1px',
                boxShadow: `
                  0 1px 2px rgba(174, 174, 192, 0.2),
                  0 -1px 2px rgba(255, 255, 255, 0.6)`
              }} />
              {getStepContent(step)}
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
