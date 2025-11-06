import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface AddCertificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: number;
  batchCode: string;
}

/**
 * Modal để thêm chứng nhận cho batch
 */
export function AddCertificationModal({
  open,
  onOpenChange,
  batchId,
  batchCode,
}: AddCertificationModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    type: "Quality",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

  // Mutation tạo chứng nhận
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Chưa đăng nhập");
      if (!uploadedFileUrl) throw new Error("Vui lòng upload file chứng nhận");

      return apiClient.createCertification(
        {
          batchId,
          name: formData.name,
          type: formData.type,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate || undefined,
          fileUrl: uploadedFileUrl,
          description: formData.description || undefined,
        },
        token
      );
    },
    onSuccess: () => {
      toast.success("Đã thêm chứng nhận thành công!");
      queryClient.invalidateQueries({ queryKey: ["certifications", batchId] });
      handleClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    },
  });

  /**
   * Xử lý chọn file
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB");
      return;
    }

    // Kiểm tra loại file
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file PDF hoặc ảnh (JPG, PNG)");
      return;
    }

    setSelectedFile(file);
    toast.success(`Đã chọn file: ${file.name}`);
  };

  /**
   * Upload file chứng nhận
   */
  const handleFileUpload = async () => {
    if (!selectedFile || !token) {
      toast.error("Vui lòng chọn file");
      return;
    }

    setIsUploading(true);
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", selectedFile);

      const response = await apiClient.uploadBatchDocument(formDataToUpload, token);
      setUploadedFileUrl(response.fileUrl);
      toast.success("Upload file thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi khi upload file");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Đóng modal và reset form
   */
  const handleClose = () => {
    setFormData({
      name: "",
      type: "Quality",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      description: "",
    });
    setSelectedFile(null);
    setUploadedFileUrl("");
    onOpenChange(false);
  };

  /**
   * Submit form
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên chứng nhận");
      return;
    }
    if (!formData.issuer.trim()) {
      toast.error("Vui lòng nhập tổ chức cấp");
      return;
    }
    if (!formData.issueDate) {
      toast.error("Vui lòng chọn ngày cấp");
      return;
    }
    if (!uploadedFileUrl) {
      toast.error("Vui lòng upload file chứng nhận");
      return;
    }

    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm chứng nhận</DialogTitle>
          <DialogDescription>
            Thêm chứng nhận cho lô hàng <strong>{batchCode}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload file */}
          <div className="space-y-3">
            <Label>File chứng nhận *</Label>
            <div className="rounded-lg border-2 border-dashed p-6 text-center">
              <input
                type="file"
                id="certFileInput"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("certFileInput")?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Chọn file
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadedFileUrl("");
                        const input = document.getElementById("certFileInput") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                    >
                      Chọn lại
                    </Button>
                    {!uploadedFileUrl && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang upload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {uploadedFileUrl && (
                    <p className="text-sm text-green-600 font-medium">✓ Đã upload thành công</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tên chứng nhận */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên chứng nhận *</Label>
            <Input
              id="name"
              placeholder="VD: Chứng nhận VietGAP"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Loại chứng nhận */}
          <div className="space-y-2">
            <Label htmlFor="type">Loại chứng nhận *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organic">Hữu cơ (Organic)</SelectItem>
                <SelectItem value="Quality">Chất lượng (Quality)</SelectItem>
                <SelectItem value="Safety">An toàn (Safety)</SelectItem>
                <SelectItem value="Origin">Xuất xứ (Origin)</SelectItem>
                <SelectItem value="Other">Khác (Other)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tổ chức cấp */}
          <div className="space-y-2">
            <Label htmlFor="issuer">Tổ chức cấp *</Label>
            <Input
              id="issuer"
              placeholder="VD: Cục An toàn Thực phẩm"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              required
            />
          </div>

          {/* Ngày cấp và hết hạn */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Ngày cấp *</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Ngày hết hạn</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Thông tin bổ sung về chứng nhận..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !uploadedFileUrl}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                "Thêm chứng nhận"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
