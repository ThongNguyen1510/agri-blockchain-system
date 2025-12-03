// src/pages/my-orders.tsx - Tuần 7: Đơn hàng của Buyer
import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';

interface Order {
  id: number;
  productName: string;
  sellerEmail: string;
  quantity: number;
  totalPrice: string;
  status: 'Held' | 'Released' | 'Refunded' | 'Disputed' | 'Shipped';
  escrowAddress: string;
  createdAt: string;
}

const dummyBuyerOrders: Order[] = [
  {
    id: 1,
    productName: 'Lúa hữu cơ',
    sellerEmail: 'seller@agrochain.local',
    quantity: 10,
    totalPrice: '0.15 ETH',
    status: 'Shipped',
    escrowAddress: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2025-10-26',
  },
  {
    id: 2,
    productName: 'Cà chua sạch',
    sellerEmail: 'seller@agrochain.local',
    quantity: 20,
    totalPrice: '0.08 ETH',
    status: 'Held',
    escrowAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    createdAt: '2025-10-25',
  },
];

const MyOrdersPage = () => {
  const { user } = useUserStore();
  const { showToast } = useToastStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handleConfirmReceipt = (order: Order) => {
    // TODO: Call API to confirm receipt
    showToast('Đã xác nhận nhận hàng! Tiền đã được chuyển đến người bán.', 'success');
  };

  const handleCreateDispute = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleSubmitDispute = () => {
    if (!disputeReason.trim()) {
      showToast('Vui lòng nhập lý do tranh chấp', 'warning');
      return;
    }
    // TODO: Call API to create dispute
    showToast('Đã gửi tranh chấp. Admin sẽ xem xét trong thời gian sớm nhất.', 'success');
    setOpenDialog(false);
    setDisputeReason('');
  };

  if (user?.role !== 'Buyer') {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Bạn không có quyền truy cập trang này</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Đơn hàng của tôi
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Người bán</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái Escrow</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyBuyerOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.sellerEmail}</TableCell>
                  <TableCell>{order.quantity} kg</TableCell>
                  <TableCell>{order.totalPrice}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={
                        order.status === 'Held' ? 'warning' :
                        order.status === 'Released' ? 'success' :
                        order.status === 'Disputed' ? 'error' :
                        order.status === 'Shipped' ? 'info' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell>
                    {order.status === 'Shipped' && (
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleConfirmReceipt(order)}
                      >
                        Xác nhận nhận hàng
                      </Button>
                    )}
                    {order.status === 'Held' && (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<Warning />}
                        onClick={() => handleCreateDispute(order)}
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Tạo tranh chấp</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Đơn hàng:</strong> #{selectedOrder.id}</Typography>
                <Typography><strong>Sản phẩm:</strong> {selectedOrder.productName}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Lý do tranh chấp"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setDisputeReason('');
            }}>
              Hủy
            </Button>
            <Button onClick={handleSubmitDispute} variant="contained" color="warning">
              Gửi tranh chấp
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default MyOrdersPage;

