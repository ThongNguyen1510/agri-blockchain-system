import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { ProductDto } from "@/types/api";

const SellerProducts = () => {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<ProductDto[], Error>({
    queryKey: ["products", "seller"],
    queryFn: () => apiClient.getProducts(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  // Filter products for current seller and apply search/filter
  const filteredProducts = products?.filter((product) => {
    const isSellerProduct = product.sellerId === user?.id;
    if (!isSellerProduct) return false;

    const matchesSearch = !searchQuery.trim() || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.batch?.batchCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.stock > 0) ||
      (statusFilter === "soldout" && product.stock === 0);

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (product: ProductDto) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (product.stock < 10) {
      return <Badge variant="secondary">Sắp hết</Badge>;
    }
    return <Badge variant="default">Đang bán</Badge>;
  };

  const formatPrice = (priceWei: string) => {
    const price = parseFloat(priceWei) / 1e18;
    return `${price.toFixed(4)} ETH`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="mb-6 flex gap-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi tải dữ liệu</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/seller/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Quản lý sản phẩm</h1>
              <p className="text-lg text-muted-foreground">
                Quản lý sản phẩm của bạn trên marketplace
              </p>
            </div>
            <Link to="/seller/products/new">
              <Button className="gap-2 bg-gradient-hero hover:opacity-90">
                <Plus className="h-4 w-4" />
                Tạo sản phẩm mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang bán</p>
                <p className="text-2xl font-bold">
                  {filteredProducts.filter(p => p.stock > 0).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hết hàng</p>
                <p className="text-2xl font-bold">
                  {filteredProducts.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên sản phẩm hoặc mã lô..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="soldout">Hết hàng</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Đặt lại
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Không tìm thấy sản phẩm phù hợp với bộ lọc"
                : "Bạn chưa tạo sản phẩm nào. Hãy bắt đầu tạo sản phẩm đầu tiên!"
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link to="/seller/products/new">
                <Button className="gap-2 bg-gradient-hero hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Tạo sản phẩm đầu tiên
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-all hover:shadow-card-hover">
                {product.coverImageUrl ? (
                  <img
                    src={product.coverImageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                    {getStatusBadge(product)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description || "Không có mô tả"}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giá:</span>
                      <span className="font-semibold">{formatPrice(product.priceWei)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tồn kho:</span>
                      <span className="font-semibold">{product.stock} sản phẩm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mã lô:</span>
                      <span className="font-mono text-xs">{product.batch?.batchCode || "N/A"}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/product/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        Xem
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerProducts;
