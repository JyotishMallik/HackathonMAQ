import React, { useState } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Rating, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const ProductCard = ({ product }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewDetails = () => {
    navigate(`/shopping/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click event
    // This would typically dispatch an action to add the product to cart
    console.log('Adding to cart:', product);
    // Display some feedback (in a real app, you'd use a proper notification system)
    alert(`${product.name} added to cart!`);
  };
  
  // Convert rating to a number and handle non-numeric values
  const ratingValue = parseFloat(product.rating) || 0;
  
  // Helper function to clean image URLs
  const getCleanImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    
    // If it's already a clean URL without the localhost prefix, return it
    if (url.startsWith('https://') && !url.includes('localhost')) {
      return url;
    }
    
    // Extract the original URL by removing any localhost prefix and quotes
    if (url.includes('localhost') && url.includes('%22')) {
      const cleanUrl = url.replace(/http:\/\/localhost:8000\/media\/%22/, '')
                         .replace(/%22$/, '');
      return decodeURIComponent(cleanUrl);
    }
    
    // Remove any quotes
    return url.replace(/^["']|["']$/g, '');
  };

  // Get stock status
  const getStockStatus = () => {
    if (product.stock_quantity <= 0) {
      return { label: "Out of Stock", color: "error", textColor: "#d32f2f" };
    }
    if (product.stock_quantity <= 5) {
      return { label: "Low Stock", color: "warning", textColor: "#ed6c02" };
    }
    return { label: "In Stock", color: "success", textColor: "#2e7d32" };
  };
  
  const stockStatus = getStockStatus();
  
  return (
    <>
      <Card 
        onClick={handleOpen}
        sx={{ 
          height: 420, // Fixed height for all cards
          width: '100%',
          maxWidth: 300, // Maximum width for the card
          display: 'flex', 
          flexDirection: 'column',
          margin: 'auto', // Center the card
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 30px -10px rgba(0,0,0,0.15)',
          },
          fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
        }}
      >
        {/* Sale badge if product is on sale */}
        {product.sale_price && product.sale_price < product.price && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1,
            }}
          >
            <Chip 
              label={`${Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF`}
              size="small"
              sx={{ 
                bgcolor: '#e53935',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-label': {
                  px: 1,
                }
              }}
            />
          </Box>
        )}
        
        <CardMedia
          component="div" // Using div instead of img for better control
          sx={{ 
            height: 180, // Reduced height to give more space to content
            position: 'relative',
            backgroundColor: '#f5f5f5', // Light background for the image area
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={getCleanImageUrl(product.image)}
            alt={product.name}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              padding: '16px',
              transition: 'transform 0.5s ease',
            }}
          />
          
          {/* Wishlist button overlay */}
          <Tooltip title="Add to wishlist" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Add to wishlist:', product);
              }}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1,
              }}
            >
              <FavoriteBorderIcon fontSize="small" sx={{ color: '#757575' }} />
            </IconButton>
          </Tooltip>
        </CardMedia>
        
        <CardContent sx={{ flexGrow: 1, overflow: 'hidden', px: 2.5, pt: 2, pb: 1 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Category tag */}
            <Typography 
              variant="caption"
              sx={{
                color: '#3949ab',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                mb: 0.5
              }}
            >
              {product.category_name || "Uncategorized"}
            </Typography>
            
            {/* Product title - Fixed the truncation issue */}
            <Box sx={{ mb: 1.5, minHeight: 46 }}>
              <Typography 
                variant="subtitle1"
                component="h2"
                sx={{ 
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  color: '#263238',
                  lineHeight: 1.3,
                  fontSize: '0.9rem', // Slightly smaller font to fit more text
                }}
              >
                {product.name}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 1 }}>
              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating 
                  value={ratingValue} 
                  precision={0.1} 
                  readOnly 
                  size="small" 
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#ff9800',
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1, 
                    fontWeight: 500,
                    color: '#78909c'
                  }}
                >
                  {ratingValue.toFixed(1)}
                </Typography>
              </Box>
              
              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, mb: 0.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    color: '#1a237e',
                    fontSize: '1.15rem',
                  }}
                >
                  ${(parseFloat(product.price) || 0).toFixed(2)}
                </Typography>
                
                {/* Original price if on sale */}
                {product.sale_price && product.sale_price < product.price && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 1, 
                      textDecoration: 'line-through', 
                      color: '#9e9e9e',
                      fontWeight: 500
                    }}
                  >
                    ${(parseFloat(product.sale_price) || 0).toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              {/* Stock status */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: stockStatus.textColor,
                    mr: 1
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: stockStatus.textColor,
                    fontWeight: 600
                  }}
                >
                  {stockStatus.label}
                </Typography>
                
                {/* Free shipping indicator */}
                {product.free_shipping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                    <LocalShippingOutlinedIcon fontSize="small" sx={{ fontSize: '0.9rem', mr: 0.5, color: '#546e7a' }} />
                    <Typography variant="caption" sx={{ color: '#546e7a', fontWeight: 500 }}>
                      Free Shipping
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
        
        <Divider sx={{ mx: 2 }} />
        
        <CardActions sx={{ justifyContent: 'space-between', p: 1.5, pt: 1, pb: 1.5 }}>
          <Button 
            variant="outlined"
            size="small" 
            startIcon={<VisibilityIcon sx={{ fontSize: '1rem' }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            sx={{
              borderColor: 'rgba(0,0,0,0.12)',
              color: '#455a64',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              '&:hover': {
                borderColor: '#3949ab',
                backgroundColor: 'rgba(57, 73, 171, 0.04)'
              }
            }}
          >
            Quick View
          </Button>
          <Button 
            variant="contained"
            size="small" 
            color="primary" 
            startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              boxShadow: 'none',
              background: 'linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(57, 73, 171, 0.3)',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            fontWeight: 600,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <IconButton 
            edge="end" 
            onClick={handleClose}
            aria-label="close"
            sx={{
              color: '#9e9e9e',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
                color: '#616161'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 3, md: 4 } 
          }}>
            <Box 
              sx={{ 
                flex: '0 0 300px',
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                height: { xs: '300px', md: 'auto' }
              }}
            >
              <img 
                src={getCleanImageUrl(product.image)} 
                alt={product.name} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                }} 
              />
              
              {/* Sale badge in dialog */}
              {product.sale_price && product.sale_price < product.price && (
                <Chip 
                  label={`${Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF`}
                  size="small"
                  sx={{ 
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: '#e53935',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              {/* Product category */}
              <Typography 
                variant="subtitle2" 
                sx={{
                  color: '#3949ab',
                  fontWeight: 600,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  fontSize: '0.75rem'
                }}
              >
                {product.category_name || "Uncategorized"}
              </Typography>
              
              {/* Product description - kept in the dialog */}
              <Typography 
                variant="body1" 
                paragraph 
                sx={{
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  color: '#546e7a',
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
                {product.description || "No description available"}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Product details */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 3 }}>
                {/* Rating in dialog */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#263238' }}>
                    Customer Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={ratingValue} 
                      precision={0.1} 
                      readOnly 
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#ff9800',
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: '#455a64' }}>
                      {ratingValue.toFixed(1)} out of 5
                    </Typography>
                  </Box>
                </Box>
                
                {/* Stock information */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#263238' }}>
                    Availability
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: stockStatus.textColor,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: stockStatus.textColor }}>
                      {product.stock_quantity <= 0 
                        ? "Out of Stock" 
                        : product.stock_quantity <= 5 
                          ? `Only ${product.stock_quantity} left in stock` 
                          : "In Stock"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Price and add to cart in dialog */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1a237e',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  }}
                >
                  ${(parseFloat(product.price) || 0).toFixed(2)}
                </Typography>
                
                {product.sale_price && product.sale_price < product.price && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      ml: 2, 
                      textDecoration: 'line-through', 
                      color: '#9e9e9e',
                      fontWeight: 500
                    }}
                  >
                    ${(parseFloat(product.sale_price) || 0).toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  background: 'linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(57, 73, 171, 0.3)',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              {/* Shipping info */}
              {product.free_shipping && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: '1rem', mr: 1, color: '#546e7a' }} />
                  <Typography variant="body2" sx={{ color: '#546e7a', fontWeight: 500 }}>
                    Free shipping available
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button 
            onClick={handleClose}
            sx={{
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              color: '#455a64',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Close
          </Button>
          <Button 
            color="primary" 
            variant="contained" 
            onClick={handleViewDetails}
            sx={{
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              boxShadow: 'none',
              px: 3,
              background: 'linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(57, 73, 171, 0.2)',
              }
            }}
          >
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;