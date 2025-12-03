// src/pages/admin/audit.tsx - Tuần 8: Lịch sử hệ thống & Audit Log
import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { useUserStore } from '../../store/userStore';
import { Alert } from '@mui/material';

interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  metadata: string;
  createdAt: string;
  ipAddress?: string;
}

const dummyAuditLogs: AuditLog[] = [
  {
    id: 1,
    actorEmail: 'admin@agrochain.local',
    action: 'ORDER_RELEASED',
    metadata: JSON.stringify({ orderId: 1023, amount: '0.05 ETH' }),
    createdAt: '2025-10-26 10:30:00',
    ipAddress: '192.168.1.100',
  },
  {
    id: 2,
    actorEmail: 'buyer@agrochain.local',
    action: 'DISPUTE_CREATED',
    metadata: JSON.stringify({ orderId: 1021, reason: 'Sản phẩm không đúng chất lượng' }),
    createdAt: '2025-10-25 14:20:00',
    ipAddress: '192.168.1.101',
  },
  {
    id: 3,
    actorEmail: 'seller@agrochain.local',
    action: 'PRODUCT_CREATED',
    metadata: JSON.stringify({ productId: 501, name: 'Lúa hữu cơ' }),
    createdAt: '2025-10-24 09:15:00',
    ipAddress: '192.168.1.102',
  },
  {
    id: 4,
    actorEmail: 'admin@agrochain.local',
    action: 'ORDER_REFUNDED',
    metadata: JSON.stringify({ orderId: 1015, amount: '0.20 ETH' }),
    createdAt: '2025-10-23 16:45:00',
    ipAddress: '192.168.1.100',
  },
];

const AuditPage = () => {
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  if (user?.role !== 'Admin') {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Bạn không có quyền truy cập trang này</Alert>
        </Box>
      </MainLayout>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes('RELEASED') || action.includes('CREATED')) return 'success';
    if (action.includes('REFUNDED') || action.includes('CANCELLED')) return 'error';
    if (action.includes('DISPUTE')) return 'warning';
    return 'default';
  };

  const filteredLogs = dummyAuditLogs.filter(log => {
    const matchesSearch = log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = Array.from(new Set(dummyAuditLogs.map(log => log.action)));

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lịch sử Hệ thống (Audit Log)
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 3 }}>
          <TextField
            placeholder="Tìm kiếm theo email hoặc hành động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo hành động</InputLabel>
            <Select
              value={filterAction}
              label="Lọc theo hành động"
              onChange={(e) => setFilterAction(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {uniqueActions.map(action => (
                <MenuItem key={action} value={action}>{action}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Người thực hiện</TableCell>
                <TableCell>Hành động</TableCell>
                <TableCell>Chi tiết</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => {
                let metadataObj;
                try {
                  metadataObj = JSON.parse(log.metadata);
                } catch {
                  metadataObj = { raw: log.metadata };
                }

                return (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.createdAt}</TableCell>
                    <TableCell>{log.actorEmail}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {JSON.stringify(metadataObj, null, 2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredLogs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Không tìm thấy log nào</Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default AuditPage;

