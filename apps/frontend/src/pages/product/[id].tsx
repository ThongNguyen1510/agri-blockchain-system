import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import BuyButton from "../../components/products/BuyButton";
import { getProductById } from "../../lib/mockProducts";

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const product = useMemo(() => (typeof id === "string" ? getProductById(id) : undefined), [id]);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <MainLayout>
        <Box sx={{ px: 3, py: 6 }}>
          <Typography variant="h5">Không tìm thấy sản phẩm.</Typography>
          <Button component={Link} href="/products" sx={{ mt: 2 }}>
            Quay lại danh sách
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>{product.name} | AgroChain</title>
      </Head>
      <Stack spacing={4} sx={{ px: 3, py: 2 }}>
        <Breadcrumbs separator="/" aria-label="breadcrumb">
          <Link href="/products">Sản phẩm</Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(46,125,50,0.12)",
                height: 360,
                backgroundImage: url(),
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={product.category} color="success" variant="outlined" />
                <Chip label={Batch: } variant="outlined" />
              </Stack>
              <Typography variant="h4" fontWeight={700}>
                {product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {product.description}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={700} color="success.main">
                  {product.priceEth.toFixed(2)} ETH / đơn vị
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tồn kho: {product.stock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngày thu hoạch: {new Date(product.harvestDate).toLocaleDateString("vi-VN")}
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="Số lượng"
                  type="number"
                  inputProps={{ min: 1, max: product.stock }}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                  sx={{ maxWidth: 160 }}
                />
                <BuyButton
                  productId={product.id}
                  sellerAddress={product.sellerAddress}
                  priceEth={product.priceEth}
                  quantity={quantity}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Điểm nổi bật
            </Typography>
            <Stack spacing={1.5}>
              {product.highlights.map((item) => (
                <Stack key={item} direction="row" spacing={1} alignItems="center">
                  <Chip label="•" color="success" size="small" sx={{ minWidth: 24 }} />
                  <Typography variant="body2">{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
};

export default ProductDetailPage;
