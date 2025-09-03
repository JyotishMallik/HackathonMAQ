import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  ShoppingCart,
  ConfirmationNumber,
  Code,
  Inventory,
} from '@mui/icons-material';

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const cardRefs = useRef([]);
  const [cardDimensions, setCardDimensions] = useState({ height: 0, width: 0 });
  
  const features = [
    {
      title: 'E-Commerce',
      description: 'Access our comprehensive product catalog with real-time inventory and verified customer reviews.',
      icon: <ShoppingCart sx={{ fontSize: 60 }} />,
      link: '/shopping',
    },
    {
      title: 'Support Tickets',
      description: 'Submit and track IT support requests through our streamlined ticket management system.',
      icon: <ConfirmationNumber sx={{ fontSize: 60 }} />,
      link: '/tickets',
    },
    {
      title: 'Security Scanner',
      description: 'Leverage AI-powered tools to identify and mitigate potential security vulnerabilities in your codebase.',
      icon: <Code sx={{ fontSize: 60 }} />,
      link: '/vulnerability',
    },
  ];
  
  // Admin-only feature
  if (user?.is_admin) {
    features.push({
      title: 'Inventory Control',
      description: 'Access advanced inventory analytics and management tools for optimizing stock levels and fulfillment.',
      icon: <Inventory sx={{ fontSize: 60 }} />,
      link: '/inventory',
    });
  }

  // Initialize or resize the refs array when features change
  useEffect(() => {
    cardRefs.current = Array(features.length).fill().map((_, i) => cardRefs.current[i] || React.createRef());
  }, [features.length]);

  // Calculate and set equal dimensions for all cards
  useEffect(() => {
    const equalizeCardDimensions = () => {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        if (cardRefs.current.length > 0) {
          // Get all card elements
          const cardElements = cardRefs.current
            .map(ref => ref.current)
            .filter(el => el !== null);

          if (cardElements.length > 0) {
            // Reset dimensions first to get true content sizes
            cardElements.forEach(card => {
              card.style.height = 'auto';
              card.style.width = '100%'; // Reset to container width
            });
            
            // Find the tallest card
            const maxHeight = Math.max(...cardElements.map(card => card.offsetHeight));
            
            // Find the widest card - typically they'll all have the same width based on grid
            // but we'll measure to be sure
            const maxWidth = Math.max(...cardElements.map(card => card.offsetWidth));
            
            // Only update if dimensions are valid
            if (maxHeight > 0 && maxWidth > 0) {
              setCardDimensions({ height: maxHeight, width: maxWidth });
              
              // Apply equal dimensions to all cards
              cardElements.forEach(card => {
                card.style.height = `${maxHeight}px`;
                // For width, we need to be careful not to break the grid layout
                // We'll set a min-width instead of a fixed width
                card.style.minWidth = `${maxWidth}px`;
              });
            }
          }
        }
      });
    };

    // Initial dimension calculation
    equalizeCardDimensions();
    
    // Recalculate on window resize
    window.addEventListener('resize', equalizeCardDimensions);
    
    return () => {
      window.removeEventListener('resize', equalizeCardDimensions);
    };
  }, [features.length]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          mb: 5, 
          textAlign: 'center',
          background: 'linear-gradient(120deg, #1a237e 0%, #3949ab 100%)', // Deeper, more professional blue gradient
          color: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.05)', // Subtle overlay for depth
            zIndex: 0,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600, 
              letterSpacing: '0.02em',
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              mb: 2
            }}
          >
            Welcome, {user?.first_name ? user.first_name : 'Valued Professional'}
          </Typography>
          <Typography 
            variant="h5"
            sx={{ 
              fontWeight: 300,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              opacity: 0.9,
              letterSpacing: '0.05em'
            }}
          >
            Enterprise Solution Portal
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            fontWeight: 500,
            color: '#1a237e',
            mb: 3
          }}
        >
          Core Services
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          sx={{
            mb: 5,
            maxWidth: '800px',
            mx: 'auto',
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            color: '#546e7a',
            fontSize: '1.1rem',
            lineHeight: 1.7
          }}
        >
          Access our integrated suite of tools designed to enhance productivity and streamline your workflow.
          Select from our enterprise-grade solutions below.
        </Typography>
      </Box>
      
      {/* Use equal spacing between grid items */}
      <Grid 
        container 
        spacing={4} 
        sx={{ 
          mb: 6,
          justifyContent: 'center', // Center cards if there are fewer than 4
        }}
      >
        {features.map((feature, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={3} 
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'center', // Center the card in its grid cell
            }}
          >
            <Card 
              ref={cardRefs.current[index]}
              sx={{ 
                height: cardDimensions.height || '100%',
                width: '100%', // Take full width of grid item
                maxWidth: { xs: '100%', sm: '280px' }, // Limit max width on larger screens
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                borderRadius: 2,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  justifyContent: 'center',
                  color: '#3949ab' // Modern indigo that complements the header
                }}
              >
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: 3 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2" 
                  align="center"
                  sx={{ 
                    mb: 2,
                    height: '40px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    fontWeight: 600,
                    color: '#1a237e'
                  }}
                >
                  {feature.title}
                </Typography>
                <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Typography 
                    align="center"
                    sx={{
                      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                      color: '#546e7a',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', p: 3, pt: 1 }}>
                <Button 
                  component={RouterLink} 
                  to={feature.link} 
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    textTransform: 'none', // More modern look without all-caps
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    borderRadius: 1.5,
                    py: 1.2,
                    background: 'linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%)', // Subtle gradient button
                    boxShadow: '0 4px 12px rgba(57, 73, 171, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 14px rgba(57, 73, 171, 0.4)',
                    }
                  }}
                >
                  Access Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          bgcolor: '#f8faff', // Very light blue background
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(200, 210, 240, 0.5)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            color: '#1a237e',
            fontWeight: 600,
            mb: 2
          }}
        >
          Enterprise Platform Overview
        </Typography>
        <Typography 
          sx={{
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            color: '#546e7a',
            mb: 3,
            fontSize: '1rem',
            lineHeight: 1.7
          }}
        >
          Our enterprise platform delivers a comprehensive ecosystem of integrated tools for modern businesses. 
          The platform includes a secure e-commerce suite, enterprise-grade ticketing system, 
          advanced security scanning capabilities, and robust inventory management for administrators.
        </Typography>
        <Typography 
          sx={{
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            color: '#546e7a',
            fontSize: '1rem',
            lineHeight: 1.7
          }}
        >
          Our AI-powered virtual assistant is available 24/7 to provide contextual support and guidance 
          throughout your experience. For optimal results, we recommend exploring each module to leverage 
          the full capabilities of our enterprise solution.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HomePage;