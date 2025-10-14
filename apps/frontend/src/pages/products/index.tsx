import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ProductCard from "../../components/products/ProductCard";
import { marketplaceProducts } from "../../lib/mockProducts";

const categories = ["Tất cả", ...new Set(marketplaceProducts.map((item) => item.category))];

const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất cả");

  const filtered = useMemo(() => {
    return marketplaceProducts.filter((product) => {
      const matchesCategory = category === "Tất cả" || product.category === category;
      const term = search.trim().toLowerCase();
      const matchesSearch = term
        ? product.name.toLowerCase().includes(term) || product.sellerName.toLowerCase().includes(term)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <MainLayout>
      <Head>
        <title>Chợ nông sản | AgroChain</title>
      </Head>
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Chợ nông sản AgroChain
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kết nối trực tiếp với hợp tác xã và nông hộ. Mỗi lô hàng đều có truy xuất nguồn gốc và ký quỹ escrow.
          </Typography>
        </Box>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tìm sản phẩm hoặc hợp tác xã"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    label="Danh mục"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
                <Chip color="success" label={`${filtered.length} sản phẩm`} sx={{ fontWeight: 600 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {filtered.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </MainLayout>
  );
};

export default ProductsPage;

