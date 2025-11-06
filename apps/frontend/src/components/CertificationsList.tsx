import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, FileText, Calendar, Building2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

interface CertificationsListProps {
  batchId?: number; // ID của batch (nếu hiển thị cho batch)
  productId?: number; // ID của product (nếu hiển thị cho product)
}

/**
 * Component hiển thị danh sách chứng nhận
 * Có thể dùng cho batch hoặc product
 */
export function CertificationsList({ batchId, productId }: CertificationsListProps) {
  const { token } = useAuth();

  // Lấy danh sách chứng nhận từ API
  const { data: certifications, isLoading } = useQuery({
    queryKey: ["certifications", batchId, productId],
    queryFn: () => {
      if (batchId) {
        return apiClient.getBatchCertifications(batchId, token || undefined);
      }
      if (productId) {
        return apiClient.getProductCertifications(productId, token || undefined);
      }
      return Promise.resolve([]);
    },
    enabled: Boolean(batchId || productId),
    staleTime: 1000 * 60, // Cache 1 phút
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5 animate-pulse" />
          <span>Đang tải chứng nhận...</span>
        </div>
      </Card>
    );
  }

  if (!certifications || certifications.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span>Chưa có chứng nhận nào</span>
        </div>
      </Card>
    );
  }

  /**
   * Kiểm tra chứng nhận có hết hạn không
   */
  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  /**
   * Lấy màu badge theo loại chứng nhận
   */
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Organic":
        return "bg-green-100 text-green-800";
      case "Quality":
        return "bg-blue-100 text-blue-800";
      case "Safety":
        return "bg-yellow-100 text-yellow-800";
      case "Origin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Chứng nhận ({certifications.length})</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {certifications.map((cert) => {
          const expired = isExpired(cert.expiryDate);

          return (
            <Card key={cert.id} className="p-4 hover:shadow-md transition-shadow">
              {/* Header với tên và trạng thái */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{cert.name}</h4>
                  <Badge className={`mt-1 ${getTypeBadgeColor(cert.type)}`}>
                    {cert.type}
                  </Badge>
                </div>
                
                {/* Icon xác minh */}
                <div title={cert.verified ? "Đã xác minh" : "Chưa xác minh"}>
                  {cert.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-2 text-sm">
                {/* Tổ chức cấp */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{cert.issuer}</span>
                </div>

                {/* Ngày cấp */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Cấp: {formatDate(cert.issueDate)}</span>
                </div>

                {/* Ngày hết hạn */}
                {cert.expiryDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className={expired ? "text-red-600 font-medium" : "text-muted-foreground"}>
                      Hết hạn: {formatDate(cert.expiryDate)}
                      {expired && " (Đã hết hạn)"}
                    </span>
                  </div>
                )}

                {/* Mô tả */}
                {cert.description && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {cert.description}
                  </p>
                )}
              </div>

              {/* Nút xem file */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(cert.fileUrl, "_blank")}
                >
                  <FileText className="h-4 w-4" />
                  Xem chứng nhận
                </Button>
              </div>

              {/* Badge trạng thái */}
              <div className="mt-3 flex gap-2">
                {cert.verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Đã xác minh
                  </Badge>
                )}
                {expired && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    ⚠ Hết hạn
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
