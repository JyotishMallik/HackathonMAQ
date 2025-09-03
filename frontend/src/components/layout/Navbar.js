import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  Divider,
  Container,
  useScrollTrigger,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  ConfirmationNumber,
  Code,
  Inventory,
  Person,
  Logout,
  ExpandMore,
} from '@mui/icons-material';
import { logout } from '../../store/authSlice';

// Navbar elevation scroll behavior
function ElevationScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const Navbar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleUserMenuClose();
    navigate('/login');
  };

  const renderUserMenu = () => (
    <Box>
      <Button
        onClick={handleUserMenuOpen}
        color="inherit"
        endIcon={<ExpandMore />}
        sx={{
          ml: 2,
          textTransform: 'none',
          fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
          fontSize: '0.9rem',
          fontWeight: 500,
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.12)',
          },
        }}
      >
        <Avatar
          alt={user?.username}
          src={user?.profile_picture}
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: '#1a237e',
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        {user?.first_name || 'User'}
      </Button>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            minWidth: 180,
            borderRadius: 1.5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            '& .MuiMenuItem-root': {
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              fontSize: '0.95rem',
            },
          }
        }}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: '#3949ab' }} />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#e53935' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <ElevationScroll {...props}>
      <AppBar 
        position="sticky"
        sx={{
          bgcolor: '#1a237e', // Deep blue background matching HomePage header
          backgroundImage: 'linear-gradient(90deg, #1a237e 0%, #303f9f 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            {/* Logo/Title Section - Left aligned */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: 'inherit',
                textDecoration: 'none',
                marginRight: 3,
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                fontSize: '1.25rem',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              ENTERPRISE HUB
            </Typography>

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMobileMenuToggle}
                  color="inherit"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuToggle}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      borderRadius: 1.5,
                      minWidth: 200,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <MenuItem component={RouterLink} to="/shopping" onClick={handleMobileMenuToggle} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <ShoppingCart fontSize="small" sx={{ color: '#3949ab' }} />
                    </ListItemIcon>
                    E-Commerce
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/tickets" onClick={handleMobileMenuToggle} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <ConfirmationNumber fontSize="small" sx={{ color: '#3949ab' }} />
                    </ListItemIcon>
                    Support Tickets
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/vulnerability" onClick={handleMobileMenuToggle} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <Code fontSize="small" sx={{ color: '#3949ab' }} />
                    </ListItemIcon>
                    Security Scanner
                  </MenuItem>
                  {user?.is_admin && (
                    <MenuItem component={RouterLink} to="/inventory" onClick={handleMobileMenuToggle} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <Inventory fontSize="small" sx={{ color: '#3949ab' }} />
                      </ListItemIcon>
                      Inventory Control
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            )}

            {/* Responsive Title for Mobile */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: 'inherit',
                textDecoration: 'none',
                display: { xs: 'flex', sm: 'none' },
                fontSize: '1.1rem',
              }}
            >
              ENTERPRISE
            </Typography>

            {/* Navigation Links - Left aligned for desktop */}
            {isAuthenticated && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/shopping"
                  color="inherit"
                  startIcon={<ShoppingCart />}
                  sx={{
                    mx: 1,
                    textTransform: 'none',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    borderRadius: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  E-Commerce
                </Button>
                <Button
                  component={RouterLink}
                  to="/tickets"
                  color="inherit"
                  startIcon={<ConfirmationNumber />}
                  sx={{
                    mx: 1,
                    textTransform: 'none',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    borderRadius: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Support Tickets
                </Button>
                <Button
                  component={RouterLink}
                  to="/vulnerability"
                  color="inherit"
                  startIcon={<Code />}
                  sx={{
                    mx: 1,
                    textTransform: 'none',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    borderRadius: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Security Scanner
                </Button>
                {user?.is_admin && (
                  <Button
                    component={RouterLink}
                    to="/inventory"
                    color="inherit"
                    startIcon={<Inventory />}
                    sx={{
                      mx: 1,
                      textTransform: 'none',
                      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      borderRadius: 1.5,
                      px: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Inventory Control
                  </Button>
                )}
              </Box>
            )}

            {/* Spacer to push content to opposite sides */}
            <Box sx={{ flexGrow: 1 }} />
            
            {/* User Menu - Right aligned */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                renderUserMenu()
              ) : (
                <>
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    color="inherit" 
                    sx={{
                      mx: 1,
                      textTransform: 'none',
                      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="contained"
                    sx={{
                      mx: 1,
                      textTransform: 'none',
                      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                      },
                      boxShadow: 'none',
                    }}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default Navbar;