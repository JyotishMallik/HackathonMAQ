import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Rating,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { addReview, fetchProductReviews } from '../../store/productSlice';

const ProductReview = ({ productId, reviews = [] }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.products);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to submit a review',
        severity: 'info'
      });
      return;
    }

    if (rating === 0 || comment.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please provide both a rating and comment',
        severity: 'error'
      });
      return;
    }

    try {
      await dispatch(addReview({
        product: productId,
        rating,
        comment
      })).unwrap();
      
      // Refresh reviews
      dispatch(fetchProductReviews(productId));
      
      // Reset form
      setRating(5);
      setComment('');
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit review',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Count ratings by value
  const ratingCounts = [5, 4, 3, 2, 1].reduce((acc, value) => {
    acc[value] = reviews.filter(review => review.rating === value).length;
    return acc;
  }, {});

  return (
    <Box>
      {/* Review Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h2" component="div" sx={{ mb: 1 }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} precision={0.1} readOnly sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box>
            {[5, 4, 3, 2, 1].map((value) => (
              <Box key={value} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ width: '40px' }}>
                  <Typography variant="body2">{value} ★</Typography>
                </Box>
                <Box sx={{ flex: 1, mx: 1, height: 10, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Box
                    sx={{
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      width: `${reviews.length > 0 ? (ratingCounts[value] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </Box>
                <Box sx={{ width: '40px' }}>
                  <Typography variant="body2" align="right">
                    {ratingCounts[value] || 0}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Write a review */}
      <Typography variant="h6" gutterBottom>Write a Review</Typography>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>Your Rating</Typography>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={1}
            size="large"
          />
        </Box>
        <TextField
          fullWidth
          label="Your Review"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmitReview}
          disabled={loading || !isAuthenticated}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
        {!isAuthenticated && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You need to be logged in to submit a review.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Customer Reviews */}
      <Typography variant="h6" gutterBottom>Customer Reviews</Typography>
      {reviews.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {reviews.map((review, index) => (
            <React.Fragment key={review.id || index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        alt={review.user_name || "User"}
                        src={review.user_avatar}
                        sx={{ width: 32, height: 32, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {review.user_name || "Anonymous"}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body1" component="div">
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              </ListItem>
              {index < reviews.length - 1 && <Box sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No reviews yet. Be the first to review this product!
        </Typography>
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
    </Box>
  );
};

export default ProductReview;