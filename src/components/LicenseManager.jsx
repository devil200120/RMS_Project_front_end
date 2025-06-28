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
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  Alert,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Download,
  Block,
  Analytics,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  fetchLicenses,
  generateLicense,
  revokeLicense,
  getLicenseAnalytics,
  validateLicense,
  clearError
} from '../Store/licenseSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`license-tabpanel-${index}`}
      aria-labelledby={`license-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LicenseManager = () => {
  const dispatch = useDispatch();
  const { items: licenses, isLoading, error, stats, analytics } = useSelector(state => state.license);
  
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'MANAGER',
    maxUses: 1,
    count: 1,
    expiresAt: null,
    description: '',
    prefix: '',
    metadata: {
      organizationName: '',
      department: '',
      contactEmail: ''
    }
  });

  const [filters, setFilters] = useState({
    type: '',
    isActive: '',
    search: ''
  });

  const [validateKey, setValidateKey] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    dispatch(fetchLicenses(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2 && !analytics) {
      dispatch(getLicenseAnalytics());
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      type: 'MANAGER',
      maxUses: 1,
      count: 1,
      expiresAt: null,
      description: '',
      prefix: '',
      metadata: {
        organizationName: '',
        department: '',
        contactEmail: ''
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('metadata.')) {
      const metadataField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(generateLicense(formData)).unwrap();
      toast.success(`${formData.count} license key(s) generated successfully`);
      handleClose();
      dispatch(fetchLicenses(filters));
    } catch (error) {
      toast.error(error || 'Failed to generate license key');
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm('Are you sure you want to revoke this license key?')) {
      try {
        await dispatch(revokeLicense(id)).unwrap();
        toast.success('License key revoked successfully');
        dispatch(fetchLicenses(filters));
      } catch (error) {
        toast.error(error || 'Failed to revoke license key');
      }
    }
  };

  const handleValidate = async () => {
    try {
      const result = await dispatch(validateLicense({ key: validateKey })).unwrap();
      setValidationResult(result.data);
      toast.success('License key validated');
    } catch (error) {
      setValidationResult({ isValid: false, reason: error || 'Validation failed' });
      toast.error(error || 'Failed to validate license key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportLicenses = () => {
    const csvContent = licenses.map(license => 
      `${license.key},${license.type},${license.maxUses},${license.currentUses},${license.isActive},${license.description || ''}`
    ).join('\n');
    
    const blob = new Blob([`Key,Type,Max Uses,Current Uses,Active,Description\n${csvContent}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (license) => {
    if (!license.isActive) return 'error';
    if (license.expiresAt && new Date() > new Date(license.expiresAt)) return 'warning';
    if (license.currentUses >= license.maxUses) return 'warning';
    return 'success';
  };

  const getStatusText = (license) => {
    if (!license.isActive) return 'Revoked';
    if (license.expiresAt && new Date() > new Date(license.expiresAt)) return 'Expired';
    if (license.currentUses >= license.maxUses) return 'Exhausted';
    return 'Active';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="License Keys" />
              <Tab label="Validation" />
              <Tab label="Analytics" />
            </Tabs>
          </Box>

          {/* License Keys Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">License Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={exportLicenses}
                  disabled={!licenses.length}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpen}
                >
                  Generate License
                </Button>
              </Box>
            </Box>

            {/* Statistics Cards */}
            {stats && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Keys
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalKeys}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Active Keys
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.activeKeys}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Used Keys
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {stats.usedKeys}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Expired Keys
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {stats.expiredKeys}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="VIEWER">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Toggle key visibility">
                      <IconButton onClick={() => setShowKeys(!showKeys)}>
                        {showKeys ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                      <IconButton onClick={() => dispatch(fetchLicenses(filters))}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {isLoading && <LinearProgress sx={{ mb: 2 }} />}

            {/* License Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>License Key</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licenses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((license) => (
                    <TableRow key={license._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {showKeys ? license.key : '••••••••••••••••'}
                          </Typography>
                          <Tooltip title="Copy to clipboard">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(license.key)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {license.description && (
                          <Typography variant="caption" color="text.secondary">
                            {license.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={license.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {license.currentUses} / {license.maxUses}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(license.currentUses / license.maxUses) * 100}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(license)}
                          color={getStatusColor(license)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(license.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {license.expiresAt 
                          ? new Date(license.expiresAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        {license.isActive && (
                          <Tooltip title="Revoke license">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRevoke(license._id)}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={licenses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TabPanel>

          {/* Validation Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Validate License Key
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="License Key"
                  value={validateKey}
                  onChange={(e) => setValidateKey(e.target.value.toUpperCase())}
                  fullWidth
                  placeholder="Enter license key to validate"
                />
                <Button
                  variant="contained"
                  onClick={handleValidate}
                  disabled={!validateKey || isLoading}
                >
                  Validate
                </Button>
              </Box>

              {validationResult && (
                <Alert
                  severity={validationResult.isValid ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {validationResult.isValid ? (
                    <Box>
                      <Typography variant="subtitle2">Valid License Key</Typography>
                      {validationResult.license && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Type: {validationResult.license.type}
                          </Typography>
                          <Typography variant="body2">
                            Usage: {validationResult.license.currentUses} / {validationResult.license.maxUses}
                          </Typography>
                          {validationResult.license.expiresAt && (
                            <Typography variant="body2">
                              Expires: {new Date(validationResult.license.expiresAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="subtitle2">Invalid License Key</Typography>
                      <Typography variant="body2">{validationResult.reason}</Typography>
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              License Analytics
            </Typography>
            {/* Add analytics charts here */}
            <Alert severity="info">
              Analytics charts will be implemented here
            </Alert>
          </TabPanel>
        </Paper>

        {/* Generate License Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Generate License Keys</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>License Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="License Type"
                    >
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="VIEWER">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Number of Keys"
                    name="count"
                    type="number"
                    value={formData.count}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 1, max: 100 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Uses per Key"
                    name="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 1, max: 1000 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Key Prefix (Optional)"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., COMPANY"
                  />
                </Grid>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Expiration Date (Optional)"
                    value={formData.expiresAt}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, expiresAt: newValue }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDateTime={new Date()}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Optional description for these license keys"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Metadata (Optional)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Organization"
                    name="metadata.organizationName"
                    value={formData.metadata.organizationName}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Department"
                    name="metadata.department"
                    value={formData.metadata.department}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Contact Email"
                    name="metadata.contactEmail"
                    value={formData.metadata.contactEmail}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    type="email"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default LicenseManager;
