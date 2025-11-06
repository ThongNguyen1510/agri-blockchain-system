import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ReviewSection } from "@/components/ReviewSection";
import { CertificationsList } from "@/components/CertificationsList";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatWeiToEth } from "@/lib/utils";
import { toast } from "sonner";
import { ShieldCheck, MapPin, Package, Calendar, Minus, Plus, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const productId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient.getProduct(productId, token!),
    enabled: Boolean(token) && Number.isFinite(productId),
    staleTime: 1000 * 30,
  });

  const handleCheckoutSuccess = () => {
    setQuantity(1);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const totalEth = useMemo(() => {
    if (!product) {
      return "0";
    }
    try {
      const wei = BigInt(product.priceWei) * BigInt(quantity);
      return formatWeiToEth(wei);
    } catch {
      return "0";
    }
  }, [product, quantity]);

  const handleQuantityChange = (next: number) => {
    if (!product) return;
    const safeValue = Math.min(Math.max(next, 1), Math.max(product.stock, 1));
    setQuantity(safeValue);
  };

  const handleOrder = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    if (quantity > product.stock) {
      toast.error("Số lượng vượt quá tồn kho");
      return;
    }
    setCheckoutOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-10 text-center text-muted-foreground">
          Đang tải thông tin sản phẩm...
        </div>
      );
    }

    if (error) {
      const message = error instanceof Error ? error.message : "Không thể tải sản phẩm";
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-10 text-center text-destructive">
          {message}
        </div>
      );
    }

    if (!product || Number.isNaN(productId)) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-10 text-center text-muted-foreground">
          Không tìm thấy sản phẩm.
        </div>
      );
    }

    const image = product.coverImageUrl ?? "/placeholder.svg";
    const sellerName = product.seller?.email ?? "Chưa cập nhật người bán";
    const sellerWallet = product.seller?.walletAddress ?? "Chưa có ví";
    const batchCode = product.batch?.batchCode ?? `#${product.batchId}`;
    const variety = product.batch?.variety ?? "Khác";
    const farmName = product.batch?.farmName ?? "Đang cập nhật vùng trồng";
    const harvestDate = formatDate(product.batch?.harvestDate);
    const ipfsCid = product.batch?.ipfsCid ?? "Chưa cập nhật";
    const hash = product.batch?.hashSha256 ?? "Chưa cập nhật";

    return (
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={image}
              alt={product.name}
              className="aspect-square w-full object-cover"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="absolute right-4 top-4">
              <Badge className="gap-1 bg-primary">
                <ShieldCheck className="h-3 w-3" />
                Đã xác minh
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <Badge variant="outline" className="border-primary/20 text-primary">
                {variety}
              </Badge>
            </div>
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {farmName}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{sellerName}</p>
            <p className="font-mono text-xs text-muted-foreground">{sellerWallet}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-primary">{formatWeiToEth(product.priceWei)}</span>
            <span className="text-2xl text-muted-foreground">ETH</span>
            <span className="text-sm text-muted-foreground">/ đơn vị</span>
          </div>

          <Card className="space-y-3 bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                Mã lô hàng
              </span>
              <span className="font-mono font-semibold">{batchCode}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Ngày thu hoạch
              </span>
              <span className="font-semibold">{harvestDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tồn kho</span>
              <span className="font-semibold">{product.stock} đơn vị</span>
            </div>
          </Card>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng</label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity - 1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(event) => handleQuantityChange(Number(event.target.value))}
                className="w-24 text-center"
                min={1}
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            className="flex w-full items-center justify-center gap-2 bg-gradient-hero hover:opacity-90"
            onClick={handleOrder}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-5 w-5" />
            {`Mua ngay - ${totalEth} ETH`}
          </Button>

          <Link to={`/trace/${batchCode}`}>
            <Button variant="outline" size="lg" className="w-full gap-2">
              <ShieldCheck className="h-5 w-5" />
              Xem truy xuất
            </Button>
          </Link>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Xác thực lô hàng</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">IPFS CID: </span>
                <span className="break-all font-mono">{ipfsCid}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">SHA-256 hash: </span>
                <span className="break-all font-mono">{hash}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          {" / "}
          <Link to="/products" className="hover:text-primary">
            Chợ nông sản
          </Link>
          {" / "}
          <span className="text-foreground">{product?.name ?? "Đang tải"}</span>
        </div>

        {renderContent()}

        {product && (
          <div className="mt-12 space-y-12">
            {/* Phần chứng nhận */}
            <CertificationsList productId={product.id} />
            
            {/* Phần đánh giá */}
            <ReviewSection productId={product.id} />
          </div>
        )}
      </div>

      <Footer />

      {product && (
        <CheckoutModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          product={product}
          quantity={quantity}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default ProductDetail;
