// src/pages/index.tsx - Marketplace cho Buyer
import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Search, ShoppingCart, Visibility, QrCode } from '@mui/icons-material';
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
  sellerEmail: string;
  batch: {
    id: number;
    name: string;
    blockchainHash: string;
    ipfsCid: string;
  };
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: 'Lúa hữu cơ',
    description: 'Gạo sạch, an toàn cho sức khỏe',
    price: 25000,
    stock: 500,
    sellerEmail: 'seller@agrochain.local',
    batch: {
      id: 1,
      name: 'Lô nông sản 001',
      blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
      ipfsCid: 'QmYjtig7VJQ6ShqmzFVekCCy4Qx7y1KsGpHpfHSKSiTjxz',
    },
  },
  {
    id: 2,
    name: 'Cà chua sạch',
    description: 'Trồng theo tiêu chuẩn VietGAP',
    price: 15000,
    stock: 200,
    sellerEmail: 'seller@agrochain.local',
    batch: {
      id: 2,
      name: 'Lô rau củ 002',
      blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      ipfsCid: 'QmXyZabcdefghijklmnopqrstuvwxyz1234567890',
    },
  },
];

const MarketplacePage = () => {
  const { user } = useUserStore();
  const { showToast } = useToastStore();
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [quantity, setQuantity] = useState('1');

  const handleOrder = (product: Product) => {
    // TODO: Call smart contract to create order
    showToast('Đã đặt hàng thành công!', 'success');
  };

  const filteredProducts = dummyProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography variant="h4" gutterBottom>
          Marketplace
        </Typography>

        <TextField
          fullWidth
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 600 }}
        />

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
                  <Typography variant="body2">Còn lại: {product.stock} kg</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedProduct(product);
                      setOpenDialog(true);
                    }}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleOrder(product)}
                  >
                    Đặt hàng
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedProduct?.name}</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedProduct.description}</Typography>
                <Typography><strong>Giá:</strong> {selectedProduct.price.toLocaleString('vi-VN')} đ/kg</Typography>
                <Typography><strong>Tồn kho:</strong> {selectedProduct.stock} kg</Typography>
                <Typography><strong>Người bán:</strong> {selectedProduct.sellerEmail}</Typography>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>Truy xuất nguồn gốc</Typography>
                  <Typography><strong>Lô:</strong> {selectedProduct.batch.name}</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    <strong>Blockchain Hash:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {selectedProduct.batch.blockchainHash}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    <strong>IPFS CID:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 1 }}>
                    {selectedProduct.batch.ipfsCid}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<QrCode />}
                    href={`https://ipfs.io/ipfs/${selectedProduct.batch.ipfsCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem chứng chỉ
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="Số lượng (kg)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 1, max: selectedProduct.stock }}
                  sx={{ mt: 3 }}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Tổng tiền: {(selectedProduct.price * parseInt(quantity || '1')).toLocaleString('vi-VN')} đ
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={() => {
                if (selectedProduct) handleOrder(selectedProduct);
                setOpenDialog(false);
              }}
            >
              Đặt hàng ngay
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default MarketplacePage;
