// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'next/router'; // Dùng router của Next.js

const Header = () => {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout(); // Xóa thông tin user khỏi state
    router.replace('/login'); // Chuyển hướng về trang đăng nhập
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AgroChain Dashboard
        </Typography>
        
        {/* Chỉ hiển thị khi có thông tin user */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Chào, {user.email} ({user.role})</Typography>
            
            {/* --- NÚT ĐĂNG XUẤT ĐÂY RỒI --- */}
            <Button variant="outlined" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;