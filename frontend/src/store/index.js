import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import ticketReducer from './ticketSlice';
import vulnerabilityReducer from './vulnerabilitySlice';
import inventoryReducer from './inventorySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    tickets: ticketReducer,
    vulnerability: vulnerabilityReducer,
    inventory: inventoryReducer,
  },
});

export default store;