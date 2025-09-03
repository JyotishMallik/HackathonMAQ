import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TicketList from '../components/tickets/TicketList';
import TicketForm from '../components/tickets/TicketForm';
import { fetchTickets, createTicket } from '../store/ticketSlice';

const TicketsPage = () => {
  const dispatch = useDispatch();
  const { data: tickets, loading, error } = useSelector(state => state.tickets.list);
  const { loading: operationLoading, error: operationError, success } = useSelector(state => state.tickets.operation);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleCreateTicket = (ticketData) => {
    dispatch(createTicket(ticketData)).unwrap()
      .then(() => {
        setDialogOpen(false);
      })
      .catch((error) => {
        console.error("Failed to create ticket:", error);
      });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          IT Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
        >
          New Ticket
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <TicketList 
        tickets={tickets} 
        loading={loading} 
        error={error} 
      />

      <TicketForm
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleCreateTicket}
        loading={operationLoading}
      />
    </Container>
  );
};

export default TicketsPage;