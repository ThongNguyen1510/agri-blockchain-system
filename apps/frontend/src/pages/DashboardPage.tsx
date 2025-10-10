// src/pages/DashboardPage.tsx
import React from 'react';
import { dummyOrders, dummyChartData } from './_dummyData';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatCard title="Tổng đơn hàng" value="125" />
        <StatCard title="Đơn đang xử lý" value="3" />
        <StatCard title="Doanh thu" value="1.5 ETH" />
      </div>
      <div className="main-content-grid">
        <SalesChart data={dummyChartData} />
        <RecentOrdersTable orders={dummyOrders} />
      </div>
    </div>
  );
};

export default DashboardPage;