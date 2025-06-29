import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Chip,
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Fade,
  Backdrop,
  IconButton,
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary,
  Schedule,
  Devices,
  ExitToApp,
  VpnKey,
  TrendingUp,
  Analytics,
  Close,
  Brightness4,
  Brightness7,
  Home,
  NavigateNext,
  Refresh
} from '@mui/icons-material';

import { logout } from '../Store/authSlice';
import { fetchContent } from '../Store/contentSlice';
import { generateLicense } from '../Store/licenseSlice';

// Constants
const ANIMATION_DELAYS = {
  STATS: 0.1,
  NAVIGATION: 0.2,
  CONTENT: 0.8,
  USER_INFO: 0.9
};

const MODAL_STYLES = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  maxHeight: '90vh',
  overflow: 'auto'
};

// Custom styled components
const GlassCard = motion(Card);
const AnimatedPaper = motion(Paper);
const FloatingButton = motion(Button);

const Dashboard = React.memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: contentItems, loading } = useSelector((state) => state.content);

  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [licenseType, setLicenseType] = useState('MANAGER');
  const [newKey, setNewKey] = useState('');
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  // Memoized computations
  const statsCards = useMemo(() => [
    {
      title: 'Total Content',
      value: contentItems.length,
      icon: VideoLibrary,
      color: theme.palette.primary.main,
      trend: '+12%',
      ariaLabel: `Total content items: ${contentItems.length}`
    },
    {
      title: 'Approved',
      value: contentItems.filter(i => i.status === 'approved').length,
      icon: TrendingUp,
      color: theme.palette.success.main,
      trend: '+8%',
      ariaLabel: `Approved content: ${contentItems.filter(i => i.status === 'approved').length}`
    },
    {
      title: 'Pending',
      value: contentItems.filter(i => i.status === 'pending').length,
      icon: Analytics,
      color: theme.palette.warning.main,
      trend: '-3%',
      ariaLabel: `Pending content: ${contentItems.filter(i => i.status === 'pending').length}`
    }
  ], [contentItems, theme.palette]);

  const navigation = useMemo(() => [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: DashboardIcon, 
      color: theme.palette.primary.main,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Content', 
      href: '/content', 
      icon: VideoLibrary, 
      color: theme.palette.secondary.main,
      description: 'Media Management'
    },
    { 
      name: 'Schedules', 
      href: '/schedules', 
      icon: Schedule, 
      color: theme.palette.info.main,
      description: 'Time Management'
    },
    { 
      name: 'Devices', 
      href: '/devices', 
      icon: Devices, 
      color: theme.palette.success.main,
      description: 'Device Control'
    },
    ...(user?.role === 'ADMIN'
      ? [{ 
          name: 'Licenses', 
          href: '/licenses', 
          icon: VpnKey, 
          color: theme.palette.warning.main,
          description: 'License Management'
        }]
      : []),
  ], [user?.role, theme.palette]);

  // Effect hooks
  useEffect(() => {
    dispatch(fetchContent({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Event handlers
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleGenerate = useCallback(async () => {
    setIsLoadingKey(true);
    try {
      const [license] = await dispatch(
        generateLicense({ type: licenseType, maxUses: 1, count: 1 })
      ).unwrap();
      setNewKey(license.key);
    } catch (err) {
      console.error('License generation failed:', err);
      setNewKey('Error generating key');
    } finally {
      setIsLoadingKey(false);
    }
  }, [dispatch, licenseType]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setNewKey('');
  }, []);

  const handleModalOpen = useCallback(() => {
    setNewKey('');
    setModalOpen(true);
  }, []);

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const getStatusColor = useCallback((status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    return 'warning';
  }, []);

  const handleNavigation = useCallback((href) => {
    navigate(href);
  }, [navigate]);

  const handleRefreshContent = useCallback(() => {
    dispatch(fetchContent({ limit: 5 }));
  }, [dispatch]);

  // Glass effect styling
  const glassStyles = useMemo(() => ({
    background: alpha(theme.palette.background.paper, 0.1),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    borderRadius: theme.spacing(2.5),
    boxShadow: theme.shadows[8]
  }), [theme]);

  return (
    <>
      {/* Enhanced AppBar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          ...glassStyles,
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }}
      >
        <Toolbar>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <DashboardIcon 
              sx={{ mr: 2, color: theme.palette.primary.main }} 
              aria-label="Dashboard"
            />
          </motion.div>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.primary, 
                fontWeight: 600, 
                mb: 0.5 
              }}
            >
              Remote CMS Dashboard
            </Typography>
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" />}
              sx={{ color: theme.palette.text.secondary }}
              aria-label="breadcrumb navigation"
            >
              <Link 
                underline="hover" 
                color="inherit" 
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                role="button"
                tabIndex={0}
              >
                <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
                Dashboard
              </Link>
            </Breadcrumbs>
          </Box>

          <Tooltip title="Toggle dark mode">
            <IconButton
              color="inherit"
              onClick={handleDarkModeToggle}
              sx={{ mr: 1 }}
              aria-label="toggle dark mode"
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh content">
            <IconButton
              color="inherit"
              onClick={handleRefreshContent}
              disabled={loading}
              sx={{ mr: 1 }}
              aria-label="refresh content"
            >
              {loading ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar
              sx={{ 
                mr: 1, 
                bgcolor: theme.palette.secondary.main,
                boxShadow: theme.shadows[4]
              }}
              aria-label={`User avatar for ${user?.name}`}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>

          {user?.role === 'ADMIN' && (
            <Tooltip title="Generate new license key">
              <FloatingButton
                color="inherit"
                startIcon={<VpnKey />}
                onClick={handleModalOpen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  ...glassStyles,
                  mr: 2,
                  color: theme.palette.text.primary
                }}
                aria-label="generate license key"
              >
                Generate License
              </FloatingButton>
            </Tooltip>
          )}

          <Tooltip title="Sign out">
            <FloatingButton
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                ...glassStyles,
                color: theme.palette.text.primary
              }}
              aria-label="logout"
            >
              Logout
            </FloatingButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={stat.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * ANIMATION_DELAYS.STATS }}
                  whileHover={{ scale: 1.02 }}
                >
                  <GlassCard
                    sx={{
                      ...glassStyles,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    role="region"
                    aria-label={stat.ariaLabel}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: stat.color
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            background: stat.color,
                            borderRadius: theme.spacing(1.5),
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              mb: 0.5
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: theme.palette.text.primary,
                              fontWeight: 700 
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Chip
                          label={stat.trend}
                          size="small"
                          sx={{
                            bgcolor: stat.trend.startsWith('+') 
                              ? alpha(theme.palette.success.main, 0.2) 
                              : alpha(theme.palette.error.main, 0.2),
                            color: stat.trend.startsWith('+') 
                              ? theme.palette.success.main 
                              : theme.palette.error.main,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Navigation Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={item.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * ANIMATION_DELAYS.NAVIGATION }}
                  whileHover={{ scale: 1.03 }}
                >
                  <GlassCard
                    sx={{
                      ...glassStyles,
                      cursor: 'pointer',
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: alpha(item.color, 0.1)
                      }
                    }}
                    onClick={() => handleNavigation(item.href)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Navigate to ${item.name}: ${item.description}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNavigation(item.href);
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', zIndex: 1 }}>
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.1 
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon sx={{ 
                          fontSize: 48, 
                          mb: 2, 
                          color: item.color 
                        }} />
                      </motion.div>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: theme.palette.text.primary,
                          fontWeight: 600, 
                          mb: 1 
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {item.description}
                      </Typography>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Content Overview & User Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ANIMATION_DELAYS.CONTENT }}
            >
              <AnimatedPaper sx={{ ...glassStyles, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontWeight: 600 
                    }}
                  >
                    Recent Content
                  </Typography>
                  <Tooltip title="Refresh content list">
                    <IconButton 
                      onClick={handleRefreshContent}
                      disabled={loading}
                      size="small"
                      aria-label="refresh content list"
                    >
                      {loading ? <CircularProgress size={16} /> : <Refresh />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <List>
                  <AnimatePresence>
                    {contentItems.slice(0, 5).map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem
                          sx={{
                            mb: 1,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderRadius: theme.spacing(1.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ 
                                color: theme.palette.text.primary,
                                fontWeight: 500 
                              }}>
                                {item.title}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ 
                                color: theme.palette.text.secondary 
                              }}>
                                Type: {item.type} | Duration: {item.duration}s | By: {item.uploadedBy?.name}
                              </Typography>
                            }
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </motion.div>
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {contentItems.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Typography sx={{ 
                              color: theme.palette.text.secondary,
                              textAlign: 'center'
                            }}>
                              No content available
                            </Typography>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  )}
                </List>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <FloatingButton
                    variant="outlined"
                    onClick={() => navigate('/content')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      borderRadius: theme.spacing(3),
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                    aria-label="view all content"
                  >
                    View All Content
                  </FloatingButton>
                </Box>
              </AnimatedPaper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ANIMATION_DELAYS.USER_INFO }}
            >
              <AnimatedPaper sx={{ ...glassStyles, p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    fontWeight: 600, 
                    mb: 3 
                  }}
                >
                  User Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 64,
                      height: 64,
                      bgcolor: theme.palette.primary.main,
                      boxShadow: theme.shadows[4],
                      fontSize: '24px',
                      fontWeight: 600
                    }}
                    aria-label={`Avatar for ${user?.name}`}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ 
                      color: theme.palette.text.primary,
                      fontWeight: 600, 
                      fontSize: '18px' 
                    }}>
                      {user?.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        mb: 1 
                      }}
                    >
                      {user?.email}
                    </Typography>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Chip
                        label={user?.role}
                        sx={{
                          bgcolor: theme.palette.success.main,
                          color: theme.palette.success.contrastText,
                          fontWeight: 600,
                          boxShadow: theme.shadows[2]
                        }}
                      />
                    </motion.div>
                  </Box>
                </Box>
              </AnimatedPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* License Generation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            open={modalOpen}
            onClose={handleModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
              sx: { backdropFilter: 'blur(10px)' }
            }}
            aria-labelledby="license-modal-title"
            aria-describedby="license-modal-description"
          >
            <Fade in={modalOpen}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Box
                  sx={{
                    ...MODAL_STYLES,
                    ...glassStyles,
                    p: 4
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3 
                  }}>
                    <Typography 
                      id="license-modal-title"
                      variant="h6" 
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontWeight: 600 
                      }}
                    >
                      Generate License Key
                    </Typography>
                    <Tooltip title="Close modal">
                      <IconButton
                        onClick={handleModalClose}
                        sx={{ color: theme.palette.text.primary }}
                        aria-label="close modal"
                      >
                        <Close />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <FormControl fullWidth margin="normal">
                    <InputLabel 
                      sx={{ color: theme.palette.text.primary }}
                      id="license-type-label"
                    >
                      Role
                    </InputLabel>
                    <Select
                      labelId="license-type-label"
                      value={licenseType}
                      label="Role"
                      onChange={(e) => setLicenseType(e.target.value)}
                      sx={{
                        color: theme.palette.text.primary,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.divider, 0.3)
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="VIEWER">Viewer</MenuItem>
                    </Select>
                  </FormControl>

                  <FloatingButton
                    variant="contained"
                    startIcon={isLoadingKey ? 
                      <CircularProgress size={20} color="inherit" /> : 
                      <VpnKey />
                    }
                    fullWidth
                    onClick={handleGenerate}
                    disabled={isLoadingKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      mt: 2,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: theme.spacing(3),
                      py: 1.5,
                      fontWeight: 600,
                      boxShadow: theme.shadows[4],
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                    aria-label={isLoadingKey ? 'generating license key' : 'generate license key'}
                  >
                    {isLoadingKey ? 'Generating…' : 'Create License Key'}
                  </FloatingButton>

                  <AnimatePresence>
                    {newKey && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 100 }}
                      >
                        <TextField
                          label="New License Key"
                          value={newKey}
                          fullWidth
                          margin="normal"
                          InputProps={{ 
                            readOnly: true,
                            'aria-label': 'generated license key'
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: theme.palette.text.primary,
                              '& fieldset': {
                                borderColor: alpha(theme.palette.divider, 0.3)
                              },
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.main
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.text.primary
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            </Fade>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
