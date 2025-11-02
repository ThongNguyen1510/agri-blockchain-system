import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle, Lock } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { BatchDto } from "@/types/api";

const SellerBatchesEdit = () => {
  const { id } = useParams();
  const batchId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    farmName: "",
    harvestDate: "",
    variety: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: batch, isLoading, error } = useQuery<BatchDto, Error>({
    queryKey: ["batch", batchId],
    queryFn: () => apiClient.getBatch(batchId, token!),
    enabled: Boolean(token && batchId),
    staleTime: 1000 * 30,
  });

  // Kiểm tra xem có thể sửa thông tin cốt lõi không
  const isLocked = Boolean(batch?.ipfsCid || batch?.hashSha256);
  const canEditCoreInfo = !isLocked;

  useEffect(() => {
    if (batch) {
      setFormData({
        farmName: batch.farmName || "",
        harvestDate: batch.harvestDate ? batch.harvestDate.split("T")[0] : "",
        variety: batch.variety || "",
        notes: batch.notes || "",
      });
    }
  }, [batch]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Vui lòng đăng nhập để cập nhật lô hàng");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (formData.farmName.trim()) payload.farmName = formData.farmName.trim();
      if (formData.harvestDate) payload.harvestDate = formData.harvestDate;
      if (formData.variety.trim()) payload.variety = formData.variety.trim();
      if (formData.notes.trim()) payload.notes = formData.notes.trim();

      await apiClient.updateBatch(batchId, payload, token);
      toast.success("Đã cập nhật lô hàng");
      navigate("/seller/batches");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-96" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi tải dữ liệu</h2>
            <p className="text-muted-foreground mb-4">{error?.message || "Không tìm thấy lô hàng"}</p>
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/seller/batches">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Chỉnh sửa lô hàng</h1>
            <p className="text-muted-foreground">Mã lô: {batch.batchCode}</p>
          </div>

          {!canEditCoreInfo && (
            <Alert className="mb-6">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Lô đã được xác thực trên blockchain hoặc có đơn hàng liên quan. Chỉ có thể cập nhật ghi chú.
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="farmName">Tên nông trại</Label>
                <Input
                  id="farmName"
                  value={formData.farmName}
                  onChange={(e) => handleInputChange("farmName", e.target.value)}
                  disabled={!canEditCoreInfo}
                  placeholder="VD: Nông trại Xanh"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Ngày thu hoạch</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                  disabled={!canEditCoreInfo}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Giống/Loại sản phẩm</Label>
                <Input
                  id="variety"
                  value={formData.variety}
                  onChange={(e) => handleInputChange("variety", e.target.value)}
                  disabled={!canEditCoreInfo}
                  placeholder="VD: Rau xà lách hữu cơ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  placeholder="Thông tin bổ sung về lô hàng..."
                />
              </div>

              {batch.ipfsCid && (
                <div className="space-y-2">
                  <Label>IPFS CID</Label>
                  <Input value={batch.ipfsCid} disabled className="font-mono text-xs" />
                </div>
              )}

              {batch.hashSha256 && (
                <div className="space-y-2">
                  <Label>SHA-256 Hash</Label>
                  <Input value={batch.hashSha256} disabled className="font-mono text-xs" />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Link to="/seller/batches" className="flex-1">
                  <Button variant="outline" className="w-full">Hủy</Button>
                </Link>
                <Button type="submit" className="flex-1 gap-2 bg-gradient-hero hover:opacity-90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerBatchesEdit;
