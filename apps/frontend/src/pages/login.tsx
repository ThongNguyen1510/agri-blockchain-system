// src/pages/login.tsx
import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Still need to import Link
import { useUserStore, User } from '../store/userStore';

const apiLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  if (email === 'seller@agrochain.local' && password === 'Seller123!') {
    return { token: 'fake-jwt-token-seller', user: { id: 1, email, role: 'Seller', walletAddress: '0x123' } };
  }
  if (email === 'buyer@agrochain.local' && password === 'Buyer123!') {
    return { token: 'fake-jwt-token-buyer', user: { id: 2, email, role: 'Buyer', walletAddress: '0x456' } };
  }
  throw new Error('Email hoặc mật khẩu không đúng');
};

const LoginPage = () => {
  const [email, setEmail] = useState('seller@agrochain.local');
  const [password, setPassword] = useState('Seller123!');
  const [error, setError] = useState('');
  const router = useRouter(); 
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const { user, token } = await apiLogin(email, password);
      setUser(user, token);
      router.replace('/dashboard'); 
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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal" required fullWidth id="email" label="Địa chỉ Email"
            name="email" autoComplete="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Mật khẩu"
            type="password" id="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Đăng nhập
          </Button>
          
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <MuiLink component={Link} href="/register" variant="body2">
              {"Chưa có tài khoản? Đăng ký"}
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;