import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketService from '../services/ticketService';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await ticketService.getAllTickets(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tickets');
    }
  }
);

export const fetchTicket = createAsyncThunk(
  'tickets/fetchTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      const data = await ticketService.getTicket(ticketId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ticket');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const data = await ticketService.createTicket(ticketData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create ticket');
    }
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, ...ticketData }, { rejectWithValue }) => {
    try {
      const data = await ticketService.updateTicket(id, ticketData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update ticket');
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      await ticketService.deleteTicket(ticketId);
      return ticketId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete ticket');
    }
  }
);

export const addComment = createAsyncThunk(
  'tickets/addComment',
  async ({ ticketId, content }, { rejectWithValue }) => {
    try {
      const data = await ticketService.createTicketComment({
        ticket: ticketId,
        content,
      });
      return { ticketId, comment: data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add comment');
    }
  }
);

export const fetchTicketStats = createAsyncThunk(
  'tickets/fetchTicketStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await ticketService.getTicketStats();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ticket statistics');
    }
  }
);

export const assignTicket = createAsyncThunk(
  'tickets/assignTicket',
  async ({ ticketId, userId }, { rejectWithValue }) => {
    try {
      const data = await ticketService.assignTicket(ticketId, userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to assign ticket');
    }
  }
);

export const changeTicketStatus = createAsyncThunk(
  'tickets/changeTicketStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const data = await ticketService.changeTicketStatus(ticketId, status);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to change ticket status');
    }
  }
);

const initialState = {
  list: {
    data: [],
    loading: false,
    error: null,
  },
  detail: {
    ticket: null,
    loading: false,
    error: null,
  },
  stats: {
    data: null,
    loading: false,
    error: null,
  },
  operation: {
    loading: false,
    error: null,
    success: null,
  },
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTicketDetail: (state) => {
      state.detail.ticket = null;
    },
    clearOperationStatus: (state) => {
      state.operation.loading = false;
      state.operation.error = null;
      state.operation.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchTickets.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload;
      })
      // Fetch Single Ticket
      .addCase(fetchTicket.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.ticket = action.payload;
      })
      .addCase(fetchTicket.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload;
      })
      // Create Ticket
      .addCase(createTicket.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Ticket created successfully';
        state.list.data = [action.payload, ...state.list.data];
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Update Ticket
      .addCase(updateTicket.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Ticket updated successfully';
        state.list.data = state.list.data.map(ticket => 
          ticket.id === action.payload.id ? action.payload : ticket
        );
        if (state.detail.ticket && state.detail.ticket.id === action.payload.id) {
          state.detail.ticket = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Delete Ticket
      .addCase(deleteTicket.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Ticket deleted successfully';
        state.list.data = state.list.data.filter(ticket => ticket.id !== action.payload);
        if (state.detail.ticket && state.detail.ticket.id === action.payload) {
          state.detail.ticket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Comment added successfully';
        
        // Add comment to ticket detail if it's currently loaded
        if (state.detail.ticket && state.detail.ticket.id === action.payload.ticketId) {
          if (!state.detail.ticket.comments) {
            state.detail.ticket.comments = [];
          }
          state.detail.ticket.comments.push(action.payload.comment);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Fetch Ticket Stats
      .addCase(fetchTicketStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchTicketStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      })
      // Assign Ticket
      .addCase(assignTicket.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
      })
      .addCase(assignTicket.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Ticket assigned successfully';
        
        // Update in list
        state.list.data = state.list.data.map(ticket => 
          ticket.id === action.payload.id ? action.payload : ticket
        );
        
        // Update in detail if loaded
        if (state.detail.ticket && state.detail.ticket.id === action.payload.id) {
          state.detail.ticket = action.payload;
        }
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Change Ticket Status
      .addCase(changeTicketStatus.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
      })
      .addCase(changeTicketStatus.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Ticket status updated successfully';
        
        // Update in list
        state.list.data = state.list.data.map(ticket => 
          ticket.id === action.payload.id ? action.payload : ticket
        );
        
        // Update in detail if loaded
        if (state.detail.ticket && state.detail.ticket.id === action.payload.id) {
          state.detail.ticket = action.payload;
        }
      })
      .addCase(changeTicketStatus.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });
  },
});

export const { clearTicketDetail, clearOperationStatus } = ticketSlice.actions;
export default ticketSlice.reducer;