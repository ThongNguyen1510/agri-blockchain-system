import { Certification } from "@prisma/client";

/**
 * DTO trả về thông tin chứng nhận
 * Chuyển đổi từ Prisma entity sang response object
 */
export class CertificationDto {
  id: number;
  batchId: number | null;
  productId: number | null;
  name: string; // Tên chứng nhận
  type: string; // Loại: Organic, Quality, Safety, Origin, Other
  issuer: string; // Tổ chức cấp
  issueDate: string; // Ngày cấp
  expiryDate: string | null; // Ngày hết hạn
  fileUrl: string; // URL file chứng nhận
  description: string | null; // Mô tả
  verified: boolean; // Đã xác minh chưa
  createdAt: string;

  /**
   * Chuyển đổi từ Prisma Certification entity sang DTO
   */
  static fromEntity(cert: Certification): CertificationDto {
    const dto = new CertificationDto();
    dto.id = cert.id;
    dto.batchId = cert.batchId;
    dto.productId = cert.productId;
    dto.name = cert.name;
    dto.type = cert.type;
    dto.issuer = cert.issuer;
    dto.issueDate = cert.issueDate.toISOString();
    dto.expiryDate = cert.expiryDate ? cert.expiryDate.toISOString() : null;
    dto.fileUrl = cert.fileUrl;
    dto.description = cert.description;
    dto.verified = cert.verified;
    dto.createdAt = cert.createdAt.toISOString();
    return dto;
  }
}
