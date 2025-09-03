import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  priority: Yup.string().required('Priority is required'),
});

const TicketForm = ({ open, onClose, onSubmit, loading = false }) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Ticket</DialogTitle>
      <DialogContent>
        <Box component="form" id="ticket-form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Ticket Title"
            margin="normal"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            autoFocus
          />

          <FormControl 
            fullWidth 
            margin="normal"
            error={formik.touched.priority && Boolean(formik.errors.priority)}
          >
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formik.values.priority}
              label="Priority"
              onChange={formik.handleChange}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </Select>
            {formik.touched.priority && formik.errors.priority && (
              <FormHelperText>{formik.errors.priority}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            margin="normal"
            multiline
            rows={6}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            placeholder="Please provide detailed information about the issue..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type="submit"
          form="ticket-form"
          variant="contained"
          disabled={loading || !formik.isValid || !formik.dirty}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketForm;