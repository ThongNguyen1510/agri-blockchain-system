import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Shield,
  Wallet,
  Calendar,
  Edit,
  ArrowLeft,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

const UserProfile = () => {
  const { token, user: authUser } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.getProfile(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      Admin: { color: "bg-red-100 text-red-800", label: "Quản trị viên" },
      Seller: { color: "bg-green-100 text-green-800", label: "Người bán" },
      Buyer: { color: "bg-blue-100 text-blue-800", label: "Người mua" },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.Buyer;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return "Chưa kết nối";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-80" />
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            </div>
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
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-destructive mb-dh4">Lỗi tải dữ liệu</h2>
              <p className="text-muted-foreground mb-4">{error.message}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const user = profile || authUser;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Thông tin cá nhân</h1>
            <p className="text-lg text-muted-foreground">
              Xem và quản lý thông tin tài khoản của bạn
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-hero flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{user?.email}</h2>
                {user?.role && getRoleBadge(user.role)}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vai trò</p>
                    <p className="font-medium">{user?.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ ví</p>
                    <p className="font-medium font-mono text-sm">
                      {user?.walletAddress ? formatWalletAddress(user.walletAddress) : "Chưa kết nối"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tham gia từ</p>
                    <p className="font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : "Không xác định"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button variant="outline" className="w-full gap-2">
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </Card>

            {/* Activity Summary */}
            <div className="md:col-span-2 space-y-6">
              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-muted-foreground">Sản phẩm</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-muted-foreground">Đơn hàng</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-muted-foreground">Doanh thu</p>
                  </div>
                </div>
              </Card>

              {/* Account Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thao tác tài khoản</h3>
                <div className="space-y-3">
                  {user?.role === "Seller" && (
                    <>
                      <Link to="/seller/dashboard" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Package className="h-4 w-4" />
                          Quản lý sản phẩm
                        </Button>
                      </Link>
                      <Link to="/seller/batches" className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Package className="h-4 w-4" />
                          Quản lý lô hàng
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link to="/orders" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Xem đơn hàng
                    </Button>
                  </Link>
                  
                  <Link to="/products" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Package className="h-4 w-4" />
                      Khám phá sản phẩm
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* System Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin hệ thống</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono">{user?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Hoạt động
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                    <span>{user?.createdAt ? formatDate(user.createdAt) : "Không xác định"}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
