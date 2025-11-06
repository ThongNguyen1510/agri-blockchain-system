import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Package,
  Save,
  Shield,
  Link2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { anchorBatchHash } from "@/lib/blockchain";

const SellerBatchesNew = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    batchCode: "",
    farmName: "",
    harvestDate: "",
    variety: "",
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateBatchCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const batchCode = `BATCH-${timestamp}-${random}`;
    setFormData(prev => ({
      ...prev,
      batchCode,
    }));
  };

  const validateForm = () => {
    if (!formData.batchCode.trim()) {
      toast.error("Vui lòng nhập mã lô hàng");
      return false;
    }
    if (!formData.farmName.trim()) {
      toast.error("Vui lòng nhập tên nông trại");
      return false;
    }
    if (!formData.variety.trim()) {
      toast.error("Vui lòng nhập giống cây trồng");
      return false;
    }
    if (!formData.harvestDate) {
      toast.error("Vui lòng chọn ngày thu hoạch");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!token) {
      toast.error("Vui lòng đăng nhập để tạo lô hàng");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const batchData = {
        batchCode: formData.batchCode.trim(),
        farmName: formData.farmName.trim(),
        harvestDate: formData.harvestDate,
        variety: formData.variety.trim(),
        notes: formData.notes.trim() || undefined,
      };
      
      // Tạo batch trong database
      const createdBatch = await apiClient.createBatch(batchData, token);
      toast.success("Lô hàng đã được tạo thành công!");
      
      // Tự động anchor lên blockchain
      setIsAnchoring(true);
      try {
        const tx = await anchorBatchHash(createdBatch.id, batchData);
        console.log("Blockchain transaction:", tx.hash);
        toast.success(`Đã ghi hash lên blockchain! TX: ${tx.hash.slice(0, 10)}...`, {
          duration: 5000,
        });
      } catch (blockchainError) {
        console.error("Blockchain error:", blockchainError);
        toast.warning("Lô hàng đã tạo thành công nhưng chưa ghi lên blockchain. Bạn có thể thử lại sau.");
      } finally {
        setIsAnchoring(false);
      }
      
      // Chờ 1s để user đọc thông báo
      setTimeout(() => {
        navigate("/seller/batches");
      }, 1500);
    } catch (error) {
      console.error("Error creating batch:", error);
      
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Redirect to login
        navigate("/login");
      } else {
        const message = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo lô hàng";
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/seller/batches">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Tạo lô hàng mới</h1>
            <p className="text-lg text-muted-foreground">
              Tạo lô hàng nông sản với thông tin chi tiết và chứng từ
            </p>
          </div>

          {/* Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Thông tin cơ bản
                </h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Batch Code */}
                  <div className="space-y-2">
                    <Label htmlFor="batchCode">Mã lô hàng *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="batchCode"
                        placeholder="BATCH-20241201-ABC1"
                        value={formData.batchCode}
                        onChange={(e) => handleInputChange("batchCode", e.target.value)}
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generateBatchCode}
                        className="whitespace-nowrap"
                      >
                        Tạo mã
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mã duy nhất để nhận diện lô hàng
                    </p>
                  </div>

                  {/* Farm Name */}
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Tên nông trại *</Label>
                    <Input
                      id="farmName"
                      placeholder="Nông trại ABC"
                      value={formData.farmName}
                      onChange={(e) => handleInputChange("farmName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Variety */}
                  <div className="space-y-2">
                    <Label htmlFor="variety">Giống cây trồng *</Label>
                    <Input
                      id="variety"
                      placeholder="Gạo ST25, Lúa Japonica, Cà phê Arabica..."
                      value={formData.variety}
                      onChange={(e) => handleInputChange("variety", e.target.value)}
                      required
                    />
                  </div>

                  {/* Harvest Date */}
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Ngày thu hoạch *</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    placeholder="Thông tin bổ sung về lô hàng, quy trình canh tác, điều kiện thời tiết..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Blockchain & Certifications Info */}
              <div className="space-y-4">
                {/* Blockchain Info */}
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-900">Tự động ghi lên Blockchain</h3>
                      <p className="text-sm text-green-700">
                        Sau khi tạo lô hàng, hệ thống sẽ tự động ghi hash của lô hàng lên blockchain để:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1 ml-4">
                        <li>✓ Đảm bảo tính minh bạch và không thể sửa đổi</li>
                        <li>✓ Xác thực nguồn gốc truy xuất</li>
                        <li>✓ Tăng độ tin cậy cho người mua</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Certifications Info */}
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-blue-900">Thêm chứng nhận sau khi tạo lô hàng</h3>
                      <p className="text-sm text-blue-700">
                        Sau khi tạo lô hàng thành công, bạn có thể thêm các chứng nhận và tài liệu như:
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1 ml-4">
                        <li>• Giấy chứng nhận VietGAP, GlobalGAP, Organic</li>
                        <li>• Báo cáo kiểm định chất lượng</li>
                        <li>• Nhật ký quy trình sản xuất</li>
                        <li>• Hình ảnh thu hoạch và đóng gói</li>
                      </ul>
                      <p className="text-sm text-blue-700 font-medium mt-3">
                        👉 Vào trang "Quản lý lô hàng" → Click nút "Thêm chứng nhận"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Link to="/seller/batches" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Hủy
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 gap-2 bg-gradient-hero hover:opacity-90"
                  disabled={isSubmitting || isAnchoring}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang tạo...
                    </>
                  ) : isAnchoring ? (
                    <>
                      <Link2 className="h-4 w-4 animate-pulse" />
                      Đang ghi blockchain...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Tạo lô hàng
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

export default SellerBatchesNew;
