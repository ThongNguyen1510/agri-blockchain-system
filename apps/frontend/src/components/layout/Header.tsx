// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'next/router';
import { ConnectWalletButton } from '../ConnectWalletButton'; // Import component mới

const Header = () => {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AgroChain
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Luôn hiển thị nút kết nối ví */}
          <ConnectWalletButton />

          {/* Chỉ hiển thị nút đăng xuất khi đã đăng nhập */}
          {user && (
            <Button variant="outlined" onClick={handleLogout}>
              Đăng xuất
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;