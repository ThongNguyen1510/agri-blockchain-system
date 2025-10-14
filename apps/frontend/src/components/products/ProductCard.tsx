import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import type { MarketplaceProduct } from "../../lib/mockProducts";

interface ProductCardProps {
  product: MarketplaceProduct;
}

const ProductCard = ({ product }: ProductCardProps) => (
  <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid rgba(46,125,50,0.1)" }}>
    <CardActionArea component={Link} href={`/product/${product.id}`} sx={{ height: "100%" }}>
      <CardMedia
        component="div"
        sx={{
          height: 180,
          backgroundImage: `url(${product.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Chip label={product.category} size="small" color="success" variant="outlined" />
          <Rating value={product.rating} precision={0.1} readOnly size="small" />
        </Stack>
        <Typography variant="h6" fontWeight={700}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description.substring(0, 80)}...
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700} color="success.main">
            {product.priceEth.toFixed(2)} ETH
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tồn kho: {product.stock}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>
            {product.sellerName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {product.sellerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {product.sellerAddress.slice(0, 6)}…{product.sellerAddress.slice(-4)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default ProductCard;
