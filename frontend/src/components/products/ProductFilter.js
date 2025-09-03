import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FilterList,
  Close,
  Search,
  Clear,
} from '@mui/icons-material';

const ProductFilter = ({ 
  categories = [],
  priceRange = { min: 0, max: 1000 },
  ratings = [5, 4, 3, 2, 1],
  onApplyFilters,
  onResetFilters,
  initialFilters = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
  const [selectedRating, setSelectedRating] = useState(initialFilters.rating || '');
  const [priceValues, setPriceValues] = useState([
    initialFilters.minPrice || priceRange.min,
    initialFilters.maxPrice || priceRange.max
  ]);
  const [inStockOnly, setInStockOnly] = useState(initialFilters.inStockOnly || false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.name;
    
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleRatingChange = (event) => {
    setSelectedRating(event.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceValues(newValue);
  };

  const handleInStockChange = (event) => {
    setInStockOnly(event.target.checked);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  const handleApplyFilters = () => {
    const filters = {
      searchTerm,
      categories: selectedCategories,
      rating: selectedRating,
      minPrice: priceValues[0],
      maxPrice: priceValues[1],
      inStockOnly,
    };
    
    onApplyFilters(filters);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedRating('');
    setPriceValues([priceRange.min, priceRange.max]);
    setInStockOnly(false);
    onResetFilters();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filterContent = (
    <Box sx={{ width: 250, p: 2 }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={toggleDrawer(false)}>
            <Close />
          </IconButton>
        </Box>
      )}

      <Typography variant="subtitle1" gutterBottom>Search</Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleSearchChange}
        margin="dense"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>Categories</Typography>
      <FormGroup>
        {categories.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox
                checked={selectedCategories.includes(category)}
                onChange={handleCategoryChange}
                name={category}
                size="small"
              />
            }
            label={<Typography variant="body2">{category}</Typography>}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceValues}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={priceRange.min}
          max={priceRange.max}
          disableSwap
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">${priceValues[0]}</Typography>
          <Typography variant="body2">${priceValues[1]}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>Rating</Typography>
      <FormControl component="fieldset">
        <RadioGroup value={selectedRating} onChange={handleRatingChange}>
          {ratings.map((rating) => (
            <FormControlLabel
              key={rating}
              value={rating.toString()}
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(rating)].map((_, i) => (
                    <span key={i} style={{ color: '#FFC107' }}>★</span>
                  ))}
                  {[...Array(5-rating)].map((_, i) => (
                    <span key={i} style={{ color: '#E0E0E0' }}>★</span>
                  ))}
                  <Typography variant="body2" sx={{ ml: 1 }}>& Up</Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      <FormControlLabel
        control={
          <Checkbox
            checked={inStockOnly}
            onChange={handleInStockChange}
            name="inStockOnly"
          />
        }
        label="In Stock Only"
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button 
            startIcon={<FilterList />} 
            onClick={toggleDrawer(true)}
            variant="outlined"
            fullWidth
          >
            Filters
          </Button>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {filterContent}
          </Drawer>
        </>
      ) : (
        <Box sx={{ width: 250, flexShrink: 0 }}>
          {filterContent}
        </Box>
      )}
    </>
  );
};

export default ProductFilter;