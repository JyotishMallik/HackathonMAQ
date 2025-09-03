import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../services/inventoryService';

export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await inventoryService.getProducts();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch products');
    }
  }
);

export const fetchInventoryRecords = createAsyncThunk(
  'inventory/fetchInventoryRecords',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await inventoryService.getInventoryRecords(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch inventory records');
    }
  }
);

export const createInventoryRecord = createAsyncThunk(
  'inventory/createInventoryRecord',
  async (recordData, { rejectWithValue, dispatch }) => {
    try {
      const data = await inventoryService.createInventoryRecord(recordData);
      // Refresh products after updating inventory
      dispatch(fetchProducts());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create inventory record');
    }
  }
);

export const updateInventoryRecord = createAsyncThunk(
  'inventory/updateInventoryRecord',
  async ({ id, ...recordData }, { rejectWithValue }) => {
    try {
      const data = await inventoryService.updateInventoryRecord(id, recordData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update inventory record');
    }
  }
);

export const deleteInventoryRecord = createAsyncThunk(
  'inventory/deleteInventoryRecord',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryService.deleteInventoryRecord(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete inventory record');
    }
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchInventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await inventoryService.getInventorySummary();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch inventory summary');
    }
  }
);

const initialState = {
  products: {
    data: [],
    loading: false,
    error: null,
  },
  records: {
    data: [],
    loading: false,
    error: null,
  },
  summary: {
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

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
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
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.data = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      // Fetch Inventory Records
      .addCase(fetchInventoryRecords.pending, (state) => {
        state.records.loading = true;
        state.records.error = null;
      })
      .addCase(fetchInventoryRecords.fulfilled, (state, action) => {
        state.records.loading = false;
        state.records.data = action.payload;
      })
      .addCase(fetchInventoryRecords.rejected, (state, action) => {
        state.records.loading = false;
        state.records.error = action.payload;
      })
      // Create Inventory Record
      .addCase(createInventoryRecord.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(createInventoryRecord.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Inventory updated successfully';
        state.records.data = [action.payload, ...state.records.data];
      })
      .addCase(createInventoryRecord.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Update Inventory Record
      .addCase(updateInventoryRecord.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(updateInventoryRecord.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Inventory record updated successfully';
        state.records.data = state.records.data.map(record => 
          record.id === action.payload.id ? action.payload : record
        );
      })
      .addCase(updateInventoryRecord.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Delete Inventory Record
      .addCase(deleteInventoryRecord.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteInventoryRecord.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = 'Inventory record deleted successfully';
        state.records.data = state.records.data.filter(record => record.id !== action.payload);
      })
      .addCase(deleteInventoryRecord.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })
      // Fetch Inventory Summary
      .addCase(fetchInventorySummary.pending, (state) => {
        state.summary.loading = true;
        state.summary.error = null;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.summary.loading = false;
        state.summary.data = action.payload;
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.summary.loading = false;
        state.summary.error = action.payload;
      });
  },
});

export const { clearOperationStatus } = inventorySlice.actions;
export default inventorySlice.reducer;