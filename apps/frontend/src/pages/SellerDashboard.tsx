import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { DashboardSummaryDto } from "@/types/api";

const SellerDashboard = () => {
  const { token, user } = useAuth();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardSummaryDto, Error>({
    queryKey: ["dashboard", "seller"],
    queryFn: () => apiClient.getDashboardSummary(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60, // 1 minute
  });

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: dashboardData?.stats.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Sản phẩm đang bán",
    },
    {
      title: "Đơn hàng hoạt động",
      value: dashboardData?.stats.activeEscrows || 0,
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Đang trong escrow",
    },
    {
      title: "Doanh thu (ETH)",
      value: dashboardData?.stats.releasedVolumeEth || "0",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Đã giải phóng",
    },
    {
      title: "Tranh chấp",
      value: dashboardData?.stats.disputes || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Cần xử lý",
    },
  ];

  const quickActions = [
    {
      title: "Tạo sản phẩm mới",
      description: "Thêm sản phẩm vào marketplace",
      icon: Plus,
      href: "/seller/products/new",
      color: "bg-gradient-hero",
    },
    {
      title: "Quản lý sản phẩm",
      description: "Xem và chỉnh sửa sản phẩm",
      icon: Package,
      href: "/seller/products",
      color: "bg-blue-500",
    },
    {
      title: "Quản lý lô hàng",
      description: "Tạo và quản lý batch",
      icon: BarChart3,
      href: "/seller/batches",
      color: "bg-green-500",
    },
    {
      title: "Xem đơn hàng",
      description: "Theo dõi đơn hàng của bạn",
      icon: Eye,
      href: "/seller/orders",
      color: "bg-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
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
          <h1 className="text-4xl font-bold mb-2">Bảng điều khiển Seller</h1>
          <p className="text-lg text-muted-foreground">
            Chào mừng trở lại,{' '}
            <span className="font-semibold text-primary">
              {user?.displayName || user?.email}
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6 transition-all hover:shadow-card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Thao tác nhanh</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="p-6 transition-all hover:shadow-card-hover hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Đơn hàng gần đây</h2>
            <Card className="p-6">
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <h4 className="font-semibold">{order.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.totalEth} ETH</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "RELEASED" 
                          ? "bg-green-100 text-green-800" 
                          : order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Sales Chart */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Biểu đồ doanh thu</h2>
          <Card className="p-6">
            {dashboardData && dashboardData.sales && dashboardData.sales.length > 0 ? (
              <div className="h-64 flex items-end gap-4">
                {(() => {
                  const max = Math.max(...dashboardData.sales.map((p) => p.value), 1);
                  return dashboardData.sales.map((point) => (
                    <div key={point.label} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div className="w-full rounded-t-md bg-emerald-500/80" style={{ height: `${(point.value / max) * 100}%` }} />
                      <div className="text-xs text-muted-foreground text-center">
                        <div className="font-semibold">{point.value.toFixed(2)}</div>
                        <div>{point.label}</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu doanh thu để hiển thị</p>
                  <p className="text-sm">Hệ thống sẽ cập nhật khi có đơn hàng được giải phóng</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
