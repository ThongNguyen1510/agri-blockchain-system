// src/components/dashboard/SalesChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

export interface ChartDataPoint {
  name: string;
  doanhthu: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
}

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Thống kê doanh thu</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="doanhthu" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
export default SalesChart;