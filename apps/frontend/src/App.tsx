// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Import các trang và component cần thiết
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Component để bọc các trang cần layout chính (Header, Sidebar)
const AppLayout = () => (
  <Box sx={{ display: 'flex' }}>
    <MainLayout>
      <Outlet /> {/* Nội dung của các trang con sẽ được render ở đây */}
    </MainLayout>
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route công khai cho trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Các route cần bảo vệ */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Seller', 'Buyer']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Bạn có thể thêm các route được bảo vệ khác ở đây */}
            {/* Ví dụ: <Route path="/products" element={<ProductsPage />} /> */}
          </Route>
        </Route>

        {/* Route mặc định: nếu người dùng truy cập bất kỳ đường dẫn nào khác,
            chuyển hướng họ về trang login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;