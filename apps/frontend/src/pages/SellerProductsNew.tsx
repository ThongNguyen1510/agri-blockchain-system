import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { BatchDto } from "@/types/api";

const SellerProductsNew = () => {
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

  // Get available batches for the current seller
  const {
    data: batches,
    isLoading: batchesLoading,
    error: batchesError,
  } = useQuery<BatchDto[], Error>({
    queryKey: ["batches", "seller"],
    queryFn: () => apiClient.getBatches(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  // Filter batches for current seller
  const sellerBatches = batches?.filter(batch => batch.createdBy === user?.id) || [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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

  const handlePriceChange = (value: string) => {
    // Convert ETH to Wei (multiply by 1e18)
    const ethValue = parseFloat(value);
    if (!isNaN(ethValue)) {
      const weiValue = Math.floor(ethValue * 1e18).toString();
      setFormData(prev => ({
        ...prev,
        priceWei: weiValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        priceWei: "",
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return false;
    }
    if (!formData.priceWei || parseFloat(formData.priceWei) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) <= 0) {
      toast.error("Vui lòng nhập số lượng tồn kho hợp lệ");
      return false;
    }
    if (!formData.batchId) {
      toast.error("Vui lòng chọn lô hàng");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!token) {
      toast.error("Vui lòng đăng nhập để tạo sản phẩm");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        priceWei: formData.priceWei,
        stock: parseInt(formData.stock),
        batchId: parseInt(formData.batchId),
        coverImageUrl: formData.coverImageUrl.trim() || undefined,
      };
      
      await apiClient.createProduct(productData, token);
      
      toast.success("Sản phẩm đã được tạo thành công!");
      navigate("/seller/products");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo sản phẩm";
      toast.error(message);
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (batchesLoading) {
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

  if (batchesError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi tải dữ liệu</h2>
            <p className="text-muted-foreground mb-4">{batchesError.message}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (sellerBatches.length === 0) {
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
              <h1 className="text-4xl font-bold mb-2">Tạo sản phẩm mới</h1>
              <p className="text-lg text-muted-foreground">
                Tạo sản phẩm mới để bán trên marketplace
              </p>
            </div>

            <Card className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-4">Chưa có lô hàng</h2>
              <p className="text-muted-foreground mb-6">
                Bạn cần tạo lô hàng trước khi có thể tạo sản phẩm. 
                Lô hàng chứa thông tin về nông sản như ngày thu hoạch, nông trại, giống cây trồng.
              </p>
              <Link to="/seller/batches">
                <Button className="gap-2 bg-gradient-hero hover:opacity-90">
                  <Package className="h-4 w-4" />
                  Tạo lô hàng đầu tiên
                </Button>
              </Link>
            </Card>
          </div>
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
          {/* Header */}
          <div className="mb-8">
            <Link to="/seller/products">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Tạo sản phẩm mới</h1>
            <p className="text-lg text-muted-foreground">
              Tạo sản phẩm mới để bán trên marketplace
            </p>
          </div>

          {/* Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Gạo ST25 cao cấp"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả sản phẩm</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Batch Selection */}
              <div className="space-y-2">
                <Label htmlFor="batchId">Lô hàng *</Label>
                <Select value={formData.batchId} onValueChange={(value) => handleInputChange("batchId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lô hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellerBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{batch.batchCode}</span>
                          <span className="text-sm text-muted-foreground">
                            {batch.variety} - {batch.farmName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price and Stock */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (ETH) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.001"
                    onChange={(e) => handlePriceChange(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Giá tính bằng ETH, tối thiểu 0.0001 ETH
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng tồn kho *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Số lượng sản phẩm có sẵn để bán
                  </p>
                </div>
              </div>

              {/* Cover Image */}
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
                <Input
                  id="coverImageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImageUrl}
                  onChange={(e) => handleInputChange("coverImageUrl", e.target.value)}
                />
                {isUploading && <p className="text-xs text-muted-foreground">Đang tải ảnh...</p>}
              </div>

              {/* Preview */}
              {formData.name && (
                <div className="space-y-2">
                  <Label>Xem trước sản phẩm</Label>
                  <Card className="p-4 border-dashed">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{formData.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.description || "Không có mô tả"}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm font-medium">
                            {formData.priceWei ? `${(parseFloat(formData.priceWei) / 1e18).toFixed(4)} ETH` : "Chưa có giá"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formData.stock || "0"} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Link to="/seller/products" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Hủy
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 gap-2 bg-gradient-hero hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Tạo sản phẩm
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

export default SellerProductsNew;
