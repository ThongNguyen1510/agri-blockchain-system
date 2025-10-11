// src/pages/register.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Box, TextField, Button, Typography, Alert, Link as MuiLink, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent 
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '../components/ConnectWalletButton'; // <--- ADD THIS LINE

interface RegisterData { email: string; password: string; role: 'Buyer' | 'Seller'; walletAddress: string; }
const apiRegister = async (data: RegisterData) => { console.log("Registering with data:", data); return { success: true }; };

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Buyer' | 'Seller'>('Buyer');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      setWalletAddress('');
    }
  }, [address, isConnected]);

  const handleRoleChange = (event: SelectChangeEvent) => { setRole(event.target.value as 'Buyer' | 'Seller'); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!isConnected || !walletAddress) {
      setError('Vui lòng kết nối ví MetaMask của bạn trước khi đăng ký!');
      return;
    }
    if (password !== confirmPassword) { setError('Mật khẩu nhập lại không khớp!'); return; }
    
    try {
      await apiRegister({ email, password, role, walletAddress });
      setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setTimeout(() => { router.push('/login'); }, 2000);
    } catch (err) {
      if (err instanceof Error) { setError(err.message); } 
      else { setError('Đã xảy ra lỗi trong quá trình đăng ký'); }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Đăng ký tài khoản</Typography>

        <Box sx={{ my: 2 }}>
            <ConnectWalletButton />
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField required fullWidth label="Địa chỉ Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField required fullWidth name="password" label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <TextField required fullWidth name="confirmPassword" label="Nhập lại mật khẩu" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select value={role} label="Vai trò" onChange={handleRoleChange}>
                <MenuItem value={'Buyer'}>Người mua (Buyer)</MenuItem>
                <MenuItem value={'Seller'}>Người bán (Seller)</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth disabled label="Địa chỉ Ví MetaMask" value={walletAddress} />
          </Box>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Đăng ký
          </Button>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <MuiLink component={Link} href="/login" variant="body2">
              Đã có tài khoản? Đăng nhập
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;