import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await productService.getAllProducts(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await productService.getProduct(productId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.createProduct(productData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(id, productData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete product');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getAllCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await productService.getProductReviews(productId);
      return { productId, reviews: data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch product reviews');
    }
  }
);

export const addReview = createAsyncThunk(
  'products/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const data = await productService.createReview(reviewData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add review');
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
    data: null,
    loading: false,
    error: null,
  },
  categories: {
    data: [],
    loading: false,
    error: null,
  },
  reviews: {
    data: {},  // Keyed by product ID
    loading: false,
    error: null,
  },
  operation: {
    loading: false,
    error: null,
    success: null,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetail: (state) => {
      state.detail.data = null;
    },
    clearOperationStatus: (state) => {
      state.operation.loading = false;
      state.operation.error = null;
      state.operation.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload;
      })
      // Fetch Single Product
      .addCase(fetchProduct.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.data = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Product created successfully';
        state.list.data = [action.payload, ...state.list.data];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Product updated successfully';
        state.list.data = state.list.data.map(product => 
          product.id === action.payload.id ? action.payload : product
        );
        if (state.detail.data && state.detail.data.id === action.payload.id) {
          state.detail.data = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Product deleted successfully';
        state.list.data = state.list.data.filter(product => product.id !== action.payload);
        if (state.detail.data && state.detail.data.id === action.payload) {
          state.detail.data = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviews.loading = false;
        state.reviews.data[action.payload.productId] = action.payload.reviews;
        // Also update the reviews in the product detail if it matches
        if (state.detail.data && state.detail.data.id === action.payload.productId) {
          state.detail.data.reviews = action.payload.reviews;
        }
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Review added successfully';
        
        // Update reviews in state
        const productId = action.payload.product;
        if (state.reviews.data[productId]) {
          state.reviews.data[productId] = [...state.reviews.data[productId], action.payload];
        }
        
        // Update reviews in product detail if applicable
        if (state.detail.data && state.detail.data.id === productId) {
          if (!state.detail.data.reviews) {
            state.detail.data.reviews = [];
          }
          state.detail.data.reviews.push(action.payload);
          
          // Update product rating (would normally be handled by backend)
          const reviews = state.detail.data.reviews;
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          state.detail.data.rating = totalRating / reviews.length;
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });
  },
});

export const { clearProductDetail, clearOperationStatus } = productSlice.actions;
export default productSlice.reducer;