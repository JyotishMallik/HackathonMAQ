import api from './api';

const productService = {
  getAllProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) {
      queryParams.append('category', params.category);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    if (params.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    
    if (params.min_price) {
      queryParams.append('min_price', params.min_price);
    }
    
    if (params.max_price) {
      queryParams.append('max_price', params.max_price);
    }
    
    let url = '/products/products/';
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  
  getProduct: async (productId) => {
    const response = await api.get(`/products/products/${productId}/`);
    return response.data;
  },
  
  createProduct: async (productData) => {
    // Use FormData for image uploads
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    }
    
    const response = await api.post('/products/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateProduct: async (productId, productData) => {
    // Use FormData for image uploads
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append(key, productData[key]);
      } else if (productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    }
    
    const response = await api.patch(`/products/products/${productId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/products/${productId}/`);
    return response.data;
  },
  
  getAllCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },
  
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/reviews/?product=${productId}`);
    return response.data;
  },
  
  createReview: async (reviewData) => {
    const response = await api.post('/products/reviews/', reviewData);
    return response.data;
  },
  
  updateReview: async (reviewId, reviewData) => {
    const response = await api.patch(`/products/reviews/${reviewId}/`, reviewData);
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/products/reviews/${reviewId}/`);
    return response.data;
  },
};

export default productService;