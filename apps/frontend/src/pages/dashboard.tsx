// src/pages/dashboard.tsx
import React, { useEffect } from 'react'; // SỬA LỖI CÚ PHÁP Ở ĐÂY
import { useRouter } from 'next/router';
import { useUserStore } from '../store/userStore';
import MainLayout from '../components/layout/MainLayout';
import { Typography, Box } from '@mui/material'; // Bỏ Grid, chỉ dùng Box

import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import { dummyOrders, dummyChartData } from '../lib/dummyData';

const DashboardPage = () => {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        
        {/* SỬA LỖI LAYOUT: Dùng Box và Flexbox thay cho Grid */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          {/* Hàng cho các thẻ thống kê */}
          <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <StatCard title="Tổng đơn hàng" value="125" />
          </Box>
          <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <StatCard title="Đơn đang xử lý" value={dummyOrders.filter(o => o.status === 'Held').length} />
          </Box>
          <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <StatCard title="Doanh thu (ETH)" value="1.5" />
          </Box>
          <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <StatCard title="Tranh chấp" value={dummyOrders.filter(o => o.status === 'Disputed').length} />
          </Box>
          
          {/* Hàng cho Biểu đồ */}
          <Box sx={{ p: 1.5, width: '100%' }}>
            <SalesChart data={dummyChartData} />
          </Box>
          
          {/* Hàng cho Bảng đơn hàng */}
          <Box sx={{ p: 1.5, width: '100%' }}>
            <RecentOrdersTable orders={dummyOrders} />
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;