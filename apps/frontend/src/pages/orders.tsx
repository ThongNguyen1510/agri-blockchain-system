// src/pages/orders.tsx - Tuần 7: Module Order Seller/Admin
import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { CheckCircle, Cancel, LocalShipping, Warning } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useUserStore } from '../store/userStore';

interface Order {
  id: number;
  productName: string;
  buyerEmail: string;
  quantity: number;
  totalPrice: string;
  status: 'Held' | 'Released' | 'Refunded' | 'Disputed' | 'Shipped';
  escrowAddress: string;
  createdAt: string;
}

const dummyOrders: Order[] = [
  {
    id: 1,
    productName: 'Lúa hữu cơ',
    buyerEmail: 'buyer@agrochain.local',
    quantity: 10,
    totalPrice: '0.15 ETH',
    status: 'Held',
    escrowAddress: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2025-10-26',
  },
  {
    id: 2,
    productName: 'Cà chua sạch',
    buyerEmail: 'buyer2@example.com',
    quantity: 20,
    totalPrice: '0.08 ETH',
    status: 'Shipped',
    escrowAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    createdAt: '2025-10-25',
  },
];

const OrdersPage = () => {
  const { user } = useUserStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Held': return 'warning';
      case 'Released': return 'success';
      case 'Refunded': return 'error';
      case 'Disputed': return 'error';
      case 'Shipped': return 'info';
      default: return 'default';
    }
  };

  const handleAction = (order: Order, action: string) => {
    setSelectedOrder(order);
    setOpenDialog(true);
    // TODO: Implement action logic
    console.log(`Action: ${action} for order ${order.id}`);
  };

  const filteredOrders = user?.role === 'Seller' 
    ? dummyOrders.filter(o => o.buyerEmail !== user.email)
    : user?.role === 'Buyer'
    ? dummyOrders.filter(o => o.buyerEmail === user.email)
    : dummyOrders;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Đơn hàng
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>{user?.role === 'Seller' ? 'Người mua' : 'Người bán'}</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái Escrow</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{user?.role === 'Seller' ? order.buyerEmail : 'seller@agrochain.local'}</TableCell>
                  <TableCell>{order.quantity} kg</TableCell>
                  <TableCell>{order.totalPrice}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                      {order.escrowAddress.slice(0, 20)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell>
                    {user?.role === 'Admin' && order.status === 'Held' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleAction(order, 'release')}
                          sx={{ mr: 1 }}
                        >
                          Release
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleAction(order, 'refund')}
                        >
                          Refund
                        </Button>
                      </>
                    )}
                    {user?.role === 'Buyer' && order.status === 'Shipped' && (
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleAction(order, 'confirm')}
                      >
                        Xác nhận nhận hàng
                      </Button>
                    )}
                    {user?.role === 'Seller' && order.status === 'Held' && (
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<LocalShipping />}
                        onClick={() => handleAction(order, 'ship')}
                      >
                        Giao hàng
                      </Button>
                    )}
                    {user?.role === 'Buyer' && order.status === 'Held' && (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<Warning />}
                        onClick={() => handleAction(order, 'dispute')}
                      >
                        Tạo tranh chấp
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {selectedOrder && `Chi tiết đơn hàng #${selectedOrder.id}`}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                <Typography><strong>Sản phẩm:</strong> {selectedOrder.productName}</Typography>
                <Typography><strong>Số lượng:</strong> {selectedOrder.quantity} kg</Typography>
                <Typography><strong>Tổng tiền:</strong> {selectedOrder.totalPrice}</Typography>
                <Typography><strong>Escrow Address:</strong></Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {selectedOrder.escrowAddress}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default OrdersPage;

