import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck } from "lucide-react";
import type { ProductDto } from "@/types/api";
import { formatWeiToEth } from "@/lib/utils";

interface ProductCardProps {
  product: ProductDto;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, name, priceWei, stock, coverImageUrl, seller, batch, batchId } = product;

  const image = coverImageUrl ?? "/placeholder.svg";
  const sellerName = seller?.displayName || seller?.email || "Chưa cập nhật";
  const batchCode = batch?.batchCode ?? `#${batchId}`;
  const category = batch?.variety ?? "Khác";
  const location = batch?.farmName ?? "Đang cập nhật vùng trồng";
  const priceEth = formatWeiToEth(priceWei);

  return (
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-card-hover">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Đã xác minh
            </Badge>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">{name}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{priceEth} ETH</p>
              <p className="text-xs text-muted-foreground">Tồn kho: {stock} đơn vị</p>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary">
              {category}
            </Badge>
          </div>

          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground">
              Mã lô: <span className="font-mono text-primary">{batchCode}</span>
            </p>
            <p className="text-xs text-muted-foreground">Nhà bán: {sellerName}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
