import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { GitHub, LinkedIn, Twitter, Code } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1a237e', // Deep blue background matching header
        backgroundImage: 'linear-gradient(180deg, #1a237e 0%, #0d1257 100%)',
        color: 'white',
        width: '100%',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              ENTERPRISE HUB
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                opacity: 0.8,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              Your comprehensive enterprise solution for e-commerce, support, security, and inventory management.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <IconButton 
                aria-label="GitHub" 
                sx={{ 
                  mr: 1, 
                  color: 'white', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <GitHub />
              </IconButton>
              <IconButton 
                aria-label="LinkedIn" 
                sx={{ 
                  mr: 1, 
                  color: 'white', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton 
                aria-label="Twitter" 
                sx={{ 
                  mr: 1, 
                  color: 'white', 
                  opacity: 0.8,
                  '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <Twitter />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                Documentation
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                API Reference
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                Help Center
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                System Status
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                About Us
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  mb: 1.5, 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.8, 
                  '&:hover': { opacity: 1 },
                  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                  fontSize: '0.95rem',
                }}
              >
                Contact Us
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 5, mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.7,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              fontSize: '0.9rem',
              mb: { xs: 1, sm: 0 }
            }}
          >
            &copy; {currentYear} Enterprise Hub. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Code sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.7,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Built with React, Material-UI, Django & DRF
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;