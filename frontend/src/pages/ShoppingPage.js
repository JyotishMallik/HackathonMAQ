import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Box, 
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Card,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ProductCard from '../components/products/ProductCard';
import { fetchProducts, fetchCategories } from '../store/productSlice';

const ShoppingPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { data: products, loading, error } = useSelector(state => state.products.list);
  const { data: categories } = useSelector(state => state.products.categories);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Set products per page based on screen size
  const getProductsPerPage = () => {
    if (isSmallScreen) return 4;  // 1 column, 4 rows
    if (isMediumScreen) return 6;  // 2 columns, 3 rows
    return 9;  // 3 columns, 3 rows for large screens
  };
  
  const productsPerPage = getProductsPerPage();

  // Fetch products and categories when component mounts
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === parseInt(categoryFilter) : true;
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination variables
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top of product grid
    window.scrollTo({
      top: document.getElementById('product-grid').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
          fontWeight: 600,
          color: '#1a237e',
          mb: 3
        }}
      >
        Product Catalog
      </Typography>
      
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2 
      }}>
        <TextField
          label="Search products"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            }
          }}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              borderRadius: 1.5,
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 1.5,
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
          }}
        >
          {error}
        </Alert>
      )}

      <Box id="product-grid">
        {loading ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress sx={{ color: '#3949ab' }} />
          </Box>
        ) : filteredProducts.length > 0 ? (
          <>
            <Grid container spacing={4} sx={{ mb: 5 }}>
              {currentProducts.map((product) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={product.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <ProductCard product={product} />
                </Grid>
              ))}
              
              {/* Add empty placeholder cards to maintain grid layout if needed */}
              {currentProducts.length < productsPerPage && Array.from(
                { length: productsPerPage - currentProducts.length },
                (_, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={4} 
                    key={`placeholder-${index}`}
                  />
                )
              )}
            </Grid>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <Stack 
                spacing={2} 
                direction="row" 
                justifyContent="center" 
                sx={{ mt: 5, mb: 3 }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    borderRadius: 2, 
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
                  }}
                >
                  <Pagination 
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                        fontWeight: 500,
                      }
                    }}
                  />
                </Box>
              </Stack>
            )}
            
            {/* Results summary */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ 
                mt: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              }}
            >
              Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </Typography>
          </>
        ) : (
          <Card 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              backgroundColor: '#f8faff',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(200, 210, 240, 0.5)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#546e7a',
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 500
              }}
            >
              No products found matching your criteria.
            </Typography>
            <Typography 
              sx={{ 
                mt: 1, 
                color: '#78909c',
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              }}
            >
              Try adjusting your search or filter settings.
            </Typography>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default ShoppingPage;