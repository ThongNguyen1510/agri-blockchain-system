import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createOrderOnChain } from "@/lib/blockchain";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { formatWeiToEth } from "@/lib/utils";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: number;
    name: string;
    priceWei: string;
    seller?: { walletAddress?: string | null };
  };
  quantity: number;
  onSuccess: () => void;
}

export function CheckoutModal({ open, onOpenChange, product, quantity, onSuccess }: CheckoutModalProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<"input" | "blockchain" | "backend" | "success">("input");
  const [shippingAddress, setShippingAddress] = useState("");
  const [blockchainOrderId, setBlockchainOrderId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string>("");

  const totalWei = BigInt(product.priceWei) * BigInt(quantity);
  const totalEth = formatWeiToEth(totalWei);

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if (!product.seller?.walletAddress) {
      toast.error("Người bán chưa cập nhật địa chỉ ví");
      return;
    }

    try {
      // Step 1: Create order on blockchain
      setStep("blockchain");
      toast.info("Đang tạo đơn hàng trên blockchain...");

      const { orderId, txHash: hash } = await createOrderOnChain(
        product.seller.walletAddress,
        `PRODUCT-${product.id}`,
        totalWei.toString()
      );

      setBlockchainOrderId(orderId);
      setTxHash(hash);
      toast.success("Đã tạo đơn hàng trên blockchain!");

      // Step 2: Save to backend
      setStep("backend");
      toast.info("Đang lưu thông tin đơn hàng...");

      if (!token) {
        throw new Error("Chưa đăng nhập");
      }

      await apiClient.createOrder(
        {
          productId: product.id,
          quantity,
          shippingAddress: shippingAddress.trim(),
        },
        token
      );

      // Success
      setStep("success");
      toast.success("Đặt hàng thành công!");
      
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        resetModal();
      }, 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
      setStep("input");
    }
  };

  const resetModal = () => {
    setStep("input");
    setShippingAddress("");
    setBlockchainOrderId(null);
    setTxHash("");
  };

  const handleClose = () => {
    if (step !== "blockchain" && step !== "backend") {
      onOpenChange(false);
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh toán đơn hàng</DialogTitle>
          <DialogDescription>
            {step === "input" && "Nhập thông tin giao hàng và xác nhận thanh toán"}
            {step === "blockchain" && "Đang xử lý giao dịch trên blockchain..."}
            {step === "backend" && "Đang lưu thông tin đơn hàng..."}
            {step === "success" && "Đặt hàng thành công!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order summary */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sản phẩm</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số lượng</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-primary">{totalEth} ETH</span>
            </div>
          </div>

          {/* Shipping address input */}
          {step === "input" && (
            <div className="space-y-2">
              <Label htmlFor="shipping">Địa chỉ giao hàng</Label>
              <Input
                id="shipping"
                placeholder="Nhập địa chỉ nhận hàng"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
          )}

          {/* Processing states */}
          {(step === "blockchain" || step === "backend") && (
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {step === "blockchain" && "Chờ xác nhận từ blockchain..."}
                {step === "backend" && "Đang lưu thông tin..."}
              </span>
            </div>
          )}

          {/* Success state */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center font-medium">Đơn hàng đã được tạo thành công!</p>
              {blockchainOrderId && (
                <p className="text-xs text-muted-foreground">
                  Blockchain Order ID: {blockchainOrderId}
                </p>
              )}
              {txHash && (
                <p className="text-xs text-muted-foreground font-mono">
                  TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {step === "input" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Hủy
              </Button>
              <Button onClick={handleCheckout} className="flex-1 gap-2">
                <Wallet className="h-4 w-4" />
                Thanh toán
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
