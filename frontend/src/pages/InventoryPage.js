import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryForm from '../components/inventory/InventoryForm';
import { fetchProducts, createInventoryRecord } from '../store/inventorySlice';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { data: products, loading, error } = useSelector(state => state.inventory.products);
  const { loading: operationLoading, error: operationError, success } = useSelector(state => state.inventory.operation);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setSnackbar({
        open: true,
        message: success,
        severity: 'success'
      });
    }
    if (operationError) {
      setSnackbar({
        open: true,
        message: operationError,
        severity: 'error'
      });
    }
  }, [success, operationError]);

  const handleOpenDialog = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleInventoryAction = (values) => {
    dispatch(createInventoryRecord(values))
      .unwrap()
      .then(() => {
        handleCloseDialog();
      })
      .catch((error) => {
        console.error("Error updating inventory:", error);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <InventoryTable 
        products={products} 
        loading={loading}
        onAdd={(product) => handleOpenDialog(product, 'PURCHASE')}
        onRemove={(product) => handleOpenDialog(product, 'SALE')}
        onAdjust={(product) => handleOpenDialog(product, 'ADJUSTMENT')}
      />

      {selectedProduct && (
        <InventoryForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          product={{...selectedProduct, transactionType: actionType}}
          onSubmit={handleInventoryAction}
        />
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InventoryPage;