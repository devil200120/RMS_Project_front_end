import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Settings, PowerSettingsNew } from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  fetchDevices,
  registerDevice,
  updateDevice,
  deleteDevice,
  sendDeviceCommand,
  clearError
} from '../Store/deviceSlice';

function DeviceManager() {
  const dispatch = useDispatch();
  const { items: devices, isLoading, error } = useSelector(state => state.device);
  
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    location: '',
    model: '',
    resolution: { width: 1920, height: 1080 },
    settings: {
      volume: 50,
      brightness: 80,
      autoUpdate: true
    }
  });

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpen = () => {
    setEditMode(false);
    setCurrentDevice(null);
    setFormData({
      name: '',
      deviceId: '',
      location: '',
      model: '',
      resolution: { width: 1920, height: 1080 },
      settings: {
        volume: 50,
        brightness: 80,
        autoUpdate: true
      }
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (device) => {
    setEditMode(true);
    setCurrentDevice(device);
    setFormData({
      name: device.name || '',
      deviceId: device.deviceId || '',
      location: device.location || '',
      model: device.model || '',
      resolution: device.resolution || { width: 1920, height: 1080 },
      settings: device.settings || {
        volume: 50,
        brightness: 80,
        autoUpdate: true
      }
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      dispatch(deleteDevice(id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: value
        }
      }));
    } else if (name.startsWith('resolution.')) {
      const resProp = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        resolution: {
          ...prev.resolution,
          [resProp]: parseInt(value)
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.deviceId) {
      toast.error('Name and Device ID are required');
      return;
    }
    
    const deviceData = { ...formData };
    
    if (editMode && currentDevice) {
      dispatch(updateDevice({ id: currentDevice._id, data: deviceData }));
    } else {
      dispatch(registerDevice(deviceData));
    }
    
    setOpen(false);
  };

  const handleCommandDialogOpen = (device) => {
    setCurrentDevice(device);
    setCommandDialogOpen(true);
  };

  const handleCommandDialogClose = () => {
    setCommandDialogOpen(false);
    setSelectedCommand('');
  };

  const handleSendCommand = () => {
    if (selectedCommand && currentDevice) {
      dispatch(sendDeviceCommand({
        deviceId: currentDevice._id,
        command: selectedCommand
      }));
      setCommandDialogOpen(false);
      setSelectedCommand('');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchDevices());
    toast.info('Devices refreshed');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Maintenance';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  // Commands available to send to devices
  const deviceCommands = [
    { value: 'restart', label: 'Restart Device' },
    { value: 'shutdown', label: 'Shutdown' },
    { value: 'update', label: 'Check for Updates' },
    { value: 'refresh', label: 'Refresh Content' },
    { value: 'screen_on', label: 'Turn Screen On' },
    { value: 'screen_off', label: 'Turn Screen Off' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Device Manager</Typography>
        <Box>
          <Tooltip title="Refresh devices">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Register Device
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Device ID</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Resolution</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(device => (
                  <TableRow key={device._id}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={device.deviceId} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(device.status)} 
                        color={getStatusColor(device.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {device.lastSeen ? 
                        new Date(device.lastSeen).toLocaleString() : 
                        'Never'}
                    </TableCell>
                    <TableCell>{device.model || 'Unknown'}</TableCell>
                    <TableCell>
                      {device.resolution ? 
                        `${device.resolution.width}x${device.resolution.height}` : 
                        'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit device">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(device)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send command">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleCommandDialogOpen(device)}
                          >
                            <PowerSettingsNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete device">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(device._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={devices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Device Registration/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Device' : 'Register New Device'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Device Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Device ID"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Display Settings
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Resolution Width"
                  name="resolution.width"
                  type="number"
                  value={formData.resolution.width}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Resolution Height"
                  name="resolution.height"
                  type="number"
                  value={formData.resolution.height}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Device Settings
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Volume"
                  name="settings.volume"
                  type="number"
                  value={formData.settings.volume}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Brightness"
                  name="settings.brightness"
                  type="number"
                  value={formData.settings.brightness}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="autoUpdate"
                      checked={formData.settings.autoUpdate}
                      onChange={handleToggleChange}
                      color="primary"
                    />
                  }
                  label="Auto Update"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Device Command Dialog */}
      <Dialog open={commandDialogOpen} onClose={handleCommandDialogClose}>
        <DialogTitle>Send Command to {currentDevice?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, minWidth: 300 }}>
            <InputLabel>Select Command</InputLabel>
            <Select
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
              label="Select Command"
            >
              {deviceCommands.map((cmd) => (
                <MenuItem key={cmd.value} value={cmd.value}>
                  {cmd.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommandDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSendCommand} 
            variant="contained"
            disabled={!selectedCommand}
          >
            Send Command
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DeviceManager;
