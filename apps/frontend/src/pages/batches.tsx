// src/pages/batches.tsx - Tuần 4: Module Batch
import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useUserStore } from '../store/userStore';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useToastStore } from '../store/toastStore';

interface Batch {
  id: number;
  batchCode: string;
  name: string;
  farmName?: string;
  harvestDate?: string;
  blockchainHash: string;
  ipfsCid: string;
  createdAt: string;
}

const dummyBatches: Batch[] = [
  {
    id: 1,
    batchCode: 'BATCH-001',
    name: 'Lô nông sản 001',
    farmName: 'Nông trại ABC',
    harvestDate: '2025-10-15',
    blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
    ipfsCid: 'QmYjtig7VJQ6ShqmzFVekCCy4Qx7y1KsGpHpfHSKSiTjxz',
    createdAt: '2025-10-10',
  },
  {
    id: 2,
    batchCode: 'BATCH-002',
    name: 'Lô rau củ 002',
    farmName: 'Nông trại XYZ',
    harvestDate: '2025-10-20',
    blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    ipfsCid: 'QmXyZabcdefghijklmnopqrstuvwxyz1234567890',
    createdAt: '2025-10-12',
  },
];

const BatchesPage = () => {
  const { user } = useUserStore();
  const { showToast } = useToastStore();
  const [isLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    batchCode: '',
    name: '',
    farmName: '',
    harvestDate: '',
  });

  const handleCreate = () => {
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    // TODO: Call API to create batch
    showToast('Đã tạo lô hàng thành công!', 'success');
    setOpenDialog(false);
    setFormData({ batchCode: '', name: '', farmName: '', harvestDate: '' });
  };

  const handleViewDetails = (batch: Batch) => {
    setSelectedBatch(batch);
    setOpenDialog(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <LoadingSkeleton variant="table" rows={5} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Quản lý Lô hàng</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Tạo lô mới
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã lô</TableCell>
                <TableCell>Tên lô</TableCell>
                <TableCell>Nông trại</TableCell>
                <TableCell>Ngày thu hoạch</TableCell>
                <TableCell>Blockchain Hash</TableCell>
                <TableCell>IPFS CID</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>{batch.batchCode}</TableCell>
                  <TableCell>{batch.name}</TableCell>
                  <TableCell>{batch.farmName || 'N/A'}</TableCell>
                  <TableCell>{batch.harvestDate || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {batch.blockchainHash.slice(0, 20)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {batch.ipfsCid.slice(0, 20)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(batch)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => {
          setOpenDialog(false);
          setSelectedBatch(null);
          setFormData({ batchCode: '', name: '', farmName: '', harvestDate: '' });
        }} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedBatch ? `Chi tiết lô hàng ${selectedBatch.batchCode}` : 'Tạo lô hàng mới'}
          </DialogTitle>
          <DialogContent>
            {selectedBatch ? (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Mã lô:</strong> {selectedBatch.batchCode}</Typography>
                <Typography><strong>Tên lô:</strong> {selectedBatch.name}</Typography>
                <Typography><strong>Nông trại:</strong> {selectedBatch.farmName || 'N/A'}</Typography>
                <Typography><strong>Ngày thu hoạch:</strong> {selectedBatch.harvestDate || 'N/A'}</Typography>
                <Typography><strong>Blockchain Hash:</strong></Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mb: 2 }}>
                  {selectedBatch.blockchainHash}
                </Typography>
                <Typography><strong>IPFS CID:</strong></Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {selectedBatch.ipfsCid}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    href={`https://ipfs.io/ipfs/${selectedBatch.ipfsCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem chứng chỉ trên IPFS
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Mã lô"
                  value={formData.batchCode}
                  onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Tên lô"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Nông trại"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Ngày thu hoạch"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setSelectedBatch(null);
              setFormData({ batchCode: '', name: '', farmName: '', harvestDate: '' });
            }}>
              {selectedBatch ? 'Đóng' : 'Hủy'}
            </Button>
            {!selectedBatch && (
              <Button onClick={handleSubmit} variant="contained">
                Tạo lô
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default BatchesPage;

