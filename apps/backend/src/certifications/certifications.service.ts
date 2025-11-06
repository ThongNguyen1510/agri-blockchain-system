import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCertificationDto } from "./dto/create-certification.dto";
import { CertificationDto } from "./dto/certification.dto";

/**
 * Service quản lý chứng nhận (certifications)
 * Xử lý logic nghiệp vụ cho việc tạo, xem, xác minh chứng nhận
 */
@Injectable()
export class CertificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo chứng nhận mới
   * @param dto - Thông tin chứng nhận
   * @returns Chứng nhận vừa tạo
   */
  async createCertification(dto: CreateCertificationDto): Promise<CertificationDto> {
    // Kiểm tra phải có ít nhất batchId hoặc productId
    if (!dto.batchId && !dto.productId) {
      throw new BadRequestException("Phải cung cấp batchId hoặc productId");
    }

    // Kiểm tra batch tồn tại (nếu có batchId)
    if (dto.batchId) {
      const batch = await this.prisma.batch.findUnique({
        where: { id: dto.batchId },
      });
      if (!batch) {
        throw new NotFoundException("Không tìm thấy batch");
      }
    }

    // Kiểm tra product tồn tại (nếu có productId)
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException("Không tìm thấy product");
      }
    }

    // Tạo chứng nhận
    const certification = await this.prisma.certification.create({
      data: {
        batchId: dto.batchId || null,
        productId: dto.productId || null,
        name: dto.name,
        type: dto.type,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        fileUrl: dto.fileUrl,
        description: dto.description || null,
        verified: dto.verified || false,
      },
    });

    return CertificationDto.fromEntity(certification);
  }

  /**
   * Lấy tất cả chứng nhận của một batch
   * @param batchId - ID của batch
   * @returns Danh sách chứng nhận
   */
  async getBatchCertifications(batchId: number): Promise<CertificationDto[]> {
    const certifications = await this.prisma.certification.findMany({
      where: { batchId },
      orderBy: { createdAt: "desc" },
    });

    return certifications.map(CertificationDto.fromEntity);
  }

  /**
   * Lấy tất cả chứng nhận của một product
   * @param productId - ID của product
   * @returns Danh sách chứng nhận
   */
  async getProductCertifications(productId: number): Promise<CertificationDto[]> {
    const certifications = await this.prisma.certification.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return certifications.map(CertificationDto.fromEntity);
  }

  /**
   * Lấy chi tiết một chứng nhận
   * @param id - ID của chứng nhận
   * @returns Thông tin chứng nhận
   */
  async getCertification(id: number): Promise<CertificationDto> {
    const certification = await this.prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      throw new NotFoundException("Không tìm thấy chứng nhận");
    }

    return CertificationDto.fromEntity(certification);
  }

  /**
   * Xác minh chứng nhận (chỉ admin)
   * @param id - ID của chứng nhận
   * @param verified - Trạng thái xác minh
   * @returns Chứng nhận đã cập nhật
   */
  async verifyCertification(id: number, verified: boolean): Promise<CertificationDto> {
    const certification = await this.prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      throw new NotFoundException("Không tìm thấy chứng nhận");
    }

    const updated = await this.prisma.certification.update({
      where: { id },
      data: { verified },
    });

    return CertificationDto.fromEntity(updated);
  }

  /**
   * Xóa chứng nhận
   * @param id - ID của chứng nhận
   */
  async deleteCertification(id: number): Promise<void> {
    const certification = await this.prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      throw new NotFoundException("Không tìm thấy chứng nhận");
    }

    await this.prisma.certification.delete({
      where: { id },
    });
  }

  /**
   * Kiểm tra chứng nhận có hết hạn không
   * @param id - ID của chứng nhận
   * @returns true nếu hết hạn, false nếu còn hiệu lực
   */
  async isExpired(id: number): Promise<boolean> {
    const certification = await this.prisma.certification.findUnique({
      where: { id },
    });

    if (!certification) {
      throw new NotFoundException("Không tìm thấy chứng nhận");
    }

    // Nếu không có ngày hết hạn, coi như không bao giờ hết hạn
    if (!certification.expiryDate) {
      return false;
    }

    // So sánh với ngày hiện tại
    return new Date() > certification.expiryDate;
  }
}
