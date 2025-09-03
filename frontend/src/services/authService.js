import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/users/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },
  
  register: async (userData) => {
    return api.post('/users/register/', userData);
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    
    try {
      const response = await api.post('/users/token/refresh/', {
        refresh: refreshToken,
      });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      
      return response.data;
    } catch (error) {
      authService.logout();
      return null;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

export default authService;