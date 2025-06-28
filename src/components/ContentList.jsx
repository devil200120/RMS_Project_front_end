import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../styles/ContentList.css"
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
  Chip,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardMedia,
  Avatar,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  CloudUpload,
  Delete,
  Edit,
  Visibility,
  VideoLibrary,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

import { logout } from '../Store/authSlice';
import { 
  fetchContent, 
  uploadContent, 
  updateContentStatus, 
  deleteContent,
  clearError,
  resetUploadProgress 
} from '../Store/contentSlice';

const ContentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, isLoading, error, uploadProgress, pagination } = useSelector((state) => state.content);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    duration: 10,
    url: '',
    htmlContent: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    dispatch(fetchContent());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-detect content type
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, type: 'image' }));
      } else if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, type: 'video' }));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm', '.mkv'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
  });

  const handleOpen = () => {
    setOpen(true);
    dispatch(resetUploadProgress());
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'image',
      duration: 10,
      url: '',
      htmlContent: '',
      tags: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    dispatch(resetUploadProgress());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (formData.type !== 'url' && formData.type !== 'html' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (formData.type === 'url' && !formData.url) {
      toast.error('URL is required');
      return;
    }

    if (formData.type === 'html' && !formData.htmlContent) {
      toast.error('HTML content is required');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('duration', formData.duration);
    
    if (formData.url) {
      formDataToSend.append('url', formData.url);
    }
    
    if (formData.htmlContent) {
      formDataToSend.append('htmlContent', formData.htmlContent);
    }
    
    if (formData.tags) {
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim())));
    }
    
    if (selectedFile) {
      formDataToSend.append('file', selectedFile);
    }
    
    try {
      await dispatch(uploadContent(formDataToSend)).unwrap();
      toast.success('Content uploaded successfully');
      handleClose();
      dispatch(fetchContent());
    } catch (error) {
      toast.error(error || 'Upload failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateContentStatus({ id, status })).unwrap();
      toast.success(`Content ${status} successfully`);
      dispatch(fetchContent()); // Add this line to refresh the list
    } catch (error) {
      toast.error(error || 'Status update failed');
    }
  };
  

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await dispatch(deleteContent(id)).unwrap();
        toast.success('Content deleted successfully');
        dispatch(fetchContent()); // Add this line to refresh the list
      } catch (error) {
        toast.error(error || 'Delete failed');
      }
    }
  };
  

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const canManageContent = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canApproveContent = user?.role === 'ADMIN';

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <VideoLibrary sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} className="gradient-text">
            Content Library
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }} >
            {user?.name} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <div className="contentlist-glass">
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography component="h2" variant="h5" color="primary">
              Content Library ({items.length})
            </Typography>
            {canManageContent && (
              <Button className='neo-btn'
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpen}
              >
                Upload Content
              </Button>
            )}
          </Box>

          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          <TableContainer>
            <Table className='fancy-table'>
              <TableHead>
                <TableRow>
                  <TableCell>Preview</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.type === 'image' && item.filePath ? (
                        <Avatar
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${item.filePath}`}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
                          {item.type.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item.title}</Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary">
                          {item.description.substring(0, 50)}
                          {item.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={item.type} size="small" />
                    </TableCell>
                    <TableCell>{item.duration}s</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.uploadedBy?.name}</TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {canApproveContent && item.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handleStatusUpdate(item._id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleStatusUpdate(item._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {canManageContent && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No content available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        </div>
      </Container>

      {/* Upload Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Upload New Content</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                className="animated-input"
                  autoFocus
                  margin="dense"
                  name="title"
                  label="Title"
                  fullWidth
                  variant="outlined"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                className="animated-input"
                  margin="dense"
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="image">Image</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="html">HTML</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                className="animated-input"
                  margin="dense"
                  name="duration"
                  label="Duration (seconds)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.duration}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 3600 }}
                />
              </Grid>

              {formData.type === 'url' && (
                <Grid item xs={12}>
                  <TextField
                  className="animated-input"
                    margin="dense"
                    name="url"
                    label="URL"
                    fullWidth
                    variant="outlined"
                    value={formData.url}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              )}

              {formData.type === 'html' && (
                <Grid item xs={12}>
                  <TextField
                  className="animated-input"
                    margin="dense"
                    name="htmlContent"
                    label="HTML Content"
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    value={formData.htmlContent}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              )}

              {(formData.type === 'image' || formData.type === 'video') && (
                <Grid item xs={12}>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    {selectedFile ? (
                      <Typography>{selectedFile.name}</Typography>
                    ) : (
                      <Typography>
                        Drag & drop a file here, or click to select
                      </Typography>
                    )}
                  </Box>
                  
                  {previewUrl && (
                    <Box sx={{ mt: 2 }}>
                      {formData.type === 'image' ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 200 }}
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          style={{ maxWidth: '100%', maxHeight: 200 }}
                        />
                      )}
                    </Box>
                  )}
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                className="animated-input"
                  margin="dense"
                  name="tags"
                  label="Tags (comma separated)"
                  fullWidth
                  variant="outlined"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                />
              </Grid>
            </Grid>

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ContentList;
