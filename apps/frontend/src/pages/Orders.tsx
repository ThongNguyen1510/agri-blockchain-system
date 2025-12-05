import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Package, CheckCircle, XCircle, Loader2, Save, Wallet } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { OrderDto, OrderStatus } from "@/types/api";
import { formatDate, formatWeiToEth } from "@/lib/utils";
import { toast } from "sonner";
import addressJson from "@/contracts/agro-escrow.address.json";
import abiJson from "@/contracts/agro-escrow.abi.json";
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

const Orders = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [editQty, setEditQty] = useState<Record<number, string>>({});
  const [payingId, setPayingId] = useState<number | null>(null);

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

  // Gọi MetaMask để thanh toán ký quỹ vào contract AgroEscrow (best effort),
  // nếu blockchain lỗi vẫn đánh dấu ký quỹ off-chain để demo / sử dụng được.
  const payEscrow = async (order: OrderDto) => {
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    // Fallback ví đang dùng từ hồ sơ user (backend sẽ kiểm tra trùng ví này)
    let connectedWallet: string | null = (user as any)?.walletAddress ?? null;

    try {
      setPayingId(order.id);

      try {
        if (!window.ethereum) {
          throw new Error("Không tìm thấy ví (MetaMask)");
        }

        // Yêu cầu MetaMask cấp quyền
        await window.ethereum.request?.({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(addressJson.address, abiJson as any, signer);
        // productId trên chain dạng bytes32: ta encode từ productId số nguyên
        const productIdBytes = ethers.encodeBytes32String(String(order.productId));
        // Dùng ví của người bán từ backend để escrow chuyển tiền đúng đối tượng
        const sellerAddr = order.sellerWalletAddress ?? (await signer.getAddress());
        const tx = await contract.createOrder(sellerAddr, productIdBytes, {
          value: order.totalWei,
        });
        await tx.wait();

        connectedWallet = await signer.getAddress();
        toast.success("Đã thanh toán ký quỹ trên blockchain");
      } catch (chainError: any) {
        console.error("Blockchain escrow error (tiếp tục đánh dấu off-chain):", chainError);
        toast.warning("Không thể thanh toán ký quỹ trên blockchain. Đơn sẽ được đánh dấu ký quỹ trong hệ thống.");
      }

      if (!connectedWallet) {
        toast.error("Không xác định được địa chỉ ví của bạn để đánh dấu ký quỹ");
        return;
      }

      // Gọi API để đổi trạng thái PENDING -> IN_ESCROW, luôn chạy dù on-chain có thành công hay không
      await apiClient.holdOrder(order.id, token!, connectedWallet);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã đánh dấu ký quỹ thành công trong hệ thống");
    } catch (e: any) {
      console.error("Escrow payment error:", e);
      toast.error(e?.message ?? "Thanh toán ký quỹ thất bại");
    } finally {
      setPayingId(null);
    }
  };

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      apiClient.updateOrder(id, { quantity }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã cập nhật số lượng");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const releaseOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiClient.releaseOrder(orderId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã xác nhận giao hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiClient.cancelOrder(orderId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã hủy đơn hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
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
              {(user?.role === "Seller" || user?.role === "Buyer") && <TableHead>Thao tác</TableHead>}
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
                  <TableCell className="text-right">
                    {user?.role === "Buyer" && normalizeStatus(order.status) === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="w-24 h-8"
                          value={editQty[order.id] ?? String(order.quantity)}
                          onChange={(e) => setEditQty((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        />
                      </div>
                    ) : (
                      order.quantity
                    )}
                  </TableCell>
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
                  {(user?.role === "Seller" || user?.role === "Buyer") && (
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {user?.role === "Seller" && normalised === "IN_ESCROW" && (
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
                            <span className="ml-1">Xác nhận</span>
                          </Button>
                        )}

                        {user?.role === "Buyer" && normalised === "PENDING" && (
                          <>
                            {/* Nút thanh toán ký quỹ: gọi MetaMask + contract, rồi cập nhật trạng thái */}
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => payEscrow(order)}
                              disabled={payingId === order.id}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              {payingId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wallet className="h-4 w-4" />
                              )}
                              <span className="ml-1">Thanh toán ký quỹ</span>
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                const val = parseInt(editQty[order.id] ?? String(order.quantity));
                                if (!Number.isFinite(val) || val < 1) {
                                  toast.error("Số lượng không hợp lệ");
                                  return;
                                }
                                updateOrderMutation.mutate({ id: order.id, quantity: val });
                              }}
                              disabled={updateOrderMutation.isPending}
                              className="bg-primary hover:bg-primary/90"
                            >
                              {updateOrderMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className="ml-1">Lưu</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const confirmed = window.confirm("Bạn muốn hủy (xóa) đơn hàng này?");
                                if (!confirmed) return;
                                cancelOrderMutation.mutate(order.id);
                              }}
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
                          </>
                        )}

                        {user?.role === "Seller" && (normalised === "IN_ESCROW" || normalised === "PENDING") && (
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
                  )}
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
