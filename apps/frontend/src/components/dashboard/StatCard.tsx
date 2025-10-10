// src/components/dashboard/StatCard.tsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// --- BẮT ĐẦU SỬA LỖI ---

// 1. Định nghĩa kiểu cho props của component
interface StatCardProps {
  title: string;
  value: string | number; // Giá trị có thể là chuỗi hoặc số
  icon?: React.ReactNode; // Icon là một React Node và không bắt buộc (optional)
}

// 2. Áp dụng kiểu `StatCardProps` cho component
const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <Card>
      <CardContent>
        {icon}
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;