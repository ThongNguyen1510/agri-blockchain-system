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
  Upload,
  Calendar,
  MapPin,
  Hash,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

const SellerBatchesNew = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    batchCode: "",
    farmName: "",
    harvestDate: "",
    variety: "",
    notes: "",
    ipfsCid: "",
    hashSha256: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const simulateFileUpload = async () => {
    setIsUploading(true);
    try {
      // Simulate file upload to IPFS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock IPFS CID and hash
      const mockCid = `Qm${Math.random().toString(36).substring(2, 46)}`;
      const mockHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      setFormData(prev => ({
        ...prev,
        ipfsCid: mockCid,
        hashSha256: mockHash,
      }));
      
      toast.success("Tài liệu đã được upload lên IPFS thành công!");
    } catch (error) {
      toast.error("Có lỗi khi upload tài liệu");
    } finally {
      setIsUploading(false);
    }
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
        ipfsCid: formData.ipfsCid.trim() || undefined,
        hashSha256: formData.hashSha256.trim() || undefined,
      };
      
      console.log("Creating batch with data:", batchData);
      console.log("Using token:", token ? "Token exists" : "No token");
      
      await apiClient.createBatch(batchData, token);
      
      toast.success("Lô hàng đã được tạo thành công!");
      navigate("/seller/batches");
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

              {/* Documentation & Blockchain */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Chứng từ và Blockchain
                </h2>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload chứng từ</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload các tài liệu chứng minh nguồn gốc như: giấy chứng nhận hữu cơ, 
                      báo cáo phân tích chất lượng, hình ảnh quy trình sản xuất...
                    </p>
                    <Button 
                      type="button" 
                      onClick={simulateFileUpload}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Chọn tài liệu
                        </>
                      )}
                    </Button>
                  </div>

                  {/* IPFS Status */}
                  {formData.ipfsCid && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Đã upload thành công</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">IPFS CID:</span>
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">
                            {formData.ipfsCid}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">Hash:</span>
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">
                            {formData.hashSha256.slice(0, 20)}...
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {(formData.batchCode || formData.farmName || formData.variety) && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    Xem trước lô hàng
                  </h2>
                  <Card className="p-6 border-dashed">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Mã lô:</span>
                          <span className="font-semibold">{formData.batchCode || "Chưa có"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Nông trại:</span>
                          <span className="font-semibold">{formData.farmName || "Chưa có"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Giống:</span>
                          <span className="font-semibold">{formData.variety || "Chưa có"}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Thu hoạch:</span>
                          <span className="font-semibold">
                            {formData.harvestDate 
                              ? new Date(formData.harvestDate).toLocaleDateString("vi-VN")
                              : "Chưa chọn"
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Chứng từ:</span>
                          <span className={`font-semibold ${formData.ipfsCid ? 'text-green-600' : 'text-orange-600'}`}>
                            {formData.ipfsCid ? "Đã upload" : "Chưa upload"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

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
