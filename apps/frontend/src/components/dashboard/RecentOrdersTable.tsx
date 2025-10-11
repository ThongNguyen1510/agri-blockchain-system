// src/components/dashboard/RecentOrdersTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material';

export interface Order {
  id: number; product: string; total: string; status: 'Held' | 'Released' | 'Refunded' | 'Disputed'; date: string;
}

interface Props { orders: Order[]; }

const getStatusChipColor = (status: Order['status']) => {
    if (status === 'Held') return 'warning';
    if (status === 'Released') return 'success';
    if (status === 'Disputed') return 'error';
    return 'default';
}

const RecentOrdersTable = ({ orders }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>Đơn hàng gần đây</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell> <TableCell>Sản phẩm</TableCell> <TableCell>Tổng tiền</TableCell> <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell> <TableCell>{order.product}</TableCell> <TableCell>{order.total}</TableCell>
              <TableCell><Chip label={order.status} color={getStatusChipColor(order.status)} size="small" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default RecentOrdersTable;