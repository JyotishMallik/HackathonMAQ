import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Send as SendIcon,
} from '@mui/icons-material';

import { fetchTicket, updateTicket, addComment } from '../../store/ticketSlice';

const getStatusColor = (status) => {
  switch(status) {
    case 'OPEN': return 'info';
    case 'IN_PROGRESS': return 'warning';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'default';
    default: return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'info';
    case 'HIGH': return 'warning';
    case 'URGENT': return 'error';
    default: return 'default';
  }
};

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ticket, loading, error } = useSelector(state => state.tickets.detail);
  const { user } = useSelector(state => state.auth);
  
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicket(ticketId));
    }
  }, [dispatch, ticketId]);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setAssignedTo(ticket.assigned_to || '');
      setPriority(ticket.priority);
    }
  }, [ticket]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleAssigneeChange = (e) => {
    setAssignedTo(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    setCommentError('');
    dispatch(addComment({
      ticketId: ticket.id,
      content: newComment
    }));
    setNewComment('');
  };

  const handleUpdateTicket = () => {
    dispatch(updateTicket({
      id: ticket.id,
      status,
      priority,
      assigned_to: assignedTo
    })).then(() => {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading ticket: {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Ticket not found
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  const isAdmin = user && user.is_admin;
  const isCreator = user && user.username === ticket.created_by;
  const isAssignee = user && ticket.assigned_to === user.username;
  const canEdit = isAdmin || isAssignee;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 3 }}>
        Back to Tickets
      </Button>
      
      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Ticket updated successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h1" gutterBottom>
                {ticket.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ticket #{ticket.id} • Created {new Date(ticket.created_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip
                  label={ticket.status.replace('_', ' ')}
                  color={getStatusColor(ticket.status)}
                />
                <Chip
                  label={ticket.priority}
                  color={getPriorityColor(ticket.priority)}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {ticket.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created By
                </Typography>
                <Typography variant="body1">
                  {ticket.created_by_name || ticket.created_by}
                </Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assigned To
                </Typography>
                {canEdit ? (
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel id="assignee-label">Assignee</InputLabel>
                    <Select
                      labelId="assignee-label"
                      value={assignedTo}
                      label="Assignee"
                      onChange={handleAssigneeChange}
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      <MenuItem value="admin.user">Admin User</MenuItem>
                      <MenuItem value="tech.support">Tech Support</MenuItem>
                      <MenuItem value={user?.username || ""}>Assign to me</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body1">
                    {ticket.assigned_to_name || ticket.assigned_to || 'Unassigned'}
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {canEdit && (
              <>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        value={status}
                        label="Status"
                        onChange={handleStatusChange}
                      >
                        <MenuItem value="OPEN">Open</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="RESOLVED">Resolved</MenuItem>
                        <MenuItem value="CLOSED">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Priority
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel id="priority-label">Priority</InputLabel>
                      <Select
                        labelId="priority-label"
                        value={priority}
                        label="Priority"
                        onChange={handlePriorityChange}
                      >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="URGENT">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpdateTicket}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Ticket'}
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        
        {ticket.comments && ticket.comments.length > 0 ? (
          <List>
            {ticket.comments.map((comment, index) => (
              <React.Fragment key={comment.id || index}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar alt={comment.user_name || comment.user} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {comment.user_name || comment.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body1"
                        color="text.primary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {comment.content}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < ticket.comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
            No comments yet.
          </Typography>
        )}
        
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Add a comment"
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            error={!!commentError}
            helperText={commentError}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmitComment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Comment'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketDetail;