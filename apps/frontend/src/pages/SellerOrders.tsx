import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Package, CheckCircle, XCircle, Loader2, User } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { OrderDto, OrderStatus } from "@/types/api";
import { formatDate, formatWeiToEth } from "@/lib/utils";
import { toast } from "sonner";
import { ethers } from "ethers";

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

const SellerOrders = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading, error } = useQuery<OrderDto[], Error>({
    queryKey: ["orders", "seller"],
    queryFn: () => apiClient.getOrders(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  const releaseOrderMutation = useMutation({
    // Khi Seller xác nhận giao, gửi kèm địa chỉ ví đang kết nối để backend đối chiếu
    mutationFn: async (orderId: number) => {
      if (!(window as any).ethereum) throw new Error("Không tìm thấy ví (MetaMask)");
      await (window as any).ethereum.request?.({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const connected = await signer.getAddress();
      return apiClient.releaseOrder(orderId, token!, connected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "seller"] });
      toast.success("Đã xác nhận giao hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiClient.cancelOrder(orderId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "seller"] });
      toast.success("Đã hủy đơn hàng!");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const statuses = useMemo(() => {
    if (!orders?.length) return [];
    const unique = new Set<string>();
    for (const o of orders) unique.add(normalizeStatus(o.status));
    return Array.from(unique);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const normalised = normalizeStatus(order.status);
      return statusFilter === "all" ? true : normalised === statusFilter;
    });
  }, [orders, statusFilter]);

  const renderTable = () => {
    if (isLoading) {
      return (
        <Card className="overflow-hidden">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
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
          Chưa có đơn hàng nào.
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
              <TableHead>Người mua</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thao tác</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      #{order.buyerId}
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
                    <div className="flex gap-2 justify-end">
                      {normalised === "IN_ESCROW" && (
                        <Button
                          size="sm"
                          onClick={() => releaseOrderMutation.mutate(order.id)}
                          disabled={releaseOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {releaseOrderMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1">Xác nhận giao</span>
                        </Button>
                      )}

                      {(normalised === "IN_ESCROW" || normalised === "PENDING") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelOrderMutation.mutate(order.id)}
                          disabled={cancelOrderMutation.isPending}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          {cancelOrderMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="ml-1">Hủy</span>
                        </Button>
                      )}
                    </div>
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
          <h1 className="mb-4 text-4xl font-bold">Đơn hàng của bạn (Người bán)</h1>
          <p className="text-lg text-muted-foreground">Quản lý các đơn và thực hiện xác nhận giao/hoặc hủy trong trường hợp cần.</p>
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

export default SellerOrders;
