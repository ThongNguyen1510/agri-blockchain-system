// src/components/dashboard/RecentOrdersTable.tsx

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Chip 
} from '@mui/material';

// Export interface `Order` để các file khác (như _dummyData.ts) có thể sử dụng
export interface Order {
  id: number;
  product: string;
  total: string;
  status: 'Held' | 'Released' | 'Refunded' | 'Disputed';
  date: string;
}

// Định nghĩa kiểu cho props của component
interface Props {
  orders: Order[];
}

// Hàm helper để xác định màu cho chip trạng thái
const getStatusChipColor = (status: Order['status']) => {
    if (status === 'Held') return 'warning';
    if (status === 'Released') return 'success';
    if (status === 'Disputed') return 'error';
    // 'Refunded' và các trường hợp khác sẽ có màu mặc định
    return 'default'; 
}

const RecentOrdersTable = ({ orders }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Đơn hàng gần đây
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ID Đơn hàng</TableCell>
            <TableCell>Sản phẩm</TableCell>
            <TableCell align="right">Tổng tiền</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="right">Ngày tạo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                #{order.id}
              </TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell align="right">{order.total}</TableCell>
              <TableCell align="center">
                <Chip 
                  label={order.status} 
                  color={getStatusChipColor(order.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell align="right">{order.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentOrdersTable;