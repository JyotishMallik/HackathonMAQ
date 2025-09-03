import api from './api';

const ticketService = {
  getAllTickets: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    if (params.priority) {
      queryParams.append('priority', params.priority);
    }
    
    if (params.created_by) {
      queryParams.append('created_by', params.created_by);
    }
    
    if (params.assigned_to) {
      queryParams.append('assigned_to', params.assigned_to);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    if (params.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    
    let url = '/tickets/tickets/';
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  
  getTicket: async (ticketId) => {
    const response = await api.get(`/tickets/tickets/${ticketId}/`);
    return response.data;
  },
  
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets/tickets/', ticketData);
    return response.data;
  },
  
  updateTicket: async (ticketId, ticketData) => {
    const response = await api.patch(`/tickets/tickets/${ticketId}/`, ticketData);
    return response.data;
  },
  
  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/tickets/tickets/${ticketId}/`);
    return response.data;
  },
  
  getTicketComments: async (ticketId) => {
    const response = await api.get(`/tickets/comments/?ticket=${ticketId}`);
    return response.data;
  },
  
  createTicketComment: async (commentData) => {
    const response = await api.post('/tickets/comments/', commentData);
    return response.data;
  },
  
  updateTicketComment: async (commentId, commentData) => {
    const response = await api.patch(`/tickets/comments/${commentId}/`, commentData);
    return response.data;
  },
  
  deleteTicketComment: async (commentId) => {
    const response = await api.delete(`/tickets/comments/${commentId}/`);
    return response.data;
  },
  
  assignTicket: async (ticketId, userId) => {
    const response = await api.post(`/tickets/tickets/${ticketId}/assign/`, { assigned_to: userId });
    return response.data;
  },
  
  changeTicketStatus: async (ticketId, status) => {
    const response = await api.post(`/tickets/tickets/${ticketId}/change-status/`, { status });
    return response.data;
  },
  
  getTicketStats: async () => {
    const response = await api.get('/tickets/stats/');
    return response.data;
  },
};

export default ticketService;