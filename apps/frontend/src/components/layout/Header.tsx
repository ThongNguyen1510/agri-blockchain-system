// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleConnectWallet = () => {
    // Logic kết nối ví MetaMask sẽ được thêm ở đây
    alert('Connecting to MetaMask...');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AgroChain Dashboard
        </Typography>
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Chào, {user.email} ({user.role})</Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={handleConnectWallet}>
            Kết nối Ví
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;