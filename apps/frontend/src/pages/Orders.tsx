import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Package } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { OrderDto, OrderStatus } from "@/types/api";
import { formatDate, formatWeiToEth } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  HELD: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  IN_ESCROW: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  RELEASED: "bg-green-500/10 text-green-600 border-green-500/20",
  REFUNDED: "bg-red-500/10 text-red-600 border-red-500/20",
  PENDING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DISPUTED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  HELD: "Đang ký quỹ",
  IN_ESCROW: "Đang ký quỹ",
  RELEASED: "Đã giải ngân",
  REFUNDED: "Đã hoàn tiền",
  PENDING: "Chờ xử lý",
  DISPUTED: "Đang tranh chấp",
};

const normalizeStatus = (status: OrderStatus): string => status.toString().toUpperCase();

const Orders = () => {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<OrderDto[], Error>({
    queryKey: ["orders"],
    queryFn: () => apiClient.getOrders(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  const statuses = useMemo(() => {
    if (!orders?.length) {
      return [];
    }
    const unique = new Set<string>();
    for (const order of orders) {
      unique.add(normalizeStatus(order.status));
    }
    return Array.from(unique);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) {
      return [];
    }

    return orders.filter((order) => {
      const normalised = normalizeStatus(order.status);
      if (statusFilter === "all") {
        return true;
      }
      return normalised === statusFilter;
    });
  }, [orders, statusFilter]);

  const renderTable = () => {
    if (isLoading) {
      return (
        <Card className="overflow-hidden">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </Card>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          Không thể tải danh sách đơn hàng: {error.message}
        </div>
      );
    }

    if (!filteredOrders.length) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-10 text-center text-muted-foreground">
          Không có đơn hàng nào phù hợp với bộ lọc hiện tại.
        </div>
      );
    }

    return (
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Mã sản phẩm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const normalised = normalizeStatus(order.status);
              const statusLabel = STATUS_LABELS[normalised] ?? order.status;
              const badgeStyle = STATUS_STYLES[normalised] ?? "bg-muted";
              const productName = order.product?.name ?? `Sản phẩm #${order.productId}`;
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {productName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatWeiToEth(order.totalWei)} ETH
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={badgeStyle}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      to={`/product/${order.productId}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      #{order.productId}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">Đơn hàng của bạn</h1>
          <p className="text-lg text-muted-foreground">Theo dõi trạng thái ký quỹ và lịch sử giải ngân của từng giao dịch.</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status] ?? status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderTable()}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
