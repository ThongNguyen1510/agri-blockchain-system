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
  Calendar,
  MapPin,
  Hash,
  Filter,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { BatchDto } from "@/types/api";
import { toast } from "sonner";

const SellerBatches = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: batches,
    isLoading,
    error,
  } = useQuery<BatchDto[], Error>({
    queryKey: ["batches", "seller"],
    queryFn: () => apiClient.getBatches(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  // Filter batches for current seller and apply search
  const filteredBatches = batches?.filter((batch) => {
    const isSellerBatch = batch.createdBy === user?.id;
    if (!isSellerBatch) return false;

    const matchesSearch = !searchQuery.trim() || 
      batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.farmName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  }) || [];

  const getStatusBadge = (batch: BatchDto) => {
    if (batch.ipfsCid && batch.hashSha256) {
      return <Badge variant="default">Đã xác thực</Badge>;
    }
    return <Badge variant="secondary">Chưa xác thực</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
              <h1 className="text-4xl font-bold mb-2">Quản lý lô hàng</h1>
              <p className="text-lg text-muted-foreground">
                Quản lý các lô hàng nông sản của bạn
              </p>
            </div>
            <Link to="/seller/batches/new">
              <Button className="gap-2 bg-gradient-hero hover:opacity-90">
                <Plus className="h-4 w-4" />
                Tạo lô hàng mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng lô hàng</p>
                <p className="text-2xl font-bold">{filteredBatches.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đã xác thực</p>
                <p className="text-2xl font-bold">
                  {filteredBatches.filter(b => b.ipfsCid && b.hashSha256).length}
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
                <p className="text-sm font-medium text-muted-foreground">Chưa xác thực</p>
                <p className="text-2xl font-bold">
                  {filteredBatches.filter(b => !b.ipfsCid || !b.hashSha256).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <QrCode className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Có QR Code</p>
                <p className="text-2xl font-bold">
                  {filteredBatches.filter(b => b.ipfsCid).length}
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
              placeholder="Tìm theo mã lô, giống cây hoặc tên nông trại..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Đặt lại
          </Button>
        </div>

        {/* Batches Grid */}
        {filteredBatches.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Chưa có lô hàng</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Không tìm thấy lô hàng phù hợp với từ khóa tìm kiếm"
                : "Bạn chưa tạo lô hàng nào. Hãy bắt đầu tạo lô hàng đầu tiên!"
              }
            </p>
            {!searchQuery && (
              <Link to="/seller/batches/new">
                <Button className="gap-2 bg-gradient-hero hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Tạo lô hàng đầu tiên
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.map((batch) => (
              <Card key={batch.id} className="overflow-hidden transition-all hover:shadow-card-hover">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{batch.batchCode}</h3>
                      {getStatusBadge(batch)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {batch.variety && (
                      <div className="flex items-center gap-3 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Giống:</span>
                        <span className="font-medium">{batch.variety}</span>
                      </div>
                    )}
                    
                    {batch.farmName && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Nông trại:</span>
                        <span className="font-medium">{batch.farmName}</span>
                      </div>
                    )}
                    
                    {batch.harvestDate && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Thu hoạch:</span>
                        <span className="font-medium">{formatDate(batch.harvestDate)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tạo ngày:</span>
                      <span className="font-medium">{formatDate(batch.createdAt)}</span>
                    </div>
                  </div>

                  {batch.notes && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {batch.notes}
                      </p>
                    </div>
                  )}

                  {batch.ipfsCid && (
                    <div className="mb-6 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">QR Code sẵn sàng</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        IPFS: {batch.ipfsCid.slice(0, 20)}...
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {/* Xem chi tiết: dẫn sang trang truy xuất nguồn gốc của lô hàng */}
                    <Link to={`/trace/${batch.batchCode}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    {/* Sửa lô hàng */}
                    <Link to={`/seller/batches/${batch.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Sửa
                      </Button>
                    </Link>
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

export default SellerBatches;
