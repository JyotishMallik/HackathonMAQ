import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Box, CssBaseline } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import TicketsPage from './pages/TicketsPage';
import VulnerabilityPage from './pages/VulnerabilityPage';
import InventoryPage from './pages/InventoryPage';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/layout/ChatBot';

// Redux actions
import { fetchCurrentUser } from './store/authSlice';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && (!user || !user.is_admin)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', // Full viewport height
        }}
      >
        <CssBaseline /> {/* Ensures consistent baseline CSS */}
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1, // Takes up available space
            py: 3,       // Padding top and bottom
            px: { xs: 2, md: 3 } // Responsive padding left/right
          }}
        >
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/shopping" element={<ProtectedRoute><ShoppingPage /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
            <Route path="/vulnerability" element={<ProtectedRoute><VulnerabilityPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute adminOnly={true}><InventoryPage /></ProtectedRoute>} />
          </Routes>
        </Box>
        <ChatBot />
        <Footer />
        <ToastContainer position="bottom-right" />
      </Box>
    </Router>
  );
}

export default App;