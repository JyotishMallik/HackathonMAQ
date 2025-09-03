import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const transactionTypes = [
  { value: 'PURCHASE', label: 'Purchase (Add Stock)' },
  { value: 'SALE', label: 'Sale (Remove Stock)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (Correct Stock)' }
];

const InventoryForm = ({ open, onClose, product, onSubmit }) => {
  const [currentQuantity, setCurrentQuantity] = useState(0);

  useEffect(() => {
    if (product) {
      setCurrentQuantity(product.stock_quantity);
    }
  }, [product]);

  const validationSchema = Yup.object({
    quantityChange: Yup.number()
      .required('Quantity is required')
      .integer('Quantity must be a whole number')
      .when('transactionType', {
        is: 'SALE',
        then: (schema) => schema.max(currentQuantity, `Cannot remove more than current stock (${currentQuantity})`)
      }),
    transactionType: Yup.string().required('Transaction type is required'),
    notes: Yup.string().max(500, 'Notes cannot exceed 500 characters'),
  });

  const formik = useFormik({
    initialValues: {
      quantityChange: product?.transactionType === 'SALE' ? 1 : 1,
      transactionType: product?.transactionType || 'PURCHASE',
      notes: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formattedValues = {
        ...values,
        productId: product?.id,
        quantityChange: values.transactionType === 'SALE' ? -Math.abs(values.quantityChange) : values.quantityChange,
      };
      onSubmit(formattedValues);
    },
  });

  const handleTransactionTypeChange = (e) => {
    const newType = e.target.value;
    formik.setFieldValue('transactionType', newType);
    
    // Reset quantity to positive value when switching types
    if (newType === 'SALE') {
      formik.setFieldValue('quantityChange', Math.abs(formik.values.quantityChange));
    } else {
      formik.setFieldValue('quantityChange', Math.abs(formik.values.quantityChange));
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {formik.values.transactionType === 'PURCHASE' ? 'Add Inventory' : 
         formik.values.transactionType === 'SALE' ? 'Remove Inventory' : 'Adjust Inventory'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle1">
            Product: {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Stock: {currentQuantity}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: ${product.price?.toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form id="inventory-form" onSubmit={formik.handleSubmit}>
          <FormControl 
            fullWidth 
            sx={{ mb: 3 }}
            error={formik.touched.transactionType && Boolean(formik.errors.transactionType)}
          >
            <InputLabel>Transaction Type</InputLabel>
            <Select
              name="transactionType"
              value={formik.values.transactionType}
              label="Transaction Type"
              onChange={handleTransactionTypeChange}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.transactionType && formik.errors.transactionType && (
              <FormHelperText>{formik.errors.transactionType}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            id="quantityChange"
            name="quantityChange"
            label="Quantity"
            type="number"
            value={formik.values.quantityChange}
            onChange={formik.handleChange}
            error={formik.touched.quantityChange && Boolean(formik.errors.quantityChange)}
            helperText={formik.touched.quantityChange && formik.errors.quantityChange}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            id="notes"
            name="notes"
            label="Notes"
            multiline
            rows={3}
            value={formik.values.notes}
            onChange={formik.handleChange}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
            helperText={formik.touched.notes && formik.errors.notes}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          type="submit" 
          form="inventory-form" 
          variant="contained" 
          color="primary"
        >
          {formik.values.transactionType === 'PURCHASE' ? 'Add to Inventory' : 
           formik.values.transactionType === 'SALE' ? 'Remove from Inventory' : 'Update Inventory'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryForm;