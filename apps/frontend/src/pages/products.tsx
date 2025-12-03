// src/pages/products.tsx - Tuần 5: Module Product
import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  batchId: number;
  batchName: string;
  imageUrl?: string;
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: 'Lúa hữu cơ',
    description: 'Gạo sạch, an toàn cho sức khỏe',
    price: 25000,
    stock: 500,
    batchId: 1,
    batchName: 'Lô nông sản 001',
  },
  {
    id: 2,
    name: 'Cà chua sạch',
    description: 'Trồng theo tiêu chuẩn VietGAP',
    price: 15000,
    stock: 200,
    batchId: 2,
    batchName: 'Lô rau củ 002',
  },
];

const ProductsPage = () => {
  const { user } = useUserStore();
  const { showToast } = useToastStore();
  const [isLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterBatch, setFilterBatch] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    batchId: '1',
  });

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', batchId: '1' });
    setOpenDialog(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      batchId: product.batchId.toString(),
    });
    setOpenDialog(true);
  };

  const handleDelete = (productId: number) => {
    // TODO: Call API to delete
    showToast('Đã xóa sản phẩm thành công!', 'success');
  };

  const handleSubmit = () => {
    // TODO: Call API to create/update
    showToast(selectedProduct ? 'Đã cập nhật sản phẩm!' : 'Đã tạo sản phẩm thành công!', 'success');
    setOpenDialog(false);
  };

  const filteredProducts = filterBatch === 'all'
    ? dummyProducts
    : dummyProducts.filter(p => p.batchId.toString() === filterBatch);

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <LoadingSkeleton variant="card" rows={6} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Quản lý Sản phẩm</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Thêm sản phẩm
          </Button>
        </Box>

        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>Lọc theo lô</InputLabel>
          <Select
            value={filterBatch}
            label="Lọc theo lô"
            onChange={(e) => setFilterBatch(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="1">Lô 001</MenuItem>
            <MenuItem value="2">Lô 002</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <Box sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No Image</Typography>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {product.price.toLocaleString('vi-VN')} đ/kg
                  </Typography>
                  <Typography variant="body2">Tồn kho: {product.stock} kg</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lô: {product.batchName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Edit />} onClick={() => handleEdit(product)}>
                    Sửa
                  </Button>
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(product.id)}>
                    Xóa
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Giá (đ)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Số lượng (kg)"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Chọn lô</InputLabel>
                <Select
                  value={formData.batchId}
                  label="Chọn lô"
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                >
                  <MenuItem value="1">Lô 001</MenuItem>
                  <MenuItem value="2">Lô 002</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedProduct ? 'Cập nhật' : 'Tạo'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default ProductsPage;

