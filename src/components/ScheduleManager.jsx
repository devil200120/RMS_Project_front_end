// ScheduleManager.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  Divider,
  Stack
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Schedule as ScheduleIcon,
  AccessTime,
  Public,
  Repeat,
  // FIX: Replaced Priority with Star icon
  Star
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  clearError,
} from '../Store/scheduleSlice';
import { fetchContent } from '../Store/contentSlice';

// Timezone options for India and common timezones
const timezoneOptions = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Mumbai', label: 'Mumbai Time (IST)' },
  { value: 'Asia/Delhi', label: 'Delhi Time (IST)' },
  { value: 'Asia/Calcutta', label: 'Calcutta Time (IST)' },
  { value: 'UTC', label: 'Universal Coordinated Time (UTC)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time' },
  { value: 'Asia/Kathmandu', label: 'Nepal Time' }
];

const repeatOptions = [
  { value: 'none', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const weekDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

function ScheduleManager() {
  const dispatch = useDispatch();
  const { items: schedules, isLoading, error } = useSelector(state => state.schedule);
  const { items: contentItems } = useSelector(state => state.content);
  const { user } = useSelector(state => state.auth);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timezone: 'Asia/Kolkata',
    repeat: 'none',
    weekDays: [],
    priority: 1,
    isActive: true,
    contentIds: [],
  });

  useEffect(() => {
    dispatch(fetchSchedules());
    dispatch(fetchContent());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Schedule name is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (!formData.contentIds || formData.contentIds.length === 0) {
      errors.contentIds = 'At least one content item must be selected';
    }
    
    if (formData.repeat === 'weekly' && (!formData.weekDays || formData.weekDays.length === 0)) {
      errors.weekDays = 'At least one week day must be selected for weekly schedules';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpen = () => {
    setEditMode(false);
    setCurrentSchedule(null);
    setFormErrors({});
    
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      name: '',
      description: '',
      startDate: today,
      endDate: today,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'Asia/Kolkata',
      repeat: 'none',
      weekDays: [],
      priority: 1,
      isActive: true,
      contentIds: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormErrors({});
  };

  const handleEdit = (schedule) => {
    setEditMode(true);
    setCurrentSchedule(schedule);
    setFormErrors({});
    
    setFormData({
      name: schedule.name || '',
      description: schedule.description || '',
      startDate: schedule.startDate ? schedule.startDate.substring(0, 10) : '',
      endDate: schedule.endDate ? schedule.endDate.substring(0, 10) : '',
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      timezone: schedule.timezone || 'Asia/Kolkata',
      repeat: schedule.repeat || 'none',
      weekDays: schedule.weekDays || [],
      priority: schedule.priority || 1,
      isActive: schedule.isActive !== undefined ? schedule.isActive : true,
      contentIds: schedule.content ? schedule.content.map(c => c.contentId._id || c.contentId) : [],
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      dispatch(deleteSchedule(id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentSelect = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, contentIds: typeof value === 'string' ? value.split(',') : value }));
    
    if (formErrors.contentIds) {
      setFormErrors(prev => ({ ...prev, contentIds: '' }));
    }
  };

  const handleWeekDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day]
    }));
    
    if (formErrors.weekDays) {
      setFormErrors(prev => ({ ...prev, weekDays: '' }));
    }
  };

  const handlePriorityChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, priority: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const scheduleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      timezone: formData.timezone,
      repeat: formData.repeat,
      weekDays: formData.repeat === 'weekly' ? formData.weekDays : [],
      priority: formData.priority,
      isActive: formData.isActive,
      content: formData.contentIds.map((id, idx) => ({
        contentId: id,
        order: idx,
        customDuration: 10
      }))
    };

    if (editMode && currentSchedule) {
      dispatch(updateSchedule({ id: currentSchedule._id, data: scheduleData }));
    } else {
      dispatch(createSchedule(scheduleData));
    }

    setOpen(false);
  };

  const getStatusChip = (schedule) => {
    if (!schedule.isActive) {
      return { label: 'Inactive', color: 'default' };
    }
    
    const now = new Date();
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    
    if (now < startDate) {
      return { label: 'Scheduled', color: 'info' };
    } else if (now > endDate) {
      return { label: 'Expired', color: 'error' };
    } else {
      return { label: 'Active', color: 'success' };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            Schedule Manager
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create and manage content schedules for your displays
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Add />} 
          onClick={handleOpen}
          sx={{ borderRadius: 2 }}
        >
          New Schedule
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>End Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time Range</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timezone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Content</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableHead>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No schedules found. Create your first schedule!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map(schedule => {
                  const statusChip = getStatusChip(schedule);
                  return (
                    <TableRow key={schedule._id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {schedule.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {schedule.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(schedule.startDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{new Date(schedule.endDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {schedule.startTime} - {schedule.endTime}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={schedule.timezone || 'Asia/Kolkata'} 
                          size="small" 
                          variant="outlined"
                          icon={<Public />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${schedule.content?.length || 0} items`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {/* FIX: Replaced Priority with Star icon */}
                        <Chip 
                          label={schedule.priority || 1}
                          size="small"
                          color="secondary"
                          icon={<Star />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusChip.label} 
                          color={statusChip.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(schedule._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            {editMode ? 'Edit Schedule' : 'Create New Schedule'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Schedule Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={1}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="primary" />
                  Date & Time Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.startDate}
                  helperText={formErrors.startDate}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.endDate}
                  helperText={formErrors.endDate}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.startTime}
                  helperText={formErrors.startTime}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.endTime}
                  helperText={formErrors.endTime}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    label="Timezone"
                  >
                    {timezoneOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Content Selection
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.contentIds}>
                  <InputLabel>Select Content</InputLabel>
                  <Select
                    multiple
                    name="contentIds"
                    value={formData.contentIds || []}
                    onChange={handleContentSelect}
                    renderValue={(selected) => 
                      selected.map(id => {
                        const item = contentItems.find(c => c._id === id);
                        return item ? `${item.title} (${item.type})` : 'Unknown';
                      }).join(', ')
                    }
                  >
                    {contentItems
                      .filter(item => item.status === 'approved')
                      .map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          <Checkbox checked={formData.contentIds.includes(item._id)} />
                          {item.title} ({item.type})
                        </MenuItem>
                      ))}
                  </Select>
                  {formErrors.contentIds && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {formErrors.contentIds}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Repeat color="primary" />
                  Repeat Settings
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Repeat</InputLabel>
                  <Select
                    name="repeat"
                    value={formData.repeat}
                    onChange={handleChange}
                    label="Repeat"
                  >
                    {repeatOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  Priority (1 = Low, 10 = High)
                </Typography>
                <Slider
                  value={formData.priority}
                  onChange={handlePriorityChange}
                  min={1}
                  max={10}
                  marks
                  step={1}
                  valueLabelDisplay="auto"
                  color="primary"
                />
              </Grid>

              {formData.repeat === 'weekly' && (
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Select Week Days:
                  </Typography>
                  <FormGroup row>
                    {weekDays.map((day) => (
                      <FormControlLabel
                        key={day.value}
                        control={
                          <Checkbox
                            checked={formData.weekDays.includes(day.value)}
                            onChange={() => handleWeekDayChange(day.value)}
                          />
                        }
                        label={day.label}
                      />
                    ))}
                  </FormGroup>
                  {formErrors.weekDays && (
                    <Typography variant="caption" color="error">
                      {formErrors.weekDays}
                    </Typography>
                  )}
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                  }
                  label="Schedule is Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} size="large">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            size="large"
            sx={{ minWidth: 120 }}
          >
            {editMode ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ScheduleManager;
