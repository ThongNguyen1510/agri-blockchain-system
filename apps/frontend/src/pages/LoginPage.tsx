// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// --- BẮT ĐẦU SỬA LỖI ---
// 1. Import kiểu `User` từ store
import { useUserStore, User } from '../store/userStore';

// 2. Khai báo kiểu trả về cho hàm apiLogin
const apiLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  if (email === 'seller@agrochain.local' && password === 'Seller123!') {
    // TypeScript giờ sẽ kiểm tra xem đối tượng trả về có khớp với kiểu `User` không
    return {
      token: 'fake-jwt-token-seller',
      user: { id: 1, email, role: 'Seller', walletAddress: '0x123' },
    };
  }
  if (email === 'buyer@agrochain.local' && password === 'Buyer123!') {
    return {
      token: 'fake-jwt-token-buyer',
      user: { id: 2, email, role: 'Buyer', walletAddress: '0x456' },
    };
  }
  throw new Error('Email hoặc mật khẩu không đúng');
};

const LoginPage = () => {
  const [email, setEmail] = useState('seller@agrochain.local');
  const [password, setPassword] = useState('Seller123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const { user, token } = await apiLogin(email, password);
      // Giờ `user` ở đây được hiểu chính xác là kiểu `User` nên không còn lỗi
      setUser(user, token); 
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Một lỗi không mong muốn đã xảy ra');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Đăng nhập</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            margin="normal" required fullWidth id="email" label="Địa chỉ Email"
            name="email" autoComplete="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Mật khẩu"
            type="password" id="password" autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Đăng nhập
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;