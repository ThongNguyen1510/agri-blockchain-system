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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle, Package } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { BatchDto, ProductDto } from "@/types/api";

const SellerProductsEdit = () => {
  const { id } = useParams();
  const productId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceWei: "",
    stock: "",
    batchId: "",
    coverImageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: product, isLoading: productLoading, error: productError } = useQuery<ProductDto, Error>({
    queryKey: ["product", productId],
    queryFn: () => apiClient.getProduct(productId, token!),
    enabled: Boolean(token && productId),
    staleTime: 1000 * 30,
  });

  const { data: batches, isLoading: batchesLoading, error: batchesError } = useQuery<BatchDto[], Error>({
    queryKey: ["batches", "seller"],
    queryFn: () => apiClient.getBatches(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  const sellerBatches = (batches || []).filter((b) => b.createdBy === user?.id);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        priceWei: product.priceWei || "",
        stock: String(product.stock ?? ""),
        batchId: String(product.batchId ?? ""),
        coverImageUrl: product.coverImageUrl || "",
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (value: string) => {
    const ethValue = parseFloat(value);
    if (!isNaN(ethValue)) {
      const weiValue = Math.floor(ethValue * 1e18).toString();
      setFormData((prev) => ({ ...prev, priceWei: weiValue }));
    }
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    if (!token) {
      toast.error("Vui lòng đăng nhập để tải ảnh");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh");
      return;
    }
    try {
      setIsUploading(true);
      const { url } = await apiClient.uploadImage(file, token);
      setFormData(prev => ({ ...prev, coverImageUrl: url }));
      toast.success("Đã tải ảnh lên");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Tải ảnh thất bại";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Vui lòng đăng nhập để cập nhật sản phẩm");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (formData.name.trim()) payload.name = formData.name.trim();
      if (formData.description.trim()) payload.description = formData.description.trim();
      if (formData.priceWei) payload.priceWei = String(formData.priceWei);
      if (formData.stock) payload.stock = parseInt(formData.stock);
      if (formData.batchId) payload.batchId = parseInt(formData.batchId);
      if (formData.coverImageUrl.trim()) payload.coverImageUrl = formData.coverImageUrl.trim();

      await apiClient.updateProduct(productId, payload, token);
      toast.success("Đã cập nhật sản phẩm");
      navigate("/seller/products");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productLoading || batchesLoading) {
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

  if (productError || batchesError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi tải dữ liệu</h2>
            <p className="text-muted-foreground mb-4">{productError?.message || batchesError?.message || "Không tìm thấy sản phẩm"}</p>
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
            <Link to="/seller/products">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Chỉnh sửa sản phẩm</h1>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (ETH)</Label>
                  <Input id="price" type="number" step="0.0001" min="0" placeholder="0.001" onChange={(e) => handlePriceChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input id="stock" type="number" min="0" value={formData.stock} onChange={(e) => handleInputChange("stock", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchId">Lô hàng</Label>
                <Select value={formData.batchId} onValueChange={(v) => handleInputChange("batchId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lô hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellerBatches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Package className="h-4 w-4" /></div>
                          <div className="flex flex-col">
                            <span className="font-medium">{b.batchCode}</span>
                            <span className="text-xs text-muted-foreground">{b.variety} - {b.farmName}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh bìa</Label>
                {formData.coverImageUrl && (
                  <div className="mb-2">
                    <img src={formData.coverImageUrl} alt="preview" className="h-32 w-32 object-cover rounded" />
                  </div>
                )}
                <div className="flex gap-3 items-center">
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0])} />
                  <span className="text-sm text-muted-foreground">hoặc nhập URL</span>
                </div>
                <Input id="coverImageUrl" type="url" value={formData.coverImageUrl} onChange={(e) => handleInputChange("coverImageUrl", e.target.value)} />
                {isUploading && <p className="text-xs text-muted-foreground">Đang tải ảnh...</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <Link to="/seller/products" className="flex-1">
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

export default SellerProductsEdit;
