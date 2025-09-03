import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Rating,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  Alert,
} from '@mui/material';
import {
  AddShoppingCart,
  ArrowBack,
  Share,
  Favorite,
  FavoriteBorder,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductReview from './ProductReview';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductDetail = ({ product, loading, error, onAddToCart }) => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);

  // In a real app, you would fetch the product based on the ID
  // For demo purposes, we're assuming product is passed as prop

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuantityChange = (event) => {
    setQuantity(Math.max(1, parseInt(event.target.value) || 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setSnackbar({
      open: true,
      message: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`,
      severity: 'success'
    });
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to save favorites',
        severity: 'info'
      });
      return;
    }
    setIsFavorite(!isFavorite);
    setSnackbar({
      open: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites!',
      severity: 'success'
    });
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6">Product not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.image || "https://via.placeholder.com/500"}
              alt={product.name}
              sx={{ 
                height: { xs: '300px', md: '400px' },
                objectFit: 'contain',
                bgcolor: 'background.paper'
              }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" color="text.secondary">
              {product.category_name}
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating || 0} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.rating ? product.rating.toFixed(1) : '0.0'})
              </Typography>
              {product.reviews && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {product.reviews.length} reviews
                </Typography>
              )}
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price?.toFixed(2)}
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Availability: 
              </Typography>
              <Chip 
                label={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} 
                color={product.stock_quantity > 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock_quantity}
                style={{
                  width: '60px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleToggleFavorite} color={isFavorite ? 'secondary' : 'default'}>
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="product tabs">
            <Tab label="Description" id="tab-0" />
            <Tab label="Specifications" id="tab-1" />
            <Tab label="Reviews" id="tab-2" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">
            {product.description}
          </Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {product.specifications ? (
              Object.entries(product.specifications).map(([key, value]) => (
                <React.Fragment key={key}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">{key}</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{value}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </React.Fragment>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No specifications available
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ProductReview 
            productId={product.id} 
            reviews={product.reviews || []} 
          />
        </TabPanel>
      </Box>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share this product</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Share this link with friends:
          </Typography>
          <Typography variant="body2" component="div" sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 1
          }}>
            {window.location.href}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShareDialogOpen(false);
              setSnackbar({
                open: true,
                message: 'Link copied to clipboard!',
                severity: 'success'
              });
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ProductDetail;