// src/pages/admin/disputes.tsx - Tuần 8: Tranh chấp & Audit
import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useUserStore } from '../../store/userStore';

interface Dispute {
  id: number;
  orderId: number;
  buyerEmail: string;
  sellerEmail: string;
  productName: string;
  reason: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

const dummyDisputes: Dispute[] = [
  {
    id: 1,
    orderId: 1021,
    buyerEmail: 'buyer@agrochain.local',
    sellerEmail: 'seller@agrochain.local',
    productName: 'Thanh long Bình Thuận',
    reason: 'Sản phẩm không đúng chất lượng như mô tả, bị hư hỏng nhiều',
    status: 'Pending',
    createdAt: '2025-10-20',
  },
  {
    id: 2,
    orderId: 1015,
    buyerEmail: 'buyer2@example.com',
    sellerEmail: 'seller@agrochain.local',
    productName: 'Cam sành Hàm Yên',
    reason: 'Giao hàng chậm, sản phẩm bị hỏng do vận chuyển',
    status: 'Resolved',
    createdAt: '2025-10-15',
    resolvedAt: '2025-10-18',
    resolution: 'Đã hoàn tiền cho người mua',
  },
];

const DisputesPage = () => {
  const { user } = useUserStore();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState<'release' | 'refund' | null>(null);

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setOpenDialog(true);
  };

  const handleResolve = (dispute: Dispute, action: 'release' | 'refund') => {
    setSelectedDispute(dispute);
    setAction(action);
    setOpenDialog(true);
  };

  const handleSubmitResolution = () => {
    // TODO: Call API to resolve dispute
    console.log(`Resolve dispute ${selectedDispute?.id} with action: ${action}, resolution: ${resolution}`);
    setOpenDialog(false);
    setResolution('');
    setAction(null);
  };

  if (user?.role !== 'Admin') {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Bạn không có quyền truy cập trang này</Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Giải quyết Tranh chấp
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Đơn hàng</TableCell>
                <TableCell>Người mua</TableCell>
                <TableCell>Người bán</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>{dispute.id}</TableCell>
                  <TableCell>#{dispute.orderId}</TableCell>
                  <TableCell>{dispute.buyerEmail}</TableCell>
                  <TableCell>{dispute.sellerEmail}</TableCell>
                  <TableCell>{dispute.productName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dispute.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={dispute.status}
                      color={dispute.status === 'Pending' ? 'warning' : dispute.status === 'Resolved' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dispute.createdAt}</TableCell>
                  <TableCell>
                    {dispute.status === 'Pending' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(dispute)}
                          sx={{ mr: 1 }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleResolve(dispute, 'release')}
                          sx={{ mr: 1 }}
                        >
                          Release
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleResolve(dispute, 'refund')}
                        >
                          Refund
                        </Button>
                      </>
                    )}
                    {dispute.status === 'Resolved' && (
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(dispute)}
                      >
                        Xem
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {action ? `Giải quyết tranh chấp #${selectedDispute?.id}` : `Chi tiết tranh chấp #${selectedDispute?.id}`}
          </DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Đơn hàng:</strong> #{selectedDispute.orderId}</Typography>
                <Typography><strong>Sản phẩm:</strong> {selectedDispute.productName}</Typography>
                <Typography><strong>Người mua:</strong> {selectedDispute.buyerEmail}</Typography>
                <Typography><strong>Người bán:</strong> {selectedDispute.sellerEmail}</Typography>
                <Typography><strong>Lý do tranh chấp:</strong></Typography>
                <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                  {selectedDispute.reason}
                </Alert>
                {action && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Ghi chú giải quyết"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
                {selectedDispute.resolution && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography><strong>Đã giải quyết:</strong> {selectedDispute.resolution}</Typography>
                    <Typography variant="caption">Ngày: {selectedDispute.resolvedAt}</Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setResolution('');
              setAction(null);
            }}>
              Hủy
            </Button>
            {action && (
              <Button onClick={handleSubmitResolution} variant="contained" color={action === 'release' ? 'success' : 'error'}>
                Xác nhận {action === 'release' ? 'Release' : 'Refund'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default DisputesPage;

