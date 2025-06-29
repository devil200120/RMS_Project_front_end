import React, { useEffect, useState } from 'react';
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
  Slide,
  Zoom,
  Backdrop,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary,
  Schedule,
  Devices,
  Person,
  ExitToApp,
  VpnKey,
  TrendingUp,
  Analytics,
  Notifications,
  Settings,
  Close,
  Brightness4,
  Brightness7,
  Home,
  NavigateNext
} from '@mui/icons-material';

import { logout } from '../Store/authSlice';
import { fetchContent } from '../Store/contentSlice';
import { generateLicense } from '../Store/licenseSlice';

// Custom styled components
const GlassCard = motion(Card);
const AnimatedPaper = motion(Paper);
const FloatingButton = motion(Button);

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: contentItems } = useSelector((state) => state.content);

  const [modalOpen, setModalOpen] = useState(false);
  const [licenseType, setLicenseType] = useState('MANAGER');
  const [newKey, setNewKey] = useState('');
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    dispatch(fetchContent({ limit: 5 }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGenerate = async () => {
    setIsLoadingKey(true);
    try {
      const [license] = await dispatch(
        generateLicense({ type: licenseType, maxUses: 1, count: 1 })
      ).unwrap();
      setNewKey(license.key);
    } catch (err) {
      console.error(err);
      setNewKey('Error generating key');
    } finally {
      setIsLoadingKey(false);
    }
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: DashboardIcon, 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Overview & Analytics'
    },
    { 
      name: 'Content', 
      href: '/content', 
      icon: VideoLibrary, 
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Media Management'
    },
    { 
      name: 'Schedules', 
      href: '/schedules', 
      icon: Schedule, 
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Time Management'
    },
    { 
      name: 'Devices', 
      href: '/devices', 
      icon: Devices, 
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Device Control'
    },
    ...(user?.role === 'ADMIN'
      ? [{ 
          name: 'Licenses', 
          href: '/licenses', 
          icon: VpnKey, 
          color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          description: 'License Management'
        }]
      : []),
  ];

  const getStatusColor = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    return 'warning';
  };

  const statsCards = [
    {
      title: 'Total Content',
      value: contentItems.length,
      icon: VideoLibrary,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      trend: '+12%'
    },
    {
      title: 'Approved',
      value: contentItems.filter(i => i.status === 'approved').length,
      icon: TrendingUp,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      trend: '+8%'
    },
    {
      title: 'Pending',
      value: contentItems.filter(i => i.status === 'pending').length,
      icon: Analytics,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      trend: '-3%'
    }
  ];

  return (
    <>
      {/* Enhanced AppBar with Breadcrumbs */}
      <AppBar 
        position="static" 
        sx={{
          background: alpha('#ffffff', 0.1),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#ffffff', 0.2)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <DashboardIcon sx={{ mr: 2, color: '#fff' }} />
          </motion.div>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
              Remote CMS Dashboard
            </Typography>
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" sx={{ color: alpha('#fff', 0.7) }} />}
              sx={{ color: alpha('#fff', 0.8) }}
            >
              <Link 
                underline="hover" 
                color="inherit" 
                href="/dashboard"
                sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
              >
                <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
                Dashboard
              </Link>
            </Breadcrumbs>
          </Box>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              color="inherit"
              onClick={() => setDarkMode(!darkMode)}
              sx={{ mr: 1 }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </motion.div>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar
              sx={{ 
                mr: 1, 
                bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                boxShadow: '0 0 20px rgba(240, 147, 251, 0.5)'
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              {user?.name} ({user?.role})
            </Typography>
          </Box>

          {user?.role === 'ADMIN' && (
            <FloatingButton
              color="inherit"
              startIcon={<VpnKey />}
              onClick={() => {
                setNewKey('');
                setModalOpen(true);
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 25px rgba(255, 255, 255, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              sx={{
                background: alpha('#ffffff', 0.1),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#ffffff', 0.2)}`,
                borderRadius: '25px',
                mr: 2,
              }}
            >
              Generate License
            </FloatingButton>
          )}

          <FloatingButton
            color="inherit"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            sx={{
              background: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
              borderRadius: '25px',
            }}
          >
            Logout
          </FloatingButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <GlassCard
                  sx={{
                    background: alpha('#ffffff', 0.1),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: stat.color,
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          background: stat.color,
                          borderRadius: '12px',
                          p: 1,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <stat.icon sx={{ color: '#fff', fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Chip
                        label={stat.trend}
                        size="small"
                        sx={{
                          background: stat.trend.startsWith('+') 
                            ? alpha('#43e97b', 0.2) 
                            : alpha('#f5576c', 0.2),
                          color: stat.trend.startsWith('+') ? '#43e97b' : '#f5576c',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </CardContent>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
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
                  transition={{ delay: (index + 3) * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <GlassCard
                    sx={{
                      cursor: 'pointer',
                      background: alpha('#ffffff', 0.1),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => navigate(item.href)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `${item.color}`,
                        opacity: 0.1,
                      }}
                    />
                    <CardContent sx={{ textAlign: 'center', zIndex: 1 }}>
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.1 
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon sx={{ fontSize: 48, mb: 2, color: '#fff' }} />
                      </motion.div>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
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
              transition={{ delay: 0.8 }}
            >
              <AnimatedPaper
                sx={{
                  p: 3,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                  Recent Content
                </Typography>
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
                            background: alpha('#ffffff', 0.05),
                            borderRadius: '12px',
                            border: `1px solid ${alpha('#ffffff', 0.1)}`,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {item.title}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ color: '#fff', opacity: 0.7 }}>
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
                            <Typography sx={{ color: '#fff', opacity: 0.7 }}>
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
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 25px rgba(255, 255, 255, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      color: '#fff',
                      borderColor: alpha('#ffffff', 0.3),
                      borderRadius: '25px',
                      '&:hover': {
                        borderColor: '#fff',
                        background: alpha('#ffffff', 0.1),
                      }
                    }}
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
              transition={{ delay: 0.9 }}
            >
              <AnimatedPaper
                sx={{
                  p: 3,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                  User Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 64,
                      height: 64,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                      fontSize: '24px',
                      fontWeight: 600,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8, mb: 1 }}>
                      {user?.email}
                    </Typography>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Chip
                        label={user?.role}
                        sx={{
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(67, 233, 123, 0.3)',
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
            onClose={() => setModalOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
              sx: { backdropFilter: 'blur(10px)' }
            }}
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
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    background: alpha('#ffffff', 0.1),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: '20px',
                    p: 4,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      Generate License Key
                    </Typography>
                    <IconButton
                      onClick={() => setModalOpen(false)}
                      sx={{ color: '#fff' }}
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#fff' }}>Role</InputLabel>
                    <Select
                      value={licenseType}
                      label="Role"
                      onChange={(e) => setLicenseType(e.target.value)}
                      sx={{
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#ffffff', 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#fff',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#fff',
                        },
                      }}
                    >
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="VIEWER">User</MenuItem>
                    </Select>
                  </FormControl>

                  <FloatingButton
                    variant="contained"
                    startIcon={isLoadingKey ? <CircularProgress size={20} /> : <VpnKey />}
                    fullWidth
                    onClick={handleGenerate}
                    disabled={isLoadingKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '25px',
                      py: 1.5,
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    {isLoadingKey ? 'Generating…' : 'Create 100-Char Key'}
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
                          InputProps={{ readOnly: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': {
                                borderColor: alpha('#ffffff', 0.3),
                              },
                              '&:hover fieldset': {
                                borderColor: '#fff',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#fff',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#fff',
                            },
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
};

export default Dashboard;
