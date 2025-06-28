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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  clearError,
} from '../Store/scheduleSlice';
import { fetchContent } from '../Store/contentSlice';

function ScheduleManager() {
  const dispatch = useDispatch();
  const { items: schedules, isLoading, error } = useSelector(state => state.schedule);
  const { items: contentItems } = useSelector(state => state.content);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timezone: 'UTC',
    repeat: 'none',
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

  const handleOpen = () => {
    setEditMode(false);
    setCurrentSchedule(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      timezone: 'UTC',
      repeat: 'none',
      contentIds: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (schedule) => {
    setEditMode(true);
    
    setCurrentSchedule(schedule);
    setFormData({
      name: schedule.name || '',
      description: schedule.description || '',
      startDate: schedule.startDate ? schedule.startDate.substring(0, 10) : '',
      endDate: schedule.endDate ? schedule.endDate.substring(0, 10) : '',
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      timezone: schedule.timezone || 'UTC',
      repeat: schedule.repeat || 'none',
      contentIds: schedule.content ? schedule.content.map(c => c.contentId) : [],
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      dispatch(deleteSchedule(id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentSelect = (e) => {
    setFormData(prev => ({ ...prev, contentIds: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in required fields');
      return;
    }
    const filteredContentIds = (formData.contentIds || [])
    .filter(id => id && (typeof id === 'string' || typeof id === 'object'))
    .map(id => typeof id === 'object' ? id._id || id.id : id);

  // Warn user if any contentId is missing
  if (filteredContentIds.length !== (formData.contentIds || []).length) {
    toast.error('One or more content items are missing a valid Content ID.');
    return;
  }

    const scheduleData = {
      ...formData,
      content: (formData.contentIds || []).map((id, idx) => ({
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Schedule Manager</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          New Schedule
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Content Count</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map(schedule => (
                <TableRow key={schedule._id}>
                  <TableCell>{schedule.name}</TableCell>
                  <TableCell>{schedule.description}</TableCell>
                  <TableCell>{new Date(schedule.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(schedule.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell>{schedule.content?.length || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={schedule.isActive ? 'Active' : 'Inactive'} 
                      color={schedule.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleEdit(schedule)}>
                      <Edit fontSize="small" /> Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(schedule._id)}>
                      <Delete fontSize="small" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                />
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Content</InputLabel>
                  <Select
                    multiple
                    name="contentIds"
                    value={formData.contentIds || []}
                    onChange={handleContentSelect}
                    renderValue={(selected) => 
                      selected.map(id => contentItems.find(c => c._id === id)?.title).join(', ')
                    }
                  >
                    {contentItems.map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        {item.title} ({item.type})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ScheduleManager;
