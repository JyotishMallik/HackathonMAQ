import api from './api';

const inventoryService = {
  getProducts: async () => {
    const response = await api.get('/inventory/products/');
    return response.data;
  },
  
  getInventoryRecords: async (filters = {}) => {
    let url = '/inventory/records/';
    const queryParams = new URLSearchParams();
    
    if (filters.product) {
      queryParams.append('product', filters.product);
    }
    
    if (filters.transactionType) {
      queryParams.append('transaction_type', filters.transactionType);
    }
    
    if (filters.startDate) {
      queryParams.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('end_date', filters.endDate);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  
  createInventoryRecord: async (recordData) => {
    const response = await api.post('/inventory/records/', recordData);
    return response.data;
  },
  
  updateInventoryRecord: async (id, recordData) => {
    const response = await api.patch(`/inventory/records/${id}/`, recordData);
    return response.data;
  },
  
  deleteInventoryRecord: async (id) => {
    const response = await api.delete(`/inventory/records/${id}/`);
    return response.data;
  },
  
  getInventorySummary: async () => {
    const response = await api.get('/inventory/summary/');
    return response.data;
  },
  
  getProductAvailability: async (productId) => {
    const response = await api.get(`/inventory/products/${productId}/availability/`);
    return response.data;
  },
};

export default inventoryService;